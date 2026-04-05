const mongoose = require('mongoose');
const Record = require('../models/Record');
const catchAsync = require('../utils/catchAsync');

// @desc    Get dashboard summary
// @route   GET /api/dashboard/summary
// @access  Viewer, Analyst, Admin
const getDashboardSummary = catchAsync(async (req, res, next) => {
  const userId = new mongoose.Types.ObjectId(req.user.id);

  // Define date filters if provided, or default to all time
  const { startDate, endDate } = req.query;
  const matchStage = {
    userId,
    isDeleted: false,
  };

  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate);
  }

  // Aggregate totals
  const totals = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  totals.forEach((t) => {
    if (t._id === 'income') totalIncome = t.totalAmount;
    if (t._id === 'expense') totalExpense = t.totalAmount;
  });

  const netBalance = totalIncome - totalExpense;

  // Aggregate category-wise totals
  const categoryTotals = await Record.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        totalAmount: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        totalAmount: 1,
      },
    },
    { $sort: { totalAmount: -1 } },
  ]);

  // Transform category totals into a cleaner format
  const incomeCategories = categoryTotals
    .filter((ct) => ct.type === 'income')
    .map((ct) => ({ category: ct.category, amount: ct.totalAmount }));

  const expenseCategories = categoryTotals
    .filter((ct) => ct.type === 'expense')
    .map((ct) => ({ category: ct.category, amount: ct.totalAmount }));

  // Get recent transactions (last 5)
  const recentTransactions = await Record.find(matchStage)
    .sort({ date: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalIncome,
      totalExpense,
      netBalance,
      categoryWiseTotals: {
        income: incomeCategories,
        expenses: expenseCategories,
      },
      recentTransactions,
    },
  });
});

module.exports = {
  getDashboardSummary,
};

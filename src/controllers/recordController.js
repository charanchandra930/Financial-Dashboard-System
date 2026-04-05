const Record = require('../models/Record');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// @desc    Create a new record
// @route   POST /api/records
// @access  Analyst, Admin
const createRecord = catchAsync(async (req, res, next) => {
  req.body.userId = req.user.id;
  
  const record = await Record.create(req.body);

  res.status(201).json({
    success: true,
    data: record,
  });
});

// @desc    Get paginated/filtered records
// @route   GET /api/records
// @access  Analyst, Admin
const getRecords = catchAsync(async (req, res, next) => {
  const { type, category, startDate, endDate, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { userId: req.user.id, isDeleted: false };

  if (type) query.type = type;
  if (category) query.category = category;
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  // Pagination
  const skip = (page - 1) * limit;

  const records = await Record.find(query)
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Record.countDocuments(query);

  res.status(200).json({
    success: true,
    count: records.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    data: records,
  });
});

// @desc    Get single record
// @route   GET /api/records/:id
// @access  Analyst, Admin
const getRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });

  if (!record) {
    return next(new ApiError(404, 'Record not found or does not belong to you'));
  }

  res.status(200).json({
    success: true,
    data: record,
  });
});

// @desc    Update a record
// @route   PUT /api/records/:id
// @access  Analyst, Admin
const updateRecord = catchAsync(async (req, res, next) => {
  let record = await Record.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });

  if (!record) {
    return next(new ApiError(404, 'Record not found or does not belong to you'));
  }

  record = await Record.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: record,
  });
});

// @desc    Delete a record (Soft Delete)
// @route   DELETE /api/records/:id
// @access  Analyst, Admin
const deleteRecord = catchAsync(async (req, res, next) => {
  const record = await Record.findOne({ _id: req.params.id, userId: req.user.id, isDeleted: false });

  if (!record) {
    return next(new ApiError(404, 'Record not found or does not belong to you'));
  }

  record.isDeleted = true;
  await record.save();

  res.status(200).json({
    success: true,
    data: {},
    message: 'Record deleted successfully'
  });
});

module.exports = {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
};

const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// @desc    Get all users (Admin only)
// @route   GET /api/users
const getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Update user role or status (Admin only)
// @route   PUT /api/users/:id
const updateUser = catchAsync(async (req, res, next) => {
  const { role, isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

module.exports = {
  getUsers,
  updateUser,
};

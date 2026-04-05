const express = require('express');
const { getUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { updateUser: updateUserValidation } = require('../validations/userValidation');

const router = express.Router();

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .put(validate(updateUserValidation), updateUser);

module.exports = router;

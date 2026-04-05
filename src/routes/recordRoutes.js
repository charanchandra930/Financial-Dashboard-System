const express = require('express');
const {
  createRecord,
  getRecords,
  getRecord,
  updateRecord,
  deleteRecord,
} = require('../controllers/recordController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const validate = require('../middleware/validationMiddleware');
const { createRecord: createVal, updateRecord: updateVal, getRecords: getVal } = require('../validations/recordValidation');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('analyst', 'admin'), validate(getVal), getRecords) // Analysts and Admins can read
  .post(authorize('admin'), validate(createVal), createRecord);     // Only Admins can create

router.route('/:id')
  .get(authorize('analyst', 'admin'), getRecord)                    // Analysts and Admins can read
  .put(authorize('admin'), validate(updateVal), updateRecord)       // Only Admins can update
  .delete(authorize('admin'), deleteRecord);                        // Only Admins can delete

module.exports = router;

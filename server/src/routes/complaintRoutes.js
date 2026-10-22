import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  submitFeedback,
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All complaint routes require authentication

router
  .route('/')
  .get(getComplaints)
  .post(upload.array('photos', 5), createComplaint);

router.route('/:id').get(getComplaintById);

// Assignment is restricted to administrator
router.patch('/:id/assign', authorize('admin'), assignComplaint);

// Status update is restricted to staff & administrator
router.patch('/:id/status', authorize('staff', 'admin'), updateComplaintStatus);

// Feedback submission is restricted to student reporter
router.post('/:id/feedback', authorize('student'), submitFeedback);

export default router;

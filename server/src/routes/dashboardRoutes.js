import express from 'express';
import {
  getStudentDashboard,
  getStaffDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';
import { getSustainabilitySummary } from '../controllers/sustainabilityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/student', authorize('student'), getStudentDashboard);
router.get('/staff', authorize('staff'), getStaffDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/sustainability', authorize('sustainability_officer', 'admin'), getSustainabilitySummary);

export default router;

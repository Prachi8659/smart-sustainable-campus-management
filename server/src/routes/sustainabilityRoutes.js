import express from 'express';
import {
  getSustainabilitySummary,
  getSustainabilityTrends,
  getEnergyRecords,
  createEnergyRecord,
  updateEnergyRecord,
  deleteEnergyRecord,
  getWaterRecords,
  createWaterRecord,
  updateWaterRecord,
  deleteWaterRecord,
  getWasteRecords,
  createWasteRecord,
  updateWasteRecord,
  deleteWasteRecord,
  getCampaigns,
  createCampaign,
  joinCampaign,
} from '../controllers/sustainabilityController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public / general metrics
router.get('/summary', getSustainabilitySummary);
router.get('/trends', getSustainabilityTrends);
router.get('/campaigns', getCampaigns);

// Protected routes
router.use(protect);

// Join campaign (students, staff, etc.)
router.post('/campaigns/:id/join', joinCampaign);
router.post('/campaigns', authorize('sustainability_officer', 'admin'), createCampaign);

// Energy Records
router.get('/energy', getEnergyRecords);
router.post('/energy', authorize('sustainability_officer', 'admin'), createEnergyRecord);
router.patch('/energy/:id', authorize('sustainability_officer', 'admin'), updateEnergyRecord);
router.delete('/energy/:id', authorize('sustainability_officer', 'admin'), deleteEnergyRecord);

// Water Records
router.get('/water', getWaterRecords);
router.post('/water', authorize('sustainability_officer', 'admin'), createWaterRecord);
router.patch('/water/:id', authorize('sustainability_officer', 'admin'), updateWaterRecord);
router.delete('/water/:id', authorize('sustainability_officer', 'admin'), deleteWaterRecord);

// Waste Records
router.get('/waste', getWasteRecords);
router.post('/waste', authorize('sustainability_officer', 'admin'), createWasteRecord);
router.patch('/waste/:id', authorize('sustainability_officer', 'admin'), updateWasteRecord);
router.delete('/waste/:id', authorize('sustainability_officer', 'admin'), deleteWasteRecord);

export default router;

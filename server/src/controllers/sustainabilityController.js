import EnergyRecord from '../models/EnergyRecord.js';
import WaterRecord from '../models/WaterRecord.js';
import WasteRecord from '../models/WasteRecord.js';
import SustainabilityCampaign from '../models/SustainabilityCampaign.js';
import Complaint from '../models/Complaint.js';

// Documented configurable carbon emission factors (benchmark: Indian National Grid & EPA estimates)
export const EMISSION_FACTORS = {
  ELECTRICITY_KG_PER_KWH: 0.82,       // Grid emission intensity
  SOLAR_OFFSET_KG_PER_KWH: 0.82,      // Avoided emissions from on-campus solar
  WATER_KG_PER_LITRE: 0.00035,        // Pumping & filtration energy footprint
  LANDFILL_WASTE_KG_PER_KG: 1.25,     // Methane & degradation emission factor
  RECYCLED_WASTE_OFFSET_KG_PER_KG: 0.45 // Avoided extraction and processing impact
};

// Calculate Estimated Carbon Emissions (kg CO2e)
export const calculateEmissions = (netKWh, waterLitres, unrecycledWasteKg, recycledWasteKg) => {
  const electricityEmissions = Math.max(0, netKWh) * EMISSION_FACTORS.ELECTRICITY_KG_PER_KWH;
  const waterEmissions = Math.max(0, waterLitres) * EMISSION_FACTORS.WATER_KG_PER_LITRE;
  const wasteEmissions = Math.max(0, unrecycledWasteKg) * EMISSION_FACTORS.LANDFILL_WASTE_KG_PER_KG;
  const recyclingAvoided = Math.max(0, recycledWasteKg) * EMISSION_FACTORS.RECYCLED_WASTE_OFFSET_KG_PER_KG;

  const total = electricityEmissions + waterEmissions + wasteEmissions - recyclingAvoided;
  return Math.round(Math.max(0, total));
};

// Calculate Documented Campus Sustainability Score (0 - 100)
// Component 1: Solar / Renewable share (max 35 pts)
// Component 2: Waste recycling rate (max 35 pts)
// Component 3: Water reclamation rate (max 15 pts)
// Component 4: Fast maintenance resolution for leaks/energy issues (max 15 pts)
export const calculateSustainabilityScore = (solarKWh, totalKWh, recycledKg, totalKg, recycledLitres, totalLitres, resolvedIssues, totalIssues) => {
  const renewableRatio = totalKWh > 0 ? Math.min(1, solarKWh / totalKWh) : 0.25;
  const solarPoints = renewableRatio * 35;

  const recyclingRatio = totalKg > 0 ? Math.min(1, recycledKg / totalKg) : 0.4;
  const wastePoints = recyclingRatio * 35;

  const waterReclamationRatio = totalLitres > 0 ? Math.min(1, recycledLitres / totalLitres) : 0.2;
  const waterPoints = waterReclamationRatio * 15;

  const maintenanceRatio = totalIssues > 0 ? Math.min(1, resolvedIssues / totalIssues) : 0.8;
  const maintenancePoints = maintenanceRatio * 15;

  const totalScore = Math.min(100, Math.round(solarPoints + wastePoints + waterPoints + maintenancePoints));
  return {
    totalScore,
    breakdown: {
      renewableShare: Math.round(solarPoints),
      wasteRecycling: Math.round(wastePoints),
      waterReclamation: Math.round(waterPoints),
      maintenanceEfficiency: Math.round(maintenancePoints),
    },
  };
};

// @desc    Get Sustainability summary metrics & score
// @route   GET /api/sustainability/summary
// @access  Public / Private
export const getSustainabilitySummary = async (req, res, next) => {
  try {
    const { building, period } = req.query;
    const filter = {};
    if (building && building !== 'All') filter.building = building;
    if (period && period !== 'All') filter.reportingPeriod = period;

    const [energyRecords, waterRecords, wasteRecords, complaints] = await Promise.all([
      EnergyRecord.find(filter),
      WaterRecord.find(filter),
      WasteRecord.find(filter),
      Complaint.find(),
    ]);

    const totalElectricityKWh = energyRecords.reduce((sum, r) => sum + (r.electricityKWh || 0), 0);
    const totalSolarKWh = energyRecords.reduce((sum, r) => sum + (r.solarGeneratedKWh || 0), 0);
    const netElectricityKWh = Math.max(0, totalElectricityKWh - totalSolarKWh);

    const totalWaterLitres = waterRecords.reduce((sum, r) => sum + (r.waterLitres || 0), 0);
    const totalRecycledWaterLitres = waterRecords.reduce((sum, r) => sum + (r.recycledLitres || 0), 0);

    const totalWasteKg = wasteRecords.reduce((sum, r) => sum + (r.totalGeneratedKg || 0), 0);
    const totalRecycledWasteKg = wasteRecords.reduce((sum, r) => sum + (r.amountRecycledKg || 0), 0);
    const unrecycledWasteKg = Math.max(0, totalWasteKg - totalRecycledWasteKg);

    const estimatedEmissionsKg = calculateEmissions(netElectricityKWh, totalWaterLitres, unrecycledWasteKg, totalRecycledWasteKg);

    const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;
    const scoreData = calculateSustainabilityScore(
      totalSolarKWh,
      totalElectricityKWh,
      totalRecycledWasteKg,
      totalWasteKg,
      totalRecycledWaterLitres,
      totalWaterLitres,
      resolvedComplaints,
      complaints.length
    );

    res.status(200).json({
      success: true,
      data: {
        electricityKWh: totalElectricityKWh,
        solarGeneratedKWh: totalSolarKWh,
        netElectricityKWh,
        waterConsumptionLitres: totalWaterLitres,
        waterRecycledLitres: totalRecycledWaterLitres,
        wasteGeneratedKg: totalWasteKg,
        wasteRecycledKg: totalRecycledWasteKg,
        estimatedEmissionsCO2eKg: estimatedEmissionsKg,
        estimatedEmissionsTons: Number((estimatedEmissionsKg / 1000).toFixed(2)),
        sustainabilityScore: scoreData.totalScore,
        scoreBreakdown: scoreData.breakdown,
        emissionFactors: EMISSION_FACTORS,
        dataSource: 'Demonstration and measured campus resource logs',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly sustainability trends for charts
// @route   GET /api/sustainability/trends
// @access  Public / Private
export const getSustainabilityTrends = async (req, res, next) => {
  try {
    const { building } = req.query;
    const filter = {};
    if (building && building !== 'All') filter.building = building;

    const [energy, water, waste] = await Promise.all([
      EnergyRecord.find(filter).sort({ reportingPeriod: 1 }),
      WaterRecord.find(filter).sort({ reportingPeriod: 1 }),
      WasteRecord.find(filter).sort({ reportingPeriod: 1 }),
    ]);

    // Aggregate by month (e.g., 2026-01, 2026-02, 2026-03)
    const monthMap = {};

    energy.forEach((r) => {
      if (!monthMap[r.reportingPeriod]) monthMap[r.reportingPeriod] = { month: r.reportingPeriod, electricity: 0, solar: 0, water: 0, waste: 0, recycled: 0 };
      monthMap[r.reportingPeriod].electricity += r.electricityKWh;
      monthMap[r.reportingPeriod].solar += r.solarGeneratedKWh;
    });

    water.forEach((r) => {
      if (!monthMap[r.reportingPeriod]) monthMap[r.reportingPeriod] = { month: r.reportingPeriod, electricity: 0, solar: 0, water: 0, waste: 0, recycled: 0 };
      monthMap[r.reportingPeriod].water += r.waterLitres;
    });

    waste.forEach((r) => {
      if (!monthMap[r.reportingPeriod]) monthMap[r.reportingPeriod] = { month: r.reportingPeriod, electricity: 0, solar: 0, water: 0, waste: 0, recycled: 0 };
      monthMap[r.reportingPeriod].waste += r.totalGeneratedKg;
      monthMap[r.reportingPeriod].recycled += r.amountRecycledKg;
    });

    const monthlyTrends = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      success: true,
      data: monthlyTrends,
    });
  } catch (error) {
    next(error);
  }
};

// Energy Records CRUD
export const getEnergyRecords = async (req, res, next) => {
  try {
    const records = await EnergyRecord.find().populate('recordedBy', 'name email').sort({ reportingPeriod: -1 });
    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const createEnergyRecord = async (req, res, next) => {
  try {
    const { building, reportingPeriod, electricityKWh, solarGeneratedKWh, notes } = req.body;
    const existing = await EnergyRecord.findOne({ building, reportingPeriod });
    if (existing) {
      return res.status(400).json({ success: false, message: `An energy record already exists for ${building} in period ${reportingPeriod}. Please update the existing record.` });
    }

    const record = await EnergyRecord.create({
      building,
      reportingPeriod,
      electricityKWh,
      solarGeneratedKWh: solarGeneratedKWh || 0,
      notes: notes || '',
      recordedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Energy log created successfully.', record });
  } catch (error) {
    next(error);
  }
};

export const updateEnergyRecord = async (req, res, next) => {
  try {
    const record = await EnergyRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Energy log updated successfully.', record });
  } catch (error) {
    next(error);
  }
};

export const deleteEnergyRecord = async (req, res, next) => {
  try {
    const record = await EnergyRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Energy record deleted.' });
  } catch (error) {
    next(error);
  }
};

// Water Records CRUD
export const getWaterRecords = async (req, res, next) => {
  try {
    const records = await WaterRecord.find().populate('recordedBy', 'name email').sort({ reportingPeriod: -1 });
    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const createWaterRecord = async (req, res, next) => {
  try {
    const { building, reportingPeriod, waterLitres, recycledLitres, notes } = req.body;
    const existing = await WaterRecord.findOne({ building, reportingPeriod });
    if (existing) {
      return res.status(400).json({ success: false, message: `A water record already exists for ${building} in period ${reportingPeriod}.` });
    }

    const record = await WaterRecord.create({
      building,
      reportingPeriod,
      waterLitres,
      recycledLitres: recycledLitres || 0,
      notes: notes || '',
      recordedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Water log recorded successfully.', record });
  } catch (error) {
    next(error);
  }
};

export const updateWaterRecord = async (req, res, next) => {
  try {
    const record = await WaterRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Water record updated.', record });
  } catch (error) {
    next(error);
  }
};

export const deleteWaterRecord = async (req, res, next) => {
  try {
    const record = await WaterRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Water record deleted.' });
  } catch (error) {
    next(error);
  }
};

// Waste Records CRUD
export const getWasteRecords = async (req, res, next) => {
  try {
    const records = await WasteRecord.find().populate('recordedBy', 'name email').sort({ reportingPeriod: -1 });
    res.status(200).json({ success: true, count: records.length, records });
  } catch (error) {
    next(error);
  }
};

export const createWasteRecord = async (req, res, next) => {
  try {
    const { building, reportingPeriod, wasteCategory, totalGeneratedKg, amountRecycledKg, notes } = req.body;
    if (Number(amountRecycledKg) > Number(totalGeneratedKg)) {
      return res.status(400).json({ success: false, message: 'Recycled amount cannot exceed total generated waste.' });
    }

    const existing = await WasteRecord.findOne({ building, reportingPeriod, wasteCategory });
    if (existing) {
      return res.status(400).json({ success: false, message: `A waste record already exists for ${building} category ${wasteCategory} in ${reportingPeriod}.` });
    }

    const record = await WasteRecord.create({
      building,
      reportingPeriod,
      wasteCategory,
      totalGeneratedKg,
      amountRecycledKg: amountRecycledKg || 0,
      notes: notes || '',
      recordedBy: req.user.id,
    });

    res.status(201).json({ success: true, message: 'Waste record logged successfully.', record });
  } catch (error) {
    next(error);
  }
};

export const updateWasteRecord = async (req, res, next) => {
  try {
    if (req.body.amountRecycledKg !== undefined && req.body.totalGeneratedKg !== undefined) {
      if (Number(req.body.amountRecycledKg) > Number(req.body.totalGeneratedKg)) {
        return res.status(400).json({ success: false, message: 'Recycled amount cannot exceed total waste.' });
      }
    }
    const record = await WasteRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Waste record updated.', record });
  } catch (error) {
    next(error);
  }
};

export const deleteWasteRecord = async (req, res, next) => {
  try {
    const record = await WasteRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Record not found.' });
    res.status(200).json({ success: true, message: 'Waste record deleted.' });
  } catch (error) {
    next(error);
  }
};

// Campaigns
export const getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await SustainabilityCampaign.find()
      .populate('coordinator', 'name email')
      .sort({ startDate: -1 });

    res.status(200).json({ success: true, campaigns });
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await SustainabilityCampaign.create({
      ...req.body,
      coordinator: req.user.id,
    });
    res.status(201).json({ success: true, message: 'Campaign launched successfully.', campaign });
  } catch (error) {
    next(error);
  }
};

export const joinCampaign = async (req, res, next) => {
  try {
    const campaign = await SustainabilityCampaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found.' });

    const alreadyJoined = campaign.participants.some((p) => p.toString() === req.user.id.toString());
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: 'You have already joined this campaign!' });
    }

    campaign.participants.push(req.user.id);
    campaign.participantCount = campaign.participants.length;
    await campaign.save();

    res.status(200).json({
      success: true,
      message: `You successfully joined "${campaign.title}"! Earned ${campaign.rewardsOrPoints} eco-points.`,
      campaign,
    });
  } catch (error) {
    next(error);
  }
};

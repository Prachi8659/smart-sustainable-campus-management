import api from './api';
import {
  DEMO_ENERGY_RECORDS,
  DEMO_WATER_RECORDS,
  DEMO_WASTE_RECORDS,
  DEMO_CAMPAIGNS,
} from './mockData';

// Local storage keys for demo persistence
const KEY_ENERGY = 'campus_energy_records';
const KEY_WATER = 'campus_water_records';
const KEY_WASTE = 'campus_waste_records';
const KEY_CAMPAIGNS = 'campus_campaigns';

const getStored = (key, fallback) => {
  const s = localStorage.getItem(key);
  if (s) {
    try {
      return JSON.parse(s);
    } catch (e) {
      console.error(e);
    }
  }
  return [...fallback];
};

const saveStored = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const sustainabilityService = {
  // Get Summary Metrics & Carbon Emissions
  getSummary: async (params = {}) => {
    try {
      const response = await api.get('/sustainability/summary', { params });
      return { success: true, data: response.data.data, source: 'api' };
    } catch (err) {
      console.warn('[SustainabilityService] Using demo summary:', err.message);
      const energy = getStored(KEY_ENERGY, DEMO_ENERGY_RECORDS);
      const water = getStored(KEY_WATER, DEMO_WATER_RECORDS);
      const waste = getStored(KEY_WASTE, DEMO_WASTE_RECORDS);

      const totalKWh = energy.reduce((acc, r) => acc + (r.electricityKWh || 0), 0);
      const solarKWh = energy.reduce((acc, r) => acc + (r.solarGeneratedKWh || 0), 0);
      const netKWh = Math.max(0, totalKWh - solarKWh);

      const waterLitres = water.reduce((acc, r) => acc + (r.waterLitres || 0), 0);
      const waterRecycled = water.reduce((acc, r) => acc + (r.recycledLitres || 0), 0);

      const wasteTotalKg = waste.reduce((acc, r) => acc + (r.totalGeneratedKg || 0), 0);
      const wasteRecycledKg = waste.reduce((acc, r) => acc + (r.amountRecycledKg || 0), 0);

      // Documented emission calculation
      const emissionsKg = Math.round(
        netKWh * 0.82 +
        waterLitres * 0.00035 +
        (wasteTotalKg - wasteRecycledKg) * 1.25 -
        wasteRecycledKg * 0.45
      );

      // Documented score formula
      const solarRatio = totalKWh > 0 ? solarKWh / totalKWh : 0.25;
      const wasteRatio = wasteTotalKg > 0 ? wasteRecycledKg / wasteTotalKg : 0.7;
      const waterRatio = waterLitres > 0 ? waterRecycled / waterLitres : 0.25;
      const score = Math.min(100, Math.round(solarRatio * 35 + wasteRatio * 35 + waterRatio * 15 + 13));

      return {
        success: true,
        data: {
          electricityKWh: totalKWh,
          solarGeneratedKWh: solarKWh,
          netElectricityKWh: netKWh,
          waterConsumptionLitres: waterLitres,
          waterRecycledLitres: waterRecycled,
          wasteGeneratedKg: wasteTotalKg,
          wasteRecycledKg: wasteRecycledKg,
          estimatedEmissionsCO2eKg: emissionsKg,
          estimatedEmissionsTons: Number((emissionsKg / 1000).toFixed(2)),
          sustainabilityScore: score,
          scoreBreakdown: {
            renewableShare: Math.round(solarRatio * 35),
            wasteRecycling: Math.round(wasteRatio * 35),
            waterReclamation: Math.round(waterRatio * 15),
            maintenanceEfficiency: 13,
          },
          dataSource: 'Demo campus resource data (live estimation algorithm active)',
        },
        source: 'demo',
      };
    }
  },

  // Monthly trends for Recharts
  getTrends: async (params = {}) => {
    try {
      const response = await api.get('/sustainability/trends', { params });
      return { success: true, data: response.data.data, source: 'api' };
    } catch (err) {
      return {
        success: true,
        data: [
          { month: '2026-01', electricity: 38900, solar: 9800, water: 335000, waste: 2800, recycled: 2100, score: 76 },
          { month: '2026-02', electricity: 37850, solar: 10900, water: 313000, waste: 2950, recycled: 2350, score: 79 },
          { month: '2026-03', electricity: 40900, solar: 12900, water: 350000, waste: 3760, recycled: 3330, score: 83 },
        ],
        source: 'demo',
      };
    }
  },

  // Energy records
  getEnergyRecords: async () => {
    try {
      const res = await api.get('/sustainability/energy');
      return { success: true, records: res.data.records, source: 'api' };
    } catch (e) {
      return { success: true, records: getStored(KEY_ENERGY, DEMO_ENERGY_RECORDS), source: 'demo' };
    }
  },

  createEnergyRecord: async (payload) => {
    try {
      const res = await api.post('/sustainability/energy', payload);
      return { success: true, record: res.data.record, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_ENERGY, DEMO_ENERGY_RECORDS);
      const newRec = { _id: `eng_${Date.now()}`, ...payload, recordedBy: { name: 'Priya Deshmukh' } };
      list.unshift(newRec);
      saveStored(KEY_ENERGY, list);
      return { success: true, record: newRec, source: 'demo' };
    }
  },

  deleteEnergyRecord: async (id) => {
    try {
      await api.delete(`/sustainability/energy/${id}`);
      return { success: true, source: 'api' };
    } catch (e) {
      let list = getStored(KEY_ENERGY, DEMO_ENERGY_RECORDS);
      list = list.filter((r) => r._id !== id);
      saveStored(KEY_ENERGY, list);
      return { success: true, source: 'demo' };
    }
  },

  // Water records
  getWaterRecords: async () => {
    try {
      const res = await api.get('/sustainability/water');
      return { success: true, records: res.data.records, source: 'api' };
    } catch (e) {
      return { success: true, records: getStored(KEY_WATER, DEMO_WATER_RECORDS), source: 'demo' };
    }
  },

  createWaterRecord: async (payload) => {
    try {
      const res = await api.post('/sustainability/water', payload);
      return { success: true, record: res.data.record, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_WATER, DEMO_WATER_RECORDS);
      const newRec = { _id: `wat_${Date.now()}`, ...payload, recordedBy: { name: 'Priya Deshmukh' } };
      list.unshift(newRec);
      saveStored(KEY_WATER, list);
      return { success: true, record: newRec, source: 'demo' };
    }
  },

  deleteWaterRecord: async (id) => {
    try {
      await api.delete(`/sustainability/water/${id}`);
      return { success: true, source: 'api' };
    } catch (e) {
      let list = getStored(KEY_WATER, DEMO_WATER_RECORDS);
      list = list.filter((r) => r._id !== id);
      saveStored(KEY_WATER, list);
      return { success: true, source: 'demo' };
    }
  },

  // Waste records
  getWasteRecords: async () => {
    try {
      const res = await api.get('/sustainability/waste');
      return { success: true, records: res.data.records, source: 'api' };
    } catch (e) {
      return { success: true, records: getStored(KEY_WASTE, DEMO_WASTE_RECORDS), source: 'demo' };
    }
  },

  createWasteRecord: async (payload) => {
    try {
      const res = await api.post('/sustainability/waste', payload);
      return { success: true, record: res.data.record, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_WASTE, DEMO_WASTE_RECORDS);
      const newRec = { _id: `wst_${Date.now()}`, ...payload, recordedBy: { name: 'Priya Deshmukh' } };
      list.unshift(newRec);
      saveStored(KEY_WASTE, list);
      return { success: true, record: newRec, source: 'demo' };
    }
  },

  deleteWasteRecord: async (id) => {
    try {
      await api.delete(`/sustainability/waste/${id}`);
      return { success: true, source: 'api' };
    } catch (e) {
      let list = getStored(KEY_WASTE, DEMO_WASTE_RECORDS);
      list = list.filter((r) => r._id !== id);
      saveStored(KEY_WASTE, list);
      return { success: true, source: 'demo' };
    }
  },

  // Campaigns
  getCampaigns: async () => {
    try {
      const res = await api.get('/sustainability/campaigns');
      return { success: true, campaigns: res.data.campaigns, source: 'api' };
    } catch (e) {
      return { success: true, campaigns: getStored(KEY_CAMPAIGNS, DEMO_CAMPAIGNS), source: 'demo' };
    }
  },

  joinCampaign: async (id) => {
    try {
      const res = await api.post(`/sustainability/campaigns/${id}/join`);
      return { success: true, message: res.data.message, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_CAMPAIGNS, DEMO_CAMPAIGNS);
      const idx = list.findIndex((c) => c._id === id);
      if (idx !== -1) {
        list[idx].participantCount = (list[idx].participantCount || 0) + 1;
        saveStored(KEY_CAMPAIGNS, list);
      }
      return { success: true, message: 'Joined campaign successfully! +75 Eco-points earned.', source: 'demo' };
    }
  },

  createCampaign: async (payload) => {
    try {
      const res = await api.post('/sustainability/campaigns', payload);
      return { success: true, campaign: res.data.campaign, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_CAMPAIGNS, DEMO_CAMPAIGNS);
      const newCamp = { _id: `cmpgn_${Date.now()}`, ...payload, participantCount: 1 };
      list.unshift(newCamp);
      saveStored(KEY_CAMPAIGNS, list);
      return { success: true, campaign: newCamp, source: 'demo' };
    }
  },
};

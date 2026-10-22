import mongoose from 'mongoose';

const energyRecordSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: [true, 'Please specify the building'],
      trim: true,
    },
    reportingPeriod: {
      type: String, // Format: YYYY-MM e.g., '2026-03'
      required: [true, 'Please specify reporting period (YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Reporting period must be in YYYY-MM format'],
    },
    electricityKWh: {
      type: Number,
      required: [true, 'Please provide electricity consumption in kWh'],
      min: [0, 'Consumption cannot be negative'],
    },
    solarGeneratedKWh: {
      type: Number,
      default: 0,
      min: [0, 'Solar generation cannot be negative'],
    },
    notes: {
      type: String,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

energyRecordSchema.index({ building: 1, reportingPeriod: 1 }, { unique: true });

export default mongoose.model('EnergyRecord', energyRecordSchema);

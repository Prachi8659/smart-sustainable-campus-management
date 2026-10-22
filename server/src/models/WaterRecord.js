import mongoose from 'mongoose';

const waterRecordSchema = new mongoose.Schema(
  {
    building: {
      type: String,
      required: [true, 'Please specify the building'],
      trim: true,
    },
    reportingPeriod: {
      type: String, // Format: YYYY-MM
      required: [true, 'Please specify reporting period (YYYY-MM)'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Reporting period must be in YYYY-MM format'],
    },
    waterLitres: {
      type: Number,
      required: [true, 'Please provide water consumption in litres'],
      min: [0, 'Consumption cannot be negative'],
    },
    recycledLitres: {
      type: Number,
      default: 0,
      min: [0, 'Recycled water cannot be negative'],
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

waterRecordSchema.index({ building: 1, reportingPeriod: 1 }, { unique: true });

export default mongoose.model('WaterRecord', waterRecordSchema);

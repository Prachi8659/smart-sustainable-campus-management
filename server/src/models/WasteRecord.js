import mongoose from 'mongoose';

const wasteRecordSchema = new mongoose.Schema(
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
    wasteCategory: {
      type: String,
      required: [true, 'Please specify waste category'],
      enum: ['Organic & Food', 'Dry & Plastic', 'Paper & Cardboard', 'E-Waste', 'Hazardous & Lab', 'Mixed'],
      default: 'Mixed',
    },
    totalGeneratedKg: {
      type: Number,
      required: [true, 'Please provide total waste generated in kg'],
      min: [0, 'Total waste cannot be negative'],
    },
    amountRecycledKg: {
      type: Number,
      required: [true, 'Please provide amount recycled in kg'],
      min: [0, 'Recycled amount cannot be negative'],
      validate: {
        validator: function (val) {
          return val <= this.totalGeneratedKg;
        },
        message: 'Recycled amount cannot exceed total waste generated',
      },
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

wasteRecordSchema.index({ building: 1, reportingPeriod: 1, wasteCategory: 1 }, { unique: true });

export default mongoose.model('WasteRecord', wasteRecordSchema);

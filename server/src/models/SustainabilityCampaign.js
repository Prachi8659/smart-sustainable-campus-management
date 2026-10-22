import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide campaign title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide campaign description'],
    },
    category: {
      type: String,
      enum: ['Energy', 'Water', 'Waste', 'Biodiversity', 'General'],
      default: 'General',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    targetGoal: {
      type: String,
      required: [true, 'Please specify target objective or goal'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed'],
      default: 'Active',
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rewardsOrPoints: {
      type: Number,
      default: 50,
    },
    metricsAchieved: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('SustainabilityCampaign', campaignSchema);

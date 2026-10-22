import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Closed', 'Rejected'],
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Electrical',
        'Plumbing and Water',
        'Cleanliness and Waste',
        'Furniture and Infrastructure',
        'IT and Wi-Fi',
        'Laboratory Equipment',
        'Classroom Equipment',
        'Safety',
        'Other',
      ],
    },
    building: {
      type: String,
      required: [true, 'Please specify the building or zone'],
      trim: true,
    },
    locationDetails: {
      type: String,
      required: [true, 'Please specify the exact room, lab or floor'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Closed', 'Rejected'],
      default: 'Submitted',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    adminRemarks: {
      type: String,
      default: '',
    },
    staffRemarks: {
      type: String,
      default: '',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    supportingPhotos: {
      type: [String],
      default: [],
    },
    resolutionPhotos: {
      type: [String],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [statusHistorySchema],
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for high performance filtering and search
complaintSchema.index({ complaintId: 1, status: 1, priority: 1, submittedBy: 1 });

export default mongoose.model('Complaint', complaintSchema);

import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// Helper to generate readable complaint ID: CMP-2026-1001
const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await Complaint.countDocuments();
  const sequence = String(count + 1).padStart(4, '0');
  return `CMP-${currentYear}-${sequence}`;
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student, Staff, Admin)
export const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, building, locationDetails, priority } = req.body;

    if (!title || !description || !category || !building || !locationDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, category, building, and location details.',
      });
    }

    const complaintId = await generateComplaintId();

    // Handle uploaded photos from multer
    let supportingPhotos = [];
    if (req.files && req.files.length > 0) {
      supportingPhotos = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.supportingPhotos && Array.isArray(req.body.supportingPhotos)) {
      supportingPhotos = req.body.supportingPhotos;
    }

    // Role-based priority safety: Only Admins can set Urgent directly; students default to Low/Medium/High
    let safePriority = priority || 'Medium';
    if (req.user.role === 'student' && safePriority === 'Urgent') {
      safePriority = 'High';
    }

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      building,
      locationDetails,
      priority: safePriority,
      status: 'Submitted',
      submittedBy: req.user.id,
      supportingPhotos,
      statusHistory: [
        {
          status: 'Submitted',
          changedBy: req.user.id,
          changedAt: new Date(),
          remarks: 'Complaint registered by student',
        },
      ],
    });

    // Notify admins about new complaint
    const admins = await User.find({ role: 'admin', isActive: true });
    const notifications = admins.map((admin) => ({
      recipient: admin._id,
      title: 'New Complaint Registered',
      message: `${complaint.complaintId}: ${complaint.title} at ${complaint.building}`,
      type: 'complaint_status',
      link: `/admin/complaints`,
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with filters, search, and pagination
// @route   GET /api/complaints
// @access  Private
export const getComplaints = async (req, res, next) => {
  try {
    const { status, category, priority, building, department, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Role scoping
    if (req.user.role === 'student') {
      query.submittedBy = req.user.id;
    } else if (req.user.role === 'staff') {
      query.$or = [{ assignedStaff: req.user.id }];
      if (req.user.department) {
        query.$or.push({ assignedDepartment: req.user.department });
      }
    }

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (priority && priority !== 'All') query.priority = priority;
    if (building && building !== 'All') query.building = building;
    if (department && department !== 'All') query.assignedDepartment = department;

    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { building: { $regex: search, $options: 'i' } },
        { locationDetails: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('submittedBy', 'name email phone campus')
      .populate('assignedDepartment', 'name code slaHours')
      .populate('assignedStaff', 'name email phone')
      .populate('feedback')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaint details by ID or complaintId
// @route   GET /api/complaints/:id
// @access  Private
export const getComplaintById = async (req, res, next) => {
  try {
    const identifier = req.params.id;
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);

    const query = isObjectId ? { _id: identifier } : { complaintId: identifier };

    const complaint = await Complaint.findOne(query)
      .populate('submittedBy', 'name email phone campus')
      .populate('assignedDepartment', 'name code slaHours contactEmail contactPhone')
      .populate('assignedStaff', 'name email phone')
      .populate('feedback')
      .populate('statusHistory.changedBy', 'name role email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found.' });
    }

    // Authorization check: Student can only view their own complaint
    if (req.user.role === 'student' && complaint.submittedBy._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this complaint.' });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to department and staff
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin only)
export const assignComplaint = async (req, res, next) => {
  try {
    const { departmentId, staffId, priority, dueDate, adminRemarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Verify staff belongs to department if both provided
    if (staffId && departmentId) {
      const staffUser = await User.findById(staffId);
      if (staffUser && staffUser.department && staffUser.department.toString() !== departmentId.toString()) {
        console.warn(`[Assignment Warning] Staff member belongs to different department. Allowing admin override.`);
      }
    }

    if (departmentId) complaint.assignedDepartment = departmentId;
    if (staffId) complaint.assignedStaff = staffId;
    if (priority) complaint.priority = priority;
    if (dueDate) complaint.dueDate = new Date(dueDate);
    if (adminRemarks) complaint.adminRemarks = adminRemarks;

    // Transition status to Assigned if currently Submitted or Under Review
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    complaint.statusHistory.push({
      status: complaint.status,
      changedBy: req.user.id,
      changedAt: new Date(),
      remarks: adminRemarks || 'Assigned to maintenance department by administrator',
    });

    await complaint.save();

    // Send notification to staff member if assigned
    if (staffId) {
      await Notification.create({
        recipient: staffId,
        title: 'New Task Assigned',
        message: `You were assigned complaint ${complaint.complaintId}: ${complaint.title}`,
        type: 'assignment',
        link: `/staff/tasks/${complaint._id}`,
      });
    }

    // Send notification to reporter
    await Notification.create({
      recipient: complaint.submittedBy,
      title: 'Complaint Status Updated',
      message: `Your complaint ${complaint.complaintId} has been assigned for maintenance.`,
      type: 'complaint_status',
      link: `/student/complaints/${complaint._id}`,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('submittedBy', 'name email phone')
      .populate('assignedDepartment', 'name code')
      .populate('assignedStaff', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Complaint successfully assigned.',
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff & Admin)
export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, remarks, resolutionPhotos, rejectionReason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Role permission check: Staff can only update their assigned complaint
    if (req.user.role === 'staff') {
      if (complaint.assignedStaff && complaint.assignedStaff.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'You are only authorized to update tasks assigned directly to you.' });
      }
    }

    // Valid workflow transitions:
    // Submitted -> Under Review -> Assigned -> In Progress -> Resolved -> Reopened / Closed / Rejected
    const validTransitions = {
      Submitted: ['Under Review', 'Assigned', 'Rejected'],
      'Under Review': ['Assigned', 'Rejected'],
      Assigned: ['In Progress', 'Rejected'],
      'In Progress': ['Resolved', 'Assigned', 'Rejected'],
      Resolved: ['Reopened', 'Closed'],
      Reopened: ['In Progress', 'Assigned', 'Under Review'],
      Closed: ['Reopened'],
      Rejected: ['Under Review'],
    };

    // Admins have override privileges for exceptions, but we check standard flow
    if (req.user.role === 'staff') {
      const allowed = validTransitions[complaint.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot transition status from '${complaint.status}' to '${status}'. Permitted next states: ${allowed.join(', ')}`,
        });
      }
    }

    complaint.status = status;

    if (remarks) {
      if (req.user.role === 'staff') complaint.staffRemarks = remarks;
      else complaint.adminRemarks = remarks;
    }

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      if (resolutionPhotos && Array.isArray(resolutionPhotos)) {
        complaint.resolutionPhotos = resolutionPhotos;
      }
    }

    if (status === 'Rejected' && rejectionReason) {
      complaint.rejectionReason = rejectionReason;
    }

    complaint.statusHistory.push({
      status,
      changedBy: req.user.id,
      changedAt: new Date(),
      remarks: remarks || rejectionReason || `Status changed to ${status}`,
    });

    await complaint.save();

    // Notify the student reporter
    await Notification.create({
      recipient: complaint.submittedBy,
      title: `Complaint Status: ${status}`,
      message: `Your complaint ${complaint.complaintId} is now marked as "${status}".`,
      type: 'complaint_status',
      link: `/student/complaints/${complaint._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback after resolution
// @route   POST /api/complaints/:id/feedback
// @access  Private (Student only)
export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comments, isSatisfied } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Only original reporter can submit feedback
    if (complaint.submittedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the original student reporter can submit feedback.' });
    }

    // Must be in Resolved or Closed status
    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
      return res.status(400).json({ success: false, message: 'Feedback can only be submitted after the issue is resolved.' });
    }

    // Check duplicate feedback
    const existingFeedback = await Feedback.findOne({ complaint: complaint._id });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'Feedback has already been submitted for this complaint.' });
    }

    const feedback = await Feedback.create({
      complaint: complaint._id,
      submittedBy: req.user.id,
      rating: Number(rating),
      comments: comments || '',
      isSatisfied: typeof isSatisfied === 'boolean' ? isSatisfied : true,
    });

    complaint.feedback = feedback._id;
    await complaint.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! It helps improve campus facilities.',
      feedback,
    });
  } catch (error) {
    next(error);
  }
};

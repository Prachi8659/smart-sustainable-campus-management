import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public / Private
export const getDepartments = async (req, res, next) => {
  try {
    const { activeOnly } = req.query;
    const filter = activeOnly === 'false' ? {} : { isActive: true };

    const departments = await Department.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfDepartment, contactEmail, contactPhone, slaHours } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Please provide both department name and code.' });
    }

    const exists = await Department.findOne({
      $or: [{ code: code.toUpperCase() }, { name: name.trim() }],
    });

    if (exists) {
      return res.status(400).json({ success: false, message: 'A department with this name or code already exists.' });
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description,
      headOfDepartment,
      contactEmail,
      contactPhone,
      slaHours: slaHours || 48,
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PATCH /api/departments/:id
// @access  Private (Admin)
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Safe delete / deactivate department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Check if complaints or users are attached
    const attachedComplaints = await Complaint.countDocuments({ assignedDepartment: department._id });
    const attachedUsers = await User.countDocuments({ department: department._id });

    if (attachedComplaints > 0 || attachedUsers > 0) {
      // Safe deactivation to preserve historical records
      department.isActive = false;
      await department.save();
      return res.status(200).json({
        success: true,
        message: `Department has ${attachedComplaints} complaint(s) and ${attachedUsers} user(s) attached. Deactivated safely instead of permanent deletion to preserve audit history.`,
        department,
      });
    }

    await department.deleteOne();
    res.status(200).json({
      success: true,
      message: 'Department permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

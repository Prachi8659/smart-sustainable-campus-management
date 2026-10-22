import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import EnergyRecord from '../models/EnergyRecord.js';
import WaterRecord from '../models/WaterRecord.js';
import WasteRecord from '../models/WasteRecord.js';
import SustainabilityCampaign from '../models/SustainabilityCampaign.js';
import { calculateEmissions, calculateSustainabilityScore } from './sustainabilityController.js';

// @desc    Student Dashboard Metrics
// @route   GET /api/dashboard/student
// @access  Private (Student)
export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const complaints = await Complaint.find({ submittedBy: studentId }).sort({ createdAt: -1 });

    const total = complaints.length;
    const pending = complaints.filter((c) => ['Submitted', 'Under Review'].includes(c.status)).length;
    const inProgress = complaints.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length;
    const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

    const recentComplaints = complaints.slice(0, 5);

    // Active campaigns for student participation
    const activeCampaigns = await SustainabilityCampaign.find({ status: 'Active' }).limit(3);

    // Campus quick sustainability score
    const [energy, water, waste] = await Promise.all([
      EnergyRecord.find(),
      WaterRecord.find(),
      WasteRecord.find(),
    ]);

    const totalSolar = energy.reduce((s, r) => s + (r.solarGeneratedKWh || 0), 0);
    const totalElectricity = energy.reduce((s, r) => s + (r.electricityKWh || 0), 0);
    const totalRecycledWaste = waste.reduce((s, r) => s + (r.amountRecycledKg || 0), 0);
    const totalWaste = waste.reduce((s, r) => s + (r.totalGeneratedKg || 0), 0);
    const totalRecycledWater = water.reduce((s, r) => s + (r.recycledLitres || 0), 0);
    const totalWater = water.reduce((s, r) => s + (r.waterLitres || 0), 0);

    const scoreData = calculateSustainabilityScore(
      totalSolar,
      totalElectricity,
      totalRecycledWaste,
      totalWaste,
      totalRecycledWater,
      totalWater,
      resolved,
      total
    );

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          pending,
          inProgress,
          resolved,
        },
        recentComplaints,
        activeCampaigns,
        campusSustainabilityScore: scoreData.totalScore,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Staff Dashboard Metrics
// @route   GET /api/dashboard/staff
// @access  Private (Staff)
export const getStaffDashboard = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    const staffDept = req.user.department;

    const query = {
      $or: [{ assignedStaff: staffId }],
    };
    if (staffDept) {
      query.$or.push({ assignedDepartment: staffDept, assignedStaff: null });
    }

    const tasks = await Complaint.find(query)
      .populate('submittedBy', 'name email phone campus')
      .populate('assignedDepartment', 'name code')
      .sort({ createdAt: -1 });

    const now = new Date();
    const assigned = tasks.filter((t) => t.status === 'Assigned').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const resolved = tasks.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;
    const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && !['Resolved', 'Closed'].includes(t.status)).length;

    const priorityBreakdown = {
      Urgent: tasks.filter((t) => t.priority === 'Urgent').length,
      High: tasks.filter((t) => t.priority === 'High').length,
      Medium: tasks.filter((t) => t.priority === 'Medium').length,
      Low: tasks.filter((t) => t.priority === 'Low').length,
    };

    const upcomingTasks = tasks
      .filter((t) => !['Resolved', 'Closed'].includes(t.status))
      .sort((a, b) => (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity))
      .slice(0, 6);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalAssigned: tasks.length,
          newAssigned: assigned,
          inProgress,
          resolved,
          overdue,
        },
        priorityBreakdown,
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Operations Dashboard Metrics
// @route   GET /api/dashboard/admin
// @desc    Admin Operations Dashboard Metrics
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [allComplaints, departments] = await Promise.all([
      Complaint.find()
        .populate('submittedBy', 'name email phone campus')
        .populate('assignedDepartment', 'name code headOfDepartment')
        .populate('assignedStaff', 'name email phone role')
        .sort({ createdAt: -1 }),
      Department.find({ isActive: true }).sort({ name: 1 }),
    ]);

    const now = new Date();
    const total = allComplaints.length;
    const newUnderReview = allComplaints.filter((c) => ['Submitted', 'Under Review'].includes(c.status)).length;
    const assigned = allComplaints.filter((c) => c.status === 'Assigned').length;
    const inProgress = allComplaints.filter((c) => c.status === 'In Progress').length;
    const resolved = allComplaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;
    const overdue = allComplaints.filter(
      (c) => c.dueDate && new Date(c.dueDate) < now && !['Resolved', 'Closed'].includes(c.status)
    ).length;

    // Complaints by category
    const categoryMap = {};
    allComplaints.forEach((c) => {
      if (c.category) {
        categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;
      }
    });
    const complaintsByCategory = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      count: categoryMap[cat],
    }));

    // Complaints by status
    const statusMap = {};
    allComplaints.forEach((c) => {
      if (c.status) {
        statusMap[c.status] = (statusMap[c.status] || 0) + 1;
      }
    });
    const complaintsByStatus = Object.keys(statusMap).map((st) => ({
      name: st,
      count: statusMap[st],
    }));

    // Building-wise distribution
    const buildingMap = {};
    allComplaints.forEach((c) => {
      if (c.building) {
        buildingMap[c.building] = (buildingMap[c.building] || 0) + 1;
      }
    });
    const buildingWise = Object.keys(buildingMap).map((b) => ({
      building: b.replace(' Building', '').replace(' Block', ''),
      fullName: b,
      count: buildingMap[b],
    }));

    // Department-wise complaint statistics calculated from real MongoDB data
    const departmentStats = departments.map((dept) => {
      const deptComplaints = allComplaints.filter(
        (c) => c.assignedDepartment && c.assignedDepartment._id.toString() === dept._id.toString()
      );
      return {
        _id: dept._id,
        name: dept.name,
        code: dept.code,
        headOfDepartment: dept.headOfDepartment || dept.head || '',
        total: deptComplaints.length,
        pending: deptComplaints.filter((c) => ['Submitted', 'Under Review', 'Assigned'].includes(c.status)).length,
        inProgress: deptComplaints.filter((c) => c.status === 'In Progress').length,
        resolved: deptComplaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length,
      };
    });

    // Average resolution time (hours)
    const resolvedWithDates = allComplaints.filter((c) => c.resolvedAt && c.createdAt);
    let avgResolutionHours = 28.5; // default benchmark
    if (resolvedWithDates.length > 0) {
      const totalHours = resolvedWithDates.reduce((acc, c) => {
        return acc + (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Number((totalHours / resolvedWithDates.length).toFixed(1));
    }

    // Critical issues requiring immediate attention (Unresolved Urgent or High priority)
    const criticalIssues = allComplaints
      .filter((c) => (c.priority === 'Urgent' || c.priority === 'High') && !['Resolved', 'Closed'].includes(c.status))
      .slice(0, 10);

    // Recent 10 complaints with full staff, department, and reporter information
    const recentComplaints = allComplaints.slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          total,
          newUnderReview,
          assigned,
          inProgress,
          resolved,
          overdue,
          avgResolutionHours,
        },
        complaintsByCategory,
        complaintsByStatus,
        buildingWise,
        departmentStats,
        departments,
        criticalIssues,
        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

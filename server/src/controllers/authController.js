import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Department from '../models/Department.js';

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_campus_key_2026_wt_project', {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, campus, department, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Security rule: New self-registrations CANNOT select admin or sustainability_officer
    // Students and general staff can register, default is student
    let assignedRole = 'student';
    if (req.body.role && req.body.role.toLowerCase() === 'staff') {
      assignedRole = 'staff';
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      campus: campus || 'Main Campus',
      department: department || null,
      phone: phone || '',
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus,
        department: user.department,
        isActive: user.isActive,
      },
      message: 'Account created successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate('department');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact campus IT desk.' });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus,
        department: user.department,
        isActive: user.isActive,
      },
      message: 'Logged in successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Verified demo accounts mapped for academic viva and local evaluation
const DEMO_ACCOUNTS = {
  student: 'student@campus.edu',
  staff: 'staff.elec@campus.edu',
  maintenance_staff: 'staff.elec@campus.edu',
  admin: 'admin@campus.edu',
  sustainability_officer: 'sustainability@campus.edu',
};

// @desc    Authenticate verified demo accounts (Issues genuine JWT for local development)
// @route   POST /api/auth/demo-login
// @access  Public (Restricted to known demo accounts)
export const demoLogin = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || typeof role !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid demo role.',
      });
    }

    const normalizedRole = role.toLowerCase().trim();
    const targetEmail = DEMO_ACCOUNTS[normalizedRole];

    if (!targetEmail) {
      return res.status(400).json({
        success: false,
        message: `Invalid demo role '${role}'. Supported demo roles: student, staff, maintenance_staff, admin, sustainability_officer.`,
      });
    }

    // In production environments, disallow demo login bypass unless explicitly enabled
    if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEMO_LOGIN !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'Demo login is disabled in production environment.',
      });
    }

    const user = await User.findOne({ email: targetEmail }).populate('department');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo user account (${targetEmail}) not found in database. Please run the database seed script.`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This demo user account is currently deactivated.',
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        campus: user.campus,
        department: user.department,
        isActive: user.isActive,
      },
      message: `Authenticated as demo ${user.role} (${user.email}).`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current User profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('department');
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Users (Admin only)
// @route   GET /api/auth/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const { role, department, search, isActive } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;
    if (typeof isActive !== 'undefined') query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .populate('department')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status / role / department (Admin only)
// @route   PATCH /api/auth/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res, next) => {
  try {
    const { role, department, isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Protect master admin from self-deactivation or demotion
    if (user._id.toString() === req.user.id.toString() && isActive === false) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own administrative account.' });
    }

    if (role) user.role = role;
    if (department !== undefined) user.department = department || null;
    if (typeof isActive === 'boolean') user.isActive = isActive;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

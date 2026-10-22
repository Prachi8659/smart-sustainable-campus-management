import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from '../models/User.js';
import Department from '../models/Department.js';
import Complaint from '../models/Complaint.js';
import Feedback from '../models/Feedback.js';
import EnergyRecord from '../models/EnergyRecord.js';
import WaterRecord from '../models/WaterRecord.js';
import WasteRecord from '../models/WasteRecord.js';
import SustainabilityCampaign from '../models/SustainabilityCampaign.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_sustainability_db';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding.');

    // Clear existing collections safely
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Complaint.deleteMany(),
      Feedback.deleteMany(),
      EnergyRecord.deleteMany(),
      WaterRecord.deleteMany(),
      WasteRecord.deleteMany(),
      SustainabilityCampaign.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('Cleared existing records.');

    // 1. Create Departments
    const departmentsData = [
      {
        name: 'Electrical Maintenance',
        code: 'ELEC',
        description: 'Handles high-voltage systems, lighting, power outlets, generator sets, and solar panels.',
        headOfDepartment: 'Er. Rajesh Kulkarni',
        contactEmail: 'electrical.dept@campus.edu',
        contactPhone: '+91 98220 11221',
        slaHours: 24,
      },
      {
        name: 'Plumbing and Water Supply',
        code: 'PLUMB',
        description: 'Manages potable water, rainwater harvesting units, drainage, and plumbing fixtures.',
        headOfDepartment: 'Shri. Ramesh Gaikwad',
        contactEmail: 'plumbing.dept@campus.edu',
        contactPhone: '+91 98220 11222',
        slaHours: 12,
      },
      {
        name: 'Housekeeping and Waste Management',
        code: 'HOUSE',
        description: 'Campus hygiene, waste segregation, composting, and recycling collection.',
        headOfDepartment: 'Smt. Anjali Joshi',
        contactEmail: 'housekeeping@campus.edu',
        contactPhone: '+91 98220 11223',
        slaHours: 8,
      },
      {
        name: 'IT & Network Infrastructure',
        code: 'IT',
        description: 'Campus Wi-Fi access points, fiber lines, server room UPS, and smart classroom AV systems.',
        headOfDepartment: 'Prof. Sandeep Shinde',
        contactEmail: 'it.support@campus.edu',
        contactPhone: '+91 98220 11224',
        slaHours: 12,
      },
      {
        name: 'Civil & Infrastructure Maintenance',
        code: 'INFRA',
        description: 'Classroom furniture, doors, windows, paint, and masonry repairs.',
        headOfDepartment: 'Er. Mahesh Patil',
        contactEmail: 'civil.infra@campus.edu',
        contactPhone: '+91 98220 11225',
        slaHours: 48,
      },
      {
        name: 'Laboratory Equipment Support',
        code: 'LAB',
        description: 'Specialized lab fixtures, fume hoods, calibration, and experimental apparatus safety.',
        headOfDepartment: 'Dr. Neha Verma',
        contactEmail: 'lab.support@campus.edu',
        contactPhone: '+91 98220 11226',
        slaHours: 24,
      },
    ];

    const departments = await Department.insertMany(departmentsData);
    console.log(`Created ${departments.length} departments.`);

    const elecDept = departments.find((d) => d.code === 'ELEC');
    const plumbDept = departments.find((d) => d.code === 'PLUMB');
    const houseDept = departments.find((d) => d.code === 'HOUSE');
    const itDept = departments.find((d) => d.code === 'IT');

    // 2. Create Users (Password hashing will be triggered by pre-save or pre-computed)
    const salt = await bcrypt.genSalt(10);
    const hash = async (pwd) => await bcrypt.hash(pwd, salt);

    const adminUser = await User.create({
      name: 'Dr. Sunita Rao',
      email: 'admin@campus.edu',
      password: 'admin123',
      role: 'admin',
      campus: 'Main Academic Campus',
      phone: '+91 98111 00001',
    });

    const staffElec = await User.create({
      name: 'Vikram Singh',
      email: 'staff.elec@campus.edu',
      password: 'staff123',
      role: 'staff',
      department: elecDept._id,
      campus: 'Main Academic Campus',
      phone: '+91 98111 00002',
    });

    const staffPlumb = await User.create({
      name: 'Ramesh Patel',
      email: 'staff.plumb@campus.edu',
      password: 'staff123',
      role: 'staff',
      department: plumbDept._id,
      campus: 'Main Academic Campus',
      phone: '+91 98111 00003',
    });

    const sustainOfficer = await User.create({
      name: 'Priya Deshmukh',
      email: 'sustainability@campus.edu',
      password: 'sustain123',
      role: 'sustainability_officer',
      campus: 'Eco Center & Central Administration',
      phone: '+91 98111 00004',
    });

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'student@campus.edu',
      password: 'student123',
      role: 'student',
      campus: 'Main Academic Campus',
      phone: '+91 98111 00005',
    });

    const student2 = await User.create({
      name: 'Ananya Iyer',
      email: 'ananya@campus.edu',
      password: 'student123',
      role: 'student',
      campus: 'North Wing Campus',
      phone: '+91 98111 00006',
    });

    console.log('Created standard role users with passwords.');

    // 3. Create Realistic Complaints across statuses
    const complaintsData = [
      {
        complaintId: 'CMP-2026-0001',
        title: 'Water tap continuously dripping and leaking in 2nd Floor Restroom',
        description: 'The sink faucet on the north corner of the 2nd-floor washroom in the Central Library is leaking approximately 10 litres of clean water per hour.',
        category: 'Plumbing and Water',
        building: 'Library Building',
        locationDetails: '2nd Floor, Restroom B-204',
        priority: 'High',
        status: 'Resolved',
        submittedBy: studentUser._id,
        assignedDepartment: plumbDept._id,
        assignedStaff: staffPlumb._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        adminRemarks: 'Assigned urgently to avoid potable water wastage.',
        staffRemarks: 'Replaced faulty ceramic valve disc and installed water-saving aerator nozzle.',
        resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'Submitted', changedBy: studentUser._id, changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), remarks: 'Submitted by student' },
          { status: 'Assigned', changedBy: adminUser._id, changedAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000), remarks: 'Assigned to plumbing team' },
          { status: 'In Progress', changedBy: staffPlumb._id, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remarks: 'Parts gathered, maintenance commenced' },
          { status: 'Resolved', changedBy: staffPlumb._id, changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Repaired and verified water shutoff' },
        ],
      },
      {
        complaintId: 'CMP-2026-0002',
        title: 'AC unit blowing warm air and humming loudly in Lab 301',
        description: 'The split AC unit in Computer Engineering Lab 3 is malfunctioning during afternoon sessions, causing high power drain without cooling.',
        category: 'Electrical',
        building: 'Science & Engineering Wing',
        locationDetails: 'Room 301, 3rd Floor',
        priority: 'High',
        status: 'In Progress',
        submittedBy: studentUser._id,
        assignedDepartment: elecDept._id,
        assignedStaff: staffElec._id,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        adminRemarks: 'Assigned to Vikram Singh for inspection.',
        staffRemarks: 'Thermostat sensor checked; refilling refrigerant gas and cleaning condenser coils.',
        statusHistory: [
          { status: 'Submitted', changedBy: studentUser._id, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remarks: 'Reported by Aarav' },
          { status: 'Assigned', changedBy: adminUser._id, changedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000), remarks: 'Assigned to electrical team' },
          { status: 'In Progress', changedBy: staffElec._id, changedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), remarks: 'Servicing started on site' },
        ],
      },
      {
        complaintId: 'CMP-2026-0003',
        title: 'Flickering ceiling LED panels causing eye strain',
        description: 'Two center ceiling LED lights are blinking rhythmically and buzzing in Classroom 105 during morning lectures.',
        category: 'Electrical',
        building: 'Main Academic Block',
        locationDetails: 'Classroom 105, 1st Floor',
        priority: 'Medium',
        status: 'Assigned',
        submittedBy: student2._id,
        assignedDepartment: elecDept._id,
        assignedStaff: staffElec._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        adminRemarks: 'Driver replacement scheduled.',
        statusHistory: [
          { status: 'Submitted', changedBy: student2._id, changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Submitted by student' },
          { status: 'Assigned', changedBy: adminUser._id, changedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), remarks: 'Assigned to Vikram Singh' },
        ],
      },
      {
        complaintId: 'CMP-2026-0004',
        title: 'Recycling segregation bin lid broken and overflowing',
        description: 'The green dry-waste segregation bin outside the Cafeteria has a damaged lid and requires immediate emptying and bin maintenance.',
        category: 'Cleanliness and Waste',
        building: 'Student Cafeteria',
        locationDetails: 'West Entrance Veranda',
        priority: 'Medium',
        status: 'Submitted',
        submittedBy: studentUser._id,
        statusHistory: [
          { status: 'Submitted', changedBy: studentUser._id, changedAt: new Date(Date.now() - 0.2 * 24 * 60 * 60 * 1000), remarks: 'Reported by student' },
        ],
      },
      {
        complaintId: 'CMP-2026-0005',
        title: 'Wi-Fi access point dropping connection periodically',
        description: 'High packet loss and random disconnections observed when connected to eduroam / CampusNet-North in Seminar Hall B.',
        category: 'IT and Wi-Fi',
        building: 'Library Building',
        locationDetails: 'Ground Floor, Seminar Hall B',
        priority: 'Low',
        status: 'Under Review',
        submittedBy: student2._id,
        adminRemarks: 'Assessing AP firmware with IT network team.',
        statusHistory: [
          { status: 'Submitted', changedBy: student2._id, changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), remarks: 'Reported' },
          { status: 'Under Review', changedBy: adminUser._id, changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), remarks: 'Under review by campus admin' },
        ],
      },
      {
        complaintId: 'CMP-2026-0006',
        title: 'Laboratory chemical sink drainage slow and gurgling',
        description: 'The neutralizer sink in Chemistry Lab 2 is draining very slowly, risking chemical backup.',
        category: 'Laboratory Equipment',
        building: 'Science & Engineering Wing',
        locationDetails: 'Lab 204, Chemistry Section',
        priority: 'Urgent',
        status: 'Assigned',
        submittedBy: studentUser._id,
        assignedDepartment: plumbDept._id,
        assignedStaff: staffPlumb._id,
        dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
        adminRemarks: 'Urgent safety priority. Inspect acid waste trap.',
        statusHistory: [
          { status: 'Submitted', changedBy: studentUser._id, changedAt: new Date(Date.now() - 0.3 * 24 * 60 * 60 * 1000), remarks: 'Reported' },
          { status: 'Assigned', changedBy: adminUser._id, changedAt: new Date(Date.now() - 0.1 * 24 * 60 * 60 * 1000), remarks: 'Assigned immediately to plumbing' },
        ],
      },
    ];

    const complaints = await Complaint.insertMany(complaintsData);
    console.log(`Created ${complaints.length} complaint records.`);

    // 4. Attach Feedback to the resolved complaint
    const resolvedComp = complaints.find((c) => c.status === 'Resolved');
    if (resolvedComp) {
      const feedback = await Feedback.create({
        complaint: resolvedComp._id,
        submittedBy: studentUser._id,
        rating: 5,
        comments: 'Water leakage was fixed within 24 hours. The new aerator tap works great and stops wastage!',
        isSatisfied: true,
      });
      resolvedComp.feedback = feedback._id;
      await resolvedComp.save();
      console.log('Created feedback for resolved complaint.');
    }

    // 5. Create Monthly Energy Records
    const energyData = [
      { building: 'Main Academic Block', reportingPeriod: '2026-01', electricityKWh: 14200, solarGeneratedKWh: 3800, notes: 'Standard session winter usage', recordedBy: sustainOfficer._id },
      { building: 'Main Academic Block', reportingPeriod: '2026-02', electricityKWh: 13900, solarGeneratedKWh: 4200, notes: 'Solar panel clean-up performed', recordedBy: sustainOfficer._id },
      { building: 'Main Academic Block', reportingPeriod: '2026-03', electricityKWh: 15400, solarGeneratedKWh: 5100, notes: 'Higher AC demand as summer started', recordedBy: sustainOfficer._id },
      { building: 'Science & Engineering Wing', reportingPeriod: '2026-01', electricityKWh: 18500, solarGeneratedKWh: 4100, notes: 'Heavy lab instrument load', recordedBy: sustainOfficer._id },
      { building: 'Science & Engineering Wing', reportingPeriod: '2026-02', electricityKWh: 17900, solarGeneratedKWh: 4600, notes: 'LED retrofits in physics labs', recordedBy: sustainOfficer._id },
      { building: 'Science & Engineering Wing', reportingPeriod: '2026-03', electricityKWh: 19100, solarGeneratedKWh: 5400, notes: 'Rooftop solar generation peaked', recordedBy: sustainOfficer._id },
      { building: 'Library Building', reportingPeriod: '2026-01', electricityKWh: 6200, solarGeneratedKWh: 1900, notes: 'HVAC scheduled on timer', recordedBy: sustainOfficer._id },
      { building: 'Library Building', reportingPeriod: '2026-02', electricityKWh: 6050, solarGeneratedKWh: 2100, notes: 'Study halls occupancy high', recordedBy: sustainOfficer._id },
      { building: 'Library Building', reportingPeriod: '2026-03', electricityKWh: 6400, solarGeneratedKWh: 2400, notes: 'Exam preparation month', recordedBy: sustainOfficer._id },
    ];
    await EnergyRecord.insertMany(energyData);
    console.log(`Created ${energyData.length} energy records.`);

    // 6. Create Water Records
    const waterData = [
      { building: 'Main Academic Block', reportingPeriod: '2026-01', waterLitres: 125000, recycledLitres: 35000, notes: 'Greywater recycling active for gardens', recordedBy: sustainOfficer._id },
      { building: 'Main Academic Block', reportingPeriod: '2026-02', waterLitres: 118000, recycledLitres: 36000, notes: 'Aerator nozzles installed', recordedBy: sustainOfficer._id },
      { building: 'Main Academic Block', reportingPeriod: '2026-03', waterLitres: 130000, recycledLitres: 42000, notes: 'Higher intake due to temperature rise', recordedBy: sustainOfficer._id },
      { building: 'Hostel Block A', reportingPeriod: '2026-01', waterLitres: 210000, recycledLitres: 55000, notes: 'Solar water heaters & STP working', recordedBy: sustainOfficer._id },
      { building: 'Hostel Block A', reportingPeriod: '2026-02', waterLitres: 195000, recycledLitres: 52000, notes: 'Leakage checks completed', recordedBy: sustainOfficer._id },
      { building: 'Hostel Block A', reportingPeriod: '2026-03', waterLitres: 220000, recycledLitres: 62000, notes: 'Peak hostel occupancy', recordedBy: sustainOfficer._id },
    ];
    await WaterRecord.insertMany(waterData);
    console.log(`Created ${waterData.length} water records.`);

    // 7. Create Waste Records
    const wasteData = [
      { building: 'Main Academic Block', reportingPeriod: '2026-03', wasteCategory: 'Paper & Cardboard', totalGeneratedKg: 850, amountRecycledKg: 780, notes: 'Department paper shredding and pulping drive', recordedBy: sustainOfficer._id },
      { building: 'Main Academic Block', reportingPeriod: '2026-03', wasteCategory: 'Dry & Plastic', totalGeneratedKg: 620, amountRecycledKg: 490, notes: 'Collected through dedicated green kiosks', recordedBy: sustainOfficer._id },
      { building: 'Student Cafeteria', reportingPeriod: '2026-03', wasteCategory: 'Organic & Food', totalGeneratedKg: 1950, amountRecycledKg: 1750, notes: 'Composted at campus bio-methanation facility', recordedBy: sustainOfficer._id },
      { building: 'Science & Engineering Wing', reportingPeriod: '2026-03', wasteCategory: 'E-Waste', totalGeneratedKg: 340, amountRecycledKg: 310, notes: 'Collected for authorized recycling partner', recordedBy: sustainOfficer._id },
    ];
    await WasteRecord.insertMany(wasteData);
    console.log(`Created ${wasteData.length} waste records.`);

    // 8. Create Sustainability Campaigns
    const campaignsData = [
      {
        title: 'Energy Conservation Month: Switch Off to Power Up',
        description: 'Departmental challenge to reduce idle electricity load by 15% during off-peak hours and weekends.',
        category: 'Energy',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-31'),
        targetGoal: 'Save 5,000 kWh across academic labs',
        status: 'Active',
        coordinator: sustainOfficer._id,
        participants: [studentUser._id, student2._id],
        participantCount: 24,
        rewardsOrPoints: 75,
        metricsAchieved: '3,200 kWh conserved so far',
      },
      {
        title: 'Zero Single-Use Plastic Campus Drive',
        description: 'Promoting refillable steel bottles and cloth bags. Bring plastic waste to the Eco Kiosk for eco-points.',
        category: 'Waste',
        startDate: new Date('2026-03-15'),
        endDate: new Date('2026-04-15'),
        targetGoal: 'Divert 500 kg of plastic to upcycling partners',
        status: 'Active',
        coordinator: sustainOfficer._id,
        participants: [studentUser._id],
        participantCount: 52,
        rewardsOrPoints: 50,
        metricsAchieved: '210 kg collected',
      },
      {
        title: 'Drop by Drop: Campus Water Audit & Leakage Hunt',
        description: 'Student-led survey identifying leaking fixtures, overflowing tanks, and educating staff on aerators.',
        category: 'Water',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-04-20'),
        targetGoal: 'Audit 100% of campus restrooms and labs',
        status: 'Upcoming',
        coordinator: sustainOfficer._id,
        participants: [],
        participantCount: 18,
        rewardsOrPoints: 100,
        metricsAchieved: 'Starting next week',
      },
    ];
    await SustainabilityCampaign.insertMany(campaignsData);
    console.log(`Created ${campaignsData.length} sustainability campaigns.`);

    // 9. Create Notifications
    const notificationsData = [
      {
        recipient: studentUser._id,
        title: 'Issue Resolved: Water tap fixed',
        message: 'Your complaint CMP-2026-0001 in Library Building has been resolved. Please share your rating and feedback.',
        type: 'complaint_status',
        link: `/student/complaints/${complaints[0]._id}`,
        isRead: false,
      },
      {
        recipient: studentUser._id,
        title: 'New Campaign: Energy Conservation Month',
        message: 'Join the campus energy challenge and earn 75 eco-points!',
        type: 'campaign',
        link: '/sustainability/campaigns',
        isRead: false,
      },
      {
        recipient: staffElec._id,
        title: 'New Task Assigned: AC unit humming',
        message: 'You have been assigned complaint CMP-2026-0002 at Science & Engineering Wing Room 301.',
        type: 'assignment',
        link: `/staff/tasks/${complaints[1]._id}`,
        isRead: false,
      },
      {
        recipient: adminUser._id,
        title: 'Urgent Issue Reported: Chemical sink drainage',
        message: 'Urgent priority complaint CMP-2026-0006 reported in Science & Engineering Wing.',
        type: 'alert',
        link: '/admin/complaints',
        isRead: false,
      },
    ];
    await Notification.insertMany(notificationsData);
    console.log(`Created ${notificationsData.length} notifications.`);

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('======================================================');
    console.log('Demo Credentials for College Presentation:');
    console.log(' 1. Student:                student@campus.edu         / student123');
    console.log(' 2. Maintenance Staff:      staff.elec@campus.edu      / staff123');
    console.log(' 3. Campus Administrator:   admin@campus.edu           / admin123');
    console.log(' 4. Sustainability Officer: sustainability@campus.edu  / sustain123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();

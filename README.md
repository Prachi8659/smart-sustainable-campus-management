# Smart & Sustainable Campus Management System

> **A College Web Technology (WT) Capstone Project**  
> An integrated platform combining **Campus Facility Complaint Resolution & Maintenance Dispatch** with **Campus Resource Monitoring & Carbon Sustainability Accounting**.

---

## 1. Project Overview

The **Smart & Sustainable Campus Management System** unifies two crucial facets of modern university administration into a single, high-aesthetic web application:

1. **Campus Complaint & Maintenance Management**: Enables students and staff to log issues (plumbing, electrical, cleanliness, IT, lab safety) with image proofs and specific location tagging. Administrators review and dispatch work orders to specialized maintenance departments with SLA targets. Technicians start repairs, upload completion remarks/proofs, and students submit 5-star ratings and feedback.
2. **Campus Sustainability Management**: Tracks resource consumption (grid electricity, clean rooftop solar generation, municipal water intake, treated greywater, and solid waste segregation). Dynamically computes campus carbon footprint ($\text{kg CO}_2\text{e}$) and an auditable, weighted **Campus Sustainability Score (0–100)** while fostering student eco-action through gamified green campaigns.

---

## 2. Mandatory Color Theme & Design System

The application strictly implements the **Navy Blue + Mint Green** corporate SaaS palette:

| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Navy** | `#142B4A` | Sidebar, primary CTA buttons, main headings, table headers |
| **Deep Navy** | `#0B172A` | Hero accents, bottom footer, notification cards, demo banner |
| **Secondary Navy** | `#203D5B` | Active sidebar highlights, card borders |
| **Mint Green** | `#75E0C0` | Primary eco highlights, success badges, chart accents |
| **Soft Mint** | `#E3FAF2` | Pill backgrounds, metric card tags, active hover states |
| **Page Background** | `#F5F8FC` | Main canvas background |
| **Borders** | `#E3EAF2` | Card dividers, input outlines, table cell borders |
| **Success / Warning / Error** | `#22A06B` / `#F4B942` / `#E05260` | Operational status indicators |

---

## 3. Technology Stack

- **Frontend**: React 19 with Vite
- **Styling**: Tailwind CSS v3 with customized tokens
- **Routing**: React Router v7 (`react-router-dom`)
- **Data Visualization**: Recharts (Composed charts, Bar charts, Area charts, Pie charts)
- **Icons**: Lucide React
- **Notifications**: `react-hot-toast` + Database-backed in-app Notification Center
- **HTTP Client**: Axios with JWT Bearer Token interceptor
- **Backend**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & `bcryptjs` password hashing
- **File Uploads**: Multer (Local disk storage in `server/uploads/` with 5MB validation)

---

## 4. System Architecture & Folder Structure

```
d:/MITAOE/Web Tech/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # StatusBadge, PriorityBadge, Modal, ConfirmDialog, DemoBanner
│   │   │   ├── complaints/     # ComplaintTimeline, FeedbackForm
│   │   │   └── layout/         # Navbar, Sidebar, Footer, DashboardLayout
│   │   ├── context/            # AuthContext (JWT & 1-click role switcher), NotificationContext
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, LoginPage, RegisterPage
│   │   │   ├── student/        # StudentDashboard, ReportIssuePage, MyComplaintsPage, ComplaintDetailPage
│   │   │   ├── staff/          # StaffDashboard, AssignedTasksPage, TaskDetailPage
│   │   │   ├── admin/          # AdminDashboard, ComplaintManagementPage, DepartmentManagementPage, UserManagementPage
│   │   │   └── sustainability/ # SustainabilityDashboard, ResourceRecordsPage, CampaignsPage
│   │   ├── services/           # api.js, mockData.js, complaintService, sustainabilityService, departmentService
│   │   ├── App.jsx             # Role-protected route definitions
│   │   ├── index.css           # Tailwind directives & design system utilities
│   │   └── main.jsx            # Application entry mount
│   ├── tailwind.config.js      # Custom theme color mappings
│   └── package.json
│
├── server/                     # Express.js + Node.js Backend
│   ├── src/
│   │   ├── config/             # db.js (MongoDB connection with graceful fallback)
│   │   ├── controllers/        # auth, complaint, department, sustainability, dashboard, notification
│   │   ├── middleware/         # auth (JWT & role check), upload (Multer), errorHandler
│   │   ├── models/             # User, Department, Complaint, Feedback, EnergyRecord, WaterRecord, WasteRecord, Campaign, Notification
│   │   ├── routes/             # authRoutes, complaintRoutes, departmentRoutes, sustainabilityRoutes, dashboardRoutes, notificationRoutes
│   │   ├── seeds/              # seed.js (comprehensive demo database seeder)
│   │   └── index.js            # Express app entry & middleware mounting
│   ├── uploads/                # Local uploaded ticket images
│   ├── .env                    # Active environment variables
│   ├── .env.example            # Environment template
│   └── package.json
└── README.md
```

---

## 5. Demo Credentials (For Presentation / Viva Evaluation)

The database includes pre-seeded demo accounts with encrypted passwords for all 4 distinct roles:

| Role | Email Address | Password | Name | Department / Zone |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student@campus.edu` | `student123` | Aarav Sharma | Main Academic Campus |
| **Maintenance Staff** | `staff.elec@campus.edu` | `staff123` | Vikram Singh | Electrical Maintenance |
| **Maintenance Staff** | `staff.plumb@campus.edu` | `staff123` | Ramesh Patel | Plumbing & Water Supply |
| **Administrator** | `admin@campus.edu` | `admin123` | Dr. Sunita Rao | Campus Administration |
| **Sustainability Officer** | `sustainability@campus.edu` | `sustain123` | Priya Deshmukh | Eco Center |

> **Evaluator Tip**: The top bar includes a persistent **Demo Role Switcher**. Evaluators can switch between **Student**, **Staff**, **Admin**, and **Sustainability** portals in **one click** without re-logging in!

---

## 6. How to Run the Project

### Prerequisites
- Node.js (v18+ or v24+ installed)
- npm (v9+ installed)
- MongoDB service running locally on `localhost:27017` (Optional: if MongoDB is stopped, the client automatically utilizes its built-in interactive demo storage).

### Step 1: Set Up Backend (`/server`)
```bash
cd server
npm install

# (Optional) Seed initial demo records into MongoDB:
npm run seed

# Start Express server:
npm start
# Server runs on: http://localhost:5000
```

### Step 2: Set Up Frontend (`/client`)
```bash
cd client
npm install

# Start Vite dev server:
npm run dev
# Frontend runs on: http://localhost:5173
```

---

## 7. Backend Implementation Status (50% Scope)

As outlined in the specification, approximately 50% of the backend modules have been implemented with genuine MongoDB models, controllers, and protected routes:

### Fully Implemented Backend Modules (Included in this deliverable):
1. **User Authentication & Authorization**:
   - `POST /api/auth/register` (Strictly forbids student self-promotion to admin)
   - `POST /api/auth/login` (Bcrypt hash comparison + JWT generation)
   - `GET /api/auth/me` (Profile retrieval)
   - `GET /api/auth/users` (Admin user listing & department allocation)
   - `PATCH /api/auth/users/:id` (Safe account activation/deactivation)
2. **Complaint Lifecycle**:
   - `POST /api/complaints` (Multipart Multer upload, ID generation `CMP-YYYY-XXXX`, initial state `Submitted`)
   - `GET /api/complaints` (Role-scoped filtering, pagination, search)
   - `GET /api/complaints/:id` (Full ticket inspection with history)
   - `PATCH /api/complaints/:id/assign` (Admin dispatch to department & staff)
   - `PATCH /api/complaints/:id/status` (Workflow transition validation: `Assigned` $\rightarrow$ `In Progress` $\rightarrow$ `Resolved`)
   - `POST /api/complaints/:id/feedback` (Student 5-star rating & review)
3. **Department Management**:
   - `GET /api/departments`
   - `POST /api/departments`
   - `PATCH /api/departments/:id`
   - `DELETE /api/departments/:id` (Audit-safe deactivation preserving historical relations)
4. **Sustainability & Resource CRUD**:
   - `GET /api/sustainability/summary` (Dynamic mathematical calculation of net electricity, solar offset, and carbon emissions)
   - `GET /api/sustainability/trends` (Monthly aggregation for Recharts)
   - Energy CRUD (`/api/sustainability/energy`)
   - Water CRUD (`/api/sustainability/water`)
   - Waste CRUD (`/api/sustainability/waste` with boundary validation: `amountRecycled <= totalGenerated`)
   - Campaign listing and joining (`/api/sustainability/campaigns`)
5. **Dashboard Statistics APIs**:
   - Role-partitioned dashboard aggregations (`/api/dashboard/student`, `/staff`, `/admin`).

### Remaining Backend Work (Next Phase / Future Scope):
- Real-time WebSockets / Socket.io for instant push notifications.
- Cloud object storage integration (AWS S3 or Cloudinary) replacing local Multer disk storage.
- Automated email alerts (Nodemailer or SendGrid) on ticket assignment.
- Automated PDF report export engine (e.g. PDFKit).
- IoT smart sensor ingestion pipelines for live electricity/water meter hardware.

---

## 8. Documented Sustainability Formulas & Carbon Factors

### A. Carbon Emission Estimation Formula
$$\text{Total } \text{CO}_2\text{e (kg)} = (E_{\text{net}} \times 0.82) + (W_{\text{total}} \times 0.00035) + (L_{\text{unrecycled}} \times 1.25) - (R_{\text{recycled}} \times 0.45)$$

- **Grid Electricity**: $0.82\text{ kg CO}_2\text{e per kWh}$ (CEA National Benchmark)
- **Solar Offset**: $-0.82\text{ kg CO}_2\text{e per kWh}$
- **Water Footprint**: $0.00035\text{ kg CO}_2\text{e per Litre}$
- **Landfill Waste**: $1.25\text{ kg CO}_2\text{e per kg}$
- **Recycling Avoidance**: $-0.45\text{ kg CO}_2\text{e per kg}$

### B. Campus Sustainability Score (0–100)
$$\text{Score} = \min\left(100, \left(\frac{\text{Solar}}{\text{Total Power}} \times 35\right) + \left(\frac{\text{Waste Recycled}}{\text{Total Waste}} \times 35\right) + \left(\frac{\text{Water Recycled}}{\text{Total Water}} \times 15\right) + \left(\frac{\text{Resolved Complaints}}{\text{Total Complaints}} \times 15\right)\right)$$

---

## 9. Viva Voce & College Presentation Tips

1. **How to demonstrate the core workflow?**
   - Start on the **Landing Page** to show the Navy & Mint UI and project overview.
   - Click the top demo bar to switch to **Student** $\rightarrow$ File a complaint at `/student/report` (e.g. water leakage in lab).
   - Switch to **Admin** $\rightarrow$ Show the new complaint in `/admin/complaints` $\rightarrow$ Open **Assign / Edit** modal and dispatch to the Plumbing department and technician Ramesh Patel.
   - Switch to **Staff** $\rightarrow$ Open `/staff/tasks` $\rightarrow$ Transition ticket to **In Progress**, then **Resolved** with remarks.
   - Switch back to **Student** $\rightarrow$ Open `/student/complaints` $\rightarrow$ Verify ticket is **Resolved** $\rightarrow$ Fill out the 5-star **Feedback Form**.
   - Navigate to the **Sustainability Portal** $\rightarrow$ Show how resource consumption and the sustainability score update dynamically!
2. **Security Highlights**:
   - Passwords hashed with `bcryptjs` (salt rounds: 10).
   - Route protection enforced on backend via `protect` JWT middleware and `authorize('admin', 'staff', ...)` role checks.
   - Students cannot self-assign Admin roles during registration.
   - Safe deactivation preserves historical audit logs without breaking relational references.

---

## 10. License & Credits

Developed for the **Web Technology (WT)** curriculum at **MIT Academy of Engineering**.
Built with React, Vite, Tailwind CSS, Node.js, Express, and MongoDB.

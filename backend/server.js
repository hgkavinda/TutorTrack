const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");

// Load routes
const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const materialRoutes = require('./routes/materials');
const markRoutes = require('./routes/marks');
const feeRoutes = require('./routes/fees');
const announcementRoutes = require('./routes/announcements');
const dashboardRoutes = require('./routes/dashboard');
const studentPortalRoutes = require('./routes/studentPortal');
const { errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const connectDB = require("./config/db");

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// test route
app.get("/", (req, res) => {
  res.send("TutorTrack API Running");
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/marks', markRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/student-portal', studentPortalRoutes);

// Custom error handling
app.use(errorHandler);

// Connect to MongoDB before accepting requests so a failed database connection
// does not leave the API running in a misleading, partially working state.
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

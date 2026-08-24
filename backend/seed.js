const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// Load env vars
dotenv.config();

// Some Windows/network DNS resolvers refuse SRV queries used by mongodb+srv.
dns.setServers(
    (process.env.MONGO_DNS_SERVERS || "1.1.1.1,8.8.8.8")
        .split(",")
        .map((server) => server.trim())
        .filter(Boolean)
);

// Load models
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const ClassSession = require('./models/ClassSession');
const Enrollment = require('./models/Enrollment');
const Material = require('./models/Material');
const Mark = require('./models/Mark');
const Exam = require('./models/Exam');
const StudentRating = require('./models/StudentRating');
const Fee = require('./models/Fee');
const PaymentTransaction = require('./models/PaymentTransaction');
const Announcement = require('./models/Announcement');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
    try {
        // Clear DB
        await Teacher.deleteMany();
        await Class.deleteMany();
        await Student.deleteMany();
        await Attendance.deleteMany();
        await ClassSession.deleteMany();
        await Enrollment.deleteMany();
        await Material.deleteMany();
        await Mark.deleteMany();
        await Exam.deleteMany();
        await StudentRating.deleteMany();
        await Fee.deleteMany();
        await PaymentTransaction.deleteMany();
        await Announcement.deleteMany();

        console.log('Database cleared.');

        // Create Admin Teacher
        const teacher = await Teacher.create({
            name: 'Admin Teacher',
            email: 'teacher@tutortrack.com',
            password: '12345678', // Will be hashed by pre-save middleware
            phoneNumber: '+1234567890',
        });

        console.log('Teacher Seed Created:', teacher.email);

        // Create some sample classes
        const class1 = await Class.create({
            classId: 'CLS-G10-SEED01',
            className: 'Grade 10 Mathematics',
            subject: 'Mathematics',
            grade: '10',
            location: 'Main Branch',
            contactNumber: '+94112223344',
            day: 'Monday',
            startTime: '15:00',
            endTime: '17:00',
            monthlyFee: 50.0,
            description: 'Advanced algebra and geometry',
        });

        const class2 = await Class.create({
            classId: 'CLS-G11-SEED01',
            className: 'Grade 11 Physics',
            subject: 'Physics',
            grade: '11',
            location: 'Main Branch',
            contactNumber: '+94112223344',
            day: 'Wednesday',
            startTime: '16:00',
            endTime: '18:00',
            monthlyFee: 60.0,
            description: 'Mechanics and thermodynamics',
        });

        console.log('Classes Seed Created.');

        // Create some students
        const student1 = await Student.create({
            fullName: 'John Doe',
            studentId: 'STU001',
            gender: 'Male',
            dateOfBirth: new Date('2008-05-14'),
            parentName: 'Jane Doe',
            parentPhone: '+1987654321',
            address: '123 Main St, City',
            grade: '10',
            academicYear: new Date().getFullYear(),
            password: 'TempPass001!',
        });

        const student2 = await Student.create({
            fullName: 'Emma Smith',
            studentId: 'STU002',
            gender: 'Female',
            dateOfBirth: new Date('2007-08-22'),
            parentName: 'Robert Smith',
            parentPhone: '+1122334455',
            address: '456 Oak Ave, City',
            grade: '11',
            academicYear: new Date().getFullYear(),
            password: 'TempPass002!',
        });

        console.log('Students Seed Created.');

        await Enrollment.insertMany([
            {
                student: student1._id,
                assignedClass: class1._id,
                startDate: student1.joinedDate,
                createdBy: teacher._id,
            },
            {
                student: student2._id,
                assignedClass: class2._id,
                startDate: student2.joinedDate,
                createdBy: teacher._id,
            },
        ]);

        console.log('Enrollments Seed Created.');

        // Create an announcement
        await Announcement.create({
            title: 'Welcome to TutorTrack',
            message: 'This is a sample announcement for all classes. Classes resume next week!',
            targetClass: null, // all classes
            priorityLevel: 'High'
        });

        console.log('Announcement Seed Created.');

        console.log('--- Data Imported Successfully ---');
        process.exit();
    } catch (err) {
        console.error(`Error: ${err}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Teacher.deleteMany();
        await Class.deleteMany();
        await Student.deleteMany();
        await Attendance.deleteMany();
        await ClassSession.deleteMany();
        await Enrollment.deleteMany();
        await Material.deleteMany();
        await Mark.deleteMany();
        await Exam.deleteMany();
        await StudentRating.deleteMany();
        await Fee.deleteMany();
        await PaymentTransaction.deleteMany();
        await Announcement.deleteMany();

        console.log('--- Data Destroyed ---');
        process.exit();
    } catch (err) {
        console.error(`Error: ${err}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}

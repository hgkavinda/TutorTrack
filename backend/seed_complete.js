const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');

// Load models
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const ClassSession = require('./models/ClassSession');
const Enrollment = require('./models/Enrollment');
const Mark = require('./models/Mark');
const Exam = require('./models/Exam');
const StudentRating = require('./models/StudentRating');
const Fee = require('./models/Fee');
const Announcement = require('./models/Announcement');

async function seedCompleteData() {
    try {
        await connectDB();
        console.log('Connected to MongoDB Atlas');

        // Check if teacher exists or create
        let teacher = await Teacher.findOne({ email: 'teacher@tutortrack.com' });
        if (!teacher) {
            teacher = await Teacher.create({
                name: 'Sir HG Kavinda',
                email: 'teacher@tutortrack.com',
                password: 'password123',
                phoneNumber: '+94771234567',
                profilePhoto: '/teacher-photo.jpg'
            });
            console.log('Teacher created:', teacher.email);
        } else {
            teacher.name = 'Sir HG Kavinda';
            await teacher.save();
        }

        // Find or create class
        let class1 = await Class.findOne({ grade: '10' });
        if (!class1) {
            class1 = await Class.create({
                classId: 'CLS-G10-MATH',
                className: 'Grade 10 Mathematics - 2026',
                subject: 'Mathematics',
                grade: '10',
                location: 'Main Branch - Hall 01',
                contactNumber: '+94771234567',
                day: 'Saturday',
                startTime: '08:00',
                endTime: '12:00',
                monthlyFee: 2500,
                description: 'A/L Foundation and O/L Pure Mathematics Theory',
                status: 'active'
            });
        }

        // Students
        const student1 = await Student.findOne({ studentId: 'STU001' });
        if (student1) {
            // Ensure student1 is enrolled
            await Enrollment.updateOne(
                { student: student1._id, assignedClass: class1._id },
                { status: 'active', startDate: new Date(), createdBy: teacher._id },
                { upsert: true }
            );

            // 1. Add Completed Session & Attendance
            let session = await ClassSession.findOne({ assignedClass: class1._id });
            if (!session) {
                session = await ClassSession.create({
                    sessionId: 'SES-2026-001',
                    assignedClass: class1._id,
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                    startTime: '08:00',
                    endTime: '12:00',
                    location: 'Main Hall',
                    status: 'Completed',
                    createdBy: teacher._id,
                });
            }

            await Attendance.deleteMany({ student: student1._id });
            await Attendance.create({
                session: session._id,
                student: student1._id,
                assignedClass: class1._id,
                date: session.date,
                status: 'Present',
                markedBy: teacher._id,
                note: 'On time via QR Scan'
            });
            console.log('Attendance seeded: Present');

            // 2. Add Exam & Marks & Rating
            await Exam.deleteMany({});
            await Mark.deleteMany({});
            await StudentRating.deleteMany({});

            const exam = await Exam.create({
                examId: 'EXM-2026-01',
                name: 'Monthly Test 01 - Theory & Geometry',
                type: 'Monthly Exam',
                subject: 'Mathematics',
                grade: '10',
                examDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                totalMarks: 100,
                academicYear: 2026,
                weight: 1,
                status: 'Published',
                createdBy: teacher._id,
            });

            await Mark.create({
                exam: exam._id,
                student: student1._id,
                marksObtained: 88,
                percentage: 88,
                performanceGrade: 'A',
                resultStatus: 'Completed',
                gradeRank: 1,
                cohortSize: 28,
                overallRating: 88,
                ratingGrade: 'A',
                ratingChange: 6,
                ratingStatus: 'Full',
                ratingComponents: {
                    recentPerformance: 88,
                    gradePosition: 1,
                    improvement: 6,
                    consistency: 90
                }
            });

            await StudentRating.create({
                student: student1._id,
                subject: 'Mathematics',
                grade: '10',
                academicYear: 2026,
                overallRating: 88,
                ratingGrade: 'A',
                ratingStatus: 'Full',
                change: 6,
                latestExam: exam._id,
                components: {
                    recentPerformance: 88,
                    gradePosition: 1,
                    improvement: 6,
                    consistency: 90
                }
            });
            console.log('Marks and Rating seeded: Grade A (88%)');

            // 3. Add Fees
            await Fee.deleteMany({});
            const currentMonth = new Date().toISOString().slice(0, 7); // "2026-11"
            await Fee.create({
                invoiceId: `INV-${student1.studentId}-${currentMonth}`,
                student: student1._id,
                assignedClass: class1._id,
                billingMonth: currentMonth,
                standardAmount: 2500,
                amount: 2500,
                paidAmount: 2500,
                balance: 0,
                status: 'Paid',
                paymentMethod: 'Cash',
                paymentDate: new Date(),
                receiptNumber: 'REC-001',
                generatedBy: teacher._id
            });

            const student2 = await Student.findOne({ studentId: 'STU002' });
            if (student2) {
                await Fee.create({
                    invoiceId: `INV-${student2.studentId}-${currentMonth}`,
                    student: student2._id,
                    assignedClass: class1._id,
                    billingMonth: currentMonth,
                    standardAmount: 2500,
                    amount: 2500,
                    paidAmount: 0,
                    balance: 2500,
                    status: 'Unpaid',
                    generatedBy: teacher._id
                });
            }
            console.log('Fees seeded: 1 Paid, 1 Unpaid');

            // 4. Announcements
            await Announcement.deleteMany({});
            await Announcement.create([
                {
                    title: 'පළමු වාර පරීක්ෂණයේ ප්‍රතිඵල නිකුත් කෙරිණි',
                    message: 'සියලුම Grade 10 සිසුන්ගේ Monthly Test 01 පරීක්ෂණයේ ප්‍රතිඵල සහ Ratings දැන් Student Portal එකෙන් බලාගත හැක.',
                    targetClass: class1._id,
                    priorityLevel: 'High'
                },
                {
                    title: 'ලබන සතියේ නව පාඩම ආරම්භය (New Theory Topic)',
                    message: 'ලබන සෙනසුරාදා පෙ.ව. 8.00 ට Geometry පාඩම ආරම්භ වේ. සියලුම සිසුන් Tute එක රැගෙන පැමිණෙන්න.',
                    targetClass: null, // All classes
                    priorityLevel: 'Normal'
                }
            ]);
            console.log('Announcements seeded: 2 items');
        }

        console.log('=== COMPLETE TEST DATA SEEDED SUCCESSFULLY ===');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedCompleteData();

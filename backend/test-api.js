const axios = require('axios');

const testApi = async () => {
    try {
        console.log('--- Starting API Testing ---');

        const API_URL = 'http://localhost:5000/api';

        // 1. Auth Login
        console.log('Testing /api/auth/login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'teacher@tutortrack.com',
            password: '12345678'
        });

        const token = loginRes.data.token;
        console.log('✅ Login Successful');

        // Setup Auth Header
        const authConfig = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // 2. Fetch Dashboard
        console.log('Testing /api/dashboard...');
        const dashboardRes = await axios.get(`${API_URL}/dashboard`, authConfig);
        console.log(`✅ Dashboard Returned: Students=${dashboardRes.data.data.totalStudents}, Classes=${dashboardRes.data.data.totalClasses}`);

        // 3. Fetch Classes
        console.log('Testing /api/classes...');
        const classesRes = await axios.get(`${API_URL}/classes`, authConfig);
        console.log(`✅ Classes Fetched: Count=${classesRes.data.count}`);

        // 4. Fetch Students
        console.log('Testing /api/students...');
        const studentsRes = await axios.get(`${API_URL}/students`, authConfig);
        console.log(`✅ Students Fetched: Count=${studentsRes.data.count}`);

        // 5. Test Profile
        console.log('Testing /api/auth/me...');
        const meRes = await axios.get(`${API_URL}/auth/me`, authConfig);
        console.log(`✅ Teacher Profile: ${meRes.data.data.name}`);

        console.log('--- All API Tests Passed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ API Test Failed!');
        if (error.response) {
            console.error(error.response.data);
        } else {
            console.error(error.message);
        }
        process.exit(1);
    }
};

testApi();

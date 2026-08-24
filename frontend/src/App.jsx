import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContextValue';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Materials from './pages/Materials';
import Marks from './pages/Marks';
import Fees from './pages/Fees';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import StudentHome from './pages/StudentHome';
import StudentChangePassword from './pages/StudentChangePassword';
import StudentLayout from './components/StudentLayout';
import StudentResults from './pages/StudentResults';
import StudentAttendance from './pages/StudentAttendance';
import StudentFees from './pages/StudentFees';
import Reports from './pages/Reports';
import ClassDetails from './pages/ClassDetails';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useContext(AuthContext);
  if (loading) return <div className="flex h-screen items-center justify-center text-blue-600">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'student' ? '/student' : '/'} replace />;
  }
  if (role === 'student' && user.mustChangePassword && window.location.pathname !== '/student/change-password') {
    return <Navigate to="/student/change-password" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="teacher">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="students/*" element={<Students />} />
        <Route path="classes" element={<Classes />} />
        <Route path="classes/:classId" element={<ClassDetails />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="materials" element={<Materials />} />
        <Route path="marks" element={<Marks />} />
        <Route path="fees" element={<Fees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="results" element={<StudentResults />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="fees" element={<StudentFees />} />
      </Route>
      <Route
        path="/student/change-password"
        element={
          <ProtectedRoute requiredRole="student">
            <StudentChangePassword />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

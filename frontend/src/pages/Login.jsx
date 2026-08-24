import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';

const Login = () => {
    const [loginRole, setLoginRole] = useState('teacher');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login, user, role } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(role === 'student' ? (user.mustChangePassword ? '/student/change-password' : '/student') : '/');
        }
    }, [user, role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const result = await login(identifier, password, loginRole);
            navigate(result.role === 'student'
                ? (result.mustChangePassword ? '/student/change-password' : '/student')
                : '/');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login');
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f8fc] p-4">
            {/* Decorative background elements */}
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl"></div>
            <div className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl"></div>

            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/80 bg-white p-6 shadow-[0_20px_60px_rgba(30,64,175,0.13)] sm:p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200">
                        <img src="/hgk-mathematics-monogram.png" alt="HGK Mathematics logo" className="h-full w-full scale-[1.55] object-contain" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">Maths By HG Kavinda</h1>
                    <p className="mt-2 text-sm text-gray-500">ඔබේ tuition classes සරලව කළමනාකරණය කරන්න</p>
                </div>

                <div className="grid grid-cols-2 bg-gray-100 rounded-lg p-1 mb-6">
                    <button type="button" onClick={() => { setLoginRole('teacher'); setIdentifier(''); setError(''); }} className={`rounded-md py-2 text-sm font-bold ${loginRole === 'teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
                        Teacher
                    </button>
                    <button type="button" onClick={() => { setLoginRole('student'); setIdentifier(''); setError(''); }} className={`rounded-md py-2 text-sm font-bold ${loginRole === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
                        Student
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{loginRole === 'student' ? 'Student ID' : 'Email Address'}</label>
                        <input
                            type={loginRole === 'student' ? 'text' : 'email'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400"
                            placeholder={loginRole === 'student' ? 'e.g. GR20260001' : 'teacher@tutortrack.com'}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Forgot Password?</a>
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-400"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-md shadow-blue-100 transition-colors hover:bg-blue-700 hover:shadow-lg"
                    >
                        {loginRole === 'student' ? 'Sign In as Student' : 'Sign In to Dashboard'}
                    </button>
                </form>

                {loginRole === 'teacher' && <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-gray-400">
                    <p>Demo Credentials:</p>
                    <p className="font-mono mt-1 text-gray-500">teacher@tutortrack.com / 12345678</p>
                </div>}
            </div>
        </div>
    );
};

export default Login;

import { useContext } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import Icon from './Icon';
import BrandLogo from './BrandLogo';
import NotificationBell from './NotificationBell';

const StudentLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const desktopLinks = [
        { label: 'මුල් පිටුව', short: 'Home', path: '/student', end: true, icon: 'home' },
        { label: 'ප්‍රතිඵල', short: 'Results', path: '/student/results', icon: 'marks' },
        { label: 'පැමිණීම', short: 'Attendance', path: '/student/attendance', icon: 'attendance' },
        { label: 'ගෙවීම්', short: 'Fees', path: '/student/fees', icon: 'fees' },
        { label: 'දැලිස වගු', short: 'Dalisa', path: '/student/dalisa', icon: 'dalisa' },
        { label: 'මගේ ගිණුම', short: 'Profile', path: '/student/profile', icon: 'user' },
    ];

    const mobileBottomLinks = desktopLinks.filter((link) => link.path !== '/student/dalisa');

    return (
        <div className="student-background min-h-screen text-slate-900 bg-[#f6f8fc]">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-800 shadow-xs backdrop-blur-md">
                <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <NavLink to="/student" className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <BrandLogo size="md" />
                        <div className="min-w-0">
                            <p className="truncate text-sm sm:text-lg font-extrabold tracking-tight text-slate-900">Maths By HG Kavinda</p>
                        </div>
                    </NavLink>
                    <nav className="hidden items-center gap-1 lg:flex">
                        {desktopLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs'
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`
                                }
                            >
                                <Icon name={link.icon} size={16} />
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                        <NavLink
                            to="/student/dalisa"
                            className={({ isActive }) =>
                                `flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-extrabold transition shadow-2xs lg:hidden ${
                                    isActive
                                        ? 'border-blue-600 bg-blue-600 text-white'
                                        : 'border-blue-200 bg-blue-50/80 text-blue-700 hover:bg-blue-100'
                                }`
                            }
                        >
                            <Icon name="dalisa" size={15} />
                            <span>දැලිස</span>
                        </NavLink>
                        <NotificationBell />
                        <NavLink
                            to="/student/profile"
                            className={({ isActive }) =>
                                `hidden items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs lg:flex ${
                                    isActive
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`
                            }
                        >
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-[11px] font-black text-white">
                                {user?.fullName?.charAt(0) || 'S'}
                            </span>
                            <span className="max-w-[110px] truncate">{user?.fullName || 'Profile'}</span>
                        </NavLink>
                        <button
                            onClick={logout}
                            className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 lg:flex"
                        >
                            <Icon name="logout" size={15} />
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-6xl p-4 pb-28 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-lg lg:hidden">
                {mobileBottomLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.end}
                        className={({ isActive }) =>
                            `flex min-h-[62px] flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                                isActive
                                    ? 'text-blue-600 bg-blue-50/70 border-t-2 border-blue-600'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`
                        }
                    >
                        <Icon name={link.icon} size={18} />
                        {link.short}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default StudentLayout;

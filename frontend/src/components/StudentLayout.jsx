import { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import Icon from './Icon';
import BrandLogo from './BrandLogo';
import NotificationBell from './NotificationBell';

const StudentLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const links = [
        { label: 'මුල් පිටුව', short: 'Home', path: '/student', end: true, icon: 'home' },
        { label: 'ප්‍රතිඵල', short: 'Results', path: '/student/results', icon: 'marks' },
        { label: 'පැමිණීම', short: 'Attendance', path: '/student/attendance', icon: 'attendance' },
        { label: 'ගෙවීම්', short: 'Fees', path: '/student/fees', icon: 'fees' },
        { label: 'මගේ ගිණුම', short: 'Profile', path: '/student/profile', icon: 'user' },
    ];

    return (
        <div className="student-background min-h-screen text-slate-900 bg-[#f6f8fc]">
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 text-slate-800 shadow-xs backdrop-blur-md">
                <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <BrandLogo size="md" />
                        <div>
                            <p className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900">Maths By HG Kavinda</p>
                        </div>
                    </div>
                    <nav className="hidden items-center gap-1 lg:flex">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
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
                    <div className="flex items-center gap-2 sm:gap-3">
                        <NotificationBell />
                        <NavLink
                            to="/student/profile"
                            className={({ isActive }) =>
                                `hidden items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-xs md:flex ${
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
                            className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 md:flex"
                        >
                            <Icon name="logout" size={15} />
                            Logout
                        </button>
                        <button
                            aria-label="Open menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                        >
                            <Icon name={menuOpen ? 'close' : 'menu'} />
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <nav className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 shadow-lg lg:hidden animate-fade-in">
                        <div className="pb-2 mb-2 border-b border-slate-100 md:hidden">
                            <p className="text-xs font-bold text-slate-900">{user?.fullName}</p>
                            <p className="text-[11px] font-mono font-semibold text-blue-600">{user?.studentId}</p>
                        </div>
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={link.end}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold ${
                                        isActive
                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                            : 'text-slate-700 hover:bg-slate-50'
                                    }`
                                }
                            >
                                <Icon name={link.icon} size={17} />
                                {link.label}
                            </NavLink>
                        ))}
                        <button
                            onClick={logout}
                            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50"
                        >
                            <Icon name="logout" size={17} />
                            Logout
                        </button>
                    </nav>
                )}
            </header>
            <main className="mx-auto max-w-6xl p-4 pb-28 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white/95 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] backdrop-blur-lg lg:hidden">
                {links.map((link) => (
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

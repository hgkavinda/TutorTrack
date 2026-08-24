import { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import Icon from './Icon';

const StudentLayout = () => {
    const { user, logout } = useContext(AuthContext);
    const [menuOpen, setMenuOpen] = useState(false);
    const links = [
        { label: 'මුල් පිටුව', short: 'Home', path: '/student', end: true, icon: 'home' },
        { label: 'ප්‍රතිඵල', short: 'Results', path: '/student/results', icon: 'marks' },
        { label: 'පැමිණීම', short: 'Attendance', path: '/student/attendance', icon: 'attendance' },
        { label: 'ගෙවීම්', short: 'Fees', path: '/student/fees', icon: 'fees' },
    ];

    return (
        <div className="student-background min-h-screen text-slate-900">
            <header className="sticky top-0 z-30 border-b border-cyan-300/30 bg-[#023eba]/95 text-white shadow-[0_6px_24px_rgba(2,6,23,0.35)] backdrop-blur">
                <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
                            <img src="/hgk-mathematics-monogram.png" alt="HGK Mathematics logo" className="h-full w-full scale-[1.55] object-contain" />
                        </div>
                        <p className="text-[17px] font-extrabold tracking-tight text-white">Maths By HG Kavinda</p>
                    </div>
                    <nav className="hidden items-center gap-1 lg:flex">
                        {links.map((link) => (
                            <NavLink key={link.path} to={link.path} end={link.end} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-white text-[#023eba] shadow-sm' : 'text-cyan-100 hover:bg-white/10 hover:text-white'}`}>
                                <Icon name={link.icon} size={17} />{link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right md:block">
                            <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                            <p className="text-xs text-cyan-100">{user?.studentId}</p>
                        </div>
                        <button onClick={logout} className="hidden items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 md:flex"><Icon name="logout" size={16} />Logout</button>
                        <button aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-white/25 bg-white/10 p-2.5 text-white lg:hidden"><Icon name={menuOpen ? 'close' : 'menu'} /></button>
                    </div>
                </div>
                {menuOpen && (
                    <nav className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
                        {links.map((link) => (
                            <NavLink key={link.path} to={link.path} end={link.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                                <Icon name={link.icon} size={18} />{link.label}
                            </NavLink>
                        ))}
                        <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"><Icon name="logout" size={18} />Logout</button>
                    </nav>
                )}
            </header>
            <main className="mx-auto max-w-6xl p-4 pb-24 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-slate-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.1)] lg:hidden">
                {links.map((link) => (
                    <NavLink key={link.path} to={link.path} end={link.end} className={({ isActive }) => `flex min-h-[68px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-bold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}>
                        <Icon name={link.icon} size={20} />{link.short}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default StudentLayout;

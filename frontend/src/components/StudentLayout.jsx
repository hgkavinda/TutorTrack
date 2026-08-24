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
        <div className="student-background min-h-screen text-slate-100">
            <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/45 text-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-md">
                <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-white/10 bg-white/5 shadow-sm backdrop-blur">
                            <img src="/hgk-mathematics-monogram.png" alt="HGK Mathematics logo" className="h-full w-full scale-[1.55] object-contain" />
                        </div>
                        <p className="text-[17px] font-extrabold tracking-tight text-white">Maths By HG Kavinda</p>
                    </div>
                    <nav className="hidden items-center gap-1.5 lg:flex">
                        {links.map((link) => (
                            <NavLink key={link.path} to={link.path} end={link.end} className={({ isActive }) => `flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-white/10 text-cyan-300 border border-white/10 shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
                                <Icon name={link.icon} size={17} />{link.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <div className="hidden text-right md:block">
                            <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                            <p className="text-xs text-slate-400">{user?.studentId}</p>
                        </div>
                        <button onClick={logout} className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 md:flex"><Icon name="logout" size={16} />Logout</button>
                        <button aria-label="Open menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white lg:hidden"><Icon name={menuOpen ? 'close' : 'menu'} /></button>
                    </div>
                </div>
                {menuOpen && (
                    <nav className="space-y-1 border-t border-white/10 bg-slate-950/95 px-4 py-3 lg:hidden animate-fade-in text-white">
                        {links.map((link) => (
                            <NavLink key={link.path} to={link.path} end={link.end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${isActive ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/25' : 'text-slate-300 hover:bg-white/5'}`}>
                                <Icon name={link.icon} size={18} />{link.label}
                            </NavLink>
                        ))}
                        <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5"><Icon name="logout" size={18} />Logout</button>
                    </nav>
                )}
            </header>
            <main className="mx-auto max-w-6xl p-4 pb-28 sm:p-6 lg:p-8">
                <Outlet />
            </main>
            <nav className="safe-bottom fixed inset-x-4 bottom-4 z-40 grid grid-cols-4 rounded-2xl border border-white/10 bg-slate-950/70 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-lg lg:hidden">
                {links.map((link) => (
                    <NavLink key={link.path} to={link.path} end={link.end} className={({ isActive }) => `flex min-h-[64px] flex-col items-center justify-center gap-1 px-1 text-[11px] font-bold transition-all ${isActive ? 'text-cyan-300 bg-white/5 rounded-2xl' : 'text-slate-400'}`}>
                        <Icon name={link.icon} size={20} />{link.short}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default StudentLayout;

import { useContext, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import Icon from './Icon';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Dashboard', path: '/', icon: 'home' },
        { name: 'Students', path: '/students', icon: 'students' },
        { name: 'Classes', path: '/classes', icon: 'classes' },
        { name: 'Attendance', path: '/attendance', icon: 'attendance' },
        { name: 'Materials', path: '/materials', icon: 'materials' },
        { name: 'Marks', path: '/marks', icon: 'marks' },
        { name: 'Fees', path: '/fees', icon: 'fees' },
        { name: 'Reports', path: '/reports', icon: 'reports' },
        { name: 'Announcements', path: '/announcements', icon: 'announce' },
    ];

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex h-screen bg-[#f6f8fc] text-slate-900">
            <aside className="hidden w-[272px] flex-col border-r border-slate-200/80 bg-white md:flex">
                <div className="border-b border-slate-200/80 p-6">
                    <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white shadow-sm">T</div><div><p className="text-xl font-extrabold tracking-tight">TutorTrack</p><p className="mt-0.5 text-[11px] font-semibold text-blue-600">ගුරු පාලක පුවරුව</p></div></div>
                </div>
                <nav className="flex-1 overflow-y-auto p-3">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end={link.path === '/'}
                            className={({ isActive }) =>
                                `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`
                            }
                        >
                            <Icon name={link.icon} size={19} />
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-slate-200 p-4">
                    <NavLink to="/profile" className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-blue-50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {user?.name?.charAt(0) || 'T'}
                        </div>
                        <div className="min-w-0 text-sm">
                            <p className="truncate font-bold">{user?.name}</p>
                            <p className="truncate text-xs text-slate-500">{user?.email}</p>
                        </div>
                    </NavLink>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex min-h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:justify-end md:px-8">
                    <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 md:hidden"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-base text-white">T</span>TutorTrack</div>

                    <div className="flex items-center gap-4">
                        <div className="hidden font-medium text-slate-600 md:block">Welcome, {user?.name}</div>
                        <button
                            onClick={handleLogout}
                            className="hidden items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 md:flex"
                        >
                            <Icon name="logout" size={16} />Logout
                        </button>
                        <button
                            aria-label="Open menu" className="rounded-xl border border-slate-200 p-2.5 text-slate-700 md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Icon name="menu" />
                        </button>
                    </div>
                </header>

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 flex bg-black/40 md:hidden">
                        <aside className="flex h-full w-72 flex-col bg-white shadow-2xl">
                            <div className="flex items-center justify-between border-b border-slate-200 p-4">
                                <span className="text-xl font-bold">Menu</span>
                                <button aria-label="Close menu" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl border border-slate-200 p-2 text-slate-700"><Icon name="close" size={18} /></button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-3">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        to={link.path}
                                        end={link.path === '/'}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'}`
                                        }
                                    >
                                        <Icon name={link.icon} size={19} />
                                        <span>{link.name}</span>
                                    </NavLink>
                                ))}
                            </nav>
                        </aside>
                        <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
                    </div>
                )}

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f6f8fc] p-4 pb-24 md:p-6 lg:p-8">
                    <Outlet />
                </main>
                <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-slate-200 bg-white shadow-[0_-4px_14px_rgba(15,23,42,0.08)] md:hidden">
                    {[
                        { name: 'Home', path: '/', icon: 'home' },
                        { name: 'Students', path: '/students', icon: 'students' },
                        { name: 'Attendance', path: '/attendance', icon: 'attendance' },
                        { name: 'Fees', path: '/fees', icon: 'fees' },
                    ].map((link) => <NavLink key={link.name} to={link.path} end={link.path === '/'} className={({ isActive }) => `flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}><Icon name={link.icon} size={19} />{link.name}</NavLink>)}
                    <button onClick={() => setIsMobileMenuOpen(true)} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-500"><Icon name="menu" size={19} />More</button>
                </nav>
            </div>
        </div>
    );
};

export default Layout;

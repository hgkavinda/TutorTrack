import { useContext, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValue';
import Icon from './Icon';
import BrandLogo from './BrandLogo';

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

    const avatarSrc = (user?.profilePhoto && user?.profilePhoto !== 'default.jpg') 
        ? user.profilePhoto 
        : '/teacher-photo.jpg';

    const formattedDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="flex h-screen bg-[#f8fafc] text-slate-900">
            <aside className="hidden w-[268px] flex-col border-r border-slate-200/80 bg-white md:flex">
                <div className="border-b border-slate-100 p-5">
                    <div className="flex items-center gap-3">
                        <BrandLogo size="md" />
                        <div className="min-w-0">
                            <p className="text-lg font-black tracking-tight text-slate-900">TutorTrack</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-[11px] font-semibold text-slate-500">ගුරු පාලක පුවරුව</p>
                            </div>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            end={link.path === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-bold'
                                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                                }`
                            }
                        >
                            <Icon name={link.icon} size={18} />
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="border-t border-slate-100 p-3.5">
                    <NavLink to="/profile" className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-100/80">
                        <div className="relative h-9 w-9 flex-shrink-0">
                            <img
                                src={avatarSrc}
                                alt={user?.name}
                                className="h-9 w-9 rounded-full object-cover object-top border-2 border-blue-200 shadow-sm"
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                            <div style={{ display: 'none' }} className="absolute inset-0 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                {user?.name?.charAt(0) || 'T'}
                            </div>
                        </div>
                        <div className="min-w-0 text-sm">
                            <p className="truncate font-bold text-slate-900">{user?.name || 'Admin Teacher'}</p>
                            <p className="truncate text-xs text-slate-500">{user?.email}</p>
                        </div>
                    </NavLink>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <header className="flex min-h-[68px] items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md md:px-8">
                    <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900 md:hidden">
                        <BrandLogo size="sm" />
                        <span>TutorTrack</span>
                    </div>

                    <div className="hidden md:flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <span>📅</span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NavLink to="/profile" className="hidden items-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 py-1.5 pl-2 pr-3 transition hover:bg-slate-100 md:flex">
                            <img
                                src={avatarSrc}
                                alt={user?.name}
                                className="h-7 w-7 rounded-full object-cover object-top border border-blue-300"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="text-xs font-bold text-slate-700">{user?.name || 'Teacher'}</span>
                            <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">Online</span>
                        </NavLink>
                        <button
                            onClick={handleLogout}
                            className="hidden items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 md:flex active:scale-95"
                        >
                            <Icon name="logout" size={15} />Logout
                        </button>
                        <button
                            aria-label="Open menu" className="rounded-xl border border-slate-200 p-2 text-slate-700 md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Icon name="menu" />
                        </button>
                    </div>
                </header>

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-xs md:hidden">
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

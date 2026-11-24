import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import Icon from './Icon';

const STORAGE_KEY = 'tutortrack_read_announcements';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [readIds, setReadIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/student-portal/notifications');
            if (res.data?.success) {
                setNotifications(res.data.data || []);
            }
        } catch {
            // Silently handle if not on student portal
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Periodically check every 60 seconds
        const timer = setInterval(fetchNotifications, 60000);
        return () => clearInterval(timer);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const unreadCount = notifications.filter((n) => !readIds.includes(n._id)).length;

    const handleMarkAllRead = () => {
        const allIds = notifications.map((n) => n._id);
        const updated = Array.from(new Set([...readIds, ...allIds]));
        setReadIds(updated);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {}
    };

    const handleItemClick = (id) => {
        if (!readIds.includes(id)) {
            const updated = [...readIds, id];
            setReadIds(updated);
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            } catch {}
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="View announcements"
                aria-expanded={isOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-blue-600 active:scale-95"
            >
                <Icon name="bell" size={19} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white shadow-xs animate-pulse ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-2xs sm:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="fixed inset-x-3 top-[72px] z-50 max-h-[82vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[520px] animate-fade-in flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                                <Icon name="bell" size={15} />
                            </span>
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-900 leading-none">පන්ති නිවේදන</h3>
                                <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Teacher Announcements</p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition"
                            >
                                සියල්ල කියවූ ලෙස ලකුණු කරන්න
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-xs font-semibold text-slate-400">
                                නිවේදන ලබාගනිමින් පවතී...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 mb-3">
                                    <Icon name="bell" size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-700">දැනට අලුත් නිවේදන නොමැත</p>
                                <p className="text-xs text-slate-400 mt-1">සර් විසින් පළ කරන පන්ති නිවේදන මෙහි දිස්වේ.</p>
                            </div>
                        ) : (
                            notifications.map((ann) => {
                                const isUnread = !readIds.includes(ann._id);
                                return (
                                    <div
                                        key={ann._id}
                                        onClick={() => handleItemClick(ann._id)}
                                        className={`p-4 transition cursor-pointer hover:bg-slate-50/80 ${
                                            isUnread ? 'bg-blue-50/40' : 'bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {isUnread && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-0.5" />
                                                )}
                                                <h4 className={`text-sm tracking-tight leading-snug ${isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-800'}`}>
                                                    {ann.title}
                                                </h4>
                                            </div>
                                            <span className="shrink-0 text-[10px] font-mono font-bold text-slate-400">
                                                {new Date(ann.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>

                                        <p className="mt-1.5 text-xs text-slate-600 font-medium leading-relaxed pl-4">
                                            {ann.message}
                                        </p>

                                        <div className="mt-2.5 flex items-center gap-2 pl-4">
                                            <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                                                {ann.targetClass?.className || 'සියලුම පන්ති (All Classes)'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-2.5 text-center">
                            <span className="text-[11px] font-semibold text-slate-500">
                                මුළු නිවේදන {notifications.length} ක් ඇත
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;

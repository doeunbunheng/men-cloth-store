// src/components/layout/Topbar.jsx
// Slim white topbar with page title (auto) and a user dropdown.

import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';
import {
    BellIcon, ChevronDownIcon, UserIcon, SettingsIcon, LogoutIcon,
} from '../common/Icons';

const ROLE_COLORS = {
    Admin:    { bg: '#ede9fe', color: '#5b21b6' },
    Sale:     { bg: '#e0f2fe', color: '#0369a1' },
    Customer: { bg: '#f0fdf4', color: '#15803d' },
};

// Map URL path -> human-readable page title
const titleFor = (pathname) => {
    const map = {
        '/admin':           'Dashboard',
        '/admin/products':  'Products',
        '/admin/orders':    'Orders',
        '/admin/customers': 'Customers',
        '/admin/users':     'Users',
        '/admin/reports':   'Reports',
        '/admin/backup':    'Backup',
        '/admin/low-stock': 'Low Stock',
    };
    return map[pathname] || 'Dashboard';
};

const s = {
    topbar: {
        height: 60,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: 600,
        color: '#0f172a',
    },
    rightGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    iconBtn: {
        background: 'transparent',
        border: 'none',
        padding: 8,
        borderRadius: 8,
        cursor: 'pointer',
        color: '#475569',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notifDot: {
        position: 'absolute',
        top: 7,
        right: 7,
        width: 8,
        height: 8,
        background: '#ef4444',
        borderRadius: '50%',
        border: '2px solid #fff',
    },
    userBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 8px 6px 6px',
        border: '1px solid #e5e7eb',
        borderRadius: 999,
        background: '#fff',
        cursor: 'pointer',
        marginLeft: 8,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userMeta: {
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        lineHeight: 1.2,
    },
    userName: { fontSize: 13, fontWeight: 600, color: '#0f172a' },
    userRole: { fontSize: 11, color: '#64748b' },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 10px 25px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)',
        minWidth: 240,
        padding: 6,
        zIndex: 50,
    },
    dropdownHeader: {
        padding: '12px 12px 10px',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: 4,
    },
    dropHeaderName: { fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 },
    badge: {
        display: 'inline-block',
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 999,
        fontWeight: 600,
        marginTop: 4,
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        fontSize: 13,
        color: '#334155',
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
    },
    divider: { height: 1, background: '#f1f5f9', margin: '4px 0' },
    danger: { color: '#dc2626' },
    userWrap: { position: 'relative' },
};

export default function Topbar() {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser() || { username: 'Guest', role: 'Customer' };
    const role = ROLE_COLORS[user.role] || ROLE_COLORS.Customer;

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = (user.username || 'U').slice(0, 2).toUpperCase();

    return (
        <header style={s.topbar}>
            <div style={s.title}>{titleFor(location.pathname)}</div>

            <div style={s.rightGroup}>
                <button style={s.iconBtn} aria-label="Notifications">
                    <BellIcon />
                    <span style={s.notifDot} />
                </button>

                <div style={s.userWrap} ref={ref}>
                    <button style={s.userBtn} onClick={() => setOpen(!open)}>
                        <div style={s.avatar}>{initials}</div>
                        <div style={s.userMeta}>
                            <span style={s.userName}>{user.username}</span>
                            <span style={s.userRole}>{user.role}</span>
                        </div>
                        <ChevronDownIcon width={14} height={14} />
                    </button>

                    {open && (
                        <div style={s.dropdown}>
                            <div style={s.dropdownHeader}>
                                <div style={s.dropHeaderName}>{user.username}</div>
                                <span style={{ ...s.badge, background: role.bg, color: role.color }}>
                                    {user.role}
                                </span>
                            </div>

                            <button
                                style={s.dropdownItem}
                                onClick={() => { setOpen(false); navigate('/admin/profile'); }}
                            >
                                <UserIcon width={16} height={16} />
                                <span>Profile</span>
                            </button>
                            <button
                                style={s.dropdownItem}
                                onClick={() => { setOpen(false); navigate('/admin/settings'); }}
                            >
                                <SettingsIcon width={16} height={16} />
                                <span>Settings</span>
                            </button>

                            <div style={s.divider} />

                            <button
                                style={{ ...s.dropdownItem, ...s.danger }}
                                onClick={handleLogout}
                            >
                                <LogoutIcon width={16} height={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

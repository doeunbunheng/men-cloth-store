// src/components/Navbar.jsx
// Refreshed horizontal navbar — keeps your exact role-based logic & localStorage usage.
// No external auth helper needed.

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const NAV_BG          = '#0f172a';
const NAV_BORDER      = '#1e293b';
const NAV_TEXT        = '#cbd5e1';
const NAV_TEXT_ACTIVE = '#ffffff';
const ACCENT          = '#6366f1';

const s = {
    nav: {
        background: NAV_BG,
        borderBottom: `1px solid ${NAV_BORDER}`,
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 62,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'sticky',
        top: 0,
        zIndex: 50,
    },
    logoWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        marginRight: 24,
        flexShrink: 0,
    },
    logoIcon: {
        width: 32,
        height: 32,
        background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
    },
    logoText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '-0.01em',
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    navGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: 2,
    },
    divider: {
        width: 1,
        height: 22,
        background: NAV_BORDER,
        margin: '0 14px',
    },
    link: ({ isActive }) => ({
        padding: '8px 14px',
        fontSize: 14,
        color: isActive ? NAV_TEXT_ACTIVE : NAV_TEXT,
        background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
        borderRadius: 8,
        textDecoration: 'none',
        fontWeight: isActive ? 500 : 400,
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
    }),
    spacer: { flex: 1 },
    userWrap: { position: 'relative', flexShrink: 0 },
    userBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '5px 12px 5px 5px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${NAV_BORDER}`,
        borderRadius: 999,
        cursor: 'pointer',
        color: '#fff',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
        color: '#fff',
        fontSize: 11,
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
    userName: { fontSize: 13, fontWeight: 600 },
    userRole: {
        fontSize: 10,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        marginTop: 1,
    },
    chevron: { marginLeft: 4, opacity: 0.5 },
    dropdown: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
        minWidth: 220,
        padding: 6,
        zIndex: 60,
    },
    dropdownHeader: {
        padding: '12px 12px 10px',
        borderBottom: '1px solid #f1f5f9',
        marginBottom: 4,
    },
    dropHeaderName: { fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 4 },
    badge: {
        display: 'inline-block',
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 999,
        fontWeight: 600,
        background: '#ede9fe',
        color: '#5b21b6',
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
};

export default function Navbar() {
    const navigate = useNavigate();
    const role     = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ===== Not logged in =====
    if (!role) {
        return (
            <nav style={s.nav}>
                <Link to="/" style={s.logoWrap}>
                    <div style={s.logoIcon}>M</div>
                    <div style={s.logoText}>Men's Store</div>
                </Link>
                <div style={s.spacer} />
                <div style={s.navGroup}>
                    <NavLink to="/login"    style={s.link}>Login</NavLink>
                    <NavLink to="/register" style={s.link}>Register</NavLink>
                </div>
            </nav>
        );
    }

    // ===== Logged in =====
    const initials = (username || 'U').slice(0, 2).toUpperCase();

    return (
        <nav style={s.nav}>
            {/* Brand */}
            <Link to="/" style={s.logoWrap}>
                <div style={s.logoIcon}>M</div>
                <div style={s.logoText}>Men's Store</div>
            </Link>

            {/* Nav links */}
            <div style={s.links}>
                {/* Shop / Sales group */}
                <div style={s.navGroup}>
                    {['Customer','Sale','Admin'].includes(role) &&
                        <NavLink to="/products" style={s.link}>Products</NavLink>}

                    {role === 'Customer' &&
                        <NavLink to="/my-orders" style={s.link}>My Orders</NavLink>}

                    {['Sale','Admin'].includes(role) && <>
                        <NavLink to="/sale"            style={s.link}>Sales</NavLink>
                        <NavLink to="/sale/new-order"  style={s.link}>New Order</NavLink>
                        <NavLink to="/admin/low-stock" style={s.link}>Stock</NavLink>
                    </>}
                </div>

                {/* Admin-only group with divider */}
                {role === 'Admin' && <>
                    <div style={s.divider} />
                    <div style={s.navGroup}>
                        <NavLink to="/admin"          end style={s.link}>Dashboard</NavLink>
                        <NavLink to="/admin/users"        style={s.link}>Users</NavLink>
                        <NavLink to="/admin/products"     style={s.link}>Product Management</NavLink>
                        <NavLink to="/admin/backup"       style={s.link}>Backup</NavLink>
                    </div>
                </>}
            </div>

            {/* User menu (avatar + dropdown) */}
            <div style={s.userWrap} ref={ref}>
                <button style={s.userBtn} onClick={() => setOpen(!open)}>
                    <div style={s.avatar}>{initials}</div>
                    <div style={s.userMeta}>
                        <span style={s.userName}>{username}</span>
                        <span style={s.userRole}>{role}</span>
                    </div>
                    <svg style={s.chevron} width="14" height="14" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2.5"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {open && (
                    <div style={s.dropdown}>
                        <div style={s.dropdownHeader}>
                            <div style={s.dropHeaderName}>{username}</div>
                            <span style={s.badge}>{role}</span>
                        </div>
                        <button
                            style={{ ...s.dropdownItem, color: '#dc2626' }}
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
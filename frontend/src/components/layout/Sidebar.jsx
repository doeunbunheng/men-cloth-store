// src/components/layout/Sidebar.jsx
// Dark sidebar with sectioned navigation. Uses NavLink for active highlighting.

import { NavLink } from 'react-router-dom';
import {
    DashboardIcon, ProductsIcon, OrdersIcon, CustomersIcon,
    UsersIcon, ReportsIcon, BackupIcon,
} from '../common/Icons';

const SIDEBAR_BG = '#0f172a';
const ACTIVE_BG  = '#1e293b';
const INACTIVE   = '#94a3b8';
const ACTIVE_TXT = '#fff';
const ACCENT     = '#6366f1';

const s = {
    sidebar: {
        width: 240,
        height: '100vh',
        background: SIDEBAR_BG,
        color: INACTIVE,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 20,
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '20px 20px',
        borderBottom: '1px solid #1e293b',
    },
    logoIcon: {
        width: 32,
        height: 32,
        background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6)`,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 15,
        fontWeight: 700,
        color: '#fff',
    },
    logoText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '-0.01em',
    },
    nav: {
        flex: 1,
        padding: '18px 12px',
        overflowY: 'auto',
    },
    section: { marginBottom: 24 },
    sectionLabel: {
        fontSize: 11,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        padding: '0 12px',
        marginBottom: 8,
        fontWeight: 600,
    },
    link: ({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        fontSize: 14,
        color: isActive ? ACTIVE_TXT : INACTIVE,
        background: isActive ? ACTIVE_BG : 'transparent',
        borderRadius: 8,
        textDecoration: 'none',
        marginBottom: 2,
        position: 'relative',
        fontWeight: isActive ? 500 : 400,
        transition: 'all 0.15s',
    }),
    activeAccent: {
        position: 'absolute',
        left: 0,
        top: 8,
        bottom: 8,
        width: 3,
        background: ACCENT,
        borderRadius: '0 3px 3px 0',
    },
    footer: {
        padding: '14px 20px',
        borderTop: '1px solid #1e293b',
        fontSize: 11,
        color: '#475569',
    },
};

const NavItem = ({ to, icon: Icon, label, end }) => (
    <NavLink to={to} end={end} style={s.link}>
        {({ isActive }) => (
            <>
                {isActive && <span style={s.activeAccent} />}
                <Icon />
                <span>{label}</span>
            </>
        )}
    </NavLink>
);

export default function Sidebar() {
    return (
        <aside style={s.sidebar}>
            <div style={s.logo}>
                <div style={s.logoIcon}>M</div>
                <div style={s.logoText}>Men's Store</div>
            </div>

            <nav style={s.nav}>
                <div style={s.section}>
                    <div style={s.sectionLabel}>Main</div>
                    <NavItem to="/admin"           icon={DashboardIcon} label="Dashboard" end />
                    <NavItem to="/admin/products"  icon={ProductsIcon}  label="Products"  />
                    <NavItem to="/admin/orders"    icon={OrdersIcon}    label="Orders"    />
                    <NavItem to="/admin/customers" icon={CustomersIcon} label="Customers" />
                </div>

                <div style={s.section}>
                    <div style={s.sectionLabel}>Administration</div>
                    <NavItem to="/admin/users"   icon={UsersIcon}   label="Users"   />
                    <NavItem to="/admin/reports" icon={ReportsIcon} label="Reports" />
                    <NavItem to="/admin/backup"  icon={BackupIcon}  label="Backup"  />
                </div>
            </nav>

            <div style={s.footer}>
                v1.0.0 · Oracle 21c XE
            </div>
        </aside>
    );
}

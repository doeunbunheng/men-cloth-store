import { Link, useNavigate } from 'react-router-dom';

const styles = {
    nav:  { background: '#1a1a2e', padding: '0 24px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between', height: 56 },
    logo: { color: '#e2e2e2', fontWeight: 600, fontSize: 18, textDecoration: 'none' },
    links:{ display: 'flex', gap: 8, alignItems: 'center' },
    link: { color: '#b0b0c0', textDecoration: 'none', padding: '6px 12px',
            borderRadius: 6, fontSize: 14 },
    badge:{ background: '#4f46e5', color: '#fff', borderRadius: 12,
            padding: '2px 10px', fontSize: 12, marginRight: 8 },
    btn:  { background: 'transparent', border: '1px solid #555', color: '#b0b0c0',
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 14 },
};

export default function Navbar() {
    const navigate  = useNavigate();
    const role      = localStorage.getItem('role');
    const username  = localStorage.getItem('username');

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (!role) return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>👔 Men's Store</Link>
            <div style={styles.links}>
                <Link to="/login"    style={styles.link}>Login</Link>
                <Link to="/register" style={styles.link}>Register</Link>
            </div>
        </nav>
    );

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>👔 Men's Store</Link>
            <div style={styles.links}>
                {/* Customer links */}
                {['Customer','Sale','Admin'].includes(role) &&
                    <Link to="/products" style={styles.link}>Products</Link>}
                {role === 'Customer' &&
                    <Link to="/my-orders" style={styles.link}>My Orders</Link>}

                {/* Sale links */}
                {['Sale','Admin'].includes(role) && <>
                    <Link to="/sale" style={styles.link}>Sales</Link>
                    <Link to="/sale/new-order" style={styles.link}>New Order</Link>
                    <Link to="/admin/low-stock" style={styles.link}> Stock</Link>
                </>}

                {/* Admin links */}
                {role === 'Admin' && <>
                    <Link to="/admin" style={styles.link}>Dashboard</Link>
                    <Link to="/admin/users" style={styles.link}>Users</Link>
                    <Link to="/admin/products" style={styles.link}>Products</Link>
                    <Link to="/admin/backup"   style={styles.link}> Backup</Link>
                </>}

                <span style={styles.badge}>{role}</span>
                <span style={{ color: '#b0b0c0', fontSize: 13 }}>{username}</span>
                <button style={styles.btn} onClick={logout}>Logout</button>
            </div>
        </nav>
    );
}
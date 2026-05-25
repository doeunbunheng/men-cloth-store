import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, getSalesLog, getUsers, getProducts } from '../../api';

const s = {
    h1:   { fontSize: 24, fontWeight: 600, color: '#111', marginBottom: 6 },
    sub:  { fontSize: 14, color: '#6b7280', marginBottom: 28 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 },
    stat: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '18px 16px' },
    num:  { fontSize: 28, fontWeight: 700, color: '#4f46e5' },
    lbl:  { fontSize: 13, color: '#6b7280', marginTop: 4 },
    row:  { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 },
    card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 },
    ctitle:{ fontSize: 15, fontWeight: 600, color: '#111', marginBottom: 14 },
    table:{ width: '100%', borderCollapse: 'collapse' },
    th:   { textAlign: 'left', padding: '10px 12px', background: '#f9fafb',
            fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' },
    td:   { padding: '10px 12px', fontSize: 13, color: '#374151',
            borderTop: '1px solid #f3f4f6' },
    navbtn:{ padding: '10px 18px', background: '#4f46e5', color: '#fff',
             border: 'none', borderRadius: 8, fontWeight: 500, cursor: 'pointer',
             marginRight: 10, marginBottom: 20, fontSize: 14 },
    badge:{ display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 500 },
};

const ROLE_COLORS = {
    Admin:    { bg: '#ede9fe', color: '#5b21b6' },
    Sale:     { bg: '#e0f2fe', color: '#0369a1' },
    Customer: { bg: '#f0fdf4', color: '#15803d' },
};

export default function AdminDashboard() {
    const [orders,  setOrders]  = useState([]);
    const [logs,    setLogs]    = useState([]);
    const [users,   setUsers]   = useState([]);
    const [products,setProducts]= useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getOrders().then(r   => setOrders(r.data));
        getSalesLog().then(r => setLogs(r.data));
        getUsers().then(r    => setUsers(r.data));
        getProducts().then(r => setProducts(r.data));
    }, []);

    const totalRev = orders
        .filter(o => o.STATUS !== 'Cancelled')
        .reduce((s, o) => s + (o.TOTAL_AMOUNT || 0), 0)
    const cancelCount = orders.filter(o => o.STATUS === 'Cancelled').length;
    const lowStock  = products.filter(p => p.STOCK_QTY < 10).length;

    return (
        <div>
            <h1 style={s.h1}>Admin Dashboard</h1>
            <p style={s.sub}>Full overview of the Men's Clothing Store</p>

            {/* Quick nav */}
            <button style={s.navbtn} onClick={() => navigate('/admin/users')}>
                Manage Users
            </button>
            <button style={s.navbtn} onClick={() => navigate('/admin/products')}>
                Manage Products
            </button>
            <button style={{ ...s.navbtn, background: '#059669' }} onClick={() => navigate('/sale/new-order')}>
                + New Order
            </button>
            <button style={s.navbtn} onClick={() => navigate('/admin/backup')}>
                🗄️ Backup DB
            </button>

            {/* Stats */}
            <div style={s.grid}>
                <div style={s.stat}><div style={s.num}>{orders.length}</div><div style={s.lbl}>Total orders</div></div>
                <div style={s.stat}><div style={s.num}>{users.length}</div><div style={s.lbl}>Registered users</div></div>
                <div style={s.stat}>
    <div style={s.num}>${totalRev.toFixed(2)}</div>
    <div style={s.lbl}>Total revenue</div>
    {cancelCount > 0 && (
        <div style={{ fontSize:11, color:'#dc2626', marginTop:4 }}>
            {cancelCount} cancelled order{cancelCount>1?'s':''} excluded
        </div>
    )}
</div>
                <div style={{ ...s.stat, cursor: lowStock > 0 ? 'pointer' : 'default',
              border: lowStock > 0 ? '1px solid #fecaca' : '1px solid #e5e7eb' }}
     onClick={() => lowStock > 0 && navigate('/admin/low-stock')}>
    <div style={{ ...s.num, color: lowStock > 0 ? '#dc2626' : '#4f46e5' }}>
        {lowStock}
    </div>
    <div style={s.lbl}>Low stock items</div>
    {lowStock > 0 && (
        <div style={{ fontSize:11, color:'#dc2626', marginTop:4 }}>
            Click to view →
        </div>
    )}
</div>
            </div>

            <div style={s.row}>
                {/* Recent orders */}
                <div style={s.card}>
                    <div style={s.ctitle}>Recent Orders</div>
                    <table style={s.table}>
                        <thead><tr>
                            <th style={s.th}>ID</th>
                            <th style={s.th}>Customer</th>
                            <th style={s.th}>Total</th>
                            <th style={s.th}>Status</th>
                        </tr></thead>
                        <tbody>
                            {orders.slice(0, 8).map(o => (
                                <tr key={o.ORDER_ID}>
                                    <td style={s.td}>#{o.ORDER_ID}</td>
                                    <td style={s.td}>{o.CUSTOMER_NAME}</td>
                                    <td style={s.td}>${o.TOTAL_AMOUNT ?? '—'}</td>
                                    <td style={s.td}>{o.STATUS}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sales log from Oracle trigger */}
                <div style={s.card}>
                    <div style={s.ctitle}>
                        Sales Log
                        <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8, fontWeight: 400 }}>
                            (auto by Oracle trigger)
                        </span>
                    </div>
                    <table style={s.table}>
                        <thead><tr>
                            <th style={s.th}>Order</th>
                            <th style={s.th}>Staff</th>
                            <th style={s.th}>Action</th>
                            <th style={s.th}>Date</th>
                        </tr></thead>
                        <tbody>
                            {logs.slice(0, 8).map(l => (
                                <tr key={l.LOG_ID}>
                                    <td style={s.td}>#{l.ORDER_ID}</td>
                                    <td style={s.td}>{l.USERNAME || '—'}</td>
                                    <td style={s.td}>{l.ACTION}</td>
                                    <td style={s.td}>{new Date(l.LOG_DATE).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users quick view */}
            <div style={s.card}>
                <div style={s.ctitle}>Users by Role</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {users.slice(0, 12).map(u => {
                        const rc = ROLE_COLORS[u.ROLE] || ROLE_COLORS.Customer;
                        return (
                            <div key={u.USER_ID} style={{ display: 'flex', alignItems: 'center',
                                gap: 8, padding: '8px 14px', border: '1px solid #e5e7eb',
                                borderRadius: 8, fontSize: 13 }}>
                                <span>{u.USERNAME}</span>
                                <span style={{ ...s.badge, background: rc.bg, color: rc.color }}>{u.ROLE}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
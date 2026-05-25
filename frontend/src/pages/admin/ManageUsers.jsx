import { useEffect, useState } from 'react';
import { getUsers, updateRole, deleteUser } from '../../api';

const ROLES = ['Admin', 'Sale', 'Customer'];
const ROLE_COLORS = {
    Admin:    { bg: '#ede9fe', color: '#5b21b6' },
    Sale:     { bg: '#e0f2fe', color: '#0369a1' },
    Customer: { bg: '#f0fdf4', color: '#15803d' },
};

const s = {
    h1:    { fontSize: 24, fontWeight: 600, color: '#111', marginBottom: 6 },
    sub:   { fontSize: 14, color: '#6b7280', marginBottom: 24 },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff',
             border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' },
    th:    { textAlign: 'left', padding: '12px 16px', background: '#f9fafb',
             fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' },
    td:    { padding: '12px 16px', fontSize: 14, color: '#374151',
             borderTop: '1px solid #f3f4f6' },
    badge: { display: 'inline-block', fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 },
    sel:   { padding: '5px 10px', border: '1px solid #d1d5db', borderRadius: 6,
             fontSize: 13, cursor: 'pointer' },
    delbtn:{ padding: '5px 12px', background: '#fef2f2', color: '#b91c1c',
             border: '1px solid #fca5a5', borderRadius: 6, cursor: 'pointer', fontSize: 12 },
    ok:    { background: '#f0fdf4', color: '#15803d', padding: '10px 14px',
             borderRadius: 8, fontSize: 13, marginBottom: 16 },
    err:   { background: '#fef2f2', color: '#b91c1c', padding: '10px 14px',
             borderRadius: 8, fontSize: 13, marginBottom: 16 },
    search:{ padding: '9px 14px', border: '1px solid #d1d5db', borderRadius: 8,
             fontSize: 14, width: 260, marginBottom: 20, outline: 'none' },
};

export default function ManageUsers() {
    const [users,   setUsers]   = useState([]);
    const [search,  setSearch]  = useState('');
    const [msg,     setMsg]     = useState('');
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(true);
    const myId = parseInt(localStorage.getItem('user_id'));

    const load = () => {
        setLoading(true);
        getUsers().then(r => setUsers(r.data)).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        setMsg(''); setError('');
        try {
            await updateRole(userId, newRole);
            setMsg(`Role updated to ${newRole}`);
            load();
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to update role');
        }
    };

    const handleDelete = async (userId, username) => {
        if (!window.confirm(`Delete user "${username}"?`)) return;
        setMsg(''); setError('');
        try {
            await deleteUser(userId);
            setMsg(`User "${username}" deleted`);
            load();
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to delete user');
        }
    };

    const filtered = users.filter(u =>
        u.USERNAME?.toLowerCase().includes(search.toLowerCase()) ||
        u.ROLE?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h1 style={s.h1}>Manage Users</h1>
            <p style={s.sub}>{users.length} registered users — Admin can create, delete and set roles</p>

            {msg   && <div style={s.ok}>{msg}</div>}
            {error && <div style={s.err}>{error}</div>}

            <input style={s.search} placeholder="Search username or role..."
                value={search} onChange={e => setSearch(e.target.value)} />

            {loading ? <p style={{ color: '#6b7280' }}>Loading users...</p> : (
                <table style={s.table}>
                    <thead>
                        <tr>
                            <th style={s.th}>ID</th>
                            <th style={s.th}>Username</th>
                            <th style={s.th}>Current role</th>
                            <th style={s.th}>Registered</th>
                            <th style={s.th}>Change role</th>
                            <th style={s.th}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => {
                            const rc = ROLE_COLORS[u.ROLE] || ROLE_COLORS.Customer;
                            const isMe = u.USER_ID === myId;
                            return (
                                <tr key={u.USER_ID}>
                                    <td style={s.td}>{u.USER_ID}</td>
                                    <td style={s.td}>
                                        <span style={{ fontWeight: 500 }}>{u.USERNAME}</span>
                                        {isMe && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>(you)</span>}
                                    </td>
                                    <td style={s.td}>
                                        <span style={{ ...s.badge, background: rc.bg, color: rc.color }}>
                                            {u.ROLE}
                                        </span>
                                    </td>
                                    <td style={s.td}>
                                        {u.CREATED_DATE
                                            ? new Date(u.CREATED_DATE).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td style={s.td}>
                                        <select style={s.sel} value={u.ROLE}
                                            disabled={isMe}
                                            onChange={e => handleRoleChange(u.USER_ID, e.target.value)}>
                                            {ROLES.map(r => <option key={r}>{r}</option>)}
                                        </select>
                                    </td>
                                    <td style={s.td}>
                                        <button style={s.delbtn}
                                            disabled={isMe}
                                            onClick={() => handleDelete(u.USER_ID, u.USERNAME)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
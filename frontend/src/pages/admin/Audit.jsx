import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../api'

const STATUS_STYLE = {
    Pending:   { bg:'#fffbeb', color:'#b45309', dot:'#f59e0b' },
    Confirmed: { bg:'#eff6ff', color:'#1d4ed8', dot:'#3b82f6' },
    Shipped:   { bg:'#ecfeff', color:'#0891b2', dot:'#06b6d4' },
    Completed: { bg:'#f0fdf4', color:'#15803d', dot:'#22c55e' },
    Cancelled: { bg:'#fef2f2', color:'#b91c1c', dot:'#ef4444' },
}

const imgSrc = url => url || null

// ── Order Detail Modal ────────────────────────────────────────
function OrderDetailModal({ order, onClose }) {
    const st = STATUS_STYLE[order.STATUS] || STATUS_STYLE.Pending
    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:1000, padding:16 }}
             onClick={onClose}>
            <div style={{ background:'#fff', borderRadius:20, maxWidth:720, width:'100%',
                          maxHeight:'88vh', overflow:'hidden', display:'flex',
                          flexDirection:'column', boxShadow:'0 32px 80px rgba(0,0,0,.3)' }}
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding:'20px 28px', background:'#0f172a',
                              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                        <div style={{ fontSize:17, fontWeight:700, color:'#fff' }}>
                            Order #{order.ORDER_ID} — Full Audit
                        </div>
                        <div style={{ fontSize:12, color:'#64748b', marginTop:3, display:'flex', gap:16 }}>
                            <span style={{ color:'#94a3b8' }}>👤 {order.CUSTOMER_NAME} ({order.CUSTOMER_PHONE||'—'})</span>
                            <span style={{ color:'#94a3b8' }}>
                                🧑‍💼 {order.STAFF_NAME
                                    ? <><b style={{ color:'#c7d2fe' }}>{order.STAFF_NAME}</b> processed this order</>
                                    : 'No staff action yet'}
                            </span>
                            <span style={{ color:'#94a3b8' }}>📅 {order.ORDER_DATE}</span>
                        </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <span style={{ fontSize:12, padding:'4px 12px', borderRadius:6, fontWeight:600,
                                       background:st.bg, color:st.color }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:st.dot,
                                           display:'inline-block', marginRight:6 }}/>
                            {order.STATUS}
                        </span>
                        <button onClick={onClose}
                            style={{ width:32, height:32, background:'rgba(255,255,255,.1)',
                                     border:'none', borderRadius:8, cursor:'pointer',
                                     fontSize:16, color:'#fff' }}>✕</button>
                    </div>
                </div>

                <div style={{ flex:1, overflow:'auto' }}>
                    {/* Products ordered */}
                    <div style={{ padding:'18px 28px 0' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#64748b',
                                      textTransform:'uppercase', letterSpacing:'.05em',
                                      marginBottom:12 }}>Products Ordered</div>

                        <div style={{ border:'1px solid #f1f5f9', borderRadius:12, overflow:'hidden' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 70px 80px 50px 90px',
                                          gap:12, padding:'9px 16px', background:'#f8fafc',
                                          fontSize:11, fontWeight:600, color:'#64748b',
                                          textTransform:'uppercase', letterSpacing:'.04em' }}>
                                <span>Product</span>
                                <span style={{ textAlign:'center' }}>Size</span>
                                <span style={{ textAlign:'center' }}>Color</span>
                                <span style={{ textAlign:'center' }}>Qty</span>
                                <span style={{ textAlign:'right' }}>Subtotal</span>
                            </div>
                            {(order.items||[]).map((item, idx) => (
                                <div key={idx}
                                    style={{ display:'grid', gridTemplateColumns:'1fr 70px 80px 50px 90px',
                                             gap:12, padding:'12px 16px', alignItems:'center',
                                             borderTop:'1px solid #f8fafc',
                                             background: idx%2===0?'#fff':'#fafafa' }}>
                                    <div>
                                        <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>
                                            {item.PRODUCT_NAME}
                                        </div>
                                        <div style={{ fontSize:11, color:'#94a3b8' }}>
                                            {item.CATEGORY} · ${item.UNIT_PRICE} each
                                        </div>
                                    </div>
                                    <div style={{ textAlign:'center' }}>
                                        {item.SELECTED_SIZE && item.SELECTED_SIZE!=='—'
                                            ? <span style={{ background:'#ede9fe', color:'#5b21b6', padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:600 }}>{item.SELECTED_SIZE}</span>
                                            : <span style={{ color:'#cbd5e1', fontSize:12 }}>—</span>}
                                    </div>
                                    <div style={{ textAlign:'center' }}>
                                        {item.SELECTED_COLOR && item.SELECTED_COLOR!=='—'
                                            ? <span style={{ background:'#f1f5f9', color:'#475569', padding:'2px 8px', borderRadius:6, fontSize:11 }}>{item.SELECTED_COLOR}</span>
                                            : <span style={{ color:'#cbd5e1', fontSize:12 }}>—</span>}
                                    </div>
                                    <div style={{ textAlign:'center', fontSize:13, fontWeight:700 }}>{item.QUANTITY}</div>
                                    <div style={{ textAlign:'right', fontSize:13, fontWeight:700, color:'#0f172a' }}>
                                        ${Number(item.SUBTOTAL).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            <div style={{ padding:'12px 16px', display:'flex', justifyContent:'space-between',
                                          borderTop:'2px solid #e2e8f0', background:'#fff' }}>
                                <span style={{ fontSize:13, color:'#64748b' }}>
                                    {(order.items||[]).length} product{(order.items||[]).length!==1?'s':''}
                                </span>
                                <span style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>
                                    Total: ${order.TOTAL_AMOUNT}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status history */}
                    {(order.logs||[]).length > 0 && (
                        <div style={{ padding:'18px 28px' }}>
                            <div style={{ fontSize:12, fontWeight:700, color:'#64748b',
                                          textTransform:'uppercase', letterSpacing:'.05em',
                                          marginBottom:12 }}>Status History (Oracle Trigger Log)</div>
                            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                {(order.logs||[]).map((log, idx) => (
                                    <div key={idx}
                                        style={{ display:'flex', alignItems:'center', gap:12,
                                                 padding:'10px 14px', background:'#f8fafc',
                                                 borderRadius:10, border:'1px solid #f1f5f9' }}>
                                        <div style={{ width:8, height:8, borderRadius:'50%',
                                                      background: log.ACTION?.includes('CANCEL')?'#ef4444'
                                                                : log.ACTION?.includes('COMPLETE')?'#22c55e'
                                                                : '#6366f1', flexShrink:0 }}/>
                                        <div style={{ flex:1 }}>
                                            <span style={{ fontSize:12, fontWeight:600, color:'#0f172a' }}>
                                                {log.ACTION?.replace('_',' ')}
                                            </span>
                                            {log.CHANGED_BY && (
                                                <span style={{ fontSize:11, color:'#64748b', marginLeft:8 }}>
                                                    by {log.CHANGED_BY}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize:11, color:'#94a3b8' }}>{log.LOG_DATE}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Main Audit Page ───────────────────────────────────────────
export default function Audit() {
    const [data,       setData]       = useState({ orders:[], staff:[] })
    const [loading,    setLoading]    = useState(true)
    const [search,     setSearch]     = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [staffFilter,  setStaffFilter]  = useState('All')
    const [activeTab,  setActiveTab]  = useState('orders')  // orders | staff
    const [viewOrder,  setViewOrder]  = useState(null)
    const navigate = useNavigate()
    const tableRef = useRef()

    useEffect(() => {
        API.get('/audit/').then(r => setData(r.data)).finally(() => setLoading(false))
    }, [])

    const allStaff = [...new Set(data.orders.map(o => o.STAFF_NAME).filter(Boolean))]

    const filtered = data.orders.filter(o => {
        const ms = o.CUSTOMER_NAME?.toLowerCase().includes(search.toLowerCase()) ||
                   o.STAFF_NAME?.toLowerCase().includes(search.toLowerCase()) ||
                   String(o.ORDER_ID).includes(search)
        const st = statusFilter === 'All' || o.STATUS === statusFilter
        const sf = staffFilter === 'All' || o.STAFF_NAME === staffFilter
        return ms && st && sf
    })

    const totalRevenue = data.orders
        .filter(o => o.STATUS !== 'Cancelled')
        .reduce((s,o) => s + (o.TOTAL_AMOUNT||0), 0)

    const exportCSV = () => {
        const headers = ['Order ID','Customer','Phone','Staff','Role','Date','Status','Amount']
        const rows = filtered.map(o => [
            o.ORDER_ID, o.CUSTOMER_NAME, o.CUSTOMER_PHONE||'',
            o.STAFF_NAME, o.STAFF_ROLE, o.ORDER_DATE, o.STATUS, o.TOTAL_AMOUNT
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type:'text/csv' })
        const url  = URL.createObjectURL(blob)
        const a    = document.createElement('a')
        a.href = url; a.download = `audit_${new Date().toISOString().slice(0,10)}.csv`
        a.click(); URL.revokeObjectURL(url)
    }

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      height:300, fontFamily:"'DM Sans',sans-serif", color:'#94a3b8' }}>
            Loading audit data...
        </div>
    )

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
                <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#94a3b8', textTransform:'uppercase',
                                  letterSpacing:'.08em', marginBottom:6 }}>Admin Only</div>
                    <h1 style={{ fontSize:26, fontWeight:800, color:'#0f172a', marginBottom:4 }}>
                        Sales Audit Report
                    </h1>
                    <p style={{ fontSize:14, color:'#64748b' }}>
                        Track every sale, staff activity and order history
                    </p>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                    <button onClick={exportCSV}
                        style={{ padding:'9px 18px', background:'#fff', color:'#0f172a',
                                 border:'1px solid #e2e8f0', borderRadius:10, cursor:'pointer',
                                 fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                        ⬇️ Export CSV
                    </button>
                    <button onClick={() => navigate('/admin')}
                        style={{ padding:'9px 18px', background:'#0f172a', color:'#fff',
                                 border:'none', borderRadius:10, cursor:'pointer',
                                 fontSize:13, fontWeight:600 }}>
                        ← Dashboard
                    </button>
                </div>
            </div>

            {/* Summary KPIs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
                {[
                    { label:'Total Orders',    value:data.orders.length,                                  sub:'all records' },
                    { label:'Total Revenue',   value:`$${totalRevenue.toFixed(0)}`,                       sub:'excl. cancelled' },
                    { label:'Staff Members',   value:data.staff.length,                                   sub:'with sales' },
                    { label:'Completed Rate',  value:`${data.orders.length ? Math.round(data.orders.filter(o=>o.STATUS==='Completed').length/data.orders.length*100) : 0}%`, sub:'of all orders' },
                ].map(s => (
                    <div key={s.label} style={{ background:'#fff', border:'1px solid #f1f5f9',
                                                borderRadius:14, padding:'18px 20px',
                                                borderLeft:'3px solid #0f172a' }}>
                        <div style={{ fontSize:26, fontWeight:800, color:'#0f172a', marginBottom:4 }}>{s.value}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', marginBottom:2 }}>{s.label}</div>
                        <div style={{ fontSize:11, color:'#94a3b8' }}>{s.sub}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:2, background:'#f8fafc', borderRadius:10,
                          padding:4, width:'fit-content', marginBottom:20 }}>
                {[['orders','Order Audit Log'],['staff','Staff Performance']].map(([key,label]) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        style={{ padding:'8px 20px', borderRadius:8, fontSize:13, cursor:'pointer',
                                 border:'none', fontFamily:'inherit', fontWeight: activeTab===key?600:400,
                                 background: activeTab===key?'#fff':'transparent',
                                 color: activeTab===key?'#0f172a':'#64748b',
                                 boxShadow: activeTab===key?'0 1px 4px rgba(0,0,0,.08)':'none' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ── ORDER AUDIT TAB ── */}
            {activeTab === 'orders' && (
                <>
                    {/* Filters */}
                    <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
                        <div style={{ position:'relative', flex:1, minWidth:200 }}>
                            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}>🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Search by order, customer or staff..."
                                style={{ width:'100%', padding:'9px 14px 9px 34px', border:'1px solid #e2e8f0',
                                         borderRadius:10, fontSize:13, outline:'none',
                                         boxSizing:'border-box', fontFamily:'inherit' }} />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            style={{ padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:10,
                                     fontSize:13, outline:'none', background:'#fff', cursor:'pointer' }}>
                            <option value="All">All Status</option>
                            {['Pending','Confirmed','Shipped','Completed','Cancelled'].map(s => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                        <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}
                            style={{ padding:'9px 14px', border:'1px solid #e2e8f0', borderRadius:10,
                                     fontSize:13, outline:'none', background:'#fff', cursor:'pointer' }}>
                            <option value="All">All Staff</option>
                            {allStaff.map(s => <option key={s}>{s}</option>)}
                        </select>
                        <span style={{ fontSize:12, color:'#94a3b8' }}>{filtered.length} records</span>
                    </div>

                    {/* Table */}
                    <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:12, overflow:'hidden' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'70px 1fr 1fr 110px 90px 130px 90px',
                                      gap:12, padding:'10px 20px', background:'#f8fafc',
                                      borderBottom:'1px solid #f1f5f9',
                                      fontSize:11, fontWeight:600, color:'#64748b',
                                      textTransform:'uppercase', letterSpacing:'.04em' }}>
                            <span>Order</span>
                            <span>Customer</span>
                            <span>Staff</span>
                            <span>Date</span>
                            <span>Amount</span>
                            <span>Status</span>
                            <span>Detail</span>
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>No records found</div>
                        ) : filtered.map((o, idx) => {
                            const st = STATUS_STYLE[o.STATUS] || STATUS_STYLE.Pending
                            return (
                                <div key={o.ORDER_ID}
                                    style={{ display:'grid', gridTemplateColumns:'70px 1fr 1fr 110px 90px 130px 90px',
                                             gap:12, padding:'13px 20px', alignItems:'center',
                                             borderBottom: idx<filtered.length-1?'1px solid #f8fafc':'none',
                                             background: idx%2===0?'#fff':'#fafafa' }}>
                                    <div style={{ fontSize:14, fontWeight:700, color:'#4f46e5' }}>#{o.ORDER_ID}</div>

                                    <div>
                                        <div style={{ fontSize:13, fontWeight:500, color:'#0f172a' }}>{o.CUSTOMER_NAME}</div>
                                        <div style={{ fontSize:11, color:'#94a3b8' }}>{o.CUSTOMER_PHONE||'—'}</div>
                                    </div>

                                    <div>
                                        <div style={{ fontSize:13, fontWeight:500,
                                                      color: o.STAFF_NAME ? '#0f172a' : '#94a3b8',
                                                      fontStyle: o.STAFF_NAME ? 'normal' : 'italic' }}>
                                            {o.STAFF_NAME || '— Pending'}
                                        </div>
                                        <div style={{ fontSize:11, color:'#94a3b8' }}>
                                            {o.STAFF_NAME ? 'Processed order' : 'No staff action yet'}
                                        </div>
                                    </div>

                                    <div style={{ fontSize:12, color:'#64748b' }}>{o.ORDER_DATE}</div>

                                    <div style={{ fontSize:14, fontWeight:700,
                                                  color: o.STATUS==='Cancelled'?'#94a3b8':'#0f172a',
                                                  textDecoration: o.STATUS==='Cancelled'?'line-through':'none' }}>
                                        ${o.TOTAL_AMOUNT}
                                    </div>

                                    <div>
                                        <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                                                        fontSize:11, padding:'4px 10px', borderRadius:6,
                                                        fontWeight:600, background:st.bg, color:st.color }}>
                                            <span style={{ width:5, height:5, borderRadius:'50%', background:st.dot }}/>
                                            {o.STATUS}
                                        </span>
                                    </div>

                                    <div>
                                        <button onClick={() => setViewOrder(o)}
                                            style={{ padding:'5px 12px', background:'#f8fafc',
                                                     color:'#475569', border:'1px solid #e2e8f0',
                                                     borderRadius:7, cursor:'pointer',
                                                     fontSize:12, fontWeight:500 }}>
                                            View
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </>
            )}

            {/* ── STAFF PERFORMANCE TAB ── */}
            {activeTab === 'staff' && (
                <div style={{ background:'#fff', border:'1px solid #f1f5f9', borderRadius:12, overflow:'hidden' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 120px 100px 100px 110px',
                                  gap:12, padding:'10px 24px', background:'#f8fafc',
                                  borderBottom:'1px solid #f1f5f9',
                                  fontSize:11, fontWeight:600, color:'#64748b',
                                  textTransform:'uppercase', letterSpacing:'.04em' }}>
                        <span>Staff Member</span>
                        <span style={{ textAlign:'center' }}>Orders</span>
                        <span style={{ textAlign:'right' }}>Revenue</span>
                        <span style={{ textAlign:'center' }}>Completed</span>
                        <span style={{ textAlign:'center' }}>Cancelled</span>
                        <span style={{ textAlign:'right' }}>Last Sale</span>
                    </div>

                    {data.staff.map((s, idx) => {
                        const completion = s.TOTAL_ORDERS
                            ? Math.round((s.COMPLETED_ORDERS/s.TOTAL_ORDERS)*100) : 0

                        return (
                            <div key={s.USERNAME}
                                style={{ display:'grid', gridTemplateColumns:'1fr 80px 120px 100px 100px 110px',
                                         gap:12, padding:'16px 24px', alignItems:'center',
                                         borderBottom: idx<data.staff.length-1?'1px solid #f8fafc':'none' }}>
                                {/* Staff */}
                                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                    <div style={{ width:40, height:40, borderRadius:12,
                                                  background: s.ROLE==='Admin'?'#0f172a':s.ROLE==='Sale'?'#4f46e5':'#e2e8f0',
                                                  display:'flex', alignItems:'center', justifyContent:'center',
                                                  fontSize:16, fontWeight:700, color:'#fff', flexShrink:0 }}>
                                        {s.USERNAME?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{s.USERNAME}</div>
                                        <div style={{ fontSize:11, color:'#94a3b8' }}>{s.ROLE}</div>
                                    </div>
                                </div>

                                <div style={{ textAlign:'center', fontSize:18, fontWeight:800, color:'#0f172a' }}>
                                    {s.TOTAL_ORDERS}
                                </div>

                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontSize:16, fontWeight:800, color:'#0f172a' }}>
                                        ${Number(s.TOTAL_REVENUE).toFixed(0)}
                                    </div>
                                    {/* Revenue bar */}
                                    <div style={{ height:4, background:'#f1f5f9', borderRadius:2, marginTop:4, overflow:'hidden' }}>
                                        <div style={{ height:'100%', borderRadius:2, background:'#0f172a',
                                                      width: `${Math.min(100, (s.TOTAL_REVENUE/Math.max(...data.staff.map(x=>x.TOTAL_REVENUE),1))*100)}%` }}/>
                                    </div>
                                </div>

                                <div style={{ textAlign:'center' }}>
                                    <div style={{ fontSize:14, fontWeight:700, color:'#15803d' }}>{s.COMPLETED_ORDERS}</div>
                                    <div style={{ fontSize:11, color:'#94a3b8' }}>{completion}% rate</div>
                                </div>

                                <div style={{ textAlign:'center' }}>
                                    <div style={{ fontSize:14, fontWeight:700,
                                                  color: s.CANCELLED_ORDERS>0?'#dc2626':'#94a3b8' }}>
                                        {s.CANCELLED_ORDERS}
                                    </div>
                                </div>

                                <div style={{ textAlign:'right', fontSize:12, color:'#64748b' }}>
                                    {s.LAST_ORDER_DATE||'—'}
                                </div>
                            </div>
                        )
                    })}

                    {data.staff.length === 0 && (
                        <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>No staff data found</div>
                    )}
                </div>
            )}

            {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
        </div>
    )
}
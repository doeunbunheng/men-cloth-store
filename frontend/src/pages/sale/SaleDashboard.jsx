import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateOrderStatus, getOrderItems } from '../../api'

const STATUS_FLOW = {
    Pending:   ['Confirmed', 'Cancelled'],
    Confirmed: ['Shipped',   'Cancelled'],
    Shipped:   ['Completed', 'Cancelled'],
    Completed: [],
    Cancelled: [],
}

const STATUS_STYLE = {
    Pending:   { bg:'#fffbeb', color:'#b45309', border:'#fde68a', icon:'⏳' },
    Confirmed: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', icon:'✅' },
    Shipped:   { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'🚚' },
    Completed: { bg:'#f0fdf4', color:'#166534', border:'#86efac', icon:'🎉' },
    Cancelled: { bg:'#fef2f2', color:'#b91c1c', border:'#fecaca', icon:'❌' },
}

const imgSrc = (url) => {
    if (!url) return null
    if (url.startsWith('/media')) return `http://localhost:8000${url}`
    return url
}

// ── Order Items Modal ─────────────────────────────────────────
function OrderItemsModal({ order, onClose }) {
    const [items,   setItems]   = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOrderItems(order.ORDER_ID)
            .then(r => setItems(r.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false))
    }, [order.ORDER_ID])

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
                      backdropFilter:'blur(4px)', display:'flex', alignItems:'center',
                      justifyContent:'center', zIndex:1000, padding:16 }}
             onClick={onClose}>
            <div style={{ background:'#fff', borderRadius:20, maxWidth:680, width:'100%',
                          maxHeight:'85vh', overflow:'hidden', display:'flex',
                          flexDirection:'column', boxShadow:'0 24px 60px rgba(0,0,0,.3)' }}
                 onClick={e => e.stopPropagation()}>

                <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9',
                              display:'flex', justifyContent:'space-between', alignItems:'center',
                              background:'linear-gradient(135deg,#1e1b4b,#4f46e5)' }}>
                    <div>
                        <div style={{ fontSize:16, fontWeight:700, color:'#fff' }}>
                            Order #{order.ORDER_ID} — Items
                        </div>
                        <div style={{ fontSize:12, color:'#c7d2fe', marginTop:2 }}>
                            {order.CUSTOMER_NAME} · {order.ORDER_DATE}
                        </div>
                    </div>
                    <button onClick={onClose}
                        style={{ width:32, height:32, background:'rgba(255,255,255,.15)',
                                 border:'none', borderRadius:10, cursor:'pointer',
                                 fontSize:16, color:'#fff', display:'flex',
                                 alignItems:'center', justifyContent:'center' }}>✕</button>
                </div>

                <div style={{ flex:1, overflow:'auto' }}>
                    {loading ? (
                        <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>Loading items...</div>
                    ) : items.length === 0 ? (
                        <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>No items found</div>
                    ) : (
                        <>
                            <div style={{ padding:'10px 24px', display:'grid',
                                          gridTemplateColumns:'1fr 70px 70px 60px 90px',
                                          gap:10, fontSize:11, fontWeight:600, color:'#94a3b8',
                                          textTransform:'uppercase', letterSpacing:'.04em',
                                          background:'#f8fafc', borderBottom:'1px solid #f1f5f9' }}>
                                <span>Product</span>
                                <span style={{ textAlign:'center' }}>Size</span>
                                <span style={{ textAlign:'center' }}>Color</span>
                                <span style={{ textAlign:'center' }}>Qty</span>
                                <span style={{ textAlign:'right' }}>Subtotal</span>
                            </div>

                            {items.map((item, idx) => {
                                const src = imgSrc(item.IMAGE_URL)
                                return (
                                    <div key={item.ITEM_ID}
                                        style={{ padding:'14px 24px', display:'grid',
                                                 gridTemplateColumns:'1fr 70px 70px 60px 90px',
                                                 gap:10, alignItems:'center',
                                                 borderBottom: idx < items.length-1 ? '1px solid #f8fafc' : 'none',
                                                 background: idx%2===0 ? '#fff' : '#fafafa' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                            <div style={{ width:48, height:48, borderRadius:10,
                                                          background:'#f1f5f9', overflow:'hidden',
                                                          border:'1px solid #e2e8f0', flexShrink:0 }}>
                                                {src
                                                    ? <img src={src} alt={item.PRODUCT_NAME}
                                                           style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                                    : <div style={{ width:'100%', height:'100%', display:'flex',
                                                                    alignItems:'center', justifyContent:'center',
                                                                    fontSize:20 }}>👔</div>}
                                            </div>
                                            <div>
                                                <div style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>
                                                    {item.PRODUCT_NAME}
                                                </div>
                                                <div style={{ fontSize:12, color:'#94a3b8' }}>${item.UNIT_PRICE} each</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign:'center' }}>
                                            {item.SELECTED_SIZE && item.SELECTED_SIZE !== '—'
                                                ? <span style={{ background:'#ede9fe', color:'#5b21b6',
                                                                  padding:'3px 8px', borderRadius:6,
                                                                  fontSize:12, fontWeight:600 }}>
                                                    {item.SELECTED_SIZE}
                                                  </span>
                                                : <span style={{ color:'#cbd5e1' }}>—</span>}
                                        </div>
                                        <div style={{ textAlign:'center' }}>
                                            {item.SELECTED_COLOR && item.SELECTED_COLOR !== '—'
                                                ? <span style={{ background:'#f1f5f9', color:'#475569',
                                                                  padding:'3px 8px', borderRadius:6, fontSize:12 }}>
                                                    {item.SELECTED_COLOR}
                                                  </span>
                                                : <span style={{ color:'#cbd5e1' }}>—</span>}
                                        </div>
                                        <div style={{ textAlign:'center' }}>
                                            <span style={{ background:'#f8fafc', border:'1px solid #e2e8f0',
                                                           padding:'3px 10px', borderRadius:6,
                                                           fontSize:13, fontWeight:700 }}>
                                                ×{item.QUANTITY}
                                            </span>
                                        </div>
                                        <div style={{ textAlign:'right', fontSize:14,
                                                      fontWeight:700, color:'#4f46e5' }}>
                                            ${Number(item.SUBTOTAL).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            })}

                            <div style={{ padding:'14px 24px', display:'flex',
                                          justifyContent:'space-between', alignItems:'center',
                                          borderTop:'2px solid #e2e8f0', background:'#fff' }}>
                                <span style={{ fontSize:13, color:'#64748b' }}>
                                    {items.length} product{items.length!==1?'s':''} ·{' '}
                                    {items.reduce((s,i)=>s+i.QUANTITY,0)} pieces
                                </span>
                                <span style={{ fontSize:18, fontWeight:800, color:'#0f172a' }}>
                                    Total: ${order.TOTAL_AMOUNT}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
    const st = STATUS_STYLE[status] || STATUS_STYLE.Pending
    return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:5,
                        fontSize:12, padding:'4px 10px', borderRadius:20, fontWeight:600,
                        background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
            {st.icon} {status}
        </span>
    )
}

// ── Status Action Buttons ─────────────────────────────────────
function StatusActions({ order, onUpdate }) {
    const nextStatuses = STATUS_FLOW[order.STATUS] || []
    if (nextStatuses.length === 0) {
        return (
            <span style={{ fontSize:12, color:'#94a3b8', fontStyle:'italic' }}>
                {order.STATUS === 'Completed' ? 'Order complete' : 'Order cancelled'}
            </span>
        )
    }
    return (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {nextStatuses.map(next => {
                const isCancel   = next === 'Cancelled'
                const isComplete = next === 'Completed'
                return (
                    <button key={next} onClick={() => onUpdate(order.ORDER_ID, next)}
                        style={{ padding:'5px 12px', borderRadius:8, fontSize:12,
                                 fontWeight:600, cursor:'pointer', border:'1.5px solid',
                                 transition:'all .15s',
                                 background: isCancel ? '#fff' : isComplete ? '#16a34a' : '#4f46e5',
                                 color:      isCancel ? '#dc2626' : '#fff',
                                 borderColor: isCancel ? '#fca5a5' : isComplete ? '#16a34a' : '#4f46e5' }}>
                        {next === 'Confirmed' ? 'Confirm'
                         : next === 'Shipped'  ? 'Ship'
                         : next === 'Completed'? 'Complete'
                         : 'Cancel'}
                    </button>
                )
            })}
        </div>
    )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function SaleDashboard() {
    const [orders,    setOrders]    = useState([])
    const [loading,   setLoading]   = useState(true)
    const [filter,    setFilter]    = useState('All')
    const [updating,  setUpdating]  = useState(null)
    const [viewOrder, setViewOrder] = useState(null)
    const navigate = useNavigate()

    const load = () => {
        setLoading(true)
        getOrders().then(r => setOrders(r.data)).finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const handleUpdate = async (orderId, newStatus) => {
        setUpdating(orderId)
        try {
            await updateOrderStatus(orderId, newStatus)
            load()
        } catch(e) { alert('Update failed: ' + (e.response?.data?.error || e.message)) }
        setUpdating(null)
    }

    const total     = orders.length
    const pending   = orders.filter(o => o.STATUS === 'Pending').length
    const confirmed = orders.filter(o => o.STATUS === 'Confirmed').length
    const shipped   = orders.filter(o => o.STATUS === 'Shipped').length
    const completed = orders.filter(o => o.STATUS === 'Completed').length
    const revenue   = orders.filter(o => o.STATUS !== 'Cancelled')
                            .reduce((s,o) => s + (o.TOTAL_AMOUNT||0), 0)

    const filterTabs = ['All','Pending','Confirmed','Shipped','Completed','Cancelled']
    const filtered   = filter === 'All' ? orders : orders.filter(o => o.STATUS === filter)

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'flex-start', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:26, fontWeight:700, color:'#0f172a', marginBottom:4 }}>
                        Sales Dashboard
                    </h1>
                    <p style={{ fontSize:14, color:'#64748b' }}>Manage and track all orders</p>
                </div>
                <button onClick={() => navigate('/sale/new-order')}
                    style={{ padding:'10px 20px',
                             background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                             color:'#fff', border:'none', borderRadius:10, fontWeight:600,
                             cursor:'pointer', fontSize:14,
                             boxShadow:'0 4px 12px rgba(79,70,229,.3)' }}>
                    + New Order
                </button>
            </div>

            {/* Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10, marginBottom:24 }}>
                {[
                    { label:'Total',     value:total,     color:'#4f46e5', bg:'#f5f3ff' },
                    { label:'Pending',   value:pending,   color:'#b45309', bg:'#fffbeb' },
                    { label:'Confirmed', value:confirmed, color:'#1d4ed8', bg:'#eff6ff' },
                    { label:'Shipped',   value:shipped,   color:'#0891b2', bg:'#ecfeff' },
                    { label:'Completed', value:completed, color:'#15803d', bg:'#f0fdf4' },
                    { label:'Revenue',   value:`$${revenue.toFixed(0)}`, color:'#4f46e5', bg:'#f5f3ff' },
                ].map(s => (
                    <div key={s.label} style={{ background:s.bg, borderRadius:12, padding:'14px 16px',
                                                border:`1px solid ${s.color}22` }}>
                        <div style={{ fontSize:20, fontWeight:700, color:s.color, marginBottom:2 }}>
                            {s.value}
                        </div>
                        <div style={{ fontSize:11, color:'#64748b', fontWeight:500 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Flow guide */}
            <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12,
                          padding:'12px 20px', marginBottom:20,
                          display:'flex', alignItems:'center', gap:6, overflow:'auto' }}>
                <span style={{ fontSize:11, color:'#94a3b8', fontWeight:600,
                                textTransform:'uppercase', letterSpacing:'.04em',
                                marginRight:8, whiteSpace:'nowrap' }}>Order Flow:</span>
                {['Pending','Confirmed','Shipped','Completed'].map((s,i) => {
                    const st = STATUS_STYLE[s]
                    return (
                        <div key={s} style={{ display:'flex', alignItems:'center' }}>
                            <span style={{ fontSize:12, fontWeight:600, color:st.color,
                                           padding:'4px 12px', background:st.bg,
                                           borderRadius:20, border:`1px solid ${st.border}`,
                                           whiteSpace:'nowrap' }}>
                                {st.icon} {s}
                            </span>
                            {i < 3 && <span style={{ fontSize:16, color:'#cbd5e1', margin:'0 4px' }}>→</span>}
                        </div>
                    )
                })}
                <span style={{ fontSize:16, color:'#cbd5e1', margin:'0 6px' }}>|</span>
                <span style={{ fontSize:12, fontWeight:600, color:'#b91c1c', padding:'4px 12px',
                               background:'#fef2f2', borderRadius:20, border:'1px solid #fecaca',
                               whiteSpace:'nowrap' }}>❌ Cancelled (any stage)</span>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
                {filterTabs.map(tab => {
                    const count = tab==='All' ? total : orders.filter(o=>o.STATUS===tab).length
                    return (
                        <button key={tab} onClick={() => setFilter(tab)}
                            style={{ padding:'7px 14px', borderRadius:8, fontSize:13,
                                     fontWeight:500, cursor:'pointer', border:'1.5px solid',
                                     fontFamily:'inherit', transition:'all .15s',
                                     borderColor: filter===tab ? '#4f46e5' : '#e2e8f0',
                                     background:  filter===tab ? '#4f46e5' : '#fff',
                                     color:       filter===tab ? '#fff'    : '#64748b',
                                     display:'flex', alignItems:'center', gap:6 }}>
                            {tab}
                            {count > 0 && (
                                <span style={{ background: filter===tab ? 'rgba(255,255,255,.25)' : '#f1f5f9',
                                               color: filter===tab ? '#fff' : '#475569',
                                               borderRadius:12, padding:'1px 7px',
                                               fontSize:11, fontWeight:600 }}>
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Orders table */}
            {loading ? (
                <div style={{ textAlign:'center', padding:40, color:'#94a3b8' }}>Loading orders...</div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:60, color:'#94a3b8', background:'#fff',
                              borderRadius:14, border:'1px solid #e2e8f0' }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                    <div style={{ fontSize:15, fontWeight:500 }}>No {filter} orders</div>
                </div>
            ) : (
                <div style={{ background:'#fff', border:'1px solid #e2e8f0',
                              borderRadius:14, overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                            <tr style={{ background:'#f8fafc' }}>
                                {['Order','Customer','Date','Amount','Status','Actions'].map(h => (
                                    <th key={h} style={{ textAlign:'left', padding:'12px 16px',
                                        fontSize:11, fontWeight:600, color:'#94a3b8',
                                        textTransform:'uppercase', letterSpacing:'.04em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => {
                                const isFinal = STATUS_FLOW[o.STATUS]?.length === 0
                                return (
                                    <tr key={o.ORDER_ID}
                                        style={{ borderTop:'1px solid #f1f5f9',
                                                 opacity: updating===o.ORDER_ID ? .6 : 1,
                                                 background: isFinal ? '#fafafa' : '#fff' }}>
                                        <td style={{ padding:'14px 16px' }}>
                                            <span style={{ fontSize:14, fontWeight:700,
                                                           color:'#4f46e5' }}>#{o.ORDER_ID}</span>
                                        </td>
                                        <td style={{ padding:'14px 16px' }}>
                                            <div style={{ fontSize:14, fontWeight:500, color:'#0f172a' }}>
                                                {o.CUSTOMER_NAME}
                                            </div>
                                            {o.SOLD_BY && (
                                                <div style={{ fontSize:11, color:'#94a3b8' }}>
                                                    via {o.SOLD_BY}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding:'14px 16px', fontSize:13, color:'#64748b' }}>
                                            {o.ORDER_DATE}
                                        </td>
                                        <td style={{ padding:'14px 16px' }}>
                                            <span style={{ fontSize:15, fontWeight:700,
                                                           color: o.STATUS==='Cancelled' ? '#94a3b8' : '#0f172a',
                                                           textDecoration: o.STATUS==='Cancelled' ? 'line-through' : 'none' }}>
                                                ${o.TOTAL_AMOUNT ?? '—'}
                                            </span>
                                        </td>
                                        <td style={{ padding:'14px 16px' }}>
                                            <StatusBadge status={o.STATUS} />
                                        </td>
                                        <td style={{ padding:'14px 16px' }}>
                                            {updating === o.ORDER_ID ? (
                                                <span style={{ fontSize:12, color:'#94a3b8' }}>Updating...</span>
                                            ) : (
                                                <div style={{ display:'flex', gap:8, alignItems:'center',
                                                              flexWrap:'wrap' }}>
                                                    <button onClick={() => setViewOrder(o)}
                                                        style={{ padding:'5px 12px', background:'#eff6ff',
                                                                 color:'#2563eb', border:'1px solid #bfdbfe',
                                                                 borderRadius:8, cursor:'pointer',
                                                                 fontSize:12, fontWeight:500 }}>
                                                        👁 Items
                                                    </button>
                                                    <StatusActions order={o} onUpdate={handleUpdate} />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Items Modal */}
            {viewOrder && (
                <OrderItemsModal order={viewOrder} onClose={() => setViewOrder(null)} />
            )}
        </div>
    )
}
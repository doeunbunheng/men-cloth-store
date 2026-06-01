import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getOrders, getOrderItems } from '../../api'

const imgSrc = (url) => {
    if (!url) return null
    return url
}

const STATUS_STYLE = {
    Pending:   { bg:'#fffbeb', color:'#b45309', border:'#fde68a', icon:'⏳', bar:'#fbbf24' },
    Confirmed: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', icon:'✅', bar:'#3b82f6' },
    Shipped:   { bg:'#ecfeff', color:'#0891b2', border:'#a5f3fc', icon:'🚚', bar:'#06b6d4' },
    Completed: { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'🎉', bar:'#22c55e' },
    Cancelled: { bg:'#fef2f2', color:'#b91c1c', border:'#fecaca', icon:'❌', bar:'#ef4444' },
}

// ── Order items expandable section ────────────────────────────
function OrderItems({ orderId }) {
    const [items,   setItems]   = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getOrderItems(orderId)
            .then(r => setItems(r.data))
            .catch(e => console.error(e))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) return (
        <div style={{ padding:'20px 28px', color:'#94a3b8', fontSize:13,
                      display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:14, height:14, borderRadius:'50%',
                          border:'2px solid #e2e8f0', borderTopColor:'#6366f1',
                          animation:'spin .6s linear infinite' }} />
            Loading items...
        </div>
    )

    if (items.length === 0) return (
        <div style={{ padding:'20px 28px', color:'#94a3b8', fontSize:13 }}>
            No items found
        </div>
    )

    return (
        <div>
            {items.map((item, idx) => {
                const src = imgSrc(item.IMAGE_URL)
                return (
                    <div key={item.ITEM_ID}
                        style={{ display:'flex', alignItems:'center', gap:16,
                                 padding:'16px 28px',
                                 borderTop: idx===0 ? 'none' : '1px solid #f8fafc',
                                 background: idx%2===0 ? '#fff' : '#fdfcff' }}>

                        {/* Product image */}
                        <div style={{ width:60, height:60, borderRadius:12,
                                      background:'#f1f5f9', overflow:'hidden',
                                      border:'1px solid #e2e8f0', flexShrink:0,
                                      boxShadow:'0 2px 8px rgba(0,0,0,.06)' }}>
                            {src
                                ? <img src={src} alt={item.PRODUCT_NAME}
                                       style={{ width:'100%', height:'100%', objectFit:'cover' }}
                                       onError={e => { e.target.style.display='none' }} />
                                : <div style={{ width:'100%', height:'100%', display:'flex',
                                                alignItems:'center', justifyContent:'center',
                                                fontSize:24 }}></div>}
                        </div>

                        {/* Product info */}
                        <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:14, fontWeight:600, color:'#0f172a',
                                          marginBottom:6, overflow:'hidden',
                                          textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {item.PRODUCT_NAME}
                            </div>
                            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                {item.SELECTED_SIZE && item.SELECTED_SIZE !== '—' && (
                                    <span style={{ fontSize:11, fontWeight:600,
                                                   background:'#ede9fe', color:'#5b21b6',
                                                   padding:'3px 10px', borderRadius:20 }}>
                                        Size: {item.SELECTED_SIZE}
                                    </span>
                                )}
                                {item.SELECTED_COLOR && item.SELECTED_COLOR !== '—' && (
                                    <span style={{ fontSize:11, fontWeight:500,
                                                   background:'#f1f5f9', color:'#475569',
                                                   padding:'3px 10px', borderRadius:20 }}>
                                        Color: {item.SELECTED_COLOR}
                                    </span>
                                )}
                                <span style={{ fontSize:11, color:'#94a3b8' }}>
                                    ${item.UNIT_PRICE} × {item.QUANTITY}
                                </span>
                            </div>
                        </div>

                        {/* Subtotal */}
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                            <div style={{ fontSize:16, fontWeight:800, color:'#4f46e5' }}>
                                ${Number(item.SUBTOTAL).toFixed(2)}
                            </div>
                            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
                                {item.QUANTITY} {item.QUANTITY===1?'piece':'pieces'}
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Summary footer */}
            <div style={{ padding:'14px 28px', background:'#f8fafc',
                          borderTop:'1px solid #f1f5f9',
                          display:'flex', justifyContent:'space-between',
                          alignItems:'center' }}>
                <span style={{ fontSize:13, color:'#64748b' }}>
                    {items.length} product{items.length!==1?'s':''} ·{' '}
                    {items.reduce((s,i)=>s+i.QUANTITY,0)} pieces total
                </span>
                <div style={{ fontSize:12, color:'#94a3b8' }}>
                    All amounts in USD
                </div>
            </div>
        </div>
    )
}

// ── Single order card ─────────────────────────────────────────
function OrderCard({ order }) {
    const [expanded, setExpanded] = useState(false)
    const [itemsLoaded, setItemsLoaded] = useState(false)
    const st = STATUS_STYLE[order.STATUS] || STATUS_STYLE.Pending

    const handleToggle = () => {
        setExpanded(p => !p)
        setItemsLoaded(true)
    }

    return (
        <div style={{ background:'#fff', borderRadius:20, overflow:'hidden',
                      border:'1px solid #f1f5f9',
                      boxShadow: expanded
                          ? '0 8px 32px rgba(99,102,241,.12)'
                          : '0 2px 10px rgba(0,0,0,.05)',
                      transition:'all .25s ease' }}>

            {/* Status bar at top */}
            <div style={{ height:4, background:st.bar, borderRadius:'20px 20px 0 0' }} />

            {/* Order summary row */}
            <div style={{ padding:'20px 28px', display:'flex',
                          alignItems:'center', gap:20, flexWrap:'wrap' }}>

                {/* Status icon */}
                <div style={{ width:56, height:56, borderRadius:16, flexShrink:0,
                              background:st.bg, border:`1.5px solid ${st.border}`,
                              display:'flex', alignItems:'center',
                              justifyContent:'center', fontSize:24 }}>
                    {st.icon}
                </div>

                {/* Main info */}
                <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:'flex', alignItems:'center',
                                  gap:10, marginBottom:6, flexWrap:'wrap' }}>
                        <span style={{ fontSize:18, fontWeight:800,
                                       color:'#0f172a', letterSpacing:'-.01em' }}>
                            Order #{order.ORDER_ID}
                        </span>
                        <span style={{ fontSize:12, padding:'4px 12px', borderRadius:20,
                                       fontWeight:700, background:st.bg, color:st.color,
                                       border:`1px solid ${st.border}` }}>
                            {st.icon} {order.STATUS}
                        </span>
                    </div>
                    <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                        <span style={{ fontSize:13, color:'#64748b',
                                       display:'flex', alignItems:'center', gap:4 }}>
                             {order.ORDER_DATE}
                        </span>
                        <span style={{ fontSize:13, color:'#64748b',
                                       display:'flex', alignItems:'center', gap:4 }}>
                            {order.PROCESSED_BY || order.SOLD_BY
                                ? <>🧑‍💼 Processed by{' '}
                                    <b style={{ color:'#475569' }}>
                                        {order.PROCESSED_BY || order.SOLD_BY}
                                    </b>
                                  </>
                                : <span style={{ color:'#94a3b8', fontStyle:'italic' }}>
                                    ⏳ Awaiting processing
                                  </span>
                            }
                        </span>
                    </div>
                </div>

                {/* Total + action */}
                <div style={{ display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:11, color:'#94a3b8', marginBottom:2,
                                      textTransform:'uppercase', letterSpacing:'.05em',
                                      fontWeight:600 }}>Total</div>
                        <div style={{ fontSize:24, fontWeight:900, letterSpacing:'-.02em',
                                      color: order.STATUS==='Cancelled' ? '#94a3b8' : '#4f46e5',
                                      textDecoration: order.STATUS==='Cancelled'
                                          ? 'line-through' : 'none' }}>
                            ${order.TOTAL_AMOUNT ?? '—'}
                        </div>
                    </div>

                    <button onClick={handleToggle}
                        style={{ display:'flex', flexDirection:'column',
                                 alignItems:'center', gap:4,
                                 padding:'12px 18px', borderRadius:14,
                                 border:`1.5px solid ${expanded ? '#6366f1' : '#e2e8f0'}`,
                                 background: expanded ? '#f5f3ff' : '#f8fafc',
                                 cursor:'pointer', transition:'all .2s',
                                 minWidth:80 }}
                        onMouseEnter={e => {
                            if (!expanded) {
                                e.currentTarget.style.borderColor='#c7d2fe'
                                e.currentTarget.style.background='#f0f0ff'
                            }
                        }}
                        onMouseLeave={e => {
                            if (!expanded) {
                                e.currentTarget.style.borderColor='#e2e8f0'
                                e.currentTarget.style.background='#f8fafc'
                            }
                        }}>
                        <span style={{ fontSize:18 }}>{expanded ? '🔼' : '🔽'}</span>
                        <span style={{ fontSize:11, fontWeight:600,
                                       color: expanded ? '#4f46e5' : '#64748b' }}>
                            {expanded ? 'Hide' : 'Details'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Expandable items */}
            {expanded && (
                <div style={{ borderTop:'1px solid #f1f5f9' }}>
                    <div style={{ padding:'12px 28px', background:'#fafafa',
                                  display:'flex', alignItems:'center', gap:8,
                                  borderBottom:'1px solid #f1f5f9' }}>
                        <span style={{ fontSize:12, fontWeight:700, color:'#4f46e5',
                                       textTransform:'uppercase', letterSpacing:'.05em' }}>
                            Items in this order
                        </span>
                    </div>
                    {itemsLoaded && <OrderItems orderId={order.ORDER_ID} />}
                </div>
            )}
        </div>
    )
}

// ── Main page ─────────────────────────────────────────────────
export default function MyOrders() {
    const [orders,  setOrders]  = useState([])
    const [loading, setLoading] = useState(true)
    const [filter,  setFilter]  = useState('All')
    const [error,   setError]   = useState('')

    useEffect(() => {
        const cid = localStorage.getItem('customer_id')
        if (!cid) { setError('no_customer_id'); setLoading(false); return }
        getOrders()
            .then(r => setOrders(r.data))
            .catch(e => setError(e.response?.data?.error || 'Failed'))
            .finally(() => setLoading(false))
    }, [])

    const counts = {
        All:       orders.length,
        Pending:   orders.filter(o=>o.STATUS==='Pending').length,
        Completed: orders.filter(o=>o.STATUS==='Completed').length,
        Cancelled: orders.filter(o=>o.STATUS==='Cancelled').length,
    }

    const filtered = filter==='All' ? orders : orders.filter(o=>o.STATUS===filter)
    const totalSpent = orders.filter(o=>o.STATUS!=='Cancelled')
                             .reduce((s,o)=>s+(o.TOTAL_AMOUNT||0), 0)

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      height:300, fontFamily:"'DM Sans',sans-serif" }}>
            <div style={{ textAlign:'center', color:'#94a3b8' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', margin:'0 auto 12px',
                              border:'3px solid #e2e8f0', borderTopColor:'#6366f1',
                              animation:'spin .6s linear infinite' }} />
                Loading your orders...
            </div>
        </div>
    )

    if (error === 'no_customer_id') return (
        <div style={{ textAlign:'center', padding:'60px 20px', background:'#fff',
                      borderRadius:20, border:'1px solid #e2e8f0',
                      maxWidth:400, margin:'40px auto',
                      fontFamily:"'DM Sans',sans-serif" }}>
            <div style={{ fontSize:48, marginBottom:16 }}></div>
            <h2 style={{ fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
                Session expired
            </h2>
            <p style={{ fontSize:14, color:'#64748b', marginBottom:24 }}>
                Please log out and log back in.
            </p>
            <Link to="/login"
                style={{ display:'inline-block', padding:'12px 28px', background:'#4f46e5',
                         color:'#fff', borderRadius:10, textDecoration:'none',
                         fontSize:14, fontWeight:600 }}>
                Login again
            </Link>
        </div>
    )

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            {/* Hero header */}
            <div style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%)',
                          borderRadius:20, padding:'32px 36px', marginBottom:28,
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200,
                              background:'rgba(255,255,255,.05)', borderRadius:'50%' }}/>
                <div style={{ position:'relative' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#a5b4fc',
                                  letterSpacing:'.1em', textTransform:'uppercase',
                                  marginBottom:8 }}>My Account</div>
                    <h1 style={{ fontSize:30, fontWeight:800, color:'#fff',
                                 marginBottom:6, letterSpacing:'-.02em' }}>
                        My Orders
                    </h1>
                    <p style={{ fontSize:14, color:'#c7d2fe' }}>
                        {orders.length} order{orders.length!==1?'s':''} · ${totalSpent.toFixed(2)} total spent
                    </p>
                </div>
                <Link to="/products"
                    style={{ padding:'12px 22px',
                             background:'rgba(255,255,255,.15)',
                             backdropFilter:'blur(8px)',
                             border:'1px solid rgba(255,255,255,.2)',
                             borderRadius:12, textDecoration:'none',
                             color:'#fff', fontSize:14, fontWeight:600,
                             whiteSpace:'nowrap' }}>
                    + Continue Shopping
                </Link>
            </div>

            {/* Stats row */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                          gap:12, marginBottom:24 }}>
                {[
                    ['All',       counts.All,       '#4f46e5', '#f5f3ff', '#e0e7ff'],
                    ['Pending',   counts.Pending,   '#b45309', '#fffbeb', '#fde68a'],
                    ['Completed', counts.Completed, '#15803d', '#f0fdf4', '#bbf7d0'],
                    ['Cancelled', counts.Cancelled, '#b91c1c', '#fef2f2', '#fecaca'],
                ].map(([label, count, color, bg, border]) => (
                    <button key={label}
                        onClick={() => setFilter(label)}
                        style={{ background: filter===label ? bg : '#fff',
                                 border: `1.5px solid ${filter===label ? border : '#e2e8f0'}`,
                                 borderRadius:14, padding:'16px',
                                 cursor:'pointer', textAlign:'left',
                                 transition:'all .15s',
                                 boxShadow: filter===label ? `0 4px 12px ${color}20` : 'none',
                                 fontFamily:'inherit' }}>
                        <div style={{ fontSize:26, fontWeight:900, color,
                                      marginBottom:4 }}>{count}</div>
                        <div style={{ fontSize:12, color:'#64748b', fontWeight:500 }}>{label}</div>
                    </button>
                ))}
            </div>

            {/* Orders list */}
            {filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', background:'#fff',
                              borderRadius:20, border:'1px solid #f1f5f9' }}>
                    <div style={{ fontSize:52, marginBottom:16 }}>🛒</div>
                    <h2 style={{ fontSize:18, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
                        {filter === 'All' ? 'No orders yet' : `No ${filter} orders`}
                    </h2>
                    <p style={{ fontSize:14, color:'#64748b', marginBottom:24 }}>
                        {filter === 'All'
                            ? 'Start shopping and your orders will appear here'
                            : `You have no ${filter.toLowerCase()} orders`}
                    </p>
                    <Link to="/products"
                        style={{ display:'inline-block', padding:'12px 28px',
                                 background:'#4f46e5', color:'#fff', borderRadius:10,
                                 textDecoration:'none', fontSize:14, fontWeight:600 }}>
                        Browse Products
                    </Link>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {filtered.map(o => <OrderCard key={o.ORDER_ID} order={o} />)}
                </div>
            )}
        </div>
    )
}
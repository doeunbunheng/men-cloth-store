import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, getVariants } from '../../api'

const imgSrc = (url) => {
    if (!url) return null
    if (url.startsWith('/media')) return `http://localhost:8000${url}`
    return url
}

const PLACEHOLDER = 'https://placehold.co/60x60?text=No+Img'

function StockBar({ qty, max = 20 }) {
    const pct  = Math.min(100, (qty / max) * 100)
    const color = qty === 0 ? '#dc2626' : qty < 5 ? '#ea580c' : '#ca8a04'
    return (
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ flex:1, height:6, background:'#f1f5f9',
                          borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%',
                              background: color, borderRadius:3,
                              transition:'width .3s' }} />
            </div>
            <span style={{ fontSize:12, fontWeight:700, color, minWidth:28 }}>
                {qty}
            </span>
        </div>
    )
}

export default function LowStock() {
    const [items,    setItems]    = useState([])
    const [loading,  setLoading]  = useState(true)
    const [filter,   setFilter]   = useState('all')
    const [expanded, setExpanded] = useState({})
    const [varMap,   setVarMap]   = useState({})
    const navigate = useNavigate()

    useEffect(() => {
        getProducts().then(async r => {
            const all = r.data
            // Load variants for all products
            const vmap = {}
            await Promise.all(all.map(async p => {
                try {
                    const vres = await getVariants(p.PRODUCT_ID)
                    vmap[p.PRODUCT_ID] = vres.data
                } catch { vmap[p.PRODUCT_ID] = [] }
            }))
            setVarMap(vmap)

            // Find products with any low stock variant or no variants but low stock
            const low = all.filter(p => {
                const vars = vmap[p.PRODUCT_ID] || []
                const productLow  = p.STOCK_QTY < 10
                const variantsLow = vars.some(v => v.STOCK_QTY < 10)
                return productLow || variantsLow
            })
            setItems(low)
            setLoading(false)
        })
    }, [])

    const filtered = items.filter(p => {
        if (filter === 'out')  return p.STOCK_QTY === 0
        if (filter === 'critical') return p.STOCK_QTY > 0 && p.STOCK_QTY < 5
        if (filter === 'low')  return p.STOCK_QTY >= 5 && p.STOCK_QTY < 10
        return true
    })

    const outCount      = items.filter(p => p.STOCK_QTY === 0 ||
        (varMap[p.PRODUCT_ID]||[]).some(v => v.STOCK_QTY === 0)).length
    const criticalCount = items.filter(p => (p.STOCK_QTY > 0 && p.STOCK_QTY < 5) ||
        (varMap[p.PRODUCT_ID]||[]).some(v => v.STOCK_QTY > 0 && v.STOCK_QTY < 5)).length
    const lowCount      = items.filter(p => (p.STOCK_QTY >= 5 && p.STOCK_QTY < 10) ||
        (varMap[p.PRODUCT_ID]||[]).some(v => v.STOCK_QTY >= 5 && v.STOCK_QTY < 10)).length
    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      height:300, color:'#94a3b8' }}>Loading stock data...</div>
    )

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'flex-start', marginBottom:24 }}>
                <div>
                    <h1 style={{ fontSize:26, fontWeight:600, color:'#0f172a', marginBottom:4 }}>
                        📦 Low Stock Alert
                    </h1>
                    <p style={{ fontSize:14, color:'#64748b' }}>
                        {items.length} products need attention
                    </p>
                </div>
                <button onClick={() => navigate(-1)}
                    style={{ padding:'9px 18px', background:'#f1f5f9', color:'#475569',
                             border:'none', borderRadius:10, cursor:'pointer',
                             fontSize:13, fontWeight:500 }}>
                    ← Back
                </button>
            </div>

            {/* Summary cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                          gap:14, marginBottom:24 }}>
                <div style={{ background:'#fef2f2', border:'1px solid #fecaca',
                              borderRadius:12, padding:'16px 20px', cursor:'pointer',
                              outline: filter==='out' ? '2px solid #dc2626' : 'none' }}
                     onClick={() => setFilter(filter==='out' ? 'all' : 'out')}>
                    <div style={{ fontSize:28, fontWeight:700, color:'#dc2626' }}>
                        {outCount}
                    </div>
                    <div style={{ fontSize:13, color:'#b91c1c', fontWeight:500, marginTop:2 }}>
                        Out of Stock
                    </div>
                    <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>
                        Needs immediate restock
                    </div>
                </div>
                <div style={{ background:'#fff7ed', border:'1px solid #fed7aa',
                              borderRadius:12, padding:'16px 20px', cursor:'pointer',
                              outline: filter==='critical' ? '2px solid #ea580c' : 'none' }}
                     onClick={() => setFilter(filter==='critical' ? 'all' : 'critical')}>
                    <div style={{ fontSize:28, fontWeight:700, color:'#ea580c' }}>
                        {criticalCount}
                    </div>
                    <div style={{ fontSize:13, color:'#c2410c', fontWeight:500, marginTop:2 }}>
                        Critical (1–4)
                    </div>
                    <div style={{ fontSize:11, color:'#f97316', marginTop:4 }}>
                        Restock soon
                    </div>
                </div>
                <div style={{ background:'#fefce8', border:'1px solid #fef08a',
                              borderRadius:12, padding:'16px 20px', cursor:'pointer',
                              outline: filter==='low' ? '2px solid #ca8a04' : 'none' }}
                     onClick={() => setFilter(filter==='low' ? 'all' : 'low')}>
                    <div style={{ fontSize:28, fontWeight:700, color:'#ca8a04' }}>
                        {lowCount}
                    </div>
                    <div style={{ fontSize:13, color:'#a16207', fontWeight:500, marginTop:2 }}>
                        Low (5–9)
                    </div>
                    <div style={{ fontSize:11, color:'#eab308', marginTop:4 }}>
                        Monitor closely
                    </div>
                </div>
            </div>

            {/* Filter tabs */}
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                {[['all','All products'], ['out','Out of stock'],
                  ['critical','Critical'], ['low','Low']].map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)}
                        style={{ padding:'7px 16px', borderRadius:8, fontSize:13,
                                 fontWeight:500, cursor:'pointer', border:'1.5px solid',
                                 fontFamily:'inherit', transition:'all .15s',
                                 borderColor: filter===val ? '#4f46e5' : '#e2e8f0',
                                 background:  filter===val ? '#4f46e5' : '#fff',
                                 color:       filter===val ? '#fff'    : '#64748b' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Product list */}
            {filtered.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px',
                              background:'#fff', borderRadius:14,
                              border:'1px solid #e2e8f0' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                    <div style={{ fontSize:16, fontWeight:500, color:'#0f172a' }}>
                        No products in this category
                    </div>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {filtered.map(p => {
                        const src     = imgSrc(p.IMAGE_URL)
                        const vars    = varMap[p.PRODUCT_ID] || []
                        const lowVars = vars.filter(v => v.STOCK_QTY < 10)
                        const isOpen  = expanded[p.PRODUCT_ID]

                        return (
                            <div key={p.PRODUCT_ID}
                                style={{ background:'#fff', border:'1px solid #e2e8f0',
                                         borderRadius:14, overflow:'hidden' }}>

                                {/* Product row */}
                                <div style={{ display:'flex', alignItems:'center',
                                              gap:16, padding:'16px 20px' }}>
                                    {/* Image */}
                                    <div style={{ width:56, height:56, borderRadius:10,
                                                  overflow:'hidden', flexShrink:0,
                                                  border:'1px solid #e2e8f0',
                                                  background:'#f8fafc' }}>
                                        {src
                                            ? <img src={src} alt={p.PRODUCT_NAME}
                                                   style={{ width:'100%', height:'100%',
                                                            objectFit:'cover' }}
                                                   onError={e => { e.target.src=PLACEHOLDER }} />
                                            : <div style={{ width:'100%', height:'100%',
                                                             display:'flex', alignItems:'center',
                                                             justifyContent:'center',
                                                             fontSize:24 }}>👔</div>}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ display:'flex', alignItems:'center',
                                                      gap:8, marginBottom:4 }}>
                                            <span style={{ fontSize:15, fontWeight:600,
                                                           color:'#0f172a' }}>
                                                {p.PRODUCT_NAME}
                                            </span>
                                            <span style={{ fontSize:11, padding:'2px 8px',
                                                           borderRadius:12, fontWeight:500,
                                                           background:'#f1f5f9', color:'#475569' }}>
                                                {p.CATEGORY}
                                            </span>
                                            {p.STOCK_QTY === 0 && (
                                                <span style={{ fontSize:11, padding:'2px 8px',
                                                               borderRadius:12, fontWeight:600,
                                                               background:'#fef2f2', color:'#dc2626' }}>
                                                    OUT OF STOCK
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize:13, color:'#64748b', marginBottom:6 }}>
                                            ${p.PRICE} &nbsp;·&nbsp;
                                            {vars.length > 0
                                                ? `${lowVars.length} of ${vars.length} variants low`
                                                : 'No variants'}
                                        </div>
                                        <StockBar qty={p.STOCK_QTY} />
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                                        {vars.length > 0 && (
                                            <button
                                                onClick={() => setExpanded(prev =>
                                                    ({ ...prev, [p.PRODUCT_ID]: !prev[p.PRODUCT_ID] }))}
                                                style={{ padding:'7px 14px', background:'#eff6ff',
                                                         color:'#2563eb', border:'1px solid #bfdbfe',
                                                         borderRadius:8, cursor:'pointer',
                                                         fontSize:12, fontWeight:500 }}>
                                                {isOpen ? 'Hide' : 'View'} variants
                                            </button>
                                        )}
                                        <button
                                            onClick={() => navigate('/admin/products')}
                                            style={{ padding:'7px 14px', background:'#4f46e5',
                                                     color:'#fff', border:'none',
                                                     borderRadius:8, cursor:'pointer',
                                                     fontSize:12, fontWeight:500 }}>
                                            Restock
                                        </button>
                                    </div>
                                </div>

                                {/* Variant breakdown */}
                                {isOpen && vars.length > 0 && (
                                    <div style={{ borderTop:'1px solid #f1f5f9',
                                                  padding:'12px 20px 16px',
                                                  background:'#fafafa' }}>
                                        <div style={{ fontSize:12, fontWeight:600, color:'#64748b',
                                                      textTransform:'uppercase', letterSpacing:'.04em',
                                                      marginBottom:10 }}>
                                            Variant Stock Breakdown
                                        </div>
                                        <div style={{ display:'grid',
                                                      gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))',
                                                      gap:8 }}>
                                            {vars.map(v => (
                                                <div key={v.VARIANT_ID}
                                                    style={{ background: v.STOCK_QTY === 0 ? '#fef2f2'
                                                                        : v.STOCK_QTY < 5  ? '#fff7ed'
                                                                        : '#fefce8',
                                                             border: `1px solid ${
                                                                v.STOCK_QTY === 0 ? '#fecaca'
                                                              : v.STOCK_QTY < 5  ? '#fed7aa'
                                                              : '#fef08a'}`,
                                                             borderRadius:8, padding:'10px 14px' }}>
                                                    <div style={{ display:'flex', justifyContent:'space-between',
                                                                  alignItems:'center', marginBottom:6 }}>
                                                        <span style={{ fontSize:13, fontWeight:600,
                                                                       color:'#0f172a' }}>
                                                            {[v.SIZE_, v.COLOR].filter(Boolean).join(' · ') || 'Default'}
                                                        </span>
                                                        <span style={{ fontSize:12, fontWeight:700,
                                                            color: v.STOCK_QTY===0 ? '#dc2626'
                                                                 : v.STOCK_QTY<5  ? '#ea580c'
                                                                 : '#ca8a04' }}>
                                                            {v.STOCK_QTY} left
                                                        </span>
                                                    </div>
                                                    <StockBar qty={v.STOCK_QTY} max={20} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {items.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px',
                              background:'#fff', borderRadius:14,
                              border:'1px solid #e2e8f0' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
                    <div style={{ fontSize:18, fontWeight:600, color:'#0f172a',
                                  marginBottom:6 }}>All products well stocked!</div>
                    <div style={{ fontSize:14, color:'#64748b' }}>
                        No items below the low stock threshold
                    </div>
                </div>
            )}
        </div>
    )
}
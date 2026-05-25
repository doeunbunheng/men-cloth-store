import { useEffect, useState } from 'react'
import { getProducts, getVariants, createOrder } from '../../api'

const imgSrc = (url) => {
    if (!url) return null
    if (url.startsWith('/media')) return `http://localhost:8000${url}`
    return url
}


// ── Login Prompt Modal ────────────────────────────────────────────────────────
function LoginPrompt({ onClose }) {
    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:2000, padding:16 }}
             onClick={onClose}>
            <div style={{ background:'#fff', borderRadius:20, maxWidth:400, width:'100%',
                          padding:32, textAlign:'center',
                          boxShadow:'0 24px 60px rgba(0,0,0,.25)' }}
                 onClick={e => e.stopPropagation()}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
                <h2 style={{ fontSize:22, fontWeight:700, color:'#0f172a', marginBottom:8 }}>
                    Sign in to shop
                </h2>
                <p style={{ fontSize:14, color:'#64748b', marginBottom:28, lineHeight:1.6 }}>
                    You need an account to add items to your cart and place orders.
                    Browse our products for free!
                </p>
                <div style={{ display:"flex", gap:10 }}>
                    <a href="/login"
                        style={{ flex:1, padding:"12px", background:"#4f46e5", color:"#fff",
                                 borderRadius:10, textDecoration:"none", fontSize:14,
                                 fontWeight:600, display:"block" }}>
                        Sign in
                    </a>
                    <a href="/register"
                        style={{ flex:1, padding:"12px", background:"#f1f5f9", color:"#475569",
                                 borderRadius:10, textDecoration:"none", fontSize:14,
                                 fontWeight:600, display:"block" }}>
                        Register free
                    </a>
                </div>
                <button onClick={onClose}
                    style={{ marginTop:16, background:"none", border:"none",
                             color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
                    Continue browsing
                </button>
            </div>
        </div>
    )
}

const PLACEHOLDER = 'https://placehold.co/400x300?text=No+Image'

// ── Product Detail Modal with variant selection ───────────────────────────────
function ProductModal({ product, onClose, onAddToCart, cartItems }) {
    const [variants,  setVariants]  = useState([])
    const [selSize,   setSelSize]   = useState('')
    const [selColor,  setSelColor]  = useState('')
    const [quantity,  setQuantity]  = useState(1)
    const [loading,   setLoading]   = useState(true)
    const [imgLoaded, setImgLoaded] = useState(false)

    useEffect(() => {
        getVariants(product.PRODUCT_ID)
            .then(r => { setVariants(r.data); setLoading(false) })
            .catch(() => setLoading(false))
    }, [product.PRODUCT_ID])

    const sizes  = [...new Set(variants.map(v => v.SIZE_).filter(Boolean))]
    const colors = [...new Set(
        variants.filter(v => !selSize || v.SIZE_ === selSize)
                .map(v => v.COLOR).filter(Boolean)
    )]
    const selVariant     = variants.find(v =>
        (!selSize  || v.SIZE_  === selSize) &&
        (!selColor || v.COLOR  === selColor)
    )
    const stockAvailable = selVariant ? selVariant.STOCK_QTY : product.STOCK_QTY || 0
    const outOfStock     = stockAvailable === 0
    const src            = imgSrc(product.IMAGE_URL)
    // canAdd: no variants needed OR (size selected if sizes exist) AND (color selected if colors exist for that size)
    const needSize  = variants.length > 0 && sizes.length > 0
    const needColor = variants.length > 0 && colors.length > 0
    const canAdd    = !outOfStock && (!needSize || selSize) && (!needColor || selColor)

    const handleAdd = () => {
        if (!canAdd) return
        onAddToCart({
            ...product,
            selectedVariant: selVariant || null,
            selectedSize:    selSize    || null,
            selectedColor:   selColor   || null,
            qty:             quantity,
        })
        onClose()
    }

    // Color dot mapping
    const colorDot = (name) => {
        const map = {
            black:'#1a1a1a', white:'#f8f8f8', red:'#ef4444', blue:'#3b82f6',
            navy:'#1e3a5f', green:'#22c55e', grey:'#9ca3af', gray:'#9ca3af',
            pink:'#ec4899', yellow:'#eab308', brown:'#92400e', orange:'#f97316',
            purple:'#8b5cf6', beige:'#d4b896',
        }
        return map[name?.toLowerCase()] || '#e2e8f0'
    }

    return (
        <div style={{ position:"fixed", inset:0,
                      background:"rgba(15,12,41,.75)",
                      backdropFilter:"blur(4px)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      zIndex:1000, padding:16 }}
             onClick={onClose}>
            <div style={{ background:"#fff", borderRadius:24, maxWidth:820, width:"100%",
                          maxHeight:"92vh", overflow:"hidden",
                          boxShadow:"0 32px 80px rgba(0,0,0,.4)",
                          display:"flex", flexDirection:"column" }}
                 onClick={e => e.stopPropagation()}>

                <div style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", flex:1,
                              overflow:"hidden", minHeight:0 }}>

                    {/* ── Left: Image panel ── */}
                    <div style={{ position:"relative", background:"#0f0c1a",
                                  overflow:"hidden", minHeight:480 }}>
                        {src ? (
                            <>
                                {/* Blur placeholder */}
                                <div style={{ position:"absolute", inset:0,
                                              backgroundImage:`url(${src})`,
                                              backgroundSize:"cover",
                                              backgroundPosition:"center",
                                              filter:"blur(20px) brightness(.4)",
                                              transform:"scale(1.1)" }} />
                                <img src={src} alt={product.PRODUCT_NAME}
                                    onLoad={() => setImgLoaded(true)}
                                    style={{ position:"absolute", inset:0, width:"100%",
                                             height:"100%", objectFit:"contain",
                                             padding:"24px",
                                             transition:"opacity .4s",
                                             opacity: imgLoaded ? 1 : 0 }} />
                            </>
                        ) : (
                            <div style={{ position:"absolute", inset:0, display:"flex",
                                          alignItems:"center", justifyContent:"center",
                                          fontSize:80 }}>👔</div>
                        )}

                        {/* Top badges */}
                        <div style={{ position:"absolute", top:16, left:16, right:16,
                                      display:"flex", justifyContent:"space-between",
                                      alignItems:"flex-start" }}>
                            <span style={{ background:"rgba(255,255,255,.15)",
                                           backdropFilter:"blur(8px)",
                                           color:"#fff", fontSize:11, fontWeight:700,
                                           padding:"5px 12px", borderRadius:20,
                                           border:"1px solid rgba(255,255,255,.2)",
                                           letterSpacing:".04em",
                                           textTransform:"uppercase" }}>
                                {product.CATEGORY || "General"}
                            </span>
                            {outOfStock && (
                                <span style={{ background:"#dc2626", color:"#fff",
                                               fontSize:11, fontWeight:700,
                                               padding:"5px 12px", borderRadius:20 }}>
                                    SOLD OUT
                                </span>
                            )}
                        </div>

                        {/* Bottom price overlay */}
                        <div style={{ position:"absolute", bottom:0, left:0, right:0,
                                      background:"linear-gradient(transparent, rgba(0,0,0,.7))",
                                      padding:"40px 24px 20px" }}>
                            <div style={{ fontSize:32, fontWeight:900, color:"#fff",
                                          letterSpacing:"-.02em" }}>
                                ${product.PRICE}
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Details panel ── */}
                    <div style={{ display:"flex", flexDirection:"column",
                                  overflow:"auto", background:"#fff" }}>

                        {/* Header */}
                        <div style={{ padding:"24px 24px 0",
                                      borderBottom:"1px solid #f1f5f9",
                                      paddingBottom:20 }}>
                            <div style={{ display:"flex", justifyContent:"space-between",
                                          alignItems:"flex-start", marginBottom:12 }}>
                                <h2 style={{ fontSize:20, fontWeight:800, color:"#0f172a",
                                             margin:0, lineHeight:1.3, flex:1,
                                             paddingRight:12 }}>
                                    {product.PRODUCT_NAME}
                                </h2>
                                <button onClick={onClose}
                                    style={{ width:32, height:32, background:"#f1f5f9",
                                             border:"none", borderRadius:10,
                                             cursor:"pointer", fontSize:14, color:"#64748b",
                                             display:"flex", alignItems:"center",
                                             justifyContent:"center", flexShrink:0 }}>✕</button>
                            </div>

                            {/* Stock indicator */}
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div style={{ width:8, height:8, borderRadius:"50%",
                                              background: outOfStock ? "#dc2626"
                                                        : stockAvailable < 5 ? "#f59e0b"
                                                        : "#16a34a" }} />
                                <span style={{ fontSize:12, color:"#64748b", fontWeight:500 }}>
                                    {outOfStock ? "Out of stock"
                                     : stockAvailable < 5 ? `Only ${stockAvailable} left`
                                     : `${stockAvailable} in stock`}
                                </span>
                            </div>
                        </div>

                        {/* Options */}
                        <div style={{ flex:1, padding:"20px 24px",
                                      display:"flex", flexDirection:"column", gap:20 }}>

                            {loading ? (
                                <div style={{ color:"#94a3b8", fontSize:13,
                                              display:"flex", alignItems:"center", gap:8 }}>
                                    <div style={{ width:16, height:16, borderRadius:"50%",
                                                  border:"2px solid #e2e8f0",
                                                  borderTopColor:"#6366f1",
                                                  animation:"spin .6s linear infinite" }} />
                                    Loading options...
                                </div>
                            ) : variants.length === 0 ? (
                                <div style={{ background:"#f8fafc", borderRadius:12,
                                              padding:"14px 16px", fontSize:13,
                                              color:"#64748b", border:"1px solid #f1f5f9" }}>
                                    ✓ Standard item — no size/color options needed
                                </div>
                            ) : (
                                <>
                                    {/* Size */}
                                    {sizes.length > 0 && (
                                        <div>
                                            <div style={{ display:"flex", justifyContent:"space-between",
                                                          marginBottom:10 }}>
                                                <span style={{ fontSize:12, fontWeight:700,
                                                               color:"#0f172a", textTransform:"uppercase",
                                                               letterSpacing:".06em" }}>Size</span>
                                                {selSize && (
                                                    <span style={{ fontSize:12, color:"#6366f1",
                                                                   fontWeight:600 }}>{selSize}</span>
                                                )}
                                            </div>
                                            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                                {sizes.map(s => (
                                                    <button key={s}
                                                        onClick={() => { setSelSize(s); setSelColor("") }}
                                                        style={{ minWidth:48, padding:"10px 14px",
                                                                 borderRadius:10, fontSize:14,
                                                                 fontWeight:700, cursor:"pointer",
                                                                 transition:"all .15s",
                                                                 border: selSize===s
                                                                     ? "2px solid #4f46e5"
                                                                     : "2px solid #e2e8f0",
                                                                 background: selSize===s
                                                                     ? "#4f46e5" : "#fff",
                                                                 color: selSize===s ? "#fff" : "#374151",
                                                                 boxShadow: selSize===s
                                                                     ? "0 4px 12px rgba(79,70,229,.3)"
                                                                     : "none" }}>
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Color */}
                                    {colors.length > 0 && (
                                        <div>
                                            <div style={{ display:"flex", justifyContent:"space-between",
                                                          marginBottom:10 }}>
                                                <span style={{ fontSize:12, fontWeight:700,
                                                               color:"#0f172a", textTransform:"uppercase",
                                                               letterSpacing:".06em" }}>Color</span>
                                                {selColor && (
                                                    <span style={{ fontSize:12, color:"#6366f1",
                                                                   fontWeight:600 }}>{selColor}</span>
                                                )}
                                            </div>
                                            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                                                {colors.map(c => {
                                                    const dot = colorDot(c)
                                                    const isLight = ['white','beige','yellow'].includes(c?.toLowerCase())
                                                    return (
                                                        <button key={c}
                                                            onClick={() => setSelColor(c)}
                                                            title={c}
                                                            style={{ display:"flex", alignItems:"center",
                                                                     gap:8, padding:"8px 14px",
                                                                     borderRadius:10, cursor:"pointer",
                                                                     transition:"all .15s",
                                                                     border: selColor===c
                                                                         ? "2px solid #4f46e5"
                                                                         : "2px solid #e2e8f0",
                                                                     background: selColor===c
                                                                         ? "#f5f3ff" : "#fff",
                                                                     boxShadow: selColor===c
                                                                         ? "0 4px 12px rgba(79,70,229,.2)"
                                                                         : "none" }}>
                                                            <div style={{ width:18, height:18,
                                                                          borderRadius:"50%",
                                                                          background: dot,
                                                                          border: isLight
                                                                              ? "1.5px solid #e2e8f0"
                                                                              : "none",
                                                                          flexShrink:0 }} />
                                                            <span style={{ fontSize:13, fontWeight:500,
                                                                           color: selColor===c
                                                                               ? "#4f46e5" : "#374151" }}>
                                                                {c}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Quantity */}
                            {!outOfStock && (
                                <div>
                                    <div style={{ fontSize:12, fontWeight:700, color:"#0f172a",
                                                  textTransform:"uppercase", letterSpacing:".06em",
                                                  marginBottom:10 }}>Quantity</div>
                                    <div style={{ display:"flex", alignItems:"center", gap:0,
                                                  background:"#f8fafc", borderRadius:12,
                                                  border:"1.5px solid #e2e8f0",
                                                  width:"fit-content" }}>
                                        <button onClick={() => setQuantity(q => Math.max(1,q-1))}
                                            style={{ width:44, height:44, background:"none",
                                                     border:"none", cursor:"pointer", fontSize:20,
                                                     color:"#374151", borderRadius:"10px 0 0 10px",
                                                     display:"flex", alignItems:"center",
                                                     justifyContent:"center",
                                                     transition:"background .15s" }}
                                            onMouseEnter={e => e.target.style.background="#e2e8f0"}
                                            onMouseLeave={e => e.target.style.background="transparent"}>
                                            −
                                        </button>
                                        <span style={{ minWidth:48, textAlign:"center",
                                                       fontSize:16, fontWeight:800,
                                                       color:"#0f172a", userSelect:"none" }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(stockAvailable||99,q+1))}
                                            style={{ width:44, height:44, background:"none",
                                                     border:"none", cursor:"pointer", fontSize:20,
                                                     color:"#374151", borderRadius:"0 10px 10px 0",
                                                     display:"flex", alignItems:"center",
                                                     justifyContent:"center",
                                                     transition:"background .15s" }}
                                            onMouseEnter={e => e.target.style.background="#e2e8f0"}
                                            onMouseLeave={e => e.target.style.background="transparent"}>
                                            +
                                        </button>
                                    </div>
                                    <div style={{ fontSize:12, color:"#94a3b8", marginTop:8 }}>
                                        Subtotal:{" "}
                                        <span style={{ fontWeight:700, color:"#0f172a",
                                                       fontSize:14 }}>
                                            ${(product.PRICE * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer CTA */}
                        <div style={{ padding:"16px 24px 24px",
                                      borderTop:"1px solid #f1f5f9" }}>

                            {/* Selection hint */}
                            {needSize && !selSize && (
                                <div style={{ background:"#fffbeb", border:"1px solid #fde68a",
                                              borderRadius:10, padding:"10px 14px",
                                              fontSize:12, color:"#92400e",
                                              marginBottom:12, fontWeight:500 }}>
                                    👆 Please select a size to continue
                                </div>
                            )}

                            <button onClick={handleAdd}
                                disabled={!canAdd}
                                style={{ width:"100%", padding:"15px",
                                         border:"none", borderRadius:14,
                                         fontSize:15, fontWeight:800,
                                         cursor: canAdd ? "pointer" : "not-allowed",
                                         transition:"all .2s",
                                         background: outOfStock
                                             ? "#e2e8f0"
                                             : !canAdd
                                             ? "linear-gradient(135deg,#c7d2fe,#ddd6fe)"
                                             : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                                         color: outOfStock ? "#94a3b8" : "#fff",
                                         boxShadow: canAdd&&!outOfStock
                                             ? "0 6px 20px rgba(79,70,229,.4)" : "none",
                                         letterSpacing:".01em" }}
                                onMouseEnter={e => { if(canAdd&&!outOfStock) e.target.style.transform="translateY(-1px)" }}
                                onMouseLeave={e => e.target.style.transform="none"}>
                                {outOfStock ? "😞 Out of Stock"
                                 : !canAdd   ? "Select options above"
                                 :             "🛒 Add to Cart"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )
}

// ── Inline Editor (local state for immediate feedback) ───────
function InlineEditor({ item, variants, onSave, onClose }) {
    const sizes   = [...new Set(variants.map(v => v.SIZE_).filter(Boolean))]
    const [localSize,  setLocalSize]  = useState(item.selectedSize  || '')
    const [localColor, setLocalColor] = useState(item.selectedColor || '')

    const colorsForSize = [...new Set(
        variants.filter(v => !localSize || v.SIZE_ === localSize)
                .map(v => v.COLOR).filter(Boolean)
    )]

    const handleSave = () => {
        onSave(localSize || null, localColor || null)
    }

    return (
        <div style={{ padding:'14px 16px', background:'#f5f3ff',
                      borderTop:'1px solid #ddd6fe' }}>
            {variants.length === 0 ? (
                <div style={{ fontSize:12, color:'#64748b', textAlign:'center', padding:'4px' }}>
                    No size/color options for this item
                </div>
            ) : (
                <>
                    {/* Size */}
                    {sizes.length > 0 && (
                        <div style={{ marginBottom:12 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:'#4f46e5',
                                          marginBottom:8, textTransform:'uppercase',
                                          letterSpacing:'.05em' }}>Size</div>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {sizes.map(s => (
                                    <button key={s}
                                        onClick={() => { setLocalSize(s); setLocalColor('') }}
                                        style={{ padding:'7px 16px', borderRadius:10,
                                                 fontSize:13, fontWeight:700, cursor:'pointer',
                                                 border:`2px solid ${localSize===s?'#4f46e5':'#ddd6fe'}`,
                                                 background: localSize===s ? '#4f46e5' : '#fff',
                                                 color:      localSize===s ? '#fff'    : '#4f46e5',
                                                 transition:'all .15s' }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color */}
                    {colorsForSize.length > 0 && (
                        <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:11, fontWeight:700, color:'#4f46e5',
                                          marginBottom:8, textTransform:'uppercase',
                                          letterSpacing:'.05em' }}>Color</div>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {colorsForSize.map(c => (
                                    <button key={c}
                                        onClick={() => setLocalColor(c)}
                                        style={{ padding:'7px 16px', borderRadius:10,
                                                 fontSize:13, fontWeight:500, cursor:'pointer',
                                                 border:`2px solid ${localColor===c?'#4f46e5':'#ddd6fe'}`,
                                                 background: localColor===c ? '#f0edff' : '#fff',
                                                 color:      localColor===c ? '#4f46e5' : '#475569',
                                                 transition:'all .15s' }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save/Cancel */}
                    <div style={{ display:'flex', gap:8 }}>
                        <button onClick={handleSave}
                            style={{ flex:1, padding:'9px', background:'#4f46e5', color:'#fff',
                                     border:'none', borderRadius:10, fontSize:13,
                                     fontWeight:700, cursor:'pointer' }}>
                            ✓ Apply Changes
                        </button>
                        <button onClick={onClose}
                            style={{ padding:'9px 14px', background:'#fff', color:'#64748b',
                                     border:'1px solid #ddd6fe', borderRadius:10,
                                     fontSize:13, cursor:'pointer' }}>
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

function CartSidebar({ cart, onClose, onRemove, onQtyChange, onPlaceOrder, placing, orderMsg, onEditSave }) {
    const total = cart.reduce((s, i) => s + i.PRICE * i.qty, 0)
    const [editingKey, setEditingKey] = useState(null)
    const [varMap,     setVarMap]     = useState({})

    const loadVariants = async (productId) => {
        if (varMap[productId]) return
        try {
            const res = await getVariants(productId)
            setVarMap(prev => ({ ...prev, [productId]: res.data }))
        } catch(e) { console.error(e) }
    }

    const toggleEdit = (idx, productId) => {
        const key = `${idx}-${productId}`
        if (editingKey === key) { setEditingKey(null) }
        else { setEditingKey(key); loadVariants(productId) }
    }

    return (
        <div style={{ position:'fixed', inset:0, zIndex:999 }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)' }} onClick={onClose}/>
            <div style={{ position:'absolute', right:0, top:0, bottom:0, width:420, background:'#fff',
                          boxShadow:'-8px 0 40px rgba(0,0,0,.15)', display:'flex',
                          flexDirection:'column', overflow:'hidden' }}>

                {/* Header */}
                <div style={{ padding:'20px 24px', borderBottom:'1px solid #f1f5f9',
                              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:17, fontWeight:700, color:'#0f172a' }}>
                        🛒 My Cart{' '}
                        <span style={{ fontSize:14, color:'#94a3b8', fontWeight:400 }}>
                            ({cart.reduce((s,i)=>s+i.qty,0)} items)
                        </span>
                    </span>
                    <button onClick={onClose}
                        style={{ background:'#f1f5f9', border:'none', borderRadius:8,
                                 padding:'6px 10px', cursor:'pointer', fontSize:16, color:'#64748b' }}>✕</button>
                </div>

                {/* Items */}
                <div style={{ flex:1, overflow:'auto', padding:'12px 20px' }}>
                    {orderMsg && (
                        <div style={{ padding:'10px 14px', borderRadius:10, marginBottom:12, fontSize:13,
                            background: orderMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${orderMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                            color: orderMsg.startsWith('✓') ? '#15803d' : '#dc2626' }}>
                            {orderMsg}
                        </div>
                    )}

                    {cart.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'60px 0', color:'#94a3b8' }}>
                            <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
                            <div style={{ fontSize:15, fontWeight:500 }}>Your cart is empty</div>
                        </div>
                    ) : cart.map((item, idx) => {
                        const src      = imgSrc(item.IMAGE_URL)
                        const key      = `${idx}-${item.PRODUCT_ID}`
                        const isEditing = editingKey === key
                        const variants  = varMap[item.PRODUCT_ID] || []

                        return (
                            <div key={idx} style={{ background:'#fff', borderRadius:14,
                                                    border:'1px solid #f1f5f9', marginBottom:10,
                                                    overflow:'hidden',
                                                    boxShadow:'0 1px 4px rgba(0,0,0,.04)' }}>
                                {/* Product row */}
                                <div style={{ display:'flex', gap:12, padding:'14px',
                                              alignItems:'center' }}>
                                    <div style={{ width:60, height:60, borderRadius:10, flexShrink:0,
                                                  background:'#f8fafc', overflow:'hidden',
                                                  border:'1px solid #e2e8f0' }}>
                                        {src
                                            ? <img src={src} alt={item.PRODUCT_NAME}
                                                   style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                            : <div style={{ width:'100%', height:'100%', display:'flex',
                                                            alignItems:'center', justifyContent:'center',
                                                            fontSize:24 }}>👔</div>}
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:14, fontWeight:600, color:'#0f172a',
                                                      marginBottom:4, overflow:'hidden',
                                                      textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                            {item.PRODUCT_NAME}
                                        </div>
                                        <div style={{ display:'flex', gap:5, marginBottom:5, flexWrap:'wrap' }}>
                                            {item.selectedSize && (
                                                <span style={{ fontSize:11, fontWeight:600,
                                                               background:'#ede9fe', color:'#5b21b6',
                                                               padding:'2px 8px', borderRadius:12 }}>
                                                    {item.selectedSize}
                                                </span>
                                            )}
                                            {item.selectedColor && (
                                                <span style={{ fontSize:11, background:'#f1f5f9',
                                                               color:'#475569', padding:'2px 8px',
                                                               borderRadius:12 }}>
                                                    {item.selectedColor}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize:12, color:'#94a3b8' }}>${item.PRICE} each</div>
                                        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                                            <button onClick={() => onQtyChange(idx, item.qty-1)}
                                                style={{ width:28, height:28, borderRadius:8,
                                                         border:'1px solid #e2e8f0', background:'#f8fafc',
                                                         cursor:'pointer', fontSize:16, display:'flex',
                                                         alignItems:'center', justifyContent:'center',
                                                         fontWeight:700 }}>−</button>
                                            <span style={{ fontSize:14, fontWeight:700, minWidth:24,
                                                           textAlign:'center' }}>{item.qty}</span>
                                            <button onClick={() => onQtyChange(idx, item.qty+1)}
                                                style={{ width:28, height:28, borderRadius:8,
                                                         border:'1px solid #e2e8f0', background:'#f8fafc',
                                                         cursor:'pointer', fontSize:16, display:'flex',
                                                         alignItems:'center', justifyContent:'center',
                                                         fontWeight:700 }}>+</button>
                                        </div>
                                    </div>

                                    <div style={{ textAlign:'right', flexShrink:0 }}>
                                        <div style={{ fontSize:16, fontWeight:800, color:'#4f46e5',
                                                      marginBottom:8 }}>
                                            ${(item.PRICE * item.qty).toFixed(2)}
                                        </div>
                                        <button onClick={() => onRemove(idx)}
                                            style={{ fontSize:11, color:'#dc2626', background:'none',
                                                     border:'none', cursor:'pointer', fontWeight:500,
                                                     textDecoration:'underline' }}>Remove</button>
                                    </div>
                                </div>

                                {/* Edit bar */}
                                <div style={{ borderTop:'1px solid #f8fafc', background:'#fafafa',
                                              padding:'0' }}>
                                    <button onClick={() => toggleEdit(idx, item.PRODUCT_ID)}
                                        style={{ width:'100%', padding:'9px 14px', background:'none',
                                                 border:'none', cursor:'pointer', fontSize:12,
                                                 fontWeight:600, color: isEditing ? '#4f46e5' : '#64748b',
                                                 display:'flex', alignItems:'center',
                                                 justifyContent:'center', gap:6,
                                                 background: isEditing ? '#f0edff' : 'transparent' }}>
                                        ✏️ {isEditing ? 'Close editor' : 'Change size / color'}
                                        <span style={{ fontSize:10, color:'#94a3b8' }}>
                                            {isEditing ? '▲' : '▼'}
                                        </span>
                                    </button>
                                </div>

                                {/* Inline editor */}
                                {isEditing && (
                                    <InlineEditor
                                        key={key}
                                        item={item}
                                        variants={variants}
                                        onSave={(size, color) => {
                                            onEditSave(idx, { selectedSize: size, selectedColor: color })
                                            setEditingKey(null)
                                        }}
                                        onClose={() => setEditingKey(null)}
                                    />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div style={{ padding:'20px 24px', borderTop:'1px solid #f1f5f9' }}>
                        <div style={{ display:'flex', justifyContent:'space-between',
                                      marginBottom:16 }}>
                            <span style={{ color:'#64748b', fontWeight:500, fontSize:16 }}>Total</span>
                            <span style={{ color:'#0f172a', fontWeight:700, fontSize:22 }}>
                                ${total.toFixed(2)}
                            </span>
                        </div>
                        <button onClick={onPlaceOrder} disabled={placing}
                            style={{ width:'100%', padding:'14px',
                                     background: placing ? '#94a3b8' : '#4f46e5',
                                     color:'#fff', border:'none', borderRadius:12,
                                     fontSize:15, fontWeight:600,
                                     cursor: placing ? 'not-allowed' : 'pointer' }}>
                            {placing ? 'Placing Order...' : '✓ Place Order'}
                        </button>
                        <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:10 }}>
                            Free shipping over $50 · Secure checkout
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}


// ── Main Products Page ────────────────────────────────────────────────────────
export default function Products() {
    const [products, setProducts] = useState([])
    const [search,   setSearch]   = useState('')
    const [filter,   setFilter]   = useState('All')
    const [loading,  setLoading]  = useState(true)
    const [hovered,  setHovered]  = useState(null)
    const [selected, setSelected] = useState(null)
    const [cart,     setCart]     = useState([])
    const [showCart, setShowCart] = useState(false)
    const [placing,  setPlacing]  = useState(false)
    const [orderMsg, setOrderMsg] = useState('')
    const [showLogin,    setShowLogin]    = useState(false)
    const [editCartItem, setEditCartItem] = useState(null)
    const isLoggedIn = !!localStorage.getItem('token')

    useEffect(() => {
        getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false))
    }, [])

    const categories = ['All', ...new Set(products.map(p => p.CATEGORY).filter(Boolean))]

    const filtered = products.filter(p => {
        const ms = p.PRODUCT_NAME?.toLowerCase().includes(search.toLowerCase()) ||
                   p.CATEGORY?.toLowerCase().includes(search.toLowerCase())
        const mf = filter === 'All' || p.CATEGORY === filter
        return ms && mf
    })

    // Cart by index (support same product with different variants)
    const addToCart = (product) => {
        if (!isLoggedIn) { setShowLogin(true); return }
        setCart(prev => {
            const existIdx = prev.findIndex(i =>
                i.PRODUCT_ID === product.PRODUCT_ID &&
                i.selectedSize  === product.selectedSize &&
                i.selectedColor === product.selectedColor
            )
            if (existIdx >= 0) {
                const next = [...prev]
                next[existIdx] = { ...next[existIdx], qty: next[existIdx].qty + product.qty }
                return next
            }
            return [...prev, { ...product }]
        })
        setOrderMsg('')
    }

    const removeFromCart = (idx) => setCart(prev => prev.filter((_, i) => i !== idx))

    const updateCartItem = (updatedItem) => {
        setCart(prev => prev.map(i =>
            i.PRODUCT_ID === updatedItem.PRODUCT_ID &&
            i.selectedSize  === editCartItem.selectedSize &&
            i.selectedColor === editCartItem.selectedColor
                ? updatedItem : i
        ))
    }
    const changeQty      = (idx, qty) => {
        if (qty <= 0) { removeFromCart(idx); return }
        setCart(prev => prev.map((item, i) => i === idx ? { ...item, qty } : item))
    }

    const placeOrder = async () => {
        const customerId = localStorage.getItem('customer_id')
        const userId     = localStorage.getItem('user_id')
        if (!customerId) {
            setOrderMsg('✕ No customer profile found. Please contact support.')
            return
        }
        setPlacing(true)
        try {
            await createOrder({
                customer_id: parseInt(customerId),
                user_id:     parseInt(userId),
                items: cart.map(i => ({
                    product_id:     i.PRODUCT_ID,
                    variant_id:     i.selectedVariant?.VARIANT_ID || null,
                    quantity:       i.qty,
                    unit_price:     i.PRICE,
                    selected_size:  i.selectedSize  || null,
                    selected_color: i.selectedColor || null,
                }))
            })
            setCart([])
            setOrderMsg('✓ Order placed! Check My Orders to track it.')
        } catch (e) {
            setOrderMsg('✕ Order failed: ' + (e.response?.data?.error || e.message))
        }
        setPlacing(false)
    }

    const cartCount = cart.reduce((s, i) => s + i.qty, 0)

    if (loading) return (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                      height:300, color:'#94a3b8', fontSize:15 }}>Loading...</div>
    )

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

            {/* Hero */}
            <div style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4f46e5 100%)',
                          borderRadius:20, padding:'40px 36px', marginBottom:32,
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-40, right:-40, width:200, height:200,
                              background:'rgba(255,255,255,.04)', borderRadius:'50%' }}/>
                <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#a5b4fc',
                                  letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>
                        New Collection 2026
                    </div>
                    <h1 style={{ fontSize:34, fontWeight:700, color:'#fff', margin:'0 0 8px' }}>
                        Men's Clothing
                    </h1>
                    <p style={{ fontSize:14, color:'#c7d2fe', margin:0 }}>
                        {products.length} products · Free shipping over $50
                    </p>
                </div>
                <button onClick={() => setShowCart(true)}
                    style={{ position:'relative', background:'rgba(255,255,255,.15)',
                             backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.2)',
                             borderRadius:14, padding:'14px 20px', cursor:'pointer',
                             color:'#fff', fontSize:24, transition:'all .2s' }}
                    onMouseEnter={e => e.target.style.background='rgba(255,255,255,.25)'}
                    onMouseLeave={e => e.target.style.background='rgba(255,255,255,.15)'}>
                    🛒
                    {cartCount > 0 && (
                        <span style={{ position:'absolute', top:-8, right:-8, background:'#f43f5e',
                                       color:'#fff', borderRadius:'50%', width:22, height:22,
                                       fontSize:12, fontWeight:700, display:'flex',
                                       alignItems:'center', justifyContent:'center',
                                       border:'2px solid #312e81' }}>{cartCount}</span>
                    )}
                </button>
            </div>

            {/* Order result */}
            {orderMsg && !showCart && (
                <div style={{ padding:'12px 16px', borderRadius:10, marginBottom:20, fontSize:13,
                    background: orderMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${orderMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                    color: orderMsg.startsWith('✓') ? '#15803d' : '#dc2626' }}>
                    {orderMsg}
                </div>
            )}

            {/* Search + Filter */}
            <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
                <div style={{ position:'relative', flex:1, minWidth:200 }}>
                    <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)',
                                   fontSize:15, color:'#94a3b8' }}>🔍</span>
                    <input style={{ width:'100%', padding:'11px 14px 11px 36px', border:'1.5px solid #e2e8f0',
                                    borderRadius:10, fontSize:14, outline:'none',
                                    boxSizing:'border-box', background:'#fff', fontFamily:'inherit' }}
                        placeholder="Search products..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={e => e.target.style.borderColor='#6366f1'}
                        onBlur={e  => e.target.style.borderColor='#e2e8f0'} />
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)}
                            style={{ padding:'9px 18px', borderRadius:10, fontSize:13, fontWeight:500,
                                     cursor:'pointer', border:'1.5px solid', fontFamily:'inherit',
                                     transition:'all .15s',
                                     borderColor: filter===cat ? '#4f46e5' : '#e2e8f0',
                                     background:  filter===cat ? '#4f46e5' : '#fff',
                                     color:       filter===cat ? '#fff'    : '#64748b' }}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ fontSize:13, color:'#94a3b8', marginBottom:16 }}>
                Showing {filtered.length} of {products.length} products
            </div>

            {/* Product Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:24 }}>
                {filtered.map(p => {
                    const src      = imgSrc(p.IMAGE_URL)
                    const isHover  = hovered === p.PRODUCT_ID
                    const outStock = p.STOCK_QTY === 0
                    const inCart   = cart.filter(i => i.PRODUCT_ID === p.PRODUCT_ID)
                                        .reduce((s,i)=>s+i.qty,0)

                    return (
                        <div key={p.PRODUCT_ID}
                            onMouseEnter={() => setHovered(p.PRODUCT_ID)}
                            onMouseLeave={() => setHovered(null)}
                            style={{ background:'#fff', borderRadius:16, border:'1px solid #f1f5f9',
                                     overflow:'hidden',
                                     boxShadow: isHover ? '0 12px 40px rgba(79,70,229,.15)'
                                                        : '0 2px 8px rgba(0,0,0,.05)',
                                     transform: isHover ? 'translateY(-4px)' : 'none',
                                     transition:'all .25s ease', opacity: outStock ? .75 : 1 }}>

                            <div style={{ position:'relative', height:220, background:'#f8fafc',
                                          overflow:'hidden', cursor:'pointer' }}
                                 onClick={() => setSelected(p)}>
                                {src ? (
                                    <img src={src} alt={p.PRODUCT_NAME}
                                        style={{ width:'100%', height:'100%', objectFit:'cover',
                                                 display:'block', transition:'transform .3s',
                                                 transform: isHover ? 'scale(1.05)' : 'scale(1)' }}
                                        onError={e => { e.target.style.display='none' }} />
                                ) : (
                                    <div style={{ width:'100%', height:'100%', display:'flex',
                                                  alignItems:'center', justifyContent:'center', fontSize:64 }}>👔</div>
                                )}

                                <div style={{ position:'absolute', top:12, left:12,
                                              background:'rgba(0,0,0,.55)', backdropFilter:'blur(4px)',
                                              color:'#fff', fontSize:11, fontWeight:600,
                                              padding:'4px 10px', borderRadius:20 }}>
                                    {p.CATEGORY || 'General'}
                                </div>

                                {inCart > 0 && (
                                    <div style={{ position:'absolute', top:12, right:12,
                                                  background:'#4f46e5', color:'#fff', fontSize:11,
                                                  fontWeight:700, padding:'4px 10px', borderRadius:20 }}>
                                        {inCart} in cart
                                    </div>
                                )}

                                {isHover && !outStock && (
                                    <div style={{ position:'absolute', inset:0,
                                                  background:'rgba(79,70,229,.12)',
                                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <span style={{ background:'#fff', color:'#4f46e5', fontSize:13,
                                                       fontWeight:600, padding:'8px 18px', borderRadius:20,
                                                       boxShadow:'0 4px 12px rgba(0,0,0,.1)' }}>
                                            View Details
                                        </span>
                                    </div>
                                )}

                                {outStock && (
                                    <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.6)',
                                                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <span style={{ background:'#dc2626', color:'#fff', fontSize:12,
                                                       fontWeight:700, padding:'6px 14px', borderRadius:20 }}>
                                            SOLD OUT
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding:'16px 18px 18px' }}>
                                <h3 style={{ fontSize:16, fontWeight:600, color:'#0f172a', margin:'0 0 8px',
                                             cursor:'pointer' }} onClick={() => setSelected(p)}>
                                    {p.PRODUCT_NAME}
                                </h3>
                                <div style={{ display:'flex', justifyContent:'space-between',
                                              alignItems:'center' }}>
                                    <span style={{ fontSize:22, fontWeight:700, color:'#4f46e5' }}>
                                        ${p.PRICE}
                                    </span>
                                    <button onClick={() => setSelected(p)} disabled={outStock}
                                        style={{ padding:'8px 14px', borderRadius:10, fontSize:13,
                                                 fontWeight:600, cursor: outStock ? 'not-allowed' : 'pointer',
                                                 border:'none', transition:'all .15s',
                                                 background: outStock ? '#e2e8f0' : inCart ? '#ede9fe' : '#4f46e5',
                                                 color:      outStock ? '#94a3b8' : inCart ? '#4f46e5' : '#fff' }}>
                                        {outStock ? 'Sold Out' : inCart ? `✓ ${inCart} Added` : '+ Select'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px', color:'#94a3b8' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
                    <div style={{ fontSize:16, fontWeight:500 }}>No products found</div>
                </div>
            )}

            {showLogin && <LoginPrompt onClose={() => setShowLogin(false)} />}

            {/* Product Detail Modal */}
            {selected && (
                <ProductModal product={selected} onClose={() => setSelected(null)}
                    onAddToCart={addToCart} cartItems={cart} />
            )}

            {/* Cart Sidebar */}
            {showCart && (
                <CartSidebar cart={cart} onClose={() => setShowCart(false)}
                    onRemove={removeFromCart} onQtyChange={changeQty}
                    onPlaceOrder={placeOrder} placing={placing} orderMsg={orderMsg}
                    onEditSave={(idx, changes) => { setCart(prev => prev.map((item, i) => i === idx ? { ...item, ...changes } : item)) }} />
            )}

            {/* Floating cart button */}
            {cartCount > 0 && !showCart && (
                <button onClick={() => setShowCart(true)}
                    style={{ position:'fixed', bottom:28, right:28, width:60, height:60,
                             background:'#4f46e5', color:'#fff', border:'none', borderRadius:'50%',
                             fontSize:24, cursor:'pointer', zIndex:998,
                             boxShadow:'0 8px 24px rgba(79,70,229,.4)',
                             display:'flex', alignItems:'center', justifyContent:'center' }}>
                    🛒
                    <span style={{ position:'absolute', top:-4, right:-4, background:'#f43f5e',
                                   color:'#fff', borderRadius:'50%', width:20, height:20,
                                   fontSize:11, fontWeight:700, display:'flex',
                                   alignItems:'center', justifyContent:'center',
                                   border:'2px solid #fff' }}>{cartCount}</span>
                </button>
            )}
        </div>
    )
}
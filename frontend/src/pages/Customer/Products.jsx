// src/pages/Customer/Products.jsx
// ZANDO-style retail UI — all original functionality preserved.
// What changed: hero, colors (blue/black/white), card aesthetic, button styles.
// What's intact: variants modal, cart sidebar, inline editor, login prompt,
//                place order, floating cart, stock states.

import { useEffect, useState } from 'react'
import { getProducts, getVariants, createOrder } from '../../api'

// ===== Palette =====
const INK     = '#0A0A0A'
const TEXT    = '#1a1a1a'
const MUTED   = '#7a7a7a'
const BORDER  = '#eaeaea'
const BG_SOFT = '#f5f5f5'
const ACCENT  = '#1454D6'      // primary blue
const ACCENT_DARK = '#0C447C'  // hover/dark blue
const ACCENT_BG   = '#E6F1FB'  // pale blue tint
const DANGER  = '#c0392b'
const SUCCESS = '#15803d'

const imgSrc = (url) => {
    if (!url) return null
    return url
}

// ── Login Prompt Modal ────────────────────────────────────────────────────────
function LoginPrompt({ onClose }) {
    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(10,10,10,.65)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:2000, padding:16 }}
             onClick={onClose}>
            <div style={{ background:'#fff', borderRadius:12, maxWidth:420, width:'100%',
                          padding:36, textAlign:'center',
                          boxShadow:'0 24px 60px rgba(0,0,0,.25)' }}
                 onClick={e => e.stopPropagation()}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:ACCENT_BG,
                              color:ACCENT, fontSize:24, display:'flex', alignItems:'center',
                              justifyContent:'center', margin:'0 auto 20px', fontWeight:700 }}>🔒</div>
                <h2 style={{ fontSize:22, fontWeight:800, color:INK, marginBottom:8,
                             letterSpacing:'-0.01em' }}>
                    Sign in to shop
                </h2>
                <p style={{ fontSize:14, color:MUTED, marginBottom:28, lineHeight:1.6 }}>
                    You need an account to add items to your cart and place orders.
                    Browse our products for free!
                </p>
                <div style={{ display:'flex', gap:10 }}>
                    <a href="/login"
                        style={{ flex:1, padding:'13px', background:INK, color:'#fff',
                                 borderRadius:4, textDecoration:'none', fontSize:12,
                                 fontWeight:700, letterSpacing:'0.1em',
                                 textTransform:'uppercase', display:'block' }}>
                        Sign in
                    </a>
                    <a href="/register"
                        style={{ flex:1, padding:'13px', background:'#fff', color:INK,
                                 border:`1px solid ${BORDER}`, borderRadius:4,
                                 textDecoration:'none', fontSize:12, fontWeight:700,
                                 letterSpacing:'0.1em', textTransform:'uppercase',
                                 display:'block' }}>
                        Register
                    </a>
                </div>
                <button onClick={onClose}
                    style={{ marginTop:18, background:'none', border:'none',
                             color:MUTED, cursor:'pointer', fontSize:13,
                             textDecoration:'underline' }}>
                    Continue browsing
                </button>
            </div>
        </div>
    )
}

// ── Product Detail Modal with variant selection ───────────────────────────────
function ProductModal({ product, onClose, onAddToCart }) {
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

    const colorDot = (name) => {
        const map = {
            black:'#1a1a1a', white:'#f8f8f8', red:'#ef4444', blue:'#1454D6',
            navy:'#1e3a5f', green:'#22c55e', grey:'#9ca3af', gray:'#9ca3af',
            pink:'#ec4899', yellow:'#eab308', brown:'#92400e', orange:'#f97316',
            purple:'#8b5cf6', beige:'#d4b896',
        }
        return map[name?.toLowerCase()] || '#e2e8f0'
    }

    return (
        <div style={{ position:'fixed', inset:0,
                      background:'rgba(10,10,10,.7)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:1000, padding:16 }}
             onClick={onClose}>
            <div style={{ background:'#fff', borderRadius:12, maxWidth:880, width:'100%',
                          maxHeight:'92vh', overflow:'hidden',
                          boxShadow:'0 32px 80px rgba(0,0,0,.4)',
                          display:'flex', flexDirection:'column' }}
                 onClick={e => e.stopPropagation()}>

                <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr', flex:1,
                              overflow:'hidden', minHeight:0 }}>

                    {/* ── Left: Image panel ── */}
                    <div style={{ position:'relative', background:BG_SOFT,
                                  overflow:'hidden', minHeight:480 }}>
                        {src ? (
                            <img src={src} alt={product.PRODUCT_NAME}
                                onLoad={() => setImgLoaded(true)}
                                style={{ width:'100%', height:'100%', objectFit:'cover',
                                         display:'block',
                                         transition:'opacity .4s',
                                         opacity: imgLoaded ? 1 : 0 }} />
                        ) : (
                            <div style={{ position:'absolute', inset:0, display:'flex',
                                          alignItems:'center', justifyContent:'center',
                                          color:'#bdbdbd', fontSize:11,
                                          letterSpacing:'0.2em', textTransform:'uppercase' }}>
                                No Image
                            </div>
                        )}

                        {/* Top badges */}
                        <div style={{ position:'absolute', top:16, left:16, right:16,
                                      display:'flex', justifyContent:'space-between',
                                      alignItems:'flex-start' }}>
                            <span style={{ background:'rgba(255,255,255,0.95)',
                                           color:INK, fontSize:10, fontWeight:700,
                                           padding:'5px 12px', borderRadius:4,
                                           letterSpacing:'0.1em',
                                           textTransform:'uppercase' }}>
                                {product.CATEGORY || 'General'}
                            </span>
                            {outOfStock && (
                                <span style={{ background:DANGER, color:'#fff',
                                               fontSize:10, fontWeight:700,
                                               padding:'5px 12px', borderRadius:4,
                                               letterSpacing:'0.1em',
                                               textTransform:'uppercase' }}>
                                    Sold Out
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Details panel ── */}
                    <div style={{ display:'flex', flexDirection:'column',
                                  overflow:'auto', background:'#fff' }}>

                        {/* Header */}
                        <div style={{ padding:'28px 28px 0',
                                      borderBottom:`1px solid ${BORDER}`,
                                      paddingBottom:20 }}>
                            <div style={{ display:'flex', justifyContent:'space-between',
                                          alignItems:'flex-start', marginBottom:14 }}>
                                <div style={{ flex:1, paddingRight:12 }}>
                                    <div style={{ fontSize:10, fontWeight:700, color:MUTED,
                                                  letterSpacing:'0.15em',
                                                  textTransform:'uppercase', marginBottom:6 }}>
                                        {product.CATEGORY || 'General'}
                                    </div>
                                    <h2 style={{ fontSize:24, fontWeight:800, color:INK,
                                                 margin:0, lineHeight:1.2,
                                                 letterSpacing:'-0.01em' }}>
                                        {product.PRODUCT_NAME}
                                    </h2>
                                </div>
                                <button onClick={onClose}
                                    style={{ width:32, height:32, background:BG_SOFT,
                                             border:'none', borderRadius:'50%',
                                             cursor:'pointer', fontSize:14, color:TEXT,
                                             display:'flex', alignItems:'center',
                                             justifyContent:'center', flexShrink:0 }}>✕</button>
                            </div>

                            <div style={{ fontSize:28, fontWeight:900, color:INK,
                                          letterSpacing:'-0.02em', marginBottom:10 }}>
                                ${product.PRICE}
                            </div>

                            {/* Stock indicator */}
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                <div style={{ width:8, height:8, borderRadius:'50%',
                                              background: outOfStock ? DANGER
                                                        : stockAvailable < 5 ? '#f59e0b'
                                                        : SUCCESS }} />
                                <span style={{ fontSize:12, color:MUTED, fontWeight:500 }}>
                                    {outOfStock ? 'Out of stock'
                                     : stockAvailable < 5 ? `Only ${stockAvailable} left`
                                     : `${stockAvailable} in stock`}
                                </span>
                            </div>
                        </div>

                        {/* Options */}
                        <div style={{ flex:1, padding:'24px 28px',
                                      display:'flex', flexDirection:'column', gap:22 }}>

                            {loading ? (
                                <div style={{ color:MUTED, fontSize:13,
                                              display:'flex', alignItems:'center', gap:8 }}>
                                    <div style={{ width:16, height:16, borderRadius:'50%',
                                                  border:`2px solid ${BORDER}`,
                                                  borderTopColor:ACCENT,
                                                  animation:'spin .6s linear infinite' }} />
                                    Loading options...
                                </div>
                            ) : variants.length === 0 ? (
                                <div style={{ background:BG_SOFT, borderRadius:6,
                                              padding:'14px 16px', fontSize:13,
                                              color:MUTED, border:`1px solid ${BORDER}` }}>
                                    ✓ Standard item — no size/color options needed
                                </div>
                            ) : (
                                <>
                                    {/* Size */}
                                    {sizes.length > 0 && (
                                        <div>
                                            <div style={{ display:'flex',
                                                          justifyContent:'space-between',
                                                          marginBottom:12 }}>
                                                <span style={{ fontSize:11, fontWeight:700,
                                                               color:INK,
                                                               textTransform:'uppercase',
                                                               letterSpacing:'0.12em' }}>
                                                    Select Size
                                                </span>
                                                {selSize && (
                                                    <span style={{ fontSize:12, color:ACCENT,
                                                                   fontWeight:600 }}>{selSize}</span>
                                                )}
                                            </div>
                                            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                                {sizes.map(sz => (
                                                    <button key={sz}
                                                        onClick={() => { setSelSize(sz); setSelColor('') }}
                                                        style={{ minWidth:52, padding:'11px 16px',
                                                                 borderRadius:4, fontSize:13,
                                                                 fontWeight:700, cursor:'pointer',
                                                                 transition:'all .15s',
                                                                 border: selSize===sz
                                                                     ? `2px solid ${INK}`
                                                                     : `1px solid ${BORDER}`,
                                                                 background: selSize===sz
                                                                     ? INK : '#fff',
                                                                 color: selSize===sz ? '#fff' : TEXT,
                                                                 fontFamily:'inherit' }}>
                                                        {sz}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Color */}
                                    {colors.length > 0 && (
                                        <div>
                                            <div style={{ display:'flex',
                                                          justifyContent:'space-between',
                                                          marginBottom:12 }}>
                                                <span style={{ fontSize:11, fontWeight:700,
                                                               color:INK,
                                                               textTransform:'uppercase',
                                                               letterSpacing:'0.12em' }}>
                                                    Select Color
                                                </span>
                                                {selColor && (
                                                    <span style={{ fontSize:12, color:ACCENT,
                                                                   fontWeight:600 }}>{selColor}</span>
                                                )}
                                            </div>
                                            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                                                {colors.map(c => {
                                                    const dot = colorDot(c)
                                                    const isLight = ['white','beige','yellow'].includes(c?.toLowerCase())
                                                    return (
                                                        <button key={c}
                                                            onClick={() => setSelColor(c)}
                                                            title={c}
                                                            style={{ display:'flex', alignItems:'center',
                                                                     gap:8, padding:'9px 14px',
                                                                     borderRadius:4, cursor:'pointer',
                                                                     transition:'all .15s',
                                                                     border: selColor===c
                                                                         ? `2px solid ${INK}`
                                                                         : `1px solid ${BORDER}`,
                                                                     background: selColor===c
                                                                         ? BG_SOFT : '#fff',
                                                                     fontFamily:'inherit' }}>
                                                            <div style={{ width:18, height:18,
                                                                          borderRadius:'50%',
                                                                          background: dot,
                                                                          border: isLight
                                                                              ? `1.5px solid ${BORDER}`
                                                                              : 'none',
                                                                          flexShrink:0 }} />
                                                            <span style={{ fontSize:13, fontWeight:600,
                                                                           color: TEXT }}>
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
                                    <div style={{ fontSize:11, fontWeight:700, color:INK,
                                                  textTransform:'uppercase',
                                                  letterSpacing:'0.12em',
                                                  marginBottom:12 }}>Quantity</div>
                                    <div style={{ display:'flex', alignItems:'center',
                                                  background:'#fff',
                                                  border:`1px solid ${BORDER}`,
                                                  borderRadius:4,
                                                  width:'fit-content' }}>
                                        <button onClick={() => setQuantity(q => Math.max(1,q-1))}
                                            style={{ width:42, height:42, background:'none',
                                                     border:'none', cursor:'pointer', fontSize:18,
                                                     color:TEXT,
                                                     display:'flex', alignItems:'center',
                                                     justifyContent:'center' }}>−</button>
                                        <span style={{ minWidth:48, textAlign:'center',
                                                       fontSize:15, fontWeight:700,
                                                       color:INK, userSelect:'none' }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(q => Math.min(stockAvailable||99,q+1))}
                                            style={{ width:42, height:42, background:'none',
                                                     border:'none', cursor:'pointer', fontSize:18,
                                                     color:TEXT,
                                                     display:'flex', alignItems:'center',
                                                     justifyContent:'center' }}>+</button>
                                    </div>
                                    <div style={{ fontSize:12, color:MUTED, marginTop:10 }}>
                                        Subtotal:{' '}
                                        <span style={{ fontWeight:800, color:INK, fontSize:14 }}>
                                            ${(product.PRICE * quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer CTA */}
                        <div style={{ padding:'18px 28px 28px',
                                      borderTop:`1px solid ${BORDER}` }}>

                            {needSize && !selSize && (
                                <div style={{ background:'#fffbeb',
                                              border:'1px solid #fde68a',
                                              borderRadius:6, padding:'10px 14px',
                                              fontSize:12, color:'#92400e',
                                              marginBottom:12, fontWeight:500 }}>
                                    Please select a size to continue
                                </div>
                            )}

                            <button onClick={handleAdd}
                                disabled={!canAdd}
                                style={{ width:'100%', padding:'16px',
                                         border:'none', borderRadius:4,
                                         fontSize:12, fontWeight:700,
                                         letterSpacing:'0.15em',
                                         textTransform:'uppercase',
                                         cursor: canAdd ? 'pointer' : 'not-allowed',
                                         transition:'background .15s',
                                         background: outOfStock || !canAdd ? '#cfcfcf' : INK,
                                         color: outOfStock || !canAdd ? '#ffffff' : '#fff',
                                         fontFamily:'inherit' }}>
                                {outOfStock ? 'Out of Stock'
                                 : !canAdd   ? 'Select options above'
                                 :             'Add to Cart →'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    )
}

// ── Inline Editor (local state for immediate feedback) ───────────────────────
function InlineEditor({ item, variants, onSave, onClose }) {
    const sizes   = [...new Set(variants.map(v => v.SIZE_).filter(Boolean))]
    const [localSize,  setLocalSize]  = useState(item.selectedSize  || '')
    const [localColor, setLocalColor] = useState(item.selectedColor || '')

    const colorsForSize = [...new Set(
        variants.filter(v => !localSize || v.SIZE_ === localSize)
                .map(v => v.COLOR).filter(Boolean)
    )]

    const handleSave = () => onSave(localSize || null, localColor || null)

    return (
        <div style={{ padding:'14px 16px', background:ACCENT_BG,
                      borderTop:`1px solid ${BORDER}` }}>
            {variants.length === 0 ? (
                <div style={{ fontSize:12, color:MUTED, textAlign:'center', padding:'4px' }}>
                    No size/color options for this item
                </div>
            ) : (
                <>
                    {sizes.length > 0 && (
                        <div style={{ marginBottom:12 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:ACCENT_DARK,
                                          marginBottom:8, textTransform:'uppercase',
                                          letterSpacing:'0.1em' }}>Size</div>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {sizes.map(sz => (
                                    <button key={sz}
                                        onClick={() => { setLocalSize(sz); setLocalColor('') }}
                                        style={{ padding:'7px 14px', borderRadius:4,
                                                 fontSize:12, fontWeight:700, cursor:'pointer',
                                                 border:`1px solid ${localSize===sz?INK:BORDER}`,
                                                 background: localSize===sz ? INK : '#fff',
                                                 color:      localSize===sz ? '#fff' : TEXT,
                                                 transition:'all .15s',
                                                 fontFamily:'inherit' }}>
                                        {sz}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {colorsForSize.length > 0 && (
                        <div style={{ marginBottom:14 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:ACCENT_DARK,
                                          marginBottom:8, textTransform:'uppercase',
                                          letterSpacing:'0.1em' }}>Color</div>
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                {colorsForSize.map(c => (
                                    <button key={c}
                                        onClick={() => setLocalColor(c)}
                                        style={{ padding:'7px 14px', borderRadius:4,
                                                 fontSize:12, fontWeight:600, cursor:'pointer',
                                                 border:`1px solid ${localColor===c?INK:BORDER}`,
                                                 background: localColor===c ? '#fff' : '#fff',
                                                 color: TEXT, transition:'all .15s',
                                                 fontFamily:'inherit' }}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ display:'flex', gap:8 }}>
                        <button onClick={handleSave}
                            style={{ flex:1, padding:'10px', background:INK, color:'#fff',
                                     border:'none', borderRadius:4, fontSize:11,
                                     fontWeight:700, cursor:'pointer',
                                     letterSpacing:'0.1em', textTransform:'uppercase',
                                     fontFamily:'inherit' }}>
                            Apply Changes
                        </button>
                        <button onClick={onClose}
                            style={{ padding:'10px 16px', background:'#fff', color:TEXT,
                                     border:`1px solid ${BORDER}`, borderRadius:4,
                                     fontSize:11, cursor:'pointer',
                                     letterSpacing:'0.1em', textTransform:'uppercase',
                                     fontWeight:700, fontFamily:'inherit' }}>
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

// ── Cart Sidebar ──────────────────────────────────────────────────────────────
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
        if (editingKey === key) setEditingKey(null)
        else { setEditingKey(key); loadVariants(productId) }
    }

    return (
        <div style={{ position:'fixed', inset:0, zIndex:999 }}>
            <div style={{ position:'absolute', inset:0, background:'rgba(10,10,10,.5)' }}
                 onClick={onClose}/>
            <div style={{ position:'absolute', right:0, top:0, bottom:0, width:440,
                          background:'#fff',
                          boxShadow:'-8px 0 40px rgba(0,0,0,.15)', display:'flex',
                          flexDirection:'column', overflow:'hidden' }}>

                {/* Header */}
                <div style={{ padding:'22px 26px', borderBottom:`1px solid ${BORDER}`,
                              display:'flex', justifyContent:'space-between',
                              alignItems:'center' }}>
                    <div>
                        <div style={{ fontSize:10, fontWeight:700, color:MUTED,
                                      letterSpacing:'0.15em', textTransform:'uppercase',
                                      marginBottom:4 }}>
                            Shopping Bag
                        </div>
                        <div style={{ fontSize:18, fontWeight:800, color:INK,
                                      letterSpacing:'-0.01em' }}>
                            {cart.reduce((s,i)=>s+i.qty,0)} {cart.reduce((s,i)=>s+i.qty,0) === 1 ? 'item' : 'items'}
                        </div>
                    </div>
                    <button onClick={onClose}
                        style={{ background:BG_SOFT, border:'none', borderRadius:'50%',
                                 width:32, height:32, cursor:'pointer', fontSize:14,
                                 color:TEXT, display:'flex', alignItems:'center',
                                 justifyContent:'center' }}>✕</button>
                </div>

                {/* Items */}
                <div style={{ flex:1, overflow:'auto', padding:'16px 24px' }}>
                    {orderMsg && (
                        <div style={{ padding:'12px 14px', borderRadius:4, marginBottom:14,
                                      fontSize:13,
                                      background: orderMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                                      border: `1px solid ${orderMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                                      color: orderMsg.startsWith('✓') ? SUCCESS : DANGER }}>
                            {orderMsg}
                        </div>
                    )}

                    {cart.length === 0 ? (
                        <div style={{ textAlign:'center', padding:'80px 0', color:MUTED }}>
                            <div style={{ fontSize:48, marginBottom:14 }}>🛍</div>
                            <div style={{ fontSize:14, fontWeight:600, color:INK,
                                          marginBottom:4 }}>Your bag is empty</div>
                            <div style={{ fontSize:12, color:MUTED }}>Start shopping to add items</div>
                        </div>
                    ) : cart.map((item, idx) => {
                        const src      = imgSrc(item.IMAGE_URL)
                        const key      = `${idx}-${item.PRODUCT_ID}`
                        const isEditing = editingKey === key
                        const variants  = varMap[item.PRODUCT_ID] || []

                        return (
                            <div key={idx} style={{ background:'#fff', borderRadius:6,
                                                    border:`1px solid ${BORDER}`,
                                                    marginBottom:12,
                                                    overflow:'hidden' }}>
                                <div style={{ display:'flex', gap:14, padding:'14px',
                                              alignItems:'flex-start' }}>
                                    <div style={{ width:72, height:90, borderRadius:4,
                                                  flexShrink:0,
                                                  background:BG_SOFT, overflow:'hidden',
                                                  border:`1px solid ${BORDER}` }}>
                                        {src
                                            ? <img src={src} alt={item.PRODUCT_NAME}
                                                   style={{ width:'100%', height:'100%',
                                                            objectFit:'cover' }} />
                                            : <div style={{ width:'100%', height:'100%',
                                                            display:'flex',
                                                            alignItems:'center',
                                                            justifyContent:'center',
                                                            fontSize:11, color:'#bdbdbd',
                                                            letterSpacing:'0.1em',
                                                            textTransform:'uppercase' }}>
                                                  No Img
                                              </div>}
                                    </div>

                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:10, fontWeight:700, color:MUTED,
                                                      textTransform:'uppercase',
                                                      letterSpacing:'0.1em',
                                                      marginBottom:4 }}>
                                            {item.CATEGORY || 'General'}
                                        </div>
                                        <div style={{ fontSize:14, fontWeight:700, color:INK,
                                                      marginBottom:6, lineHeight:1.3 }}>
                                            {item.PRODUCT_NAME}
                                        </div>
                                        <div style={{ display:'flex', gap:6, marginBottom:8,
                                                      flexWrap:'wrap' }}>
                                            {item.selectedSize && (
                                                <span style={{ fontSize:10, fontWeight:700,
                                                               background:INK, color:'#fff',
                                                               padding:'3px 8px', borderRadius:2,
                                                               letterSpacing:'0.05em' }}>
                                                    {item.selectedSize}
                                                </span>
                                            )}
                                            {item.selectedColor && (
                                                <span style={{ fontSize:10, fontWeight:600,
                                                               background:BG_SOFT,
                                                               color:TEXT, padding:'3px 8px',
                                                               borderRadius:2 }}>
                                                    {item.selectedColor}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display:'flex', alignItems:'center',
                                                      justifyContent:'space-between' }}>
                                            <div style={{ display:'flex', alignItems:'center',
                                                          gap:0,
                                                          border:`1px solid ${BORDER}`,
                                                          borderRadius:4 }}>
                                                <button onClick={() => onQtyChange(idx, item.qty-1)}
                                                    style={{ width:28, height:28, borderRadius:0,
                                                             border:'none', background:'transparent',
                                                             cursor:'pointer', fontSize:14,
                                                             display:'flex', alignItems:'center',
                                                             justifyContent:'center',
                                                             fontWeight:700, color:TEXT }}>−</button>
                                                <span style={{ fontSize:13, fontWeight:700,
                                                               minWidth:28, textAlign:'center',
                                                               color:INK }}>{item.qty}</span>
                                                <button onClick={() => onQtyChange(idx, item.qty+1)}
                                                    style={{ width:28, height:28, borderRadius:0,
                                                             border:'none', background:'transparent',
                                                             cursor:'pointer', fontSize:14,
                                                             display:'flex', alignItems:'center',
                                                             justifyContent:'center',
                                                             fontWeight:700, color:TEXT }}>+</button>
                                            </div>
                                            <div style={{ fontSize:15, fontWeight:800, color:INK }}>
                                                ${(item.PRICE * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit bar */}
                                <button onClick={() => toggleEdit(idx, item.PRODUCT_ID)}
                                    style={{ width:'100%', padding:'10px 14px',
                                             background: isEditing ? ACCENT_BG : '#fafafa',
                                             border:'none', borderTop:`1px solid ${BORDER}`,
                                             cursor:'pointer', fontSize:11,
                                             fontWeight:700,
                                             color: isEditing ? ACCENT_DARK : MUTED,
                                             display:'flex', alignItems:'center',
                                             justifyContent:'space-between',
                                             letterSpacing:'0.1em',
                                             textTransform:'uppercase',
                                             fontFamily:'inherit' }}>
                                    <span>{isEditing ? 'Close editor' : 'Change size / color'}</span>
                                    <span>{isEditing ? '▲' : '▼'}</span>
                                </button>

                                {/* Edit panel */}
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

                                <button onClick={() => onRemove(idx)}
                                    style={{ width:'100%', padding:'10px',
                                             background:'#fff', borderTop:`1px solid ${BORDER}`,
                                             border:'none', cursor:'pointer',
                                             fontSize:11, color:DANGER, fontWeight:600,
                                             letterSpacing:'0.05em',
                                             fontFamily:'inherit' }}>
                                    Remove
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div style={{ padding:'22px 26px', borderTop:`1px solid ${BORDER}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between',
                                      marginBottom:18 }}>
                            <div>
                                <div style={{ fontSize:10, fontWeight:700, color:MUTED,
                                              letterSpacing:'0.15em',
                                              textTransform:'uppercase' }}>Total</div>
                                <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>
                                    Incl. taxes
                                </div>
                            </div>
                            <div style={{ fontSize:24, fontWeight:900, color:INK,
                                          letterSpacing:'-0.02em' }}>
                                ${total.toFixed(2)}
                            </div>
                        </div>
                        <button onClick={onPlaceOrder} disabled={placing}
                            style={{ width:'100%', padding:'16px',
                                     background: placing ? '#cfcfcf' : INK,
                                     color:'#fff', border:'none', borderRadius:4,
                                     fontSize:12, fontWeight:700,
                                     letterSpacing:'0.15em',
                                     textTransform:'uppercase',
                                     cursor: placing ? 'not-allowed' : 'pointer',
                                     fontFamily:'inherit' }}>
                            {placing ? 'Placing Order...' : 'Place Order →'}
                        </button>
                        <p style={{ fontSize:11, color:MUTED, textAlign:'center',
                                    marginTop:12, letterSpacing:'0.05em' }}>
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
    const [showLogin, setShowLogin] = useState(false)
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
                      height:300, color:MUTED, fontSize:14,
                      letterSpacing:'0.1em', textTransform:'uppercase' }}>
            Loading...
        </div>
    )

    return (
        <div style={{ fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      color:TEXT, background:'#fff', minHeight:'100vh' }}>

            {/* ===== Hero promo banner (ZANDO style) ===== */}
            <div style={{ background:ACCENT, color:'#fff',
                          padding:'56px 48px', margin:'24px 0 40px',
                          borderRadius:12,
                          display:'grid', gridTemplateColumns:'1fr auto',
                          alignItems:'center', gap:32,
                          position:'relative', overflow:'hidden' }}>
                <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#fff',
                                  letterSpacing:'0.25em', textTransform:'uppercase',
                                  marginBottom:14, opacity:0.85 }}>
                        New Collection · S/S 2026
                    </div>
                    <h1 style={{ fontSize:56, fontWeight:900, color:'#fff',
                                 margin:'0 0 14px', letterSpacing:'-0.03em',
                                 lineHeight:1, textTransform:'uppercase' }}>
                        Men's<br/>Essentials.
                    </h1>
                    <p style={{ fontSize:14, color:'#fff', opacity:0.9,
                                margin:0, maxWidth:460, lineHeight:1.6 }}>
                        {products.length} products · Free shipping over $50
                    </p>
                </div>

                {/* Discount badge (rotated black square) */}
                <div style={{ background:INK, color:'#fff',
                              padding:'24px 32px', borderRadius:8,
                              textAlign:'center', transform:'rotate(-4deg)',
                              flexShrink:0 }}>
                    <div style={{ fontSize:64, fontWeight:900, lineHeight:1,
                                  letterSpacing:'-0.04em' }}>
                        -20<span style={{ fontSize:32 }}>%</span>
                    </div>
                    <div style={{ fontSize:10, letterSpacing:'0.2em',
                                  textTransform:'uppercase', fontWeight:700,
                                  marginTop:6 }}>
                        First Order
                    </div>
                </div>
            </div>

            {/* Order result */}
            {orderMsg && !showCart && (
                <div style={{ padding:'12px 16px', borderRadius:4, marginBottom:20,
                              fontSize:13,
                              background: orderMsg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                              border: `1px solid ${orderMsg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                              color: orderMsg.startsWith('✓') ? SUCCESS : DANGER }}>
                    {orderMsg}
                </div>
            )}

            {/* Filter + Search */}
            <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap',
                          alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)}
                            style={{ padding:'10px 20px', borderRadius:999,
                                     fontSize:12, fontWeight:700, cursor:'pointer',
                                     border:`1px solid ${filter===cat ? INK : BORDER}`,
                                     background: filter===cat ? INK : '#fff',
                                     color:      filter===cat ? '#fff' : TEXT,
                                     letterSpacing:'0.1em', textTransform:'uppercase',
                                     transition:'all .15s', fontFamily:'inherit' }}>
                            {cat}
                        </button>
                    ))}
                </div>
                <div style={{ minWidth:260 }}>
                    <input style={{ width:'100%', padding:'12px 16px',
                                    border:'none',
                                    background:BG_SOFT,
                                    borderRadius:8, fontSize:13, outline:'none',
                                    boxSizing:'border-box', fontFamily:'inherit',
                                    color:TEXT }}
                        placeholder="Search products..." value={search}
                        onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div style={{ fontSize:13, color:MUTED, marginBottom:20 }}>
                Showing {filtered.length} of {products.length} products
            </div>

            {/* ===== Product Grid (ZANDO style cards) ===== */}
            <div style={{ display:'grid',
                          gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))',
                          gap:28 }}>
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
                            style={{ background:'#fff',
                                     overflow:'hidden',
                                     transition:'all .25s ease',
                                     opacity: outStock ? .75 : 1,
                                     cursor:'pointer' }}
                            onClick={() => setSelected(p)}>

                            <div style={{ position:'relative',
                                          aspectRatio:'3 / 4',
                                          background:BG_SOFT,
                                          overflow:'hidden',
                                          borderRadius:6,
                                          marginBottom:12 }}>
                                {src ? (
                                    <img src={src} alt={p.PRODUCT_NAME}
                                        style={{ width:'100%', height:'100%',
                                                 objectFit:'cover',
                                                 display:'block', transition:'transform .4s',
                                                 transform: isHover ? 'scale(1.04)' : 'scale(1)' }}
                                        onError={e => { e.target.style.display='none' }} />
                                ) : (
                                    <div style={{ width:'100%', height:'100%',
                                                  display:'flex', alignItems:'center',
                                                  justifyContent:'center',
                                                  color:'#bdbdbd', fontSize:11,
                                                  letterSpacing:'0.2em',
                                                  textTransform:'uppercase' }}>
                                        No Image
                                    </div>
                                )}

                                {/* Category tag - top left */}
                                <div style={{ position:'absolute', top:12, left:12,
                                              background:'rgba(255,255,255,.95)',
                                              color:INK, fontSize:10, fontWeight:700,
                                              padding:'4px 10px', borderRadius:4,
                                              letterSpacing:'0.1em',
                                              textTransform:'uppercase' }}>
                                    {p.CATEGORY || 'General'}
                                </div>

                                {/* In cart tag - top right */}
                                {inCart > 0 && (
                                    <div style={{ position:'absolute', top:12, right:12,
                                                  background:ACCENT, color:'#fff',
                                                  fontSize:10, fontWeight:700,
                                                  padding:'4px 10px', borderRadius:4,
                                                  letterSpacing:'0.08em',
                                                  textTransform:'uppercase' }}>
                                        {inCart} in bag
                                    </div>
                                )}

                                {/* Hover overlay - View Details */}
                                {isHover && !outStock && (
                                    <div style={{ position:'absolute', left:12, right:12,
                                                  bottom:12,
                                                  display:'flex',
                                                  alignItems:'center',
                                                  justifyContent:'center' }}>
                                        <span style={{ background:'#fff', color:INK,
                                                       fontSize:11, fontWeight:700,
                                                       padding:'10px 16px', borderRadius:4,
                                                       letterSpacing:'0.12em',
                                                       textTransform:'uppercase',
                                                       width:'100%', textAlign:'center' }}>
                                            View Details
                                        </span>
                                    </div>
                                )}

                                {/* Sold out overlay */}
                                {outStock && (
                                    <div style={{ position:'absolute', inset:0,
                                                  background:'rgba(255,255,255,.7)',
                                                  display:'flex', alignItems:'center',
                                                  justifyContent:'center' }}>
                                        <span style={{ background:DANGER, color:'#fff',
                                                       fontSize:11, fontWeight:700,
                                                       padding:'7px 16px', borderRadius:4,
                                                       letterSpacing:'0.15em',
                                                       textTransform:'uppercase' }}>
                                            Sold Out
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Card details */}
                            <div style={{ padding:'0 4px' }}>
                                <div style={{ fontSize:10, fontWeight:700, color:MUTED,
                                              letterSpacing:'0.1em',
                                              textTransform:'uppercase',
                                              marginBottom:4 }}>
                                    {p.CATEGORY || 'General'}
                                </div>
                                <h3 style={{ fontSize:15, fontWeight:600, color:INK,
                                             margin:'0 0 10px', lineHeight:1.3 }}>
                                    {p.PRODUCT_NAME}
                                </h3>
                                <div style={{ display:'flex',
                                              justifyContent:'space-between',
                                              alignItems:'center' }}>
                                    <span style={{ fontSize:18, fontWeight:800, color:INK,
                                                   letterSpacing:'-0.01em' }}>
                                        ${p.PRICE}
                                    </span>
                                    <button onClick={(e) => { e.stopPropagation(); setSelected(p) }}
                                        disabled={outStock}
                                        style={{ padding:'8px 14px', borderRadius:4,
                                                 fontSize:10, fontWeight:700,
                                                 cursor: outStock ? 'not-allowed' : 'pointer',
                                                 border:'none', transition:'background .15s',
                                                 background: outStock ? '#cfcfcf' :
                                                             inCart   ? ACCENT_BG : INK,
                                                 color: outStock ? '#fff' :
                                                        inCart   ? ACCENT_DARK : '#fff',
                                                 letterSpacing:'0.12em',
                                                 textTransform:'uppercase',
                                                 fontFamily:'inherit' }}>
                                        {outStock ? 'Sold' : inCart ? `✓ ${inCart}` : '+ Add'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign:'center', padding:'80px 20px', color:MUTED }}>
                    <div style={{ fontSize:14, fontWeight:600, color:INK,
                                  marginBottom:4 }}>No products found</div>
                    <div style={{ fontSize:12 }}>Try adjusting your search or filter</div>
                </div>
            )}

            {showLogin && <LoginPrompt onClose={() => setShowLogin(false)} />}

            {selected && (
                <ProductModal product={selected} onClose={() => setSelected(null)}
                    onAddToCart={addToCart} />
            )}

            {showCart && (
                <CartSidebar cart={cart} onClose={() => setShowCart(false)}
                    onRemove={removeFromCart} onQtyChange={changeQty}
                    onPlaceOrder={placeOrder} placing={placing} orderMsg={orderMsg}
                    onEditSave={(idx, changes) => {
                        setCart(prev => prev.map((item, i) =>
                            i === idx ? { ...item, ...changes } : item))
                    }} />
            )}

            {/* Floating cart button (ZANDO style — black square) */}
            {cartCount > 0 && !showCart && (
                <button onClick={() => setShowCart(true)}
                    style={{ position:'fixed', bottom:28, right:28,
                             padding:'14px 22px',
                             background:INK, color:'#fff', border:'none',
                             borderRadius:4,
                             fontSize:12, fontWeight:700, cursor:'pointer',
                             letterSpacing:'0.15em', textTransform:'uppercase',
                             zIndex:998,
                             boxShadow:'0 8px 24px rgba(0,0,0,.25)',
                             display:'flex', alignItems:'center', gap:10,
                             fontFamily:'inherit' }}>
                    Bag
                    <span style={{ background:ACCENT, color:'#fff',
                                   borderRadius:999, minWidth:22, height:22,
                                   fontSize:11, fontWeight:700,
                                   display:'flex', alignItems:'center',
                                   justifyContent:'center',
                                   padding:'0 6px' }}>{cartCount}</span>
                </button>
            )}
        </div>
    )
}
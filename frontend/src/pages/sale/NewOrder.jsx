import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, getVariants, createOrder, register } from '../../api'
import API from '../../api'

const imgSrc = (url) => {
    if (!url) return null
    if (url.startsWith('/media')) return `http://localhost:8000${url}`
    return url
}

// ── Register New Customer ─────────────────────────────────────
function RegisterForm({ prefillName, onSuccess, onCancel }) {
    const [form,    setForm]    = useState({ username:'', password:'123456',
        full_name:prefillName||'', email:'', phone:'', address:'' })
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')
    const set = k => e => setForm(p => ({...p, [k]: e.target.value}))
    const inp = { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0',
                  borderRadius:8, fontSize:13, boxSizing:'border-box', outline:'none',
                  fontFamily:'inherit' }
    const submit = async () => {
        if (!form.username||!form.full_name||!form.phone) {
            setError('Username, full name and phone required'); return }
        setLoading(true); setError('')
        try {
            await register(form)
            const res = await API.get(`/customers/search/?q=${encodeURIComponent(form.full_name)}`)
            const c = res.data.find(x => x.FULL_NAME === form.full_name)
            if (c) onSuccess(c)
        } catch(e) { setError(e.response?.data?.error||'Registration failed') }
        setLoading(false)
    }
    return (
        <div style={{ border:'2px solid #c7d2fe', borderRadius:14, padding:20, marginTop:12, background:'#fafaff' }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#1e1b4b', marginBottom:14 }}>📝 Register New Customer</div>
            {error && <div style={{ background:'#fef2f2', color:'#dc2626', padding:'8px 12px', borderRadius:8, fontSize:12, marginBottom:12 }}>✕ {error}</div>}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['full_name','Full Name *','Sok Dara'],['username','Username *','sokdara'],
                  ['phone','Phone *','012-345-678'],['email','Email','email@example.com']].map(([k,l,p]) => (
                    <div key={k}>
                        <div style={{ fontSize:11, fontWeight:600, color:'#4f46e5', marginBottom:5, textTransform:'uppercase' }}>{l}</div>
                        <input style={inp} value={form[k]} onChange={set(k)} placeholder={p}
                            onFocus={e=>e.target.style.borderColor='#6366f1'}
                            onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                    </div>
                ))}
                <div style={{ gridColumn:'span 2' }}>
                    <div style={{ fontSize:11, fontWeight:600, color:'#4f46e5', marginBottom:5, textTransform:'uppercase' }}>Address</div>
                    <input style={inp} value={form.address} onChange={set('address')} placeholder="Phnom Penh"
                        onFocus={e=>e.target.style.borderColor='#6366f1'}
                        onBlur={e=>e.target.style.borderColor='#e2e8f0'} />
                </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
                <button onClick={submit} disabled={loading}
                    style={{ flex:1, padding:'11px', background:'#4f46e5', color:'#fff',
                             border:'none', borderRadius:10, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                    {loading ? '⏳ Registering...' : '✓ Register & Select'}
                </button>
                <button onClick={onCancel}
                    style={{ padding:'11px 16px', background:'#fff', color:'#64748b',
                             border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, cursor:'pointer' }}>Cancel</button>
            </div>
        </div>
    )
}

// ── Customer Search ───────────────────────────────────────────
function CustomerSearch({ onSelect }) {
    const [query,    setQuery]    = useState('')
    const [results,  setResults]  = useState([])
    const [busy,     setBusy]     = useState(false)
    const [showForm, setShowForm] = useState(false)

    const search = async (q) => {
        setQuery(q); setShowForm(false)
        if (q.length < 2) { setResults([]); return }
        setBusy(true)
        try { const r = await API.get(`/customers/search/?q=${encodeURIComponent(q)}`); setResults(r.data) }
        catch { setResults([]) }
        setBusy(false)
    }

    const select = (c) => { onSelect(c); setResults([]); setQuery(c.FULL_NAME) }

    return (
        <div>
            <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'#94a3b8' }}>🔍</span>
                <input value={query} onChange={e => search(e.target.value)}
                    placeholder="Search by name, phone or email..."
                    style={{ width:'100%', padding:'12px 14px 12px 42px', border:'1.5px solid #e2e8f0',
                             borderRadius:12, fontSize:14, boxSizing:'border-box', outline:'none', fontFamily:'inherit' }}
                    onFocus={e => e.target.style.borderColor='#6366f1'}
                    onBlur={e  => e.target.style.borderColor='#e2e8f0'} />
                {busy && <span style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', fontSize:12, color:'#94a3b8' }}>Searching...</span>}
            </div>
            {results.length > 0 && (
                <div style={{ border:'1.5px solid #e2e8f0', borderRadius:12, marginTop:8, background:'#fff',
                              boxShadow:'0 8px 24px rgba(0,0,0,.1)', overflow:'hidden' }}>
                    <div style={{ padding:'8px 14px', background:'#f8fafc', borderBottom:'1px solid #f1f5f9', fontSize:11, color:'#94a3b8' }}>
                        {results.length} found
                    </div>
                    {results.map(c => (
                        <div key={c.CUSTOMER_ID} onClick={() => select(c)}
                            style={{ padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid #f8fafc' }}
                            onMouseEnter={e => e.currentTarget.style.background='#f5f3ff'}
                            onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <div style={{ width:34, height:34, background:'#ede9fe', borderRadius:'50%', display:'flex',
                                                  alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#4f46e5' }}>
                                        {c.FULL_NAME?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>
                                            {c.FULL_NAME} <span style={{ fontSize:11, background:'#f1f5f9', color:'#475569', padding:'1px 6px', borderRadius:10, marginLeft:4 }}>#{c.CUSTOMER_ID}</span>
                                        </div>
                                        <div style={{ fontSize:12, color:'#64748b' }}>{[c.PHONE,c.EMAIL].filter(Boolean).join(' · ')}</div>
                                    </div>
                                </div>
                                <div style={{ background:'#4f46e5', color:'#fff', borderRadius:8, padding:'5px 12px', fontSize:12, fontWeight:600 }}>Select</div>
                            </div>
                        </div>
                    ))}
                    <div style={{ padding:'10px 16px', background:'#fafaff', borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:12, color:'#94a3b8' }}>Not the right person?</span>
                        <button onClick={() => setShowForm(true)}
                            style={{ background:'#ede9fe', color:'#4f46e5', border:'none', borderRadius:8, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                            + New Customer
                        </button>
                    </div>
                </div>
            )}
            {query.length >= 2 && results.length === 0 && !busy && !showForm && (
                <div style={{ border:'1.5px dashed #c7d2fe', borderRadius:12, marginTop:8, padding:'20px', textAlign:'center', background:'#fafaff' }}>
                    <div style={{ fontSize:13, color:'#475569', marginBottom:10 }}>No customer found for "{query}"</div>
                    <button onClick={() => setShowForm(true)}
                        style={{ padding:'9px 20px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                        + Register New Customer
                    </button>
                </div>
            )}
            {showForm && <RegisterForm prefillName={query} onSuccess={c => { select(c); setShowForm(false) }} onCancel={() => setShowForm(false)} />}
        </div>
    )
}

// ── Variant Picker Popup ──────────────────────────────────────
function VariantPicker({ product, onAdd, onClose }) {
    const [variants, setVariants] = useState([])
    const [selSize,  setSelSize]  = useState('')
    const [selColor, setSelColor] = useState('')
    const [qty,      setQty]      = useState(1)
    const [loading,  setLoading]  = useState(true)
    const src = imgSrc(product.IMAGE_URL)

    useEffect(() => {
        getVariants(product.PRODUCT_ID)
            .then(r => setVariants(r.data))
            .finally(() => setLoading(false))
    }, [product.PRODUCT_ID])

    const sizes  = [...new Set(variants.map(v => v.SIZE_).filter(Boolean))]
    const colors = [...new Set(variants.filter(v => !selSize||v.SIZE_===selSize).map(v => v.COLOR).filter(Boolean))]
    const selVariant = variants.find(v => (!selSize||v.SIZE_===selSize) && (!selColor||v.COLOR===selColor))
    const stock = selVariant ? selVariant.STOCK_QTY : product.STOCK_QTY || 0
    const canAdd = variants.length === 0 || selVariant

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.55)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      zIndex:9999, padding:16 }}
             onClick={onClose}>
            <div style={{ background:'#fff', borderRadius:20, maxWidth:460, width:'100%',
                          boxShadow:'0 24px 60px rgba(0,0,0,.3)', overflow:'hidden' }}
                 onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display:'flex', gap:16, padding:'20px 24px', borderBottom:'1px solid #f1f5f9', alignItems:'center' }}>
                    <div style={{ width:56, height:56, borderRadius:12, background:'#f8fafc', overflow:'hidden', border:'1px solid #e2e8f0', flexShrink:0 }}>
                        {src ? <img src={src} alt={product.PRODUCT_NAME} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                             : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>👔</div>}
                    </div>
                    <div style={{ flex:1 }}>
                        <div style={{ fontSize:16, fontWeight:700, color:'#0f172a' }}>{product.PRODUCT_NAME}</div>
                        <div style={{ fontSize:20, fontWeight:800, color:'#4f46e5' }}>${product.PRICE}</div>
                    </div>
                    <button onClick={onClose}
                        style={{ width:32, height:32, background:'#f1f5f9', border:'none', borderRadius:8, cursor:'pointer', fontSize:16, color:'#64748b' }}>✕</button>
                </div>

                <div style={{ padding:'20px 24px' }}>
                    {loading ? (
                        <div style={{ textAlign:'center', padding:'20px', color:'#94a3b8' }}>Loading options...</div>
                    ) : variants.length === 0 ? (
                        <div style={{ background:'#f8fafc', borderRadius:10, padding:'12px', fontSize:13, color:'#64748b', marginBottom:16 }}>
                            ✓ No size/color options needed
                        </div>
                    ) : (
                        <>
                            {sizes.length > 0 && (
                                <div style={{ marginBottom:16 }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
                                        Size {selSize && <span style={{ color:'#6366f1' }}>— {selSize}</span>}
                                    </div>
                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                        {sizes.map(s => (
                                            <button key={s} onClick={() => { setSelSize(s); setSelColor('') }}
                                                style={{ padding:'8px 18px', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer',
                                                         border:`2px solid ${selSize===s?'#4f46e5':'#e2e8f0'}`,
                                                         background: selSize===s?'#4f46e5':'#fff',
                                                         color:      selSize===s?'#fff':'#374151' }}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {colors.length > 0 && (
                                <div style={{ marginBottom:16 }}>
                                    <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>
                                        Color {selColor && <span style={{ color:'#6366f1' }}>— {selColor}</span>}
                                    </div>
                                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                                        {colors.map(c => (
                                            <button key={c} onClick={() => setSelColor(c)}
                                                style={{ padding:'8px 16px', borderRadius:10, fontSize:13, fontWeight:500, cursor:'pointer',
                                                         border:`2px solid ${selColor===c?'#4f46e5':'#e2e8f0'}`,
                                                         background: selColor===c?'#f5f3ff':'#fff',
                                                         color:      selColor===c?'#4f46e5':'#374151' }}>
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selVariant && (
                                <div style={{ background:'#f8fafc', borderRadius:10, padding:'8px 14px', fontSize:13,
                                              display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                                    <span style={{ color:'#64748b' }}>Stock</span>
                                    <span style={{ fontWeight:700, color: stock===0?'#dc2626':stock<5?'#b45309':'#16a34a' }}>{stock} items</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Quantity */}
                    <div style={{ marginBottom:20 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#0f172a', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>Quantity</div>
                        <div style={{ display:'flex', alignItems:'center', gap:0, background:'#f8fafc', borderRadius:12, border:'1.5px solid #e2e8f0', width:'fit-content' }}>
                            <button onClick={() => setQty(q => Math.max(1,q-1))}
                                style={{ width:44, height:44, background:'none', border:'none', cursor:'pointer', fontSize:20, borderRadius:'10px 0 0 10px', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                            <span style={{ minWidth:48, textAlign:'center', fontSize:16, fontWeight:800 }}>{qty}</span>
                            <button onClick={() => setQty(q => Math.min(stock||99,q+1))}
                                style={{ width:44, height:44, background:'none', border:'none', cursor:'pointer', fontSize:20, borderRadius:'0 10px 10px 0', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                        </div>
                        <div style={{ fontSize:12, color:'#94a3b8', marginTop:6 }}>
                            Subtotal: <b style={{ color:'#0f172a' }}>${(product.PRICE*qty).toFixed(2)}</b>
                        </div>
                    </div>

                    <div style={{ display:'flex', gap:10 }}>
                        <button onClick={() => {
                                if (!canAdd) return
                                onAdd({ ...product, qty, selectedSize:selSize||null, selectedColor:selColor||null, selectedVariant:selVariant||null })
                                onClose()
                            }}
                            disabled={!canAdd}
                            style={{ flex:1, padding:'13px', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor: canAdd?'pointer':'not-allowed',
                                     background: canAdd?'linear-gradient(135deg,#4f46e5,#7c3aed)':'#e2e8f0',
                                     color: canAdd?'#fff':'#94a3b8' }}>
                            {!canAdd ? 'Select a size first' : '+ Add to Order'}
                        </button>
                        <button onClick={onClose}
                            style={{ padding:'13px 18px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:12, fontSize:14, cursor:'pointer' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Main Page ─────────────────────────────────────────────────
export default function NewOrder() {
    const [products,      setProducts]      = useState([])
    const [customer,      setCustomer]      = useState(null)
    const [cart,          setCart]          = useState([])
    const [msg,           setMsg]           = useState('')
    const [error,         setError]         = useState('')
    const [loading,       setLoading]       = useState(false)
    const [search,        setSearch]        = useState('')
    const [catFilter,     setCatFilter]     = useState('All')
    const [hovered,       setHovered]       = useState(null)
    const [pickerProduct, setPickerProduct] = useState(null)
    const navigate = useNavigate()

    useEffect(() => { getProducts().then(r => setProducts(r.data)) }, [])

    const categories = ['All', ...new Set(products.map(p => p.CATEGORY).filter(Boolean))]
    const filtered   = products.filter(p => {
        const ms = p.PRODUCT_NAME?.toLowerCase().includes(search.toLowerCase()) || p.CATEGORY?.toLowerCase().includes(search.toLowerCase())
        const mc = catFilter==='All' || p.CATEGORY===catFilter
        return ms && mc
    })

    const addToCart = (p) => {
        setCart(prev => {
            const ex = prev.find(i => i.PRODUCT_ID===p.PRODUCT_ID && (i.selectedSize||'')===(p.selectedSize||'') && (i.selectedColor||'')===(p.selectedColor||''))
            if (ex) return prev.map(i => i.PRODUCT_ID===p.PRODUCT_ID && (i.selectedSize||'')===(p.selectedSize||'') && (i.selectedColor||'')===(p.selectedColor||'') ? {...i,qty:i.qty+p.qty} : i)
            return [...prev, {...p}]
        })
        setPickerProduct(null)
    }

    const removeFromCart = (pid, size, color) => setCart(p => p.filter(i => !(i.PRODUCT_ID===pid && (i.selectedSize||'')===(size||'') && (i.selectedColor||'')===(color||''))))
    const changeQty = (pid, size, color, qty) => {
        if (qty <= 0) { removeFromCart(pid, size, color); return }
        setCart(p => p.map(i => i.PRODUCT_ID===pid && (i.selectedSize||'')===(size||'') && (i.selectedColor||'')===(color||'') ? {...i,qty} : i))
    }

    const total = cart.reduce((s,i) => s+i.PRICE*i.qty, 0)

    const submit = async () => {
        if (!customer)         { setError('Please select a customer'); return }
        if (cart.length === 0) { setError('Add at least one product'); return }
        setLoading(true); setMsg(''); setError('')
        try {
            await createOrder({
                customer_id: customer.CUSTOMER_ID,
                items: cart.map(i => ({
                    product_id:     i.PRODUCT_ID,
                    variant_id:     i.selectedVariant?.VARIANT_ID || null,
                    quantity:       i.qty,
                    unit_price:     i.PRICE,
                    selected_size:  i.selectedSize  || null,
                    selected_color: i.selectedColor || null,
                }))
            })
            setMsg('✓ Order placed successfully!')
            setTimeout(() => navigate('/sale'), 1500)
        } catch(e) { setError(e.response?.data?.error||'Order failed') }
        setLoading(false)
    }

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:26, fontWeight:700, color:'#0f172a', marginBottom:4 }}>New Order</h1>
                <p style={{ fontSize:14, color:'#64748b' }}>Search for a customer and select products</p>
            </div>
            {msg   && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d', padding:'12px 16px', borderRadius:10, marginBottom:16, fontSize:13 }}>{msg}</div>}
            {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', padding:'12px 16px', borderRadius:10, marginBottom:16, fontSize:13 }}>✕ {error}</div>}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

                    {/* Customer */}
                    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden' }}>
                        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:32, height:32, background:'#ede9fe', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>👤</div>
                            <span style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>Select Customer</span>
                        </div>
                        <div style={{ padding:20 }}>
                            {customer ? (
                                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #86efac', borderRadius:12, padding:'14px 18px' }}>
                                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                                        <div style={{ width:44, height:44, background:'#16a34a', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff' }}>
                                            {customer.FULL_NAME?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontSize:15, fontWeight:700, color:'#0f172a' }}>✓ {customer.FULL_NAME}</div>
                                            <div style={{ fontSize:12, color:'#64748b' }}>ID #{customer.CUSTOMER_ID}{customer.PHONE && ` · 📞 ${customer.PHONE}`}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => setCustomer(null)}
                                        style={{ background:'#fff', color:'#dc2626', border:'1px solid #fca5a5', borderRadius:8, padding:'6px 12px', cursor:'pointer', fontSize:12 }}>Change</button>
                                </div>
                            ) : (
                                <CustomerSearch onSelect={setCustomer} />
                            )}
                        </div>
                    </div>

                    {/* Products */}
                    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden' }}>
                        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fafafa' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <div style={{ width:32, height:32, background:'#ede9fe', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🛍</div>
                                <span style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>Select Products</span>
                                <span style={{ fontSize:12, color:'#94a3b8' }}>{filtered.length} items</span>
                            </div>
                            <div style={{ position:'relative' }}>
                                <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#94a3b8' }}>🔍</span>
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                                    style={{ padding:'7px 12px 7px 30px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', width:160, fontFamily:'inherit' }} />
                            </div>
                        </div>

                        {/* Category pills */}
                        <div style={{ padding:'12px 16px 0', display:'flex', gap:6, flexWrap:'wrap' }}>
                            {categories.map(cat => (
                                <button key={cat} onClick={() => setCatFilter(cat)}
                                    style={{ padding:'5px 14px', borderRadius:20, fontSize:12, fontWeight:500, cursor:'pointer',
                                             border:`1.5px solid ${catFilter===cat?'#4f46e5':'#e2e8f0'}`,
                                             background: catFilter===cat?'#4f46e5':'#fff',
                                             color:      catFilter===cat?'#fff':'#64748b', fontFamily:'inherit' }}>
                                    {cat} {cat!=='All' && products.filter(p=>p.CATEGORY===cat).length}
                                </button>
                            ))}
                        </div>

                        {/* Product grid */}
                        <div style={{ padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(155px,1fr))', gap:12 }}>
                            {filtered.map(p => {
                                const src    = imgSrc(p.IMAGE_URL)
                                const inCart = cart.filter(i => i.PRODUCT_ID===p.PRODUCT_ID).reduce((s,i)=>s+i.qty,0)
                                const out    = p.STOCK_QTY === 0
                                const isHov  = hovered === p.PRODUCT_ID

                                return (
                                    <div key={p.PRODUCT_ID}
                                        onMouseEnter={() => setHovered(p.PRODUCT_ID)}
                                        onMouseLeave={() => setHovered(null)}
                                        style={{ border:`2px solid ${inCart?'#6366f1':isHov&&!out?'#c7d2fe':'#f1f5f9'}`,
                                                 borderRadius:12, overflow:'hidden',
                                                 cursor: out?'not-allowed':'pointer',
                                                 opacity: out?.55:1, transition:'all .2s',
                                                 transform: isHov&&!out?'translateY(-2px)':'none',
                                                 boxShadow: isHov&&!out?'0 4px 16px rgba(99,102,241,.15)':'none' }}>

                                        {/* Image */}
                                        <div style={{ height:110, background:'#f8fafc', position:'relative', overflow:'hidden' }}
                                             onClick={() => !out && setPickerProduct(p)}>
                                            {src
                                                ? <img src={src} alt={p.PRODUCT_NAME} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .3s', transform:isHov?'scale(1.05)':'scale(1)' }} />
                                                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:40 }}>👔</div>}
                                            <div style={{ position:'absolute', top:6, left:6, background:'rgba(0,0,0,.5)', color:'#fff', fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20 }}>
                                                {p.CATEGORY}
                                            </div>
                                            {inCart > 0 && (
                                                <div style={{ position:'absolute', top:6, right:6, background:'#4f46e5', color:'#fff', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>
                                                    {inCart}
                                                </div>
                                            )}
                                            {out && (
                                                <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                    <span style={{ background:'#dc2626', color:'#fff', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:12 }}>SOLD OUT</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card body */}
                                        <div style={{ padding:'10px 12px', background: inCart?'#fafaff':'#fff' }}
                                             onClick={() => !out && setPickerProduct(p)}>
                                            <div style={{ fontSize:13, fontWeight:600, color:'#0f172a', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                                {p.PRODUCT_NAME}
                                            </div>
                                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                                                <span style={{ fontSize:14, fontWeight:800, color: inCart?'#4f46e5':'#0f172a' }}>${p.PRICE}</span>
                                                <span style={{ fontSize:10, color:'#94a3b8' }}>Stock: {p.STOCK_QTY}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:16, overflow:'hidden', position:'sticky', top:24 }}>
                    <div style={{ padding:'16px 20px', background:'linear-gradient(135deg,#1e1b4b,#4f46e5)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <span style={{ fontSize:16 }}>📋</span>
                            <span style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Order Summary</span>
                        </div>
                        {cart.length > 0 && (
                            <span style={{ background:'rgba(255,255,255,.2)', color:'#fff', borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600 }}>
                                {cart.reduce((s,i)=>s+i.qty,0)} items
                            </span>
                        )}
                    </div>

                    <div style={{ padding:20 }}>
                        <div style={{ background:'#f8fafc', borderRadius:10, padding:'10px 14px', marginBottom:16, border:'1px solid #f1f5f9' }}>
                            <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:4 }}>Customer</div>
                            {customer
                                ? <><div style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>{customer.FULL_NAME}</div>
                                    <div style={{ fontSize:11, color:'#64748b' }}>ID #{customer.CUSTOMER_ID}</div></>
                                : <span style={{ fontSize:13, color:'#94a3b8' }}>Not selected</span>}
                        </div>

                        {cart.length === 0 ? (
                            <div style={{ textAlign:'center', padding:'28px 0', color:'#94a3b8' }}>
                                <div style={{ fontSize:32, marginBottom:8 }}>🛒</div>
                                <div style={{ fontSize:13 }}>No products added yet</div>
                            </div>
                        ) : (
                            <div style={{ marginBottom:16 }}>
                                {cart.map((i, idx) => (
                                    <div key={idx} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #f8fafc' }}>
                                        <div style={{ width:38, height:38, borderRadius:8, background:'#f8fafc', overflow:'hidden', border:'1px solid #e2e8f0', flexShrink:0 }}>
                                            {imgSrc(i.IMAGE_URL)
                                                ? <img src={imgSrc(i.IMAGE_URL)} alt={i.PRODUCT_NAME} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                                                : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>👔</div>}
                                        </div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                            <div style={{ fontSize:13, fontWeight:500, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{i.PRODUCT_NAME}</div>
                                            <div style={{ display:'flex', gap:4, marginTop:2 }}>
                                                {i.selectedSize  && <span style={{ fontSize:10, background:'#ede9fe', color:'#5b21b6', padding:'1px 6px', borderRadius:8 }}>{i.selectedSize}</span>}
                                                {i.selectedColor && <span style={{ fontSize:10, background:'#f1f5f9', color:'#475569', padding:'1px 6px', borderRadius:8 }}>{i.selectedColor}</span>}
                                            </div>
                                            <div style={{ fontSize:11, color:'#94a3b8' }}>${i.PRICE} × {i.qty}</div>
                                        </div>
                                        <div style={{ textAlign:'right', flexShrink:0 }}>
                                            <div style={{ fontSize:13, fontWeight:700, color:'#4f46e5' }}>${(i.PRICE*i.qty).toFixed(2)}</div>
                                            <button onClick={() => removeFromCart(i.PRODUCT_ID, i.selectedSize, i.selectedColor)}
                                                style={{ background:'none', border:'none', color:'#dc2626', cursor:'pointer', fontSize:10 }}>remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {cart.length > 0 && (
                            <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', marginBottom:16, borderTop:'2px solid #f1f5f9' }}>
                                <span style={{ fontSize:14, color:'#64748b', fontWeight:500 }}>Total</span>
                                <span style={{ fontSize:20, fontWeight:800, color:'#0f172a' }}>${total.toFixed(2)}</span>
                            </div>
                        )}

                        <button onClick={submit} disabled={loading||!customer||cart.length===0}
                            style={{ width:'100%', padding:'13px', border:'none', borderRadius:12, fontSize:14, fontWeight:700,
                                     cursor:(!customer||cart.length===0)?'not-allowed':'pointer',
                                     background:(!customer||cart.length===0)?'#e2e8f0':'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                     color:(!customer||cart.length===0)?'#94a3b8':'#fff',
                                     boxShadow:(!customer||cart.length===0)?'none':'0 4px 16px rgba(79,70,229,.4)' }}>
                            {loading ? '⏳ Placing...' : '✓ Place Order'}
                        </button>
                        {(!customer||cart.length===0) && (
                            <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:8 }}>
                                {!customer ? '① Select a customer first' : '② Add products to continue'}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Variant Picker */}
            {pickerProduct && (
                <VariantPicker
                    product={pickerProduct}
                    onAdd={addToCart}
                    onClose={() => setPickerProduct(null)}
                />
            )}
        </div>
    )
}
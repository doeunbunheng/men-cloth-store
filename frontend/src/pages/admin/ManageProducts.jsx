import { useEffect, useRef, useState } from 'react'
import {
    getProducts, addProduct, updateProduct, deleteProduct, uploadImage,
    getVariants, addVariant, updateVariant, deleteVariant
} from '../../api'

const EMPTY_PROD = { product_name:'', category:'', price:'', image_url:'' }
const EMPTY_VAR  = { size_:'', color:'', stock_qty:'' }
const CATEGORIES = ['Shirt','Pants','Shoes','Accessories','Jacket','Other']
const SIZES      = ['XS','S','M','L','XL','XXL']
const PLACEHOLDER = 'https://placehold.co/400x300?text=No+Image'

const imgSrc = (url) => {
    if (!url) return null
    return url
}

const lbl = { fontSize:11, fontWeight:600, color:'#64748b', textTransform:'uppercase',
              letterSpacing:'.05em', display:'block', marginBottom:6 }
const inp = { width:'100%', padding:'10px 12px', border:'1px solid #e2e8f0', borderRadius:8,
              fontSize:14, boxSizing:'border-box', outline:'none', fontFamily:'inherit',
              transition:'border-color .15s' }
const focus = e => e.target.style.borderColor = '#6366f1'
const blur  = e => e.target.style.borderColor = '#e2e8f0'

export default function ManageProducts() {
    const [products,     setProducts]     = useState([])
    const [form,         setForm]         = useState(EMPTY_PROD)
    const [editId,       setEditId]       = useState(null)
    const [msg,          setMsg]          = useState('')
    const [error,        setError]        = useState('')
    const [uploading,    setUploading]    = useState(false)
    const [preview,      setPreview]      = useState(null)
    const [dragging,     setDragging]     = useState(false)
    const [variants,     setVariants]     = useState([])
    const [varForm,      setVarForm]      = useState(EMPTY_VAR)
    const [editVarId,    setEditVarId]    = useState(null)
    const [varMsg,       setVarMsg]       = useState('')
    const [showVariants, setShowVariants] = useState(false)
    const fileRef = useRef()

    const loadProducts = () => getProducts().then(r => setProducts(r.data))
    useEffect(() => { loadProducts() }, [])

    const loadVariants = (pid) => getVariants(pid).then(r => setVariants(r.data))

    const setF = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
    const setV = (k, v) => setVarForm(prev => ({ ...prev, [k]: v }))

    const handleFile = async (file) => {
        if (!file || !file.type.startsWith('image/')) { setError('Please select an image file'); return }
        setPreview(URL.createObjectURL(file))
        setUploading(true); setMsg('Uploading...')
        try {
            const res = await uploadImage(file)
            setF('image_url', res.data.image_url)
            setMsg('Image ready!')
        } catch { setError('Upload failed') }
        setUploading(false)
    }

    const startEdit = (p) => {
        setEditId(p.PRODUCT_ID)
        setForm({ product_name: p.PRODUCT_NAME||'', category: p.CATEGORY||'',
                  price: p.PRICE||'', image_url: p.IMAGE_URL||'' })
        setPreview(p.IMAGE_URL ? imgSrc(p.IMAGE_URL) : null)
        setMsg(''); setError('')
        loadVariants(p.PRODUCT_ID)
        setShowVariants(true)
        window.scrollTo({ top:0, behavior:'smooth' })
    }

    const cancelEdit = () => {
        setEditId(null); setForm(EMPTY_PROD); setPreview(null)
        setMsg(''); setError(''); setVariants([])
        setShowVariants(false); setVarForm(EMPTY_VAR); setEditVarId(null)
    }

    const submitProduct = async () => {
        if (!form.product_name) { setError('Product name required'); return }
        if (!form.price)        { setError('Price required'); return }
        setMsg(''); setError('')
        try {
            if (editId) {
                await updateProduct(editId, form)
                setMsg('Product updated!')
                cancelEdit(); loadProducts()
            } else {
                const res = await addProduct(form)
                const newId = res.data.product_id
                setEditId(newId)
                loadVariants(newId)
                setShowVariants(true)
                setMsg('Product saved! Now add size/color variants below.')
                loadProducts()
            }
        } catch (e) { setError(e.response?.data?.error || 'Failed') }
    }

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}" and all variants?`)) return
        try { await deleteProduct(id); setMsg(`"${name}" deleted`); loadProducts() }
        catch (e) { setError(e.response?.data?.error || 'Delete failed') }
    }

    const submitVariant = async () => {
        if (!varForm.size_ && !varForm.color) { setVarMsg('Enter size or color'); return }
        if (varForm.stock_qty === '') { setVarMsg('Stock required'); return }
        try {
            if (editVarId) { await updateVariant(editVarId, varForm) }
            else           { await addVariant(editId, varForm) }
            setVarForm(EMPTY_VAR); setEditVarId(null)
            setVarMsg('Saved!'); loadVariants(editId)
        } catch (e) { setVarMsg(e.response?.data?.error || 'Failed') }
    }

    const startEditVar = (v) => {
        setEditVarId(v.VARIANT_ID)
        setVarForm({ size_: v.SIZE_||'', color: v.COLOR||'', stock_qty: v.STOCK_QTY })
    }

    const handleDeleteVar = async (vid) => {
        if (!window.confirm('Delete variant?')) return
        try { await deleteVariant(vid); loadVariants(editId); setVarMsg('Deleted') }
        catch { setVarMsg('Delete failed') }
    }

    const totalStock = variants.reduce((s, v) => s + (v.STOCK_QTY || 0), 0)

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
            <div style={{ marginBottom:24 }}>
                <h1 style={{ fontSize:26, fontWeight:600, color:'#0f172a', marginBottom:4 }}>Manage Products</h1>
                <p style={{ fontSize:14, color:'#64748b' }}>{products.length} products</p>
            </div>
            {msg   && <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d',
                           padding:'11px 16px', borderRadius:10, marginBottom:16, fontSize:13 }}>{msg}</div>}
            {error && <div style={{ background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
                           padding:'11px 16px', borderRadius:10, marginBottom:16, fontSize:13 }}>✕ {error}</div>}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }}>
                {/* Products Table */}
                <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14, overflow:'auto' }}>
                    <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9',
                                  display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ fontSize:14, fontWeight:600, color:'#0f172a' }}>All Products</span>
                        <span style={{ fontSize:12, color:'#94a3b8', background:'#f8fafc',
                                       padding:'3px 10px', borderRadius:20 }}>{products.length} items</span>
                    </div>
                    <table style={{ width:'100%', borderCollapse:'collapse', minWidth:480 }}>
                        <thead><tr style={{ background:'#f8fafc' }}>
                            {['','Product','Category','Price','Stock','Actions'].map((h,i) => (
                                <th key={i} style={{ textAlign:'left', padding:'10px 14px',
                                    fontSize:11, fontWeight:600, color:'#94a3b8',
                                    textTransform:'uppercase', letterSpacing:'.04em' }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.PRODUCT_ID} style={{ borderTop:'1px solid #f1f5f9',
                                    background: editId===p.PRODUCT_ID ? '#fafaff' : 'transparent' }}>
                                    <td style={{ padding:'10px 14px', width:52 }}>
                                        <img src={imgSrc(p.IMAGE_URL) || PLACEHOLDER} alt={p.PRODUCT_NAME}
                                            style={{ width:44, height:44, objectFit:'cover',
                                                     borderRadius:8, border:'1px solid #e2e8f0' }}
                                            onError={e => { e.target.src = PLACEHOLDER }} />
                                    </td>
                                    <td style={{ padding:'10px 8px', fontSize:13, fontWeight:500, color:'#0f172a' }}>
                                        {p.PRODUCT_NAME}
                                    </td>
                                    <td style={{ padding:'10px 8px', fontSize:12, color:'#64748b' }}>{p.CATEGORY||'—'}</td>
                                    <td style={{ padding:'10px 8px', fontSize:13, fontWeight:600, color:'#0f172a' }}>${p.PRICE}</td>
                                    <td style={{ padding:'10px 8px' }}>
                                        <span style={{ fontSize:12, padding:'3px 10px', borderRadius:20, fontWeight:500,
                                            background: p.STOCK_QTY===0?'#fef2f2': p.STOCK_QTY<10?'#fffbeb':'#f0fdf4',
                                            color:      p.STOCK_QTY===0?'#dc2626': p.STOCK_QTY<10?'#b45309':'#16a34a' }}>
                                            {p.STOCK_QTY===0 ? 'Out' : p.STOCK_QTY}
                                        </span>
                                    </td>
                                    <td style={{ padding:'10px 14px' }}>
                                        <div style={{ display:'flex', gap:6 }}>
                                            <button onClick={() => startEdit(p)}
                                                style={{ padding:'5px 12px', background:'#eff6ff', color:'#2563eb',
                                                    border:'1px solid #bfdbfe', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:500 }}>Edit</button>
                                            <button onClick={() => handleDelete(p.PRODUCT_ID, p.PRODUCT_NAME)}
                                                style={{ padding:'5px 12px', background:'#fef2f2', color:'#dc2626',
                                                    border:'1px solid #fecaca', borderRadius:6, cursor:'pointer', fontSize:12, fontWeight:500 }}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr><td colSpan={6} style={{ padding:40, textAlign:'center', color:'#94a3b8', fontSize:14 }}>
                                    No products yet — add one →
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Right Panel */}
                <div>
                    {/* Product Form */}
                    <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:14,
                                  padding:24, marginBottom: showVariants ? 16 : 0 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                            <span style={{ fontSize:15, fontWeight:600, color:'#0f172a' }}>
                                {editId ? ' Edit Product' : '+ Add New Product'}
                            </span>
                            {editId && <button onClick={cancelEdit}
                                style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:13 }}>✕ Cancel</button>}
                        </div>

                        {/* Image */}
                        <div style={{ marginBottom:16 }}>
                            <label style={lbl}>Product Image</label>
                            {preview || form.image_url ? (
                                <div style={{ position:'relative', borderRadius:10, overflow:'hidden', border:'1px solid #e2e8f0' }}>
                                    <img src={preview || imgSrc(form.image_url)} alt="preview"
                                        style={{ width:'100%', height:150, objectFit:'cover', display:'block' }} />
                                    <div style={{ position:'absolute', bottom:0, left:0, right:0,
                                                  background:'rgba(0,0,0,.5)', padding:'8px',
                                                  display:'flex', gap:8, justifyContent:'center' }}>
                                        <label style={{ background:'#fff', color:'#0f172a', borderRadius:6,
                                                        padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:500 }}>
                                            Change
                                            <input ref={fileRef} type="file" accept="image/*"
                                                style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
                                        </label>
                                        <button onClick={() => { setPreview(null); setF('image_url','') }}
                                            style={{ background:'#fee2e2', color:'#dc2626', border:'none',
                                                     borderRadius:6, padding:'5px 12px', cursor:'pointer', fontSize:12, fontWeight:500 }}>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div onDragOver={e => { e.preventDefault(); setDragging(true) }}
                                     onDragLeave={() => setDragging(false)}
                                     onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                                     onClick={() => fileRef.current.click()}
                                     style={{ border:`2px dashed ${dragging?'#6366f1':'#cbd5e1'}`, borderRadius:10,
                                              padding:'22px 16px', textAlign:'center', cursor:'pointer',
                                              background: dragging?'#eef2ff':'#f8fafc' }}>
                                    <input ref={fileRef} type="file" accept="image/*"
                                        style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
                                    {uploading ? <div style={{ color:'#6366f1', fontSize:13 }}>⏳ Uploading...</div>
                                    : <><div style={{ fontSize:28, marginBottom:6 }}>📸</div>
                                        <div style={{ fontSize:13, fontWeight:500, color:'#475569' }}>Click to upload or drag & drop</div>
                                        <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>JPG, PNG, WEBP — anywhere on device</div></>}
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom:14 }}>
                            <label style={lbl}>Product Name *</label>
                            <input style={inp} value={form.product_name}
                                onChange={e => setF('product_name', e.target.value)}
                                placeholder="e.g. Classic White Shirt" onFocus={focus} onBlur={blur} />
                        </div>
                        <div style={{ marginBottom:14 }}>
                            <label style={lbl}>Category</label>
                            <select style={{ ...inp, background:'#fff', cursor:'pointer' }}
                                value={form.category} onChange={e => setF('category', e.target.value)}>
                                <option value="">Select category</option>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ marginBottom:20 }}>
                            <label style={lbl}>Price ($) *</label>
                            <input style={inp} type="number" value={form.price}
                                onChange={e => setF('price', e.target.value)}
                                placeholder="0.00" onFocus={focus} onBlur={blur} />
                        </div>
                        <button onClick={submitProduct}
                            style={{ width:'100%', padding:'12px', background:'#4f46e5', color:'#fff',
                                     border:'none', borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer' }}
                            onMouseEnter={e => e.target.style.background='#4338ca'}
                            onMouseLeave={e => e.target.style.background='#4f46e5'}>
                            {editId ? 'Save Product' : 'Add Product →'}
                        </button>
                        {!editId && <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginTop:8 }}>
                            After saving, you can add sizes & colors
                        </p>}
                    </div>

                    {/* Variants Panel */}
                    {showVariants && editId && (
                        <div style={{ background:'#fff', border:'2px solid #e0e7ff', borderRadius:14, padding:24 }}>
                            <div style={{ marginBottom:16 }}>
                                <div style={{ fontSize:15, fontWeight:600, color:'#0f172a' }}>📦 Sizes & Colors</div>
                                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>
                                    {variants.length} variants · {totalStock} total stock
                                </div>
                            </div>

                            {varMsg && <div style={{ background:'#f0fdf4', color:'#15803d', padding:'8px 12px',
                                borderRadius:8, fontSize:12, marginBottom:12, border:'1px solid #bbf7d0' }}>{varMsg}</div>}

                            {/* Variants list */}
                            {variants.length > 0 && (
                                <div style={{ marginBottom:16, border:'1px solid #f1f5f9', borderRadius:10, overflow:'hidden' }}>
                                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                                        <thead><tr style={{ background:'#f8fafc' }}>
                                            {['Size','Color','Stock',''].map((h,i) => (
                                                <th key={i} style={{ padding:'8px 12px', textAlign:'left',
                                                    fontSize:11, fontWeight:600, color:'#94a3b8',
                                                    textTransform:'uppercase', letterSpacing:'.04em' }}>{h}</th>
                                            ))}
                                        </tr></thead>
                                        <tbody>
                                            {variants.map(v => (
                                                <tr key={v.VARIANT_ID} style={{ borderTop:'1px solid #f1f5f9',
                                                    background: editVarId===v.VARIANT_ID ? '#f5f3ff' : 'transparent' }}>
                                                    <td style={{ padding:'10px 12px', fontWeight:600, color:'#0f172a' }}>
                                                        {v.SIZE_ || '—'}
                                                    </td>
                                                    <td style={{ padding:'10px 12px', color:'#64748b' }}>{v.COLOR || '—'}</td>
                                                    <td style={{ padding:'10px 12px' }}>
                                                        <span style={{ fontSize:12, padding:'2px 10px', borderRadius:12, fontWeight:500,
                                                            background: v.STOCK_QTY===0?'#fef2f2': v.STOCK_QTY<5?'#fffbeb':'#f0fdf4',
                                                            color:      v.STOCK_QTY===0?'#dc2626': v.STOCK_QTY<5?'#b45309':'#16a34a' }}>
                                                            {v.STOCK_QTY}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding:'10px 12px' }}>
                                                        <div style={{ display:'flex', gap:4 }}>
                                                            <button onClick={() => startEditVar(v)}
                                                                style={{ padding:'3px 8px', background:'#eff6ff', color:'#2563eb',
                                                                    border:'1px solid #bfdbfe', borderRadius:5, cursor:'pointer', fontSize:11 }}>Edit</button>
                                                            <button onClick={() => handleDeleteVar(v.VARIANT_ID)}
                                                                style={{ padding:'3px 8px', background:'#fef2f2', color:'#dc2626',
                                                                    border:'1px solid #fecaca', borderRadius:5, cursor:'pointer', fontSize:11 }}>Del</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Add/Edit variant */}
                            <div style={{ background:'#f8fafc', borderRadius:10, padding:14 }}>
                                <div style={{ fontSize:12, fontWeight:600, color:'#475569', marginBottom:10 }}>
                                    {editVarId ? ' Edit variant' : '+ Add variant'}
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 80px', gap:8 }}>
                                    <div>
                                        <label style={{ ...lbl, marginBottom:4 }}>Size</label>
                                        <select style={{ ...inp, padding:'8px 10px', background:'#fff' }}
                                            value={varForm.size_} onChange={e => setV('size_', e.target.value)}>
                                            <option value="">Select</option>
                                            {SIZES.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ ...lbl, marginBottom:4 }}>Color</label>
                                        <input style={{ ...inp, padding:'8px 10px' }}
                                            value={varForm.color} onChange={e => setV('color', e.target.value)}
                                            placeholder="e.g. White" onFocus={focus} onBlur={blur} />
                                    </div>
                                    <div>
                                        <label style={{ ...lbl, marginBottom:4 }}>Stock</label>
                                        <input type="number" style={{ ...inp, padding:'8px 10px' }}
                                            value={varForm.stock_qty} onChange={e => setV('stock_qty', e.target.value)}
                                            placeholder="0" onFocus={focus} onBlur={blur} />
                                    </div>
                                </div>
                                <div style={{ display:'flex', gap:8, marginTop:10 }}>
                                    <button onClick={submitVariant}
                                        style={{ flex:1, padding:'9px', background:'#4f46e5', color:'#fff',
                                                 border:'none', borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer' }}>
                                        {editVarId ? 'Save Variant' : 'Add Variant'}
                                    </button>
                                    {editVarId && (
                                        <button onClick={() => { setEditVarId(null); setVarForm(EMPTY_VAR) }}
                                            style={{ padding:'9px 14px', background:'#f1f5f9', color:'#64748b',
                                                     border:'none', borderRadius:8, fontSize:13, cursor:'pointer' }}>Cancel</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
import { useEffect, useState } from 'react'
import API from '../../api'

const TABLE_ICONS = {
    USERS: '', CUSTOMERS: '', PRODUCTS: '',
    PRODUCT_VARIANTS: '', ORDERS: '🛒',
    ORDER_ITEMS: '', SALES_LOG: ''
}

export default function Backup() {
    const [stats,     setStats]     = useState([])
    const [timestamp, setTimestamp] = useState('')
    const [loading,   setLoading]   = useState(true)
    const [backing,   setBacking]   = useState(false)
    const [backupType,setBackupType]= useState('sql')
    const [msg,       setMsg]       = useState('')
    const [history,   setHistory]   = useState([])

    const loadStats = async () => {
        setLoading(true)
        try {
            const res = await API.get('/backup/')
            setStats(res.data.tables)
            setTimestamp(res.data.timestamp)
        } catch(e) { console.error(e) }
        setLoading(false)
    }

    useEffect(() => { loadStats() }, [])

    const totalRows = stats.reduce((s,t) => s + (t.rows||0), 0)

    const handleBackup = async () => {
        setBacking(true); setMsg('')
        try {
            const res = await API.post('/backup/', { type: backupType }, {
                responseType: 'blob'
            })
            // Get filename from Content-Disposition header
            const disposition = res.headers['content-disposition'] || ''
            const match = disposition.match(/filename="(.+)"/)
            const filename = match ? match[1]
                : `mens_store_backup_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.${backupType}`

            // Trigger download
            const url  = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href  = url
            link.setAttribute('download', filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)

            // Add to history
            const entry = {
                id:       Date.now(),
                filename,
                type:     backupType.toUpperCase(),
                time:     new Date().toLocaleString(),
                rows:     totalRows,
            }
            setHistory(prev => [entry, ...prev.slice(0,4)])
            setMsg(`✓ Backup downloaded: ${filename}`)
        } catch(e) {
            setMsg('✕ Backup failed — ' + (e.message || 'unknown error'))
        }
        setBacking(false)
    }

    return (
        <div style={{ fontFamily:"'DM Sans',sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>

            {/* Header */}
            <div style={{ marginBottom:28 }}>
                <h1 style={{ fontSize:26, fontWeight:700, color:'#0f172a', marginBottom:4,
                              display:'flex', alignItems:'center', gap:10 }}>
                     Database Backup
                </h1>
                <p style={{ fontSize:14, color:'#64748b' }}>
                    Export all database tables as a downloadable backup file
                </p>
            </div>

            {msg && (
                <div style={{ padding:'12px 16px', borderRadius:10, marginBottom:20,
                    fontSize:13, fontWeight:500,
                    background: msg.startsWith('✓') ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${msg.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`,
                    color: msg.startsWith('✓') ? '#15803d' : '#dc2626' }}>
                    {msg}
                </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24 }}>

                {/* Left: Table stats */}
                <div>
                    {/* Summary */}
                    <div style={{ background:'linear-gradient(135deg,#1e1b4b,#4f46e5)',
                                  borderRadius:16, padding:'24px 28px', marginBottom:20,
                                  display:'flex', justifyContent:'space-between',
                                  alignItems:'center' }}>
                        <div>
                            <div style={{ fontSize:11, color:'#a5b4fc', fontWeight:600,
                                          textTransform:'uppercase', letterSpacing:'.08em',
                                          marginBottom:6 }}>Current Database</div>
                            <div style={{ fontSize:36, fontWeight:800, color:'#fff' }}>
                                {totalRows.toLocaleString()}
                            </div>
                            <div style={{ fontSize:14, color:'#c7d2fe', marginTop:4 }}>
                                total records across {stats.length} tables
                            </div>
                        </div>
                        <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:11, color:'#a5b4fc', marginBottom:4 }}>
                                Last checked
                            </div>
                            <div style={{ fontSize:13, color:'#e0e7ff', fontWeight:500 }}>
                                {timestamp || '—'}
                            </div>
                            <button onClick={loadStats}
                                style={{ marginTop:10, padding:'6px 14px',
                                         background:'rgba(255,255,255,.15)',
                                         border:'1px solid rgba(255,255,255,.2)',
                                         borderRadius:8, color:'#fff', cursor:'pointer',
                                         fontSize:12, fontWeight:500 }}>
                                ↺ Refresh
                            </button>
                        </div>
                    </div>

                    {/* Table list */}
                    <div style={{ background:'#fff', border:'1px solid #e2e8f0',
                                  borderRadius:14, overflow:'hidden' }}>
                        <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9',
                                      fontSize:13, fontWeight:600, color:'#0f172a' }}>
                            Tables included in backup
                        </div>
                        {loading ? (
                            <div style={{ padding:40, textAlign:'center', color:'#94a3b8' }}>
                                Loading...
                            </div>
                        ) : stats.map((t, i) => (
                            <div key={t.table}
                                style={{ display:'flex', alignItems:'center', gap:14,
                                         padding:'14px 20px',
                                         borderTop: i>0 ? '1px solid #f8fafc' : 'none',
                                         background: i%2===0 ? '#fff' : '#fafafa' }}>
                                <div style={{ width:40, height:40, background:'#f0f0ff',
                                              borderRadius:10, display:'flex',
                                              alignItems:'center', justifyContent:'center',
                                              fontSize:18, flexShrink:0 }}>
                                    {TABLE_ICONS[t.table] || '📄'}
                                </div>
                                <div style={{ flex:1 }}>
                                    <div style={{ fontSize:13, fontWeight:600,
                                                  color:'#0f172a', marginBottom:2 }}>
                                        {t.table}
                                    </div>
                                    {t.error && (
                                        <div style={{ fontSize:11, color:'#dc2626' }}>
                                            Error: {t.error}
                                        </div>
                                    )}
                                </div>
                                <div style={{ textAlign:'right' }}>
                                    <div style={{ fontSize:18, fontWeight:700,
                                                  color: t.rows===0 ? '#94a3b8' : '#4f46e5' }}>
                                        {t.rows?.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize:11, color:'#94a3b8' }}>rows</div>
                                </div>
                                {/* Mini bar */}
                                <div style={{ width:80, height:6, background:'#f1f5f9',
                                              borderRadius:3, overflow:'hidden' }}>
                                    <div style={{ height:'100%', borderRadius:3,
                                                  background: t.rows===0 ? '#e2e8f0' : '#6366f1',
                                                  width: `${Math.min(100, (t.rows/Math.max(...stats.map(x=>x.rows),1))*100)}%` }}/>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Backup history */}
                    {history.length > 0 && (
                        <div style={{ background:'#fff', border:'1px solid #e2e8f0',
                                      borderRadius:14, overflow:'hidden', marginTop:20 }}>
                            <div style={{ padding:'14px 20px', borderBottom:'1px solid #f1f5f9',
                                          fontSize:13, fontWeight:600, color:'#0f172a' }}>
                                 Recent Backups (this session)
                            </div>
                            {history.map(h => (
                                <div key={h.id}
                                    style={{ display:'flex', alignItems:'center', gap:12,
                                             padding:'12px 20px',
                                             borderTop:'1px solid #f8fafc' }}>
                                    <div style={{ fontSize:20 }}>
                                        {h.type==='SQL' ? '' : ''}
                                    </div>
                                    <div style={{ flex:1 }}>
                                        <div style={{ fontSize:13, fontWeight:500,
                                                      color:'#0f172a', marginBottom:1 }}>
                                            {h.filename}
                                        </div>
                                        <div style={{ fontSize:11, color:'#94a3b8' }}>
                                            {h.time} · {h.rows} rows
                                        </div>
                                    </div>
                                    <span style={{ fontSize:11, padding:'2px 8px',
                                                   borderRadius:12, fontWeight:600,
                                                   background: h.type==='SQL'?'#ede9fe':'#e0f2fe',
                                                   color: h.type==='SQL'?'#5b21b6':'#0369a1' }}>
                                        {h.type}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Backup controls */}
                <div>
                    <div style={{ background:'#fff', border:'1px solid #e2e8f0',
                                  borderRadius:14, padding:24,
                                  position:'sticky', top:24 }}>
                        <div style={{ fontSize:15, fontWeight:700, color:'#0f172a',
                                      marginBottom:20 }}>
                            Create Backup
                        </div>

                        {/* Format selector */}
                        <div style={{ marginBottom:20 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#64748b',
                                          textTransform:'uppercase', letterSpacing:'.05em',
                                          marginBottom:10 }}>
                                Backup Format
                            </div>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                                {[
                                    ['sql', '', 'SQL File', 'Oracle INSERT statements\nRun directly in SQL Developer'],
                                    ['json','', 'JSON File', 'Structured data format\nEasy to read and import'],
                                ].map(([val, icon, label, desc]) => (
                                    <div key={val}
                                        onClick={() => setBackupType(val)}
                                        style={{ padding:'14px', borderRadius:12, cursor:'pointer',
                                                 border:`2px solid ${backupType===val?'#4f46e5':'#e2e8f0'}`,
                                                 background: backupType===val?'#f5f3ff':'#fff',
                                                 transition:'all .15s' }}>
                                        <div style={{ fontSize:24, marginBottom:6 }}>{icon}</div>
                                        <div style={{ fontSize:13, fontWeight:700,
                                                      color: backupType===val?'#4f46e5':'#0f172a' }}>
                                            {label}
                                        </div>
                                        <div style={{ fontSize:11, color:'#94a3b8',
                                                      marginTop:4, whiteSpace:'pre-line',
                                                      lineHeight:1.5 }}>
                                            {desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What's included */}
                        <div style={{ background:'#f8fafc', borderRadius:10,
                                      padding:'12px 14px', marginBottom:20 }}>
                            <div style={{ fontSize:12, fontWeight:600, color:'#64748b',
                                          marginBottom:8 }}>
                                Includes:
                            </div>
                            {['All users & customers','All products & variants',
                              'All orders & order items','Full sales log'].map(item => (
                                <div key={item} style={{ fontSize:12, color:'#475569',
                                                         marginBottom:4,
                                                         display:'flex', gap:6 }}>
                                    <span style={{ color:'#16a34a' }}>✓</span> {item}
                                </div>
                            ))}
                        </div>

                        {/* Warning */}
                        <div style={{ background:'#fffbeb', border:'1px solid #fde68a',
                                      borderRadius:10, padding:'10px 14px', marginBottom:20,
                                      fontSize:12, color:'#92400e' }}>
                             Store backup files securely. They contain user passwords and personal data.
                        </div>

                        {/* Backup button */}
                        <button onClick={handleBackup} disabled={backing||loading}
                            style={{ width:'100%', padding:'14px',
                                     background: (backing||loading)
                                         ? '#e2e8f0'
                                         : 'linear-gradient(135deg,#4f46e5,#7c3aed)',
                                     color: (backing||loading) ? '#94a3b8' : '#fff',
                                     border:'none', borderRadius:12, fontSize:15,
                                     fontWeight:700, cursor:(backing||loading)?'not-allowed':'pointer',
                                     boxShadow:(backing||loading)?'none':'0 4px 16px rgba(79,70,229,.35)',
                                     transition:'all .2s' }}>
                            {backing
                                ? ' Generating backup...'
                                : `⬇ Download ${backupType.toUpperCase()} Backup`}
                        </button>

                        <p style={{ fontSize:11, color:'#94a3b8', textAlign:'center',
                                    marginTop:10, lineHeight:1.6 }}>
                            File saves to your Downloads folder automatically
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api'

export default function Register() {
    const [form,    setForm]    = useState({
        username:'', password:'', full_name:'',
        email:'', phone:'', address:''
    })
    const [error,   setError]   = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const set = k => e => setForm(prev => ({...prev, [k]: e.target.value}))

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.username || !form.password || !form.full_name || !form.email) {
            setError('Please fill in all required fields'); return
        }
        setLoading(true); setError(''); setSuccess('')
        try {
            await register(form)
            setSuccess('Account created! Redirecting...')
            setTimeout(() => navigate('/login'), 1500)
        } catch(err) {
            setError(err.response?.data?.error || 'Registration failed')
        }
        setLoading(false)
    }

    return (
        <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr',
                      fontFamily:"'DM Sans',sans-serif", background:'#0f0c29',
                      position:'relative', overflow:'hidden' }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>

            {/* Background blobs */}
            <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%',
                          background:'radial-gradient(circle,rgba(79,70,229,.3) 0%,transparent 70%)',
                          top:'-10%', left:'-5%', filter:'blur(40px)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%',
                          background:'radial-gradient(circle,rgba(124,58,237,.25) 0%,transparent 70%)',
                          bottom:'-5%', right:'50%', filter:'blur(40px)', pointerEvents:'none' }}/>

            {/* ── Left: Brand panel ── */}
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-between',
                          padding:'48px 52px', position:'relative', zIndex:1 }}>

                {/* Logo */}
                <div style={{ display:'inline-flex', alignItems:'center', gap:12,
                              background:'rgba(255,255,255,.08)',
                              backdropFilter:'blur(10px)',
                              border:'1px solid rgba(255,255,255,.12)',
                              borderRadius:50, padding:'10px 20px', width:'fit-content' }}>
                    <span style={{ fontSize:22 }}>👔</span>
                    <div>
                        <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Men's Store</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,.5)',
                                      letterSpacing:'.1em' }}>CAMBODIA</div>
                    </div>
                </div>

                {/* Center text */}
                <div>
                    <div style={{ fontSize:11, fontWeight:600, color:'#818cf8',
                                  letterSpacing:'.12em', textTransform:'uppercase',
                                  marginBottom:16 }}>Join Us Today</div>
                    <h1 style={{ fontSize:42, fontWeight:800, color:'#fff',
                                 lineHeight:1.15, marginBottom:20,
                                 letterSpacing:'-.02em' }}>
                        Start Your<br/>Shopping<br/>Journey
                    </h1>
                    <p style={{ fontSize:14, color:'rgba(255,255,255,.55)',
                                lineHeight:1.8, maxWidth:320 }}>
                        Create your free account and get access to our full men's collection.
                        Fast checkout, order tracking and exclusive deals.
                    </p>

                    {/* Benefits */}
                    <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:36 }}>
                        {[
                            ['🛒', 'Easy cart & checkout'],
                            ['📦', 'Track your orders'],
                            ['🔒', 'Secure & private'],
                            ['💳', 'Multiple payment options'],
                        ].map(([icon, text]) => (
                            <div key={text} style={{ display:'flex', alignItems:'center', gap:14 }}>
                                <div style={{ width:38, height:38,
                                              background:'rgba(255,255,255,.08)',
                                              backdropFilter:'blur(8px)',
                                              border:'1px solid rgba(255,255,255,.1)',
                                              borderRadius:10, display:'flex',
                                              alignItems:'center', justifyContent:'center',
                                              fontSize:16 }}>{icon}</div>
                                <span style={{ fontSize:14, color:'rgba(255,255,255,.7)',
                                               fontWeight:500 }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color:'#a5b4fc', fontWeight:600 }}>
                        Sign in →
                    </Link>
                </div>
            </div>

            {/* ── Right: Form ── */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                          padding:'40px 48px', position:'relative', zIndex:1 }}>
                <div style={{ width:'100%', maxWidth:420,
                              background:'rgba(255,255,255,.06)',
                              backdropFilter:'blur(24px)',
                              border:'1px solid rgba(255,255,255,.1)',
                              borderRadius:24, padding:'36px 36px 32px',
                              boxShadow:'0 32px 64px rgba(0,0,0,.4)' }}>

                    <div style={{ marginBottom:28 }}>
                        <h2 style={{ fontSize:24, fontWeight:800, color:'#fff',
                                     marginBottom:6, letterSpacing:'-.02em' }}>
                            Create account
                        </h2>
                        <p style={{ fontSize:13, color:'rgba(255,255,255,.4)' }}>
                            Fill in your details to get started
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div style={{ background:'rgba(239,68,68,.15)',
                                      border:'1px solid rgba(239,68,68,.3)',
                                      color:'#fca5a5', padding:'11px 14px',
                                      borderRadius:10, fontSize:13, marginBottom:20 }}>
                            ✕ {error}
                        </div>
                    )}
                    {success && (
                        <div style={{ background:'rgba(34,197,94,.15)',
                                      border:'1px solid rgba(34,197,94,.3)',
                                      color:'#86efac', padding:'11px 14px',
                                      borderRadius:10, fontSize:13, marginBottom:20 }}>
                            ✓ {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Username + Password */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                                      gap:12, marginBottom:14 }}>
                            {[
                                ['username','Username *','sokdara','text'],
                                ['password','Password *','••••••••','password'],
                            ].map(([k,l,p,t]) => (
                                <div key={k}>
                                    <label style={{ display:'block', fontSize:11, fontWeight:600,
                                                    color:'rgba(255,255,255,.5)', marginBottom:7,
                                                    textTransform:'uppercase', letterSpacing:'.06em' }}>
                                        {l}
                                    </label>
                                    <input type={t} value={form[k]} onChange={set(k)}
                                        placeholder={p} required
                                        style={{ width:'100%', padding:'11px 12px',
                                                 background:'rgba(255,255,255,.07)',
                                                 border:'1px solid rgba(255,255,255,.1)',
                                                 borderRadius:10, fontSize:13, color:'#fff',
                                                 boxSizing:'border-box', outline:'none',
                                                 fontFamily:'inherit', transition:'all .2s' }}
                                        onFocus={e => {
                                            e.target.style.borderColor='rgba(129,140,248,.7)'
                                            e.target.style.background='rgba(255,255,255,.1)'
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor='rgba(255,255,255,.1)'
                                            e.target.style.background='rgba(255,255,255,.07)'
                                        }} />
                                </div>
                            ))}
                        </div>

                        {/* Full name */}
                        <div style={{ marginBottom:14 }}>
                            <label style={{ display:'block', fontSize:11, fontWeight:600,
                                            color:'rgba(255,255,255,.5)', marginBottom:7,
                                            textTransform:'uppercase', letterSpacing:'.06em' }}>
                                Full Name *
                            </label>
                            <input value={form.full_name} onChange={set('full_name')}
                                placeholder="Sok Dara" required
                                style={{ width:'100%', padding:'11px 12px',
                                         background:'rgba(255,255,255,.07)',
                                         border:'1px solid rgba(255,255,255,.1)',
                                         borderRadius:10, fontSize:13, color:'#fff',
                                         boxSizing:'border-box', outline:'none',
                                         fontFamily:'inherit', transition:'all .2s' }}
                                onFocus={e => {
                                    e.target.style.borderColor='rgba(129,140,248,.7)'
                                    e.target.style.background='rgba(255,255,255,.1)'
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor='rgba(255,255,255,.1)'
                                    e.target.style.background='rgba(255,255,255,.07)'
                                }} />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom:14 }}>
                            <label style={{ display:'block', fontSize:11, fontWeight:600,
                                            color:'rgba(255,255,255,.5)', marginBottom:7,
                                            textTransform:'uppercase', letterSpacing:'.06em' }}>
                                Email *
                            </label>
                            <input type="email" value={form.email} onChange={set('email')}
                                placeholder="sokdara@email.com" required
                                style={{ width:'100%', padding:'11px 12px',
                                         background:'rgba(255,255,255,.07)',
                                         border:'1px solid rgba(255,255,255,.1)',
                                         borderRadius:10, fontSize:13, color:'#fff',
                                         boxSizing:'border-box', outline:'none',
                                         fontFamily:'inherit', transition:'all .2s' }}
                                onFocus={e => {
                                    e.target.style.borderColor='rgba(129,140,248,.7)'
                                    e.target.style.background='rgba(255,255,255,.1)'
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor='rgba(255,255,255,.1)'
                                    e.target.style.background='rgba(255,255,255,.07)'
                                }} />
                        </div>

                        {/* Row 2: Phone + Address */}
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr',
                                      gap:12, marginBottom:24 }}>
                            {[
                                ['phone','Phone','012-345-678'],
                                ['address','Address','Phnom Penh'],
                            ].map(([k,l,p]) => (
                                <div key={k}>
                                    <label style={{ display:'block', fontSize:11, fontWeight:600,
                                                    color:'rgba(255,255,255,.5)', marginBottom:7,
                                                    textTransform:'uppercase', letterSpacing:'.06em' }}>
                                        {l}
                                    </label>
                                    <input value={form[k]} onChange={set(k)} placeholder={p}
                                        style={{ width:'100%', padding:'11px 12px',
                                                 background:'rgba(255,255,255,.07)',
                                                 border:'1px solid rgba(255,255,255,.1)',
                                                 borderRadius:10, fontSize:13, color:'#fff',
                                                 boxSizing:'border-box', outline:'none',
                                                 fontFamily:'inherit', transition:'all .2s' }}
                                        onFocus={e => {
                                            e.target.style.borderColor='rgba(129,140,248,.7)'
                                            e.target.style.background='rgba(255,255,255,.1)'
                                        }}
                                        onBlur={e => {
                                            e.target.style.borderColor='rgba(255,255,255,.1)'
                                            e.target.style.background='rgba(255,255,255,.07)'
                                        }} />
                                </div>
                            ))}
                        </div>

                        <button type="submit" disabled={loading}
                            style={{ width:'100%', padding:'13px',
                                     background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                     color:'#fff', border:'none', borderRadius:12,
                                     fontSize:15, fontWeight:700, cursor:'pointer',
                                     boxShadow:'0 6px 20px rgba(99,102,241,.45)',
                                     letterSpacing:'.01em', transition:'all .2s',
                                     opacity: loading ? .8 : 1 }}
                            onMouseEnter={e => { if(!loading) e.target.style.transform='translateY(-1px)' }}
                            onMouseLeave={e => e.target.style.transform='none'}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <p style={{ textAlign:'center', marginTop:18, fontSize:13,
                                color:'rgba(255,255,255,.3)' }}>
                        Already have an account?{' '}
                        <Link to="/login"
                            style={{ color:'#a5b4fc', fontWeight:600, textDecoration:'none' }}>
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
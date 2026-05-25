import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../api'

export default function Login() {
    const [form,    setForm]    = useState({ username:'', password:'' })
    const [error,   setError]   = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true); setError('')
        try {
            const res = await login(form.username, form.password)
            localStorage.setItem('token',       res.data.token)
            localStorage.setItem('role',        res.data.role)
            localStorage.setItem('username',    res.data.username)
            localStorage.setItem('user_id',     res.data.user_id)
            localStorage.setItem('customer_id', res.data.customer_id || '')
            if (res.data.role === 'Admin')     navigate('/admin')
            else if (res.data.role === 'Sale') navigate('/sale')
            else navigate('/products')
        } catch { setError('Invalid username or password') }
        setLoading(false)
    }

    return (
        <div style={{ minHeight:'100vh', margin:0, padding:0,
                      fontFamily:"'DM Sans',sans-serif",
                      background:'#0f0c29', position:'relative', overflow:'hidden',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&display=swap" rel="stylesheet"/>

            {/* ── Animated background blobs ── */}
            <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%',
                          background:'radial-gradient(circle, rgba(79,70,229,.35) 0%, transparent 70%)',
                          top:'-10%', left:'-5%', filter:'blur(40px)' }}/>
            <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%',
                          background:'radial-gradient(circle, rgba(124,58,237,.3) 0%, transparent 70%)',
                          bottom:'-5%', right:'-5%', filter:'blur(40px)' }}/>
            <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%',
                          background:'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)',
                          top:'40%', left:'40%', filter:'blur(30px)' }}/>

            {/* ── Floating product cards (decorative) ── */}
            {[
                { top:'8%',  left:'3%',  rotate:'-8deg',  label:'New Arrival', emoji:'👔', delay:'0s' },
                { top:'60%', left:'2%',  rotate:'6deg',   label:'Best Seller', emoji:'👖', delay:'.3s' },
                { top:'12%', right:'3%', rotate:'7deg',   label:'Premium',     emoji:'🧥', delay:'.15s' },
                { top:'65%', right:'2%', rotate:'-5deg',  label:'Sale 20%',    emoji:'👟', delay:'.45s' },
            ].map((c, i) => (
                <div key={i} style={{
                    position:'absolute', top:c.top, left:c.left, right:c.right,
                    transform:`rotate(${c.rotate})`,
                    background:'rgba(255,255,255,.06)',
                    backdropFilter:'blur(12px)',
                    border:'1px solid rgba(255,255,255,.12)',
                    borderRadius:16, padding:'14px 18px',
                    display:'flex', alignItems:'center', gap:10,
                    animation:`float${i} 4s ease-in-out infinite`,
                    animationDelay: c.delay,
                }}>
                    <div style={{ fontSize:26 }}>{c.emoji}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,.8)' }}>
                        {c.label}
                    </div>
                </div>
            ))}

            <style>{`
                @keyframes float0 { 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(-8deg) translateY(-12px)} }
                @keyframes float1 { 0%,100%{transform:rotate(6deg) translateY(0)} 50%{transform:rotate(6deg) translateY(-10px)} }
                @keyframes float2 { 0%,100%{transform:rotate(7deg) translateY(0)} 50%{transform:rotate(7deg) translateY(-14px)} }
                @keyframes float3 { 0%,100%{transform:rotate(-5deg) translateY(0)} 50%{transform:rotate(-5deg) translateY(-10px)} }
            `}</style>

            {/* ── Main card ── */}
            <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:440,
                          margin:'0 24px' }}>

                {/* Logo */}
                <div style={{ textAlign:'center', marginBottom:32 }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:12,
                                  background:'rgba(255,255,255,.08)',
                                  backdropFilter:'blur(10px)',
                                  border:'1px solid rgba(255,255,255,.15)',
                                  borderRadius:50, padding:'10px 20px' }}>
                        <span style={{ fontSize:22 }}>👔</span>
                        <div>
                            <div style={{ fontSize:16, fontWeight:700, color:'#fff',
                                          lineHeight:1 }}>Men's Store</div>
                            <div style={{ fontSize:10, color:'rgba(255,255,255,.5)',
                                          letterSpacing:'.1em', marginTop:2 }}>CAMBODIA</div>
                        </div>
                    </div>
                </div>

                {/* Card */}
                <div style={{ background:'rgba(255,255,255,.07)',
                              backdropFilter:'blur(24px)',
                              border:'1px solid rgba(255,255,255,.12)',
                              borderRadius:24, padding:'36px 36px 32px',
                              boxShadow:'0 32px 64px rgba(0,0,0,.4)' }}>

                    <h1 style={{ fontSize:28, fontWeight:800, color:'#fff',
                                 marginBottom:6, letterSpacing:'-.02em' }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize:14, color:'rgba(255,255,255,.5)',
                                marginBottom:28 }}>
                        Sign in to your account to continue shopping
                    </p>

                    {/* Error */}
                    {error && (
                        <div style={{ background:'rgba(239,68,68,.15)',
                                      border:'1px solid rgba(239,68,68,.3)',
                                      color:'#fca5a5', padding:'11px 14px',
                                      borderRadius:10, fontSize:13, marginBottom:20 }}>
                            ✕ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div style={{ marginBottom:16 }}>
                            <label style={{ display:'block', fontSize:12, fontWeight:600,
                                            color:'rgba(255,255,255,.6)', marginBottom:8,
                                            textTransform:'uppercase', letterSpacing:'.06em' }}>
                                Username
                            </label>
                            <input
                                value={form.username}
                                onChange={e => setForm({...form, username:e.target.value})}
                                placeholder="Enter your username"
                                required
                                style={{ width:'100%', padding:'13px 16px',
                                         background:'rgba(255,255,255,.08)',
                                         border:'1px solid rgba(255,255,255,.12)',
                                         borderRadius:12, fontSize:14, color:'#fff',
                                         boxSizing:'border-box', outline:'none',
                                         fontFamily:'inherit', transition:'all .2s' }}
                                onFocus={e => {
                                    e.target.style.borderColor='rgba(129,140,248,.8)'
                                    e.target.style.background='rgba(255,255,255,.12)'
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor='rgba(255,255,255,.12)'
                                    e.target.style.background='rgba(255,255,255,.08)'
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom:28 }}>
                            <label style={{ display:'block', fontSize:12, fontWeight:600,
                                            color:'rgba(255,255,255,.6)', marginBottom:8,
                                            textTransform:'uppercase', letterSpacing:'.06em' }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={e => setForm({...form, password:e.target.value})}
                                placeholder="Enter your password"
                                required
                                style={{ width:'100%', padding:'13px 16px',
                                         background:'rgba(255,255,255,.08)',
                                         border:'1px solid rgba(255,255,255,.12)',
                                         borderRadius:12, fontSize:14, color:'#fff',
                                         boxSizing:'border-box', outline:'none',
                                         fontFamily:'inherit', transition:'all .2s' }}
                                onFocus={e => {
                                    e.target.style.borderColor='rgba(129,140,248,.8)'
                                    e.target.style.background='rgba(255,255,255,.12)'
                                }}
                                onBlur={e => {
                                    e.target.style.borderColor='rgba(255,255,255,.12)'
                                    e.target.style.background='rgba(255,255,255,.08)'
                                }}
                            />
                        </div>

                        {/* Sign in button */}
                        <button type="submit" disabled={loading}
                            style={{ width:'100%', padding:'14px',
                                     background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
                                     color:'#fff', border:'none', borderRadius:12,
                                     fontSize:15, fontWeight:700, cursor:'pointer',
                                     boxShadow:'0 8px 24px rgba(99,102,241,.5)',
                                     letterSpacing:'.01em', transition:'all .2s',
                                     opacity: loading ? .8 : 1 }}
                            onMouseEnter={e => { if(!loading) e.target.style.transform='translateY(-1px)' }}
                            onMouseLeave={e => e.target.style.transform='none'}>
                            {loading ? 'Signing in...' : 'Sign in →'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{ display:'flex', alignItems:'center', gap:12,
                                  margin:'20px 0' }}>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.1)' }}/>
                        <span style={{ fontSize:12, color:'rgba(255,255,255,.3)' }}>or</span>
                        <div style={{ flex:1, height:1, background:'rgba(255,255,255,.1)' }}/>
                    </div>

                    {/* Browse without login */}
                    <Link to="/products"
                        style={{ display:'flex', alignItems:'center', justifyContent:'center',
                                 gap:8, padding:'13px',
                                 background:'rgba(255,255,255,.06)',
                                 border:'1px solid rgba(255,255,255,.1)',
                                 borderRadius:12, textDecoration:'none',
                                 color:'rgba(255,255,255,.7)', fontSize:14,
                                 fontWeight:500, transition:'all .2s' }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background='rgba(255,255,255,.1)'
                            e.currentTarget.style.color='#fff'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background='rgba(255,255,255,.06)'
                            e.currentTarget.style.color='rgba(255,255,255,.7)'
                        }}>
                        👔 Browse products without signing in
                    </Link>
                </div>

                {/* Register link */}
                <p style={{ textAlign:'center', marginTop:20, fontSize:14,
                             color:'rgba(255,255,255,.4)' }}>
                    Don't have an account?{' '}
                    <Link to="/register"
                        style={{ color:'#a5b4fc', fontWeight:600, textDecoration:'none' }}>
                        Create one free →
                    </Link>
                </p>
            </div>
        </div>
    )
}
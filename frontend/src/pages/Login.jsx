// src/pages/Login.jsx
// Pure black luxury menswear aesthetic — Mr Porter / SSENSE / Acne Studios.
// Form fields & flow preserved. Swap the fetch placeholder with your existing API call.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ===== Palette =====
// ===== Palette =====
const BG = 'linear-gradient(135deg, #000000 0%, #395672 50%, #463838 100%)'; // black → blue → white
const SURF = '#4e1a1a';      // panels / form background
const INK = '#efeeee';       // main text
const MUTED = '#8e8e8e';     // secondary text / hints
const RULE = '#1a1a1a';      // input underline
const ACCENT_LINE = '#151617'; // links/buttons accent

const s = {
    page: {
        minHeight: '100vh',
        background: BG,
        color: INK,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
        width: '100%',
        maxWidth: 440,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    // Brand
    brand: {
        marginBottom: 56,
        textAlign: 'center',
    },
    monogram: {
        width: 56,
        height: 56,
        border: `1px solid ${INK}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
        fontSize: 30,
        fontWeight: 500,
        fontStyle: 'italic',
        color: INK,
        marginBottom: 18,
    },
    brandText: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: MUTED,
    },
    // Header
    eyebrow: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
        color: MUTED,
        marginBottom: 18,
        textAlign: 'center',
    },
    headline: {
        fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif',
        fontSize: 56,
        fontWeight: 500,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        color: INK,
        textAlign: 'center',
        marginBottom: 18,
    },
    subhead: {
        fontSize: 14,
        lineHeight: 1.7,
        color: MUTED,
        textAlign: 'center',
        marginBottom: 56,
        maxWidth: 360,
    },
    // Form
    form: {
        width: '100%',
    },
    fieldGroup: {
        marginBottom: 32,
    },
    label: {
        display: 'block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: MUTED,
        marginBottom: 14,
    },
    input: {
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${RULE}`,
        padding: '8px 0',
        fontSize: 15,
        color: INK,
        outline: 'none',
        fontFamily: 'inherit',
        letterSpacing: '0.01em',
        transition: 'border-color 0.2s',
    },
    inputFocus: {
        borderBottomColor: INK,
    },
    error: {
        fontSize: 11,
        color: '#e74c3c',
        marginTop: 8,
        marginBottom: 14,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        fontWeight: 600,
    },
    button: {
        width: '100%',
        background: INK,
        color: BG,
        border: 'none',
        padding: '20px 24px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        marginTop: 16,
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
    },
    // OR divider
    dividerWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        margin: '36px 0 28px',
    },
    dividerLine: {
        flex: 1,
        height: 1,
        background: ACCENT_LINE,
    },
    dividerText: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: MUTED,
    },
    guestLink: {
        display: 'block',
        textAlign: 'center',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: INK,
        textDecoration: 'none',
        padding: '14px 0',
        border: `1px solid ${ACCENT_LINE}`,
        transition: 'border-color 0.15s, background 0.15s',
    },
    // Footer
    footer: {
        marginTop: 56,
        fontSize: 13,
        color: MUTED,
        textAlign: 'center',
    },
    inlineLink: {
        color: INK,
        textDecoration: 'none',
        borderBottom: `1px solid ${INK}`,
        paddingBottom: 1,
        marginLeft: 4,
        fontWeight: 500,
    },
    bottomBar: {
        marginTop: 56,
        paddingTop: 24,
        borderTop: `1px solid ${ACCENT_LINE}`,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 10,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: MUTED,
        fontWeight: 600,
    },
}

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error,    setError]    = useState('')
    const [loading,  setLoading]  = useState(false)
    const [focused,  setFocused]  = useState(null)
    const navigate = useNavigate()

    // Load Cormorant Garamond once
    useEffect(() => {
        const href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap'
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = href
            document.head.appendChild(link)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // ════════════════════════════════════════════════════════════════
            //  REPLACE THIS BLOCK with your existing API call
            // Your existing Login.jsx probably has something like:
            //    import { loginUser } from '../api'
            //    const { data } = await loginUser({ username, password })
            // Paste your existing logic here, then keep the localStorage block below.
            // ════════════════════════════════════════════════════════════════
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            if (!response.ok) throw new Error('Incorrect username or password')

            const data = await response.json()

            // ===== These are the localStorage keys your app reads =====
            // (Navbar reads 'role' and 'username'; Products reads 'token',
            //  'customer_id', 'user_id' for placing orders.)
            localStorage.setItem('token',    data.token    || '')
            localStorage.setItem('username', data.username || username)
            localStorage.setItem('role',     data.role     || 'Customer')
            if (data.user_id)     localStorage.setItem('user_id',     data.user_id)
            if (data.customer_id) localStorage.setItem('customer_id', data.customer_id)

            // Route by role
            if      (data.role === 'Admin') navigate('/admin')
            else if (data.role === 'Sale')  navigate('/sale')
            else                            navigate('/products')
        } catch (err) {
            setError(err.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={s.page}>
            <div style={s.container}>
                {/* Brand */}
                <div style={s.brand}>
                    <div style={s.monogram}>M</div>
                    <div style={s.brandText}>Men's · Cambodia</div>
                </div>

                {/* Header */}
                <div style={s.eyebrow}>Members</div>
                <h1 style={s.headline}>Sign In</h1>
                <p style={s.subhead}>
                    Welcome back. Enter your details to continue
                    your shopping journey.
                </p>

                {/* Form */}
                <form style={s.form} onSubmit={handleSubmit} noValidate>
                    <div style={s.fieldGroup}>
                        <label style={s.label} htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            style={{
                                ...s.input,
                                ...(focused === 'username' ? s.inputFocus : {}),
                            }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={() => setFocused('username')}
                            onBlur={() => setFocused(null)}
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>

                    <div style={s.fieldGroup}>
                        <label style={s.label} htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            style={{
                                ...s.input,
                                ...(focused === 'password' ? s.inputFocus : {}),
                            }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setFocused('password')}
                            onBlur={() => setFocused(null)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    {error && <div style={s.error}>{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...s.button,
                            ...(loading ? { opacity: 0.5, cursor: 'wait' } : {}),
                        }}
                    >
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>

                {/* OR divider */}
                <div style={s.dividerWrap}>
                    <div style={s.dividerLine} />
                    <span style={s.dividerText}>Or</span>
                    <div style={s.dividerLine} />
                </div>

                <Link to="/products" style={s.guestLink}>
                    Continue as Guest →
                </Link>

                {/* Footer */}
                <p style={s.footer}>
                    Don't have an account?
                    <Link to="/register" style={s.inlineLink}>Register</Link>
                </p>

                {/* Bottom bar */}
                <div style={s.bottomBar}>
                    <span>© 2026 Men's Store</span>
                    <span>Phnom Penh</span>
                </div>
            </div>
        </div>
    )
}
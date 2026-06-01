// src/pages/Register.jsx
// Pure black luxury menswear aesthetic — matches Login.jsx.
// All form fields preserved (username, password, full name, email, phone, address).
// Swap the fetch placeholder with your existing API call.

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ===== Palette (same as Login) =====

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
        justifyContent: 'flex-start',
        padding: '60px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    container: {
        width: '100%',
        maxWidth: 520,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    brand: {
        marginBottom: 48,
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
        fontSize: 52,
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
        marginBottom: 48,
        maxWidth: 380,
    },
    form: {
        width: '100%',
    },
    fieldRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 28,
        marginBottom: 28,
    },
    fieldGroup: {
        marginBottom: 28,
    },
    label: {
        display: 'block',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: MUTED,
        marginBottom: 12,
    },
    required: {
        color: '#e74c3c',
        marginLeft: 4,
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
        boxSizing: 'border-box',
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
    success: {
        fontSize: 12,
        color: '#22c55e',
        marginTop: 8,
        marginBottom: 14,
        letterSpacing: '0.05em',
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
        marginTop: 24,
        transition: 'opacity 0.15s',
        fontFamily: 'inherit',
    },
    footer: {
        marginTop: 36,
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
    benefits: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginTop: 36,
        marginBottom: 36,
        paddingTop: 28,
        paddingBottom: 0,
        borderTop: `1px solid ${ACCENT_LINE}`,
        width: '100%',
    },
    benefit: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        fontSize: 12,
        color: MUTED,
    },
    benefitDot: {
        width: 5,
        height: 5,
        background: INK,
        borderRadius: '50%',
        marginTop: 6,
        flexShrink: 0,
    },
    bottomBar: {
        marginTop: 36,
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

export default function Register() {
    const [form, setForm] = useState({
        username:  '',
        password:  '',
        full_name: '',
        email:     '',
        phone:     '',
        address:   '',
    })
    const [error,   setError]   = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)
    const [focused, setFocused] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap'
        if (!document.querySelector(`link[href="${href}"]`)) {
            const link = document.createElement('link')
            link.rel = 'stylesheet'
            link.href = href
            document.head.appendChild(link)
        }
    }, [])

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            // ════════════════════════════════════════════════════════════════
            // ⚠️ REPLACE THIS BLOCK with your existing API call
            // Your existing Register.jsx probably has something like:
            //    import { registerCustomer } from '../api'
            //    const { data } = await registerCustomer(form)
            // Paste your existing logic here.
            // ════════════════════════════════════════════════════════════════
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || errData.detail || 'Registration failed')
            }

            setSuccess('Account created. Redirecting to sign in…')
            setTimeout(() => navigate('/login'), 1500)
        } catch (err) {
            setError(err.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const fieldStyle = (name) => ({
        ...s.input,
        ...(focused === name ? s.inputFocus : {}),
    })

    return (
        <div style={s.page}>
            <div style={s.container}>
                {/* Brand */}
                <div style={s.brand}>
                    <div style={s.monogram}>M</div>
                    <div style={s.brandText}>Men's · Cambodia</div>
                    
                </div>

                {/* Header */}
                <div style={s.eyebrow}>Join Us Today</div>
                <h1 style={s.headline}>Create Account</h1>
                <p style={s.subhead}>
                    Start your shopping journey. Get access to our full
                    collection, faster checkout, and order tracking.
                </p>

                {/* Form */}
                <form style={s.form} onSubmit={handleSubmit} noValidate>

                    {/* Username + Password row */}
                    <div style={s.fieldRow}>
                        <div>
                            <label style={s.label} htmlFor="username">
                                Username<span style={s.required}>*</span>
                            </label>
                            <input
                                id="username"
                                type="text"
                                style={fieldStyle('username')}
                                value={form.username}
                                onChange={(e) => update('username', e.target.value)}
                                onFocus={() => setFocused('username')}
                                onBlur={() => setFocused(null)}
                                required
                                autoComplete="username"
                            />
                        </div>
                        <div>
                            <label style={s.label} htmlFor="password">
                                Password<span style={s.required}>*</span>
                            </label>
                            <input
                                id="password"
                                type="password"
                                style={fieldStyle('password')}
                                value={form.password}
                                onChange={(e) => update('password', e.target.value)}
                                onFocus={() => setFocused('password')}
                                onBlur={() => setFocused(null)}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    {/* Full Name */}
                    <div style={s.fieldGroup}>
                        <label style={s.label} htmlFor="full_name">
                            Full Name<span style={s.required}>*</span>
                        </label>
                        <input
                            id="full_name"
                            type="text"
                            style={fieldStyle('full_name')}
                            placeholder=""
                            value={form.full_name}
                            onChange={(e) => update('full_name', e.target.value)}
                            onFocus={() => setFocused('full_name')}
                            onBlur={() => setFocused(null)}
                            required
                            autoComplete="name"
                        />
                    </div>

                    {/* Email */}
                    <div style={s.fieldGroup}>
                        <label style={s.label} htmlFor="email">
                            Email<span style={s.required}>*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            style={fieldStyle('email')}
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused(null)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* Phone + Address row */}
                    <div style={s.fieldRow}>
                        <div>
                            <label style={s.label} htmlFor="phone">Phone</label>
                            <input
                                id="phone"
                                type="tel"
                                style={fieldStyle('phone')}
                                value={form.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                onFocus={() => setFocused('phone')}
                                onBlur={() => setFocused(null)}
                                autoComplete="tel"
                            />
                        </div>
                        <div>
                            <label style={s.label} htmlFor="address">Address</label>
                            <input
                                id="address"
                                type="text"
                                style={fieldStyle('address')}
                                value={form.address}
                                onChange={(e) => update('address', e.target.value)}
                                onFocus={() => setFocused('address')}
                                onBlur={() => setFocused(null)}
                                autoComplete="street-address"
                            />
                        </div>
                    </div>

                    {error   && <div style={s.error}>{error}</div>}
                    {success && <div style={s.success}>{success}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...s.button,
                            ...(loading ? { opacity: 0.5, cursor: 'wait' } : {}),
                        }}
                    >
                        {loading ? 'Creating account…' : 'Create Account →'}
                    </button>
                </form>

                {/* Benefits */}
                <div style={s.benefits}>
                    <div style={s.benefit}>
                        <div style={s.benefitDot} />
                        <span>Easy cart & checkout</span>
                    </div>
                    <div style={s.benefit}>
                        <div style={s.benefitDot} />
                        <span>Track your orders</span>
                    </div>
                    <div style={s.benefit}>
                        <div style={s.benefitDot} />
                        <span>Secure & private</span>
                    </div>
                    <div style={s.benefit}>
                        <div style={s.benefitDot} />
                        <span>Exclusive member deals</span>
                    </div>
                </div>

                {/* Footer */}
                <p style={s.footer}>
                    Already have an account?
                    <Link to="/login" style={s.inlineLink}>Sign in</Link>
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
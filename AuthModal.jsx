import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const styles = `
  .auth-backdrop {
    position: fixed; inset: 0; background: rgba(30,30,26,.62);
    z-index: 700; display: flex; align-items: center; justify-content: center;
    padding: 1.5rem; backdrop-filter: blur(10px);
    animation: authFadeIn .2s ease;
  }
  @keyframes authFadeIn { from { opacity: 0 } to { opacity: 1 } }

  .auth-modal {
    background: white; border-radius: 24px; padding: 2.4rem;
    max-width: 420px; width: 100%; position: relative;
    animation: authSlideUp .28s cubic-bezier(.32,.72,0,1);
    box-shadow: 0 32px 80px rgba(30,30,26,.18);
  }
  @keyframes authSlideUp { from { opacity:0; transform:translateY(16px) scale(.98) } to { opacity:1; transform:none } }

  .auth-x {
    position: absolute; top: 1.1rem; right: 1.3rem;
    background: #f8f5f0; border: none; border-radius: 50%;
    width: 28px; height: 28px; cursor: pointer; font-size: .9rem;
    color: #7a7971; display: flex; align-items: center; justify-content: center;
    transition: background .15s;
  }
  .auth-x:hover { background: #eef3eb; }

  .auth-leaf { font-size: 2rem; text-align: center; display: block; margin-bottom: .9rem; }

  .auth-title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.9rem;
    font-weight: 300; text-align: center; margin-bottom: .35rem; line-height: 1.1;
  }
  .auth-title em { font-style: italic; color: #7d9b6e; }
  .auth-sub {
    font-size: .76rem; color: #7a7971; text-align: center;
    line-height: 1.7; margin-bottom: 1.8rem;
  }

  .auth-field { display: flex; flex-direction: column; gap: .22rem; margin-bottom: .75rem; }
  .auth-field label {
    font-size: .57rem; letter-spacing: .14em; text-transform: uppercase; color: #7a7971;
  }
  .auth-field input {
    border: 1.5px solid rgba(125,155,110,.22); border-radius: 10px;
    padding: .78rem .95rem; font-family: 'Sora', sans-serif;
    font-size: .84rem; color: #1e1e1a; outline: none;
    transition: border-color .2s; background: #fdfcfa;
  }
  .auth-field input:focus { border-color: #7d9b6e; background: white; }

  .auth-btn {
    width: 100%; padding: .88rem; border-radius: 2rem;
    font-family: 'Sora', sans-serif; font-size: .8rem;
    letter-spacing: .06em; cursor: pointer; border: none;
    background: #1e1e1a; color: white;
    transition: background .2s; margin-top: .25rem;
  }
  .auth-btn:hover { background: #4e7a3e; }
  .auth-btn:disabled { opacity: .55; cursor: not-allowed; }

  .auth-err {
    background: #fff5f2; border: 1px solid #f0c4b8; border-radius: 9px;
    padding: .6rem .85rem; font-size: .73rem; color: #a04030;
    margin-bottom: .75rem; line-height: 1.5;
  }
  .auth-ok {
    background: #f2f8f0; border: 1px solid #b8d4b0; border-radius: 9px;
    padding: .6rem .85rem; font-size: .73rem; color: #2a6020;
    margin-bottom: .75rem; line-height: 1.5;
  }

  .auth-switch {
    text-align: center; margin-top: 1.3rem;
    font-size: .73rem; color: #7a7971;
  }
  .auth-switch button {
    background: none; border: none; color: #4e7a3e; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: .73rem; font-weight: 500;
    text-decoration: underline; padding: 0;
  }
  .auth-divider {
    display: flex; align-items: center; gap: .75rem;
    margin: 1rem 0; font-size: .65rem; color: #b8cdb0;
  }
  .auth-divider::before, .auth-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(125,155,110,.18);
  }
  .auth-note {
    font-size: .63rem; color: #b8cdb0; text-align: center;
    margin-top: 1rem; line-height: 1.6;
  }
`

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signin') // signin | signup | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const { signIn, signUp, resetPassword } = useAuth()

  const reset = () => { setError(''); setOk('') }

  const handleSubmit = async () => {
    reset()
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) { setError(friendlyError(error.message)); setLoading(false); return }
      onSuccess?.()
      onClose()

    } else if (mode === 'signup') {
      if (password !== confirm) { setError('Passwords do not match.'); setLoading(false); return }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
      const { error } = await signUp(email, password)
      if (error) { setError(friendlyError(error.message)); setLoading(false); return }
      setOk('Account created! Check your email to confirm, then sign in.')
      setMode('signin')

    } else if (mode === 'reset') {
      const { error } = await resetPassword(email)
      if (error) { setError(friendlyError(error.message)); setLoading(false); return }
      setOk('Reset email sent — check your inbox.')
      setMode('signin')
    }

    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="auth-modal">
          <button className="auth-x" onClick={onClose}>✕</button>

          <span className="auth-leaf">🌿</span>

          {mode === 'signin' && <>
            <h2 className="auth-title">Welcome <em>back.</em></h2>
            <p className="auth-sub">Sign in to save your budget across all your devices.</p>
          </>}
          {mode === 'signup' && <>
            <h2 className="auth-title">Create your <em>account.</em></h2>
            <p className="auth-sub">Free forever. Your budget saves to the cloud automatically.</p>
          </>}
          {mode === 'reset' && <>
            <h2 className="auth-title">Reset your <em>password.</em></h2>
            <p className="auth-sub">We'll send a reset link to your email address.</p>
          </>}

          {error && <div className="auth-err">⚠ {error}</div>}
          {ok && <div className="auth-ok">✓ {ok}</div>}

          <div className="auth-field">
            <label>Email address</label>
            <input
              type="email" value={email} placeholder="you@example.com"
              onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
              autoFocus autoComplete="email"
            />
          </div>

          {mode !== 'reset' && (
            <div className="auth-field">
              <label>Password</label>
              <input
                type="password" value={password} placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
                onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="auth-field">
              <label>Confirm password</label>
              <input
                type="password" value={confirm} placeholder="••••••••"
                onChange={e => setConfirm(e.target.value)} onKeyDown={handleKey}
                autoComplete="new-password"
              />
            </div>
          )}

          <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'One moment…' : mode === 'signin' ? 'Sign in →' : mode === 'signup' ? 'Create account →' : 'Send reset link →'}
          </button>

          {mode === 'signin' && (
            <div className="auth-switch">
              <button onClick={() => { setMode('reset'); reset() }}>Forgot password?</button>
            </div>
          )}

          <div className="auth-divider">or</div>

          {mode === 'signin' && (
            <div className="auth-switch">
              No account yet? <button onClick={() => { setMode('signup'); reset() }}>Create one free →</button>
            </div>
          )}
          {mode === 'signup' && (
            <div className="auth-switch">
              Already have an account? <button onClick={() => { setMode('signin'); reset() }}>Sign in →</button>
            </div>
          )}
          {mode === 'reset' && (
            <div className="auth-switch">
              <button onClick={() => { setMode('signin'); reset() }}>← Back to sign in</button>
            </div>
          )}

          <p className="auth-note">Your budget data is encrypted and only accessible by you.<br />No card required for the free plan.</p>
        </div>
      </div>
    </>
  )
}

function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  if (msg.includes('Invalid login')) return 'Email or password is incorrect.'
  if (msg.includes('Email not confirmed')) return 'Please confirm your email first — check your inbox.'
  if (msg.includes('already registered')) return 'An account with this email already exists. Try signing in.'
  if (msg.includes('rate limit')) return 'Too many attempts — please wait a minute and try again.'
  if (msg.includes('weak_password')) return 'Password must be at least 8 characters.'
  return msg
}

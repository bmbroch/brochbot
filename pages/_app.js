import { useState, useEffect } from 'react'
import '../styles/globals.css'

const PASSWORD = '1224'
const AUTH_KEY = 'brochbot_auth'
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function PasswordGate({ children }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checking, setChecking] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored) {
      const timestamp = parseInt(stored, 10)
      if (Date.now() - timestamp < WEEK_MS) {
        setAuthenticated(true)
      }
    }
    setChecking(false)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    if (password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, Date.now().toString())
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
      setPassword('')
    }
  }

  if (checking) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>🤖 Brochbot HQ</div>
          <p style={styles.subtitle}>Enter password to continue</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                ...styles.input,
                borderColor: error ? '#ef4444' : '#e5e7eb'
              }}
              autoFocus
            />
            {error && <p style={styles.error}>Incorrect password</p>}
            <button type="submit" style={styles.button}>
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return children
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#ffffff',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  loading: {
    color: '#6b7280',
    fontSize: '14px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #f5f5f5',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    outline: 'none',
    marginBottom: '12px',
    boxSizing: 'border-box',
    textAlign: 'center',
    letterSpacing: '4px',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '12px',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    background: '#000000',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}

export default function App({ Component, pageProps }) {
  return (
    <PasswordGate>
      <Component {...pageProps} />
    </PasswordGate>
  )
}

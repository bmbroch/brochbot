import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const PRODUCTS = [
  { id: 'all', label: 'All Products', icon: '📧' },
  { id: 'salesecho', label: 'SalesEcho', icon: '📢', color: '#3b82f6' },
  { id: 'interviewsidekick', label: 'Interview Sidekick', icon: '🎤', color: '#22c55e' },
  { id: 'coverlettercopilot', label: 'Cover Letter Copilot', icon: '✉️', color: '#a855f7' },
]

const STATUSES = [
  { id: 'all', label: 'All', color: '#6b7280' },
  { id: 'pending', label: 'Pending', color: '#eab308' },
  { id: 'drafted', label: 'Drafted', color: '#3b82f6' },
  { id: 'sent', label: 'Sent', color: '#22c55e' },
  { id: 'ignored', label: 'Ignored', color: '#6b7280' },
]

async function api(endpoint, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  })
  return res.json()
}

function EmailCard({ email, expanded, onToggle }) {
  const product = PRODUCTS.find(p => p.id === email.product) || { icon: '❓', label: 'Unknown', color: '#6b7280' }
  const status = STATUSES.find(s => s.id === email.status) || STATUSES[0]
  
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div 
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        border: expanded ? '2px solid #3b82f6' : '2px solid transparent',
        transition: 'all 0.2s'
      }}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span 
              style={{ 
                background: product.color || '#6b7280', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {product.icon} {product.label}
            </span>
            <span 
              style={{ 
                background: status.color + '22', 
                color: status.color, 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {status.label}
            </span>
          </div>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{email.subject || '(no subject)'}</div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>
            From: {email.from_email}
          </div>
        </div>
        <div style={{ color: '#9ca3af', fontSize: '12px', whiteSpace: 'nowrap' }}>
          {timeAgo(email.created_at)}
        </div>
      </div>
      
      {expanded && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>📩 Original Email:</div>
            <div 
              style={{ 
                background: '#f9fafb', 
                padding: '12px', 
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                maxHeight: '200px',
                overflow: 'auto'
              }}
            >
              {email.body_text || email.body_html || '(no body)'}
            </div>
          </div>
          
          {email.draft_response && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>📝 Draft Response:</div>
              <div 
                style={{ 
                  background: '#eff6ff', 
                  padding: '12px', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                {email.draft_response}
              </div>
            </div>
          )}
          
          {email.sent_response && (
            <div>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>✅ Sent Response:</div>
              <div 
                style={{ 
                  background: '#f0fdf4', 
                  padding: '12px', 
                  borderRadius: '8px',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}
              >
                {email.sent_response}
              </div>
              {email.sent_at && (
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
                  Sent: {new Date(email.sent_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
          
          <div style={{ marginTop: '12px', color: '#9ca3af', fontSize: '12px' }}>
            ID: {email.id}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Support() {
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(true)
  const [productFilter, setProductFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState(null)

  const fetchEmails = async () => {
    let query = 'support_emails?order=created_at.desc'
    const filters = []
    if (productFilter !== 'all') filters.push(`product=eq.${productFilter}`)
    if (statusFilter !== 'all') filters.push(`status=eq.${statusFilter}`)
    if (filters.length > 0) query += '&' + filters.join('&')
    
    const data = await api(query)
    setEmails(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [productFilter, statusFilter])

  const counts = {
    total: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    sent: emails.filter(e => e.status === 'sent').length,
  }

  return (
    <>
      <Head>
        <title>Customer Support | Brochbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '24px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>📧 Customer Support</h1>
              <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px' }}>
                ← Back to Dashboard
              </Link>
            </div>
            <p style={{ color: '#9ca3af', margin: 0 }}>
              {counts.pending > 0 ? `${counts.pending} pending` : 'No pending emails'} • {counts.sent} sent total
            </p>
          </div>
          
          {/* Filters */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Product Filter */}
            <div style={{ display: 'flex', gap: '4px', background: '#ffffff11', borderRadius: '8px', padding: '4px' }}>
              {PRODUCTS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setProductFilter(p.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: productFilter === p.id ? 'white' : 'transparent',
                    color: productFilter === p.id ? '#1a1a2e' : '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: productFilter === p.id ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            
            {/* Status Filter */}
            <div style={{ display: 'flex', gap: '4px', background: '#ffffff11', borderRadius: '8px', padding: '4px' }}>
              {STATUSES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: statusFilter === s.id ? 'white' : 'transparent',
                    color: statusFilter === s.id ? '#1a1a2e' : '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: statusFilter === s.id ? '600' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email List */}
          {loading ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '40px' }}>
              Loading...
            </div>
          ) : emails.length === 0 ? (
            <div style={{ 
              color: '#9ca3af', 
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#ffffff08',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
              <div style={{ fontSize: '18px', marginBottom: '8px' }}>No support emails yet</div>
              <div style={{ fontSize: '14px' }}>
                Forward support emails to: <code style={{ background: '#ffffff11', padding: '2px 6px', borderRadius: '4px' }}>anything@nelaacriso.resend.app</code>
              </div>
            </div>
          ) : (
            emails.map(email => (
              <EmailCard
                key={email.id}
                email={email}
                expanded={expandedId === email.id}
                onToggle={() => setExpandedId(expandedId === email.id ? null : email.id)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const PRODUCTS = [
  { id: 'all', label: 'All', icon: '📧' },
  { id: 'salesecho', label: 'SalesEcho', icon: '📢' },
  { id: 'interviewsidekick', label: 'Interview Sidekick', icon: '🎤' },
  { id: 'coverlettercopilot', label: 'Cover Letter Copilot', icon: '✉️' },
]

const STATUSES = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: '🟡 Pending' },
  { id: 'sent', label: '✅ Sent' },
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

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

function EmailCard({ email, expanded, onToggle, onDelete }) {
  const product = PRODUCTS.find(p => p.id === email.product) || { icon: '❓', label: 'Unknown' }
  const shortId = email.id?.slice(0, 8) || 'unknown'
  const [copied, setCopied] = useState(false)
  
  const copyId = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const handleDelete = (e) => {
    e.stopPropagation()
    if (confirm('Delete this support email?')) {
      onDelete(email.id)
    }
  }
  
  return (
    <div className={`email-item ${expanded ? 'expanded' : ''}`} onClick={onToggle}>
      <div className="email-header">
        <div className="email-badges">
          <button className="uid-badge" onClick={copyId} title="Copy full ID">
            {copied ? '✓' : '📋'} {shortId}
          </button>
          <span className={`product-badge product-${email.product || 'unknown'}`}>
            {product.icon} {product.label}
          </span>
          <span className={`status-badge status-${email.status}`}>
            {email.status === 'pending' ? '🟡' : email.status === 'sent' ? '✅' : '⏳'} {email.status}
          </span>
        </div>
        <div className="email-actions">
          <button className="delete-btn" onClick={handleDelete} title="Delete email">🗑️</button>
          <span className="email-time">{timeAgo(email.created_at)}</span>
        </div>
      </div>
      
      <div className="email-subject">{email.subject || '(no subject)'}</div>
      <div className="email-from">From: {email.from_email}</div>
      
      {expanded && (
        <div className="email-details">
          {email.ben_notes && (
            <div className="detail-section notes-section">
              <div className="detail-label">📝 Ben's Notes</div>
              <div className="detail-content">{email.ben_notes}</div>
            </div>
          )}
          
          <div className="detail-section">
            <div className="detail-label">📩 Original Email</div>
            <div className="detail-content email-body">{email.body_text || email.body_html || '(no body)'}</div>
          </div>
          
          {email.draft_response && (
            <div className="detail-section">
              <div className="detail-label">💬 Draft Response</div>
              <div className="detail-content draft-body">{email.draft_response}</div>
            </div>
          )}
          
          {email.sent_response && (
            <div className="detail-section">
              <div className="detail-label">✅ Sent Response</div>
              <div className="detail-content sent-body">{email.sent_response}</div>
              {email.sent_at && <div className="sent-time">Sent: {new Date(email.sent_at).toLocaleString()}</div>}
            </div>
          )}
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

  const deleteEmail = async (id) => {
    await fetch(`${SUPABASE_URL}/rest/v1/support_emails?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    setEmails(emails.filter(e => e.id !== id))
  }

  useEffect(() => {
    fetchEmails()
    const interval = setInterval(fetchEmails, 10000)
    return () => clearInterval(interval)
  }, [productFilter, statusFilter])

  const stats = {
    total: emails.length,
    pending: emails.filter(e => e.status === 'pending').length,
    sent: emails.filter(e => e.status === 'sent').length,
  }

  return (
    <>
      <Head>
        <title>Customer Support | BrochBot HQ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">🤖 BrochBot HQ</div>
          <nav className="nav">
            <Link href="/" className="nav-link">Dashboard</Link>
            <Link href="/table" className="nav-link">Table</Link>
            <Link href="/agents" className="nav-link">Agents</Link>
            <Link href="/support" className="nav-link active">Support</Link>
          </nav>
        </header>

        {/* Page Title */}
        <div className="page-header">
          <h1 className="page-title">📧 Customer Support</h1>
          <p className="page-subtitle">
            {stats.pending > 0 ? `${stats.pending} pending` : 'No pending'} • {stats.sent} sent
          </p>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">🟡 Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.sent}</div>
            <div className="stat-label">✅ Sent</div>
          </div>
        </div>

        {/* Filters */}
        <div className="view-toggle">
          {PRODUCTS.map(p => (
            <button
              key={p.id}
              className={`view-btn ${productFilter === p.id ? 'active' : ''}`}
              onClick={() => setProductFilter(p.id)}
            >
              {p.icon} {p.label}
            </button>
          ))}
          <div className="filter-divider" />
          {STATUSES.map(s => (
            <button
              key={s.id}
              className={`view-btn ${statusFilter === s.id ? 'active' : ''}`}
              onClick={() => setStatusFilter(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Main Layout */}
        <div className="main-layout">
          {/* Email List */}
          <div className="email-section">
            <div className="section-header">
              <span className="section-title">Support Emails</span>
              <span className="meta-tag">{emails.length} emails</span>
            </div>
            <div className="email-list">
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : emails.length === 0 ? (
                <div className="empty-state">
                  <h3>📭 No support emails</h3>
                  <p>Forward emails to: <code>anything@nelaacriso.resend.app</code></p>
                </div>
              ) : (
                emails.map(email => (
                  <EmailCard
                    key={email.id}
                    email={email}
                    expanded={expandedId === email.id}
                    onToggle={() => setExpandedId(expandedId === email.id ? null : email.id)}
                    onDelete={deleteEmail}
                  />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <div className="sidebar-title">📬 Forward Emails To</div>
              <code className="forward-address">anything@nelaacriso.resend.app</code>
              <p className="sidebar-hint">Add notes above the forwarded content to give BrochBot instructions.</p>
            </div>
            
            <div className="sidebar-card">
              <div className="sidebar-title">📋 Response Playbook</div>
              <div className="playbook-list">
                <div className="playbook-item">
                  <strong>💰 Refund Request</strong>
                  <p><b>Deny if usage found.</b> Check records first. "Falls outside our standard refund policy."</p>
                </div>
                <div className="playbook-item">
                  <strong>🔧 Technical Issue Refund</strong>
                  <p><b>Exception OK.</b> If product was broken, offer full refund as one-time courtesy.</p>
                </div>
                <div className="playbook-item">
                  <strong>🚪 Cancellation</strong>
                  <p><b>Always ask why.</b> "What was the main reason you decided not to continue?"</p>
                </div>
                <div className="playbook-item">
                  <strong>🗑️ Account Deletion</strong>
                  <p><b>Direct to /account.</b> Deleting data = deletes account. Self-service first.</p>
                </div>
                <div className="playbook-item">
                  <strong>🐛 Bug Report</strong>
                  <p><b>Get specifics.</b> Ask for screenshot + device/browser to reproduce.</p>
                </div>
                <div className="playbook-item">
                  <strong>💡 Feature Request</strong>
                  <p><b>Log it, no promises.</b> "Passed to product team. Can't promise timeline."</p>
                </div>
                <div className="playbook-item">
                  <strong>⭐ Positive Feedback</strong>
                  <p><b>Ask for review.</b> "Would you share on [Trustpilot/G2]? Helps others!"</p>
                </div>
                <div className="playbook-item">
                  <strong>😤 Escalated Appeal</strong>
                  <p><b>Partial refund OK.</b> If multiple appeals, small courtesy refund closes case.</p>
                </div>
              </div>
              <p className="sidebar-hint">Sign as Ben. Be direct but warm. We're a small business, not a corporation.</p>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-title">🎯 Products & Links</div>
              <div className="product-list">
                <div className="product-item">
                  <span>📢</span> SalesEcho
                  <div className="product-links">
                    <a href="https://sales-echo.com/account" target="_blank">/account</a>
                    <a href="https://billing.stripe.com/p/login/8x2fZi2NNglz774aop3F600" target="_blank">Stripe</a>
                  </div>
                </div>
                <div className="product-item">
                  <span>🎤</span> Interview Sidekick
                  <div className="product-links">
                    <a href="https://interviewsidekick.com/account" target="_blank">/account</a>
                    <a href="https://pay.interviewsidekick.com/p/login/5kA7t53yQ0Tl6525kk" target="_blank">Stripe</a>
                  </div>
                </div>
                <div className="product-item">
                  <span>✉️</span> Cover Letter Copilot
                  <div className="product-links">
                    <a href="https://coverlettercopilot.ai/account" target="_blank">/account</a>
                    <a href="https://billing.stripe.com/p/login/14k4hyc3Mc17gjC6oo" target="_blank">Stripe</a>
                  </div>
                </div>
              </div>
              <p className="sidebar-hint">Direct users to /account first, Stripe if they can't log in.</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg: #ffffff;
          --card-bg: #f9fafb;
          --border: #e5e7eb;
          --text: #111827;
          --text-muted: #6b7280;
          --accent: #2563eb;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.5;
        }
        
        .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .logo { font-size: 24px; font-weight: 700; }
        
        .nav { display: flex; gap: 24px; }
        
        .nav-link {
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .nav-link:hover, .nav-link.active { color: var(--text); font-weight: 500; }
        
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .page-subtitle { color: var(--text-muted); font-size: 14px; }
        
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          transition: all 300ms;
        }
        
        .stat-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        
        .stat-value { font-size: 28px; font-weight: 700; }
        .stat-label { font-size: 12px; color: var(--text-muted); }
        
        .view-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }
        
        .filter-divider {
          width: 1px;
          height: 24px;
          background: #E5E7EB;
          margin: 0 8px;
        }
        
        .view-btn {
          padding: 10px 18px;
          border-radius: 12px;
          border: 2px solid #F5F5F5;
          background: transparent;
          color: var(--text-muted);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 300ms;
        }
        
        .view-btn:hover { border-color: #D1D5DB; color: var(--text); }
        .view-btn.active { background: #000000; border-color: #000000; color: white; }
        
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
        }
        
        @media (max-width: 900px) {
          .main-layout { grid-template-columns: 1fr; }
        }
        
        .email-section {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .section-header {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .section-title { font-weight: 600; }
        .meta-tag { font-size: 12px; color: var(--text-muted); }
        
        .email-list { max-height: 700px; overflow-y: auto; }
        
        .email-item {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .email-item:hover { background: #f9fafb; }
        .email-item.expanded { background: #f3f4f6; }
        .email-item:last-child { border-bottom: none; }
        
        .email-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .email-badges { display: flex; gap: 8px; }
        
        .product-badge, .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .uid-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          font-family: 'Monaco', 'Consolas', monospace;
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .uid-badge:hover {
          background: #e5e7eb;
          border-color: #d1d5db;
        }
        
        .product-salesecho { background: #dbeafe; color: #1d4ed8; }
        .product-interviewsidekick { background: #dcfce7; color: #15803d; }
        .product-coverlettercopilot { background: #f3e8ff; color: #7c3aed; }
        .product-unknown { background: #f3f4f6; color: #6b7280; }
        
        .status-pending { background: #fef9c3; color: #a16207; }
        .status-sent { background: #dcfce7; color: #15803d; }
        .status-drafted { background: #dbeafe; color: #1d4ed8; }
        
        .email-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .delete-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 16px;
          opacity: 0.4;
          transition: all 0.2s;
          padding: 4px;
        }
        
        .delete-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }
        
        .email-time { font-size: 12px; color: var(--text-muted); }
        .email-subject { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
        .email-from { font-size: 13px; color: var(--text-muted); }
        
        .email-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }
        
        .detail-section { margin-bottom: 16px; }
        .detail-section:last-of-type { margin-bottom: 0; }
        
        .detail-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        
        .detail-content {
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          padding: 12px;
          border-radius: 8px;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .email-body { background: #f9fafb; }
        .draft-body { background: #eff6ff; }
        .sent-body { background: #f0fdf4; }
        .notes-section .detail-content { background: #fef3c7; border: 1px solid #fcd34d; }
        
        .sent-time { font-size: 12px; color: var(--text-muted); margin-top: 8px; }
        
        .sidebar { display: flex; flex-direction: column; gap: 16px; }
        
        .sidebar-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 20px;
          transition: all 300ms;
        }
        
        .sidebar-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .forward-address {
          display: block;
          background: #f3f4f6;
          padding: 12px;
          border-radius: 8px;
          font-size: 12px;
          word-break: break-all;
          margin-bottom: 8px;
        }
        
        .sidebar-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 8px;
        }
        
        .playbook-list { display: flex; flex-direction: column; gap: 12px; }
        
        .playbook-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 13px;
        }
        
        .playbook-item strong { display: block; margin-bottom: 4px; }
        .playbook-item p { color: var(--text-muted); margin: 0; font-size: 12px; }
        
        .product-list { display: flex; flex-direction: column; gap: 8px; }
        
        .product-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
        }
        
        .product-item:last-child { border-bottom: none; }
        
        .product-links {
          margin-left: auto;
          display: flex;
          gap: 8px;
        }
        
        .product-links a {
          font-size: 11px;
          color: #3b82f6;
          text-decoration: none;
          padding: 2px 8px;
          background: #eff6ff;
          border-radius: 6px;
          transition: all 0.2s;
        }
        
        .product-links a:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        .product-domain {
          margin-left: auto;
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--text-muted);
        }
        
        .empty-state h3 { margin-bottom: 8px; color: var(--text); }
        .empty-state code {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 13px;
        }
        
        @media (max-width: 768px) {
          .container { padding: 16px; }
          
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .nav {
            width: 100%;
            gap: 16px;
            flex-wrap: wrap;
          }
          
          .page-title { font-size: 24px; }
          
          .stats-bar { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .stat-card { padding: 12px; }
          .stat-value { font-size: 20px; }
          .stat-label { font-size: 11px; }
          
          .view-toggle {
            gap: 6px;
          }
          
          .view-btn {
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .filter-divider { display: none; }
          
          .email-item { padding: 12px 16px; }
          
          .email-header { flex-wrap: wrap; gap: 6px; }
          
          .email-badges { flex-wrap: wrap; gap: 4px; }
          
          .email-actions {
            width: 100%;
            justify-content: space-between;
            margin-top: 8px;
          }
          
          .product-badge, .status-badge, .uid-badge {
            font-size: 10px;
            padding: 3px 6px;
          }
          
          .email-subject { font-size: 14px; }
          .email-from { font-size: 12px; }
          
          .detail-content {
            font-size: 13px;
            max-height: 150px;
          }
          
          .sidebar-card { padding: 16px; }
          .playbook-list { gap: 8px; }
          .playbook-item { padding: 10px; font-size: 12px; }
          .playbook-item p { font-size: 11px; }
        }
        
        @media (max-width: 480px) {
          .stats-bar { grid-template-columns: repeat(3, 1fr); }
          .view-toggle { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 8px; }
          .view-btn { flex-shrink: 0; }
        }
      `}</style>
    </>
  )
}

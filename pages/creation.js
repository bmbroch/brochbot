import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

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

function IdeaCard({ idea }) {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className={`idea-card ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(!expanded)}>
      <div className="idea-header">
        <span className={`platform-badge platform-${idea.source_platform}`}>
          {idea.source_platform === 'x' ? '𝕏' : '💼'} {idea.source_platform}
        </span>
        <span className="cluster-tag">{idea.cluster_tag || 'unclustered'}</span>
        <span className={`status-badge status-${idea.status}`}>{idea.status}</span>
        <span className="idea-time">{timeAgo(idea.created_at)}</span>
      </div>
      
      <div className="idea-source">
        <div className="source-author">{idea.source_author}</div>
        <div className="source-text">{idea.source_text}</div>
        {idea.source_url && (
          <a href={idea.source_url} target="_blank" rel="noopener noreferrer" className="source-link" onClick={e => e.stopPropagation()}>
            View original →
          </a>
        )}
      </div>
      
      {expanded && (
        <div className="idea-derivatives">
          {idea.notes && (
            <div className="derivative-section">
              <div className="derivative-label">📝 Notes</div>
              <div className="derivative-content">{idea.notes}</div>
            </div>
          )}
          
          {idea.derivative_x && (
            <div className="derivative-section">
              <div className="derivative-label">𝕏 Draft</div>
              <div className="derivative-content draft">{idea.derivative_x}</div>
            </div>
          )}
          
          {idea.derivative_linkedin && (
            <div className="derivative-section">
              <div className="derivative-label">💼 LinkedIn Draft</div>
              <div className="derivative-content draft">{idea.derivative_linkedin}</div>
            </div>
          )}
          
          {!idea.derivative_x && !idea.derivative_linkedin && (
            <div className="derivative-section">
              <div className="derivative-label">⏳ Awaiting Generation</div>
              <div className="derivative-content hint">Tell BrochBot to generate derivatives for this idea</div>
            </div>
          )}
          
          {idea.posted_url && (
            <div className="derivative-section">
              <div className="derivative-label">🚀 Posted</div>
              <div className="posted-info">
                <a href={idea.posted_url} target="_blank" rel="noopener noreferrer" className="posted-link">
                  View on {idea.posted_url.includes('linkedin') ? 'LinkedIn' : '𝕏'} →
                </a>
                {(idea.views > 0 || idea.likes > 0) && (
                  <div className="posted-metrics">
                    {idea.views > 0 && <span>👁 {idea.views.toLocaleString()}</span>}
                    {idea.likes > 0 && <span>❤️ {idea.likes}</span>}
                    {idea.reposts > 0 && <span>🔄 {idea.reposts}</span>}
                    {idea.replies > 0 && <span>💬 {idea.replies}</span>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Creation() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [clusterFilter, setClusterFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchIdeas = async () => {
    let query = 'content_ideas?order=created_at.desc'
    const filters = []
    if (clusterFilter !== 'all') filters.push(`cluster_tag=eq.${clusterFilter}`)
    if (statusFilter !== 'all') filters.push(`status=eq.${statusFilter}`)
    if (filters.length > 0) query += '&' + filters.join('&')
    
    const data = await api(query)
    setIdeas(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchIdeas()
  }, [clusterFilter, statusFilter])

  // Get unique clusters
  const clusters = ['all', ...new Set(ideas.map(i => i.cluster_tag).filter(Boolean))]
  const statuses = ['all', 'draft', 'ready', 'posted']

  const stats = {
    total: ideas.length,
    draft: ideas.filter(i => i.status === 'draft').length,
    ready: ideas.filter(i => i.status === 'ready').length,
    posted: ideas.filter(i => i.status === 'posted').length,
  }

  return (
    <>
      <Head>
        <title>Creation | BrochBot HQ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <Link href="/" className="logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">BrochBot</span>
          </Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Dashboard</Link>
            <Link href="/agents" className="nav-link">Agents</Link>
            <Link href="/creation" className="nav-link active">Creation</Link>
            <Link href="/support" className="nav-link">Support</Link>
          </nav>
        </header>

        {/* Page Title */}
        <div className="page-header">
          <h1 className="page-title">✨ Content Creation</h1>
          <p className="page-subtitle">
            Inspiration → Clusters → Derivative posts for LinkedIn & X
          </p>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">📚 Total Ideas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">📝 Drafts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.ready}</div>
            <div className="stat-label">✅ Ready</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.posted}</div>
            <div className="stat-label">🚀 Posted</div>
          </div>
        </div>

        {/* Filters */}
        <div className="view-toggle">
          <span className="filter-label">Cluster:</span>
          {clusters.map(c => (
            <button
              key={c}
              className={`view-btn ${clusterFilter === c ? 'active' : ''}`}
              onClick={() => setClusterFilter(c)}
            >
              {c === 'all' ? 'All' : `#${c}`}
            </button>
          ))}
          <div className="filter-divider" />
          <span className="filter-label">Status:</span>
          {statuses.map(s => (
            <button
              key={s}
              className={`view-btn ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Ideas List */}
        <div className="ideas-section">
          <div className="section-header">
            <span className="section-title">Content Ideas</span>
            <span className="meta-tag">{ideas.length} ideas</span>
          </div>
          <div className="ideas-list">
            {loading ? (
              <div className="empty-state">Loading...</div>
            ) : ideas.length === 0 ? (
              <div className="empty-state">
                <h3>📭 No content ideas yet</h3>
                <p>Send posts to BrochBot via Telegram to start collecting inspiration</p>
              </div>
            ) : (
              ideas.map(idea => (
                <IdeaCard key={idea.id} idea={idea} />
              ))
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="how-it-works">
          <h3>🔄 How It Works</h3>
          <div className="steps">
            <div className="step">
              <span className="step-num">1</span>
              <span>Send inspiring posts to BrochBot</span>
            </div>
            <div className="step">
              <span className="step-num">2</span>
              <span>Posts get clustered by theme</span>
            </div>
            <div className="step">
              <span className="step-num">3</span>
              <span>BrochBot generates derivative posts</span>
            </div>
            <div className="step">
              <span className="step-num">4</span>
              <span>Review, edit, post to LinkedIn/X</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root {
          --bg: #ffffff;
          --text: #111827;
          --text-muted: #6b7280;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.5;
        }
        
        .container { max-width: 900px; margin: 0 auto; padding: 24px; }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text);
        }
        
        .logo-icon { font-size: 24px; }
        .logo-text { font-size: 18px; font-weight: 700; }
        
        .nav { 
          display: flex; 
          gap: 4px;
          background: #f5f5f5;
          padding: 4px;
          border-radius: 12px;
        }
        
        .nav-link {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .nav-link:hover { color: var(--text); background: white; }
        .nav-link.active { color: var(--text); background: white; font-weight: 500; }
        
        .page-header { margin-bottom: 24px; }
        .page-title { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
        .page-subtitle { color: var(--text-muted); font-size: 14px; }
        
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
        
        .filter-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-muted);
          margin-right: 4px;
        }
        
        .filter-divider {
          width: 1px;
          height: 24px;
          background: #E5E7EB;
          margin: 0 12px;
        }
        
        .view-btn {
          padding: 8px 16px;
          border-radius: 12px;
          border: 2px solid #F5F5F5;
          background: transparent;
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 300ms;
        }
        
        .view-btn:hover { border-color: #D1D5DB; color: var(--text); }
        .view-btn.active { background: #000; border-color: #000; color: white; }
        
        .ideas-section {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
        }
        
        .section-header {
          padding: 16px 20px;
          border-bottom: 1px solid #F5F5F5;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .section-title { font-weight: 600; }
        .meta-tag { font-size: 12px; color: var(--text-muted); }
        
        .ideas-list { max-height: 600px; overflow-y: auto; }
        
        .idea-card {
          padding: 20px;
          border-bottom: 1px solid #F5F5F5;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .idea-card:hover { background: #f9fafb; }
        .idea-card.expanded { background: #f3f4f6; }
        .idea-card:last-child { border-bottom: none; }
        
        .idea-header {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .platform-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .platform-x { background: #000; color: white; }
        .platform-linkedin { background: #0077b5; color: white; }
        
        .cluster-tag {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        .status-badge {
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-draft { background: #fef9c3; color: #a16207; }
        .status-ready { background: #dcfce7; color: #15803d; }
        .status-posted { background: #f3f4f6; color: #6b7280; }
        
        .idea-time {
          margin-left: auto;
          font-size: 12px;
          color: var(--text-muted);
        }
        
        .idea-source {
          padding: 16px;
          background: #f9fafb;
          border-radius: 12px;
        }
        
        .source-author {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .source-text {
          font-size: 14px;
          line-height: 1.6;
          color: #374151;
        }
        
        .source-link {
          display: inline-block;
          margin-top: 12px;
          font-size: 13px;
          color: #3b82f6;
          text-decoration: none;
        }
        
        .source-link:hover { text-decoration: underline; }
        
        .idea-derivatives {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        
        .derivative-section { margin-bottom: 16px; }
        .derivative-section:last-child { margin-bottom: 0; }
        
        .derivative-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
        }
        
        .derivative-content {
          font-size: 14px;
          line-height: 1.6;
          padding: 12px;
          border-radius: 8px;
          background: #f9fafb;
        }
        
        .derivative-content.draft {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
        }
        
        .derivative-content.hint {
          color: var(--text-muted);
          font-style: italic;
        }
        
        .posted-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .posted-link {
          display: inline-block;
          padding: 12px 16px;
          background: #dcfce7;
          border-radius: 8px;
          color: #15803d;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
        }
        
        .posted-link:hover {
          background: #bbf7d0;
        }
        
        .posted-metrics {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: var(--text-muted);
        }
        
        .posted-metrics span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .how-it-works {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
        }
        
        .how-it-works h3 {
          font-size: 16px;
          margin-bottom: 16px;
        }
        
        .steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 8px;
        }
        
        .step-num {
          width: 32px;
          height: 32px;
          background: #000;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        
        .step span:last-child {
          font-size: 13px;
          color: var(--text-muted);
        }
        
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: var(--text-muted);
        }
        
        .empty-state h3 { margin-bottom: 8px; color: var(--text); }
        
        @media (max-width: 768px) {
          .container { padding: 16px; }
          
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .nav { 
            width: 100%;
            justify-content: flex-start;
            gap: 16px;
            flex-wrap: wrap;
          }
          
          .page-title { font-size: 24px; }
          
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          
          .stat-card { padding: 16px; }
          .stat-value { font-size: 24px; }
          
          .view-toggle {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          
          .filter-divider { display: none; }
          
          .view-toggle > .filter-label {
            width: 100%;
            margin-bottom: -4px;
          }
          
          .view-toggle > .filter-label ~ .view-btn {
            margin-right: 4px;
            margin-bottom: 4px;
          }
          
          .idea-header {
            flex-wrap: wrap;
            gap: 6px;
          }
          
          .idea-time {
            width: 100%;
            margin-left: 0;
            margin-top: 8px;
          }
          
          .source-text {
            font-size: 14px;
            line-height: 1.5;
          }
          
          .steps { grid-template-columns: repeat(2, 1fr); }
          
          .how-it-works { padding: 16px; }
        }
        
        @media (max-width: 480px) {
          .stats-bar { grid-template-columns: 1fr 1fr; gap: 8px; }
          .stat-card { padding: 12px; }
          .stat-value { font-size: 20px; }
          .stat-label { font-size: 11px; }
          
          .steps { grid-template-columns: 1fr 1fr; gap: 12px; }
          
          .idea-card { padding: 16px; }
          .idea-source { padding: 12px; }
          
          .platform-badge, .cluster-tag, .status-badge {
            font-size: 11px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </>
  )
}

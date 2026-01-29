import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

async function api(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
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

function IdeaCard({ idea, isExpanded, onToggle }) {
  const isPosted = idea.status === 'posted'
  const isReady = idea.status === 'ready'
  
  return (
    <div className={`idea-card ${isExpanded ? 'expanded' : ''} ${isPosted ? 'posted' : ''}`}>
      <div className="idea-main" onClick={onToggle}>
        <div className="idea-status-indicator">
          {isPosted ? '🚀' : isReady ? '✅' : '📝'}
        </div>
        
        <div className="idea-content">
          <div className="idea-meta">
            <span className="cluster-pill">#{idea.cluster_tag || 'unclustered'}</span>
            <span className="platform-pill">{idea.source_platform === 'x' ? '𝕏' : idea.source_platform === 'linkedin' ? 'in' : '💡'}</span>
            <span className="time-ago">{timeAgo(idea.created_at)}</span>
          </div>
          
          <p className="idea-preview">
            {idea.source_text?.slice(0, 120)}{idea.source_text?.length > 120 ? '...' : ''}
          </p>
          
          {idea.source_author && idea.source_author !== 'Ben (original thought)' && (
            <span className="idea-author">via {idea.source_author}</span>
          )}
        </div>
        
        <div className="idea-arrow">{isExpanded ? '▼' : '▶'}</div>
      </div>
      
      {isExpanded && (
        <div className="idea-expanded">
          {/* Source */}
          <div className="section">
            <div className="section-label">💡 Inspiration</div>
            <div className="section-content source-box">
              {idea.source_text}
              {idea.source_url && (
                <a href={idea.source_url} target="_blank" rel="noopener noreferrer" className="source-link">
                  View original →
                </a>
              )}
            </div>
          </div>
          
          {/* Drafts */}
          {(idea.derivative_x || idea.derivative_linkedin) && (
            <div className="drafts-grid">
              {idea.derivative_x && (
                <div className="draft-card">
                  <div className="draft-header">
                    <span className="draft-platform">𝕏 Twitter</span>
                    {isPosted && idea.posted_url?.includes('x.com') && (
                      <a href={idea.posted_url} target="_blank" className="view-live">View live →</a>
                    )}
                  </div>
                  <div className="draft-text">{idea.derivative_x}</div>
                </div>
              )}
              
              {idea.derivative_linkedin && (
                <div className="draft-card">
                  <div className="draft-header">
                    <span className="draft-platform">💼 LinkedIn</span>
                    {isPosted && idea.posted_url?.includes('linkedin') && (
                      <a href={idea.posted_url} target="_blank" className="view-live">View live →</a>
                    )}
                  </div>
                  <div className="draft-text">{idea.derivative_linkedin}</div>
                </div>
              )}
            </div>
          )}
          
          {/* Metrics if posted */}
          {isPosted && (idea.views > 0 || idea.likes > 0) && (
            <div className="metrics-bar">
              {idea.views > 0 && <div className="metric"><span className="metric-num">{idea.views.toLocaleString()}</span> views</div>}
              {idea.likes > 0 && <div className="metric"><span className="metric-num">{idea.likes}</span> likes</div>}
              {idea.reposts > 0 && <div className="metric"><span className="metric-num">{idea.reposts}</span> reposts</div>}
              {idea.replies > 0 && <div className="metric"><span className="metric-num">{idea.replies}</span> replies</div>}
            </div>
          )}
          
          {/* No drafts yet */}
          {!idea.derivative_x && !idea.derivative_linkedin && (
            <div className="empty-drafts">
              <span>📝</span>
              <p>No drafts yet. Tell BrochBot to generate posts from this idea.</p>
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
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api('content_ideas?order=created_at.desc').then(data => {
      setIdeas(Array.isArray(data) ? data : [])
      setLoading(false)
    })
  }, [])

  const filtered = ideas.filter(i => {
    if (filter === 'all') return true
    return i.status === filter
  })

  const stats = {
    total: ideas.length,
    draft: ideas.filter(i => i.status === 'draft').length,
    ready: ideas.filter(i => i.status === 'ready').length,
    posted: ideas.filter(i => i.status === 'posted').length,
  }

  return (
    <>
      <Head>
        <title>Content Creation | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="page">
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

        {/* Hero */}
        <div className="hero">
          <h1>✨ Content Creation</h1>
          <p>Collect inspiration, generate posts, track performance</p>
        </div>

        {/* Stats */}
        <div className="stats">
          <button className={`stat ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">All Ideas</span>
          </button>
          <button className={`stat ${filter === 'draft' ? 'active' : ''}`} onClick={() => setFilter('draft')}>
            <span className="stat-num">{stats.draft}</span>
            <span className="stat-label">📝 Drafts</span>
          </button>
          <button className={`stat ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>
            <span className="stat-num">{stats.ready}</span>
            <span className="stat-label">✅ Ready</span>
          </button>
          <button className={`stat ${filter === 'posted' ? 'active' : ''}`} onClick={() => setFilter('posted')}>
            <span className="stat-num">{stats.posted}</span>
            <span className="stat-label">🚀 Posted</span>
          </button>
        </div>

        {/* Ideas List */}
        <div className="ideas-list">
          {loading ? (
            <div className="empty">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <span>📭</span>
              <h3>No content ideas yet</h3>
              <p>Send posts to BrochBot via Telegram to start collecting inspiration</p>
            </div>
          ) : (
            filtered.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                isExpanded={expandedId === idea.id}
                onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              />
            ))
          )}
        </div>

        {/* How it works */}
        <div className="how-it-works">
          <div className="step"><span>1</span> Send inspiration to BrochBot</div>
          <div className="step"><span>2</span> Get AI-generated drafts</div>
          <div className="step"><span>3</span> Post & track performance</div>
        </div>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #fafafa;
          color: #111;
          line-height: 1.5;
        }
        
        .page {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding: 8px 0;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
        }
        
        .logo-icon { font-size: 24px; }
        .logo-text { font-size: 18px; font-weight: 700; }
        
        .nav {
          display: flex;
          gap: 4px;
          background: #f0f0f0;
          padding: 4px;
          border-radius: 12px;
        }
        
        .nav-link {
          font-size: 13px;
          color: #666;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .nav-link:hover { background: white; color: #111; }
        .nav-link.active { background: white; color: #111; font-weight: 500; }
        
        /* Hero */
        .hero {
          text-align: center;
          margin-bottom: 24px;
        }
        
        .hero h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .hero p {
          color: #666;
          font-size: 15px;
        }
        
        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        
        .stat {
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .stat:hover { border-color: #ddd; }
        .stat.active { border-color: #111; background: #111; color: white; }
        
        .stat-num { display: block; font-size: 24px; font-weight: 700; }
        .stat-label { font-size: 12px; color: #666; }
        .stat.active .stat-label { color: rgba(255,255,255,0.7); }
        
        /* Ideas List */
        .ideas-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }
        
        .idea-card {
          background: white;
          border: 2px solid #f0f0f0;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.2s;
        }
        
        .idea-card:hover { border-color: #ddd; }
        .idea-card.expanded { border-color: #111; }
        .idea-card.posted { background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%); }
        
        .idea-main {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          cursor: pointer;
        }
        
        .idea-status-indicator {
          font-size: 24px;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f5f5;
          border-radius: 14px;
          flex-shrink: 0;
        }
        
        .idea-card.posted .idea-status-indicator { background: #dcfce7; }
        
        .idea-content { flex: 1; min-width: 0; }
        
        .idea-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }
        
        .cluster-pill {
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .platform-pill {
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .time-ago {
          color: #999;
          font-size: 12px;
          margin-left: auto;
        }
        
        .idea-preview {
          font-size: 14px;
          color: #333;
          line-height: 1.5;
        }
        
        .idea-author {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
          display: block;
        }
        
        .idea-arrow {
          color: #ccc;
          font-size: 12px;
          flex-shrink: 0;
        }
        
        /* Expanded */
        .idea-expanded {
          padding: 0 20px 20px;
          border-top: 1px solid #f0f0f0;
        }
        
        .section {
          margin-top: 16px;
        }
        
        .section-label {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          margin-bottom: 8px;
        }
        
        .section-content {
          font-size: 14px;
          line-height: 1.6;
        }
        
        .source-box {
          background: #f9fafb;
          padding: 16px;
          border-radius: 12px;
          white-space: pre-wrap;
        }
        
        .source-link {
          display: inline-block;
          margin-top: 12px;
          color: #3b82f6;
          text-decoration: none;
          font-size: 13px;
        }
        
        .source-link:hover { text-decoration: underline; }
        
        /* Drafts Grid */
        .drafts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        
        .draft-card {
          background: #f9fafb;
          border-radius: 12px;
          padding: 16px;
        }
        
        .draft-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .draft-platform {
          font-size: 13px;
          font-weight: 600;
        }
        
        .view-live {
          font-size: 12px;
          color: #22c55e;
          text-decoration: none;
        }
        
        .view-live:hover { text-decoration: underline; }
        
        .draft-text {
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          color: #333;
          max-height: 200px;
          overflow-y: auto;
        }
        
        /* Metrics */
        .metrics-bar {
          display: flex;
          gap: 24px;
          margin-top: 16px;
          padding: 16px;
          background: #f0fdf4;
          border-radius: 12px;
        }
        
        .metric {
          font-size: 13px;
          color: #666;
        }
        
        .metric-num {
          font-weight: 700;
          color: #111;
          margin-right: 4px;
        }
        
        /* Empty states */
        .empty-drafts {
          text-align: center;
          padding: 32px;
          color: #999;
        }
        
        .empty-drafts span { font-size: 32px; display: block; margin-bottom: 8px; }
        .empty-drafts p { font-size: 14px; }
        
        .empty {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 20px;
          color: #666;
        }
        
        .empty span { font-size: 48px; display: block; margin-bottom: 16px; }
        .empty h3 { color: #111; margin-bottom: 8px; }
        
        /* How it works */
        .how-it-works {
          display: flex;
          justify-content: center;
          gap: 32px;
          padding: 24px;
          background: white;
          border-radius: 20px;
        }
        
        .step {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #666;
        }
        
        .step span {
          width: 28px;
          height: 28px;
          background: #111;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
        }
        
        /* Mobile */
        @media (max-width: 640px) {
          .page { padding: 16px; }
          
          .header { flex-wrap: wrap; gap: 12px; }
          
          .nav {
            width: 100%;
            justify-content: center;
          }
          
          .nav-link { padding: 6px 10px; font-size: 12px; }
          
          .hero h1 { font-size: 24px; }
          
          .stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .stat { padding: 12px; }
          .stat-num { font-size: 20px; }
          
          .idea-main { padding: 16px; gap: 12px; }
          .idea-status-indicator { width: 40px; height: 40px; font-size: 20px; }
          .idea-preview { font-size: 13px; }
          
          .drafts-grid { grid-template-columns: 1fr; }
          
          .how-it-works {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
          
          .metrics-bar { flex-wrap: wrap; gap: 16px; }
        }
      `}</style>
    </>
  )
}

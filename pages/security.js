import Head from 'next/head'
import Link from 'next/link'

const DATA_ACCESS = [
  {
    id: "supabase",
    name: "Supabase",
    type: "database",
    icon: "🗄️",
    description: "brochbot.com backend - tasks, creators, posts",
    url: "https://ibluforpuicmxzmevbmj.supabase.co",
    accessLevel: "Read/Write",
    tables: ["tasks", "creators", "posts", "payment_tiers", "payments"],
    usedBy: ["brochbot.com", "Creator Payouts"]
  },
  {
    id: "google-sheets",
    name: "Google Sheets API",
    type: "api",
    icon: "📊",
    description: "Creator tracking spreadsheets",
    accessLevel: "Read/Write",
    resources: ["Creator Sheet", "Nick Payout Sheet"],
    usedBy: ["Creator Payouts"]
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    type: "messaging",
    icon: "💬",
    description: "Send messages to Ben",
    accessLevel: "Send messages",
    usedBy: ["All agents", "Morning Briefing"]
  },
  {
    id: "anthropic",
    name: "Anthropic API",
    type: "ai",
    icon: "🤖",
    description: "Claude model access for AI tasks",
    accessLevel: "API calls",
    usedBy: ["All agents"]
  },
  {
    id: "github",
    name: "GitHub",
    type: "repository",
    icon: "📦",
    description: "bmbroch/brochbot source code",
    url: "https://github.com/bmbroch/brochbot",
    accessLevel: "Push",
    usedBy: ["brochbot.com updates"]
  },
  {
    id: "tiktok",
    name: "TikTok",
    type: "scraping",
    icon: "🎵",
    description: "Public profile and video data",
    accessLevel: "Read only (public)",
    usedBy: ["Creator Payouts", "Creator Scout"]
  },
  {
    id: "instagram",
    name: "Instagram",
    type: "scraping",
    icon: "📸",
    description: "Public reels and profile data",
    accessLevel: "Read only (public)",
    usedBy: ["Creator Payouts", "Creator Scout"]
  },
  {
    id: "filesystem",
    name: "Workspace Files",
    type: "filesystem",
    icon: "📁",
    description: "Local workspace for memory, projects, configs",
    path: "/home/ubuntu/clawd",
    accessLevel: "Read/Write",
    usedBy: ["All agents"]
  }
]

export default function Security() {
  const writeCount = DATA_ACCESS.filter(d => d.accessLevel.includes('Write') || d.accessLevel === 'Push').length
  const readCount = DATA_ACCESS.filter(d => d.accessLevel.includes('Read only')).length

  return (
    <>
      <Head>
        <title>Security | BrochBot HQ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <Link href="/" className="logo"><span className="logo-icon">🤖</span><span className="logo-text">BrochBot</span></Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Dashboard</Link>
            <Link href="/agents" className="nav-link">Agents</Link>
            <Link href="/how-it-works" className="nav-link">How It Works</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="hero">
          <h1 className="hero-title">Data Access & Security 🔐</h1>
          <p className="hero-subtitle">
            All services and databases BrochBot has access to, with full transparency on permissions.
          </p>
        </section>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{DATA_ACCESS.length}</div>
            <div className="stat-label">Total Services</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{writeCount}</div>
            <div className="stat-label">Write Access</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{readCount}</div>
            <div className="stat-label">Read Only</div>
          </div>
        </div>

        {/* Access Cards */}
        <section className="section">
          <h2 className="section-title">📋 Service Access</h2>
          <div className="access-grid">
            {DATA_ACCESS.map(access => (
              <div key={access.id} className="access-card">
                <div className="access-header">
                  <span className="access-icon">{access.icon}</span>
                  <div className="access-info">
                    <h3 className="access-name">{access.name}</h3>
                    <span className={`access-type type-${access.type}`}>{access.type}</span>
                  </div>
                </div>
                
                <p className="access-description">{access.description}</p>
                
                <div className="access-detail">
                  <span className="detail-label">Access Level</span>
                  <span className={`access-level ${access.accessLevel.includes('Write') || access.accessLevel === 'Push' ? 'level-write' : 'level-read'}`}>
                    {access.accessLevel}
                  </span>
                </div>
                
                {access.tables && (
                  <div className="access-detail">
                    <span className="detail-label">Tables</span>
                    <div className="tag-list">
                      {access.tables.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  </div>
                )}
                
                {access.resources && (
                  <div className="access-detail">
                    <span className="detail-label">Resources</span>
                    <div className="tag-list">
                      {access.resources.map(r => <span key={r} className="tag">{r}</span>)}
                    </div>
                  </div>
                )}
                
                <div className="access-detail">
                  <span className="detail-label">Used By</span>
                  <div className="tag-list">
                    {access.usedBy.map(u => <span key={u} className="tag tag-agent">{u}</span>)}
                  </div>
                </div>
                
                {access.url && (
                  <a href={access.url} target="_blank" rel="noopener noreferrer" className="access-link">
                    Open resource →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <Link href="/agents" className="btn btn-primary">
            View Agents →
          </Link>
        </section>
      </div>

      <style jsx global>{`
        :root {
          --bg: #ffffff;
          --card-bg: #f9fafb;
          --border: #e5e7eb;
          --text: #111827;
          --text-muted: #6b7280;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
        }
        
        .container { max-width: 1000px; margin: 0 auto; padding: 24px; }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--text); } .logo-icon { font-size: 24px; } .logo-text { font-size: 18px; font-weight: 700; } .logo-unused {
          font-size: 24px;
          font-weight: 700;
          text-decoration: none;
          color: var(--text);
        }
        
        .nav { display: flex; gap: 24px; }
        
        .nav-link {
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .nav-link:hover { color: var(--text); }
        
        /* Hero */
        .hero {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          margin-bottom: 48px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .hero-title {
          font-size: 48px;
          font-weight: 700;
          line-height: 56px;
          margin-bottom: 16px;
          color: #000000;
        }
        
        .hero-subtitle {
          font-size: 16px;
          line-height: 24px;
          color: #6B7280;
          max-width: 600px;
          margin: 0 auto;
        }
        
        /* Stats */
        .stats-bar {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 48px;
        }
        
        @media (min-width: 640px) {
          .stats-bar {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }
        
        .stat-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: all 300ms;
        }
        
        .stat-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        
        .stat-value { font-size: 36px; font-weight: 700; color: #000000; }
        .stat-label { font-size: 14px; color: #6B7280; margin-top: 4px; }
        
        /* Section */
        .section { margin-bottom: 48px; }
        
        .section-title {
          font-size: 32px;
          font-weight: 600;
          line-height: 40px;
          margin-bottom: 24px;
          color: #000000;
        }
        
        /* Access Grid */
        .access-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        @media (min-width: 640px) {
          .access-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        
        .access-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 24px;
          transition: all 300ms;
        }
        
        .access-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        
        .access-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .access-icon { font-size: 40px; }
        
        .access-info { flex: 1; }
        
        .access-name {
          font-size: 20px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 4px;
        }
        
        .access-type {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 500;
        }
        
        .type-database { background: #DBEAFE; color: #1D4ED8; }
        .type-api { background: #DCFCE7; color: #16A34A; }
        .type-messaging { background: #E0E7FF; color: #4F46E5; }
        .type-ai { background: #FAE8FF; color: #A21CAF; }
        .type-repository { background: #F3F4F6; color: #374151; }
        .type-scraping { background: #FEF9C3; color: #A16207; }
        .type-filesystem { background: #FEE2E2; color: #DC2626; }
        
        .access-description {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        
        .access-detail { margin-bottom: 12px; }
        
        .detail-label {
          font-size: 11px;
          font-weight: 600;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 6px;
        }
        
        .access-level {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 8px;
          display: inline-block;
        }
        
        .level-write { background: #FEF2F2; color: #DC2626; }
        .level-read { background: #DCFCE7; color: #16A34A; }
        
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .tag {
          font-size: 12px;
          padding: 4px 10px;
          background: #F3F4F6;
          border-radius: 8px;
          color: #374151;
        }
        
        .tag-agent {
          background: #DBEAFE;
          color: #1D4ED8;
        }
        
        .access-link {
          display: inline-block;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #F5F5F5;
          width: 100%;
          color: #2563EB;
          font-size: 14px;
          text-decoration: none;
          font-weight: 500;
        }
        
        .access-link:hover { text-decoration: underline; }
        
        /* CTA */
        .cta-section {
          text-align: center;
          padding: 32px 0;
        }
        
        .btn {
          display: inline-block;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-primary {
          background: #000000;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        .btn-primary:hover {
          background: #333333;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 640px) {
          .hero { padding: 32px 24px; }
          .hero-title { font-size: 36px; line-height: 44px; }
          .section-title { font-size: 24px; line-height: 32px; }
          .btn { width: 100%; text-align: center; }
        }
      `}</style>
    </>
  )
}

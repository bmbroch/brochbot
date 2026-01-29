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
  return (
    <>
      <Head>
        <title>Data Access & Security - Brochbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        <header className="header">
          <div>
            <Link href="/" className="back-link">← Back to Tasks</Link>
            <h1 className="page-title">🔐 Data Access & Security</h1>
            <p className="page-subtitle">All services and databases Brochbot has access to</p>
          </div>
        </header>

        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-value">{DATA_ACCESS.length}</div>
            <div className="stat-label">Total Services</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{DATA_ACCESS.filter(d => d.accessLevel.includes('Write')).length}</div>
            <div className="stat-label">Write Access</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{DATA_ACCESS.filter(d => d.accessLevel.includes('Read only')).length}</div>
            <div className="stat-label">Read Only</div>
          </div>
        </div>

        <div className="access-grid">
          {DATA_ACCESS.map(access => (
            <div key={access.id} className="access-card">
              <div className="access-header">
                <span className="access-icon">{access.icon}</span>
                <div>
                  <h3 className="access-name">{access.name}</h3>
                  <span className={`access-type type-${access.type}`}>{access.type}</span>
                </div>
              </div>
              <p className="access-description">{access.description}</p>
              
              <div className="access-detail">
                <span className="detail-label">Access Level</span>
                <span className={`access-level ${access.accessLevel.includes('Write') ? 'level-write' : 'level-read'}`}>
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
                  Open →
                </a>
              )}
            </div>
          ))}
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
        
        .header { margin-bottom: 32px; }
        
        .back-link {
          color: var(--accent);
          text-decoration: none;
          font-size: 14px;
        }
        
        .page-title {
          font-size: 28px;
          font-weight: 700;
          margin: 8px 0;
        }
        
        .page-subtitle {
          color: var(--text-muted);
        }
        
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .stat-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        
        .stat-value { font-size: 32px; font-weight: 700; }
        .stat-label { font-size: 13px; color: var(--text-muted); }
        
        .access-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .access-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
        }
        
        .access-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .access-icon { font-size: 32px; }
        
        .access-name { font-size: 18px; font-weight: 600; }
        
        .access-type {
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        
        .type-database { background: #dbeafe; color: #1d4ed8; }
        .type-api { background: #dcfce7; color: #16a34a; }
        .type-messaging { background: #e0e7ff; color: #4f46e5; }
        .type-ai { background: #fae8ff; color: #a21caf; }
        .type-repository { background: #f3f4f6; color: #374151; }
        .type-scraping { background: #fef9c3; color: #a16207; }
        .type-filesystem { background: #fee2e2; color: #dc2626; }
        
        .access-description {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 16px;
        }
        
        .access-detail {
          margin-bottom: 12px;
        }
        
        .detail-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 4px;
        }
        
        .access-level {
          font-size: 13px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
          display: inline-block;
        }
        
        .level-write { background: #fef2f2; color: #dc2626; }
        .level-read { background: #dcfce7; color: #16a34a; }
        
        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        
        .tag {
          font-size: 12px;
          padding: 2px 8px;
          background: #e5e7eb;
          border-radius: 4px;
          color: #374151;
        }
        
        .tag-agent {
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        .access-link {
          display: inline-block;
          margin-top: 12px;
          color: var(--accent);
          font-size: 14px;
          text-decoration: none;
          font-weight: 500;
        }
        
        .access-link:hover { text-decoration: underline; }
      `}</style>
    </>
  )
}

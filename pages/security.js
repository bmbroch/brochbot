import Head from 'next/head'
import Header from '../components/Header'

const DATA_ACCESS = [
  {
    name: "Supabase",
    type: "Database",
    icon: "🗄️",
    level: "Read/Write",
    description: "brochbot.com backend - tasks, creators, posts, support emails",
    tables: ["tasks", "creators", "creator_posts", "creator_payouts", "support_emails", "content_ideas"],
  },
  {
    name: "Google Sheets API",
    type: "API",
    icon: "📊",
    level: "Read/Write",
    description: "Creator tracking spreadsheets (legacy, migrating to Supabase)",
    resources: ["Creator Payout Sheet", "Nick/Luke/Abby/Jake tabs"],
  },
  {
    name: "Mercury Banking",
    type: "API",
    icon: "🏦",
    level: "Read Only",
    description: "Banking data for payout reconciliation",
    resources: ["Transaction history", "Account balances"],
  },
  {
    name: "Telegram Bot",
    type: "Messaging",
    icon: "💬",
    level: "Send/Receive",
    description: "Communication channel with Ben",
  },
  {
    name: "Anthropic API",
    type: "AI",
    icon: "🤖",
    level: "API Calls",
    description: "Claude model access for AI tasks",
  },
  {
    name: "GitHub",
    type: "Repository",
    icon: "📦",
    level: "Push",
    description: "brochbot repo - code deployments",
  },
  {
    name: "Browser Relay",
    type: "Browser",
    icon: "🌐",
    level: "Scrape",
    description: "TikTok/Instagram scraping via Chrome relay",
  },
  {
    name: "Workspace Files",
    type: "Filesystem",
    icon: "📁",
    level: "Read/Write",
    description: "/home/ubuntu/clawd workspace",
  },
]

export default function Security() {
  return (
    <>
      <Head>
        <title>Security & Access | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        <Header />
        
        <div className="page-header">
          <h1>🔐 Security & Data Access</h1>
          <p className="subtitle">What BrochBot can access and why</p>
        </div>
        
        <div className="access-grid">
          {DATA_ACCESS.map((item, i) => (
            <div key={i} className="access-card">
              <div className="access-header">
                <span className="access-icon">{item.icon}</span>
                <div>
                  <h3>{item.name}</h3>
                  <span className="access-type">{item.type}</span>
                </div>
                <span className={`access-level level-${item.level.toLowerCase().replace(/[^a-z]/g, '')}`}>
                  {item.level}
                </span>
              </div>
              <p className="access-desc">{item.description}</p>
              {item.tables && (
                <div className="access-detail">
                  <strong>Tables:</strong> {item.tables.join(', ')}
                </div>
              )}
              {item.resources && (
                <div className="access-detail">
                  <strong>Resources:</strong> {item.resources.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="principles">
          <h2>🛡️ Security Principles</h2>
          <ul>
            <li><strong>Read-only where possible</strong> - Banking access is read-only</li>
            <li><strong>No credential storage in code</strong> - All secrets in .secrets/ directory</li>
            <li><strong>Ask before external actions</strong> - Confirm before sending emails, payments</li>
            <li><strong>Audit trail</strong> - All actions logged in memory files</li>
          </ul>
        </div>
      </div>
      
      <style jsx>{`
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background: #0a0a0f;
          min-height: 100vh;
          color: #fff;
        }
        
        .page-header {
          margin-bottom: 32px;
        }
        
        .page-header h1 {
          font-size: 28px;
          margin: 0 0 8px 0;
        }
        
        .subtitle {
          color: #888;
          margin: 0;
        }
        
        .access-grid {
          display: grid;
          gap: 16px;
          margin-bottom: 40px;
        }
        
        .access-card {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
        }
        
        .access-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .access-icon {
          font-size: 24px;
        }
        
        .access-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .access-type {
          font-size: 12px;
          color: #888;
        }
        
        .access-level {
          margin-left: auto;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .level-readonly { background: #22c55e22; color: #22c55e; }
        .level-readwrite { background: #eab30822; color: #eab308; }
        .level-push { background: #3b82f622; color: #3b82f6; }
        .level-sendreceive { background: #a855f722; color: #a855f7; }
        .level-apicalls { background: #6366f122; color: #6366f1; }
        .level-scrape { background: #f4722b22; color: #f4722b; }
        
        .access-desc {
          color: #ccc;
          font-size: 14px;
          margin: 0 0 8px 0;
        }
        
        .access-detail {
          font-size: 12px;
          color: #888;
          margin-top: 8px;
        }
        
        .principles {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 24px;
        }
        
        .principles h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
        }
        
        .principles ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .principles li {
          margin-bottom: 8px;
          color: #ccc;
        }
      `}</style>
    </>
  )
}

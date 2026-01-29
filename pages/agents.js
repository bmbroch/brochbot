import Head from 'next/head'
import Link from 'next/link'

const ACTIVE_AGENTS = [
  {
    emoji: '📧',
    title: 'Email Support Bot',
    description: 'Handle customer support emails via Resend webhook → Draft responses → Ben approves → Send.',
    trigger: 'Webhook (on email)',
    link: '/support',
  },
  {
    emoji: '💰',
    title: 'Creator Payouts',
    description: 'Scrape TikTok/IG for Nick, Luke, Abby, Jake → Update Google Sheet → Send Telegram report',
    trigger: 'Manual (on request)',
  },
  {
    emoji: '☀️',
    title: 'Morning Briefing',
    description: 'Daily summary of priority tasks, weather, and reminders delivered to Telegram.',
    trigger: 'Cron: 7 AM Cape Town',
  },
  {
    emoji: '🌙',
    title: 'Overnight Worker',
    description: 'Autonomous overnight work - pulls tasks from Supabase and works through them while you sleep.',
    trigger: 'Cron: 11pm, 2am, 5am',
  },
]

const PLANNED_AGENTS = [
  {
    emoji: '🔍',
    title: 'Creator Scout',
    description: 'Find and analyze new UGC creators to reach out to for partnerships.',
  },
]

const COMMANDS = [
  {
    emoji: '📊',
    title: 'Reports',
    items: [
      { cmd: 'payouts', desc: 'Run creator payouts (scrape + sheet + report)' },
      { cmd: 'briefing', desc: 'Morning briefing (tasks, weather)' },
    ],
  },
  {
    emoji: '🔄',
    title: 'Sync',
    items: [
      { cmd: 'sync', desc: 'Check everything matches, fix drift' },
    ],
  },
  {
    emoji: '🗂️',
    title: 'Tasks',
    items: [
      { cmd: 'tasks', desc: 'Show active BrochBot tasks' },
    ],
  },
  {
    emoji: '🛠️',
    title: 'Dev',
    items: [
      { cmd: 'deploy', desc: 'Commit + push (triggers Vercel)' },
    ],
  },
]

const CAPABILITIES = [
  { emoji: '🌐', title: 'Web Scraping', description: 'TikTok, Instagram via Chrome relay' },
  { emoji: '📊', title: 'Google Sheets', description: 'Read/write spreadsheets' },
  { emoji: '💬', title: 'Telegram', description: 'Send messages and reports' },
  { emoji: '🗄️', title: 'Supabase', description: 'Database read/write' },
]

export default function Agents() {
  return (
    <>
      <Head>
        <title>Agents | BrochBot HQ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Active agents, quick commands, and capabilities." />
      </Head>
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <Link href="/" className="logo"><span className="logo-icon">🤖</span><span className="logo-text">BrochBot</span></Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Dashboard</Link>
            <Link href="/how-it-works" className="nav-link">How It Works</Link>
            <Link href="/security" className="nav-link">Security</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="hero">
          <h1 className="hero-title">Agent Dashboard 🤖</h1>
          <p className="hero-subtitle">
            Active workflows, quick commands, and capabilities all in one place.
          </p>
        </section>

        {/* Active Agents */}
        <section className="section">
          <h2 className="section-title">🟢 Active Agents</h2>
          <div className="grid">
            {ACTIVE_AGENTS.map((agent) => (
              <div key={agent.title} className="card">
                <div className="card-emoji">{agent.emoji}</div>
                <h3 className="card-title">{agent.title}</h3>
                <p className="card-description">{agent.description}</p>
                <div className="card-footer">
                  <div className="card-meta">
                    <span className="meta-icon">⏰</span>
                    <span>{agent.trigger}</span>
                  </div>
                  {agent.link && (
                    <Link href={agent.link} className="card-link">
                      Open →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Planned Agents */}
        <section className="section">
          <h2 className="section-title">🟡 Coming Soon</h2>
          <div className="grid grid-2">
            {PLANNED_AGENTS.map((agent) => (
              <div key={agent.title} className="card card-muted">
                <div className="card-emoji">{agent.emoji}</div>
                <h3 className="card-title">{agent.title}</h3>
                <p className="card-description">{agent.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Commands */}
        <section className="section">
          <h2 className="section-title">🎮 Quick Commands</h2>
          <p className="section-subtitle">Type these in Telegram to trigger actions</p>
          <div className="grid">
            {COMMANDS.map((group) => (
              <div key={group.title} className="card">
                <div className="card-emoji">{group.emoji}</div>
                <h3 className="card-title">{group.title}</h3>
                <div className="command-list">
                  {group.items.map((item) => (
                    <div key={item.cmd} className="command-item">
                      <code className="command-code">{item.cmd}</code>
                      <span className="command-desc">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section className="section">
          <div className="hero-card">
            <h2 className="hero-card-title">🔧 Capabilities</h2>
            <div className="capabilities-grid">
              {CAPABILITIES.map((cap) => (
                <div key={cap.title} className="capability-item">
                  <div className="capability-emoji">{cap.emoji}</div>
                  <div>
                    <div className="capability-title">{cap.title}</div>
                    <div className="capability-desc">{cap.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <Link href="/" className="btn btn-primary">
            View Dashboard →
          </Link>
        </section>
      </div>

      <style jsx global>{`
        :root {
          --bg: #ffffff;
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
          margin-bottom: 56px;
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
        
        /* Sections */
        .section { margin-bottom: 56px; }
        
        .section-title {
          font-size: 32px;
          font-weight: 600;
          line-height: 40px;
          margin-bottom: 24px;
          color: #000000;
        }
        
        .section-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin-top: -16px;
          margin-bottom: 24px;
        }
        
        /* Grid */
        .grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        @media (min-width: 640px) {
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }
        
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          .grid-2 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        /* Cards */
        .card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 24px;
          transition: all 300ms;
        }
        
        .card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        
        .card-muted {
          opacity: 0.7;
        }
        
        .card-emoji {
          font-size: 32px;
          margin-bottom: 12px;
        }
        
        .card-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 32px;
          margin-bottom: 8px;
          color: #000000;
        }
        
        .card-description {
          font-size: 16px;
          color: #6B7280;
          line-height: 24px;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #F5F5F5;
        }
        
        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6B7280;
        }
        
        .card-link {
          font-size: 14px;
          font-weight: 500;
          color: #3b82f6;
          text-decoration: none;
          padding: 6px 12px;
          background: #eff6ff;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .card-link:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }
        
        /* Commands */
        .command-list {
          margin-top: 16px;
        }
        
        .command-item {
          padding: 12px 0;
          border-bottom: 1px solid #F5F5F5;
        }
        
        .command-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        
        .command-code {
          display: inline-block;
          background: #F3F4F6;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #000000;
          margin-bottom: 4px;
        }
        
        .command-desc {
          display: block;
          font-size: 14px;
          color: #6B7280;
        }
        
        /* Hero Card */
        .hero-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .hero-card-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 32px;
          margin-bottom: 24px;
          color: #000000;
        }
        
        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        
        @media (min-width: 768px) {
          .capabilities-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .capability-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .capability-emoji {
          font-size: 28px;
        }
        
        .capability-title {
          font-size: 15px;
          font-weight: 600;
          color: #000000;
        }
        
        .capability-desc {
          font-size: 14px;
          color: #6B7280;
        }
        
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
          .card-title { font-size: 18px; line-height: 24px; }
          .card-description { font-size: 14px; }
          .card { padding: 20px; }
          .hero-card { padding: 24px; }
          .capabilities-grid { grid-template-columns: 1fr; }
          .btn { width: 100%; text-align: center; }
        }
      `}</style>
    </>
  )
}

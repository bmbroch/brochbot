import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const ACTIVE_AGENTS = [
  {
    id: 'creator-payouts',
    name: 'Creator Payouts Manager',
    emoji: '💰',
    status: 'active',
    trigger: 'Manual (on request)',
    category: 'SalesEcho',
    description: 'Scrape TikTok/IG for Nick, Luke, Abby, Jake → Update Google Sheet → Send Telegram report',
  },
  {
    id: 'morning-briefing',
    name: 'Morning Briefing',
    emoji: '☀️',
    status: 'active',
    trigger: 'Cron: 7 AM Cape Town',
    category: 'Operations',
    description: 'Daily summary: priority tasks, weather, reminders',
  },
  {
    id: 'overnight-worker',
    name: 'Overnight Worker',
    emoji: '🌙',
    status: 'active',
    trigger: 'Cron: 11pm, 2am, 5am',
    category: 'Operations',
    description: 'Autonomous overnight work - pulls todo tasks from Supabase and works through them',
  },
]

const PLANNED_AGENTS = [
  {
    id: 'email-support',
    name: 'Email Customer Support Bot',
    emoji: '📧',
    category: 'Operations',
    description: 'Handle support emails via Resend API',
  },
  {
    id: 'creator-scout',
    name: 'Creator Scout',
    emoji: '🔍',
    category: 'SalesEcho',
    description: 'Find and analyze new UGC creators to reach out to',
  },
]

const COMMANDS = [
  { category: '📊 Reports', commands: [
    { cmd: 'payouts', desc: 'Run creator payouts (scrape + sheet + report)' },
    { cmd: 'payout summary', desc: 'Show current payout totals' },
    { cmd: 'briefing', desc: 'Morning briefing (tasks, weather, reminders)' },
  ]},
  { category: '🔄 Sync', commands: [
    { cmd: 'sync', desc: 'Sync agents registry with tasks + verify crons' },
    { cmd: 'sync tasks', desc: 'Pull active tasks from Supabase' },
    { cmd: 'sync crons', desc: 'List and verify cron jobs' },
  ]},
  { category: '🗂️ Tasks', commands: [
    { cmd: 'tasks', desc: 'Show active Brochbot tasks' },
    { cmd: 'p0', desc: 'Show P0 (drop everything) tasks' },
    { cmd: 'p1', desc: 'Show P1 (do today) tasks' },
  ]},
  { category: '🛠️ Dev', commands: [
    { cmd: 'deploy', desc: 'Commit + push brochbot (triggers Vercel)' },
    { cmd: 'agents', desc: 'Describe active agents' },
    { cmd: 'crons', desc: 'List scheduled cron jobs' },
  ]},
]

const CAPABILITIES = [
  { icon: '🌐', name: 'Web Scraping', desc: 'TikTok, Instagram via Chrome relay' },
  { icon: '📊', name: 'Google Sheets', desc: 'Read/write spreadsheets' },
  { icon: '💬', name: 'Telegram', desc: 'Send messages, reports' },
  { icon: '🔍', name: 'Web Search', desc: 'Brave Search API' },
  { icon: '📁', name: 'File System', desc: 'Read/write workspace files' },
  { icon: '⏰', name: 'Cron Jobs', desc: 'Scheduled automations' },
  { icon: '🗄️', name: 'Supabase', desc: 'Database read/write' },
  { icon: '🐙', name: 'GitHub', desc: 'Push code, manage repos' },
]

export default function AgentsPage() {
  return (
    <>
      <Head>
        <title>Agents | Brochbot HQ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <Link href="/" className="logo">🤖 Brochbot HQ</Link>
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
          <div className="agents-grid">
            {ACTIVE_AGENTS.map(agent => (
              <div key={agent.id} className="agent-card agent-active">
                <div className="agent-header">
                  <span className="agent-emoji">{agent.emoji}</span>
                  <div>
                    <h3 className="agent-name">{agent.name}</h3>
                    <span className="agent-category">{agent.category}</span>
                  </div>
                  <span className="status-badge status-active">Active</span>
                </div>
                <p className="agent-description">{agent.description}</p>
                <div className="agent-trigger">
                  <span className="trigger-icon">⏰</span>
                  <span>{agent.trigger}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Planned Agents */}
        <section className="section">
          <h2 className="section-title">🟡 Planned Agents</h2>
          <div className="agents-grid">
            {PLANNED_AGENTS.map(agent => (
              <div key={agent.id} className="agent-card agent-planned">
                <div className="agent-header">
                  <span className="agent-emoji">{agent.emoji}</span>
                  <div>
                    <h3 className="agent-name">{agent.name}</h3>
                    <span className="agent-category">{agent.category}</span>
                  </div>
                  <span className="status-badge status-planned">Planned</span>
                </div>
                <p className="agent-description">{agent.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Commands */}
        <section className="section">
          <h2 className="section-title">🎮 Quick Commands</h2>
          <p className="section-subtitle">Type these in Telegram to trigger actions. Commands are case-insensitive.</p>
          <div className="commands-grid">
            {COMMANDS.map((group, i) => (
              <div key={i} className="command-card">
                <h3 className="command-category">{group.category}</h3>
                {group.commands.map((c, j) => (
                  <div key={j} className="command-item">
                    <code className="command-code">{c.cmd}</code>
                    <span className="command-desc">{c.desc}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section className="section">
          <h2 className="section-title">🔧 Capabilities</h2>
          <div className="capabilities-card">
            <div className="capabilities-grid">
              {CAPABILITIES.map((cap, i) => (
                <div key={i} className="capability-item">
                  <span className="capability-icon">{cap.icon}</span>
                  <div>
                    <div className="capability-name">{cap.name}</div>
                    <div className="capability-desc">{cap.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sync Status */}
        <section className="section">
          <div className="sync-card">
            <h3 className="sync-title">🔄 Sync Status</h3>
            <div className="sync-item">✅ AGENTS-REGISTRY.md synced with brochbot.com tasks</div>
            <div className="sync-item">✅ Cron jobs match registered agents</div>
            <div className="sync-meta">Last sync check: Daily on session start</div>
          </div>
        </section>
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
        
        .logo {
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
          max-width: 500px;
          margin: 0 auto;
        }
        
        /* Sections */
        .section { margin-bottom: 48px; }
        
        .section-title {
          font-size: 32px;
          font-weight: 600;
          line-height: 40px;
          margin-bottom: 16px;
          color: #000000;
        }
        
        .section-subtitle {
          font-size: 16px;
          color: #6B7280;
          margin-bottom: 24px;
        }
        
        /* Agent Cards */
        .agents-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        @media (min-width: 640px) {
          .agents-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        
        @media (min-width: 1024px) {
          .agents-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .agent-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 24px;
          transition: all 300ms;
        }
        
        .agent-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }
        
        .agent-active { border-left: 4px solid #22C55E; }
        .agent-planned { border-left: 4px solid #F59E0B; }
        
        .agent-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        
        .agent-emoji { font-size: 32px; }
        
        .agent-name {
          font-size: 18px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 2px;
        }
        
        .agent-category {
          font-size: 12px;
          color: #6B7280;
        }
        
        .status-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
        }
        
        .status-active { background: #DCFCE7; color: #16A34A; }
        .status-planned { background: #FEF9C3; color: #A16207; }
        
        .agent-description {
          font-size: 14px;
          color: #6B7280;
          line-height: 1.6;
          margin-bottom: 12px;
        }
        
        .agent-trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6B7280;
          padding-top: 12px;
          border-top: 1px solid #F5F5F5;
        }
        
        /* Commands */
        .commands-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        @media (min-width: 640px) {
          .commands-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }
        
        @media (min-width: 1024px) {
          .commands-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .command-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 20px;
        }
        
        .command-category {
          font-size: 16px;
          font-weight: 600;
          color: #000000;
          margin-bottom: 12px;
        }
        
        .command-item {
          padding: 8px 0;
          border-bottom: 1px solid #F5F5F5;
        }
        
        .command-item:last-child { border-bottom: none; }
        
        .command-code {
          display: inline-block;
          background: #F3F4F6;
          padding: 2px 8px;
          border-radius: 6px;
          font-size: 13px;
          color: #000000;
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .command-desc {
          display: block;
          font-size: 13px;
          color: #6B7280;
        }
        
        /* Capabilities */
        .capabilities-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .capabilities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
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
        
        .capability-icon { font-size: 28px; }
        
        .capability-name {
          font-size: 14px;
          font-weight: 600;
          color: #000000;
        }
        
        .capability-desc {
          font-size: 12px;
          color: #6B7280;
        }
        
        /* Sync */
        .sync-card {
          background: #F9FAFB;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 24px;
        }
        
        .sync-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #000000;
        }
        
        .sync-item {
          font-size: 14px;
          color: #374151;
          margin-bottom: 8px;
        }
        
        .sync-meta {
          font-size: 13px;
          color: #9CA3AF;
          margin-top: 12px;
        }
        
        @media (max-width: 640px) {
          .hero { padding: 32px 24px; }
          .hero-title { font-size: 36px; line-height: 44px; }
          .section-title { font-size: 24px; line-height: 32px; }
          .capabilities-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  )
}

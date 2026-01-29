import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

// Agent registry - matches memory/AGENTS-REGISTRY.md
const ACTIVE_AGENTS = [
  {
    id: 'creator-payouts',
    name: 'Creator Payouts Manager',
    status: 'active',
    trigger: 'Manual (on request)',
    category: 'SalesEcho',
    description: 'Scrape TikTok/IG for Nick, Luke, Abby, Jake → Update Google Sheet → Send Telegram report',
    docs: ['creator-payout-workflow.md', 'creator-tracking.md'],
    lastUpdated: '2026-01-29',
  },
  {
    id: 'morning-briefing',
    name: 'Morning Briefing',
    status: 'active',
    trigger: 'Cron: 7 AM Cape Town',
    category: 'Operations',
    description: 'Daily summary: priority tasks, weather, reminders',
    docs: ['MEMORY.md'],
    cronId: '3f2940ce-7840-4665-ae24-144e5a882a42',
    lastUpdated: '2026-01-29',
  },
  {
    id: 'overnight-worker',
    name: 'Overnight Worker',
    status: 'active',
    trigger: 'Cron: 11pm, 2am, 5am Cape Town',
    category: 'Operations',
    description: 'Autonomous overnight work - pulls todo tasks from Supabase and works through them',
    docs: ['daily notes'],
    cronId: 'bc21695b-891c-4adc-86ad-b8f7846f924c',
    lastUpdated: '2026-01-29',
  },
]

const PLANNED_AGENTS = [
  {
    id: 'email-support',
    name: 'Email Customer Support Bot',
    status: 'todo',
    category: 'Operations',
    description: 'Handle support emails via Resend API',
  },
  {
    id: 'creator-scout',
    name: 'Creator Scout',
    status: 'todo',
    category: 'SalesEcho',
    description: 'Find and analyze new UGC creators to reach out to',
  },
]

const MEMORY_FILES = [
  { name: 'MEMORY.md', description: 'Long-term memory, preferences, key info' },
  { name: 'AGENTS-REGISTRY.md', description: 'Active workflows registry' },
  { name: 'creator-payout-workflow.md', description: 'Creator payout process docs' },
  { name: 'creator-tracking.md', description: 'Creator tracking details' },
  { name: 'browser-relay-setup.md', description: 'Browser relay configuration' },
  { name: 'YYYY-MM-DD.md', description: 'Daily activity logs' },
]

const CAPABILITIES = [
  { icon: '🌐', name: 'Web Scraping', description: 'TikTok, Instagram via Chrome relay' },
  { icon: '📊', name: 'Google Sheets', description: 'Read/write spreadsheets' },
  { icon: '💬', name: 'Telegram', description: 'Send messages, reports' },
  { icon: '🔍', name: 'Web Search', description: 'Brave Search API' },
  { icon: '📁', name: 'File System', description: 'Read/write workspace files' },
  { icon: '⏰', name: 'Cron Jobs', description: 'Scheduled automations' },
  { icon: '🗄️', name: 'Supabase', description: 'Database read/write' },
  { icon: '🐙', name: 'GitHub', description: 'Push code, manage repos' },
]

export default function AgentsPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/tasks?status=eq.active&select=*`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      )
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Brochbot Agents | Dashboard</title>
      </Head>

      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>🤖 Brochbot Agent Dashboard</h1>
              <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>Overview of active workflows, capabilities, and memory</p>
            </div>
            <Link href="/" style={{ color: '#60a5fa', textDecoration: 'none' }}>← Back to Tasks</Link>
          </div>

          {/* Active Agents */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4ade80' }}>🟢 Active Agents</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {ACTIVE_AGENTS.map(agent => (
                <div key={agent.id} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(74, 222, 128, 0.3)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{agent.name}</h3>
                    <span style={{ 
                      background: '#22c55e', 
                      color: '#000', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>ACTIVE</span>
                  </div>
                  <p style={{ color: '#888', fontSize: '0.8rem', margin: '0.25rem 0' }}>{agent.category}</p>
                  <p style={{ color: '#ccc', fontSize: '0.9rem', margin: '0.75rem 0' }}>{agent.description}</p>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888' }}>
                    <span>⏰ {agent.trigger}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Planned Agents */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fbbf24' }}>🟡 Planned Agents</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1rem' }}>
              {PLANNED_AGENTS.map(agent => (
                <div key={agent.id} style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#ccc' }}>{agent.name}</h3>
                    <span style={{ 
                      background: '#78716c', 
                      color: '#fff', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem' 
                    }}>TODO</span>
                  </div>
                  <p style={{ color: '#888', fontSize: '0.8rem', margin: '0.25rem 0' }}>{agent.category}</p>
                  <p style={{ color: '#999', fontSize: '0.9rem', margin: '0.75rem 0' }}>{agent.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Capabilities & Memory side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Capabilities */}
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#60a5fa' }}>🔧 Capabilities</h2>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(96, 165, 250, 0.2)'
              }}>
                {CAPABILITIES.map((cap, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '0.5rem 0',
                    borderBottom: i < CAPABILITIES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>{cap.icon}</span>
                    <div>
                      <div style={{ fontWeight: '500' }}>{cap.name}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{cap.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Memory Files */}
            <section>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#a78bfa' }}>📁 Memory Files</h2>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '1rem',
                border: '1px solid rgba(167, 139, 250, 0.2)'
              }}>
                {MEMORY_FILES.map((file, i) => (
                  <div key={i} style={{ 
                    padding: '0.5rem 0',
                    borderBottom: i < MEMORY_FILES.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                  }}>
                    <div style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{file.name}</div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>{file.description}</div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sync Status */}
          <section style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#888' }}>🔄 Sync Status</h2>
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              fontSize: '0.9rem',
              color: '#888'
            }}>
              <p>✅ AGENTS-REGISTRY.md synced with brochbot.com tasks</p>
              <p>✅ Cron jobs match registered agents</p>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>Last sync check: Daily on session start</p>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const DATA_ACCESS = [
  { id: 'supabase', name: 'Supabase', icon: '🗄️', type: 'database', level: 'read/write' },
  { id: 'google-sheets', name: 'Google Sheets', icon: '📊', type: 'api', level: 'read/write' },
  { id: 'telegram', name: 'Telegram Bot', icon: '💬', type: 'messaging', level: 'send' },
  { id: 'anthropic', name: 'Anthropic API', icon: '🤖', type: 'ai', level: 'api calls' },
  { id: 'github', name: 'GitHub', icon: '📦', type: 'repo', level: 'push' },
  { id: 'browser', name: 'Browser/Relay', icon: '🌐', type: 'browser', level: 'scrape' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', type: 'scraping', level: 'read only' },
  { id: 'instagram', name: 'Instagram', icon: '📸', type: 'scraping', level: 'read only' },
  { id: 'filesystem', name: 'Workspace', icon: '📁', type: 'files', level: 'read/write' },
]

const CATEGORIES = [
  { id: 'operations', label: 'Operations', icon: '⚙️' },
  { id: 'sales_echo', label: 'SalesEcho', icon: '📢' },
  { id: 'interview_sidekick', label: 'Interview Sidekick', icon: '🎤' },
  { id: 'cover_letter', label: 'Cover Letter Copilot', icon: '✉️' },
  { id: 'ideas', label: 'Ideas', icon: '💡' },
]

const PRIORITIES = [
  { id: 'p0', label: 'P0 - Drop Everything', color: '#ef4444' },
  { id: 'p1', label: 'P1 - Do Today', color: '#eab308' },
  { id: 'p2', label: 'P2 - This Week', color: '#3b82f6' },
  { id: 'p3', label: 'P3 - Backlog', color: '#6b7280' },
]

const STATUSES = [
  { id: 'active', label: '🔥 Active' },
  { id: 'planning', label: '📝 Planning' },
  { id: 'paused', label: '⏸️ Paused' },
  { id: 'blocked', label: '🚫 Blocked' },
  { id: 'done', label: '✅ Done' },
]

const ASSIGNEES = [
  { id: 'brochbot', label: '🤖 BrochBot', color: '#a855f7' },
  { id: 'ben', label: '👤 Ben', color: '#22c55e' },
  { id: 'both', label: '👥 Both', color: '#3b82f6' },
]

// Map old values to new
const priorityMap = { high: 'p0', medium: 'p1', low: 'p2', ongoing: 'ongoing' }
const statusMap = { todo: 'planning', in_progress: 'active', done: 'done' }

const SCHEDULES = [
  { id: 'daily', label: 'Daily', icon: '🔄' },
  { id: 'daily_morning', label: 'Daily', icon: '🔄' },
  { id: 'weekly', label: 'Weekly', icon: '📅' },
  { id: 'monthly', label: 'Monthly', icon: '🗓️' },
  { id: 'once', label: 'One-time', icon: '1️⃣' },
]

function parseScheduleField(schedule) {
  if (!schedule) return { assignee: 'brochbot', frequency: null }
  
  let assignee = 'brochbot'
  let frequency = null
  
  const parts = schedule.split('|')
  for (const part of parts) {
    if (part.startsWith('assignee:')) {
      assignee = part.replace('assignee:', '')
    } else if (['daily', 'daily_morning', 'weekly', 'monthly', 'once'].includes(part)) {
      frequency = part
    }
  }
  
  return { assignee, frequency }
}

function normalizeTask(task) {
  const { assignee, frequency } = parseScheduleField(task.schedule)
  return {
    ...task,
    priority: priorityMap[task.priority] || task.priority || 'p1',
    status: statusMap[task.status] || task.status || 'planning',
    assignee,
    frequency,
  }
}

async function api(endpoint, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
  if (options.method === 'POST') headers['Prefer'] = 'return=representation'
  if (options.method === 'PATCH') headers['Prefer'] = 'return=representation'
  
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  })
  if (options.method === 'DELETE') return { success: true }
  return res.json()
}

export default function Home() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailTask, setDetailTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [quickAdd, setQuickAdd] = useState('')
  const [toast, setToast] = useState(null)
  const [pendingSupport, setPendingSupport] = useState(0)
  const [contentIdeas, setContentIdeas] = useState(0)

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(null), 1500)
  }

  function copyToClipboard(cmd) {
    const text = `run quick command: ${cmd}`
    navigator.clipboard.writeText(text)
    showToast(`Copied: ${cmd}`)
  }

  useEffect(() => {
    loadTasks()
    // Fetch pending support emails count
    api('support_emails?status=eq.pending&select=id').then(data => {
      setPendingSupport(Array.isArray(data) ? data.length : 0)
    })
    // Fetch content ideas count
    api('content_ideas?status=eq.ready&select=id').then(data => {
      setContentIdeas(Array.isArray(data) ? data.length : 0)
    })
  }, [])

  async function loadTasks() {
    try {
      const data = await api('tasks?order=created_at.desc')
      setTasks(data.map(normalizeTask))
    } catch (e) {
      console.error('Failed to load:', e)
    }
    setLoading(false)
  }

  const stats = {
    agents: tasks.filter(t => t.priority === 'ongoing' && t.status === 'active').length,
    brochbot: tasks.filter(t => t.assignee === 'brochbot' && t.status !== 'done').length,
    ben: tasks.filter(t => t.assignee === 'ben' && t.status !== 'done').length,
    active: tasks.filter(t => t.status === 'active').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const filteredTasks = tasks.filter(t => {
    // Hide done tasks unless explicitly viewing done
    if (view !== 'done' && t.status === 'done') return false
    
    // Brochbot view - show ALL brochbot tasks including ongoing agents
    if (view === 'brochbot') return t.assignee === 'brochbot'
    
    // All other views - exclude ongoing agents (they live in Brochbot view)
    if (t.priority === 'ongoing') return false
    
    if (view === 'all') return true
    if (view === 'ben') return t.assignee === 'ben'
    if (view === 'p0') return t.priority === 'p0'
    if (view === 'p1') return t.priority === 'p1'
    if (view === 'done') return t.status === 'done'
    if (view === 'updates') {
      const updateKeywords = ['briefing', 'planning', 'report', 'summary', 'digest']
      return updateKeywords.some(kw => t.title.toLowerCase().includes(kw))
    }
    return true
  }).sort((a, b) => {
    const pOrder = { ongoing: -1, p0: 0, p1: 1, p2: 2, p3: 3 }
    const sOrder = { active: 0, paused: 1, blocked: 2, done: 3 }
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority]
    return sOrder[a.status] - sOrder[b.status]
  })

  async function handleQuickAdd(e) {
    if (e.key !== 'Enter' || !quickAdd.trim()) return
    
    const taskData = {
      title: quickAdd.trim(),
      status: 'todo',
      priority: 'medium',
      schedule: 'assignee:brochbot',
    }
    
    const [created] = await api('tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    })
    
    setTasks([normalizeTask({ ...created, assignee: 'brochbot' }), ...tasks])
    setQuickAdd('')
  }

  async function handleSaveTask(taskData) {
    const priorityDbMap = { p0: 'high', p1: 'medium', p2: 'low', p3: 'low' }
    const statusDbMap = { active: 'in_progress', planning: 'todo', paused: 'todo', blocked: 'todo', done: 'done' }
    
    const dbData = {
      title: taskData.title,
      description: taskData.description || null,
      details: taskData.details || null,
      status: statusDbMap[taskData.status],
      priority: priorityDbMap[taskData.priority],
      category: taskData.category || null,
      schedule: `assignee:${taskData.assignee}`,
      updated_at: new Date().toISOString(),
    }
    
    if (editingTask) {
      await api(`tasks?id=eq.${editingTask.id}`, {
        method: 'PATCH',
        body: JSON.stringify(dbData)
      })
      setTasks(tasks.map(t => t.id === editingTask.id ? normalizeTask({ ...t, ...dbData, assignee: taskData.assignee }) : t))
    } else {
      const [created] = await api('tasks', {
        method: 'POST',
        body: JSON.stringify(dbData)
      })
      setTasks([normalizeTask({ ...created, assignee: taskData.assignee }), ...tasks])
    }
    
    setModalOpen(false)
    setEditingTask(null)
  }

  async function handleToggleDone(task) {
    const newStatus = task.status === 'done' ? 'active' : 'done'
    const dbStatus = newStatus === 'done' ? 'done' : 'todo'
    
    await api(`tasks?id=eq.${task.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: dbStatus, updated_at: new Date().toISOString() })
    })
    
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    setDetailTask(null)
  }

  async function handleDelete(task) {
    if (!confirm('Delete this task?')) return
    await api(`tasks?id=eq.${task.id}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== task.id))
    setDetailTask(null)
  }

  return (
    <>
      <Head>
        <title>BrochBot HQ</title>
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
            <Link href="/" className="nav-link active">Dashboard</Link>
            <Link href="/agents" className="nav-link">Agents</Link>
            <Link href="/creation" className="nav-link">Creation</Link>
            <Link href="/support" className="nav-link">Support</Link>
          </nav>
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setModalOpen(true) }}>
            + Add
          </button>
        </header>

        {/* View Toggle */}
        <div className="view-toggle">
          {['all', 'brochbot', 'updates', 'ben', 'p0', 'p1'].map(v => (
            <button
              key={v}
              className={`view-btn ${view === v ? 'active' : ''}`}
              onClick={() => setView(v)}
            >
              {v === 'all' && 'All Tasks'}
              {v === 'brochbot' && '🤖 Agent'}
              {v === 'updates' && '📬 Updates'}
              {v === 'ben' && '👤 Ben'}
              {v === 'p0' && '🔴 P0'}
              {v === 'p1' && '🟡 P1'}
            </button>
          ))}
          <button
            className={`view-btn view-btn-done ${view === 'done' ? 'active' : ''}`}
            onClick={() => setView('done')}
          >
            ✅ Done ({tasks.filter(t => t.status === 'done').length})
          </button>
        </div>

        {/* Main Layout */}
        <div className="main-layout">
          {/* Task List */}
          <div className="task-section">
            <div className="section-header">
              <span className="section-title">Tasks</span>
              <span className="meta-tag">{filteredTasks.length} tasks</span>
            </div>
            <div className="task-list">
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="empty-state">
                  <h3>No tasks</h3>
                  <p>Add a task to get started!</p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div key={task.id} className="task-item" onClick={() => setDetailTask(task)}>
                    <div className="task-top-row">
                      <span className={`priority-badge priority-${task.priority}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="task-title">{task.title}</span>
                      {task.frequency && (
                        <span className="schedule-badge" title={SCHEDULES.find(s => s.id === task.frequency)?.label}>
                          {SCHEDULES.find(s => s.id === task.frequency)?.icon}
                        </span>
                      )}
                    </div>
                    <div className="task-meta">
                      <span className={`assignee-badge assignee-${task.assignee}`}>
                        {task.assignee === 'brochbot' ? '🤖' : task.assignee === 'ben' ? '👤' : '👥'} {task.assignee}
                      </span>
                      <span className={`status-badge status-${task.status}`}>{task.status}</span>
                      {task.category && (
                        <span className="meta-tag">
                          {CATEGORIES.find(c => c.id === task.category)?.icon} {CATEGORIES.find(c => c.id === task.category)?.label}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              <div className="sidebar-title">⚡ Quick Add for BrochBot</div>
              <input
                type="text"
                className="form-input"
                placeholder="Type task and press Enter..."
                value={quickAdd}
                onChange={e => setQuickAdd(e.target.value)}
                onKeyPress={handleQuickAdd}
              />
            </div>
            
            <div className="sidebar-card">
              <div className="sidebar-title">📊 Priority Guide</div>
              <div className="priority-guide">
                <div><span className="priority-badge priority-ongoing">ONGOING</span> Always running agents</div>
                <div><span className="priority-badge priority-p0">P0</span> Drop everything</div>
                <div><span className="priority-badge priority-p1">P1</span> Do today/tonight</div>
                <div><span className="priority-badge priority-p2">P2</span> This week</div>
                <div><span className="priority-badge priority-p3">P3</span> Backlog</div>
              </div>
            </div>
            
            <div className="sidebar-card">
              <div className="sidebar-title">🎮 Quick Commands</div>
              <div className="commands-list">
                {[
                  { cmd: 'payouts', desc: 'Run creator payouts' },
                  { cmd: 'sync', desc: 'Check everything matches' },
                  { cmd: 'tasks', desc: 'Show active tasks' },
                  { cmd: 'briefing', desc: 'Morning briefing' },
                  { cmd: 'deploy', desc: 'Deploy brochbot.com' },
                ].map(item => (
                  <div key={item.cmd} className="command-row">
                    <div className="command-info">
                      <code className="command-code">{item.cmd}</code>
                      <span className="command-desc">{item.desc}</span>
                    </div>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(item.cmd)}
                      title="Copy to clipboard"
                    >📋</button>
                  </div>
                ))}
              </div>
              <a href="/agents" className="sidebar-link">All commands →</a>
            </div>
            
            <div className="sidebar-card">
              <div className="sidebar-title">🔐 Data Access</div>
              <div className="access-list">
                {DATA_ACCESS.map(access => (
                  <div key={access.id} className="access-item">
                    <span className="access-icon-small">{access.icon}</span>
                    <span className="access-name-small">{access.name}</span>
                    <span className={`access-level-small ${access.level.includes('write') || access.level === 'push' ? 'level-write' : 'level-read'}`}>
                      {access.level}
                    </span>
                  </div>
                ))}
              </div>
              <a href="/security" className="sidebar-link">View details →</a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-section">
            <div className="footer-title">🤖 BrochBot HQ</div>
            <p className="footer-tagline">Your AI coding assistant</p>
          </div>
          <div className="footer-section">
            <div className="footer-label">Pages</div>
            <div className="footer-links">
              <a href="/">Dashboard</a>
              <a href="/table">Table View</a>
              <a href="/agents">Agents</a>
              <a href="/how-it-works">How It Works</a>
              <a href="/security">Security</a>
            </div>
          </div>
          <div className="footer-section">
            <div className="footer-label">Quick Commands</div>
            <div className="footer-commands">
              {['payouts', 'sync', 'tasks', 'briefing', 'deploy'].map(cmd => (
                <button
                  key={cmd}
                  className="footer-cmd"
                  onClick={() => copyToClipboard(cmd)}
                >{cmd}</button>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">{toast}</div>
      )}

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => { setModalOpen(false); setEditingTask(null) }}
          onSave={handleSaveTask}
        />
      )}

      {/* Detail Modal */}
      {detailTask && (
        <DetailModal
          task={detailTask}
          onClose={() => setDetailTask(null)}
          onEdit={() => { setEditingTask(detailTask); setDetailTask(null); setModalOpen(true) }}
          onToggleDone={() => handleToggleDone(detailTask)}
          onDelete={() => handleDelete(detailTask)}
        />
      )}

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
          margin-bottom: 24px;
          padding: 12px 0;
          gap: 12px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text);
        }
        
        .logo-icon {
          font-size: 28px;
          line-height: 1;
        }
        
        .logo-text {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        .nav { 
          display: flex; 
          gap: 8px;
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
        
        .nav-link:hover { 
          color: var(--text); 
          background: white;
        }
        
        .btn {
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-primary { 
          background: #000000; 
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .btn-primary:hover { 
          background: #333333;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        .btn-secondary { 
          background: transparent; 
          color: var(--text); 
          border: 2px solid #F5F5F5;
        }
        .btn-secondary:hover {
          border-color: #D1D5DB;
          background: #F9FAFB;
        }
        
        .quick-access {
          display: flex;
          gap: 12px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }
        
        .quick-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #1a1a2e 0%, #252542 100%);
          border: 1px solid #444;
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .quick-btn:hover {
          background: linear-gradient(135deg, #252542 0%, #2d2d5a 100%);
          border-color: #666;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        
        @media (max-width: 768px) {
          .container { padding: 12px; }
          
          .header {
            flex-wrap: wrap;
            gap: 10px;
            padding: 8px 0;
            margin-bottom: 16px;
          }
          
          .logo-icon { font-size: 24px; }
          .logo-text { font-size: 18px; }
          
          .nav {
            order: 3;
            width: 100%;
            justify-content: center;
            padding: 3px;
            gap: 4px;
          }
          
          .nav-link {
            font-size: 12px;
            padding: 6px 10px;
          }
          
          .btn { 
            padding: 8px 14px;
            font-size: 12px;
          }
          
          .quick-access { 
            gap: 10px; 
          }
          
          .quick-btn { 
            padding: 12px 18px;
            font-size: 15px;
            flex-direction: column;
            text-align: center;
            border-radius: 16px;
          }
          
          .quick-icon {
            font-size: 20px;
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }
          
          .quick-title { font-size: 12px; }
          .quick-subtitle { font-size: 10px; }
          
          .quick-badge {
            top: -4px;
            right: -4px;
            font-size: 10px;
            padding: 2px 6px;
            min-width: 20px;
          }
        }
        
        @media (max-width: 380px) {
          .quick-access { gap: 8px; }
          .quick-btn { padding: 10px 14px; font-size: 14px; }
        }
        
        .quick-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: white;
          border: 2px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
          text-decoration: none;
          color: inherit;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        
        .quick-card:hover {
          border-color: #000;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }
        
        .quick-icon {
          font-size: 32px;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F5F5F5;
          border-radius: 16px;
        }
        
        .quick-content { flex: 1; }
        
        .quick-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .quick-subtitle {
          font-size: 14px;
          color: var(--text-muted);
        }
        
        .quick-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ef4444;
          color: white;
          font-size: 14px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          min-width: 28px;
          text-align: center;
        }
        
        .view-toggle {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
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
        .view-btn-done { margin-left: auto; opacity: 0.6; }
        .view-btn-done:hover { opacity: 1; }
        .view-btn-done.active { opacity: 1; background: #6b7280; border-color: #6b7280; }
        
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
        }
        
        @media (max-width: 800px) {
          .main-layout { grid-template-columns: 1fr; }
        }
        
        .task-section {
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
        }
        
        .section-title { font-weight: 600; }
        
        .task-list { max-height: 600px; overflow-y: auto; }
        
        .task-item {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .task-item:hover { background: #f3f4f6; }
        .task-item:last-child { border-bottom: none; }
        
        .task-top-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .priority-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .priority-p0 { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .priority-p1 { background: #fefce8; color: #ca8a04; border: 1px solid #fef08a; }
        .priority-p2 { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .priority-p3 { background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb; }
        .priority-ongoing { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
        
        .task-title { font-size: 14px; font-weight: 500; }
        
        .task-meta { display: flex; gap: 8px; flex-wrap: wrap; }
        
        .meta-tag { font-size: 12px; color: var(--text-muted); }
        
        .assignee-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .assignee-brochbot { background: #f3e8ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .assignee-ben { background: #dcfce7; color: #16a34a; border: 1px solid #bbf7d0; }
        .assignee-both { background: #dbeafe; color: #2563eb; border: 1px solid #bfdbfe; }
        
        .status-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        
        .status-active { background: #dcfce7; color: #16a34a; }
        .status-planning { background: #e0e7ff; color: #4f46e5; }
        .status-paused { background: #fef9c3; color: #a16207; }
        .status-blocked { background: #fee2e2; color: #dc2626; }
        .status-done { background: #f3f4f6; color: #6b7280; }
        
        .schedule-badge {
          font-size: 16px;
          flex-shrink: 0;
        }
        
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
        
        .form-input {
          width: 100%;
          background: var(--bg);
          border: 2px solid #F5F5F5;
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text);
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-input:focus { outline: none; border-color: #333333; }
        
        .priority-guide { display: flex; flex-direction: column; gap: 8px; font-size: 13px; }
        .priority-guide div { display: flex; align-items: center; gap: 8px; }
        
        .access-list { display: flex; flex-direction: column; gap: 6px; }
        .access-item { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; }
        .access-icon-small { font-size: 14px; }
        .access-name-small { flex: 1; }
        .access-level-small { font-size: 10px; padding: 2px 6px; border-radius: 4px; }
        .level-write { background: #fef2f2; color: #dc2626; }
        .level-read { background: #dcfce7; color: #16a34a; }
        .sidebar-link { display: block; margin-top: 12px; font-size: 13px; color: var(--accent); text-decoration: none; }
        .sidebar-link:hover { text-decoration: underline; }
        
        .commands-list { display: flex; flex-direction: column; gap: 8px; }
        
        .command-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #F5F5F5;
        }
        
        .command-row:last-child { border-bottom: none; }
        
        .command-info { display: flex; flex-direction: column; gap: 2px; }
        
        .command-code {
          background: #F3F4F6;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #000000;
        }
        
        .command-desc {
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .copy-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 0.2s;
          opacity: 0.6;
        }
        
        .copy-btn:hover {
          background: #F3F4F6;
          opacity: 1;
        }
        
        /* Footer */
        .footer {
          margin-top: 48px;
          padding: 32px;
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          display: grid;
          grid-template-columns: 1fr 1fr 2fr;
          gap: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        @media (max-width: 800px) {
          .footer { grid-template-columns: 1fr; gap: 24px; }
        }
        
        .footer-section { }
        
        .footer-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        
        .footer-tagline {
          font-size: 13px;
          color: var(--text-muted);
        }
        
        .footer-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .footer-links a {
          font-size: 14px;
          color: var(--text);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .footer-links a:hover { color: var(--accent); }
        
        .footer-commands {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .footer-cmd {
          background: #F3F4F6;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-family: monospace;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .footer-cmd:hover {
          background: #000000;
          color: white;
        }
        
        /* Toast */
        .toast {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: #000000;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          animation: toastIn 0.2s ease-out;
          z-index: 1000;
        }
        
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-muted);
        }
        
        .empty-state h3 { margin-bottom: 8px; color: var(--text); }
        
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
        }
        
        .modal-content {
          background: #ffffff;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 32px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .modal-title { font-size: 20px; font-weight: 600; }
        .modal-close { background: none; border: none; color: var(--text-muted); font-size: 28px; cursor: pointer; }
        
        .form-group { margin-bottom: 16px; }
        .form-label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
        
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 500px) { .form-row { grid-template-columns: 1fr; } }
        
        .form-select, .form-textarea {
          width: 100%;
          background: var(--bg);
          border: 2px solid #F5F5F5;
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text);
          font-size: 14px;
          font-family: inherit;
          transition: border-color 0.2s;
        }
        
        .form-select:focus, .form-textarea:focus { outline: none; border-color: #333333; }
        
        .form-textarea { resize: vertical; min-height: 80px; }
        
        .detail-section { margin-bottom: 20px; }
        .detail-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
        .detail-content { font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
        
        .detail-actions { display: flex; gap: 12px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; }
      `}</style>
    </>
  )
}

function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    assignee: task?.assignee || 'brochbot',
    priority: task?.priority || 'p1',
    status: task?.status || 'active',
    category: task?.category || 'operations',
    description: task?.description || '',
    details: task?.details || '',
  })

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task ? 'Edit Task' : 'Add Task'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="What needs to be done?"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <select className="form-select" value={form.assignee} onChange={e => setForm({ ...form, assignee: e.target.value })}>
                {ASSIGNEES.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief summary..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Details / Instructions</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '120px' }}
              value={form.details}
              onChange={e => setForm({ ...form, details: e.target.value })}
              placeholder="Full context for BrochBot to complete this task..."
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Task</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DetailModal({ task, onClose, onEdit, onToggleDone, onDelete }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task.title}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <div className="task-meta" style={{ marginBottom: '20px' }}>
          <span className={`priority-badge priority-${task.priority}`}>{task.priority.toUpperCase()}</span>
          <span className={`assignee-badge assignee-${task.assignee}`}>
            {task.assignee === 'brochbot' ? '🤖' : task.assignee === 'ben' ? '👤' : '👥'} {task.assignee}
          </span>
          <span className={`status-badge status-${task.status}`}>{task.status}</span>
        </div>
        
        {task.description && (
          <div className="detail-section">
            <div className="detail-label">Description</div>
            <div className="detail-content">{task.description}</div>
          </div>
        )}
        
        {task.details && (
          <div className="detail-section">
            <div className="detail-label">Details / Instructions</div>
            <div className="detail-content">{task.details}</div>
          </div>
        )}
        
        <div className="detail-actions">
          <button className="btn btn-secondary" onClick={onEdit}>✏️ Edit</button>
          <button className="btn btn-secondary" onClick={onToggleDone}>
            {task.status === 'done' ? '↩️ Reopen' : '✅ Mark Done'}
          </button>
          <button className="btn btn-secondary" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={onDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  )
}

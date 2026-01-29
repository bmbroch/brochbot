import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const CATEGORIES = [
  { id: 'operations', label: 'Operations' },
  { id: 'sales_echo', label: 'SalesEcho' },
  { id: 'interview_sidekick', label: 'Interview Sidekick' },
  { id: 'cover_letter', label: 'Cover Letter Copilot' },
  { id: 'life', label: 'Life' },
  { id: 'ideas', label: 'Ideas' },
]

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

export default function TableView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    setLoading(true)
    const data = await api('tasks?order=created_at.desc')
    setTasks(data || [])
    setLoading(false)
  }

  async function updateTask(id, field, value) {
    setSaving(id)
    await api(`tasks?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ [field]: value || null, updated_at: new Date().toISOString() })
    })
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t))
    setSaving(null)
  }

  async function addTask() {
    const result = await api('tasks', {
      method: 'POST',
      body: JSON.stringify({ 
        title: 'New Task', 
        status: 'todo', 
        priority: 'medium',
        category: 'operations'
      })
    })
    if (result && result[0]) {
      setTasks([result[0], ...tasks])
    }
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return
    await api(`tasks?id=eq.${id}`, { method: 'DELETE' })
    setTasks(tasks.filter(t => t.id !== id))
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return t.category !== 'ideas'
    if (filter === 'ideas') return t.category === 'ideas'
    return t.category === filter
  })

  return (
    <>
      <Head>
        <title>Table View | BrochBot HQ</title>
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
            <Link href="/creation" className="nav-link">Creation</Link>
            <Link href="/support" className="nav-link">Support</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="hero">
          <h1 className="hero-title">Table View 📋</h1>
          <p className="hero-subtitle">
            Quick spreadsheet-style editing for all your tasks.
          </p>
        </section>

        {/* Controls */}
        <section className="controls">
          <div className="controls-left">
            <select 
              className="filter-select"
              value={filter} 
              onChange={e => setFilter(e.target.value)}
            >
              <option value="all">All Tasks</option>
              {CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <span className="task-count">{filteredTasks.length} tasks</span>
          </div>
          <button className="btn btn-primary" onClick={addTask}>
            + Add Task
          </button>
        </section>

        {/* Table */}
        <section className="table-section">
          <div className="table-card">
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th className="col-title">Title</th>
                    <th className="col-desc">Description</th>
                    <th className="col-status">Status</th>
                    <th className="col-priority">Priority</th>
                    <th className="col-category">Category</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="empty-cell">Loading...</td></tr>
                  ) : filteredTasks.length === 0 ? (
                    <tr><td colSpan="6" className="empty-cell">No tasks yet. Click "+ Add Task" to create one.</td></tr>
                  ) : (
                    filteredTasks.map(task => (
                      <tr key={task.id} className={saving === task.id ? 'saving' : ''}>
                        <td className="col-title">
                          <input
                            type="text"
                            value={task.title || ''}
                            onChange={e => setTasks(tasks.map(t => t.id === task.id ? {...t, title: e.target.value} : t))}
                            onBlur={e => updateTask(task.id, 'title', e.target.value)}
                            placeholder="Task title..."
                          />
                        </td>
                        <td className="col-desc">
                          <input
                            type="text"
                            value={task.description || ''}
                            onChange={e => setTasks(tasks.map(t => t.id === task.id ? {...t, description: e.target.value} : t))}
                            onBlur={e => updateTask(task.id, 'description', e.target.value)}
                            placeholder="Description..."
                          />
                        </td>
                        <td className="col-status">
                          <select
                            value={task.status || 'todo'}
                            onChange={e => updateTask(task.id, 'status', e.target.value)}
                            className={`status-${task.status}`}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td className="col-priority">
                          <select
                            value={task.priority || 'medium'}
                            onChange={e => updateTask(task.id, 'priority', e.target.value)}
                            className={`priority-${task.priority}`}
                          >
                            <option value="high">🔴 High</option>
                            <option value="medium">🟡 Medium</option>
                            <option value="low">🟢 Low</option>
                          </select>
                        </td>
                        <td className="col-category">
                          <select
                            value={task.category || ''}
                            onChange={e => updateTask(task.id, 'category', e.target.value)}
                          >
                            {CATEGORIES.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="col-actions">
                          <button className="delete-btn" onClick={() => deleteTask(task.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <Link href="/" className="btn btn-secondary">
            ← Back to Dashboard
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
        
        .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
        
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
          margin-bottom: 32px;
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
        }
        
        /* Controls */
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .controls-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .filter-select {
          padding: 12px 16px;
          border: 2px solid #F5F5F5;
          border-radius: 12px;
          font-size: 14px;
          background: white;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        
        .filter-select:focus {
          outline: none;
          border-color: #333333;
        }
        
        .task-count {
          font-size: 14px;
          color: #6B7280;
        }
        
        /* Buttons */
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
        
        .btn-secondary {
          background: white;
          color: #333333;
          border: 2px solid #F5F5F5;
        }
        
        .btn-secondary:hover {
          border-color: #D1D5DB;
          background: #F9FAFB;
        }
        
        /* Table Section */
        .table-section { margin-bottom: 48px; }
        
        .table-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }
        
        .table-scroll {
          overflow-x: auto;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th {
          text-align: left;
          padding: 16px 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6B7280;
          background: #F9FAFB;
          border-bottom: 1px solid #F5F5F5;
        }
        
        td {
          padding: 12px 16px;
          border-bottom: 1px solid #F5F5F5;
          vertical-align: middle;
        }
        
        tr:hover { background: #FAFAFA; }
        tr.saving { opacity: 0.5; }
        tr:last-child td { border-bottom: none; }
        
        .col-title { min-width: 200px; }
        .col-desc { min-width: 200px; }
        .col-status { width: 140px; }
        .col-priority { width: 130px; }
        .col-category { width: 160px; }
        .col-actions { width: 60px; text-align: center; }
        
        td input, td select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid transparent;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          background: transparent;
          transition: all 0.2s;
        }
        
        td input:hover, td select:hover {
          background: #F3F4F6;
        }
        
        td input:focus, td select:focus {
          outline: none;
          border-color: #333333;
          background: white;
        }
        
        td select { cursor: pointer; }
        
        .status-todo { color: #6B7280; }
        .status-in_progress { color: #3B82F6; }
        .status-done { color: #22C55E; }
        
        .priority-high { color: #EF4444; }
        .priority-medium { color: #EAB308; }
        .priority-low { color: #22C55E; }
        
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.4;
          font-size: 16px;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .delete-btn:hover {
          opacity: 1;
          background: #FEF2F2;
        }
        
        .empty-cell {
          text-align: center;
          padding: 48px 20px !important;
          color: #6B7280;
          font-size: 16px;
        }
        
        /* CTA */
        .cta-section {
          text-align: center;
          padding: 32px 0;
        }
        
        @media (max-width: 640px) {
          .hero { padding: 32px 24px; }
          .hero-title { font-size: 36px; line-height: 44px; }
          .col-desc { display: none; }
          .btn { width: 100%; text-align: center; }
          .controls { flex-direction: column; align-items: stretch; }
          .controls-left { justify-content: space-between; }
        }
      `}</style>
    </>
  )
}

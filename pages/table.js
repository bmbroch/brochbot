import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const CATEGORIES = [
  { id: 'operations', label: 'Work Operations' },
  { id: 'sales_echo', label: 'SalesEcho' },
  { id: 'interview_sidekick', label: 'Interview Sidekick' },
  { id: 'cover_letter', label: 'Cover Letter Copilot' },
  { id: 'life', label: 'Life' },
  { id: 'ideas', label: 'Future Ideas' },
]

const STATUSES = ['todo', 'in_progress', 'done']
const PRIORITIES = ['high', 'medium', 'low']
const SCHEDULES = ['', 'daily_morning', 'daily_evening', 'weekly', 'monthly']

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
        category: 'life'
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
        <title>Brochbot - Table View</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="app">
        <header className="header">
          <div className="header-left">
            <Link href="/" className="logo">
              <span className="logo-icon">🤖</span>
              <span>Brochbot</span>
            </Link>
            <div className="view-toggle">
              <Link href="/" className="view-btn">Kanban</Link>
              <span className="view-btn active">Table</span>
            </div>
          </div>
          <button className="btn-primary" onClick={addTask}>+ Add Row</button>
        </header>

        <div className="filter-bar">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Tasks</option>
            <option value="operations">Work Operations</option>
            <option value="sales_echo">SalesEcho</option>
            <option value="interview_sidekick">Interview Sidekick</option>
            <option value="cover_letter">Cover Letter Copilot</option>
            <option value="life">Life</option>
            <option value="ideas">Future Ideas</option>
          </select>
          <span className="task-count">{filteredTasks.length} tasks</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="col-title">Title</th>
                <th className="col-desc">Description</th>
                <th className="col-status">Status</th>
                <th className="col-priority">Priority</th>
                <th className="col-category">Category</th>
                <th className="col-schedule">Schedule</th>
                <th className="col-actions">⚡</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="loading-cell">Loading...</td></tr>
              ) : filteredTasks.length === 0 ? (
                <tr><td colSpan="7" className="empty-cell">No tasks. Click "+ Add Row" to create one.</td></tr>
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
                    <td className="col-schedule">
                      <select
                        value={task.schedule || ''}
                        onChange={e => updateTask(task.id, 'schedule', e.target.value)}
                      >
                        <option value="">None</option>
                        <option value="daily_morning">🌅 Daily AM</option>
                        <option value="daily_evening">🌙 Daily PM</option>
                        <option value="weekly">📅 Weekly</option>
                        <option value="monthly">🗓️ Monthly</option>
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

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, sans-serif;
          background: #fafafa;
          color: #111;
        }
        
        .app { min-height: 100vh; }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          color: inherit;
        }
        
        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #000, #333);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 8px;
        }
        
        .view-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          text-decoration: none;
          color: #6b7280;
          cursor: pointer;
        }
        
        .view-btn.active {
          background: white;
          color: #111;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .btn-primary {
          background: #000;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          background: white;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .filter-bar select {
          padding: 6px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 13px;
          background: white;
        }
        
        .task-count {
          font-size: 13px;
          color: #6b7280;
        }
        
        .table-container {
          overflow-x: auto;
          padding: 0 24px 24px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          margin-top: 16px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        th {
          text-align: left;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        td {
          padding: 8px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: middle;
        }
        
        tr:hover { background: #fafafa; }
        tr.saving { opacity: 0.6; }
        tr:last-child td { border-bottom: none; }
        
        .col-title { min-width: 200px; }
        .col-desc { min-width: 200px; }
        .col-status { width: 130px; }
        .col-priority { width: 120px; }
        .col-category { width: 160px; }
        .col-schedule { width: 130px; }
        .col-actions { width: 50px; text-align: center; }
        
        td input, td select {
          width: 100%;
          padding: 8px 10px;
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          background: transparent;
        }
        
        td input:hover, td select:hover {
          background: #f3f4f6;
        }
        
        td input:focus, td select:focus {
          outline: none;
          border-color: #000;
          background: white;
        }
        
        td select {
          cursor: pointer;
        }
        
        .status-todo { color: #6b7280; }
        .status-in_progress { color: #3b82f6; }
        .status-done { color: #22c55e; }
        
        .priority-high { color: #ef4444; }
        .priority-medium { color: #eab308; }
        .priority-low { color: #22c55e; }
        
        .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          opacity: 0.4;
          font-size: 14px;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .delete-btn:hover {
          opacity: 1;
          background: #fef2f2;
        }
        
        .loading-cell, .empty-cell {
          text-align: center;
          padding: 40px !important;
          color: #6b7280;
        }
        
        @media (max-width: 768px) {
          .header { padding: 12px 16px; }
          .filter-bar { padding: 12px 16px; }
          .table-container { padding: 0 16px 16px; }
          
          .col-desc, .col-schedule {
            display: none;
          }
        }
      `}</style>
    </>
  )
}

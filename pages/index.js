import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const CATEGORIES = [
  { id: 'all', label: 'All Tasks', icon: '📋' },
  { id: 'operations', label: 'Work Operations', icon: '⚙️' },
  { id: 'sales_echo', label: 'SalesEcho', icon: '📢' },
  { id: 'interview_sidekick', label: 'Interview Sidekick', icon: '🎤' },
  { id: 'cover_letter', label: 'Cover Letter Copilot', icon: '✉️' },
  { id: 'life', label: 'Life', icon: '🌟' },
  { id: 'ideas', label: 'Future Ideas', icon: '💡' },
]

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#6b7280' },
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { id: 'done', label: 'Done', color: '#22c55e' },
]

const SCHEDULES = [
  { id: '', label: 'No schedule' },
  { id: 'daily_morning', label: '🌅 Daily (Morning)' },
  { id: 'daily_evening', label: '🌙 Daily (Evening)' },
  { id: 'weekly', label: '📅 Weekly' },
  { id: 'monthly', label: '🗓️ Monthly' },
]

async function api(endpoint, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
  if (options.method === 'POST') headers['Prefer'] = 'return=representation'
  if (options.method === 'PATCH') headers['Prefer'] = 'return=representation'
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    })
    if (!res.ok) {
      console.error('API Error:', res.status)
      return null
    }
    if (options.method === 'DELETE') return { success: true }
    return res.json()
  } catch (e) {
    console.error('Fetch error:', e)
    return null
  }
}

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '', description: '', details: '', status: 'todo', priority: 'medium', category: 'life', due_date: '', schedule: ''
  })

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    setLoading(true)
    const data = await api('tasks?order=created_at.desc')
    setTasks(data || [])
    setLoading(false)
  }

  const filteredTasks = tasks.filter(t => {
    if (activeCategory === 'all') return t.category !== 'ideas'
    return t.category === activeCategory
  })

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status)

  async function updateTaskStatus(taskId, newStatus) {
    await api(`tasks?id=eq.${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() })
    })
    loadTasks()
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return
    await api(`tasks?id=eq.${id}`, { method: 'DELETE' })
    loadTasks()
  }

  function openModal(task = null) {
    if (task) {
      setEditingTask(task)
      setFormData({
        title: task.title || '',
        description: task.description || '',
        details: task.details || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category || 'life',
        due_date: task.due_date || '',
        schedule: task.schedule || ''
      })
    } else {
      setEditingTask(null)
      setFormData({ 
        title: '', description: '', details: '', status: 'todo', priority: 'medium', 
        category: activeCategory === 'all' ? 'life' : activeCategory, 
        due_date: '',
        schedule: ''
      })
    }
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { ...formData, updated_at: new Date().toISOString() }
    if (!data.description) data.description = null
    if (!data.details) data.details = null
    if (!data.due_date) data.due_date = null
    if (!data.schedule) data.schedule = null

    if (editingTask) {
      await api(`tasks?id=eq.${editingTask.id}`, { method: 'PATCH', body: JSON.stringify(data) })
    } else {
      await api('tasks', { method: 'POST', body: JSON.stringify(data) })
    }
    setShowModal(false)
    loadTasks()
  }

  const getCategoryIcon = (cat) => CATEGORIES.find(c => c.id === cat)?.icon || '📋'
  const getCategoryLabel = (cat) => CATEGORIES.find(c => c.id === cat)?.label || cat

  return (
    <>
      <Head>
        <title>Brochbot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="logo">
              <span className="logo-icon">🤖</span>
              <span className="logo-text">Brochbot</span>
            </div>
            <div className="view-toggle">
              <span className="view-btn active">Kanban</span>
              <Link href="/table" className="view-btn">Table</Link>
            </div>
          </div>
          <div className="header-right">
            <div className="status-badge">
              <span className="status-dot"></span>
              <span>Live</span>
            </div>
            <button className="btn-primary" onClick={() => openModal()}>
              + Add Task
            </button>
          </div>
        </header>

        {/* Category Tabs */}
        <div className="category-bar">
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <main className="main">
          <div className="kanban">
            {COLUMNS.map(col => (
              <div key={col.id} className="kanban-column">
                <div className="column-header">
                  <div className="column-title">
                    <span className="column-dot" style={{ background: col.color }}></span>
                    <span>{col.label}</span>
                    <span className="column-count">{getTasksByStatus(col.id).length}</span>
                  </div>
                </div>
                <div className="column-tasks">
                  {getTasksByStatus(col.id).map(task => (
                    <div key={task.id} className="task-card">
                      <div className="task-card-header">
                        <span className="task-category-icon">{getCategoryIcon(task.category)}</span>
                        <span className={`task-priority priority-${task.priority}`}>
                          {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                        </span>
                      </div>
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <div className="task-footer">
                        <span className="task-category-label">{getCategoryLabel(task.category)}</span>
                        {task.schedule && <span className="task-schedule">{SCHEDULES.find(s => s.id === task.schedule)?.label || task.schedule}</span>}
                        {task.due_date && <span className="task-due">📅 {task.due_date}</span>}
                      </div>
                      <div className="task-actions">
                        {col.id !== 'todo' && (
                          <button onClick={() => updateTaskStatus(task.id, 'todo')}>← To Do</button>
                        )}
                        {col.id !== 'in_progress' && (
                          <button onClick={() => updateTaskStatus(task.id, 'in_progress')}>🔄 Progress</button>
                        )}
                        {col.id !== 'done' && (
                          <button onClick={() => updateTaskStatus(task.id, 'done')}>✓ Done</button>
                        )}
                        <button onClick={() => openModal(task)}>✏️</button>
                        <button className="delete" onClick={() => deleteTask(task.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  {getTasksByStatus(col.id).length === 0 && (
                    <div className="empty-column">
                      {loading ? <span className="loader"></span> : 'No tasks'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingTask ? 'Edit Task' : 'Add Task'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="What needs to be done?"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief summary..."
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Details</label>
                  <textarea
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                    placeholder="Full context, steps, notes..."
                    rows={4}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option value="high">🔴 High</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="low">🟢 Low</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Schedule</label>
                    <select value={formData.schedule} onChange={e => setFormData({...formData, schedule: e.target.value})}>
                      {SCHEDULES.map(s => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
          --bg: #fafafa;
          --card: #ffffff;
          --border: #e5e7eb;
          --text: #111827;
          --text-secondary: #6b7280;
          --accent: #000000;
          --accent-light: #f3f4f6;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }
        
        .app {
          min-height: 100vh;
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        .header-left { display: flex; align-items: center; gap: 24px; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        
        .view-toggle {
          display: flex;
          gap: 4px;
          background: var(--accent-light);
          padding: 4px;
          border-radius: 8px;
        }
        
        .view-btn {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          text-decoration: none;
          color: var(--text-secondary);
          cursor: pointer;
        }
        
        .view-btn.active {
          background: var(--card);
          color: var(--text);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .view-btn:hover:not(.active) {
          color: var(--text);
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 18px;
        }
        
        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #000 0%, #333 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #ecfdf5;
          border-radius: 20px;
          font-size: 13px;
          color: #059669;
        }
        
        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .btn-primary {
          background: var(--accent);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .btn-primary:hover { 
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .btn-primary:active {
          transform: translateY(0);
        }
        
        .btn-secondary {
          background: var(--card);
          color: var(--text);
          border: 1px solid var(--border);
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        
        /* Category Bar */
        .category-bar {
          background: var(--card);
          border-bottom: 1px solid var(--border);
          padding: 0 24px;
          overflow-x: auto;
        }
        
        .category-tabs {
          display: flex;
          gap: 4px;
        }
        
        .category-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        
        .category-tab:hover {
          color: var(--text);
          background: var(--accent-light);
        }
        
        .category-tab.active {
          color: var(--text);
          border-bottom-color: var(--accent);
        }
        
        /* Main / Kanban */
        .main {
          padding: 24px;
          overflow-x: auto;
        }
        
        .kanban {
          display: grid;
          grid-template-columns: repeat(3, minmax(300px, 1fr));
          gap: 20px;
          min-height: calc(100vh - 180px);
        }
        
        .kanban-column {
          background: var(--accent-light);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
        }
        
        .column-header {
          margin-bottom: 16px;
        }
        
        .column-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }
        
        .column-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .column-count {
          background: var(--card);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
        }
        
        .column-tasks {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .task-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px;
          cursor: default;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          animation: cardIn 0.3s ease;
        }
        
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .task-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        
        .task-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .task-category-icon {
          font-size: 16px;
        }
        
        .task-priority {
          font-size: 12px;
        }
        
        .task-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
          line-height: 1.4;
        }
        
        .task-description {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }
        
        .task-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        
        .task-category-label {
          background: var(--accent-light);
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .task-schedule {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
        }
        
        .task-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }
        
        .task-actions button {
          background: var(--accent-light);
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .task-actions button:hover {
          background: var(--border);
        }
        
        .task-actions button.delete:hover {
          background: #fef2f2;
          color: #dc2626;
        }
        
        .empty-column {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .loader {
          width: 20px;
          height: 20px;
          border: 2px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 20px;
          animation: fadeIn 0.2s ease forwards;
        }
        
        @keyframes fadeIn {
          to { background: rgba(0,0,0,0.5); }
        }
        
        .modal {
          background: var(--card);
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 24px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        .modal-header h2 {
          font-size: 20px;
          font-weight: 600;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          color: var(--text-secondary);
          cursor: pointer;
          line-height: 1;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          background: var(--card);
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        
        .form-group textarea {
          resize: vertical;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 24px;
        }
        
        /* Tablet */
        @media (max-width: 1100px) {
          .kanban {
            grid-template-columns: repeat(3, minmax(250px, 1fr));
            gap: 12px;
          }
        }
        
        /* Mobile */
        @media (max-width: 900px) {
          .kanban {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .kanban-column {
            min-height: auto;
            padding: 12px;
          }
          
          .header {
            padding: 12px 16px;
          }
          
          .header-right {
            gap: 10px;
          }
          
          .status-badge {
            display: none;
          }
          
          .main {
            padding: 16px;
          }
          
          .category-bar {
            padding: 0 16px;
          }
          
          .category-tab {
            padding: 12px 12px;
            font-size: 13px;
          }
          
          .category-tab span:last-child {
            display: none;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .logo-text {
            display: none;
          }
          
          .task-card {
            padding: 14px;
          }
          
          .task-actions {
            flex-wrap: wrap;
          }
          
          .task-actions button {
            flex: 1;
            min-width: 60px;
            justify-content: center;
          }
          
          .modal {
            margin: 16px;
            max-height: calc(100vh - 32px);
          }
        }
        
        /* Small mobile */
        @media (max-width: 400px) {
          .btn-primary {
            padding: 10px 14px;
            font-size: 13px;
          }
          
          .category-tab {
            padding: 10px 8px;
          }
        }
      `}</style>
    </>
  )
}

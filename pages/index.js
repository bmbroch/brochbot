import { useState, useEffect } from 'react'
import Head from 'next/head'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

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

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [expandedTask, setExpandedTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '', description: '', details: '', status: 'todo', priority: 'medium', category: '', due_date: ''
  })

  useEffect(() => { loadTasks() }, [])

  async function loadTasks() {
    const data = await api('tasks?order=created_at.desc')
    setTasks(data || [])
  }

  const filteredTasks = tasks.filter(t => {
    if (filter === 'all') return true
    if (filter === 'high') return t.priority === 'high'
    return t.status === filter
  })

  const counts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length
  }

  async function toggleDone(task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await api(`tasks?id=eq.${task.id}`, {
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
        category: task.category || '',
        due_date: task.due_date || ''
      })
    } else {
      setEditingTask(null)
      setFormData({ title: '', description: '', details: '', status: 'todo', priority: 'medium', category: '', due_date: '' })
    }
    setShowModal(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const data = { ...formData, updated_at: new Date().toISOString() }
    if (!data.description) data.description = null
    if (!data.details) data.details = null
    if (!data.category) data.category = null
    if (!data.due_date) data.due_date = null

    if (editingTask) {
      await api(`tasks?id=eq.${editingTask.id}`, { method: 'PATCH', body: JSON.stringify(data) })
    } else {
      await api('tasks', { method: 'POST', body: JSON.stringify(data) })
    }
    setShowModal(false)
    loadTasks()
  }

  const formatStatus = s => ({ todo: 'To Do', in_progress: 'In Progress', done: 'Done' }[s] || s)
  const formatCategory = c => ({
    interview_sidekick: '🎤 Interview Sidekick',
    sales_echo: '📢 Sales Echo', 
    cover_letter: '✉️ Cover Letter Copilot',
    brochbot: '🤖 Brochbot',
    automation: '⚡ Automation'
  }[c] || c)

  return (
    <>
      <Head>
        <title>Brochbot - Task Tracker</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="logo">
            <span className="logo-icon">🤖</span>
            <span>Brochbot</span>
          </div>
          <button className="btn-primary" onClick={() => openModal()}>+ Add Task</button>
        </header>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{counts.todo}</div>
            <div className="stat-label">To Do</div>
          </div>
          <div className="stat-card">
            <div className="stat-value blue">{counts.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-value green">{counts.done}</div>
            <div className="stat-label">Done</div>
          </div>
        </div>

        <div className="filters">
          {['all', 'todo', 'in_progress', 'done', 'high'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'high' ? '🔴 High Priority' : f === 'all' ? 'All' : formatStatus(f)}
            </button>
          ))}
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks yet</h3>
              <p>Add your first task to get started!</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className={`task-item ${task.status === 'done' ? 'done' : ''} ${expandedTask === task.id ? 'expanded' : ''}`}>
                <div className="task-header" onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}>
                  <div 
                    className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleDone(task) }}
                  />
                  <div className="task-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                      <span className={`badge badge-${task.status?.replace('_', '')}`}>{formatStatus(task.status)}</span>
                      {task.category && <span>{formatCategory(task.category)}</span>}
                      {task.due_date && <span>📅 {task.due_date}</span>}
                    </div>
                  </div>
                  <span className="task-expand">▼</span>
                </div>
                {expandedTask === task.id && (
                  <div className="task-details">
                    {task.description && (
                      <div className="detail-section">
                        <div className="detail-label">Description</div>
                        <div className="detail-content">{task.description}</div>
                      </div>
                    )}
                    {task.details && (
                      <div className="detail-section">
                        <div className="detail-label">Details</div>
                        <div className="detail-content">{task.details}</div>
                      </div>
                    )}
                    {!task.description && !task.details && (
                      <div className="detail-section">
                        <div className="detail-content muted">No details added yet. Click Edit to add more information.</div>
                      </div>
                    )}
                    <div className="detail-actions">
                      <button className="btn-secondary" onClick={() => openModal(task)}>✏️ Edit</button>
                      <button className="btn-danger" onClick={() => deleteTask(task.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Add Task'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="What needs to be done?" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief summary..." />
              </div>
              <div className="form-group">
                <label>Details</label>
                <textarea className="tall" value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} placeholder="Full details, steps, notes, context..." />
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
                  <label>Priority</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="">None</option>
                    <option value="interview_sidekick">Interview Sidekick</option>
                    <option value="sales_echo">Sales Echo</option>
                    <option value="cover_letter">Cover Letter Copilot</option>
                    <option value="brochbot">Brochbot</option>
                    <option value="automation">Automation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">Save Task</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

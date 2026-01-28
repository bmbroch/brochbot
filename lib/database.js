// Simple file-based database for Vercel
// In production, you'd use a real database like Postgres/MongoDB

import fs from 'fs/promises'
import path from 'path'

const DB_FILE = path.join(process.cwd(), 'data', 'tasks.json')

// Default data structure
const defaultData = {
  priorityTasks: {
    P0: [],
    P1: [],
    P2: []
  },
  businessTasks: {
    'Interview Sidekick': {
      daily: [],
      weekly: [],
      projects: []
    },
    'Sales Echo': {
      daily: [],
      weekly: [],
      projects: []
    },
    'Cover Letter Copilot': {
      daily: [],
      weekly: [],
      projects: []
    }
  },
  completed: [],
  nextId: 1
}

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  try {
    await fs.mkdir(dataDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }
}

// Read database
export async function readDB() {
  await ensureDataDir()
  try {
    const data = await fs.readFile(DB_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist, return default
    await writeDB(defaultData)
    return defaultData
  }
}

// Write database
export async function writeDB(data) {
  await ensureDataDir()
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2))
  return data
}

// Get all tasks
export async function getTasks() {
  return await readDB()
}

// Add a new priority task
export async function addPriorityTask(priority, task) {
  const db = await readDB()
  const newTask = {
    id: db.nextId++,
    ...task,
    createdAt: new Date().toISOString(),
    status: task.status || 'todo'
  }
  
  if (!db.priorityTasks[priority]) {
    db.priorityTasks[priority] = []
  }
  
  db.priorityTasks[priority].push(newTask)
  await writeDB(db)
  return newTask
}

// Update a priority task
export async function updatePriorityTask(id, updates) {
  const db = await readDB()
  
  for (const priority in db.priorityTasks) {
    const taskIndex = db.priorityTasks[priority].findIndex(t => t.id === id)
    if (taskIndex !== -1) {
      db.priorityTasks[priority][taskIndex] = {
        ...db.priorityTasks[priority][taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await writeDB(db)
      return db.priorityTasks[priority][taskIndex]
    }
  }
  
  throw new Error('Task not found')
}

// Move task to different priority
export async function moveTaskPriority(taskId, fromPriority, toPriority) {
  const db = await readDB()
  
  const taskIndex = db.priorityTasks[fromPriority].findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    throw new Error('Task not found')
  }
  
  const [task] = db.priorityTasks[fromPriority].splice(taskIndex, 1)
  db.priorityTasks[toPriority].push(task)
  
  await writeDB(db)
  return task
}

// Complete a task
export async function completeTask(taskId, priority) {
  const db = await readDB()
  
  const taskIndex = db.priorityTasks[priority].findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    throw new Error('Task not found')
  }
  
  const [task] = db.priorityTasks[priority].splice(taskIndex, 1)
  task.completedAt = new Date().toISOString()
  task.date = new Date().toISOString().split('T')[0]
  
  db.completed.unshift(task)
  
  await writeDB(db)
  return task
}

// Add business task
export async function addBusinessTask(business, type, task) {
  const db = await readDB()
  
  if (!db.businessTasks[business]) {
    db.businessTasks[business] = { daily: [], weekly: [], projects: [] }
  }
  
  if (!db.businessTasks[business][type]) {
    db.businessTasks[business][type] = []
  }
  
  db.businessTasks[business][type].push(task)
  
  await writeDB(db)
  return task
}

// Delete business task
export async function deleteBusinessTask(business, type, taskIndex) {
  const db = await readDB()
  
  if (db.businessTasks[business] && db.businessTasks[business][type]) {
    db.businessTasks[business][type].splice(taskIndex, 1)
    await writeDB(db)
    return true
  }
  
  return false
}
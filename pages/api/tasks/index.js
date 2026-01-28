import { getTasks, addPriorityTask, addBusinessTask } from '../../../lib/database'

export default async function handler(req, res) {
  const { method } = req

  try {
    switch (method) {
      case 'GET':
        // Get all tasks
        const tasks = await getTasks()
        res.status(200).json(tasks)
        break

      case 'POST':
        // Add new task
        const { type, priority, business, taskType, task } = req.body
        
        if (type === 'priority') {
          const newTask = await addPriorityTask(priority, task)
          res.status(201).json(newTask)
        } else if (type === 'business') {
          const newTask = await addBusinessTask(business, taskType, task)
          res.status(201).json(newTask)
        } else {
          res.status(400).json({ error: 'Invalid task type' })
        }
        break

      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
}
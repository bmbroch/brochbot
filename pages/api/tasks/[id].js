import { updatePriorityTask, moveTaskPriority, completeTask, deleteBusinessTask } from '../../../lib/database'

export default async function handler(req, res) {
  const { method } = req
  const { id } = req.query

  try {
    switch (method) {
      case 'PUT':
        // Update task
        const { updates } = req.body
        const updated = await updatePriorityTask(parseInt(id), updates)
        res.status(200).json(updated)
        break

      case 'POST':
        // Special actions (move, complete)
        const { action, ...params } = req.body
        
        if (action === 'move') {
          const moved = await moveTaskPriority(parseInt(id), params.fromPriority, params.toPriority)
          res.status(200).json(moved)
        } else if (action === 'complete') {
          const completed = await completeTask(parseInt(id), params.priority)
          res.status(200).json(completed)
        } else {
          res.status(400).json({ error: 'Invalid action' })
        }
        break

      case 'DELETE':
        // Delete business task
        const { business, type, index } = req.query
        if (business && type && index !== undefined) {
          await deleteBusinessTask(business, type, parseInt(index))
          res.status(204).end()
        } else {
          res.status(400).json({ error: 'Missing parameters' })
        }
        break

      default:
        res.setHeader('Allow', ['PUT', 'POST', 'DELETE'])
        res.status(405).end(`Method ${method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
}
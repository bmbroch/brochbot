// API route for task management
export default function handler(req, res) {
  const tasks = {
    todo: [
      { id: 2, title: "Create UGC creator payment tracker", product: "Automation" },
      { id: 3, title: "Connect DataFast analytics", product: "Automation" }
    ],
    inProgress: [
      { id: 1, title: "Build competitor monitoring", product: "Priority" }
    ],
    done: [
      { id: 'done-1', title: "Morning briefing setup", product: "System" },
      { id: 'done-2', title: "Dashboard creation", product: "System" }
    ]
  }
  
  res.status(200).json(tasks)
}
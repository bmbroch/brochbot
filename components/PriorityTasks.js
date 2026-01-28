export default function PriorityTasks({ tasks }) {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'P0': return '#ff4757' // Red - Critical
      case 'P1': return '#ffb800' // Amber - Important  
      case 'P2': return '#3b82f6' // Blue - Normal
      default: return '#6b7280'
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'in-progress':
        return <span className="status-badge progress">🚧 In Progress</span>
      case 'blocked':
        return <span className="status-badge blocked">⏸️ Blocked</span>
      case 'todo':
        return <span className="status-badge todo">📥 To Do</span>
      default:
        return null
    }
  }

  return (
    <section className="priority-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span>🎯</span>
            <span>Brochbot Priority Tasks</span>
          </h2>
          <p className="section-subtitle">Main assignments organized by priority</p>
        </div>

        <div className="priority-grid">
          {Object.entries(tasks).map(([priority, taskList]) => (
            <div key={priority} className="priority-column">
              <div className="priority-header" style={{ borderColor: getPriorityColor(priority) }}>
                <div className="priority-title">
                  <span className="priority-badge" style={{ background: getPriorityColor(priority) }}>
                    {priority}
                  </span>
                  <span className="priority-label">
                    {priority === 'P0' && 'Critical - Do Now'}
                    {priority === 'P1' && 'Important - Do Soon'}
                    {priority === 'P2' && 'Normal - Do Later'}
                  </span>
                </div>
                <span className="priority-count">{taskList.length}</span>
              </div>

              <div className="priority-tasks">
                {taskList.length === 0 ? (
                  <div className="empty-state">No {priority} tasks</div>
                ) : (
                  taskList.map(task => (
                    <div key={task.id} className="priority-task">
                      <div className="task-header">
                        <span className="task-id">#{task.id}</span>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="task-title">{task.title}</div>
                      {task.description && (
                        <div className="task-description">{task.description}</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="priority-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ff4757' }}></span>
            <span>P0 = Drop everything else</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#ffb800' }}></span>
            <span>P1 = Important but not urgent</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
            <span>P2 = Nice to have</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .priority-section {
          padding: 48px 0;
          background: var(--bg-primary);
        }

        .section-subtitle {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 14px;
        }

        .priority-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .priority-column {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }

        .priority-header {
          padding: 16px 20px;
          border-bottom: 3px solid;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .priority-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .priority-badge {
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 14px;
        }

        .priority-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .priority-count {
          background: var(--bg-accent);
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 600;
        }

        .priority-tasks {
          padding: 16px;
        }

        .priority-task {
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s;
        }

        .priority-task:last-child {
          margin-bottom: 0;
        }

        .priority-task:hover {
          transform: translateX(4px);
          box-shadow: var(--shadow);
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .task-id {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .task-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
        }

        .task-description {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 8px;
          line-height: 1.5;
        }

        .status-badge {
          font-size: 12px;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 600;
        }

        .status-badge.progress {
          background: rgba(255, 184, 0, 0.1);
          color: #f59e0b;
        }

        .status-badge.blocked {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .status-badge.todo {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .priority-legend {
          display: flex;
          gap: 24px;
          justify-content: center;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        @media (max-width: 1024px) {
          .priority-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
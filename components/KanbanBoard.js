export default function KanbanBoard({ tasks }) {
  return (
    <section className="kanban-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span>📋</span>
            <span>Task Board</span>
          </h2>
        </div>
        
        <div className="kanban-board">
          {/* To Do Column */}
          <div className="kanban-column">
            <div className="kanban-header todo">
              <div className="kanban-title">
                <span>📥</span>
                <span>To Do</span>
              </div>
              <span className="kanban-count">{tasks.todo.length}</span>
            </div>
            
            <div className="kanban-tasks">
              {tasks.todo.map(task => (
                <div key={task.id} className="kanban-task">
                  <div className="kanban-task-title">{task.title}</div>
                  <div className="kanban-task-meta">
                    <span className="kanban-task-product">🤖 {task.product}</span>
                    <span className="kanban-task-id">#{task.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className="kanban-column">
            <div className="kanban-header progress">
              <div className="kanban-title">
                <span>🚧</span>
                <span>In Progress</span>
              </div>
              <span className="kanban-count">{tasks.inProgress.length}</span>
            </div>
            
            <div className="kanban-tasks">
              {tasks.inProgress.map(task => (
                <div key={task.id} className="kanban-task">
                  <div className="kanban-task-title">{task.title}</div>
                  <div className="kanban-task-meta">
                    <span className="kanban-task-product">🎯 {task.product}</span>
                    <span className="kanban-task-id">#{task.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Done Column */}
          <div className="kanban-column">
            <div className="kanban-header done">
              <div className="kanban-title">
                <span>✅</span>
                <span>Done</span>
              </div>
              <span className="kanban-count">{tasks.done.length}</span>
            </div>
            
            <div className="kanban-tasks">
              {tasks.done.map(task => (
                <div key={task.id} className="kanban-task">
                  <div className="kanban-task-title">{task.title}</div>
                  <div className="kanban-task-meta">
                    <span className="kanban-task-product">🤖 {task.product}</span>
                    <span className="kanban-task-id">✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
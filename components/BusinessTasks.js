import { InterviewSidekickLogo, SalesEchoLogo, CoverLetterLogo } from './ProductLogos'

export default function BusinessTasks({ businesses }) {
  const getLogoComponent = (businessName) => {
    switch(businessName) {
      case 'Interview Sidekick':
        return <InterviewSidekickLogo size={32} />
      case 'Sales Echo':
        return <SalesEchoLogo size={32} />
      case 'Cover Letter Copilot':
        return <CoverLetterLogo size={32} />
      default:
        return null
    }
  }

  return (
    <section className="business-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span>🏢</span>
            <span>Ongoing Business Tasks</span>
          </h2>
          <p className="section-subtitle">Recurring work for each of your businesses</p>
        </div>

        <div className="business-grid">
          {Object.entries(businesses).map(([businessName, tasks]) => (
            <div key={businessName} className="business-card">
              <div className="business-header">
                {getLogoComponent(businessName)}
                <h3 className="business-name">{businessName}</h3>
              </div>

              {/* Daily Tasks */}
              {tasks.daily.length > 0 && (
                <div className="task-section">
                  <div className="task-section-header">
                    <span className="task-section-icon">📅</span>
                    <h4 className="task-section-title">Daily</h4>
                    <span className="task-section-count">{tasks.daily.length}</span>
                  </div>
                  <ul className="task-list">
                    {tasks.daily.map((task, index) => (
                      <li key={index} className="task-item">
                        <span className="task-bullet">•</span>
                        <span className="task-text">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Tasks */}
              {tasks.weekly.length > 0 && (
                <div className="task-section">
                  <div className="task-section-header">
                    <span className="task-section-icon">📊</span>
                    <h4 className="task-section-title">Weekly</h4>
                    <span className="task-section-count">{tasks.weekly.length}</span>
                  </div>
                  <ul className="task-list">
                    {tasks.weekly.map((task, index) => (
                      <li key={index} className="task-item">
                        <span className="task-bullet">•</span>
                        <span className="task-text">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Active Projects */}
              {tasks.projects && tasks.projects.length > 0 && (
                <div className="task-section">
                  <div className="task-section-header">
                    <span className="task-section-icon">🚀</span>
                    <h4 className="task-section-title">Projects</h4>
                    <span className="task-section-count">{tasks.projects.length}</span>
                  </div>
                  <ul className="task-list">
                    {tasks.projects.map((project, index) => (
                      <li key={index} className="task-item">
                        <span className="task-bullet">•</span>
                        <span className="task-text">{project}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Empty state if no projects */}
              {tasks.projects && tasks.projects.length === 0 && (
                <div className="empty-projects">
                  <span className="empty-text">No active projects</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .business-section {
          padding: 48px 0;
          background: var(--bg-secondary);
        }

        .section-subtitle {
          color: var(--text-secondary);
          margin-top: 8px;
          font-size: 14px;
        }

        .business-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 32px;
        }

        .business-card {
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 24px;
          transition: all 0.3s;
        }

        .business-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }

        .business-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid var(--border);
        }

        .business-name {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .task-section {
          margin-bottom: 20px;
        }

        .task-section:last-child {
          margin-bottom: 0;
        }

        .task-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .task-section-icon {
          font-size: 16px;
        }

        .task-section-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .task-section-count {
          background: var(--bg-accent);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .task-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px 12px;
          margin-bottom: 4px;
          background: var(--bg-secondary);
          border-radius: 6px;
          font-size: 14px;
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .task-item:hover {
          background: var(--bg-accent);
          transform: translateX(4px);
        }

        .task-item:last-child {
          margin-bottom: 0;
        }

        .task-bullet {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .task-text {
          line-height: 1.4;
        }

        .empty-projects {
          padding: 12px;
          background: var(--bg-secondary);
          border-radius: 6px;
          text-align: center;
        }

        .empty-text {
          color: var(--text-muted);
          font-size: 13px;
          font-style: italic;
        }

        @media (max-width: 1024px) {
          .business-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}
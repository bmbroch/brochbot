export default function StatsGrid({ stats }) {
  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
            <span className="stat-change">↑ Active development</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🚧</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
            <span className="stat-change">Competitor monitoring</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-label">Completed</div>
            <span className="stat-change">↑ Dashboard & briefing</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-value">{stats.progress}%</div>
            <div className="stat-label">Progress Rate</div>
            <span className="stat-change">↑ Accelerating</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">3</div>
            <div className="stat-label">Priority Competitors</div>
            <span className="stat-change">FinalRound, Parakeet, LockedIn</span>
          </div>
        </div>
      </div>
    </section>
  )
}
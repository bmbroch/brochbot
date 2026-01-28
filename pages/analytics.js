import Head from 'next/head'
import Header from '../components/Header'

export default function Analytics() {
  return (
    <div>
      <Head>
        <title>Analytics - Brochbot</title>
      </Head>
      
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Analytics Dashboard</h2>
          </div>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <div className="stat-value">--</div>
              <div className="stat-label">Daily Visitors</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-value">--</div>
              <div className="stat-label">Conversions</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-value">--</div>
              <div className="stat-label">Revenue</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-value">--</div>
              <div className="stat-label">Growth Rate</div>
            </div>
          </div>
          
          <div className="empty-state" style={{marginTop: '40px'}}>
            <div className="empty-text">
              DataFast analytics integration coming soon...<br/>
              Will connect once API key is provided.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
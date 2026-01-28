import Head from 'next/head'
import Header from '../components/Header'

export default function Competitors() {
  const competitors = {
    'Interview Sidekick': ['FinalRound AI', 'Parakeet AI', 'LockedIn AI'],
    'Sales Echo': ['Gong.io', 'Chorus.ai', 'Wingman.io'],
    'Cover Letter Copilot': ['Rezi.ai', 'Resumeworded.com', 'Kickresume.com']
  }

  return (
    <div>
      <Head>
        <title>Competitors - Brochbot</title>
      </Head>
      
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Competitor Monitoring</h2>
          </div>
          
          <div className="products-grid">
            {Object.entries(competitors).map(([product, competitorList]) => (
              <div key={product} className="product-card">
                <div className="product-header">
                  <h3 className="product-name">{product} Competitors</h3>
                </div>
                <div className="task-list">
                  {competitorList.map(competitor => (
                    <div key={competitor} className="task-item">
                      <span className="task-status-indicator todo"></span>
                      <span>{competitor}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="empty-state" style={{marginTop: '40px'}}>
            <div className="empty-text">
              Automated competitor monitoring starting soon...<br/>
              Will track pricing changes, new features, and UI updates daily.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
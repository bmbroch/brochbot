import Head from 'next/head'
import Header from '../components/Header'

export default function Tasks() {
  return (
    <div>
      <Head>
        <title>Tasks - Brochbot</title>
      </Head>
      
      <Header />
      
      <main className="main-content">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Task Management</h2>
          </div>
          
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">Task management interface coming soon...</div>
          </div>
        </div>
      </main>
    </div>
  )
}
import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import PriorityTasks from '../components/PriorityTasks'
import BusinessTasks from '../components/BusinessTasks'

export default function Home() {
  // Main priority tasks for Brochbot
  const [priorityTasks, setPriorityTasks] = useState({
    P0: [
      { 
        id: 1, 
        title: "Monitor FinalRound AI, Parakeet AI, LockedIn AI daily", 
        status: "in-progress",
        description: "Check pricing, features, and updates every morning"
      }
    ],
    P1: [
      { 
        id: 2, 
        title: "Build UGC creator tracker for Nick's Google Sheet", 
        status: "todo",
        description: "Auto-update views from TikTok/Instagram, calculate payments"
      },
      { 
        id: 3, 
        title: "Set up DataFast analytics integration", 
        status: "blocked",
        description: "Waiting for API key from Ben"
      }
    ],
    P2: [
      { 
        id: 4, 
        title: "Expand competitor monitoring to more companies", 
        status: "todo",
        description: "Add Gong, Chorus for Sales Echo competitors"
      },
      { 
        id: 5, 
        title: "Create weekly performance reports", 
        status: "todo",
        description: "Automated summaries of all business metrics"
      }
    ]
  })

  // Ongoing tasks for each business
  const [businessTasks, setBusinessTasks] = useState({
    'Interview Sidekick': {
      daily: [
        "Check FinalRound AI for new features",
        "Monitor Parakeet AI pricing",
        "Track LockedIn AI updates"
      ],
      weekly: [
        "Competitor feature comparison",
        "Pricing analysis report"
      ],
      projects: []
    },
    'Sales Echo': {
      daily: [
        "Check Gong.io updates",
        "Monitor Chorus.ai features"
      ],
      weekly: [
        "Competitor analysis",
        "Market positioning review"
      ],
      projects: []
    },
    'Cover Letter Copilot': {
      daily: [
        "Monitor Rezi.ai changes",
        "Check Resumeworded updates"
      ],
      weekly: [
        "Template performance analysis",
        "Competitor feature tracking"
      ],
      projects: []
    }
  })

  const completedTasks = [
    { id: 'c1', title: "Set up morning briefing at 7 AM Cape Town", date: "2026-01-28" },
    { id: 'c2', title: "Create Brochbot dashboard", date: "2026-01-28" }
  ]

  return (
    <div>
      <Head>
        <title>Brochbot - Priority Dashboard</title>
        <meta name="description" content="Priority-based task management for Ben's businesses" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />
      
      <main>
        {/* Quick Stats Bar */}
        <div className="stats-bar">
          <div className="container">
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">1</span>
                <span className="stat-label">P0 Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2</span>
                <span className="stat-label">P1 Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">2</span>
                <span className="stat-label">P2 Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">3</span>
                <span className="stat-label">Businesses</span>
              </div>
              <div className="stat-item success">
                <span className="stat-value">2</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Priority Tasks */}
        <PriorityTasks tasks={priorityTasks} />
        
        {/* Business-Specific Ongoing Tasks */}
        <BusinessTasks businesses={businessTasks} />

        {/* Completed Section */}
        <section className="completed-section">
          <div className="container">
            <h2 className="section-title">
              <span>✅</span>
              <span>Recently Completed</span>
            </h2>
            <div className="completed-list">
              {completedTasks.map(task => (
                <div key={task.id} className="completed-item">
                  <span className="check-icon">✓</span>
                  <span className="task-title">{task.title}</span>
                  <span className="task-date">{task.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
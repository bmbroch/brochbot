import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import StatsGrid from '../components/StatsGrid'
import ProductCards from '../components/ProductCards'
import KanbanBoard from '../components/KanbanBoard'

export default function Home() {
  const [tasks, setTasks] = useState({
    todo: [
      { id: 2, title: "Create UGC creator payment tracker integrated with Nick's Google Sheet", product: "Automation" },
      { id: 3, title: "Connect DataFast analytics for daily traffic reports", product: "Automation" }
    ],
    inProgress: [
      { id: 1, title: "Build competitor monitoring for FinalRound AI, Parakeet AI, and LockedIn AI", product: "Priority" }
    ],
    done: [
      { id: 'done-1', title: "Set up morning briefing at 7 AM Cape Town time", product: "System" },
      { id: 'done-2', title: "Create Brochbot dashboard", product: "System" }
    ]
  })

  const stats = {
    total: 5,
    todo: 2,
    inProgress: 1,
    done: 2,
    progress: 40
  }

  return (
    <div>
      <Head>
        <title>Brochbot Dashboard</title>
        <meta name="description" content="AI Development Dashboard" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header />
      
      <main>
        <StatsGrid stats={stats} />
        <ProductCards />
        <KanbanBoard tasks={tasks} />
      </main>
    </div>
  )
}
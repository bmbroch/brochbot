import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const PAYOUT_TIERS = [
  { min: 0, max: 9999, payout: 25, label: '$25' },
  { min: 10000, max: 29999, payout: 40, label: '$40' },
  { min: 30000, max: 49999, payout: 60, label: '$60' },
  { min: 50000, max: 99999, payout: 120, label: '$120' },
  { min: 100000, max: 249999, payout: 225, label: '$225' },
  { min: 250000, max: 499999, payout: 300, label: '$300' },
  { min: 500000, max: 999999, payout: 400, label: '$400' },
  { min: 1000000, max: Infinity, payout: 650, label: '$650' },
]

function getPayout(views) {
  const tier = PAYOUT_TIERS.find(t => views >= t.min && views <= t.max)
  return tier ? tier.payout : 0
}

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n?.toString() || '0'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function api(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  })
  return res.json()
}

export default function Creators() {
  const router = useRouter()
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCreator, setSelectedCreator] = useState(null)

  useEffect(() => {
    Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*&order=post_date.desc'),
      api('creator_payouts?select=*'),
    ]).then(([c, p, pay]) => {
      setCreators(c || [])
      setPosts(p || [])
      setPayouts(pay || [])
      setLoading(false)
    })
  }, [])

  // Calculate data per creator
  const creatorData = creators.map(c => {
    const creatorPosts = posts.filter(p => p.creator_id === c.id)
    const creatorPayouts = payouts.filter(p => p.creator_id === c.id)
    
    const totalOwed = creatorPosts.reduce((s, p) => {
      const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return s + getPayout(bestViews)
    }, 0)
    
    const totalPaid = creatorPayouts.reduce((s, p) => s + Number(p.amount_paid || 0), 0)
    const balance = totalOwed - totalPaid
    const lastPost = creatorPosts[0]?.post_date
    const totalViews = creatorPosts.reduce((s, p) => s + Math.max(p.tiktok_views || 0, p.instagram_views || 0), 0)
    
    return {
      ...c,
      postCount: creatorPosts.length,
      totalOwed,
      totalPaid,
      balance,
      lastPost,
      totalViews,
      posts: creatorPosts,
    }
  })

  const grandTotal = {
    owed: creatorData.reduce((s, c) => s + c.totalOwed, 0),
    paid: creatorData.reduce((s, c) => s + c.totalPaid, 0),
    posts: creatorData.reduce((s, c) => s + c.postCount, 0),
  }
  grandTotal.balance = grandTotal.owed - grandTotal.paid

  const selected = selectedCreator ? creatorData.find(c => c.id === selectedCreator) : null

  return (
    <>
      <Head>
        <title>Creators | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {/* Header */}
        <header className="header">
          <Link href="/" className="logo">
            <span className="logo-icon">🤖</span>
            <span className="logo-text">BrochBot</span>
          </Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Dashboard</Link>
            <Link href="/support" className="nav-link">Support</Link>
            <Link href="/creators" className="nav-link active">Creators</Link>
            <Link href="/creation" className="nav-link">Creation</Link>
          </nav>
        </header>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="layout">
            {/* Left: Creator List */}
            <div className="creator-list">
              <h1>💰 Creators</h1>
              
              {/* Summary Card */}
              <div className="summary-card">
                <div className="summary-row">
                  <div className="summary-item">
                    <div className="summary-label">Total Owed</div>
                    <div className="summary-value">${grandTotal.owed.toLocaleString()}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Total Paid</div>
                    <div className="summary-value paid">${grandTotal.paid.toLocaleString()}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Balance</div>
                    <div className="summary-value balance">${grandTotal.balance.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Creator Cards */}
              <div className="creators">
                {creatorData.map(c => (
                  <button
                    key={c.id}
                    className={`creator-card ${selectedCreator === c.id ? 'selected' : ''}`}
                    onClick={() => setSelectedCreator(selectedCreator === c.id ? null : c.id)}
                  >
                    <div className="creator-header">
                      <div className="creator-name">{c.name}</div>
                      <div className={`creator-balance ${c.balance > 0 ? 'due' : 'clear'}`}>
                        ${c.balance.toLocaleString()}
                      </div>
                    </div>
                    <div className="creator-meta">
                      <span className="meta-item">📹 {c.postCount} posts</span>
                      <span className="meta-item">👁 {formatNumber(c.totalViews)}</span>
                      <span className="meta-item">📅 {formatDate(c.lastPost)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Detail Panel */}
            <div className="detail-panel">
              {selected ? (
                <>
                  <div className="detail-header">
                    <h2>{selected.name}</h2>
                    {selected.tiktok_handle && <div className="handle">@{selected.tiktok_handle}</div>}
                  </div>

                  {/* Stats */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-label">Posts</div>
                      <div className="stat-value">{selected.postCount}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Views</div>
                      <div className="stat-value">{formatNumber(selected.totalViews)}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Owed</div>
                      <div className="stat-value">${selected.totalOwed}</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-label">Paid</div>
                      <div className="stat-value paid">${selected.totalPaid}</div>
                    </div>
                  </div>

                  {/* Balance Banner */}
                  <div className={`balance-banner ${selected.balance > 0 ? 'due' : 'clear'}`}>
                    <span>Balance Due</span>
                    <span className="balance-amount">${selected.balance.toLocaleString()}</span>
                  </div>

                  {/* Recent Posts */}
                  <div className="posts-section">
                    <h3>Recent Posts</h3>
                    <div className="posts-list">
                      {selected.posts.slice(0, 10).map(p => {
                        const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                        const payout = getPayout(views)
                        return (
                          <div key={p.id} className="post-row">
                            <span className="post-date">{formatDate(p.post_date)}</span>
                            <span className="post-views">{formatNumber(views)} views</span>
                            <span className="post-payout">${payout}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-selection">
                  <div className="no-selection-icon">👈</div>
                  <div className="no-selection-text">Select a creator to view details</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #FAFAFA;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Header */
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #F5F5F5;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .logo-icon { font-size: 28px; }
        .logo-text { font-size: 20px; font-weight: 700; color: #000; }

        .nav {
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }

        .nav-link {
          padding: 10px 16px;
          border-radius: 12px;
          color: #6B7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          min-height: 44px;
          display: flex;
          align-items: center;
        }

        .nav-link:hover { color: #000; background: #F5F5F5; }
        .nav-link.active { color: #000; background: #F5F5F5; font-weight: 600; }

        /* Layout */
        .layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .layout {
            display: grid;
            grid-template-columns: 1fr 400px;
          }
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #6B7280;
        }

        /* Creator List */
        .creator-list h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 20px 0;
        }

        .summary-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .summary-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .summary-item { flex: 1; min-width: 80px; text-align: center; }
        .summary-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
        .summary-value { font-size: 20px; font-weight: 700; }
        .summary-value.paid { color: #16a34a; }
        .summary-value.balance { color: #ca8a04; }

        .creators {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .creator-card {
          background: white;
          border: 2px solid #F5F5F5;
          border-radius: 16px;
          padding: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 200ms;
          width: 100%;
        }

        .creator-card:hover {
          border-color: #D1D5DB;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .creator-card.selected {
          border-color: #000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .creator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .creator-name { font-size: 18px; font-weight: 600; }
        
        .creator-balance {
          font-size: 16px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 8px;
        }
        .creator-balance.due { background: #fefce8; color: #ca8a04; }
        .creator-balance.clear { background: #dcfce7; color: #16a34a; }

        .creator-meta {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .meta-item { font-size: 13px; color: #6B7280; }

        /* Detail Panel */
        .detail-panel {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .detail-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .handle { font-size: 14px; color: #6B7280; margin-bottom: 20px; }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }

        .stat-card {
          background: #FAFAFA;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .stat-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
        .stat-value { font-size: 20px; font-weight: 700; }
        .stat-value.paid { color: #16a34a; }

        .balance-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-radius: 12px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .balance-banner.due { background: #fefce8; color: #ca8a04; }
        .balance-banner.clear { background: #dcfce7; color: #16a34a; }
        .balance-amount { font-size: 24px; font-weight: 700; }

        .posts-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          margin: 0 0 12px 0;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
        }

        .post-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #F5F5F5;
          font-size: 14px;
        }

        .post-date { width: 70px; color: #6B7280; }
        .post-views { flex: 1; }
        .post-payout { font-weight: 600; color: #16a34a; }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .no-selection-icon { font-size: 48px; margin-bottom: 16px; }
        .no-selection-text { color: #6B7280; font-size: 16px; }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          .header { padding: 12px 16px; }
          .layout { padding: 16px; }
          .detail-panel { position: static; }
          .nav-link { padding: 8px 12px; font-size: 13px; }
        }
      `}</style>
    </>
  )
}

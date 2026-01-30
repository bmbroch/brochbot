import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'

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
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  async function loadData() {
    const [c, p, pay] = await Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*&order=post_date.desc'),
      api('creator_payouts?select=*'),
    ])
    setCreators(c || [])
    setPosts(p || [])
    setPayouts(pay || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function syncMercury() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/mercury-sync')
      const data = await res.json()
      setSyncResult(data)
      // Reload data to show updated payments
      await loadData()
    } catch (err) {
      setSyncResult({ error: err.message })
    }
    setSyncing(false)
  }

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
        <div className="header-wrap">
          <Header />
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="content">
            <h1>💰 Creators</h1>
            
            {/* Summary Card */}
            <div className="summary-card">
              <div className="summary-header">
                <div className="summary-title">💰 Payout Summary</div>
                <button 
                  className={`sync-btn ${syncing ? 'syncing' : ''}`}
                  onClick={syncMercury}
                  disabled={syncing}
                >
                  {syncing ? '⏳ Syncing...' : '🔄 Sync Mercury'}
                </button>
              </div>
              {syncResult && (
                <div className={`sync-result ${syncResult.error ? 'error' : 'success'}`}>
                  {syncResult.error 
                    ? `❌ ${syncResult.error}`
                    : `✅ Synced! ${syncResult.newPayments} new payments found`
                  }
                </div>
              )}
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
                <div className="summary-item">
                  <div className="summary-label">Posts</div>
                  <div className="summary-value">{grandTotal.posts}</div>
                </div>
              </div>
            </div>

            <div className="layout">
              {/* Left: Creator List */}
              <div className="creator-list">
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
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0d0d1a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #fff;
        }

        .header-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px 40px;
        }

        .loading {
          text-align: center;
          padding: 60px;
          color: #888;
        }

        h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 24px 0;
        }

        /* Summary Card */
        .summary-card {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .summary-title {
          font-size: 18px;
          font-weight: 600;
        }

        .sync-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms;
          min-height: 44px;
        }

        .sync-btn:hover {
          background: #5558e3;
          transform: translateY(-1px);
        }

        .sync-btn:disabled, .sync-btn.syncing {
          background: #4b4b6b;
          cursor: not-allowed;
          transform: none;
        }

        .sync-result {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .sync-result.success {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .sync-result.error {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .summary-row {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .summary-item { flex: 1; min-width: 100px; text-align: center; }
        .summary-label { font-size: 13px; color: #888; margin-bottom: 6px; }
        .summary-value { font-size: 28px; font-weight: 700; }
        .summary-value.paid { color: #22c55e; }
        .summary-value.balance { color: #eab308; }

        /* Layout */
        .layout {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        @media (min-width: 768px) {
          .layout {
            display: grid;
            grid-template-columns: 1fr 400px;
          }
        }

        /* Creator List */
        .creators {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .creator-card {
          background: #1a1a2e;
          border: 2px solid #333;
          border-radius: 16px;
          padding: 20px;
          text-align: left;
          cursor: pointer;
          transition: all 200ms;
          width: 100%;
          color: #fff;
        }

        .creator-card:hover {
          border-color: #555;
          background: #252542;
        }

        .creator-card.selected {
          border-color: #6366f1;
          background: #252542;
        }

        .creator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .creator-name { font-size: 20px; font-weight: 600; }
        
        .creator-balance {
          font-size: 18px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 10px;
        }
        .creator-balance.due { background: rgba(234, 179, 8, 0.2); color: #eab308; }
        .creator-balance.clear { background: rgba(34, 197, 94, 0.2); color: #22c55e; }

        .creator-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .meta-item { font-size: 14px; color: #888; }

        /* Detail Panel */
        .detail-panel {
          background: #1a1a2e;
          border: 1px solid #333;
          border-radius: 20px;
          padding: 28px;
          height: fit-content;
        }

        @media (min-width: 768px) {
          .detail-panel {
            position: sticky;
            top: 24px;
          }
        }

        .detail-header h2 {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .handle { font-size: 15px; color: #888; margin-bottom: 24px; }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: #252542;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .stat-label { font-size: 12px; color: #888; margin-bottom: 4px; }
        .stat-value { font-size: 22px; font-weight: 700; }
        .stat-value.paid { color: #22c55e; }

        .balance-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 22px;
          border-radius: 14px;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .balance-banner.due { background: rgba(234, 179, 8, 0.15); color: #eab308; }
        .balance-banner.clear { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
        .balance-amount { font-size: 26px; font-weight: 700; }

        .posts-section h3 {
          font-size: 13px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          margin: 0 0 14px 0;
          letter-spacing: 0.5px;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
        }

        .post-row {
          display: flex;
          padding: 14px 0;
          border-bottom: 1px solid #333;
          font-size: 15px;
        }

        .post-date { width: 80px; color: #888; }
        .post-views { flex: 1; }
        .post-payout { font-weight: 600; color: #22c55e; }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .no-selection-icon { font-size: 56px; margin-bottom: 20px; opacity: 0.5; }
        .no-selection-text { color: #888; font-size: 16px; }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          .header-wrap { padding: 0 16px; }
          .content { padding: 0 16px 32px; }
          h1 { font-size: 24px; }
          .summary-row { gap: 16px; }
          .summary-value { font-size: 22px; }
        }
      `}</style>
    </>
  )
}

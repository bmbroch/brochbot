import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

const PAYOUT_TIERS = [
  { min: 0, max: 9999, payout: 25 },
  { min: 10000, max: 29999, payout: 40 },
  { min: 30000, max: 49999, payout: 60 },
  { min: 50000, max: 99999, payout: 120 },
  { min: 100000, max: 249999, payout: 225 },
  { min: 250000, max: 499999, payout: 300 },
  { min: 500000, max: 999999, payout: 400 },
  { min: 1000000, max: Infinity, payout: 650 },
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

export default function CreatorsV2() {
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*&order=post_date.desc'),
    ]).then(([c, p]) => {
      setCreators(c)
      setPosts(p)
      setLoading(false)
    })
  }, [])

  // Calculate stats per creator
  const creatorData = creators.map(c => {
    const creatorPosts = posts.filter(p => p.creator_id === c.id)
    const totalTT = creatorPosts.reduce((s, p) => s + (p.tiktok_views || 0), 0)
    const totalIG = creatorPosts.reduce((s, p) => s + (p.instagram_views || 0), 0)
    const totalPayout = creatorPosts.reduce((s, p) => {
      const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return s + getPayout(bestViews)
    }, 0)
    
    // Recent posts (last 5)
    const recentPosts = creatorPosts.slice(0, 5)
    
    // Best performing post
    const bestPost = creatorPosts.reduce((best, p) => {
      const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return views > (best?.views || 0) ? { ...p, views } : best
    }, null)
    
    return {
      ...c,
      postCount: creatorPosts.length,
      totalTT,
      totalIG,
      totalPayout,
      recentPosts,
      bestPost,
    }
  })

  // Totals
  const totals = {
    posts: posts.length,
    payout: creatorData.reduce((s, c) => s + c.totalPayout, 0),
    ttViews: creatorData.reduce((s, c) => s + c.totalTT, 0),
    igViews: creatorData.reduce((s, c) => s + c.totalIG, 0),
  }

  if (loading) {
    return <div className="container"><Header /><div className="loading">Loading...</div></div>
  }

  return (
    <>
      <Head>
        <title>Creator Tracker V2 | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <Header />
        
        <h1>📊 Creator Dashboard <span className="version">v2 - Card View</span></h1>

        {/* Global Stats */}
        <div className="global-stats">
          <div className="stat">
            <div className="stat-value">{totals.posts}</div>
            <div className="stat-label">Total Posts</div>
          </div>
          <div className="stat">
            <div className="stat-value">{formatNumber(totals.ttViews)}</div>
            <div className="stat-label">TikTok Views</div>
          </div>
          <div className="stat">
            <div className="stat-value">{formatNumber(totals.igViews)}</div>
            <div className="stat-label">Instagram Views</div>
          </div>
          <div className="stat highlight">
            <div className="stat-value">${totals.payout.toLocaleString()}</div>
            <div className="stat-label">Total Owed</div>
          </div>
        </div>

        {/* Creator Cards */}
        <div className="creator-grid">
          {creatorData.map(c => (
            <div key={c.id} className="creator-panel">
              <div className="panel-header">
                <div className="creator-avatar">{c.name[0]}</div>
                <div className="creator-info">
                  <h2>{c.name}</h2>
                  <div className="handles">
                    <span>TT: {c.tiktok_handle}</span>
                    <span>IG: {c.instagram_handle}</span>
                  </div>
                </div>
                <div className="creator-total">${c.totalPayout.toLocaleString()}</div>
              </div>

              <div className="panel-stats">
                <div className="mini-stat">
                  <span className="mini-value">{c.postCount}</span>
                  <span className="mini-label">Posts</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-value">{formatNumber(c.totalTT)}</span>
                  <span className="mini-label">TT Views</span>
                </div>
                <div className="mini-stat">
                  <span className="mini-value">{formatNumber(c.totalIG)}</span>
                  <span className="mini-label">IG Views</span>
                </div>
              </div>

              {c.bestPost && (
                <div className="best-post">
                  <span className="best-label">🏆 Best Post</span>
                  <span className="best-date">{formatDate(c.bestPost.post_date)}</span>
                  <span className="best-views">{formatNumber(c.bestPost.views)} views</span>
                </div>
              )}

              <div className="recent-posts">
                <div className="recent-header">Recent Posts</div>
                {c.recentPosts.map(p => {
                  const best = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                  return (
                    <div key={p.id} className="recent-row">
                      <span className="recent-date">{formatDate(p.post_date)}</span>
                      <span className="recent-views">{formatNumber(best)}</span>
                      <span className="recent-payout">${getPayout(best)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #0a0a0f;
          min-height: 100vh;
          color: #fff;
        }
        
        h1 {
          margin: 0 0 24px 0;
          font-size: 24px;
        }
        
        .version {
          font-size: 14px;
          color: #888;
          font-weight: normal;
        }
        
        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
        }
        
        .global-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .stat {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }
        
        .stat.highlight {
          background: linear-gradient(135deg, #1a3a1a 0%, #1a2a1a 100%);
          border: 1px solid #22c55e33;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
        }
        
        .highlight .stat-value {
          color: #22c55e;
        }
        
        .stat-label {
          font-size: 13px;
          color: #888;
          margin-top: 4px;
        }
        
        .creator-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .creator-panel {
          background: #1a1a2e;
          border-radius: 16px;
          padding: 20px;
          border: 1px solid #333;
        }
        
        .panel-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        
        .creator-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
        }
        
        .creator-info h2 {
          margin: 0;
          font-size: 20px;
        }
        
        .handles {
          font-size: 12px;
          color: #666;
          display: flex;
          gap: 12px;
        }
        
        .creator-total {
          margin-left: auto;
          font-size: 24px;
          font-weight: 700;
          color: #22c55e;
        }
        
        .panel-stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #333;
        }
        
        .mini-stat {
          display: flex;
          flex-direction: column;
        }
        
        .mini-value {
          font-size: 18px;
          font-weight: 600;
        }
        
        .mini-label {
          font-size: 11px;
          color: #666;
        }
        
        .best-post {
          background: #252542;
          padding: 10px 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          font-size: 13px;
        }
        
        .best-label {
          font-weight: 600;
        }
        
        .best-date {
          color: #888;
        }
        
        .best-views {
          margin-left: auto;
          color: #6366f1;
          font-weight: 600;
        }
        
        .recent-posts {
          font-size: 13px;
        }
        
        .recent-header {
          color: #666;
          margin-bottom: 8px;
          font-size: 12px;
          text-transform: uppercase;
        }
        
        .recent-row {
          display: flex;
          padding: 6px 0;
          border-bottom: 1px solid #252542;
        }
        
        .recent-date {
          color: #888;
          width: 70px;
        }
        
        .recent-views {
          flex: 1;
        }
        
        .recent-payout {
          color: #22c55e;
          font-weight: 500;
        }
        
        @media (max-width: 900px) {
          .creator-grid {
            grid-template-columns: 1fr;
          }
          .global-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  )
}

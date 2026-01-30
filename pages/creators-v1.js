import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '../components/Header'

const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

// Payout tiers from sales-echo.com/creator
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

async function api(endpoint) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  })
  return res.json()
}

export default function CreatorsV1() {
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*,creators(name)&order=post_date.desc'),
    ]).then(([c, p]) => {
      setCreators(c)
      setPosts(p)
      setLoading(false)
    })
  }, [])

  // Calculate stats per creator
  const creatorStats = creators.map(c => {
    const creatorPosts = posts.filter(p => p.creator_id === c.id)
    const totalTT = creatorPosts.reduce((s, p) => s + (p.tiktok_views || 0), 0)
    const totalIG = creatorPosts.reduce((s, p) => s + (p.instagram_views || 0), 0)
    const totalPayout = creatorPosts.reduce((s, p) => {
      const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return s + getPayout(bestViews)
    }, 0)
    
    return {
      ...c,
      postCount: creatorPosts.length,
      totalTT,
      totalIG,
      totalPayout,
      posts: creatorPosts,
    }
  })

  const filteredPosts = selectedCreator 
    ? posts.filter(p => p.creator_id === selectedCreator)
    : posts

  return (
    <>
      <Head>
        <title>Creator Tracker V1 | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <Header />
        
        <h1>📊 Creator Performance Tracker <span className="version">v1 - Table View</span></h1>

        {/* Creator Summary Cards */}
        <div className="creator-cards">
          {creatorStats.map(c => (
            <div 
              key={c.id} 
              className={`creator-card ${selectedCreator === c.id ? 'selected' : ''}`}
              onClick={() => setSelectedCreator(selectedCreator === c.id ? null : c.id)}
            >
              <div className="creator-name">{c.name}</div>
              <div className="creator-stats">
                <div><span className="label">Posts:</span> {c.postCount}</div>
                <div><span className="label">TT:</span> {formatNumber(c.totalTT)}</div>
                <div><span className="label">IG:</span> {formatNumber(c.totalIG)}</div>
              </div>
              <div className="creator-payout">${c.totalPayout.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Posts Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Creator</th>
                <th>TikTok Views</th>
                <th>Instagram Views</th>
                <th>Best Views</th>
                <th>Payout</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="loading">Loading...</td></tr>
              ) : filteredPosts.map(p => {
                const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                const payout = getPayout(bestViews)
                return (
                  <tr key={p.id}>
                    <td>{new Date(p.post_date).toLocaleDateString()}</td>
                    <td>{p.creators?.name || '?'}</td>
                    <td className="views">{formatNumber(p.tiktok_views)}</td>
                    <td className="views">{formatNumber(p.instagram_views)}</td>
                    <td className="views best">{formatNumber(bestViews)}</td>
                    <td className="payout">${payout}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Payout Tiers Reference */}
        <div className="tiers">
          <h3>💰 Payout Tiers</h3>
          <div className="tier-grid">
            {PAYOUT_TIERS.map((t, i) => (
              <div key={i} className="tier">
                <span className="tier-range">{formatNumber(t.min)} - {t.max === Infinity ? '∞' : formatNumber(t.max)}</span>
                <span className="tier-payout">${t.payout}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1100px;
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
        
        .creator-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .creator-card {
          background: #1a1a2e;
          border: 2px solid #333;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .creator-card:hover {
          border-color: #555;
        }
        
        .creator-card.selected {
          border-color: #6366f1;
          background: #1e1e3f;
        }
        
        .creator-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .creator-stats {
          font-size: 13px;
          color: #aaa;
          margin-bottom: 8px;
        }
        
        .creator-stats .label {
          color: #666;
        }
        
        .creator-payout {
          font-size: 20px;
          font-weight: 700;
          color: #22c55e;
        }
        
        .table-container {
          background: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid #333;
        }
        
        th {
          background: #252542;
          font-weight: 600;
          font-size: 13px;
          color: #888;
          text-transform: uppercase;
        }
        
        .views {
          font-family: monospace;
        }
        
        .best {
          color: #6366f1;
          font-weight: 600;
        }
        
        .payout {
          color: #22c55e;
          font-weight: 600;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .tiers {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 20px;
        }
        
        .tiers h3 {
          margin: 0 0 16px 0;
          font-size: 16px;
        }
        
        .tier-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        
        .tier {
          background: #252542;
          padding: 10px 12px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          font-size: 13px;
        }
        
        .tier-range {
          color: #888;
        }
        
        .tier-payout {
          color: #22c55e;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .creator-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          .tier-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          th, td {
            padding: 8px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}

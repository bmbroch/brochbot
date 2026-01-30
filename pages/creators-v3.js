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

function getTierLabel(views) {
  const tier = PAYOUT_TIERS.find(t => views >= t.min && views <= t.max)
  return tier ? tier.label : '$0'
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

export default function CreatorsV3() {
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*&order=post_date.desc'),
      api('creator_payouts?select=*'),
    ]).then(([c, p, pay]) => {
      setCreators(c)
      setPosts(p)
      setPayouts(pay)
      setLoading(false)
    })
  }, [])

  // Calculate payout summary per creator
  const payoutData = creators.map(c => {
    const creatorPosts = posts.filter(p => p.creator_id === c.id)
    const creatorPayouts = payouts.filter(p => p.creator_id === c.id)
    
    // Calculate what's owed based on posts
    const totalOwed = creatorPosts.reduce((s, p) => {
      const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return s + getPayout(bestViews)
    }, 0)
    
    // Sum what's been paid
    const totalPaid = creatorPayouts.reduce((s, p) => s + Number(p.amount_paid || 0), 0)
    
    // Balance
    const balance = totalOwed - totalPaid
    
    // Posts by tier
    const tierBreakdown = PAYOUT_TIERS.map(tier => ({
      ...tier,
      count: creatorPosts.filter(p => {
        const v = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
        return v >= tier.min && v <= tier.max
      }).length,
    }))
    
    return {
      ...c,
      postCount: creatorPosts.length,
      totalOwed,
      totalPaid,
      balance,
      tierBreakdown,
      posts: creatorPosts,
    }
  })

  // Grand totals
  const grandTotal = {
    owed: payoutData.reduce((s, c) => s + c.totalOwed, 0),
    paid: payoutData.reduce((s, c) => s + c.totalPaid, 0),
  }
  grandTotal.balance = grandTotal.owed - grandTotal.paid

  if (loading) {
    return <div className="container"><Header /><div className="loading">Loading...</div></div>
  }

  return (
    <>
      <Head>
        <title>Creator Payouts V3 | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <Header />
        
        <h1>💰 Creator Payouts <span className="version">v3 - Payout Focus</span></h1>

        {/* Grand Total Banner */}
        <div className="grand-total">
          <div className="total-section">
            <div className="total-label">Total Owed</div>
            <div className="total-value owed">${grandTotal.owed.toLocaleString()}</div>
          </div>
          <div className="total-section">
            <div className="total-label">Total Paid</div>
            <div className="total-value paid">${grandTotal.paid.toLocaleString()}</div>
          </div>
          <div className="total-section highlight">
            <div className="total-label">Balance Due</div>
            <div className="total-value balance">${grandTotal.balance.toLocaleString()}</div>
          </div>
        </div>

        {/* Creator Payout Cards */}
        {payoutData.map(c => (
          <div key={c.id} className="payout-card">
            <div className="card-header">
              <div className="creator-name">{c.name}</div>
              <div className="creator-handles">{c.tiktok_handle}</div>
              <div className="creator-balance">
                <span className="balance-label">Balance:</span>
                <span className={`balance-value ${c.balance > 0 ? 'due' : 'clear'}`}>
                  ${c.balance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="payout-breakdown">
              <div className="breakdown-row header">
                <span>Posts</span>
                <span>Owed</span>
                <span>Paid</span>
              </div>
              <div className="breakdown-row">
                <span>{c.postCount} posts</span>
                <span className="owed">${c.totalOwed.toLocaleString()}</span>
                <span className="paid">${c.totalPaid.toLocaleString()}</span>
              </div>
            </div>

            <div className="tier-breakdown">
              <div className="tier-header">Posts by Tier</div>
              <div className="tier-bars">
                {c.tierBreakdown.map((tier, i) => (
                  <div key={i} className="tier-item">
                    <div className="tier-label">{tier.label}</div>
                    <div className="tier-bar-container">
                      <div 
                        className="tier-bar" 
                        style={{ width: `${Math.min(tier.count * 15, 100)}%` }}
                      />
                    </div>
                    <div className="tier-count">{tier.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent posts with payout */}
            <div className="recent-section">
              <div className="recent-header">Recent Posts & Payouts</div>
              <div className="recent-table">
                {c.posts.slice(0, 5).map(p => {
                  const best = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                  return (
                    <div key={p.id} className="recent-row">
                      <span className="date">{new Date(p.post_date).toLocaleDateString()}</span>
                      <span className="views">{formatNumber(best)} views</span>
                      <span className="tier">{getTierLabel(best)}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .container {
          max-width: 900px;
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
        
        .grand-total {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
          padding: 24px;
          background: #1a1a2e;
          border-radius: 16px;
        }
        
        .total-section {
          flex: 1;
          text-align: center;
        }
        
        .total-section.highlight {
          background: #252542;
          margin: -24px;
          margin-left: 0;
          padding: 24px;
          border-radius: 0 16px 16px 0;
        }
        
        .total-label {
          font-size: 13px;
          color: #888;
          margin-bottom: 8px;
        }
        
        .total-value {
          font-size: 32px;
          font-weight: 700;
        }
        
        .total-value.owed { color: #fff; }
        .total-value.paid { color: #22c55e; }
        .total-value.balance { color: #eab308; }
        
        .payout-card {
          background: #1a1a2e;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        
        .card-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #333;
        }
        
        .creator-name {
          font-size: 22px;
          font-weight: 700;
        }
        
        .creator-handles {
          color: #666;
          font-size: 14px;
        }
        
        .creator-balance {
          margin-left: auto;
          text-align: right;
        }
        
        .balance-label {
          font-size: 12px;
          color: #888;
          display: block;
        }
        
        .balance-value {
          font-size: 24px;
          font-weight: 700;
        }
        
        .balance-value.due { color: #eab308; }
        .balance-value.clear { color: #22c55e; }
        
        .payout-breakdown {
          margin-bottom: 20px;
        }
        
        .breakdown-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #252542;
        }
        
        .breakdown-row.header {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          border-bottom: 1px solid #333;
        }
        
        .breakdown-row span {
          flex: 1;
        }
        
        .breakdown-row .owed { color: #fff; font-weight: 600; }
        .breakdown-row .paid { color: #22c55e; font-weight: 600; }
        
        .tier-breakdown {
          margin-bottom: 20px;
        }
        
        .tier-header {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        
        .tier-bars {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .tier-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
        }
        
        .tier-label {
          width: 50px;
          color: #888;
        }
        
        .tier-bar-container {
          flex: 1;
          height: 8px;
          background: #252542;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .tier-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 4px;
        }
        
        .tier-count {
          width: 30px;
          text-align: right;
          font-weight: 600;
        }
        
        .recent-section {
          padding-top: 16px;
          border-top: 1px solid #333;
        }
        
        .recent-header {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        
        .recent-row {
          display: flex;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid #252542;
        }
        
        .recent-row .date { width: 100px; color: #888; }
        .recent-row .views { flex: 1; }
        .recent-row .tier { width: 60px; text-align: right; color: #22c55e; font-weight: 600; }
        
        @media (max-width: 600px) {
          .grand-total {
            flex-direction: column;
          }
          .total-section.highlight {
            margin: 0 -24px -24px -24px;
            border-radius: 0 0 16px 16px;
          }
        }
      `}</style>
    </>
  )
}

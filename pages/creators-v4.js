import { useState, useEffect, useMemo } from 'react'
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
  if (!d) return '-'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function api(endpoint, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  return res.json()
}

export default function CreatorsV4() {
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState('all')
  const [filter, setFilter] = useState('all') // all, unpaid, paid, partial

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [c, p, pay] = await Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*,creators(id,name)&order=post_date.desc'),
      api('creator_payments?select=*,creators(id,name)&order=payment_date.desc'),
    ])
    setCreators(c)
    setPosts(p)
    setPayments(pay)
    setLoading(false)
  }

  async function syncMercury() {
    setSyncing(true)
    try {
      const res = await fetch('/api/mercury-sync')
      const data = await res.json()
      if (data.success) {
        alert(`✅ Synced ${data.newPayments} new payments`)
        loadData()
      } else {
        alert(`❌ Sync failed: ${data.error}`)
      }
    } catch (e) {
      alert(`❌ Sync error: ${e.message}`)
    }
    setSyncing(false)
  }

  // Calculate post-level payment status
  const postsWithPayments = useMemo(() => {
    return posts.map(p => {
      const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      const basePayout = getPayout(bestViews)
      
      // Payment status
      const isPaid = p.base_paid && p.bonus_paid
      const isPartial = p.base_paid !== p.bonus_paid
      const isUnpaid = !p.base_paid && !p.bonus_paid
      
      return {
        ...p,
        bestViews,
        basePayout,
        isPaid,
        isPartial,
        isUnpaid,
        creatorName: p.creators?.name || 'Unknown',
      }
    })
  }, [posts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return postsWithPayments.filter(p => {
      // Creator filter
      if (selectedCreator !== 'all' && p.creator_id !== selectedCreator) return false
      
      // Payment filter
      if (filter === 'unpaid' && !p.isUnpaid) return false
      if (filter === 'paid' && !p.isPaid) return false
      if (filter === 'partial' && !p.isPartial) return false
      
      return true
    })
  }, [postsWithPayments, selectedCreator, filter])

  // Calculate totals
  const totals = useMemo(() => {
    const result = {
      totalOwed: 0,
      basePaid: 0,
      baseUnpaid: 0,
      postsCount: filteredPosts.length,
      paidCount: 0,
      unpaidCount: 0,
      partialCount: 0,
    }
    
    filteredPosts.forEach(p => {
      result.totalOwed += p.basePayout
      if (p.base_paid) {
        result.basePaid += p.basePayout
        result.paidCount++
      } else {
        result.baseUnpaid += p.basePayout
        result.unpaidCount++
      }
      if (p.isPartial) result.partialCount++
    })
    
    return result
  }, [filteredPosts])

  // Mercury payments total
  const mercuryTotal = useMemo(() => {
    return payments
      .filter(p => selectedCreator === 'all' || p.creator_id === selectedCreator)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  }, [payments, selectedCreator])

  if (loading) {
    return <div className="container"><Header /><div className="loading">Loading...</div></div>
  }

  return (
    <>
      <Head>
        <title>Payment Reconciliation | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <Header />
        
        <div className="page-header">
          <h1>💳 Payment Reconciliation <span className="version">v4</span></h1>
          <button 
            className="sync-btn" 
            onClick={syncMercury} 
            disabled={syncing}
          >
            {syncing ? '⏳ Syncing...' : '🔄 Sync Mercury'}
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Creator:</label>
            <select value={selectedCreator} onChange={e => setSelectedCreator(e.target.value)}>
              <option value="all">All Creators</option>
              {creators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <div className="filter-buttons">
              <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
              <button className={filter === 'unpaid' ? 'active' : ''} onClick={() => setFilter('unpaid')}>Unpaid</button>
              <button className={filter === 'partial' ? 'active' : ''} onClick={() => setFilter('partial')}>Partial</button>
              <button className={filter === 'paid' ? 'active' : ''} onClick={() => setFilter('paid')}>Paid</button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-label">Posts</div>
            <div className="card-value">{totals.postsCount}</div>
            <div className="card-detail">
              <span className="paid">{totals.paidCount} paid</span>
              <span className="unpaid">{totals.unpaidCount} unpaid</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="card-label">Total Owed</div>
            <div className="card-value">${totals.totalOwed.toLocaleString()}</div>
            <div className="card-detail">Based on view tiers</div>
          </div>
          <div className="summary-card highlight-green">
            <div className="card-label">Paid (Posts)</div>
            <div className="card-value">${totals.basePaid.toLocaleString()}</div>
            <div className="card-detail">Posts marked as paid</div>
          </div>
          <div className="summary-card highlight-yellow">
            <div className="card-label">Outstanding</div>
            <div className="card-value">${totals.baseUnpaid.toLocaleString()}</div>
            <div className="card-detail">Posts needing payment</div>
          </div>
          <div className="summary-card highlight-blue">
            <div className="card-label">Mercury Total</div>
            <div className="card-value">${mercuryTotal.toLocaleString()}</div>
            <div className="card-detail">Actual payments sent</div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="section">
          <h2>📋 Posts & Payment Status</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Creator</th>
                  <th>TikTok</th>
                  <th>Instagram</th>
                  <th>Best</th>
                  <th>Payout</th>
                  <th>Base</th>
                  <th>Bonus</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map(p => (
                  <tr key={p.id} className={p.isPaid ? 'row-paid' : p.isPartial ? 'row-partial' : 'row-unpaid'}>
                    <td>{formatDate(p.post_date)}</td>
                    <td className="creator-name">{p.creatorName}</td>
                    <td className="views">{formatNumber(p.tiktok_views)}</td>
                    <td className="views">{formatNumber(p.instagram_views)}</td>
                    <td className="views best">{formatNumber(p.bestViews)}</td>
                    <td className="payout">${p.basePayout}</td>
                    <td className="status">
                      <span className={`badge ${p.base_paid ? 'badge-paid' : 'badge-unpaid'}`}>
                        {p.base_paid ? '✓' : '○'}
                      </span>
                    </td>
                    <td className="status">
                      <span className={`badge ${p.bonus_paid ? 'badge-paid' : 'badge-unpaid'}`}>
                        {p.bonus_paid ? '✓' : '○'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Mercury Payments */}
        <div className="section">
          <h2>💰 Mercury Payment History</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Creator</th>
                  <th>Amount</th>
                  <th>Note</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.slice(0, 15).map(p => (
                  <tr key={p.id}>
                    <td>{formatDate(p.payment_date)}</td>
                    <td className="creator-name">{p.creators?.name || 'Unknown'}</td>
                    <td className="amount">${Number(p.amount).toLocaleString()}</td>
                    <td className="note">{p.mercury_note || '-'}</td>
                    <td>
                      <span className={`badge ${p.status === 'reconciled' ? 'badge-reconciled' : 'badge-unreconciled'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reconciliation Summary */}
        <div className="section">
          <h2>📊 Reconciliation Summary</h2>
          <div className="reconcile-grid">
            {creators.map(c => {
              const creatorPosts = postsWithPayments.filter(p => p.creator_id === c.id)
              const creatorPayments = payments.filter(p => p.creator_id === c.id)
              const postsOwed = creatorPosts.reduce((s, p) => s + p.basePayout, 0)
              const postsPaid = creatorPosts.filter(p => p.base_paid).reduce((s, p) => s + p.basePayout, 0)
              const mercuryPaid = creatorPayments.reduce((s, p) => s + Number(p.amount), 0)
              const delta = mercuryPaid - postsPaid
              
              return (
                <div key={c.id} className="reconcile-card">
                  <div className="reconcile-header">
                    <span className="creator-avatar">{c.name[0]}</span>
                    <span className="reconcile-name">{c.name}</span>
                  </div>
                  <div className="reconcile-row">
                    <span>Posts Total Owed:</span>
                    <span className="value">${postsOwed.toLocaleString()}</span>
                  </div>
                  <div className="reconcile-row">
                    <span>Posts Marked Paid:</span>
                    <span className="value paid">${postsPaid.toLocaleString()}</span>
                  </div>
                  <div className="reconcile-row">
                    <span>Mercury Payments:</span>
                    <span className="value blue">${mercuryPaid.toLocaleString()}</span>
                  </div>
                  <div className="reconcile-row delta">
                    <span>Delta:</span>
                    <span className={`value ${delta >= 0 ? 'positive' : 'negative'}`}>
                      {delta >= 0 ? '+' : ''}{delta.toLocaleString()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
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
        
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        
        h1 {
          margin: 0;
          font-size: 24px;
        }
        
        .version {
          font-size: 14px;
          color: #888;
          font-weight: normal;
        }
        
        .sync-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .sync-btn:hover:not(:disabled) {
          background: #5558e8;
        }
        
        .sync-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .loading {
          text-align: center;
          padding: 60px;
          color: #666;
        }
        
        .filters {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .filter-group label {
          color: #888;
          font-size: 14px;
        }
        
        .filter-group select {
          background: #1a1a2e;
          border: 1px solid #333;
          color: #fff;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .filter-buttons {
          display: flex;
          gap: 4px;
        }
        
        .filter-buttons button {
          background: #1a1a2e;
          border: 1px solid #333;
          color: #888;
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .filter-buttons button:hover,
        .filter-buttons button.active {
          background: #252542;
          border-color: #6366f1;
          color: #fff;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        
        .summary-card {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
        }
        
        .summary-card.highlight-green {
          border-color: #22c55e44;
          background: linear-gradient(135deg, #1a2e1a 0%, #1a1a2e 100%);
        }
        
        .summary-card.highlight-yellow {
          border-color: #eab30844;
          background: linear-gradient(135deg, #2e2a1a 0%, #1a1a2e 100%);
        }
        
        .summary-card.highlight-blue {
          border-color: #6366f144;
          background: linear-gradient(135deg, #1a1a3e 0%, #1a1a2e 100%);
        }
        
        .card-label {
          font-size: 12px;
          color: #888;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        
        .card-value {
          font-size: 28px;
          font-weight: 700;
        }
        
        .highlight-green .card-value { color: #22c55e; }
        .highlight-yellow .card-value { color: #eab308; }
        .highlight-blue .card-value { color: #6366f1; }
        
        .card-detail {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
        
        .card-detail .paid { color: #22c55e; margin-right: 8px; }
        .card-detail .unpaid { color: #888; }
        
        .section {
          margin-bottom: 32px;
        }
        
        .section h2 {
          font-size: 18px;
          margin: 0 0 16px 0;
        }
        
        .table-container {
          background: #1a1a2e;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #333;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 12px 14px;
          text-align: left;
          border-bottom: 1px solid #252542;
        }
        
        th {
          background: #252542;
          font-weight: 600;
          font-size: 12px;
          color: #888;
          text-transform: uppercase;
        }
        
        .creator-name {
          font-weight: 600;
        }
        
        .views {
          font-family: 'SF Mono', 'Monaco', monospace;
          font-size: 13px;
        }
        
        .views.best {
          color: #6366f1;
          font-weight: 600;
        }
        
        .payout {
          color: #22c55e;
          font-weight: 600;
        }
        
        .amount {
          color: #22c55e;
          font-weight: 600;
          font-family: 'SF Mono', 'Monaco', monospace;
        }
        
        .note {
          color: #888;
          font-size: 13px;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .status {
          text-align: center;
        }
        
        .badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .badge-paid {
          background: #22c55e22;
          color: #22c55e;
        }
        
        .badge-unpaid {
          background: #88888822;
          color: #888;
        }
        
        .badge-reconciled {
          background: #22c55e22;
          color: #22c55e;
        }
        
        .badge-unreconciled {
          background: #eab30822;
          color: #eab308;
        }
        
        .row-paid {
          background: #22c55e08;
        }
        
        .row-partial {
          background: #eab30808;
        }
        
        .row-unpaid {
          background: transparent;
        }
        
        .reconcile-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        
        .reconcile-card {
          background: #1a1a2e;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #333;
        }
        
        .reconcile-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #333;
        }
        
        .creator-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
        }
        
        .reconcile-name {
          font-size: 18px;
          font-weight: 600;
        }
        
        .reconcile-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
          color: #888;
        }
        
        .reconcile-row.delta {
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #333;
        }
        
        .reconcile-row .value {
          font-weight: 600;
          color: #fff;
        }
        
        .reconcile-row .value.paid { color: #22c55e; }
        .reconcile-row .value.blue { color: #6366f1; }
        .reconcile-row .value.positive { color: #22c55e; }
        .reconcile-row .value.negative { color: #f87171; }
        
        @media (max-width: 1000px) {
          .summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .reconcile-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .filters {
            flex-direction: column;
          }
          .reconcile-grid {
            grid-template-columns: 1fr;
          }
          th, td {
            padding: 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </>
  )
}

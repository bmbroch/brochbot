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
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

async function api(endpoint, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  }
  if (options.method === 'POST' || options.method === 'PATCH') {
    headers['Prefer'] = 'return=representation'
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, { ...options, headers })
  if (options.method === 'DELETE') return { success: true }
  return res.json()
}

export default function Reconcile() {
  const [payments, setPayments] = useState([])
  const [posts, setPosts] = useState([])
  const [creators, setCreators] = useState([])
  const [linkedPosts, setLinkedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedPosts, setSelectedPosts] = useState(new Set())
  const [bonusAmount, setBonusAmount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('unreconciled')

  async function loadData() {
    const [pay, p, c, links] = await Promise.all([
      api('creator_payments?select=*&order=payment_date.desc'),
      api('creator_posts?select=*&order=post_date.desc'),
      api('creators?select=*'),
      api('post_payments?select=*'),
    ])
    setPayments(pay || [])
    setPosts(p || [])
    setCreators(c || [])
    setLinkedPosts(links || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const creatorMap = {}
  creators.forEach(c => { creatorMap[c.id] = c.name })

  // Which posts are already linked to any payment
  const linkedPostIds = new Set(linkedPosts.map(lp => lp.post_id))

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (filter === 'all') return true
    return p.status === filter
  })

  // Posts for selected payment's creator (unlinked only)
  const availablePosts = selectedPayment
    ? posts.filter(p => 
        p.creator_id === selectedPayment.creator_id && 
        !linkedPostIds.has(p.id)
      )
    : []

  // Calculate selected total
  const selectedTotal = Array.from(selectedPosts).reduce((sum, postId) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return sum
    const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
    return sum + getPayout(views)
  }, 0) + Number(bonusAmount || 0)

  function selectPayment(payment) {
    setSelectedPayment(payment)
    setSelectedPosts(new Set())
    setBonusAmount(0)
  }

  function togglePost(postId) {
    const newSet = new Set(selectedPosts)
    if (newSet.has(postId)) {
      newSet.delete(postId)
    } else {
      newSet.add(postId)
    }
    setSelectedPosts(newSet)
  }

  async function saveReconciliation() {
    if (!selectedPayment) return
    setSaving(true)

    try {
      // Create post_payments links
      for (const postId of selectedPosts) {
        const post = posts.find(p => p.id === postId)
        const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
        const amount = getPayout(views)
        
        await api('post_payments', {
          method: 'POST',
          body: JSON.stringify({
            post_id: postId,
            payment_id: selectedPayment.id,
            amount,
            payment_type: 'base',
          }),
        })
      }

      // Update payment status
      await api(`creator_payments?id=eq.${selectedPayment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'reconciled',
          base_count: selectedPosts.size,
          bonus_amount: bonusAmount || 0,
          updated_at: new Date().toISOString(),
        }),
      })

      // Reload and reset
      await loadData()
      setSelectedPayment(null)
      setSelectedPosts(new Set())
      setBonusAmount(0)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function markUnreconciled(paymentId) {
    // Delete links and reset status
    await api(`post_payments?payment_id=eq.${paymentId}`, { method: 'DELETE' })
    await api(`creator_payments?id=eq.${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'unreconciled',
        base_count: 0,
        bonus_amount: 0,
        updated_at: new Date().toISOString(),
      }),
    })
    await loadData()
  }

  return (
    <>
      <Head>
        <title>Reconcile Payments | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <Header />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="content">
            <div className="page-header">
              <h1>🔗 Reconcile Payments</h1>
              <div className="filter-tabs">
                <button 
                  className={`tab ${filter === 'unreconciled' ? 'active' : ''}`}
                  onClick={() => setFilter('unreconciled')}
                >
                  Unreconciled ({payments.filter(p => p.status === 'unreconciled').length})
                </button>
                <button 
                  className={`tab ${filter === 'reconciled' ? 'active' : ''}`}
                  onClick={() => setFilter('reconciled')}
                >
                  Reconciled ({payments.filter(p => p.status === 'reconciled').length})
                </button>
                <button 
                  className={`tab ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All ({payments.length})
                </button>
              </div>
            </div>

            <div className="layout">
              {/* Payments List */}
              <div className="payments-list">
                <h2>Mercury Payments</h2>
                {filteredPayments.map(p => (
                  <button
                    key={p.id}
                    className={`payment-card ${selectedPayment?.id === p.id ? 'selected' : ''} ${p.status}`}
                    onClick={() => selectPayment(p)}
                  >
                    <div className="payment-header">
                      <span className="payment-creator">{creatorMap[p.creator_id]}</span>
                      <span className="payment-amount">${p.amount}</span>
                    </div>
                    <div className="payment-meta">
                      <span>{formatDate(p.payment_date)}</span>
                      {p.mercury_note && <span className="payment-note">{p.mercury_note}</span>}
                    </div>
                    <div className="payment-status">
                      {p.status === 'reconciled' 
                        ? `✅ ${p.base_count} posts + $${p.bonus_amount || 0} bonus`
                        : '⏳ Unreconciled'
                      }
                    </div>
                  </button>
                ))}
              </div>

              {/* Reconciliation Panel */}
              <div className="reconcile-panel">
                {selectedPayment ? (
                  <>
                    <div className="panel-header">
                      <h2>Reconcile: ${selectedPayment.amount}</h2>
                      <span className="panel-creator">{creatorMap[selectedPayment.creator_id]} • {formatDate(selectedPayment.payment_date)}</span>
                    </div>

                    {selectedPayment.status === 'reconciled' ? (
                      <div className="already-reconciled">
                        <p>✅ This payment is already reconciled.</p>
                        <p>{selectedPayment.base_count} posts + ${selectedPayment.bonus_amount || 0} bonus</p>
                        <button className="btn-secondary" onClick={() => markUnreconciled(selectedPayment.id)}>
                          Undo Reconciliation
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="match-section">
                          <h3>Select Posts to Link</h3>
                          <div className="posts-checklist">
                            {availablePosts.length === 0 ? (
                              <p className="no-posts">No unlinked posts for this creator</p>
                            ) : (
                              availablePosts.map(post => {
                                const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
                                const payout = getPayout(views)
                                return (
                                  <label key={post.id} className="post-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={selectedPosts.has(post.id)}
                                      onChange={() => togglePost(post.id)}
                                    />
                                    <span className="post-info">
                                      <span className="post-date">{formatDate(post.post_date)}</span>
                                      <span className="post-views">{formatNumber(views)} views</span>
                                      <span className="post-payout">${payout}</span>
                                    </span>
                                  </label>
                                )
                              })
                            )}
                          </div>
                        </div>

                        <div className="bonus-section">
                          <label>
                            <span>Bonus Amount</span>
                            <input
                              type="number"
                              value={bonusAmount}
                              onChange={(e) => setBonusAmount(e.target.value)}
                              placeholder="0"
                            />
                          </label>
                        </div>

                        <div className="total-section">
                          <div className="total-row">
                            <span>Base ({selectedPosts.size} posts)</span>
                            <span>${selectedTotal - Number(bonusAmount || 0)}</span>
                          </div>
                          <div className="total-row">
                            <span>Bonus</span>
                            <span>${bonusAmount || 0}</span>
                          </div>
                          <div className={`total-row grand ${selectedTotal === Number(selectedPayment.amount) ? 'match' : 'mismatch'}`}>
                            <span>Total</span>
                            <span>${selectedTotal} / ${selectedPayment.amount}</span>
                          </div>
                        </div>

                        <button 
                          className="btn-primary"
                          onClick={saveReconciliation}
                          disabled={saving || selectedPosts.size === 0}
                        >
                          {saving ? 'Saving...' : 'Save Reconciliation'}
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="no-selection">
                    <div className="no-selection-icon">👈</div>
                    <div className="no-selection-text">Select a payment to reconcile</div>
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
          background: #FAFAFA;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: #000;
        }

        .content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
        }

        .loading { text-align: center; padding: 60px; color: #6B7280; }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        h1 { font-size: 28px; font-weight: 700; margin: 0; }

        .filter-tabs { display: flex; gap: 8px; }

        .tab {
          padding: 10px 16px;
          border: 2px solid #F5F5F5;
          border-radius: 12px;
          background: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms;
        }

        .tab:hover { border-color: #D1D5DB; }
        .tab.active { border-color: #000; background: #000; color: white; }

        .layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .layout { grid-template-columns: 1fr; }
        }

        h2 { font-size: 18px; font-weight: 600; margin: 0 0 16px 0; }

        .payments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .payment-card {
          background: white;
          border: 2px solid #F5F5F5;
          border-radius: 16px;
          padding: 16px;
          text-align: left;
          cursor: pointer;
          transition: all 200ms;
        }

        .payment-card:hover { border-color: #D1D5DB; }
        .payment-card.selected { border-color: #000; }
        .payment-card.reconciled { opacity: 0.7; }

        .payment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .payment-creator { font-weight: 600; font-size: 16px; }
        .payment-amount { font-weight: 700; font-size: 18px; }

        .payment-meta {
          display: flex;
          gap: 12px;
          font-size: 13px;
          color: #6B7280;
          margin-bottom: 8px;
        }

        .payment-note {
          font-style: italic;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .payment-status {
          font-size: 12px;
          color: #6B7280;
        }

        .reconcile-panel {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
          position: sticky;
          top: 24px;
        }

        .panel-header h2 { margin-bottom: 4px; }
        .panel-creator { font-size: 14px; color: #6B7280; }

        .already-reconciled {
          text-align: center;
          padding: 40px 20px;
          color: #6B7280;
        }

        .already-reconciled p { margin: 8px 0; }

        .match-section { margin-top: 24px; }
        h3 { font-size: 14px; font-weight: 600; color: #6B7280; margin: 0 0 12px 0; }

        .posts-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .no-posts { color: #6B7280; font-style: italic; }

        .post-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #FAFAFA;
          border-radius: 10px;
          cursor: pointer;
        }

        .post-checkbox:hover { background: #F0F0F0; }

        .post-checkbox input { width: 18px; height: 18px; }

        .post-info {
          display: flex;
          gap: 12px;
          flex: 1;
          font-size: 14px;
        }

        .post-date { color: #6B7280; width: 60px; }
        .post-views { flex: 1; }
        .post-payout { font-weight: 600; color: #16a34a; }

        .bonus-section {
          margin-top: 20px;
        }

        .bonus-section label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .bonus-section input {
          width: 100px;
          padding: 10px 14px;
          border: 2px solid #F5F5F5;
          border-radius: 10px;
          font-size: 16px;
          text-align: right;
        }

        .bonus-section input:focus {
          outline: none;
          border-color: #000;
        }

        .total-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #F5F5F5;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }

        .total-row.grand {
          font-size: 18px;
          font-weight: 700;
          padding-top: 12px;
          border-top: 1px solid #F5F5F5;
          margin-top: 8px;
        }

        .total-row.match { color: #16a34a; }
        .total-row.mismatch { color: #dc2626; }

        .btn-primary {
          width: 100%;
          margin-top: 20px;
          padding: 14px 24px;
          background: #000;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 200ms;
        }

        .btn-primary:hover { background: #333; }
        .btn-primary:disabled { background: #6B7280; cursor: not-allowed; }

        .btn-secondary {
          margin-top: 16px;
          padding: 10px 20px;
          background: white;
          border: 2px solid #F5F5F5;
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
        }

        .btn-secondary:hover { border-color: #000; }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
          text-align: center;
        }

        .no-selection-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .no-selection-text { color: #6B7280; }
      `}</style>
    </>
  )
}

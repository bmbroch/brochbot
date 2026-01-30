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

export default function Creators() {
  const [creators, setCreators] = useState([])
  const [posts, setPosts] = useState([])
  const [payments, setPayments] = useState([])
  const [postPayments, setPostPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [selectedPosts, setSelectedPosts] = useState(new Set())
  const [bonusAmount, setBonusAmount] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('posts') // posts | payments | reconcile
  const [reconcileType, setReconcileType] = useState('base') // base | bonus
  const [mercuryRecipients, setMercuryRecipients] = useState([])
  const [loadingRecipients, setLoadingRecipients] = useState(false)
  const [editingCreator, setEditingCreator] = useState(null)
  const [creatorEdits, setCreatorEdits] = useState({})

  async function loadData() {
    const [c, p, pay, links] = await Promise.all([
      api('creators?select=*&active=eq.true'),
      api('creator_posts?select=*&order=post_date.desc'),
      api('creator_payments?select=*&order=payment_date.desc'),
      api('post_payments?select=*'),
    ])
    setCreators(c || [])
    setPosts(p || [])
    setPayments(pay || [])
    setPostPayments(links || [])
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
      await loadData()
    } catch (err) {
      setSyncResult({ error: err.message })
    }
    setSyncing(false)
  }

  // Which posts are linked to payments
  const linkedPostIds = new Set(postPayments.map(lp => lp.post_id))

  // Calculate data per creator
  const creatorData = creators.map(c => {
    const creatorPosts = posts.filter(p => p.creator_id === c.id)
    const creatorPayments = payments.filter(p => p.creator_id === c.id)
    
    const totalOwed = creatorPosts.reduce((s, p) => {
      const bestViews = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return s + getPayout(bestViews)
    }, 0)
    
    const totalPaid = creatorPayments.reduce((s, p) => s + Number(p.amount || 0), 0)
    const balance = totalOwed - totalPaid
    const lastPost = creatorPosts[0]?.post_date
    const totalViews = creatorPosts.reduce((s, p) => s + Math.max(p.tiktok_views || 0, p.instagram_views || 0), 0)
    const unreconciledCount = creatorPayments.filter(p => p.status === 'unreconciled').length
    
    return {
      ...c,
      postCount: creatorPosts.length,
      totalOwed,
      totalPaid,
      balance,
      lastPost,
      totalViews,
      posts: creatorPosts,
      payments: creatorPayments,
      unreconciledCount,
    }
  })

  const grandTotal = {
    owed: creatorData.reduce((s, c) => s + c.totalOwed, 0),
    paid: creatorData.reduce((s, c) => s + c.totalPaid, 0),
    posts: creatorData.reduce((s, c) => s + c.postCount, 0),
    unreconciled: creatorData.reduce((s, c) => s + c.unreconciledCount, 0),
  }
  grandTotal.balance = grandTotal.owed - grandTotal.paid

  const selected = selectedCreator ? creatorData.find(c => c.id === selectedCreator) : null

  // Posts available for reconciliation based on type
  const availablePosts = selected
    ? selected.posts.filter(p => {
        if (reconcileType === 'base') {
          return !p.base_paid
        } else {
          // Bonus: must be eligible (15+ days) and not bonus_paid yet
          const bonusEligible = new Date(p.bonus_eligible_date) <= new Date()
          return bonusEligible && !p.bonus_paid
        }
      })
    : []

  // Calculate selected total for reconciliation
  const selectedBaseTotal = Array.from(selectedPosts).reduce((sum, postId) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return sum
    const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
    if (reconcileType === 'base') {
      return sum + 25 // Base pay is always $25
    } else {
      return sum + (getPayout(views) - 25) // Bonus is tier minus base
    }
  }, 0)
  const selectedTotal = selectedBaseTotal + Number(bonusAmount || 0)
  const paymentAmount = selectedPayment ? Number(selectedPayment.amount) : 0
  const remaining = paymentAmount - selectedTotal

  function selectCreator(id) {
    setSelectedCreator(id === selectedCreator ? null : id)
    setSelectedPayment(null)
    setSelectedPosts(new Set())
    setBonusAmount(0)
    setTab('posts')
  }

  function selectPaymentForReconcile(payment) {
    setSelectedPayment(payment)
    setSelectedPosts(new Set())
    setBonusAmount(0)
    setReconcileType('base')
    setTab('reconcile')
  }

  function togglePost(postId) {
    const newSet = new Set(selectedPosts)
    if (newSet.has(postId)) {
      newSet.delete(postId)
    } else {
      // Check if adding this post would exceed payment amount
      const post = posts.find(p => p.id === postId)
      if (post) {
        const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
        const postPayout = getPayout(views)
        if (selectedTotal + postPayout <= paymentAmount) {
          newSet.add(postId)
        }
      }
    }
    setSelectedPosts(newSet)
  }
  
  // Check if a post can be added (wouldn't exceed payment)
  function canAddPost(postId) {
    if (selectedPosts.has(postId)) return true // Can always remove
    const post = posts.find(p => p.id === postId)
    if (!post) return false
    const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
    const postPayout = reconcileType === 'base' ? 25 : (getPayout(views) - 25)
    return selectedTotal + postPayout <= paymentAmount
  }

  async function saveReconciliation() {
    if (!selectedPayment) return
    setSaving(true)
    try {
      for (const postId of selectedPosts) {
        const post = posts.find(p => p.id === postId)
        const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
        const amount = reconcileType === 'base' ? 25 : (getPayout(views) - 25)
        
        // Create post_payment link
        await api('post_payments', {
          method: 'POST',
          body: JSON.stringify({
            post_id: postId,
            payment_id: selectedPayment.id,
            amount,
            payment_type: reconcileType,
          }),
        })
        
        // Update post's paid flag
        const paidFlag = reconcileType === 'base' ? { base_paid: true } : { bonus_paid: true }
        await api(`creator_posts?id=eq.${postId}`, {
          method: 'PATCH',
          body: JSON.stringify(paidFlag),
        })
      }
      
      await api(`creator_payments?id=eq.${selectedPayment.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'reconciled',
          base_count: reconcileType === 'base' ? selectedPosts.size : 0,
          bonus_amount: reconcileType === 'bonus' ? selectedBaseTotal : (bonusAmount || 0),
        }),
      })
      await loadData()
      setSelectedPayment(null)
      setSelectedPosts(new Set())
      setBonusAmount(0)
      setTab('payments')
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setSaving(false)
  }

  async function undoReconciliation(paymentId) {
    await api(`post_payments?payment_id=eq.${paymentId}`, { method: 'DELETE' })
    await api(`creator_payments?id=eq.${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'unreconciled', base_count: 0, bonus_amount: 0 }),
    })
    await loadData()
  }

  async function loadMercuryRecipients() {
    if (mercuryRecipients.length === 0) {
      setLoadingRecipients(true)
      try {
        const res = await fetch('/api/mercury-recipients')
        const data = await res.json()
        if (data.recipients) {
          setMercuryRecipients(data.recipients)
        }
      } catch (err) {
        console.error('Failed to load recipients:', err)
      }
      setLoadingRecipients(false)
    }
  }

  function startEditCreator(creator) {
    setEditingCreator(creator.id)
    setCreatorEdits({
      tiktok_handle: creator.tiktok_handle || '',
      instagram_handle: creator.instagram_handle || '',
      mercury_name: creator.mercury_name || '',
    })
    loadMercuryRecipients()
  }

  async function saveCreatorEdits(creatorId) {
    await api(`creators?id=eq.${creatorId}`, {
      method: 'PATCH',
      body: JSON.stringify(creatorEdits),
    })
    await loadData()
    setEditingCreator(null)
  }

  return (
    <>
      <Head>
        <title>Creators | BrochBot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        <Header />

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="content">
            <h1>💰 Creators</h1>
            
            {/* Summary Card */}
            <div className="summary-card">
              <div className="summary-header">
                <div className="summary-title">Payout Summary</div>
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
                    : `✅ Synced ${syncResult.accounts?.length || 0} accounts — ${syncResult.newPayments} new payments`
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
                  <div className="summary-label">Unreconciled</div>
                  <div className="summary-value">{grandTotal.unreconciled}</div>
                </div>
              </div>
            </div>

            <div className="layout">
              {/* Creator Cards */}
              <div className="creator-list">
                {creatorData.map(c => (
                  <div key={c.id} className={`creator-card ${selectedCreator === c.id ? 'selected' : ''}`}>
                    {editingCreator === c.id ? (
                      <div className="creator-edit-form">
                        <div className="edit-header">
                          <strong>{c.name}</strong>
                          <button className="btn-cancel" onClick={() => setEditingCreator(null)}>✕</button>
                        </div>
                        <div className="edit-field">
                          <label>TikTok</label>
                          <div className="handle-input">
                            <span>@</span>
                            <input
                              type="text"
                              value={creatorEdits.tiktok_handle}
                              onChange={(e) => setCreatorEdits({...creatorEdits, tiktok_handle: e.target.value})}
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="edit-field">
                          <label>Instagram</label>
                          <div className="handle-input">
                            <span>@</span>
                            <input
                              type="text"
                              value={creatorEdits.instagram_handle}
                              onChange={(e) => setCreatorEdits({...creatorEdits, instagram_handle: e.target.value})}
                              placeholder="username"
                            />
                          </div>
                        </div>
                        <div className="edit-field">
                          <label>Mercury Recipient</label>
                          {loadingRecipients ? (
                            <span className="loading-text">Loading...</span>
                          ) : (
                            <select
                              value={creatorEdits.mercury_name}
                              onChange={(e) => setCreatorEdits({...creatorEdits, mercury_name: e.target.value})}
                            >
                              <option value="">-- Select --</option>
                              {mercuryRecipients.map(r => (
                                <option key={r.name} value={r.name}>
                                  {r.name} (${r.totalPaid.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <button className="btn-save" onClick={() => saveCreatorEdits(c.id)}>Save</button>
                      </div>
                    ) : (
                      <>
                        <div className="creator-top" onClick={() => selectCreator(c.id)}>
                          <div className="creator-header">
                            <div className="creator-name">{c.name}</div>
                            <div className={`creator-balance ${c.balance > 0 ? 'due' : 'clear'}`}>
                              ${c.balance.toLocaleString()}
                            </div>
                          </div>
                          <div className="creator-handles">
                            {c.tiktok_handle && <span className="handle-tag">🎵 @{c.tiktok_handle}</span>}
                            {c.instagram_handle && <span className="handle-tag">📸 @{c.instagram_handle}</span>}
                            {c.mercury_name && <span className="handle-tag mercury">💳 {c.mercury_name}</span>}
                          </div>
                          <div className="creator-meta">
                            <span className="meta-item">📹 {c.postCount} posts</span>
                            <span className="meta-item">👁 {formatNumber(c.totalViews)}</span>
                            {c.unreconciledCount > 0 && (
                              <span className="meta-item unreconciled">⚠️ {c.unreconciledCount}</span>
                            )}
                          </div>
                        </div>
                        <button className="edit-btn" onClick={(e) => { e.stopPropagation(); startEditCreator(c); }}>
                          ✏️ Edit
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Detail Panel */}
              <div className="detail-panel">
                {selected ? (
                  <>
                    <div className="detail-header">
                      <h2>{selected.name}</h2>
                      <div className="detail-handles">
                        {selected.tiktok_handle && <span>🎵 @{selected.tiktok_handle}</span>}
                        {selected.instagram_handle && <span>📸 @{selected.instagram_handle}</span>}
                      </div>
                    </div>

                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-label">Owed</div>
                        <div className="stat-value">${selected.totalOwed}</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-label">Paid</div>
                        <div className="stat-value paid">${selected.totalPaid}</div>
                      </div>
                    </div>

                    <div className={`balance-banner ${selected.balance > 0 ? 'due' : 'clear'}`}>
                      <span>Balance</span>
                      <span className="balance-amount">${selected.balance.toLocaleString()}</span>
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                      <button className={`tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
                        Posts ({selected.postCount})
                      </button>
                      <button className={`tab ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>
                        Payments ({selected.payments.length})
                      </button>
                      {selectedPayment && (
                        <button className={`tab ${tab === 'reconcile' ? 'active' : ''}`} onClick={() => setTab('reconcile')}>
                          Reconcile
                        </button>
                      )}
                    </div>

                    {/* Posts Tab */}
                    {tab === 'posts' && (
                      <div className="posts-list">
                        {selected.posts.map(p => {
                          const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                          const basePay = 25
                          const bonusPay = getPayout(views) - 25
                          const bonusEligible = new Date(p.bonus_eligible_date) <= new Date()
                          return (
                            <div key={p.id} className="post-row-detailed">
                              <div className="post-main">
                                <span className="post-date">{formatDate(p.post_date)}</span>
                                <span className="post-views">{formatNumber(views)} views</span>
                                <div className="post-links">
                                  {p.tiktok_url && (
                                    <a 
                                      href={p.tiktok_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`post-link ${(p.tiktok_views || 0) >= (p.instagram_views || 0) ? 'winner' : 'secondary'}`}
                                      title={`TikTok: ${formatNumber(p.tiktok_views || 0)} views`}
                                    >
                                      TT
                                    </a>
                                  )}
                                  {p.instagram_url && (
                                    <a 
                                      href={p.instagram_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`post-link ${(p.instagram_views || 0) > (p.tiktok_views || 0) ? 'winner' : 'secondary'}`}
                                      title={`Instagram: ${formatNumber(p.instagram_views || 0)} views`}
                                    >
                                      IG
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="post-payments">
                                <span className={`pay-badge ${p.base_paid ? 'paid' : 'unpaid'}`}>
                                  Base ${basePay} {p.base_paid ? '✓' : ''}
                                </span>
                                <span className={`pay-badge ${p.bonus_paid ? 'paid' : bonusEligible ? 'eligible' : 'waiting'}`}>
                                  Bonus ${bonusPay > 0 ? bonusPay : 0} {p.bonus_paid ? '✓' : bonusEligible ? '⏳' : `(${formatDate(p.bonus_eligible_date)})`}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Payments Tab */}
                    {tab === 'payments' && (
                      <div className="payments-list">
                        {selected.payments.length === 0 ? (
                          <p className="empty-msg">No payments yet</p>
                        ) : (
                          selected.payments.map(p => (
                            <div key={p.id} className={`payment-row ${p.status}`}>
                              <div className="payment-main">
                                <span className="payment-date">{formatDate(p.payment_date)}</span>
                                <span className="payment-amount">${p.amount}</span>
                              </div>
                              {p.mercury_note && <div className="payment-note">{p.mercury_note}</div>}
                              <div className="payment-actions">
                                {p.status === 'reconciled' ? (
                                  <>
                                    <span className="reconciled-info">✅ {p.base_count} posts + ${p.bonus_amount || 0} bonus</span>
                                    <button className="btn-small" onClick={() => undoReconciliation(p.id)}>Undo</button>
                                  </>
                                ) : (
                                  <button className="btn-small primary" onClick={() => selectPaymentForReconcile(p)}>Reconcile</button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Reconcile Tab */}
                    {tab === 'reconcile' && selectedPayment && (
                      <div className="reconcile-section">
                        <div className="reconcile-header">
                          <div>
                            <strong>Payment: ${selectedPayment.amount}</strong>
                            <span className="reconcile-date">{formatDate(selectedPayment.payment_date)}</span>
                          </div>
                          <div className={`remaining ${remaining === 0 ? 'zero' : remaining < 0 ? 'over' : ''}`}>
                            ${remaining.toLocaleString()} remaining
                          </div>
                        </div>
                        
                        <div className="reconcile-type-selector">
                          <button 
                            className={`type-btn ${reconcileType === 'base' ? 'active' : ''}`}
                            onClick={() => { setReconcileType('base'); setSelectedPosts(new Set()); }}
                          >
                            Base Pay ($25/post)
                          </button>
                          <button 
                            className={`type-btn ${reconcileType === 'bonus' ? 'active' : ''}`}
                            onClick={() => { setReconcileType('bonus'); setSelectedPosts(new Set()); }}
                          >
                            Bonus Pay (tier-based)
                          </button>
                        </div>

                        <h3>{reconcileType === 'base' ? 'Posts needing base pay:' : 'Posts eligible for bonus (15+ days):'}</h3>
                        <div className="posts-checklist">
                          {availablePosts.length === 0 ? (
                            <p className="empty-msg">No unlinked posts</p>
                          ) : (
                            availablePosts.map(p => {
                              const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                              const postPayout = reconcileType === 'base' ? 25 : (getPayout(views) - 25)
                              const isSelected = selectedPosts.has(p.id)
                              const canAdd = canAddPost(p.id)
                              return (
                                <label key={p.id} className={`post-checkbox ${!canAdd && !isSelected ? 'disabled' : ''}`}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => togglePost(p.id)}
                                    disabled={!canAdd && !isSelected}
                                  />
                                  <span className="post-info">
                                    <span>{formatDate(p.post_date)}</span>
                                    <span>{formatNumber(views)} views</span>
                                    <span className="payout">${postPayout}</span>
                                  </span>
                                </label>
                              )
                            })
                          )}
                        </div>

                        <div className="bonus-input">
                          <label>Bonus amount:</label>
                          <input
                            type="number"
                            value={bonusAmount}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0
                              if (selectedBaseTotal + val <= paymentAmount) {
                                setBonusAmount(e.target.value)
                              }
                            }}
                            max={paymentAmount - selectedBaseTotal}
                            placeholder="0"
                          />
                        </div>

                        <div className="total-breakdown">
                          <div className="breakdown-row">
                            <span>Base ({selectedPosts.size} posts)</span>
                            <span>${selectedBaseTotal}</span>
                          </div>
                          <div className="breakdown-row">
                            <span>Bonus</span>
                            <span>${bonusAmount || 0}</span>
                          </div>
                          <div className={`breakdown-row total ${remaining === 0 ? 'match' : ''}`}>
                            <span>Total</span>
                            <span>${selectedTotal} / ${paymentAmount}</span>
                          </div>
                        </div>

                        <button 
                          className="btn-primary"
                          onClick={saveReconciliation}
                          disabled={saving || selectedPosts.size === 0 || remaining < 0}
                        >
                          {saving ? 'Saving...' : remaining === 0 ? '✓ Save Reconciliation' : `Save (${remaining > 0 ? '$' + remaining + ' unassigned' : 'Over budget'})`}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-selection">
                    <div className="no-selection-icon">👈</div>
                    <div className="no-selection-text">Select a creator</div>
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

        .content { max-width: 1200px; margin: 0 auto; padding: 24px; }
        .loading { text-align: center; padding: 60px; color: #6B7280; }
        h1 { font-size: 28px; font-weight: 700; margin: 0 0 24px 0; }

        .summary-card {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .summary-title { font-size: 18px; font-weight: 600; }

        .sync-btn {
          background: #000;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
        }

        .sync-btn:hover { background: #333; }
        .sync-btn:disabled { background: #6B7280; cursor: not-allowed; }

        .sync-result {
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .sync-result.success { background: #dcfce7; color: #16a34a; }
        .sync-result.error { background: #fee2e2; color: #dc2626; }

        .summary-row { display: flex; gap: 24px; flex-wrap: wrap; }
        .summary-item { flex: 1; min-width: 100px; text-align: center; }
        .summary-label { font-size: 13px; color: #6B7280; margin-bottom: 6px; }
        .summary-value { font-size: 24px; font-weight: 700; }
        .summary-value.paid { color: #16a34a; }
        .summary-value.balance { color: #ca8a04; }

        .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }

        .creator-list { display: flex; flex-direction: column; gap: 12px; }

        .creator-card {
          background: white;
          border: 2px solid #F5F5F5;
          border-radius: 16px;
          padding: 16px;
          text-align: left;
          transition: all 200ms;
        }

        .creator-card:hover { border-color: #D1D5DB; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .creator-card.selected { border-color: #000; }

        .creator-top { cursor: pointer; }

        .creator-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .creator-name { font-size: 18px; font-weight: 600; }
        .creator-balance { font-size: 16px; font-weight: 700; padding: 4px 12px; border-radius: 8px; }
        .creator-balance.due { background: #fefce8; color: #ca8a04; }
        .creator-balance.clear { background: #dcfce7; color: #16a34a; }

        .creator-handles { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
        .handle-tag { font-size: 12px; color: #6B7280; background: #F5F5F5; padding: 2px 8px; border-radius: 6px; }
        .handle-tag.mercury { background: #dbeafe; color: #1d4ed8; }

        .creator-meta { display: flex; gap: 12px; flex-wrap: wrap; }
        .meta-item { font-size: 12px; color: #6B7280; }
        .meta-item.unreconciled { color: #ca8a04; font-weight: 500; }

        .edit-btn {
          margin-top: 12px;
          padding: 6px 12px;
          border: 1px solid #F5F5F5;
          border-radius: 8px;
          background: white;
          font-size: 12px;
          cursor: pointer;
          color: #6B7280;
        }
        .edit-btn:hover { border-color: #000; color: #000; }

        .creator-edit-form { }
        .edit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .btn-cancel { background: none; border: none; font-size: 18px; cursor: pointer; color: #6B7280; }

        .edit-field { margin-bottom: 12px; }
        .edit-field label { display: block; font-size: 12px; color: #6B7280; margin-bottom: 4px; }

        .handle-input {
          display: flex;
          align-items: center;
          border: 2px solid #F5F5F5;
          border-radius: 8px;
          overflow: hidden;
        }
        .handle-input span { padding: 8px 8px 8px 12px; color: #6B7280; background: #FAFAFA; }
        .handle-input input {
          flex: 1;
          padding: 8px;
          border: none;
          font-size: 14px;
          outline: none;
        }

        .edit-field select {
          width: 100%;
          padding: 8px 12px;
          border: 2px solid #F5F5F5;
          border-radius: 8px;
          font-size: 14px;
        }

        .loading-text { font-size: 13px; color: #6B7280; }

        .btn-save {
          width: 100%;
          padding: 10px;
          background: #000;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .btn-save:hover { background: #333; }

        .detail-panel {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .detail-header h2 { font-size: 24px; font-weight: 700; margin: 0 0 4px 0; }
        .detail-handles { 
          display: flex; 
          gap: 12px; 
          font-size: 14px; 
          color: #6B7280; 
          margin-bottom: 20px;
        }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .stat-card { background: #FAFAFA; border-radius: 12px; padding: 16px; text-align: center; }
        .stat-label { font-size: 12px; color: #6B7280; margin-bottom: 4px; }
        .stat-value { font-size: 22px; font-weight: 700; }
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

        .tabs { display: flex; gap: 8px; margin-bottom: 16px; }
        .tab {
          padding: 10px 16px;
          border: 2px solid #F5F5F5;
          border-radius: 10px;
          background: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
        .tab:hover { border-color: #D1D5DB; }
        .tab.active { border-color: #000; background: #000; color: white; }

        .posts-list, .payments-list { display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto; }

        .post-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #FAFAFA;
          border-radius: 10px;
          font-size: 14px;
        }

        .post-row.linked { opacity: 0.6; }
        .post-date { width: 70px; color: #6B7280; }
        .post-views { flex: 1; }
        .post-payout { font-weight: 600; color: #16a34a; }
        .post-status { font-size: 16px; }

        .payment-row {
          padding: 14px;
          background: #FAFAFA;
          border-radius: 12px;
        }

        .payment-row.reconciled { background: #f0fdf4; }

        .payment-main { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 4px; }
        .payment-date { color: #6B7280; font-weight: 400; }
        .payment-amount { font-size: 18px; }
        .payment-note { font-size: 13px; color: #6B7280; font-style: italic; margin-bottom: 8px; }
        .payment-actions { display: flex; justify-content: space-between; align-items: center; }
        .reconciled-info { font-size: 12px; color: #16a34a; }

        .btn-small {
          padding: 6px 12px;
          border: 1px solid #F5F5F5;
          border-radius: 8px;
          background: white;
          font-size: 12px;
          cursor: pointer;
        }
        .btn-small:hover { border-color: #000; }
        .btn-small.primary { background: #000; color: white; border-color: #000; }

        .empty-msg { color: #6B7280; font-style: italic; padding: 20px; text-align: center; }

        .reconcile-section { }
        
        .reconcile-type-selector {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        
        .type-btn {
          flex: 1;
          padding: 10px 12px;
          border: 2px solid #F5F5F5;
          border-radius: 10px;
          background: white;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms;
        }
        
        .type-btn:hover { border-color: #D1D5DB; }
        .type-btn.active { border-color: #000; background: #000; color: white; }
        
        .post-row-detailed {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #FAFAFA;
          border-radius: 10px;
          margin-bottom: 8px;
        }
        
        .post-main { display: flex; gap: 12px; font-size: 14px; }
        .post-main .post-date { color: #6B7280; }
        
        .post-links {
          display: flex;
          gap: 6px;
          margin-left: 8px;
        }
        
        .post-link {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        
        .post-link:hover { opacity: 0.8; }
        
        .post-link.winner {
          background: #3B82F6;
          color: white;
        }
        
        .post-link.secondary {
          background: #E5E7EB;
          color: #9CA3AF;
        }
        
        .post-payments { display: flex; gap: 8px; }
        
        .pay-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
        }
        
        .pay-badge.paid { background: #dcfce7; color: #16a34a; }
        .pay-badge.unpaid { background: #fee2e2; color: #dc2626; }
        .pay-badge.eligible { background: #fefce8; color: #ca8a04; }
        .pay-badge.waiting { background: #F5F5F5; color: #6B7280; }
        .reconcile-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin-bottom: 16px; 
          padding: 14px 16px; 
          background: #fefce8; 
          border-radius: 12px; 
        }
        .reconcile-date { color: #6B7280; font-weight: 400; margin-left: 8px; }
        .remaining { font-weight: 600; font-size: 15px; }
        .remaining.zero { color: #16a34a; }
        .remaining.over { color: #dc2626; }

        h3 { font-size: 13px; font-weight: 600; color: #6B7280; margin: 16px 0 12px 0; }

        .posts-checklist { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }

        .post-checkbox {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: #FAFAFA;
          border-radius: 10px;
          cursor: pointer;
          transition: opacity 200ms;
        }
        .post-checkbox:hover { background: #F0F0F0; }
        .post-checkbox.disabled { 
          opacity: 0.4; 
          cursor: not-allowed; 
        }
        .post-checkbox.disabled:hover { background: #FAFAFA; }
        .post-checkbox input { width: 18px; height: 18px; }
        .post-checkbox input:disabled { cursor: not-allowed; }
        .post-info { display: flex; gap: 12px; flex: 1; font-size: 13px; }
        .post-info .payout { font-weight: 600; color: #16a34a; }

        .bonus-input { display: flex; justify-content: space-between; align-items: center; margin: 16px 0; }
        .bonus-input input {
          width: 100px;
          padding: 10px;
          border: 2px solid #F5F5F5;
          border-radius: 10px;
          font-size: 16px;
          text-align: right;
        }
        .bonus-input input:focus { outline: none; border-color: #000; }

        .total-breakdown {
          margin: 16px 0;
          padding: 12px;
          background: #FAFAFA;
          border-radius: 10px;
        }
        .breakdown-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        .breakdown-row.total {
          border-top: 1px solid #E5E5E5;
          margin-top: 8px;
          padding-top: 12px;
          font-weight: 600;
          font-size: 16px;
        }
        .breakdown-row.match { color: #16a34a; }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #000;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-primary:hover { background: #333; }
        .btn-primary:disabled { background: #6B7280; cursor: not-allowed; }

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

        @media (max-width: 767px) {
          .content { padding: 16px; }
          h1 { font-size: 24px; }
          .summary-value { font-size: 20px; }
        }
      `}</style>
    </>
  )
}

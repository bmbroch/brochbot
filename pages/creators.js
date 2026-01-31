import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
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

// Creator Portal Component (self-service view)
function CreatorPortal({ token }) {
  const [creator, setCreator] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [newPost, setNewPost] = useState({ 
    tiktok_url: '', 
    tiktok_views: '',
    instagram_url: '', 
    instagram_views: '',
    post_date: new Date().toISOString().split('T')[0]
  })

  async function loadCreatorData() {
    try {
      // Get creator by token
      const creatorRes = await api(`creators?token=eq.${token}&select=*`)
      if (!creatorRes || creatorRes.length === 0) {
        setError('Invalid token')
        setLoading(false)
        return
      }
      const c = creatorRes[0]
      setCreator(c)

      // Get their posts
      const postsRes = await api(`creator_posts?creator_id=eq.${c.id}&order=post_date.desc`)
      setPosts(postsRes || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to load data')
      setLoading(false)
    }
  }

  useEffect(() => { loadCreatorData() }, [token])

  async function submitPost(e) {
    e.preventDefault()
    if (!newPost.tiktok_url && !newPost.instagram_url) {
      setSubmitResult({ error: 'Please enter at least one platform (URL + views)' })
      return
    }
    if (!newPost.post_date) {
      setSubmitResult({ error: 'Please enter the post date' })
      return
    }
    
    setSubmitting(true)
    setSubmitResult(null)
    
    try {
      // Call API to create post
      const res = await fetch('/api/creator-submit-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          post_date: newPost.post_date,
          tiktok_url: newPost.tiktok_url,
          tiktok_views: parseInt(newPost.tiktok_views) || 0,
          instagram_url: newPost.instagram_url,
          instagram_views: parseInt(newPost.instagram_views) || 0,
        }),
      })
      const data = await res.json()
      
      if (data.error) {
        setSubmitResult({ error: data.error })
      } else {
        setSubmitResult({ success: 'Post submitted successfully!' })
        setNewPost({ 
          tiktok_url: '', 
          tiktok_views: '',
          instagram_url: '', 
          instagram_views: '',
          post_date: new Date().toISOString().split('T')[0]
        })
        await loadCreatorData()
      }
    } catch (err) {
      setSubmitResult({ error: 'Failed to submit post' })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="portal-page">
        <div className="portal-loading">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="portal-page">
        <div className="portal-error">
          <h1>❌ {error}</h1>
          <p>Please check your link and try again.</p>
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalPosts = posts.length
  const totalViews = posts.reduce((s, p) => s + Math.max(p.tiktok_views || 0, p.instagram_views || 0), 0)
  const totalEarned = posts.reduce((s, p) => {
    const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
    return s + getPayout(views)
  }, 0)
  const totalPaid = posts.reduce((s, p) => {
    let paid = 0
    if (p.base_paid) paid += 25
    if (p.bonus_paid) {
      const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      paid += getPayout(views) - 25
    }
    return s + paid
  }, 0)
  const pendingPayout = totalEarned - totalPaid

  return (
    <>
      <Head>
        <title>{creator.name} | Creator Portal</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="portal-page">
        <div className="portal-header">
          <h1>👋 Hey {creator.name}!</h1>
          <p>Track your posts and earnings</p>
        </div>

        <div className="portal-stats">
          <div className="stat-box">
            <div className="stat-label">Total Posts</div>
            <div className="stat-value">{totalPosts}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Views</div>
            <div className="stat-value">{formatNumber(totalViews)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Total Earned</div>
            <div className="stat-value">${totalEarned}</div>
          </div>
          <div className="stat-box highlight">
            <div className="stat-label">Pending Payout</div>
            <div className="stat-value">${pendingPayout}</div>
          </div>
        </div>

        <div className="portal-section">
          <h2>📤 Submit New Post</h2>
          <form onSubmit={submitPost} className="submit-form">
            <div className="form-row">
              <label>Post Date</label>
              <input
                type="date"
                value={newPost.post_date}
                onChange={(e) => setNewPost({ ...newPost, post_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <h3>🎵 TikTok</h3>
              <div className="form-row">
                <label>URL</label>
                <input
                  type="url"
                  placeholder="https://www.tiktok.com/@you/video/..."
                  value={newPost.tiktok_url}
                  onChange={(e) => setNewPost({ ...newPost, tiktok_url: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Views</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newPost.tiktok_views}
                  onChange={(e) => setNewPost({ ...newPost, tiktok_views: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <h3>📸 Instagram</h3>
              <div className="form-row">
                <label>URL</label>
                <input
                  type="url"
                  placeholder="https://www.instagram.com/reel/..."
                  value={newPost.instagram_url}
                  onChange={(e) => setNewPost({ ...newPost, instagram_url: e.target.value })}
                />
              </div>
              <div className="form-row">
                <label>Views</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={newPost.instagram_views}
                  onChange={(e) => setNewPost({ ...newPost, instagram_views: e.target.value })}
                />
              </div>
            </div>
            {submitResult && (
              <div className={`submit-result ${submitResult.error ? 'error' : 'success'}`}>
                {submitResult.error || submitResult.success}
              </div>
            )}
            <button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Post'}
            </button>
          </form>
        </div>

        <div className="portal-section">
          <h2>📹 Your Posts</h2>
          <div className="posts-grid">
            {posts.length === 0 ? (
              <p className="no-posts">No posts yet. Submit your first one above!</p>
            ) : (
              posts.map(post => {
                const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
                const payout = getPayout(views)
                const basePaid = post.base_paid
                const bonusPaid = post.bonus_paid
                const bonusEligible = new Date(post.bonus_eligible_date) <= new Date()
                const daysUntilBonus = Math.max(0, Math.ceil((new Date(post.bonus_eligible_date) - new Date()) / (1000 * 60 * 60 * 24)))
                
                return (
                  <div key={post.id} className="post-card">
                    <div className="post-card-header">
                      <span className="post-date">{formatDate(post.post_date)}</span>
                      <span className="post-payout">${payout}</span>
                    </div>
                    <div className="post-views">{formatNumber(views)} views</div>
                    <div className="post-links">
                      {post.tiktok_url && (
                        <a href={post.tiktok_url} target="_blank" rel="noopener noreferrer">🎵 TikTok</a>
                      )}
                      {post.instagram_url && (
                        <a href={post.instagram_url} target="_blank" rel="noopener noreferrer">📸 Instagram</a>
                      )}
                    </div>
                    <div className="post-status">
                      <span className={`status-badge ${basePaid ? 'paid' : 'unpaid'}`}>
                        Base $25 {basePaid ? '✓' : ''}
                      </span>
                      <span className={`status-badge ${bonusPaid ? 'paid' : bonusEligible ? 'ready' : 'waiting'}`}>
                        Bonus ${payout - 25 > 0 ? payout - 25 : 0} {bonusPaid ? '✓' : bonusEligible ? '⏳' : `(${daysUntilBonus}d)`}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="portal-footer">
          <p>💡 Views are locked 15 days after posting for bonus calculation</p>
        </div>
      </div>

      <style jsx>{`
        .portal-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', system-ui, sans-serif;
          padding: 24px;
        }

        .portal-loading, .portal-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          color: white;
          text-align: center;
        }

        .portal-error h1 { font-size: 24px; margin-bottom: 8px; }
        .portal-error p { opacity: 0.8; }

        .portal-header {
          text-align: center;
          color: white;
          margin-bottom: 32px;
        }

        .portal-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .portal-header p {
          opacity: 0.9;
          font-size: 16px;
          margin: 0;
        }

        .portal-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          max-width: 500px;
          margin: 0 auto 32px;
        }

        @media (min-width: 600px) {
          .portal-stats { grid-template-columns: repeat(4, 1fr); max-width: 800px; }
        }

        .stat-box {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
          color: white;
        }

        .stat-box.highlight {
          background: rgba(255,255,255,0.95);
          color: #764ba2;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-box.highlight .stat-label { opacity: 0.7; }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
        }

        .portal-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          max-width: 800px;
          margin: 0 auto 24px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        .portal-section h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 20px 0;
          color: #1f2937;
        }

        .submit-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #6b7280;
          margin-bottom: 6px;
        }

        .form-row input {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .form-row input:focus {
          outline: none;
          border-color: #764ba2;
        }

        .submit-result {
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 14px;
        }

        .submit-result.success { background: #dcfce7; color: #16a34a; }
        .submit-result.error { background: #fee2e2; color: #dc2626; }

        .submit-form button {
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .submit-form button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .form-group {
          background: #f9fafb;
          border-radius: 12px;
          padding: 16px;
        }

        .form-group h3 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #374151;
        }

        .posts-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-posts {
          text-align: center;
          color: #9ca3af;
          padding: 40px;
        }

        .post-card {
          border: 2px solid #f3f4f6;
          border-radius: 16px;
          padding: 20px;
          transition: border-color 0.2s;
        }

        .post-card:hover { border-color: #e5e7eb; }

        .post-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .post-date {
          font-size: 14px;
          color: #6b7280;
        }

        .post-payout {
          font-size: 20px;
          font-weight: 700;
          color: #16a34a;
        }

        .post-views {
          font-size: 24px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 12px;
        }

        .post-links {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .post-links a {
          padding: 8px 16px;
          background: #f3f4f6;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13px;
          color: #374151;
          transition: background 0.2s;
        }

        .post-links a:hover { background: #e5e7eb; }

        .post-status {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.paid { background: #dcfce7; color: #16a34a; }
        .status-badge.unpaid { background: #fee2e2; color: #dc2626; }
        .status-badge.ready { background: #fef3c7; color: #d97706; }
        .status-badge.waiting { background: #f3f4f6; color: #6b7280; }

        .portal-footer {
          text-align: center;
          color: rgba(255,255,255,0.8);
          font-size: 14px;
          padding: 20px;
        }
      `}</style>
    </>
  )
}

export default function Creators() {
  const router = useRouter()
  const { token } = router.query
  
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
  const [viewMode, setViewMode] = useState('cards') // cards | spreadsheet
  const [editingCell, setEditingCell] = useState(null) // { postId, field }
  const [cellValue, setCellValue] = useState('')
  const [sortField, setSortField] = useState('post_date')
  const [sortDir, setSortDir] = useState('desc')
  // Spreadsheet filters
  const [filterCreator, setFilterCreator] = useState('all')
  const [filterBasePaid, setFilterBasePaid] = useState('all')
  const [filterBonusPaid, setFilterBonusPaid] = useState('all')
  const [filterBonusEligible, setFilterBonusEligible] = useState('all')

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
    
    // Calculate bonuses ready to pay (eligible + not paid + has bonus value)
    const today = new Date()
    const bonusesReady = creatorPosts.filter(p => {
      const eligible = new Date(p.bonus_eligible_date) <= today
      const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      const bonusValue = getPayout(views) - 25
      return eligible && !p.bonus_paid && bonusValue > 0
    })
    const bonusReadyAmount = bonusesReady.reduce((s, p) => {
      const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
      return s + (getPayout(views) - 25)
    }, 0)
    
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
      bonusesReadyCount: bonusesReady.length,
      bonusReadyAmount,
    }
  })

  const grandTotal = {
    owed: creatorData.reduce((s, c) => s + c.totalOwed, 0),
    paid: creatorData.reduce((s, c) => s + c.totalPaid, 0),
    posts: creatorData.reduce((s, c) => s + c.postCount, 0),
    unreconciled: creatorData.reduce((s, c) => s + c.unreconciledCount, 0),
    bonusesReady: creatorData.reduce((s, c) => s + c.bonusReadyAmount, 0),
    bonusesReadyCount: creatorData.reduce((s, c) => s + c.bonusesReadyCount, 0),
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

  // Spreadsheet cell editing
  function startEditCell(postId, field, currentValue) {
    setEditingCell({ postId, field })
    setCellValue(currentValue ?? '')
  }

  function cancelEditCell() {
    setEditingCell(null)
    setCellValue('')
  }

  async function saveCell() {
    if (!editingCell) return
    const { postId, field } = editingCell
    
    // Validate based on field type
    let value = cellValue
    let isValid = true
    let errorMsg = ''
    
    // Integer fields
    if (['tiktok_views', 'instagram_views'].includes(field)) {
      const num = parseInt(value, 10)
      if (value !== '' && (isNaN(num) || num < 0)) {
        isValid = false
        errorMsg = 'Must be a positive number'
      } else {
        value = value === '' ? 0 : num
      }
    }
    
    // Date field
    if (field === 'post_date') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        isValid = false
        errorMsg = 'Must be YYYY-MM-DD format'
      }
    }
    
    // URL fields
    if (['tiktok_url', 'instagram_url'].includes(field)) {
      if (value !== '' && !value.startsWith('http')) {
        isValid = false
        errorMsg = 'Must be a valid URL starting with http'
      }
    }
    
    // Boolean fields (handled separately via checkbox)
    if (['base_paid', 'bonus_paid', 'views_locked'].includes(field)) {
      value = value === 'true' || value === true
    }
    
    if (!isValid) {
      alert(errorMsg)
      return
    }
    
    try {
      await api(`creator_posts?id=eq.${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: value }),
      })
      await loadData()
      setEditingCell(null)
      setCellValue('')
    } catch (err) {
      alert('Error saving: ' + err.message)
    }
  }

  async function toggleBooleanField(postId, field, currentValue, post) {
    // Special validation for bonus_paid
    if (field === 'bonus_paid' && !currentValue) {
      const daysOld = Math.floor((new Date() - new Date(post.post_date)) / (1000 * 60 * 60 * 24))
      if (daysOld < 15) {
        alert(`Cannot mark bonus as paid - post is only ${daysOld} days old (must be 15+ days)`)
        return
      }
    }
    
    try {
      await api(`creator_posts?id=eq.${postId}`, {
        method: 'PATCH',
        body: JSON.stringify({ [field]: !currentValue }),
      })
      await loadData()
    } catch (err) {
      alert('Error saving: ' + err.message)
    }
  }

  function handleCellKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      saveCell()
    } else if (e.key === 'Escape') {
      cancelEditCell()
    }
  }

  // Filter and sort posts for spreadsheet
  const filteredPosts = posts.filter(post => {
    // Creator filter
    if (filterCreator !== 'all' && post.creator_id !== filterCreator) return false
    
    // Base paid filter
    if (filterBasePaid === 'yes' && !post.base_paid) return false
    if (filterBasePaid === 'no' && post.base_paid) return false
    
    // Bonus paid filter
    if (filterBonusPaid === 'yes' && !post.bonus_paid) return false
    if (filterBonusPaid === 'no' && post.bonus_paid) return false
    
    // Bonus eligible filter (15+ days old)
    const daysOld = Math.floor((new Date() - new Date(post.post_date)) / (1000 * 60 * 60 * 24))
    const isEligible = daysOld >= 15
    if (filterBonusEligible === 'yes' && !isEligible) return false
    if (filterBonusEligible === 'no' && isEligible) return false
    
    return true
  })
  
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    let aVal = a[sortField]
    let bVal = b[sortField]
    
    // Handle creator name sort
    if (sortField === 'creator_name') {
      const aCreator = creators.find(c => c.id === a.creator_id)
      const bCreator = creators.find(c => c.id === b.creator_id)
      aVal = aCreator?.name || ''
      bVal = bCreator?.name || ''
    }
    
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  // If token is present, show creator portal
  if (token) {
    return <CreatorPortal token={token} />
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
            <div className="page-header">
              <h1>💰 Creators</h1>
              <div className="view-toggle">
                <button 
                  className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  📊 Dashboard
                </button>
                <button 
                  className={`toggle-btn ${viewMode === 'spreadsheet' ? 'active' : ''}`}
                  onClick={() => setViewMode('spreadsheet')}
                >
                  📋 Spreadsheet
                </button>
              </div>
            </div>
            
            {viewMode === 'cards' ? (
            <>
            {/* Summary Card */}
            <div className="summary-card">
              <div className="summary-header">
                <div className="summary-title">Payout Summary</div>
                <div className="sync-area">
                  {payments.length > 0 && (
                    <span className="last-synced">
                      Last synced: {(() => {
                        const lastSync = payments.reduce((latest, p) => {
                          const t = new Date(p.created_at)
                          return t > latest ? t : latest
                        }, new Date(0))
                        if (lastSync.getTime() === 0) return 'Never'
                        const now = new Date()
                        const diffMs = now - lastSync
                        const diffMins = Math.floor(diffMs / 60000)
                        const diffHours = Math.floor(diffMs / 3600000)
                        const diffDays = Math.floor(diffMs / 86400000)
                        if (diffMins < 1) return 'Just now'
                        if (diffMins < 60) return `${diffMins}m ago`
                        if (diffHours < 24) return `${diffHours}h ago`
                        return `${diffDays}d ago`
                      })()}
                    </span>
                  )}
                  <button 
                    className={`sync-btn ${syncing ? 'syncing' : ''}`}
                    onClick={syncMercury}
                    disabled={syncing}
                  >
                    {syncing ? '⏳ Syncing...' : '🔄 Sync Mercury'}
                  </button>
                </div>
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
              {grandTotal.bonusesReady > 0 && (
                <div className="bonuses-ready-table">
                  <div className="table-header">
                    <span>Bonuses Ready to Pay</span>
                    <span className="table-total">${grandTotal.bonusesReady.toLocaleString()}</span>
                  </div>
                  <div className="table-rows">
                    {creatorData.filter(c => c.bonusReadyAmount > 0).map(c => {
                      const readyPosts = c.posts.filter(p => {
                        const eligible = new Date(p.bonus_eligible_date) <= new Date()
                        const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                        const bonusValue = getPayout(views) - 25
                        return eligible && !p.bonus_paid && bonusValue > 0
                      })
                      return readyPosts.map(p => {
                        const views = Math.max(p.tiktok_views || 0, p.instagram_views || 0)
                        const bonus = getPayout(views) - 25
                        return (
                          <div key={p.id} className="table-row">
                            <span className="row-creator">{c.name}</span>
                            <span className="row-date">{formatDate(p.post_date)}</span>
                            <span className="row-views">{formatNumber(views)}</span>
                            <span className="row-bonus">${bonus}</span>
                            <span className="row-updated" title={p.updated_at}>
                              {p.updated_at ? new Date(p.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </span>
                          </div>
                        )
                      })
                    })}
                  </div>
                </div>
              )}
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
                            {c.tiktok_handle && (
                              <a 
                                href={`https://www.tiktok.com/@${c.tiktok_handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="handle-tag handle-link"
                              >
                                🎵 TikTok
                              </a>
                            )}
                            {c.instagram_handle && (
                              <a 
                                href={`https://www.instagram.com/${c.instagram_handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="handle-tag handle-link"
                              >
                                📸 Instagram
                              </a>
                            )}
                            {c.mercury_name && <span className="handle-tag mercury">💳 {c.mercury_name}</span>}
                          </div>
                          <div className="creator-meta">
                            <span className="meta-item">📹 {c.postCount} posts</span>
                            <span className="meta-item">👁 {formatNumber(c.totalViews)}</span>
                            {c.unreconciledCount > 0 && (
                              <span className="meta-item unreconciled">⚠️ {c.unreconciledCount}</span>
                            )}
                            {c.bonusReadyAmount > 0 && (
                              <span className="meta-item bonus-ready">🎉 ${c.bonusReadyAmount}</span>
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
            </>
            ) : (
            /* Spreadsheet View */
            <div className="spreadsheet-container">
              <div className="spreadsheet-header">
                <div className="spreadsheet-title-row">
                  <h2>📋 Raw Data ({sortedPosts.length}{sortedPosts.length !== posts.length ? ` of ${posts.length}` : ''} posts)</h2>
                  <p className="spreadsheet-help">Click any cell to edit. Press Enter to save, Escape to cancel.</p>
                </div>
                <div className="filter-bar">
                  <div className="filter-item">
                    <label>Creator</label>
                    <select value={filterCreator} onChange={(e) => setFilterCreator(e.target.value)}>
                      <option value="all">All Creators</option>
                      {creators.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Base Paid</label>
                    <select value={filterBasePaid} onChange={(e) => setFilterBasePaid(e.target.value)}>
                      <option value="all">All</option>
                      <option value="yes">✓ Paid</option>
                      <option value="no">✗ Unpaid</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Bonus Paid</label>
                    <select value={filterBonusPaid} onChange={(e) => setFilterBonusPaid(e.target.value)}>
                      <option value="all">All</option>
                      <option value="yes">✓ Paid</option>
                      <option value="no">✗ Unpaid</option>
                    </select>
                  </div>
                  <div className="filter-item">
                    <label>Bonus Eligible</label>
                    <select value={filterBonusEligible} onChange={(e) => setFilterBonusEligible(e.target.value)}>
                      <option value="all">All</option>
                      <option value="yes">✓ Eligible (15+ days)</option>
                      <option value="no">⏳ Not Yet</option>
                    </select>
                  </div>
                  {(filterCreator !== 'all' || filterBasePaid !== 'all' || filterBonusPaid !== 'all' || filterBonusEligible !== 'all') && (
                    <button 
                      className="clear-filters-btn"
                      onClick={() => {
                        setFilterCreator('all')
                        setFilterBasePaid('all')
                        setFilterBonusPaid('all')
                        setFilterBonusEligible('all')
                      }}
                    >
                      ✕ Clear Filters
                    </button>
                  )}
                </div>
              </div>
              <div className="spreadsheet-wrapper">
                <table className="spreadsheet">
                  <thead>
                    <tr>
                      <th className="sortable" onClick={() => toggleSort('creator_name')}>
                        Creator {sortField === 'creator_name' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="sortable" onClick={() => toggleSort('post_date')}>
                        Date {sortField === 'post_date' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>TikTok URL</th>
                      <th className="sortable num" onClick={() => toggleSort('tiktok_views')}>
                        TT Views {sortField === 'tiktok_views' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Instagram URL</th>
                      <th className="sortable num" onClick={() => toggleSort('instagram_views')}>
                        IG Views {sortField === 'instagram_views' && (sortDir === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="center">Base Paid</th>
                      <th className="center">Bonus Paid</th>
                      <th className="center">Locked</th>
                      <th>Bonus Date</th>
                      <th className="num">Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPosts.map(post => {
                      const creator = creators.find(c => c.id === post.creator_id)
                      const views = Math.max(post.tiktok_views || 0, post.instagram_views || 0)
                      const payout = getPayout(views)
                      const daysOld = Math.floor((new Date() - new Date(post.post_date)) / (1000 * 60 * 60 * 24))
                      const bonusEligible = daysOld >= 15
                      
                      return (
                        <tr key={post.id} className={bonusEligible ? 'eligible' : ''}>
                          <td className="creator-cell">{creator?.name || '—'}</td>
                          
                          {/* Date - editable */}
                          <td 
                            className={`editable ${editingCell?.postId === post.id && editingCell?.field === 'post_date' ? 'editing' : ''}`}
                            onClick={() => !editingCell && startEditCell(post.id, 'post_date', post.post_date)}
                          >
                            {editingCell?.postId === post.id && editingCell?.field === 'post_date' ? (
                              <input
                                type="date"
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                onBlur={saveCell}
                                autoFocus
                              />
                            ) : (
                              post.post_date
                            )}
                          </td>
                          
                          {/* TikTok URL - editable */}
                          <td 
                            className={`editable url-cell ${editingCell?.postId === post.id && editingCell?.field === 'tiktok_url' ? 'editing' : ''}`}
                            onClick={() => !editingCell && startEditCell(post.id, 'tiktok_url', post.tiktok_url)}
                          >
                            {editingCell?.postId === post.id && editingCell?.field === 'tiktok_url' ? (
                              <input
                                type="url"
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                onBlur={saveCell}
                                placeholder="https://..."
                                autoFocus
                              />
                            ) : post.tiktok_url ? (
                              <a href={post.tiktok_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                🔗 TikTok
                              </a>
                            ) : (
                              <span className="empty">—</span>
                            )}
                          </td>
                          
                          {/* TikTok Views - editable */}
                          <td 
                            className={`editable num ${editingCell?.postId === post.id && editingCell?.field === 'tiktok_views' ? 'editing' : ''}`}
                            onClick={() => !editingCell && startEditCell(post.id, 'tiktok_views', post.tiktok_views)}
                          >
                            {editingCell?.postId === post.id && editingCell?.field === 'tiktok_views' ? (
                              <input
                                type="number"
                                min="0"
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                onBlur={saveCell}
                                autoFocus
                              />
                            ) : (
                              (post.tiktok_views || 0).toLocaleString()
                            )}
                          </td>
                          
                          {/* Instagram URL - editable */}
                          <td 
                            className={`editable url-cell ${editingCell?.postId === post.id && editingCell?.field === 'instagram_url' ? 'editing' : ''}`}
                            onClick={() => !editingCell && startEditCell(post.id, 'instagram_url', post.instagram_url)}
                          >
                            {editingCell?.postId === post.id && editingCell?.field === 'instagram_url' ? (
                              <input
                                type="url"
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                onBlur={saveCell}
                                placeholder="https://..."
                                autoFocus
                              />
                            ) : post.instagram_url ? (
                              <a href={post.instagram_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                🔗 Instagram
                              </a>
                            ) : (
                              <span className="empty">—</span>
                            )}
                          </td>
                          
                          {/* Instagram Views - editable */}
                          <td 
                            className={`editable num ${editingCell?.postId === post.id && editingCell?.field === 'instagram_views' ? 'editing' : ''}`}
                            onClick={() => !editingCell && startEditCell(post.id, 'instagram_views', post.instagram_views)}
                          >
                            {editingCell?.postId === post.id && editingCell?.field === 'instagram_views' ? (
                              <input
                                type="number"
                                min="0"
                                value={cellValue}
                                onChange={(e) => setCellValue(e.target.value)}
                                onKeyDown={handleCellKeyDown}
                                onBlur={saveCell}
                                autoFocus
                              />
                            ) : (
                              (post.instagram_views || 0).toLocaleString()
                            )}
                          </td>
                          
                          {/* Base Paid - reconciliation status */}
                          <td className="center reconcile-cell">
                            {(() => {
                              const baseLink = postPayments.find(pp => pp.post_id === post.id && pp.payment_type === 'base')
                              if (baseLink) {
                                const payment = payments.find(p => p.id === baseLink.payment_id)
                                return (
                                  <span className="reconciled-badge" title={`Reconciled: $${baseLink.amount} on ${payment?.payment_date || '?'}`}>
                                    ✓ ${baseLink.amount}
                                  </span>
                                )
                              }
                              return <span className="unpaid-badge">Unpaid</span>
                            })()}
                          </td>
                          
                          {/* Bonus Paid - reconciliation status */}
                          <td className={`center reconcile-cell ${!bonusEligible ? 'disabled-cell' : ''}`}>
                            {(() => {
                              const bonusLink = postPayments.find(pp => pp.post_id === post.id && pp.payment_type === 'bonus')
                              if (bonusLink) {
                                const payment = payments.find(p => p.id === bonusLink.payment_id)
                                return (
                                  <span className="reconciled-badge" title={`Reconciled: $${bonusLink.amount} on ${payment?.payment_date || '?'}`}>
                                    ✓ ${bonusLink.amount}
                                  </span>
                                )
                              }
                              if (!bonusEligible) {
                                return <span className="waiting-badge">⏳ {15 - daysOld}d</span>
                              }
                              const bonusAmount = payout - 25
                              if (bonusAmount <= 0) {
                                return <span className="na-badge">—</span>
                              }
                              return <span className="unpaid-badge">${bonusAmount} due</span>
                            })()}
                          </td>
                          
                          {/* Views Locked - checkbox (keep this editable) */}
                          <td className="center">
                            <input
                              type="checkbox"
                              checked={post.views_locked || false}
                              onChange={() => toggleBooleanField(post.id, 'views_locked', post.views_locked, post)}
                            />
                          </td>
                          
                          {/* Bonus Eligible Date - read only */}
                          <td className="readonly">{post.bonus_eligible_date || '—'}</td>
                          
                          {/* Payout - calculated */}
                          <td className="num payout-cell">${payout}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="spreadsheet-legend">
                <span><span className="legend-dot eligible"></span> Bonus eligible (15+ days)</span>
                <span><span className="legend-dot"></span> Not yet eligible</span>
                <span>⏳ = Days remaining until bonus eligible</span>
              </div>
            </div>
            )}
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

        .sync-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .last-synced {
          font-size: 13px;
          color: #6B7280;
        }

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

        .layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
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
        .handle-tag.handle-link { 
          text-decoration: none; 
          cursor: pointer;
          transition: all 0.2s;
        }
        .handle-tag.handle-link:hover { 
          background: #3B82F6; 
          color: white; 
        }

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

        .bonuses-ready-table {
          margin-top: 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #dcfce7;
          font-weight: 600;
          color: #16a34a;
          border-bottom: 1px solid #bbf7d0;
        }
        
        .table-total { font-size: 18px; font-weight: 700; }
        
        .table-rows { max-height: 200px; overflow-y: auto; }
        
        .table-row {
          display: grid;
          grid-template-columns: 80px 70px 70px 60px 1fr;
          gap: 8px;
          padding: 10px 16px;
          font-size: 13px;
          border-bottom: 1px solid #dcfce7;
          align-items: center;
        }
        
        .table-row:last-child { border-bottom: none; }
        .table-row:hover { background: #dcfce7; }
        
        .row-creator { font-weight: 500; }
        .row-date { color: #6B7280; }
        .row-views { color: #6B7280; }
        .row-bonus { font-weight: 600; color: #16a34a; }
        .row-updated { color: #9CA3AF; font-size: 11px; text-align: right; }
        
        .meta-item.bonus-ready { 
          color: #16a34a; 
          font-weight: 600; 
          background: #dcfce7;
          padding: 2px 8px;
          border-radius: 6px;
        }

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

        /* Page Header with Toggle */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-header h1 { margin: 0; }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: #F5F5F5;
          padding: 4px;
          border-radius: 12px;
        }

        .toggle-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 10px;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms;
        }

        .toggle-btn:hover { background: #E5E7EB; }
        .toggle-btn.active { background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }

        /* Spreadsheet View */
        .spreadsheet-container {
          background: white;
          border: 1px solid #F5F5F5;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .spreadsheet-header {
          margin-bottom: 20px;
        }

        .spreadsheet-header h2 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .spreadsheet-help {
          font-size: 13px;
          color: #6B7280;
          margin: 0;
        }

        .spreadsheet-title-row {
          margin-bottom: 16px;
        }

        .filter-bar {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          align-items: flex-end;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .filter-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-item label {
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .filter-item select {
          padding: 8px 12px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 13px;
          background: white;
          cursor: pointer;
          min-width: 140px;
        }

        .filter-item select:focus {
          outline: none;
          border-color: #6366F1;
        }

        .clear-filters-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          background: #FEE2E2;
          color: #DC2626;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 200ms;
        }

        .clear-filters-btn:hover {
          background: #FECACA;
        }

        .spreadsheet-wrapper {
          overflow-x: auto;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
        }

        .spreadsheet {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 1000px;
        }

        .spreadsheet th {
          background: #F9FAFB;
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
          white-space: nowrap;
          position: sticky;
          top: 0;
        }

        .spreadsheet th.sortable {
          cursor: pointer;
          user-select: none;
        }

        .spreadsheet th.sortable:hover {
          background: #F3F4F6;
        }

        .spreadsheet th.num,
        .spreadsheet td.num {
          text-align: right;
        }

        .spreadsheet th.center,
        .spreadsheet td.center {
          text-align: center;
        }

        .spreadsheet td {
          padding: 10px;
          border-bottom: 1px solid #F3F4F6;
          vertical-align: middle;
        }

        .spreadsheet tr:hover td {
          background: #FAFAFA;
        }

        .spreadsheet tr.eligible td {
          background: #f0fdf4;
        }

        .spreadsheet tr.eligible:hover td {
          background: #dcfce7;
        }

        .spreadsheet td.editable {
          cursor: pointer;
          position: relative;
        }

        .spreadsheet td.editable:hover {
          background: #EEF2FF;
          outline: 2px solid #6366F1;
          outline-offset: -2px;
        }

        .spreadsheet td.editable.editing {
          padding: 4px;
          background: white;
        }

        .spreadsheet td.editable input {
          width: 100%;
          padding: 6px 8px;
          border: 2px solid #6366F1;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
        }

        .spreadsheet td.editable input[type="number"] {
          text-align: right;
        }

        .spreadsheet td.url-cell {
          max-width: 120px;
        }

        .spreadsheet td.url-cell a {
          color: #3B82F6;
          text-decoration: none;
          font-size: 12px;
        }

        .spreadsheet td.url-cell a:hover {
          text-decoration: underline;
        }

        .spreadsheet td .empty {
          color: #D1D5DB;
        }

        .spreadsheet td.readonly {
          color: #9CA3AF;
          font-style: italic;
        }

        .spreadsheet td.disabled-cell {
          background: #F9FAFB;
        }

        .spreadsheet td.disabled-cell input[type="checkbox"] {
          opacity: 0.4;
        }

        .spreadsheet td .days-left {
          font-size: 11px;
          margin-left: 4px;
        }

        .spreadsheet td.payout-cell {
          font-weight: 600;
          color: #16a34a;
        }

        .spreadsheet td.creator-cell {
          font-weight: 500;
        }

        .spreadsheet td.reconcile-cell {
          min-width: 80px;
        }

        .reconciled-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #dcfce7;
          color: #16a34a;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .unpaid-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #fee2e2;
          color: #dc2626;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .waiting-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #fef3c7;
          color: #d97706;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }

        .na-badge {
          color: #9CA3AF;
          font-size: 12px;
        }

        .spreadsheet input[type="checkbox"] {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .spreadsheet-legend {
          display: flex;
          gap: 24px;
          margin-top: 16px;
          font-size: 12px;
          color: #6B7280;
          flex-wrap: wrap;
        }

        .legend-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 3px;
          background: #F3F4F6;
          margin-right: 6px;
          vertical-align: middle;
        }

        .legend-dot.eligible {
          background: #dcfce7;
        }

        @media (max-width: 767px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .view-toggle {
            justify-content: center;
          }
          
          .spreadsheet-container {
            padding: 16px;
          }
        }
      `}</style>
    </>
  )
}

// Mercury Sync API - pulls transactions and matches to creators
const MERCURY_TOKEN = process.env.MERCURY_API_TOKEN
const MERCURY_CHECKING_ID = process.env.MERCURY_CHECKING_ID || '81c3b1ac-6b06-11ee-b0cb-5f10e78edea2'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Map Mercury names to creator names
const NAME_MAP = {
  'nicholas schindehette': 'Nick',
  'nick schindehette': 'Nick',
  'luke williams': 'Luke',
  'abigail edwards': 'Abby',
  'abby edwards': 'Abby',
  'jacob': 'Jake',
  'jake': 'Jake',
}

function matchCreator(counterpartyName) {
  if (!counterpartyName) return null
  const lower = counterpartyName.toLowerCase()
  for (const [key, value] of Object.entries(NAME_MAP)) {
    if (lower.includes(key)) return value
  }
  return null
}

export default async function handler(req, res) {
  if (!MERCURY_TOKEN) {
    return res.status(500).json({ error: 'MERCURY_API_TOKEN not configured' })
  }

  try {
    // 1. Fetch creators from Supabase
    const creatorsRes = await fetch(`${SUPABASE_URL}/rest/v1/creators?select=id,name`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    const creators = await creatorsRes.json()
    const creatorMap = {}
    creators.forEach(c => { creatorMap[c.name] = c.id })

    // 2. Fetch existing payouts to avoid duplicates
    const payoutsRes = await fetch(`${SUPABASE_URL}/rest/v1/creator_payouts?select=mercury_ref`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    const existingPayouts = await payoutsRes.json()
    const existingRefs = new Set(existingPayouts.map(p => p.mercury_ref).filter(Boolean))

    // 3. Fetch Mercury transactions
    const mercuryRes = await fetch(
      `https://api.mercury.com/api/v1/account/${MERCURY_CHECKING_ID}/transactions?limit=100`,
      { headers: { 'Authorization': `Bearer ${MERCURY_TOKEN}` } }
    )
    const mercuryData = await mercuryRes.json()
    
    if (!mercuryData.transactions) {
      return res.status(500).json({ error: 'Failed to fetch Mercury transactions', details: mercuryData })
    }

    // 4. Filter for creator payments (negative amounts = outgoing)
    const creatorPayments = mercuryData.transactions
      .filter(t => t.amount < 0)
      .map(t => ({
        id: t.id,
        date: t.postedAt?.slice(0, 10),
        amount: Math.abs(t.amount),
        name: t.counterpartyName,
        note: t.note,
        creator: matchCreator(t.counterpartyName),
      }))
      .filter(t => t.creator && !existingRefs.has(t.id))

    // 5. Insert new payments
    const inserted = []
    for (const payment of creatorPayments) {
      const creatorId = creatorMap[payment.creator]
      if (!creatorId) continue

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/creator_payouts`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          creator_id: creatorId,
          amount_paid: payment.amount,
          payment_date: payment.date,
          mercury_ref: payment.id,
          status: 'paid',
          period_start: payment.date,
          period_end: payment.date,
        }),
      })
      
      if (insertRes.ok) {
        inserted.push(payment)
      }
    }

    // 6. Get updated totals
    const totalsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/creator_payouts?select=creator_id,amount_paid`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    const allPayouts = await totalsRes.json()
    
    const totals = {}
    creators.forEach(c => { totals[c.name] = 0 })
    allPayouts.forEach(p => {
      const creator = creators.find(c => c.id === p.creator_id)
      if (creator) totals[creator.name] += Number(p.amount_paid || 0)
    })

    res.status(200).json({
      success: true,
      newPayments: inserted.length,
      inserted,
      totals,
      scanned: mercuryData.transactions.length,
    })

  } catch (error) {
    console.error('Mercury sync error:', error)
    res.status(500).json({ error: error.message })
  }
}

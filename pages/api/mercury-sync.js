// Mercury Sync API - pulls transactions from ALL accounts and matches to creators
const MERCURY_TOKEN = process.env.MERCURY_API_TOKEN
const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

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
    // 1. Fetch ALL Mercury accounts
    const accountsRes = await fetch('https://api.mercury.com/api/v1/accounts', {
      headers: { 'Authorization': `Bearer ${MERCURY_TOKEN}` }
    })
    const accountsData = await accountsRes.json()
    
    if (!accountsData.accounts) {
      return res.status(500).json({ error: 'Failed to fetch Mercury accounts', details: accountsData })
    }

    // 2. Fetch creators from Supabase
    const creatorsRes = await fetch(`${SUPABASE_URL}/rest/v1/creators?select=id,name`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    const creators = await creatorsRes.json()
    
    if (!Array.isArray(creators)) {
      return res.status(500).json({ error: 'Failed to fetch creators', details: creators })
    }
    
    const creatorMap = {}
    creators.forEach(c => { creatorMap[c.name] = c.id })

    // 3. Fetch existing payouts to avoid duplicates
    const payoutsRes = await fetch(`${SUPABASE_URL}/rest/v1/creator_payouts?select=mercury_ref`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    const existingPayouts = await payoutsRes.json()
    const existingRefs = new Set(
      Array.isArray(existingPayouts) 
        ? existingPayouts.map(p => p.mercury_ref).filter(Boolean)
        : []
    )

    // 4. Fetch transactions from ALL accounts
    let allTransactions = []
    const accountsSummary = []
    
    for (const account of accountsData.accounts) {
      const txnRes = await fetch(
        `https://api.mercury.com/api/v1/account/${account.id}/transactions?limit=100`,
        { headers: { 'Authorization': `Bearer ${MERCURY_TOKEN}` } }
      )
      const txnData = await txnRes.json()
      
      if (txnData.transactions) {
        // Tag each transaction with account info
        const tagged = txnData.transactions.map(t => ({
          ...t,
          accountName: account.name,
          accountId: account.id,
        }))
        allTransactions = allTransactions.concat(tagged)
        accountsSummary.push({
          name: account.name,
          kind: account.kind,
          balance: account.currentBalance,
          transactions: txnData.transactions.length,
        })
      }
    }

    // 5. Filter for creator payments (negative amounts = outgoing)
    const creatorPayments = allTransactions
      .filter(t => t.amount < 0)
      .map(t => ({
        id: t.id,
        date: t.postedAt?.slice(0, 10),
        amount: Math.abs(t.amount),
        name: t.counterpartyName,
        note: t.note,
        creator: matchCreator(t.counterpartyName),
        account: t.accountName,
      }))
      .filter(t => t.creator && !existingRefs.has(t.id))

    // 6. Insert new payments
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

    // 7. Get updated totals
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
    if (Array.isArray(allPayouts)) {
      allPayouts.forEach(p => {
        const creator = creators.find(c => c.id === p.creator_id)
        if (creator) totals[creator.name] += Number(p.amount_paid || 0)
      })
    }

    res.status(200).json({
      success: true,
      newPayments: inserted.length,
      inserted,
      totals,
      accounts: accountsSummary,
      totalTransactionsScanned: allTransactions.length,
    })

  } catch (error) {
    console.error('Mercury sync error:', error)
    res.status(500).json({ error: error.message })
  }
}

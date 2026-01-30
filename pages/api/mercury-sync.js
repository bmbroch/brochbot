// Mercury Sync API - pulls transactions from ALL accounts and matches to creators
const MERCURY_TOKEN = process.env.MERCURY_API_TOKEN
const SUPABASE_URL = 'https://ibluforpuicmxzmevbmj.supabase.co'
const SUPABASE_KEY = 'sb_publishable_SQd68zFS8mKRsWhvR3Skzw_yqVgfe_T'

// Match Mercury counterparty to creator using mercury_name field
function matchCreator(counterpartyName, creators) {
  if (!counterpartyName) return null
  const lower = counterpartyName.toLowerCase()
  
  for (const creator of creators) {
    if (creator.mercury_name && lower.includes(creator.mercury_name.toLowerCase())) {
      return creator.id
    }
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

    // 2. Fetch creators from Supabase (including mercury_name for matching)
    const creatorsRes = await fetch(`${SUPABASE_URL}/rest/v1/creators?select=id,name,mercury_name`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    const creators = await creatorsRes.json()
    
    if (!Array.isArray(creators)) {
      return res.status(500).json({ error: 'Failed to fetch creators', details: creators })
    }

    // 3. Fetch existing payments to avoid duplicates
    const payoutsRes = await fetch(`${SUPABASE_URL}/rest/v1/creator_payments?select=mercury_id`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    })
    const existingPayouts = await payoutsRes.json()
    const existingRefs = new Set(
      Array.isArray(existingPayouts) 
        ? existingPayouts.map(p => p.mercury_id).filter(Boolean)
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
        creatorId: matchCreator(t.counterpartyName, creators),
        account: t.accountName,
      }))
      .filter(t => t.creatorId && !existingRefs.has(t.id))

    // 6. Insert new payments
    const inserted = []
    for (const payment of creatorPayments) {
      const creatorId = payment.creatorId
      if (!creatorId) continue

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/creator_payments`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          creator_id: creatorId,
          amount: payment.amount,
          payment_date: payment.date,
          mercury_id: payment.id,
          mercury_note: payment.note,
          status: 'unreconciled',
        }),
      })
      
      if (insertRes.ok) {
        inserted.push(payment)
      }
    }

    // 7. Get updated totals
    const totalsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/creator_payments?select=creator_id,amount`,
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
        if (creator) totals[creator.name] += Number(p.amount || 0)
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

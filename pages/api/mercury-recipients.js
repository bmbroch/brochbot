// Fetch unique recipients from Mercury transactions
const MERCURY_TOKEN = process.env.MERCURY_API_TOKEN

export default async function handler(req, res) {
  if (!MERCURY_TOKEN) {
    return res.status(500).json({ error: 'MERCURY_API_TOKEN not configured' })
  }

  try {
    // Fetch all accounts
    const accountsRes = await fetch('https://api.mercury.com/api/v1/accounts', {
      headers: { 'Authorization': `Bearer ${MERCURY_TOKEN}` }
    })
    const accountsData = await accountsRes.json()
    
    if (!accountsData.accounts) {
      return res.status(500).json({ error: 'Failed to fetch accounts' })
    }

    // Fetch transactions from all accounts
    const allRecipients = new Map()
    
    for (const account of accountsData.accounts) {
      const txnRes = await fetch(
        `https://api.mercury.com/api/v1/account/${account.id}/transactions?limit=200`,
        { headers: { 'Authorization': `Bearer ${MERCURY_TOKEN}` } }
      )
      const txnData = await txnRes.json()
      
      if (txnData.transactions) {
        for (const t of txnData.transactions) {
          // Only outgoing payments (negative amounts)
          if (t.amount < 0 && t.counterpartyName) {
            const name = t.counterpartyName
            const existing = allRecipients.get(name)
            if (existing) {
              existing.count++
              existing.totalPaid += Math.abs(t.amount)
              if (t.postedAt > existing.lastDate) existing.lastDate = t.postedAt
            } else {
              allRecipients.set(name, {
                name,
                count: 1,
                totalPaid: Math.abs(t.amount),
                lastDate: t.postedAt,
              })
            }
          }
        }
      }
    }

    // Convert to array and sort by total paid
    const recipients = Array.from(allRecipients.values())
      .sort((a, b) => b.totalPaid - a.totalPaid)

    res.status(200).json({ recipients })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

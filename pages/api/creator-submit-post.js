import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ibluforpuicmxzmevbmj.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
)

// Extract TikTok video ID from URL
function extractTikTokId(url) {
  if (!url) return null
  const match = url.match(/video\/(\d+)/)
  return match ? match[1] : null
}

// Extract Instagram shortcode from URL
function extractInstagramCode(url) {
  if (!url) return null
  const match = url.match(/\/(p|reel|reels)\/([A-Za-z0-9_-]+)/)
  return match ? match[2] : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { 
    token, 
    post_date,
    tiktok_url, 
    tiktok_views,
    instagram_url, 
    instagram_views 
  } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Missing token' })
  }

  if (!tiktok_url && !instagram_url) {
    return res.status(400).json({ error: 'Please provide at least one URL' })
  }

  if (!post_date) {
    return res.status(400).json({ error: 'Please provide a post date' })
  }

  // Validate token and get creator
  const { data: creator, error: creatorError } = await supabase
    .from('creators')
    .select('*')
    .eq('token', token)
    .single()

  if (creatorError || !creator) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Extract IDs
  const tiktokId = extractTikTokId(tiktok_url)
  const instagramCode = extractInstagramCode(instagram_url)

  // Check for duplicate TikTok
  if (tiktokId) {
    const { data: existing } = await supabase
      .from('creator_posts')
      .select('id')
      .eq('tiktok_post_id', tiktokId)
      .single()

    if (existing) {
      return res.status(400).json({ error: 'This TikTok video has already been submitted' })
    }
  }

  // Check for duplicate Instagram
  if (instagramCode) {
    const { data: existing } = await supabase
      .from('creator_posts')
      .select('id')
      .eq('instagram_post_id', instagramCode)
      .single()

    if (existing) {
      return res.status(400).json({ error: 'This Instagram post has already been submitted' })
    }
  }

  // Calculate bonus eligible date (15 days after post)
  const postDate = new Date(post_date)
  const bonusDate = new Date(postDate)
  bonusDate.setDate(bonusDate.getDate() + 15)
  const bonusDateStr = bonusDate.toISOString().split('T')[0]

  // Insert post
  const { data: newPost, error: insertError } = await supabase
    .from('creator_posts')
    .insert({
      creator_id: creator.id,
      post_date: post_date,
      tiktok_url: tiktok_url || null,
      tiktok_post_id: tiktokId || null,
      tiktok_views: tiktok_views || 0,
      instagram_url: instagram_url || null,
      instagram_post_id: instagramCode || null,
      instagram_views: instagram_views || 0,
      base_paid: false,
      bonus_paid: false,
      bonus_eligible_date: bonusDateStr,
      views_locked: false,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Insert error:', insertError)
    return res.status(500).json({ error: 'Failed to save post' })
  }

  return res.status(200).json({
    success: true,
    post: newPost,
  })
}

import { createClient } from '@supabase/supabase-js'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

// Scrape TikTok views using yt-dlp
async function scrapeTikTokViews(url) {
  try {
    const { stdout } = await execAsync(
      `/tmp/yt-dlp -j "${url}" 2>/dev/null | head -1`,
      { timeout: 30000 }
    )
    const data = JSON.parse(stdout)
    return {
      views: data.view_count || 0,
      id: data.id,
      timestamp: data.timestamp,
    }
  } catch (err) {
    console.error('TikTok scrape error:', err.message)
    return null
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, tiktok_url, instagram_url } = req.body

  if (!token) {
    return res.status(400).json({ error: 'Missing token' })
  }

  if (!tiktok_url && !instagram_url) {
    return res.status(400).json({ error: 'Please provide at least one URL' })
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

  // Check for duplicate
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

  // Scrape views
  let tiktokViews = 0
  let tiktokTimestamp = null

  if (tiktok_url) {
    const tiktokData = await scrapeTikTokViews(tiktok_url)
    if (tiktokData) {
      tiktokViews = tiktokData.views
      tiktokTimestamp = tiktokData.timestamp
    }
  }

  // Determine post date
  let postDate = new Date()
  if (tiktokTimestamp) {
    postDate = new Date(tiktokTimestamp * 1000)
  }
  const postDateStr = postDate.toISOString().split('T')[0]

  // Calculate bonus eligible date (15 days after post)
  const bonusDate = new Date(postDate)
  bonusDate.setDate(bonusDate.getDate() + 15)
  const bonusDateStr = bonusDate.toISOString().split('T')[0]

  // Insert post
  const { data: newPost, error: insertError } = await supabase
    .from('creator_posts')
    .insert({
      creator_id: creator.id,
      post_date: postDateStr,
      tiktok_url: tiktok_url || null,
      tiktok_post_id: tiktokId || null,
      tiktok_views: tiktokViews,
      instagram_url: instagram_url || null,
      instagram_post_id: instagramCode || null,
      instagram_views: 0, // Will need manual entry or RapidAPI
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
    views_scraped: tiktokViews,
  })
}

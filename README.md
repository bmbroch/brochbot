# Brochbot - Task Tracker

**URL:** [brochbot.com](https://brochbot.com)

The central hub for tracking everything Brochbot should work on. This is the **source of truth** for Ben and Brochbot to manage tasks, workflows, and projects.

## 🎯 Purpose

Ben adds tasks via the UI → Brochbot reads from the database and executes.

- **Ben**: Add, edit, prioritize tasks through the web interface
- **Brochbot**: Query the database to know what to work on next
- **Shared**: Both can see the same data in real-time

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Static HTML/CSS/JS |
| Backend | Supabase (PostgreSQL) |
| Hosting | Vercel |
| Repo | github.com/bmbroch/brochbot |
| Domain | brochbot.com |

## 📊 Database (Supabase)

**Project:** ibluforpuicmxzmevbmj

### Tables

**tasks** - Main task tracking
- `id` (UUID) - Primary key
- `title` (text) - Task name
- `description` (text) - Brief summary
- `details` (text) - Full details, steps, context
- `status` (text) - todo / in_progress / done
- `priority` (text) - high / medium / low
- `category` (text) - Business category
- `due_date` (date) - Optional deadline
- `created_at` (timestamp)
- `updated_at` (timestamp)

**creators** - UGC creator tracking
- `id`, `name`, `handle`, `platform`, `tiktok_handle`, `instagram_handle`, `email`, `active`

**posts** - Creator content posts
- `id`, `creator_id`, `platform`, `post_url`, `post_date`, `views`, `earnings`, `bonus_eligible_date`, `bonus_paid`

**payment_tiers** - Earnings tiers
- `id`, `tier_name`, `min_views`, `max_views`, `payout`

**payments** - Payment records
- `id`, `creator_id`, `amount`, `payment_date`, `notes`

## 🌐 Pages

| URL | Purpose |
|-----|---------|
| brochbot.com | Main task tracker |
| /tasks.html | Tasks (same as main) |
| /creator-payouts.html | UGC creator payment tracking |
| /analytics.html | Analytics dashboard (placeholder) |
| /competitors.html | Competitor tracking (placeholder) |

## 🔌 API Access

Brochbot can read/write via Supabase REST API:

```bash
# Read all tasks
curl "https://ibluforpuicmxzmevbmj.supabase.co/rest/v1/tasks" \
  -H "apikey: $SUPABASE_KEY" \
  -H "Authorization: Bearer $SUPABASE_KEY"

# Read only "todo" tasks
curl "https://ibluforpuicmxzmevbmj.supabase.co/rest/v1/tasks?status=eq.todo" \
  -H "apikey: $SUPABASE_KEY"
```

## 📁 File Structure

```
brochbot/
├── index.html           # Main task tracker page
├── tasks.html           # Tasks page
├── creator-payouts.html # Creator payment tracking
├── analytics.html       # Analytics (placeholder)
├── competitors.html     # Competitors (placeholder)
├── style.css            # Main stylesheet
├── vercel.json          # Vercel config
└── README.md            # This file
```

## 🚀 Deployment

Automatic via Vercel:
1. Push to `main` branch on GitHub
2. Vercel auto-deploys within ~60 seconds
3. Live at brochbot.com

## 📝 How It Works

1. **Ben adds a task** on brochbot.com
   - Clicks "+ Add Task"
   - Fills in title, details, priority, category
   - Saves → stored in Supabase

2. **Brochbot checks tasks**
   - Queries Supabase API
   - Reads task details
   - Works on highest priority items

3. **Updates flow both ways**
   - Ben updates status via UI
   - Brochbot can update via API
   - Both see changes instantly

## 🏷️ Task Categories

- **interview_sidekick** - Interview Sidekick product
- **sales_echo** - Sales Echo product
- **cover_letter** - Cover Letter Copilot product
- **brochbot** - Brochbot itself
- **automation** - General automations

## 🔐 Credentials

Stored securely in `/home/ubuntu/clawd/.secrets/supabase.env`

---

Built by Brochbot 🤖 for Ben

# Brochbot Dashboard - Next.js

A beautiful, professional task dashboard built with Next.js, React, and modern web technologies.

## 🚀 Features

- **Multi-page application** with routing
- **API routes** for dynamic data
- **Server-side rendering** for better SEO
- **Beautiful UI** inspired by Airbnb/Vercel design
- **Product tracking** for Interview Sidekick, Sales Echo, Cover Letter Copilot
- **Task management** with Kanban board
- **Competitor monitoring** dashboard
- **Analytics integration** (ready for DataFast API)

## 📁 Project Structure

```
brochbot/
├── pages/
│   ├── index.js          # Main dashboard
│   ├── tasks.js          # Task management
│   ├── analytics.js      # Analytics dashboard
│   ├── competitors.js    # Competitor tracking
│   └── api/
│       └── tasks.js      # Tasks API endpoint
├── components/
│   ├── Header.js         # Navigation header
│   ├── StatsGrid.js      # Statistics cards
│   ├── ProductCards.js   # Product overview cards
│   └── KanbanBoard.js    # Task board
├── styles/
│   └── globals.css       # Global styles
├── public/
│   └── favicon.txt       # Favicon
└── next.config.js        # Next.js configuration
```

## 🛠 Installation

```bash
npm install
# or
yarn install
```

## 🏃 Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🚢 Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push to GitHub (already done!)
2. Import to Vercel
3. Deploy with these settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

## 🎨 Tech Stack

- **Next.js 14** - React framework
- **React 18** - UI library
- **CSS** - Styling with custom design system
- **Vercel** - Deployment platform

## 📊 Current Tasks

- ✅ Morning briefing setup
- ✅ Dashboard creation
- 🚧 Competitor monitoring (FinalRound AI, Parakeet AI, LockedIn AI)
- 📥 UGC creator payment tracker
- 📥 DataFast analytics integration

## 🔗 Live Demo

Coming soon at: `brochbot.vercel.app`

---

Built by Brochbot 🤖
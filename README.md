# Mission Control — BrochBot

Operations dashboard for monitoring and managing BrochBot's automated tasks across Cover Letter Co-pilot, Interview Sidekick, and Sales Echo.

## Features

- **Activity Feed** — Real-time timeline of all actions with filtering by type, product, and date
- **Calendar View** — Weekly calendar showing scheduled tasks and recurring jobs
- **Global Search** — Cmd+K search across activities, documents, and scheduled tasks

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Convex (database — connect later)
- Radix UI primitives
- Lucide icons

## Getting Started

```bash
npm install
npm run dev
```

## Convex Setup

Schema and functions are in `convex/`. To connect:

```bash
npx convex dev
```

Currently using mock data — swap to Convex by updating the data provider in components.

import Head from 'next/head'
import Link from 'next/link'

const STEPS = [
  {
    number: '1',
    emoji: '📝',
    title: 'Add Tasks',
    description: 'Create tasks from the dashboard or chat directly with Brochbot via Telegram. Assign to yourself, Brochbot, or both.',
  },
  {
    number: '2',
    emoji: '🤖',
    title: 'Brochbot Works',
    description: 'Brochbot checks in throughout the day, picks up assigned tasks, and gets to work autonomously—coding, researching, or organizing.',
  },
  {
    number: '3',
    emoji: '💬',
    title: 'Stay in Sync',
    description: 'Get updates via Telegram. Brochbot asks questions when blocked and notifies you when tasks are done.',
  },
  {
    number: '4',
    emoji: '✅',
    title: 'Review & Ship',
    description: 'Check completed work, provide feedback, and ship. Brochbot learns your preferences over time.',
  },
]

const FEATURES = [
  {
    emoji: '⚡',
    title: 'Always Available',
    description: 'Brochbot runs 24/7 on a cloud server, checking heartbeats and picking up tasks even while you sleep.',
  },
  {
    emoji: '🔐',
    title: 'Secure Access',
    description: 'Controlled permissions for databases, APIs, and services. Brochbot asks before external actions.',
  },
  {
    emoji: '🧠',
    title: 'Memory & Context',
    description: 'Brochbot maintains memory files to remember decisions, preferences, and project context across sessions.',
  },
  {
    emoji: '🛠️',
    title: 'Real Tools',
    description: 'Not just chat—Brochbot can push code to GitHub, query databases, scrape the web, and more.',
  },
]

export default function HowItWorks() {
  return (
    <>
      <Head>
        <title>How It Works | Brochbot HQ</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Learn how Brochbot, your AI coding assistant, helps manage tasks and build products." />
      </Head>
      
      <div className="container">
        {/* Header */}
        <header className="header">
          <Link href="/" className="logo">🤖 Brochbot HQ</Link>
          <nav className="nav">
            <Link href="/" className="nav-link">Dashboard</Link>
            <Link href="/security" className="nav-link">Security</Link>
          </nav>
        </header>

        {/* Hero */}
        <section className="hero">
          <h1 className="hero-title">Hey there 👋</h1>
          <p className="hero-subtitle">
            Let's walk through how Brochbot helps you ship faster. Assign tasks, stay in sync, and watch things get done.
          </p>
        </section>

        {/* Steps */}
        <section className="steps-section">
          <h2 className="section-title">📋 The Process</h2>
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div key={step.number} className="step-card">
                <div className="step-header">
                  <span className="step-number">{step.number}</span>
                  <span className="step-emoji">{step.emoji}</span>
                </div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="features-section">
          <h2 className="section-title">🚀 Key Features</h2>
          <div className="features-grid">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-emoji">{feature.emoji}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How Communication Works */}
        <section className="comm-section">
          <div className="comm-card">
            <h2 className="comm-title">💬 How We Communicate</h2>
            <div className="comm-grid">
              <div className="comm-item">
                <div className="comm-icon">📱</div>
                <div className="comm-content">
                  <h4>Telegram</h4>
                  <p>Chat naturally with Brochbot. Ask questions, give instructions, or just check in.</p>
                </div>
              </div>
              <div className="comm-item">
                <div className="comm-icon">🌐</div>
                <div className="comm-content">
                  <h4>Dashboard</h4>
                  <p>Visual task management at brochbot.com. See status, priorities, and details at a glance.</p>
                </div>
              </div>
              <div className="comm-item">
                <div className="comm-icon">💓</div>
                <div className="comm-content">
                  <h4>Heartbeats</h4>
                  <p>Periodic check-ins where Brochbot reviews tasks, checks email, and surfaces important updates.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section">
          <Link href="/" className="btn btn-primary">
            Let's get started →
          </Link>
        </section>
      </div>

      <style jsx global>{`
        :root {
          --bg: #ffffff;
          --card-bg: #f9fafb;
          --border: #e5e7eb;
          --text: #111827;
          --text-muted: #6b7280;
          --accent: #2563eb;
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--text);
          line-height: 1.6;
        }
        
        .container { max-width: 1000px; margin: 0 auto; padding: 24px; }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .logo {
          font-size: 24px;
          font-weight: 700;
          text-decoration: none;
          color: var(--text);
        }
        
        .nav { display: flex; gap: 24px; }
        
        .nav-link {
          font-size: 14px;
          color: var(--text-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .nav-link:hover { color: var(--text); }
        
        /* Hero */
        .hero {
          text-align: center;
          margin-bottom: 56px;
        }
        
        .hero-title {
          font-size: 48px;
          font-weight: 700;
          line-height: 56px;
          margin-bottom: 16px;
          color: #000000;
        }
        
        .hero-subtitle {
          font-size: 16px;
          line-height: 24px;
          color: var(--text-muted);
          max-width: 600px;
          margin: 0 auto;
        }
        
        /* Sections */
        .section-title {
          font-size: 32px;
          font-weight: 600;
          line-height: 40px;
          margin-bottom: 24px;
          color: #000000;
        }
        
        /* Steps */
        .steps-section { margin-bottom: 56px; }
        
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        
        .step-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .step-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .step-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .step-number {
          width: 32px;
          height: 32px;
          background: var(--accent);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }
        
        .step-emoji { font-size: 24px; }
        
        .step-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 32px;
          margin-bottom: 8px;
          color: #000000;
        }
        
        .step-description {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 24px;
        }
        
        /* Features */
        .features-section { margin-bottom: 56px; }
        
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }
        
        .feature-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }
        
        .feature-emoji {
          font-size: 32px;
          margin-bottom: 12px;
        }
        
        .feature-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 32px;
          margin-bottom: 8px;
          color: #000000;
        }
        
        .feature-description {
          font-size: 16px;
          color: var(--text-muted);
          line-height: 24px;
        }
        
        /* Communication */
        .comm-section { margin-bottom: 56px; }
        
        .comm-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
        }
        
        .comm-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 32px;
          margin-bottom: 24px;
          color: #000000;
        }
        
        .comm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
        }
        
        .comm-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        
        .comm-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        
        .comm-content h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #000000;
        }
        
        .comm-content p {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        
        /* CTA */
        .cta-section {
          text-align: center;
          padding: 32px 0;
        }
        
        .btn {
          display: inline-block;
          padding: 16px 32px;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          text-decoration: none;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-primary {
          background: #000000;
          color: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
        
        .btn-primary:hover {
          background: #333333;
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 600px) {
          .hero-title { font-size: 36px; line-height: 44px; }
          .hero-subtitle { font-size: 14px; }
          .section-title { font-size: 24px; line-height: 32px; }
          .step-title, .feature-title { font-size: 18px; line-height: 24px; }
          .step-description, .feature-description { font-size: 14px; }
          .step-card, .feature-card, .comm-card { padding: 20px; }
        }
      `}</style>
    </>
  )
}

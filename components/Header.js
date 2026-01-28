import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header() {
  const router = useRouter()
  
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <Link href="/" className="logo">
            <div className="logo-icon">🤖</div>
            <span>Brochbot</span>
          </Link>
          
          <nav className="nav">
            <Link href="/" className={router.pathname === '/' ? 'nav-link active' : 'nav-link'}>
              Dashboard
            </Link>
            <Link href="/tasks" className={router.pathname === '/tasks' ? 'nav-link active' : 'nav-link'}>
              Tasks
            </Link>
            <Link href="/analytics" className={router.pathname === '/analytics' ? 'nav-link active' : 'nav-link'}>
              Analytics
            </Link>
            <Link href="/competitors" className={router.pathname === '/competitors' ? 'nav-link active' : 'nav-link'}>
              Competitors
            </Link>
          </nav>
          
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Live</span>
          </div>
        </div>
      </div>
    </header>
  )
}
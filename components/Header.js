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
            <Link href="/" className="nav-link active">
              Priority Board
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
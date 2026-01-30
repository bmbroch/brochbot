import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Header({ onAddClick }) {
  const router = useRouter()
  const path = router.pathname
  
  return (
    <>
      <header className="header">
        <Link href="/" className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">BrochBot</span>
        </Link>
        <nav className="nav">
          <Link href="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>Dashboard</Link>
          <Link href="/support" className={`nav-link ${path === '/support' ? 'active' : ''}`}>Support</Link>
          <Link href="/creators" className={`nav-link ${path === '/creators' ? 'active' : ''}`}>Creators</Link>
          <Link href="/creation" className={`nav-link ${path === '/creation' ? 'active' : ''}`}>Creation</Link>
        </nav>
        {onAddClick && (
          <button className="btn btn-primary" onClick={onAddClick}>
            + Add
          </button>
        )}
      </header>
      
      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #F5F5F5;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        
        .logo-icon {
          font-size: 28px;
        }
        
        .logo-text {
          font-size: 22px;
          font-weight: 700;
          color: #000;
        }
        
        .nav {
          display: flex;
          gap: 4px;
        }
        
        .nav-link {
          padding: 10px 16px;
          border-radius: 12px;
          color: #6B7280;
          text-decoration: none;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
          min-height: 44px;
          display: flex;
          align-items: center;
        }
        
        .nav-link:hover {
          color: #000;
          background: #F5F5F5;
        }
        
        .nav-link.active {
          color: #000;
          background: #F5F5F5;
          font-weight: 600;
        }
        
        .btn {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          min-height: 44px;
        }
        
        .btn-primary {
          background: #000;
          color: white;
        }
        
        .btn-primary:hover {
          background: #333;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .header {
            flex-wrap: wrap;
            gap: 12px;
            padding: 12px 16px;
          }
          
          .logo-icon { font-size: 24px; }
          .logo-text { font-size: 18px; }
          
          .nav {
            order: 3;
            width: 100%;
            justify-content: center;
            gap: 4px;
            overflow-x: auto;
          }
          
          .nav-link {
            padding: 8px 12px;
            font-size: 13px;
            white-space: nowrap;
          }
          
          .btn {
            padding: 10px 18px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  )
}

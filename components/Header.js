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
          padding: 16px 0;
          margin-bottom: 24px;
          border-bottom: 1px solid #222;
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
          color: #fff;
        }
        
        .nav {
          display: flex;
          gap: 8px;
        }
        
        .nav-link {
          padding: 8px 16px;
          border-radius: 8px;
          color: #888;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .nav-link:hover {
          color: #fff;
          background: #1a1a2e;
        }
        
        .nav-link.active {
          color: #fff;
          background: #2a2a4a;
        }
        
        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .btn-primary {
          background: #6366f1;
          color: white;
        }
        
        .btn-primary:hover {
          background: #5558e3;
        }
        
        @media (max-width: 768px) {
          .header {
            flex-wrap: wrap;
            gap: 10px;
            padding: 8px 0;
            margin-bottom: 16px;
          }
          
          .logo-icon { font-size: 24px; }
          .logo-text { font-size: 18px; }
          
          .nav {
            order: 3;
            width: 100%;
            justify-content: center;
            gap: 4px;
          }
          
          .nav-link {
            padding: 6px 12px;
            font-size: 14px;
          }
          
          .btn {
            padding: 8px 14px;
            font-size: 14px;
          }
        }
        
        @media (max-width: 380px) {
          .nav-link {
            padding: 6px 8px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  )
}

import Image from 'next/image'

export default function ProductCards() {
  const products = [
    {
      name: 'Interview Sidekick',
      favicon: 'https://interviewsidekick.com/favicon.ico',
      todo: 0,
      inProgress: 0,
      done: 0
    },
    {
      name: 'Sales Echo',
      favicon: 'https://sales-echo.com/favicon.ico',
      todo: 0,
      inProgress: 0,
      done: 0
    },
    {
      name: 'Cover Letter Copilot',
      favicon: 'https://coverlettercopilot.ai/favicon.ico',
      todo: 0,
      inProgress: 0,
      done: 0
    },
    {
      name: 'Brochbot Automation',
      emoji: '🤖',
      todo: 2,
      inProgress: 1,
      done: 2
    }
  ]

  return (
    <section className="products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            <span>🚀</span>
            <span>Product Overview</span>
          </h2>
        </div>
        
        <div className="products-grid">
          {products.map(product => (
            <div key={product.name} className="product-card">
              <div className="product-header">
                <div className="product-info">
                  {product.favicon ? (
                    <img src={product.favicon} alt={product.name} width={24} height={24} style={{borderRadius: '4px'}} />
                  ) : (
                    <span className="product-emoji">{product.emoji}</span>
                  )}
                  <h3 className="product-name">{product.name}</h3>
                </div>
                <span className="product-menu">⋯</span>
              </div>
              
              <div className="product-stats">
                <div className="product-stat">
                  <span className="product-stat-value">{product.todo}</span>
                  <span className="product-stat-label">To Do</span>
                </div>
                <div className="product-stat">
                  <span className="product-stat-value">{product.inProgress}</span>
                  <span className="product-stat-label">Active</span>
                </div>
                <div className="product-stat">
                  <span className="product-stat-value">{product.done}</span>
                  <span className="product-stat-label">Done</span>
                </div>
              </div>
              
              <div className="progress-container">
                <div className="progress-header">
                  <span className="progress-label">Completion</span>
                  <span className="progress-value">
                    {product.done > 0 ? Math.round((product.done / (product.todo + product.inProgress + product.done)) * 100) : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${product.done > 0 ? Math.round((product.done / (product.todo + product.inProgress + product.done)) * 100) : 0}%`}}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
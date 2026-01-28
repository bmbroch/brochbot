// Product logo components with fallback to letters
export function InterviewSidekickLogo({ size = 24 }) {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        color: 'white',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}
    >
      IS
    </div>
  )
}

export function SalesEchoLogo({ size = 24 }) {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        color: 'white',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}
    >
      SE
    </div>
  )
}

export function CoverLetterLogo({ size = 24 }) {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #00c896 0%, #00a77e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.4,
        fontWeight: 700,
        color: 'white',
        fontFamily: 'Inter, -apple-system, sans-serif'
      }}
    >
      CL
    </div>
  )
}

export function BrochbotLogo({ size = 24 }) {
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.5,
      }}
    >
      🤖
    </div>
  )
}
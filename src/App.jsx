import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Tool from './pages/Tool'

export default function App() {
  const { loading } = useAuth()
  const [showTool, setShowTool] = useState(
    window.location.pathname === '/app' || window.location.pathname.startsWith('/app/')
  )

  if (loading) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:"'Sora', sans-serif",
      background:'#fdfcfa', color:'#7a7971', fontSize:'.85rem'
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🌿</div>
        Loading your plan…
      </div>
    </div>
  )

  if (showTool) {
    return (
      <Tool onClose={() => {
        window.location.href = '/'
      }} />
    )
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:"'Sora', sans-serif",
      background:'#fdfcfa', color:'#7a7971', fontSize:'.85rem'
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🌿</div>
        <a href="/" style={{color:'#7d9b6e'}}>Go to home →</a>
      </div>
    </div>
  )
}

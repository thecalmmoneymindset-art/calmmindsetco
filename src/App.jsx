import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Tool from './pages/Tool'

export default function App() {
  const { loading } = useAuth()
  const [showTool, setShowTool] = useState(false)

  useEffect(() => {
    if (window.location.pathname === '/app') {
      setShowTool(true)
    }
  }, [])

  if (loading) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:"'Sora', sans-serif",
      background:'var(--warm)', color:'var(--muted)', fontSize:'.85rem'
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
        setShowTool(false)
        window.history.pushState({}, '', '/')
      }} />
    )
  }

  // Landing page — redirect to static HTML
  window.location.href = '/landing.html'
  return null
}

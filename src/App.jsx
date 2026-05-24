import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Tool from './pages/Tool'

export default function App() {
  const { loading } = useAuth()
  const [showTool, setShowTool] = useState(true)

  // Handle Supabase auth callback — the hash will have access_token
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('access_token') || hash.includes('error')) {
      // Supabase SDK handles this automatically via onAuthStateChange
      // Clear the hash to keep URL clean
      window.history.replaceState({}, document.title, window.location.pathname)
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

  return (
    <Tool onClose={() => {
      // Navigate back to landing page
      window.location.href = '/'
    }} />
  )
}

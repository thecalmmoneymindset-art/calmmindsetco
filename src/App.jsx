import { useAuth } from './hooks/useAuth'
import Tool from './pages/Tool'

export default function App() {
  const { loading } = useAuth()

  if (loading) return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      height:'100vh', fontFamily:"'Sora', sans-serif",
      background:'#fdfcfa', color:'#7a7971', fontSize:'.85rem'
    }}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'2rem',marginBottom:'1rem'}}>🌿</div>
        Loading…
      </div>
    </div>
  )

  return (
    <Tool onClose={() => window.location.href = '/'} />
  )
}

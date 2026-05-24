import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import Tool from './pages/Tool'

export default function App() {
  const { loading } = useAuth()
  const path = window.location.pathname

  useEffect(() => {
    // If not /app, redirect to landing page
    if (path !== '/app' && !path.startsWith('/app/')) {
      window.location.replace('/index-landing.html')
    }
  }, [])

  if (loading || (path !== '/app' && !path.startsWith('/app/'))) return null

  return (
    <Tool onClose={() => {
      window.location.href = '/'
    }} />
  )
}

import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Returns current month as "YYYY-MM"
export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function useBudgetSync(user) {
  const [saveStatus, setSaveStatus] = useState('idle') // idle | saving | saved | error
  const [savedMonths, setSavedMonths] = useState([])
  const [activeMonth, setActiveMonth] = useState(currentMonth())
  const debounceRef = useRef(null)

  // Save current state to Supabase (upsert)
  const saveToCloud = useCallback(async (state, month = activeMonth) => {
    if (!user) return
    setSaveStatus('saving')
    try {
      const { error } = await supabase
        .from('budgets')
        .upsert(
          { user_id: user.id, month, data: state },
          { onConflict: 'user_id,month' }
        )
      if (error) throw error
      setSaveStatus('saved')
      // Reset to idle after 3s
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err) {
      console.error('Save error:', err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 4000)
    }
  }, [user, activeMonth])

  // Debounced auto-save — fires 2s after last change
  const debouncedSave = useCallback((state) => {
    if (!user) return
    clearTimeout(debounceRef.current)
    setSaveStatus('saving')
    debounceRef.current = setTimeout(() => {
      saveToCloud(state)
    }, 2000)
  }, [user, saveToCloud])

  // Load a specific month from Supabase
  const loadMonth = useCallback(async (month) => {
    if (!user) return null
    const { data, error } = await supabase
      .from('budgets')
      .select('data')
      .eq('user_id', user.id)
      .eq('month', month)
      .maybeSingle()
    if (error) { console.error('Load error:', error); return null }
    return data?.data ?? null
  }, [user])

  // Fetch list of saved months (most recent 6 for free tier)
  const fetchSavedMonths = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('budgets')
      .select('month, updated_at')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .limit(6)
    if (error) { console.error('Fetch months error:', error); return }
    setSavedMonths(data ?? [])
  }, [user])

  return {
    saveStatus,
    savedMonths,
    activeMonth,
    setActiveMonth,
    saveToCloud,
    debouncedSave,
    loadMonth,
    fetchSavedMonths,
  }
}

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useBudgetSync, currentMonth } from '../hooks/useBudgetSync'
import AuthModal from '../components/AuthModal'
import ToolHeader from '../components/ToolHeader'
import SaveBanner from '../components/SaveBanner'

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'cms_v3'
const GOAL_COLORS = ['#3B6D11','#639922','#97C459','#BA7517','#EF9F27','#5a7fa0','#c98b5a']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const nowYear = new Date().getFullYear()
const daysLeft = Math.max(1, 30 - new Date().getDate() + 1)

const INC_SUBS = [
  {id:'salary',   label:'💰 Salary'},
  {id:'sidegig',  label:'💸 Side gig'},
  {id:'dividends',label:'📈 Dividends'},
  {id:'interest', label:'💵 Interest income'},
  {id:'other_inc',label:'✨ Other income'},
]
const CATS = [
  {id:'essentials',name:'Essentials',emoji:'🌿',color:'#5a7fa0',
    subs:[{id:'rent',label:'🏠 Rent / Mortgage'},{id:'groceries',label:'🥦 Groceries'},{id:'bills',label:'💡 Bills & utilities'},{id:'transport',label:'🚌 Transport'},{id:'phone',label:'📱 Phone'},{id:'insurance',label:'🛡 Insurance'}]},
  {id:'lifestyle',name:'Lifestyle',emoji:'✨',color:'#c4714a',
    subs:[{id:'eating_out',label:'🍜 Eating out'},{id:'shopping',label:'🛍 Shopping'},{id:'subscriptions',label:'📺 Subscriptions'},{id:'personal_care',label:'💆 Personal care'},{id:'hobbies',label:'🎯 Hobbies'}]},
  {id:'future_me',name:'Future Me',emoji:'🌱',color:'#7d9b6e',
    subs:[{id:'savings',label:'🌱 Regular savings'},{id:'investments',label:'📈 Investments'},{id:'pension',label:'🏦 Pension top-up'},{id:'emergency',label:'🛡 Emergency fund'}]},
  {id:'joy',name:'Joy',emoji:'🎉',color:'#c9a84c',
    subs:[{id:'holidays',label:'✈️ Holidays'},{id:'entertainment',label:'🎭 Entertainment'},{id:'gifts',label:'🎁 Gifts'},{id:'dining',label:'🍷 Fine dining'}]},
  {id:'giving',name:'Giving',emoji:'💚',color:'#4e7a3e',
    subs:[{id:'charity',label:'💚 Charity'},{id:'family_support',label:'👨‍👩‍👧 Family support'}]},
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n, curr='£') => {
  if (!n && n !== 0) return ''
  return curr + new Intl.NumberFormat('en-GB',{minimumFractionDigits:0,maximumFractionDigits:0}).format(n)
}
const fmtC = (n, c) => fmt(n, c)
const pf = v => parseFloat(v) || 0

function cTot(store, catId) {
  return Object.values(store[catId] || {}).reduce((s, v) => s + pf(v), 0)
}
function grandExp(store) {
  return Object.keys(store).reduce((s, k) => s + cTot(store, k), 0)
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function saveToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function emptyState() {
  return { income:{}, budgeted:{}, actual:{}, fixed:{}, goals:[], currency:'£' }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Tool({ onClose }) {
  const { user, loading: authLoading, signOut } = useAuth()
  const { saveStatus, savedMonths, activeMonth, setActiveMonth,
          saveToCloud, debouncedSave, loadMonth, fetchSavedMonths } = useBudgetSync(user)

  const [state, setState] = useState(() => loadFromStorage() || emptyState())
  const [curr, setCurr] = useState(() => (loadFromStorage()?.currency) || '£')
  const [incOpen, setIncOpen] = useState(true)
  const [catOpen, setCatOpen] = useState({})
  const [chartMode, setChartMode] = useState('budget')
  const [projInputs, setProjInputs] = useState({ mo:'', yrs:3, rate:4.5, lump:0 })
  const [showAuth, setShowAuth] = useState(false)
  const [goalIdRef] = useState({ current: 0 })

  // Sync from Supabase when user logs in or changes month
  useEffect(() => {
    if (!user) return
    fetchSavedMonths()
    loadMonth(activeMonth).then(data => {
      if (data) {
        setState(data)
        setCurr(data.currency || '£')
      }
    })
  }, [user, activeMonth])

  // Auto-save to localStorage on every change
  useEffect(() => {
    saveToStorage({ ...state, currency: curr })
    if (user) debouncedSave({ ...state, currency: curr })
  }, [state, curr])

  const handleSave = () => {
    if (!user) { setShowAuth(true); return }
    saveToCloud({ ...state, currency: curr })
  }

  const handleMonthChange = async (month) => {
    setActiveMonth(month)
    if (user) {
      const data = await loadMonth(month)
      if (data) { setState(data); setCurr(data.currency || '£') }
      else setState(emptyState())
    }
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    fetchSavedMonths()
    // Auto-save current state after login
    setTimeout(() => saveToCloud({ ...state, currency: curr }), 500)
  }

  // ── Derived values ──
  const income = INC_SUBS.reduce((s, sub) => s + pf(state.income?.[sub.id]), 0)
  const expStore = chartMode === 'actual' ? (state.actual || {}) : (state.budgeted || {})
  const totalExp = grandExp(expStore)

  const goals = (state.goals || []).map((g, i) => {
    const color = GOAL_COLORS[i % GOAL_COLORS.length]
    if (g.type === 'savings') {
      let monthly = 0, months = null, moLabel = ''
      if (g.target && g.deadlineActive && g.deadlineMo && g.deadlineYr) {
        const now = new Date()
        const mo = parseInt(g.deadlineMo, 10) - 1
        const yr = parseInt(g.deadlineYr, 10)
        const diff = (yr - now.getFullYear()) * 12 + (mo - now.getMonth())
        months = Math.max(0, diff)
        monthly = months > 0 ? Math.ceil(g.target / months) : g.target
        moLabel = `${MONTHS[mo]} ${yr}`
      } else if (g.target) {
        monthly = 0
      }
      return { ...g, color, monthly, months, moLabel }
    }
    if (g.type === 'bnpl') {
      const total = pf(g.total), instalments = pf(g.instalments), paid = pf(g.paid)
      const origPerMo = instalments > 0 ? total / instalments : 0
      const completeMonths = origPerMo > 0 ? Math.floor(paid / origPerMo) : 0
      const remaining = Math.max(0, instalments - completeMonths)
      let moLabel = ''
      if (g.firstPayMo && g.firstPayYr && instalments > 0) {
        const d = new Date(parseInt(g.firstPayYr), parseInt(g.firstPayMo) - 1)
        d.setMonth(d.getMonth() + parseInt(instalments) - 1)
        moLabel = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      }
      const startLabel = g.firstPayMo && g.firstPayYr
        ? `${MONTHS[parseInt(g.firstPayMo)-1]} ${g.firstPayYr}` : ''
      return { ...g, color, monthly: origPerMo, remaining, moLabel, startLabel }
    }
    if (g.type === 'debt') {
      let monthly = pf(g.monthly), moLabel = '', months = null
      if (g.total && g.deadlineActive && g.deadlineMo && g.deadlineYr) {
        const now = new Date()
        const mo = parseInt(g.deadlineMo, 10) - 1
        const yr = parseInt(g.deadlineYr, 10)
        const diff = (yr - now.getFullYear()) * 12 + (mo - now.getMonth())
        months = Math.max(1, diff)
        monthly = Math.ceil(pf(g.total) / months)
        moLabel = `${MONTHS[mo]} ${yr}`
      }
      return { ...g, color, monthly, moLabel, months }
    }
    return { ...g, color, monthly: 0 }
  })

  const totalGoals = goals.reduce((s, g) => s + g.monthly, 0)
  const surplus = income - totalExp
  const afterGoals = surplus - totalGoals
  const daily = income > 0 ? Math.max(0, afterGoals) / daysLeft : 0
  const futureMeTot = cTot(expStore, 'future_me')
  const savePct = income > 0
    ? (futureMeTot > 0 ? Math.round(futureMeTot / income * 100) : Math.max(0, Math.round(surplus / income * 100)))
    : 0

  // ── State updaters ──
  const setIncome = (subId, val) => setState(s => ({
    ...s, income: { ...s.income, [subId]: val }
  }))
  const setFixed = (key, val) => setState(s => ({
    ...s, fixed: { ...s.fixed, [key]: val }
  }))
  const setBudgeted = (catId, subId, val) => setState(s => ({
    ...s, budgeted: { ...s.budgeted, [catId]: { ...(s.budgeted?.[catId] || {}), [subId]: val } }
  }))
  const setActual = (catId, subId, val) => setState(s => ({
    ...s, actual: { ...s.actual, [catId]: { ...(s.actual?.[catId] || {}), [subId]: val } }
  }))
  const updateGoal = (id, patch) => setState(s => ({
    ...s, goals: s.goals.map(g => g.id === id ? { ...g, ...patch } : g)
  }))
  const deleteGoal = (id) => setState(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }))
  const addGoal = (type) => {
    goalIdRef.current += 1
    setState(s => ({
      ...s,
      goals: [...(s.goals || []), { id: `goal_${Date.now()}_${goalIdRef.current}`, type, name: '' }]
    }))
  }

  const freeDebtCount = goals.filter(g => g.type === 'debt').length
  const freeBnplCount = goals.filter(g => g.type === 'bnpl').length

  // ── Render ──
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', flexDirection:'column', background:'var(--warm)', fontFamily:"'Sora', sans-serif" }}>
      <ToolHeader
        user={user}
        saveStatus={saveStatus}
        savedMonths={savedMonths}
        activeMonth={activeMonth}
        curr={curr}
        onCurrChange={setCurr}
        onSave={handleSave}
        onLoginClick={() => setShowAuth(true)}
        onSignOut={signOut}
        onClose={onClose}
        onMonthChange={handleMonthChange}
      />

      <SaveBanner user={user} saveStatus={saveStatus} />

      <div style={{ flex:1, display:'grid', gridTemplateColumns:'390px 1fr', overflow:'hidden' }}>

        {/* ── LEFT PANEL ── */}
        <div className="tool-left">

          {/* Income */}
          <div className="income-section">
            <span className="section-lbl">💰 Income</span>
            <div className={`inc-block ${incOpen ? 'open' : ''}`}>
              <div className={`inc-hdr ${incOpen ? 'open' : ''}`} onClick={() => setIncOpen(o => !o)}>
                <span style={{fontSize:'.9rem'}}>💰</span>
                <span style={{fontSize:'.8rem',fontWeight:500,flex:1,color:'var(--ink)'}}>Total income</span>
                {income > 0 && <span className="inc-total-big">{fmtC(income, curr)}</span>}
                <span className="cat-chev">▼</span>
              </div>
              {incOpen && (
                <div className="inc-body">
                  {INC_SUBS.map(sub => (
                    <IncRow
                      key={sub.id}
                      sub={sub}
                      value={state.income?.[sub.id] || ''}
                      fixed={state.fixed?.[`inc_${sub.id}`]}
                      curr={curr}
                      onChange={v => setIncome(sub.id, v)}
                      onToggleFixed={() => setFixed(`inc_${sub.id}`, !state.fixed?.[`inc_${sub.id}`])}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="cats-section">
            <span className="section-lbl">🧾 Expenses</span>
            {CATS.map(cat => (
              <CatBlock
                key={cat.id}
                cat={cat}
                open={!!catOpen[cat.id]}
                onToggle={() => setCatOpen(o => ({ ...o, [cat.id]: !o[cat.id] }))}
                budgeted={state.budgeted?.[cat.id] || {}}
                actual={state.actual?.[cat.id] || {}}
                fixed={state.fixed || {}}
                curr={curr}
                onBudgeted={(subId, v) => setBudgeted(cat.id, subId, v)}
                onActual={(subId, v) => setActual(cat.id, subId, v)}
                onFixed={(key) => setFixed(key, !state.fixed?.[key])}
              />
            ))}
          </div>

          {/* Goals */}
          <div className="goals-section">
            <div className="goals-hdr">
              <span className="goals-hdr-title">🎯 Goals & debt</span>
              <div className="gadd-btns">
                <button className="gadd-btn" onClick={() => addGoal('savings')}>🌱 Goal</button>
                <button className="gadd-btn bnpl-add" onClick={() => addGoal('bnpl')}>💳 BNPL</button>
                <button className="gadd-btn debt-add" onClick={() => addGoal('debt')}>🏦 Debt</button>
              </div>
            </div>
            <div className="goals-list">
              {goals.map((g, i) => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  curr={curr}
                  isLocked={
                    (g.type === 'debt' && goals.filter(x=>x.type==='debt').indexOf(g) >= 1) ||
                    (g.type === 'bnpl' && goals.filter(x=>x.type==='bnpl').indexOf(g) >= 1)
                  }
                  onUpdate={patch => updateGoal(g.id, patch)}
                  onDelete={() => deleteGoal(g.id)}
                />
              ))}
            </div>
            <div className="info-note">💡 Goals auto-calculate monthly amounts from your target and deadline. BNPL splits total owed into instalments.</div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="tool-right">

          {/* Summary cards */}
          <div className="summary-cards">
            <div className="sum-card inc">
              <span className="sum-lbl">💰 Income</span>
              <span className={`sum-val ${income>0?'g':''}`}>{income?fmtC(income,curr):'—'}</span>
              <span className="sum-note">take-home</span>
            </div>
            <div className="sum-card exp">
              <span className="sum-lbl">💸 Expenses</span>
              <span className="sum-val r">{totalExp?fmtC(totalExp,curr):'—'}</span>
              <span className="sum-note">per month</span>
            </div>
            <div className="sum-card gls">
              <span className="sum-lbl">🎯 Goals & debt</span>
              <span className="sum-val gold">{totalGoals?fmtC(totalGoals,curr):'—'}</span>
              <span className="sum-note">per month</span>
            </div>
            <div className="sum-card lft">
              <span className="sum-lbl">🧘 Remaining</span>
              <span className={`sum-val ${!income?'':afterGoals<0?'r':afterGoals>0?'g':'gold'}`}>
                {income?fmtC(afterGoals,curr):'—'}
              </span>
              <span className="sum-note">after all</span>
            </div>
          </div>

          {/* Daily spendable */}
          <DailyCard daily={daily} daysLeft={daysLeft} savePct={savePct} income={income} curr={curr} />

          {/* Goal progress */}
          {goals.filter(g=>g.type==='savings').length > 0 && (
            <div>
              <div className="sec-ttl" style={{marginBottom:'.6rem'}}>🌱 Goal progress</div>
              <div style={{display:'flex',flexDirection:'column',gap:'.45rem'}}>
                {goals.filter(g=>g.type==='savings').map(g => <GoalProgress key={g.id} g={g} curr={curr} />)}
              </div>
            </div>
          )}

          {/* Debt & BNPL progress */}
          {goals.filter(g=>g.type==='debt'||g.type==='bnpl').length > 0 && (
            <div>
              <div className="sec-ttl" style={{marginBottom:'.6rem'}}>💳 Debt & BNPL</div>
              <div style={{display:'flex',flexDirection:'column',gap:'.45rem'}}>
                {goals.filter(g=>g.type==='debt'||g.type==='bnpl').map(g => <DebtProgress key={g.id} g={g} curr={curr} />)}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="chart-row">
            <DonutChart expStore={expStore} totalExp={totalExp} chartMode={chartMode} onModeChange={setChartMode} curr={curr} />
            <BarChart income={income} totalExp={totalExp} totalGoals={totalGoals} afterGoals={afterGoals} curr={curr} />
          </div>

          {/* Suggestions */}
          <div>
            <div className="sec-ttl" style={{marginBottom:'.6rem'}}>💡 Suggestions</div>
            <Suggestions income={income} totalExp={totalExp} surplus={surplus} afterGoals={afterGoals} goals={goals} savePct={savePct} state={state} expStore={expStore} curr={curr} />
          </div>

          {/* Pro nudge */}
          <div className="pro-nudge">
            <h4>📅 Track this every month</h4>
            <p>Pro saves your history, shows all 12 months, and unlocks unlimited debts & BNPL. Join the waitlist for a founding rate.</p>
            <button className="btn-pro" onClick={() => window.open('/', '_self')}>Join the Pro waitlist →</button>
          </div>

          {/* Savings projection */}
          <ProjectionCalc surplus={afterGoals} curr={curr} />
        </div>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function IncRow({ sub, value, fixed, curr, onChange, onToggleFixed }) {
  return (
    <div className={`sub-row ${fixed ? 'fx-row' : ''}`}>
      <span className="sub-lbl">{sub.label}</span>
      <div className="sub-inputs">
        <div className="inp-box">
          <span className="inp-sym">{curr}</span>
          <input className="inp-num" type="number" placeholder="0" value={value}
            onChange={e => onChange(e.target.value)} />
        </div>
        <div className={`repeat-tog ${fixed ? 'on' : ''}`} onClick={onToggleFixed}>
          <span className="repeat-ico">↻</span>
          <span className="repeat-txt">Monthly</span>
        </div>
      </div>
    </div>
  )
}

function CatBlock({ cat, open, onToggle, budgeted, actual, fixed, curr, onBudgeted, onActual, onFixed }) {
  const budTotal = cTot({ [cat.id]: budgeted }, cat.id)
  const actTotal = cTot({ [cat.id]: actual }, cat.id)
  const displayTotal = budTotal || actTotal

  return (
    <div className={`cat-block ${open ? 'open' : ''}`}>
      <div className={`cat-hdr ${open ? 'open' : ''}`} onClick={onToggle}>
        <span className="cat-emoji">{cat.emoji}</span>
        <span className="cat-name-txt">{cat.name}</span>
        <span className={`cat-total-lbl ${displayTotal ? 'has-val' : ''}`}>
          {displayTotal ? fmtC(displayTotal, curr) : ''}
        </span>
        <span className="cat-chev">▼</span>
      </div>
      {open && (
        <div className="cat-body">
          <div className="col-hdr-row">
            <span className="col-hdr-lbl" style={{width:'74px',textAlign:'center'}}>Budgeted</span>
            <span className="col-hdr-lbl" style={{width:'74px',textAlign:'center'}}>Actual</span>
            <span style={{width:'72px'}}></span>
          </div>
          {cat.subs.map(sub => {
            const fxKey = `${cat.id}_${sub.id}`
            const isFx = !!fixed[fxKey]
            return (
              <div key={sub.id} className={`sub-row ${isFx ? 'fx-row' : ''}`}>
                <span className="sub-lbl">{sub.label}</span>
                <div className="sub-inputs">
                  <div className="inp-box">
                    <span className="inp-sym">{curr}</span>
                    <input className="inp-num" type="number" placeholder="0"
                      value={budgeted[sub.id] || ''}
                      onChange={e => onBudgeted(sub.id, e.target.value)} />
                  </div>
                  <div className="inp-box">
                    <span className="inp-sym">{curr}</span>
                    <input className="inp-num" type="number" placeholder="0"
                      value={actual[sub.id] || ''}
                      onChange={e => onActual(sub.id, e.target.value)} />
                  </div>
                  <div className={`repeat-tog ${isFx ? 'on' : ''}`} onClick={() => onFixed(fxKey)}>
                    <span className="repeat-ico">↻</span>
                    <span className="repeat-txt">Monthly</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, curr, isLocked, onUpdate, onDelete }) {
  if (isLocked) {
    return (
      <div className="goal-card locked-card">
        <div className="goal-card-top">
          <span className="goal-type-lbl">🔒 Pro feature — unlimited {goal.type === 'bnpl' ? 'BNPL' : 'debts'}</span>
        </div>
        <p style={{fontSize:'.72rem',color:'var(--muted)',lineHeight:1.6}}>
          Upgrade to Pro to track unlimited {goal.type === 'bnpl' ? 'BNPL plans' : 'debts'}.
        </p>
      </div>
    )
  }

  const now = new Date()
  const years = []
  for (let y = nowYear; y <= nowYear + 10; y++) years.push(y)

  if (goal.type === 'savings') {
    return (
      <div className="goal-card">
        <div className="goal-card-top">
          <span className="goal-dot" style={{background:'var(--sage)'}}></span>
          <span className="goal-type-lbl">🌱 Savings goal</span>
          <button className="goal-del" onClick={onDelete}>✕</button>
        </div>
        <input className="goal-name-inp" placeholder="Goal name (e.g. Emergency fund)"
          value={goal.name || ''} onChange={e => onUpdate({ name: e.target.value })} />
        <div className="goal-row2">
          <div className="goal-field">
            <span className="goal-field-lbl">Target amount</span>
            <div className="inp-box" style={{width:'100%'}}>
              <span className="inp-sym">{curr}</span>
              <input className="inp-num" style={{width:'100%'}} type="number" placeholder="5000"
                value={goal.target || ''} onChange={e => onUpdate({ target: e.target.value })} />
            </div>
          </div>
        </div>
        <div className={`deadline-pill ${goal.deadlineActive ? 'on' : ''}`}
          onClick={() => onUpdate({ deadlineActive: !goal.deadlineActive })}>
          <span className="dp-ico">📅</span> Set deadline
        </div>
        {goal.deadlineActive && (
          <div className="deadline-fields show">
            <select className="goal-mo-sel" value={goal.deadlineMo || '1'}
              onChange={e => onUpdate({ deadlineMo: e.target.value })}>
              {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <select className="goal-yr-sel" value={goal.deadlineYr || nowYear+1}
              onChange={e => onUpdate({ deadlineYr: e.target.value })}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
        {goal.monthly > 0 && (
          <div className="goal-calc">
            Save {fmtC(goal.monthly, curr)}/mo{goal.moLabel ? ` → reach by ${goal.moLabel}` : ''}
            {goal.months !== null && goal.months === 0 && ' 🎉 This month!'}
          </div>
        )}
        {(!goal.target || !goal.deadlineActive) && (
          <div className="goal-calc neutral">Add a target and deadline to see your monthly amount.</div>
        )}
      </div>
    )
  }

  if (goal.type === 'bnpl') {
    const origPerMo = pf(goal.total) > 0 && pf(goal.instalments) > 0
      ? pf(goal.total) / pf(goal.instalments) : 0
    const paid = pf(goal.paid)
    const completeMonths = origPerMo > 0 ? Math.floor(paid / origPerMo) : 0
    const partialPaid = origPerMo > 0 ? paid % origPerMo : 0
    const remainingCount = Math.max(0, pf(goal.instalments) - completeMonths)

    return (
      <div className="goal-card bnpl-card">
        <div className="goal-card-top">
          <span className="goal-dot" style={{background:'#9b7ab5'}}></span>
          <span className="goal-type-lbl bnpl-lbl">💳 BNPL</span>
          <button className="goal-del" onClick={onDelete}>✕</button>
        </div>
        <input className="goal-name-inp" placeholder="e.g. Monzo Flex — Laptop"
          value={goal.name || ''} onChange={e => onUpdate({ name: e.target.value })} />
        <div className="bnpl-fields">
          <div className="bnpl-row">
            <div className="goal-field">
              <span className="goal-field-lbl">Total owed</span>
              <div className="inp-box" style={{width:'100%'}}>
                <span className="inp-sym">{curr}</span>
                <input className="inp-num" style={{width:'100%'}} type="number" placeholder="600"
                  value={goal.total || ''} onChange={e => onUpdate({ total: e.target.value })} />
              </div>
            </div>
            <div className="goal-field">
              <span className="goal-field-lbl">No. of instalments</span>
              <input className="goal-inp" type="number" placeholder="6"
                value={goal.instalments || ''} onChange={e => onUpdate({ instalments: e.target.value })} />
            </div>
          </div>
          <div className="bnpl-row">
            <div className="goal-field">
              <span className="goal-field-lbl">Amount paid so far</span>
              <div className="inp-box" style={{width:'100%'}}>
                <span className="inp-sym">{curr}</span>
                <input className="inp-num" style={{width:'100%'}} type="number" placeholder="0"
                  value={goal.paid || ''} onChange={e => onUpdate({ paid: e.target.value })} />
              </div>
            </div>
            <div className="goal-field">
              <span className="goal-field-lbl">First payment month</span>
              <div className="goal-date-row">
                <select className="goal-mo-sel" value={goal.firstPayMo || now.getMonth()+1}
                  onChange={e => onUpdate({ firstPayMo: e.target.value })}>
                  {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
                </select>
                <select className="goal-yr-sel" value={goal.firstPayYr || nowYear}
                  onChange={e => onUpdate({ firstPayYr: e.target.value })}>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
          {origPerMo > 0 && (
            <div className={`bnpl-calc ${partialPaid > 0 ? 'warn' : ''}`}>
              {partialPaid > 0
                ? `${fmtC(Math.round(origPerMo - partialPaid), curr)} still owed this month · then ${fmtC(Math.round(origPerMo), curr)}/mo for ${remainingCount - 1} more`
                : `${fmtC(Math.round(origPerMo), curr)}/mo · ${remainingCount} payment${remainingCount !== 1 ? 's' : ''} left${goal.moLabel ? ` · clears ${goal.moLabel}` : ''}`
              }
            </div>
          )}
        </div>
      </div>
    )
  }

  if (goal.type === 'debt') {
    return (
      <div className="goal-card debt-card">
        <div className="goal-card-top">
          <span className="goal-dot" style={{background:'var(--terra)'}}></span>
          <span className="goal-type-lbl debt-lbl">🏦 Debt</span>
          <button className="goal-del" onClick={onDelete}>✕</button>
        </div>
        <input className="goal-name-inp" placeholder="e.g. Credit card"
          value={goal.name || ''} onChange={e => onUpdate({ name: e.target.value })} />
        <div className="goal-row2">
          <div className="goal-field">
            <span className="goal-field-lbl">Amount owed</span>
            <div className="inp-box" style={{width:'100%'}}>
              <span className="inp-sym">{curr}</span>
              <input className="inp-num" style={{width:'100%'}} type="number" placeholder="2000"
                value={goal.total || ''} onChange={e => onUpdate({ total: e.target.value })} />
            </div>
          </div>
        </div>
        <div className={`deadline-pill ${goal.deadlineActive ? 'on' : ''}`}
          onClick={() => onUpdate({ deadlineActive: !goal.deadlineActive })}>
          <span className="dp-ico">📅</span> Set payoff deadline
        </div>
        {goal.deadlineActive && (
          <div className="deadline-fields show">
            <select className="goal-mo-sel" value={goal.deadlineMo || now.getMonth()+1}
              onChange={e => onUpdate({ deadlineMo: e.target.value })}>
              {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
            </select>
            <select className="goal-yr-sel" value={goal.deadlineYr || nowYear+1}
              onChange={e => onUpdate({ deadlineYr: e.target.value })}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}
        {goal.monthly > 0 && (
          <div className="goal-calc">
            Pay {fmtC(goal.monthly, curr)}/mo → debt-free {goal.moLabel}
          </div>
        )}
      </div>
    )
  }
  return null
}

function DailyCard({ daily, daysLeft, savePct, income, curr }) {
  const circ = 163
  const offset = circ * (1 - Math.min(100, savePct) / 100)
  return (
    <div className="daily-card">
      <div className="daily-left">
        <h3>Daily spendable</h3>
        <div className="daily-num">{income ? fmtC(daily, curr) : '—'}</div>
        <div className="daily-sub">{income ? `for the next ${daysLeft} days` : 'Enter your income to see this'}</div>
      </div>
      <div className="ring-wrap">
        <svg width="64" height="64" viewBox="0 0 64 64" style={{transform:'rotate(-90deg)'}}>
          <circle className="ring-bg" cx="32" cy="32" r="26"/>
          <circle className="ring-arc" cx="32" cy="32" r="26"
            strokeDasharray="163" strokeDashoffset={offset}
            style={{transition:'stroke-dashoffset .8s ease'}}/>
        </svg>
        <div className="ring-lbl"><span>{savePct}%</span><span>saved</span></div>
      </div>
    </div>
  )
}

function GoalProgress({ g, curr }) {
  const pct = g.target && g.months
    ? Math.min(100, Math.round((g.monthly / (pf(g.target) / Math.max(g.months, 1))) * 100))
    : 0
  return (
    <div className="gp-item">
      <div className="gp-top">
        <span className="gp-name">
          <span style={{width:7,height:7,borderRadius:'50%',background:g.color,display:'inline-block',flexShrink:0}}></span>
          {g.name || 'Unnamed goal'}
        </span>
        <span className="gp-meta">
          {g.monthly ? fmtC(g.monthly, curr) + '/mo' : ''}
          {g.target ? ' · target ' + fmtC(pf(g.target), curr) : ''}
        </span>
      </div>
      <div className="gp-track"><div className="gp-fill" style={{width:`${pct}%`,background:g.color}}></div></div>
      <div className="gp-bottom">
        <span>{g.moLabel ? 'By ' + g.moLabel : ''}</span>
        <span className="on">{g.months !== null && g.months > 0 ? `${g.months} months to go` : g.months === 0 ? '🎉 This month!' : ''}</span>
      </div>
    </div>
  )
}

function DebtProgress({ g, curr }) {
  const isBNPL = g.type === 'bnpl'
  const totalIns = pf(g.total) && g.monthly ? Math.ceil(pf(g.total) / g.monthly) : 0
  const paidCount = totalIns - (g.remaining || 0)
  const pct = totalIns > 0 ? Math.min(100, Math.round(paidCount / totalIns * 100)) : 5
  return (
    <div className={`gp-item ${isBNPL ? 'bnpl-p' : 'debt-p'}`}>
      <div className="gp-top">
        <span className="gp-name">
          <span style={{width:7,height:7,borderRadius:'50%',background:g.color,display:'inline-block',flexShrink:0}}></span>
          {g.name || 'Unnamed'}
          {isBNPL && <span style={{fontSize:'.58rem',color:'#9b7ab5',background:'#f5f0fa',padding:'.1rem .4rem',borderRadius:'1rem',marginLeft:'.3rem'}}>BNPL</span>}
        </span>
        <span className="gp-meta">{g.monthly ? fmtC(g.monthly, curr) + '/mo' : ''}</span>
      </div>
      <div className="gp-track">
        <div className="gp-fill" style={{width:`${pct}%`,background:isBNPL?'#c4a0e0':'#f09595'}}></div>
      </div>
      <div className="gp-bottom">
        <span>{isBNPL ? `${g.remaining || 0} payments left` : (pf(g.total) ? fmtC(pf(g.total), curr) + ' owed' : '')}</span>
        <span className={isBNPL ? 'bnpl-on' : 'debt-on'}>{g.moLabel ? (isBNPL ? 'Clears ' : 'Debt-free ') + g.moLabel + ' 🎉' : ''}</span>
      </div>
    </div>
  )
}

function DonutChart({ expStore, totalExp, chartMode, onModeChange, curr }) {
  const [flipped, setFlipped] = useState(false)

  if (!totalExp) return (
    <div className="chart-card">
      <div className="chart-card-hdr">
        <div className="chart-title">🍩 Spending by category</div>
      </div>
      <div className="empty-chart"><span>🌿</span>Enter expenses to see</div>
    </div>
  )

  const cats = CATS.map(c => ({ name:c.name, emoji:c.emoji, color:c.color, val:cTot(expStore,c.id) }))
    .filter(c => c.val > 0).sort((a,b) => b.val - a.val)

  const subs = []
  CATS.forEach(cat => cat.subs.forEach(sub => {
    const v = pf((expStore[cat.id]||{})[sub.id])
    if (v) subs.push({ label:sub.label, val:v, color:cat.color })
  }))
  subs.sort((a,b) => b.val - a.val)

  const R=38, cx=48, cy=48, sz=96, circ=2*Math.PI*R
  let off = 0
  const paths = cats.map(c => {
    const d = c.val / totalExp * circ
    const el = <circle key={c.name} cx={cx} cy={cy} r={R} fill="none" stroke={c.color}
      strokeWidth="13" strokeDasharray={`${d} ${circ-d}`} strokeDashoffset={-off}
      style={{transition:'all .5s ease'}}/>
    off += d
    return el
  })

  const top = subs[0]
  const obsText = top ? `${top.label} is your single biggest expense at ${fmtC(top.val, curr)} (${Math.round(top.val/totalExp*100)}% of total).` : ''

  return (
    <div className="chart-card">
      <div className="chart-card-hdr">
        <div className="chart-title">🍩 Spending by category</div>
        <div className="chart-toggle">
          <button className={`ct-btn ${chartMode==='budget'?'active':''}`} onClick={() => onModeChange('budget')}>Budgeted</button>
          <button className={`ct-btn ${chartMode==='actual'?'active':''}`} onClick={() => onModeChange('actual')}>Actual</button>
        </div>
      </div>
      <div className={`flip-card ${flipped?'flipped':''}`} onClick={() => setFlipped(f=>!f)}>
        <div className="flip-front">
          <div className="donut-wrap">
            <div className="donut-svg-wrap">
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{transform:'rotate(-90deg)'}}>
                <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--sage-p)" strokeWidth="13"/>
                {paths}
              </svg>
              <div className="donut-center">
                <span className="donut-center-v">{fmtC(totalExp,curr)}</span>
                <span className="donut-center-l">total</span>
              </div>
            </div>
            <div className="donut-legend">
              {cats.map(c => (
                <div key={c.name} className="leg-item">
                  <span className="leg-dot" style={{background:c.color}}></span>
                  <span className="leg-name">{c.emoji} {c.name}</span>
                  <span className="leg-val">{fmtC(c.val,curr)}</span>
                  <span className="leg-pct">{Math.round(c.val/totalExp*100)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flip-hint">See full breakdown <span className="flip-icon">↻</span></div>
        </div>
        <div className="flip-back">
          <div className="fb-title">Every expense — ranked by cost</div>
          {subs.map((s,i) => (
            <div key={i} className="fb-row">
              <span className="fb-nm">
                <span style={{width:6,height:6,borderRadius:'50%',background:s.color,display:'inline-block',flexShrink:0}}></span>
                {i+1}. {s.label}
              </span>
              <span className="fb-val">{fmtC(s.val,curr)} <span style={{fontWeight:300,color:'var(--muted)',fontSize:'.65rem'}}>· {Math.round(s.val/totalExp*100)}%</span></span>
            </div>
          ))}
          {obsText && <div className="fb-obs">{obsText}</div>}
          <div className="flip-hint">Back to chart <span className="flip-icon">↻</span></div>
        </div>
      </div>
    </div>
  )
}

function BarChart({ income, totalExp, totalGoals, afterGoals, curr }) {
  const [flipped, setFlipped] = useState(false)

  const items = [
    { l:'💰 Income', v:income, c:'var(--sage)' },
    { l:'💸 Expenses', v:totalExp, c:'var(--terra)' },
    { l:'🎯 Goals & debt', v:totalGoals, c:'var(--gold)' },
  ].filter(i => i.v > 0)

  if (!items.length) return (
    <div className="chart-card">
      <div className="chart-card-hdr"><div className="chart-title">📊 Income vs expenses vs goals</div></div>
      <div className="empty-chart"><span>📊</span>Enter income to compare</div>
    </div>
  )

  const mx = Math.max(...items.map(i => i.v), 1)
  let obs = ''
  if (income && totalExp) {
    const expPct = Math.round(totalExp / income * 100)
    const goalPct = totalGoals ? Math.round(totalGoals / income * 100) : 0
    if (afterGoals < 0) obs = `Expenses and goals exceed income by ${fmtC(Math.abs(afterGoals),curr)}. Review your largest categories first.`
    else if (expPct > 80) obs = `Expenses take ${expPct}% of income, leaving little room for goals.`
    else obs = `Expenses are ${expPct}% of income${goalPct ? `, goals take another ${goalPct}%` : ''}. You have ${fmtC(Math.max(0,afterGoals),curr)} left over.`
  }

  return (
    <div className="chart-card">
      <div className="chart-card-hdr"><div className="chart-title">📊 Income vs expenses vs goals</div></div>
      <div className={`flip-card ${flipped?'flipped':''}`} onClick={() => setFlipped(f=>!f)}>
        <div className="flip-front">
          <div className="bar-chart-wrap">
            {items.map(i => (
              <div key={i.l} className="bar-row">
                <div className="bar-row-top">
                  <span className="bar-row-nm">{i.l}</span>
                  <span className="bar-row-val">{fmtC(i.v,curr)}</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{width:`${Math.round(i.v/mx*100)}%`,background:i.c}}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flip-hint">See insight <span className="flip-icon">↻</span></div>
        </div>
        <div className="flip-back">
          <div className="fb-title">What the numbers say</div>
          {items.map(i => (
            <div key={i.l} className="fb-row">
              <span className="fb-nm">{i.l}</span>
              <span className="fb-val">{fmtC(i.v,curr)} · {Math.round(i.v/mx*100)}%</span>
            </div>
          ))}
          <div className="fb-obs">{obs || 'Enter all your numbers to see an observation here.'}</div>
          <div className="flip-hint">Back to chart <span className="flip-icon">↻</span></div>
        </div>
      </div>
    </div>
  )
}

function Suggestions({ income, totalExp, surplus, afterGoals, goals, savePct, state, expStore, curr }) {
  const [expanded, setExpanded] = useState({})

  const sugs = []
  if (!income && !totalExp) {
    sugs.push({ t:'info', ico:'👆', tag:'Get started', text:'Enter your income and expand the categories on the left — your results update live here.' })
  } else {
    const savGoals = goals.filter(g => g.type === 'savings')
    if (income && afterGoals >= 0 && goals.length) {
      sugs.push({ t:'ok', ico:'✅', tag:'On track', text:`Your income covers all expenses and goals with ${fmtC(afterGoals,curr)} to spare this month.`, action:`Consider putting that ${fmtC(afterGoals,curr)} surplus into an emergency fund or boosting one of your existing savings goals.` })
    } else if (income && afterGoals < 0 && savGoals.length) {
      const shortfall = Math.abs(afterGoals)
      sugs.push({ t:'cut', ico:'⚠️', tag:'Shortfall on goals', text:`Right now you can only put ${fmtC(Math.max(0,surplus),curr)}/mo toward your goals — ${fmtC(shortfall,curr)} short of your target.`, action:`Try trimming Lifestyle or Eating out first. Reducing by just ${fmtC(Math.ceil(shortfall/2),curr)} in two categories closes the gap.` })
    } else if (income && surplus < 0) {
      sugs.push({ t:'cut', ico:'🔴', tag:'Expenses exceed income', text:`Your expenses are ${fmtC(Math.abs(surplus),curr)} more than your income this month.`, action:`Start by reviewing Eating out, Shopping, and Subscriptions — small cuts across several categories add up faster than one big cut.` })
    }
    const bnpl = goals.find(g => g.type === 'bnpl')
    if (bnpl && bnpl.monthly && bnpl.moLabel) {
      sugs.push({ t:'info', ico:'💳', tag:'BNPL insight', text:`Once your ${bnpl.name||'BNPL'} clears in ${bnpl.moLabel}, redirecting ${fmtC(bnpl.monthly,curr)}/mo adds ${fmtC(bnpl.monthly*12,curr)} to savings over the next year.`, action:`Set a reminder for ${bnpl.moLabel} to redirect this payment.` })
    }
    const debt = goals.find(g => g.type === 'debt')
    if (debt && debt.monthly && debt.moLabel) {
      sugs.push({ t:'info', ico:'💡', tag:'Debt insight', text:`Clear ${debt.name||'your debt'} by ${debt.moLabel} then redirect ${fmtC(debt.monthly,curr)}/mo — that's ${fmtC(debt.monthly*12,curr)}/year back in your pocket.`, action:`Once cleared, split that ${fmtC(debt.monthly,curr)} between an emergency fund and a longer-term savings goal.` })
    }
    const essTotal = cTot(expStore, 'essentials')
    if (essTotal && income > 0) {
      const p = Math.round(essTotal / income * 100)
      if (p > 50) sugs.push({ t:'warn', ico:'🏠', tag:'High essential costs', text:`${p}% of your income goes on essentials. Keeping this under 50% long-term gives more room to save.`, action:`The main lever is usually rent. If rent is over 30% of income, consider options — a flatmate, moving slightly further out, or renegotiating your lease.` })
    }
    if (savePct >= 20) sugs.push({ t:'ok', ico:'🌟', tag:'Strong savings rate', text:`You're saving ${savePct}% of income — above the recommended 20%. Keep going.`, action:`Consider whether your savings are in the right place — a high-interest account, ISA, or investment account could make this work harder.` })
    else if (savePct > 0) sugs.push({ t:'info', ico:'📈', tag:'Grow your savings rate', text:`Your savings rate is ${savePct}%. Reaching 20% over time makes a significant difference.`, action:`Try increasing your Future Me category by just 1% of income. Do it each time you get a pay rise.` })
  }

  return (
    <div className="sugs-wrap">
      {sugs.map((s, i) => (
        <div key={i} className={`sug ${s.t} ${expanded[i] ? 'expanded' : ''}`}
          onClick={() => s.action && setExpanded(e => ({ ...e, [i]: !e[i] }))}>
          <div className="sug-ico">{s.ico}</div>
          <div style={{flex:1}}>
            <span className="sug-tag">{s.tag}</span>
            <div className="sug-text">{s.text}</div>
            {s.action && <div className="sug-action">{s.action}</div>}
            {s.action && <div className="sug-hint">{expanded[i] ? 'Tap to collapse' : 'Tap to see action'}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectionCalc({ surplus, curr }) {
  const [mo, setMo] = useState('')
  const [yrs, setYrs] = useState(3)
  const [rate, setRate] = useState(4.5)
  const [lump, setLump] = useState(0)

  const moVal = parseFloat(mo) || 0
  const mos = yrs * 12, r = rate / 100 / 12
  const tot = r > 0 ? lump * Math.pow(1+r,mos) + moVal * (Math.pow(1+r,mos)-1) / r : lump + moVal * mos
  const con = lump + moVal * mos

  return (
    <div className="calc-card">
      <h3>🌱 Savings projection</h3>
      <p>Small amounts, held patiently, become something significant.</p>
      <div className="calc-inputs">
        <div className="ci">
          <label>Monthly saving</label>
          <div className="ci-row"><span>{curr}</span><input type="number" placeholder="300" value={mo} onChange={e=>setMo(e.target.value)}/></div>
        </div>
        <div className="ci">
          <label>Years saving</label>
          <div className="ci-row"><input type="number" value={yrs} min="1" max="30" onChange={e=>setYrs(e.target.value)}/><span>yrs</span></div>
        </div>
        <div className="ci">
          <label>Interest rate</label>
          <div className="ci-row"><input type="number" value={rate} step=".1" onChange={e=>setRate(e.target.value)}/><span>%</span></div>
        </div>
        <div className="ci">
          <label>Starting amount</label>
          <div className="ci-row"><span>{curr}</span><input type="number" value={lump} onChange={e=>setLump(e.target.value)}/></div>
        </div>
      </div>
      <div className="calc-out">
        <div><span className="co-lbl">You put in</span><span className="co-val">{fmtC(con,curr)}</span></div>
        <div><span className="co-lbl">Interest earned</span><span className="co-val g">{fmtC(Math.max(0,tot-con),curr)}</span></div>
        <div><span className="co-lbl">Total saved</span><span className="co-val g">{fmtC(tot,curr)}</span></div>
      </div>
      {surplus <= 0 && <div className="calc-note">Once you have a surplus, here is what consistent saving could look like.</div>}
    </div>
  )
}

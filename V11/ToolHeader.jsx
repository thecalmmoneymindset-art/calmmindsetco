import { useState } from 'react'

const MONTHS_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatMonthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-')
  return `${MONTHS_LABELS[parseInt(m, 10) - 1]} ${y}`
}

const styles = `
  .th-bar {
    padding: .75rem 1.8rem; display: flex; justify-content: space-between;
    align-items: center; border-bottom: 1px solid rgba(125,155,110,.18);
    background: white; flex-shrink: 0; gap: 1rem;
  }
  .th-brand {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem;
    color: #1e1e1a; display: flex; align-items: center; gap: .4rem;
    white-space: nowrap;
  }
  .th-right {
    display: flex; align-items: center; gap: .65rem; flex-wrap: wrap;
  }

  /* Currency selector */
  .th-curr {
    display: flex; align-items: center; gap: .4rem;
    background: #f8f5f0; border: 1px solid rgba(125,155,110,.18);
    border-radius: 2rem; padding: .3rem .8rem;
  }
  .th-curr label {
    font-size: .58rem; letter-spacing: .1em; text-transform: uppercase; color: #7a7971;
  }
  .th-curr select {
    border: none; outline: none; font-family: 'Sora', sans-serif;
    font-size: .76rem; color: #1e1e1a; background: transparent; cursor: pointer;
  }

  /* Month picker */
  .th-month-wrap { position: relative; }
  .th-month-btn {
    display: flex; align-items: center; gap: .4rem;
    background: #f8f5f0; border: 1px solid rgba(125,155,110,.18);
    border-radius: 2rem; padding: .32rem .85rem; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: .75rem; color: #1e1e1a;
    transition: all .18s;
  }
  .th-month-btn:hover { border-color: #b8cdb0; background: #eef3eb; }
  .th-month-btn .th-chev { font-size: .55rem; color: #7a7971; }

  .th-month-dd {
    position: absolute; top: calc(100% + 6px); right: 0;
    background: white; border: 1px solid rgba(125,155,110,.18);
    border-radius: 12px; box-shadow: 0 12px 32px rgba(30,30,26,.1);
    min-width: 180px; z-index: 50; overflow: hidden;
    animation: ddIn .15s ease;
  }
  @keyframes ddIn { from { opacity:0; transform:translateY(-4px) } to { opacity:1; transform:none } }
  .th-dd-section { padding: .4rem 0; }
  .th-dd-label {
    font-size: .54rem; letter-spacing: .14em; text-transform: uppercase;
    color: #b8cdb0; padding: .35rem .9rem .15rem; display: block;
  }
  .th-dd-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: .48rem .9rem; font-size: .76rem; color: #1e1e1a;
    cursor: pointer; transition: background .12s; gap: .5rem;
  }
  .th-dd-item:hover { background: #eef3eb; }
  .th-dd-item.active { color: #4e7a3e; font-weight: 500; }
  .th-dd-item .dd-dot { width: 6px; height: 6px; border-radius: 50%; background: #7d9b6e; flex-shrink:0; }
  .th-dd-item .dd-ago { font-size: .62rem; color: #b8cdb0; }
  .th-dd-divider { height: 1px; background: rgba(125,155,110,.12); margin: .2rem 0; }
  .th-dd-new {
    display: flex; align-items: center; gap: .4rem;
    padding: .48rem .9rem; font-size: .75rem; color: #7d9b6e;
    cursor: pointer; transition: background .12s;
  }
  .th-dd-new:hover { background: #eef3eb; }

  /* Save button */
  .th-save {
    display: flex; align-items: center; gap: .4rem;
    padding: .38rem 1rem; border-radius: 2rem; border: none;
    font-family: 'Sora', sans-serif; font-size: .73rem; cursor: pointer;
    transition: all .2s; white-space: nowrap;
  }
  .th-save.idle { background: #1e1e1a; color: white; }
  .th-save.idle:hover { background: #4e7a3e; }
  .th-save.saving { background: #f8f5f0; color: #7a7971; border: 1px solid rgba(125,155,110,.18); cursor: default; }
  .th-save.saved { background: #eef3eb; color: #4e7a3e; border: 1px solid #b8cdb0; cursor: default; }
  .th-save.error { background: #fff5f2; color: #c4714a; border: 1px solid #f0c4b8; cursor: default; }

  /* Login prompt */
  .th-login-btn {
    display: flex; align-items: center; gap: .4rem;
    background: #eef3eb; border: 1px solid #b8cdb0;
    border-radius: 2rem; padding: .38rem 1rem; cursor: pointer;
    font-family: 'Sora', sans-serif; font-size: .73rem; color: #4e7a3e;
    transition: all .2s; white-space: nowrap;
  }
  .th-login-btn:hover { background: #7d9b6e; color: white; border-color: #7d9b6e; }

  /* User avatar */
  .th-user { position: relative; }
  .th-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    background: linear-gradient(135deg, #7d9b6e, #4e7a3e);
    display: flex; align-items: center; justify-content: center;
    font-size: .7rem; color: white; font-weight: 500; cursor: pointer;
    border: 2px solid #b8cdb0; transition: border-color .15s;
    font-family: 'Sora', sans-serif;
  }
  .th-avatar:hover { border-color: #7d9b6e; }
  .th-user-dd {
    position: absolute; top: calc(100% + 8px); right: 0;
    background: white; border: 1px solid rgba(125,155,110,.18);
    border-radius: 12px; box-shadow: 0 12px 32px rgba(30,30,26,.1);
    min-width: 200px; z-index: 50; overflow: hidden;
    animation: ddIn .15s ease;
  }
  .th-user-email {
    padding: .75rem .9rem; font-size: .7rem; color: #7a7971;
    border-bottom: 1px solid rgba(125,155,110,.12); line-height: 1.4;
  }
  .th-user-email strong { display: block; font-size: .75rem; color: #1e1e1a; font-weight: 500; margin-bottom: .1rem; }
  .th-signout {
    display: flex; align-items: center; gap: .5rem;
    padding: .55rem .9rem; font-size: .76rem; color: #c4714a;
    cursor: pointer; transition: background .12s;
    background: none; border: none; width: 100%;
    font-family: 'Sora', sans-serif; text-align: left;
  }
  .th-signout:hover { background: #fff5f2; }

  .th-close {
    background: #f8f5f0; border: 1px solid rgba(125,155,110,.18);
    border-radius: 2rem; padding: .38rem .95rem;
    font-family: 'Sora', sans-serif; font-size: .7rem;
    cursor: pointer; color: #7a7971; transition: all .2s; white-space: nowrap;
  }
  .th-close:hover { background: #eef3eb; color: #1e1e1a; }
`

export default function ToolHeader({
  user, saveStatus, savedMonths, activeMonth,
  curr, onCurrChange,
  onSave, onLoginClick, onSignOut, onClose,
  onMonthChange,
}) {
  const [monthOpen, setMonthOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '?'

  const handleNewMonth = () => {
    // Generate current month and switch to it
    const now = new Date()
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(ym)
    setMonthOpen(false)
  }

  return (
    <>
      <style>{styles}</style>
      {/* Close dropdowns on outside click */}
      {(monthOpen || userOpen) && (
        <div style={{ position:'fixed', inset:0, zIndex:40 }}
          onClick={() => { setMonthOpen(false); setUserOpen(false) }}
        />
      )}

      <div className="th-bar">
        <div className="th-brand">🌿 <span>Calm Money System</span></div>

        <div className="th-right">
          {/* Currency */}
          <div className="th-curr">
            <label>Currency</label>
            <select value={curr} onChange={e => onCurrChange(e.target.value)}>
              <option value="£">£ GBP</option>
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="₦">₦ NGN</option>
              <option value="د.إ">د.إ AED</option>
              <option value="﷼">﷼ SAR</option>
            </select>
          </div>

          {/* Month picker (only when logged in) */}
          {user && (
            <div className="th-month-wrap">
              <div className="th-month-btn" onClick={() => { setMonthOpen(o => !o); setUserOpen(false) }}>
                📅 {formatMonthLabel(activeMonth)} <span className="th-chev">▼</span>
              </div>
              {monthOpen && (
                <div className="th-month-dd">
                  {savedMonths.length > 0 && (
                    <div className="th-dd-section">
                      <span className="th-dd-label">Saved months</span>
                      {savedMonths.map(m => (
                        <div
                          key={m.month}
                          className={`th-dd-item ${m.month === activeMonth ? 'active' : ''}`}
                          onClick={() => { onMonthChange(m.month); setMonthOpen(false) }}
                        >
                          <span style={{ display:'flex', alignItems:'center', gap:'.4rem' }}>
                            {m.month === activeMonth && <span className="dd-dot" />}
                            {formatMonthLabel(m.month)}
                          </span>
                          <span className="dd-ago">{relativeTime(m.updated_at)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="th-dd-divider" />
                  <div className="th-dd-new" onClick={handleNewMonth}>
                    + New month (today)
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save button (logged in) */}
          {user && (
            <button
              className={`th-save ${saveStatus}`}
              onClick={() => saveStatus === 'idle' && onSave()}
              disabled={saveStatus === 'saving'}
            >
              {saveStatus === 'idle' && '💾 Save plan'}
              {saveStatus === 'saving' && '⟳ Saving…'}
              {saveStatus === 'saved' && '✓ Saved'}
              {saveStatus === 'error' && '⚠ Retry'}
            </button>
          )}

          {/* Login button (not logged in) */}
          {!user && (
            <button className="th-login-btn" onClick={onLoginClick}>
              🌿 Save my plan
            </button>
          )}

          {/* User avatar (logged in) */}
          {user && (
            <div className="th-user">
              <div className="th-avatar" onClick={() => { setUserOpen(o => !o); setMonthOpen(false) }}>
                {initials}
              </div>
              {userOpen && (
                <div className="th-user-dd">
                  <div className="th-user-email">
                    <strong>Signed in</strong>
                    {user.email}
                  </div>
                  <button className="th-signout" onClick={() => { onSignOut(); setUserOpen(false) }}>
                    ↩ Sign out
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="th-close" onClick={onClose}>✕ Close</button>
        </div>
      </div>
    </>
  )
}

function relativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

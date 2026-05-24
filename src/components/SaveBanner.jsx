import { useState } from 'react'

const styles = `
  .sb-banner {
    padding: .52rem 1.8rem; display: flex; align-items: center;
    gap: .7rem; font-size: .7rem; flex-shrink: 0;
    transition: all .3s; border-bottom: 1px solid;
  }
  .sb-banner.cloud {
    background: #eef3eb; border-color: #b8cdb0; color: #4e7a3e;
  }
  .sb-banner.local {
    background: #eef3eb; border-color: #b8cdb0; color: #4e7a3e;
  }
  .sb-banner.unsaved {
    background: #fdf8ec; border-color: #e8d8a0; color: #7a5820;
  }
  .sb-dismiss {
    margin-left: auto; background: none; border: 1px solid currentColor;
    color: inherit; cursor: pointer; font-size: .62rem;
    font-family: 'Sora', sans-serif; padding: .15rem .6rem;
    border-radius: 1rem; opacity: .7; transition: opacity .15s;
  }
  .sb-dismiss:hover { opacity: 1; }
`

export default function SaveBanner({ user, saveStatus }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <>
      <style>{styles}</style>
      {user ? (
        <div className={`sb-banner ${saveStatus === 'saved' ? 'cloud' : saveStatus === 'saving' ? 'cloud' : 'cloud'}`}>
          💾 <span>
            <strong>Saved to your account.</strong> Your budget syncs across all your devices automatically.
          </span>
          <button className="sb-dismiss" onClick={() => setDismissed(true)}>Got it</button>
        </div>
      ) : (
        <div className="sb-banner local">
          🔒 <span>
            <strong>Auto-saved in this browser.</strong> Create a free account to access your budget on any device.
          </span>
          <button className="sb-dismiss" onClick={() => setDismissed(true)}>Got it</button>
        </div>
      )}
    </>
  )
}

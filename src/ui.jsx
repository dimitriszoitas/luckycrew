import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useStore, nav, toast, crewById, potTotal, isMemberOf, crewLuck, crewEarnings } from './store.jsx'
import { GAME, fmtEUR, fmtEUR2, fmtPct } from './game.js'

// Keyboard activation for clickable cards (SC 2.1.1)
export const onCardKey = handler => e => {
  if (e.target !== e.currentTarget) return // nested buttons handle their own keys
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault() // stop Space from scrolling the page
    handler()
  }
}

// Odometer-style count-up: tweens from the previous value on every change.
// Jumps instantly under prefers-reduced-motion or the ⏸ toggle.
export function AnimatedNumber({ value, format = v => v }) {
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(value)
  const rafRef = useRef()
  useEffect(() => {
    const from = displayRef.current
    const to = value
    if (from === to) return
    const instant =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.dataset.motion === 'off'
    if (instant) { displayRef.current = to; setDisplay(to); return }
    const t0 = performance.now()
    const dur = 700
    const ease = x => 1 - Math.pow(1 - x, 3)
    cancelAnimationFrame(rafRef.current)
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur)
      const v = from + (to - from) * ease(p)
      displayRef.current = v
      setDisplay(v)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])
  return <>{format(display)}</>
}

export function Header() {
  const { state, dispatch } = useStore()
  const [showA11y, setShowA11y] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  useEffect(() => {
    if (!showMenu) return
    const onDoc = e => { if (!menuRef.current?.contains(e.target)) setShowMenu(false) }
    const onKey = e => { if (e.key === 'Escape') setShowMenu(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [showMenu])
  const demo = label => { setShowMenu(false); toast(dispatch, `${label}: demo only`, '🔧') }
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <button type="button" className="logo" aria-label="LuckyCrew home" onClick={() => nav(dispatch, { name: 'home' })}>
          <span className="mark" aria-hidden="true">
            <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" /><path d="M13 11v2" /><path d="M13 17v2" />
            </svg>
          </span>
          <span><span className="lucky">Lucky</span>Crew</span>
        </button>
        <button
          className="nav-link hide-mobile"
          aria-current={state.route.name === 'exercise' ? 'page' : undefined}
          onClick={() => nav(dispatch, { name: 'exercise' })}
        >
          Exercise Details
        </button>
        <div className="spacer" />
        <button className="wallet-chip" onClick={() => nav(dispatch, { name: 'wallet' })} aria-label={`Wallet, balance ${fmtEUR2(state.wallet.balance)}`}>
          <span aria-hidden="true">💶</span> <AnimatedNumber value={state.wallet.balance} format={v => fmtEUR2(v)} />
        </button>
        <button className="icon-btn hide-mobile" aria-label="Accessibility options" aria-haspopup="dialog" onClick={() => setShowA11y(true)}>
          <span aria-hidden="true">♿</span>
        </button>
        <button className="icon-btn hide-mobile" onClick={() => dispatch({ type: 'theme' })} aria-label={state.theme === 'dark' ? 'Switch to corporate mode' : 'Switch to playful mode'}>
          <span aria-hidden="true">{state.theme === 'dark' ? '🏛️' : '🎮'}</span>
        </button>
        <div className="avatar-menu-wrap" ref={menuRef}>
          <button className="avatar-chip" aria-label="Account menu: Jim" aria-haspopup="menu" aria-expanded={showMenu} onClick={() => setShowMenu(v => !v)}>
            J
          </button>
          {showMenu && (
            <div className="avatar-menu" role="menu" aria-label="Account">
              <div className="avatar-menu-head">
                <span className="avatar-chip" aria-hidden="true">J</span>
                <div>
                  <div className="row-title">Jim</div>
                  <div className="row-sub">jim@luckycrew.app</div>
                </div>
              </div>
              <button role="menuitem" className="mobile-only" onClick={() => { setShowMenu(false); nav(dispatch, { name: 'exercise' }) }}>
                Exercise Details
              </button>
              <button role="menuitem" className="mobile-only" onClick={() => { setShowMenu(false); setShowA11y(true) }}>
                Accessibility
              </button>
              <button role="menuitem" className="mobile-only" onClick={() => { setShowMenu(false); dispatch({ type: 'theme' }) }}>
                {state.theme === 'dark' ? 'Corporate mode' : 'Playful mode'}
              </button>
              <div className="sep mobile-only" aria-hidden="true" />
              <button role="menuitem" onClick={() => demo('Profile')}>Profile</button>
              <button role="menuitem" onClick={() => demo('Settings')}>Settings</button>
              <button role="menuitem" onClick={() => { setShowMenu(false); nav(dispatch, { name: 'wallet' }) }}>Wallet</button>
              <div className="sep" aria-hidden="true" />
              <button role="menuitem" onClick={() => demo('Sign out')}>Sign out</button>
            </div>
          )}
        </div>
      </div>
      {showA11y && <A11yPanel onClose={() => setShowA11y(false)} />}
    </header>
  )
}

// Accessible toggle switch (role=switch, 44px hit target via ::after halo)
function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`switch ${checked ? 'on' : ''}`} onClick={onChange}>
      <span className="knob" aria-hidden="true" />
    </button>
  )
}

// All accessibility controls in one place, applied via attributes on <html>
function A11yPanel({ onClose }) {
  const root = document.documentElement
  const [motionOn, setMotionOn] = useState(root.dataset.motion !== 'off')
  const [textSize, setTextSize] = useState(root.dataset.textsize || 'normal')
  const [contrast, setContrast] = useState(root.dataset.contrast === 'high')
  const [solid, setSolid] = useState(root.dataset.transparency === 'off')

  const toggleMotion = () => {
    const next = !motionOn
    setMotionOn(next)
    root.dataset.motion = next ? 'on' : 'off'
  }
  const applyText = v => {
    setTextSize(v)
    root.dataset.textsize = v
    root.style.zoom = v === 'normal' ? '' : v === 'large' ? '1.15' : '1.3'
  }
  const toggleContrast = () => {
    const next = !contrast
    setContrast(next)
    if (next) root.dataset.contrast = 'high'
    else delete root.dataset.contrast
  }
  const toggleSolid = () => {
    const next = !solid
    setSolid(next)
    if (next) root.dataset.transparency = 'off'
    else delete root.dataset.transparency
  }

  return (
    <Modal onClose={onClose} width={480} label="Accessibility options">
      <h2 className="display">Accessibility</h2>
      <p className="sub">Applies instantly and stays on while you browse.</p>

      <div className="a11y-row">
        <div>
          <div className="row-title">Animations</div>
          <div className="row-sub">Sparkles, waves, tickers and other decorative motion</div>
        </div>
        <Switch checked={motionOn} onChange={toggleMotion} label="Animations" />
      </div>

      <fieldset className="a11y-row" style={{ border: 0 }}>
        <legend className="row-title" style={{ padding: 0 }}>Text size</legend>
        <div className="seg">
          {[['normal', 'Normal'], ['large', 'Large'], ['xl', 'Extra large']].map(([v, label]) => (
            <button key={v} type="button" className={textSize === v ? 'on' : ''} aria-pressed={textSize === v} onClick={() => applyText(v)}>{label}</button>
          ))}
        </div>
      </fieldset>

      <div className="a11y-row">
        <div>
          <div className="row-title">High contrast</div>
          <div className="row-sub">Stronger borders and brighter secondary text</div>
        </div>
        <Switch checked={contrast} onChange={toggleContrast} label="High contrast" />
      </div>

      <div className="a11y-row">
        <div>
          <div className="row-title">Reduce transparency</div>
          <div className="row-sub">Solid backgrounds instead of blur effects</div>
        </div>
        <Switch checked={solid} onChange={toggleSolid} label="Reduce transparency" />
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: 18 }} onClick={onClose}>Done</button>
    </Modal>
  )
}

export function Countdown({ target, small }) {
  const [t, setT] = useState(Math.max(0, target - Date.now()))
  useEffect(() => {
    const iv = setInterval(() => setT(Math.max(0, target - Date.now())), 1000)
    return () => clearInterval(iv)
  }, [target])
  const h = Math.floor(t / 3600000), m = Math.floor((t % 3600000) / 60000), s = Math.floor((t % 60000) / 1000)
  const cells = [[h, 'hrs'], [m, 'min'], [s, 'sec']]
  if (small) return <b role="timer" aria-label={`Closes in ${h} hours ${m} minutes`} style={{ fontFamily: 'var(--font-display)' }}>{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</b>
  return (
    <div className="countdown" role="timer" aria-label={`Draw closes in ${h} hours ${m} minutes`}>
      {cells.map(([v, l]) => (
        <div className="count-cell" key={l} aria-hidden="true">
          <div className="count-num"><span className="count-digit" key={v}>{String(v).padStart(2, '0')}</span></div>
          <div className="count-lbl">{l}</div>
        </div>
      ))}
    </div>
  )
}

export function Balls({ nums, star, result, size = '' }) {
  const matched = result ? nums.filter(n => result.nums.includes(n)) : null
  const label = `Numbers ${nums.join(', ')}, star ${star}` +
    (result ? `. Matched: ${matched.join(', ') || 'none'}${result.star === star ? ', star matched' : ''}` : '')
  return (
    <div className="ball-row" role="img" aria-label={label}>
      <span aria-hidden="true" style={{ display: 'contents' }}>
        {nums.map(n => (
          <div key={n} className={`ball ${size} ${result && result.nums.includes(n) ? 'hit' : ''}`}>{n}</div>
        ))}
        <span className="plus-sep">+</span>
        <div className={`ball star ${size} ${result && result.star === star ? 'hit' : ''}`}>{star}</div>
      </span>
    </div>
  )
}

export function StatusChip({ status }) {
  const words = { open: 'Open', locked: 'Locked', drawing: 'Drawing', settled: 'Settled' }
  return <span className={`chip ${status}`}>{words[status]}</span>
}

export function FacePile({ members, max = 5 }) {
  const shown = members.slice(0, max)
  return (
    <div className="face-pile">
      {shown.map(m => <div className="face" key={m.id} role="img" aria-label={m.name}>{m.avatar}</div>)}
      {members.length > max && <div className="face more">+{members.length - max}</div>}
    </div>
  )
}

export function LuckBadge({ luck, dim }) {
  return (
    <span className={`luck-badge ${dim ? 'dim' : ''}`} aria-label={`${luck.pct}% lucky: won ${luck.won} of ${luck.played} draws played`}>
      <span aria-hidden="true">🍀</span> {luck.pct}% lucky
    </span>
  )
}

// A reusable team card. Crews persist across draws; they enter lotteries.
export function CrewCard({ crew, joinLotteryCta }) {
  const { state, dispatch } = useStore()
  const member = isMemberOf(crew)
  const isCaptain = crew.captainId === 'you'
  const luck = crewLuck(state, crew.id)
  const earnings = crewEarnings(state, crew.id)
  const open = () => nav(dispatch, member ? { name: 'crew', crewId: crew.id } : { name: 'join', crewId: crew.id })
  return (
    <div className="card card-pad crew-card" role="button" tabIndex={0} aria-label={`${crew.name}, ${crew.members.length} members`} onClick={open} onKeyDown={onCardKey(open)}>
      <div className={`stripe ${crew.color}`} />
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div className="crew-emoji">{crew.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="crew-title" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{crew.name}</div>
          <div className="crew-meta" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {crew.members.length} member{crew.members.length !== 1 ? 's' : ''} · {crew.privacy === 'public' ? '🌍 Public' : '🔗 Invite only'}
            {isCaptain && ' · ⭐ your crew'}
          </div>
        </div>
        <LuckBadge luck={luck} />
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
        <span className="row-sub">
          Total earnings <b style={{ color: 'var(--money)', fontFamily: 'var(--font-display)', fontSize: 15 }}>{(earnings % 1 === 0 ? fmtEUR : fmtEUR2)(earnings)}</b>
        </span>
        <span className="row-sub">· won {luck.won} of {luck.played} draws</span>
        <div className="spacer" />
        {joinLotteryCta && (
          <button
            className="btn btn-outline btn-sm"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'openJoinLottery', crewId: crew.id }) }}
          >
            Join crew
          </button>
        )}
      </div>
    </div>
  )
}

// Compact list row for discovering public crews.
export function CrewTableRow({ crew }) {
  const { state, dispatch } = useStore()
  const luck = crewLuck(state, crew.id)
  const open = () => nav(dispatch, { name: 'join', crewId: crew.id })
  return (
    <div className="crew-trow" role="button" tabIndex={0} aria-label={`Join ${crew.name}`} onClick={open} onKeyDown={onCardKey(open)}>
      <div className="crew-emoji" style={{ width: 42, height: 42, fontSize: 21 }}>{crew.emoji}</div>
      <div style={{ minWidth: 0 }}>
        <div className="row-title">{crew.name}</div>
        <div className="row-sub">captain {crew.members.find(m => m.id === crew.captainId)?.name || 'unknown'}</div>
      </div>
      <div className="trow-cell">{crew.members.length} members</div>
      <div className="trow-cell"><LuckBadge luck={luck} /></div>
      <div className="trow-cell dim">{luck.won}/{luck.played} draws won</div>
      <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); nav(dispatch, { name: 'join', crewId: crew.id }) }}>
        Join crew
      </button>
    </div>
  )
}

// An ongoing lottery entry, styled as a golden ticket: countdown stub,
// max winnings and your share. Deliberately distinct from crew cards.
export function LotteryCard({ lottery }) {
  const { state, dispatch } = useStore()
  const crew = crewById(state, lottery.crewId)
  const pot = potTotal(lottery)
  const yourStake = lottery.contributions.you || 0
  const yourPct = pot ? yourStake / pot : 0
  const megaPot = Math.floor(state.mega.pot)
  const open = () => nav(dispatch, { name: 'lottery', lotteryId: lottery.id })
  return (
    <div className="lottery-card" role="button" tabIndex={0} aria-label={`Draw #${lottery.drawNo}, ${crew.name}`} onClick={open} onKeyDown={onCardKey(open)}>
      <div className="lottery-main">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="crew-title">Weekly Mega · Draw #{lottery.drawNo}</div>
          <StatusChip status={lottery.status} />
        </div>
        <div className="crew-meta" style={{ marginTop: 4, fontSize: 14 }}><b style={{ color: 'var(--text)' }}>{crew.emoji} {crew.name}</b></div>
        <div className="max-win-line">
          <div className="mw">
            <div className="k">Mega pot</div>
            <div className="v"><AnimatedNumber value={megaPot} format={v => fmtEUR(Math.floor(v))} /></div>
          </div>
          <div className="mw">
            <div className="k">Your max win</div>
            <div className="v you">{yourPct > 0 ? <AnimatedNumber value={Math.floor(megaPot * yourPct)} format={v => fmtEUR(Math.floor(v))} /> : 'buy shares'}</div>
          </div>
        </div>
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(yourPct * 100)} aria-label={`Your share of the pot: ${fmtPct(yourPct)}`} style={{ marginBottom: 8, height: 10 }}><i style={{ width: `${yourPct * 100}%` }} aria-hidden="true" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="crew-meta"><b style={{ color: 'var(--text)' }}>{fmtEUR2(pot)}</b> in the pot · {lottery.tickets.length} tickets</span>
          <div className="spacer" />
          <span className="crew-meta">your stake: <b className="pct-badge">{fmtEUR2(yourStake)}</b> ({fmtPct(yourPct)})</span>
        </div>
      </div>
      <div className="lottery-stub">
        <span className="closes">Closes in</span>
        <span className="time"><Countdown target={state.drawCloses} small /></span>
        <span className="closes" style={{ marginTop: 6 }}>Weekly Mega</span>
      </div>
    </div>
  )
}

// A completed lottery row: shows the outcome and your cut.
export function CompletedLotteryCard({ lottery }) {
  const { state, dispatch } = useStore()
  const crew = crewById(state, lottery.crewId)
  const won = lottery.settlement?.totalWon > 0
  const yourCut = lottery.settlement?.splits.find(s => s.memberId === 'you')?.amount || 0
  const open = () => nav(dispatch, { name: 'results', lotteryId: lottery.id })
  return (
    <div className="card completed-card" role="button" tabIndex={0} aria-label={`Draw #${lottery.drawNo} results, ${crew.name}`} onClick={open} onKeyDown={onCardKey(open)}>
      <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }}>{crew.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-title">Draw #{lottery.drawNo} · {crew.name}</div>
        <div className="row-sub">{lottery.tickets.length} tickets · {Object.keys(lottery.contributions).length} contributors</div>
      </div>
      {won ? (
        <div style={{ textAlign: 'right' }}>
          <div className="won-amt">🏆 {fmtEUR2(lottery.settlement.totalWon)}</div>
          <div className="row-sub">your cut <b style={{ color: 'var(--money)' }}>+{fmtEUR2(yourCut)}</b></div>
        </div>
      ) : (
        <div className="row-sub" style={{ whiteSpace: 'nowrap' }}>No win this time</div>
      )}
    </div>
  )
}

// Free-amount money input: type any amount (min-clamped), or step by €2.50.
// The more you put in, the bigger your cut of every win.
export function StakeInput({ value, min, onChange, label = 'Stake amount' }) {
  const step = 2.5
  const [text, setText] = useState(null) // transient while typing
  const set = v => onChange(Math.round(Math.max(min, v) * 100) / 100)
  const shown = text ?? (value % 1 === 0 ? String(value) : value.toFixed(2))
  const commit = () => {
    const v = parseFloat((text ?? '').replace(',', '.'))
    setText(null)
    if (!isNaN(v)) set(v)
  }
  return (
    <div className="stake-input">
      <button type="button" aria-disabled={value <= min} aria-label="€2.50 less" onClick={() => value > min && set(value - step)}>−</button>
      <div className="stake-field">
        <span aria-hidden="true" className="cur">€</span>
        <input
          inputMode="decimal"
          aria-label={label}
          value={shown}
          onChange={e => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commit() } }}
        />
      </div>
      <button type="button" aria-label="€2.50 more" onClick={() => set(value + step)}>+</button>
      <span className="sr-only" role="status">Stake {value.toFixed(2)} euros</span>
    </div>
  )
}

export function Modal({ children, onClose, width, label }) {
  const ref = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  useEffect(() => {
    const opener = document.activeElement
    const node = ref.current
    node.focus()
    const onKeyDown = e => {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current(); return }
      if (e.key !== 'Tab') return
      const focusables = node.querySelectorAll(
        'button:not(:disabled), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) { e.preventDefault(); return }
      const first = focusables[0], last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => { document.removeEventListener('keydown', onKeyDown, true); opener?.focus?.() }
  }, [])
  // Portal to <body>: ancestors with backdrop-filter/transform (e.g. the sticky
  // header) would otherwise become the containing block for position: fixed
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label} style={width ? { maxWidth: width } : undefined} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export function Toast() {
  const { state, dispatch } = useStore()
  return (
    <div role="status" aria-live="polite">
      {state.toast && (
        <div className="toast">
          <span aria-hidden="true">{state.toast.icon}</span> {state.toast.text}
          <button className="toast-close" aria-label="Dismiss notification" onClick={() => dispatch({ type: 'toast', toast: null })}>✕</button>
        </div>
      )}
    </div>
  )
}

const CONF_COLORS = ['#fbbf24', '#f59e0b', '#fde047', '#4f5fe8', '#93c5fd', '#ffffff']
export function Confetti({ count = 120 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 1.6,
    dur: 2.4 + Math.random() * 2.2,
    color: CONF_COLORS[i % CONF_COLORS.length],
    rot: Math.random() * 360,
  }))
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  )
}

// Golden twinkling sparkles + speckle dots for the hero backdrop
export function Sparkles({ count = 30, dots = 26 }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    left: (i * 37 + 11) % 100,
    top: (i * 53 + 7) % 100,
    size: 8 + ((i * 29) % 12),
    delay: (i * 0.37) % 3,
    dur: 2 + ((i * 17) % 20) / 10,
  }))
  const specks = Array.from({ length: dots }, (_, i) => ({
    left: (i * 41 + 23) % 100,
    top: (i * 67 + 13) % 100,
    size: 2 + ((i * 13) % 4),
    delay: (i * 0.53) % 4,
    dur: 3 + ((i * 23) % 25) / 10,
  }))
  return (
    <div className="sparkles" aria-hidden>
      {stars.map((s, i) => (
        <span key={`s${i}`} style={{ left: `${s.left}%`, top: `${s.top}%`, fontSize: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}>✦</span>
      ))}
      {specks.map((d, i) => (
        <i key={`d${i}`} className="speck" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
      ))}
    </div>
  )
}

export function FakeQR() {
  const cells = Array.from({ length: 169 }, (_, i) => {
    const r = Math.floor(i / 13), c = i % 13
    const corner = (r < 4 && c < 4) || (r < 4 && c > 8) || (r > 8 && c < 4)
    if (corner) {
      const rr = r > 8 ? r - 9 : r, cc = c > 8 ? c - 9 : c
      return rr === 0 || rr === 3 || cc === 0 || cc === 3 || (rr > 0 && rr < 3 && cc > 0 && cc < 3)
    }
    return ((i * 7919 + r * 31 + c * 17) % 5) < 2
  })
  return <div className="qr" role="img" aria-label="QR code for the invite link (demo)">{cells.map((on, i) => <i key={i} className={on ? '' : 'off'} />)}</div>
}

export function Footer() {
  return (
    <footer className="footer container">
      <div><b>LuckyCrew</b> · Group Play design prototype · dummy data, no real money, no real draws</div>
      <div>Play responsibly · 18+ · Design exercise by Jim (Dimitris Zoitas) · July 2026</div>
    </footer>
  )
}

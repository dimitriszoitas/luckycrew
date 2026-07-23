import React, { useEffect, useState } from 'react'
import { useStore, nav, crewById, lotteryFilled, isMemberOf, crewLuck } from './store.jsx'
import { GAME, fmtEUR, fmtEUR2, fmtPct } from './game.js'

export function Header() {
  const { state, dispatch } = useStore()
  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="logo" onClick={() => nav(dispatch, { name: 'home' })}>
          <span className="mark">🍀</span>
          <span><span className="lucky">Lucky</span>Crew</span>
        </div>
        <div className="spacer" />
        <button className="wallet-chip" onClick={() => nav(dispatch, { name: 'wallet' })} title="Wallet">
          <span>💶</span> {fmtEUR2(state.wallet.balance)}
        </button>
        <button className="icon-btn" onClick={() => dispatch({ type: 'theme' })} title="Toggle theme">
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <div className="avatar-chip" title="Jim">😎</div>
      </div>
    </div>
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
  if (small) return <b style={{ fontFamily: 'var(--font-display)' }}>{String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</b>
  return (
    <div className="countdown">
      {cells.map(([v, l]) => (
        <div className="count-cell" key={l}>
          <div className="count-num">{String(v).padStart(2, '0')}</div>
          <div className="count-lbl">{l}</div>
        </div>
      ))}
    </div>
  )
}

export function Balls({ nums, star, result, size = '' }) {
  return (
    <div className="ball-row">
      {nums.map(n => (
        <div key={n} className={`ball ${size} ${result && result.nums.includes(n) ? 'hit' : ''}`}>{n}</div>
      ))}
      <span className="plus-sep">+</span>
      <div className={`ball star ${size} ${result && result.star === star ? 'hit' : ''}`}>{star}</div>
    </div>
  )
}

export function StatusChip({ status }) {
  const label = { open: '● Open', locked: '🔒 Locked', drawing: '🎥 Drawing', settled: '✓ Settled' }[status]
  return <span className={`chip ${status}`}>{label}</span>
}

export function FacePile({ members, max = 5 }) {
  const shown = members.slice(0, max)
  return (
    <div className="face-pile">
      {shown.map(m => <div className="face" key={m.id} title={m.name}>{m.avatar}</div>)}
      {members.length > max && <div className="face more">+{members.length - max}</div>}
    </div>
  )
}

export function LuckBadge({ luck, dim }) {
  return (
    <span className={`luck-badge ${dim ? 'dim' : ''}`} title={`Won ${luck.won} of ${luck.played} draws played`}>
      🍀 {luck.pct}% lucky
    </span>
  )
}

// A reusable team card. Crews persist across draws; they enter lotteries.
export function CrewCard({ crew, joinLotteryCta }) {
  const { state, dispatch } = useStore()
  const member = isMemberOf(crew)
  const isCaptain = crew.captainId === 'you'
  const luck = crewLuck(state, crew.id)
  return (
    <div className="card card-pad crew-card" onClick={() => nav(dispatch, member ? { name: 'crew', crewId: crew.id } : { name: 'join', crewId: crew.id })}>
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
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 14 }}>
        <FacePile members={crew.members} max={5} />
        <span className="row-sub">won {luck.won} of {luck.played} draws</span>
        <div className="spacer" />
        {joinLotteryCta && (
          <button
            className="btn btn-gold btn-sm hover-cta"
            onClick={e => { e.stopPropagation(); dispatch({ type: 'openJoinLottery', crewId: crew.id }) }}
          >
            🎟️ Join lottery
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
  return (
    <div className="crew-trow" onClick={() => nav(dispatch, { name: 'join', crewId: crew.id })}>
      <div className="crew-emoji" style={{ width: 42, height: 42, fontSize: 21 }}>{crew.emoji}</div>
      <div style={{ minWidth: 0 }}>
        <div className="row-title">{crew.name}</div>
        <div className="row-sub">captain {crew.members.find(m => m.id === crew.captainId)?.name || 'unknown'}</div>
      </div>
      <div className="trow-cell">{crew.members.length} members</div>
      <div className="trow-cell"><LuckBadge luck={luck} /></div>
      <div className="trow-cell dim">{luck.won}/{luck.played} draws won</div>
      <button className="btn btn-primary btn-sm hover-cta" onClick={e => { e.stopPropagation(); nav(dispatch, { name: 'join', crewId: crew.id }) }}>
        👋 Join crew
      </button>
    </div>
  )
}

// An ongoing lottery entry, styled as a golden ticket: countdown stub,
// max winnings and your share. Deliberately distinct from crew cards.
export function LotteryCard({ lottery }) {
  const { state, dispatch } = useStore()
  const crew = crewById(state, lottery.crewId)
  const filled = lotteryFilled(lottery)
  const pct = Math.min(100, (filled / lottery.targetShares) * 100)
  const yourShares = lottery.shares.you || 0
  const yourPct = filled ? yourShares / filled : 0
  const yourMax = GAME.jackpot * yourPct
  return (
    <div className="lottery-card" onClick={() => nav(dispatch, { name: 'lottery', lotteryId: lottery.id })}>
      <div className="lottery-main">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="crew-title">Draw #{lottery.drawNo} · Star 5</div>
          <StatusChip status={lottery.status} />
        </div>
        <div className="crew-meta" style={{ marginTop: 2 }}>paid by <b style={{ color: 'var(--text)' }}>{crew.emoji} {crew.name}</b> · €{lottery.sharePrice.toFixed(2)}/share</div>
        <div className="max-win-line">
          <div className="mw">
            <div className="k">Max win · total</div>
            <div className="v">{fmtEUR(GAME.jackpot)}</div>
          </div>
          <div className="mw">
            <div className="k">Max win · your share</div>
            <div className="v you">{yourPct > 0 ? fmtEUR(Math.floor(yourMax)) : 'buy shares'}</div>
          </div>
        </div>
        <div className="progress" style={{ marginBottom: 8, height: 10 }}><i style={{ width: `${pct}%` }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span className="crew-meta"><b style={{ color: 'var(--text)' }}>{filled}</b>/{lottery.targetShares} shares · {lottery.tickets.length} tickets</span>
          <div className="spacer" />
          <span className="crew-meta">your slice: <b className="pct-badge">{fmtPct(yourPct)}</b> ({yourShares} share{yourShares !== 1 ? 's' : ''})</span>
        </div>
      </div>
      <div className="lottery-stub">
        <span className="closes">Closes in</span>
        <span className="time"><Countdown target={state.drawCloses} small /></span>
        <span className="closes" style={{ marginTop: 6 }}>Draw #{lottery.drawNo}</span>
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
  return (
    <div className="card completed-card" onClick={() => nav(dispatch, { name: 'results', lotteryId: lottery.id })}>
      <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }}>{crew.emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row-title">Draw #{lottery.drawNo} · {crew.name}</div>
        <div className="row-sub">{lottery.tickets.length} tickets · {Object.keys(lottery.shares).length} contributors</div>
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

export function Modal({ children, onClose, width }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={width ? { maxWidth: width } : undefined} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export function Toast() {
  const { state } = useStore()
  if (!state.toast) return null
  return (
    <div className="toast">
      <span>{state.toast.icon}</span> {state.toast.text}
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
    <div className="confetti">
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
  return <div className="qr">{cells.map((on, i) => <i key={i} className={on ? '' : 'off'} />)}</div>
}

export function Footer() {
  return (
    <div className="footer container">
      <div><b>LuckyCrew</b> · Group Play design prototype · dummy data, no real money, no real draws</div>
      <div>Play responsibly · 18+ · Design exercise by Jim (Dimitris Zoitas) · July 2026</div>
    </div>
  )
}

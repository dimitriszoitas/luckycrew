import React, { useEffect, useRef, useState } from 'react'
import { useStore, isMemberOf, nav } from '../store.jsx'
import { GAME, fmtEUR, fmtEUR2 } from '../game.js'
import { AnimatedNumber, Countdown, CrewCard, CrewTableRow, LotteryCard, CompletedLotteryCard, Sparkles } from '../ui.jsx'

// Live activity ticker: recent wins, entries and platform stats on a loop.
// Two identical sequences make the marquee seamless; the copy is aria-hidden.
function Ticker() {
  const items = [
    ['🏆', <>Golden Tickets won <b>€2,500</b> · 4&thinsp;+&thinsp;★ · draw #212</>],
    ['🎉', <>Office Legends won <b>€150.00</b> · draw #213</>],
    ['🎟️', <>Night Owls just entered draw #214</>],
    ['💶', <><b>€48,210</b> shared across crews last week</>],
    ['⚡', <><b>1,872</b> crews · <b>12,438</b> players in tonight</>],
    ['🍀', <>Jackpot Chasers on a 3-draw winning streak</>],
    ['🌀', <>Rollover Club at <b>€1,495</b> all-time winnings</>],
    ['🚀', <>Tonight's jackpot · <b>€1,250,000</b> · Star 5 draw #214</>],
  ]
  const seq = hidden => (
    <div className="ticker-seq" aria-hidden={hidden || undefined}>
      {items.map(([icon, node], i) => (
        <span className="ticker-item" key={i}>
          <span aria-hidden="true">{icon}</span> <span>{node}</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className="ticker" aria-label="Recent crew activity">
      <div className="ticker-track">
        {seq(false)}
        {seq(true)}
      </div>
    </div>
  )
}

// Corporate-theme ambience: deep-blue confetti drifting down the band
function AmbientConfetti({ count = 16 }) {
  const colors = ['#0e5673', '#0a4456', '#1284ad', '#ffffff']
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: (i * 53 + 17) % 100,
    delay: (i * 0.9) % 12,
    dur: 9 + ((i * 37) % 70) / 10,
    color: colors[i % colors.length],
    rot: (i * 47) % 360,
  }))
  return (
    <div className="ambient-confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ left: `${p.left}%`, background: p.color, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, transform: `rotate(${p.rot}deg)` }} />
      ))}
    </div>
  )
}

// One 30-minute Quick Draw: live pot that grows as crews join
function QuickDrawCard({ q, onJoin }) {
  const time = new Date(q.closesAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="quick-card">
      <div className="quick-head">
        <span className="quick-name"><span aria-hidden="true">⚡</span> Quick Draw</span>
        {q.joined > 0 && <span className="you-in-chip">✓ You're in{q.joined > 1 ? ` ×${q.joined}` : ''}</span>}
        <span className="quick-time">{time}</span>
      </div>
      <div className="quick-pot"><AnimatedNumber value={q.pot} format={v => fmtEUR2(v)} /> <span className="pot-suffix">pot</span></div>
      <div className="quick-meta"><AnimatedNumber value={q.crews} format={v => Math.round(v)} /> crews in · closes in <Countdown target={q.closesAt} small /></div>
      <button className="btn btn-outline-gold btn-sm" style={{ width: '100%', marginTop: 12 }} onClick={onJoin}>
        {q.joined > 0 ? 'Join again' : 'Join'}
      </button>
    </div>
  )
}

export default function Home() {
  const { state, dispatch } = useStore()
  const [showAllCrews, setShowAllCrews] = useState(false)
  const myCrewIds = new Set(state.crews.filter(isMemberOf).map(c => c.id))
  const ongoing = state.lotteries.filter(l => myCrewIds.has(l.crewId) && l.status !== 'settled')
  const openLots = ongoing.filter(l => l.status === 'open')
  const lockedLots = ongoing.filter(l => l.status !== 'open')
  const completed = state.lotteries.filter(l => myCrewIds.has(l.crewId) && l.status === 'settled')
  // locked draws are the most urgent: land there when any exist
  const [lotTab, setLotTab] = useState(() => (lockedLots.length ? 'locked' : 'open'))
  const tabLots = lotTab === 'open' ? openLots : lockedLots
  const myCrews = state.crews.filter(isMemberOf)
  const discover = state.crews.filter(c => c.privacy === 'public' && !isMemberOf(c))

  // Open lotteries: 2×2 pages, arrow-scrollable
  const lotsRef = useRef(null)
  const [lotArrows, setLotArrows] = useState({ prev: false, next: false })
  const updateLotArrows = () => {
    const el = lotsRef.current
    if (!el) return
    setLotArrows({ prev: el.scrollLeft > 4, next: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 })
  }
  useEffect(updateLotArrows, [openLots.length, lockedLots.length, lotTab])
  const scrollLots = dir => {
    const el = lotsRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  // My Crews carousel: 2.5 cards per view, arrow-scrollable
  const crewsRef = useRef(null)
  const [arrows, setArrows] = useState({ prev: false, next: false })
  const updateArrows = () => {
    const el = crewsRef.current
    if (!el) return
    setArrows({ prev: el.scrollLeft > 4, next: el.scrollLeft < el.scrollWidth - el.clientWidth - 4 })
  }
  useEffect(updateArrows, [myCrews.length])
  const scrollCrews = dir => {
    const el = crewsRef.current
    if (!el) return
    const step = (el.firstElementChild?.getBoundingClientRect().width || el.clientWidth / 2) + 18
    el.scrollBy({ left: dir * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <>
      <Ticker />

      {/* Full-bleed golden backdrop with speckles behind the hero card */}
      <div className="hero-zone">
        <Sparkles count={34} dots={40} />
        {state.theme === 'light' && <AmbientConfetti />}
        <div className="container" style={{ position: 'relative' }}>
          <div className="hero">
            <Sparkles count={16} dots={14} />
            <div className="hero-content">
              <div className="hero-kicker" style={{ color: 'var(--money)' }}>
                <span className="dot" /> Weekly Mega · {GAME.name} · Draw #214 · Tonight 21:00
                {ongoing.length > 0 && <span className="you-in-chip">✓ You're in · {ongoing.length} crew{ongoing.length > 1 ? 's' : ''}</span>}
              </div>
              <div className="pot-label" style={{ marginTop: 10 }}>Current pot</div>
              <h1 className="jackpot"><AnimatedNumber value={Math.floor(state.mega.pot)} format={v => fmtEUR(Math.floor(v))} /></h1>
              <div className="hero-sub">
                The Mega pot <b style={{ color: 'var(--text)' }}>grows with every crew that joins.</b> Crews share tickets and split every win, automatically.
              </div>
              <div className="hero-row">
                <Countdown target={state.drawCloses} />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-gold btn-lg gold-pulse" onClick={() => dispatch({ type: 'openJoinLottery' })}>
                    {ongoing.length > 0 ? 'Join Again' : 'Join a Lottery'}
                  </button>
                  <button className="btn btn-ghost btn-lg" onClick={() => { const el = document.getElementById('discover-title'); el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); el?.focus({ preventScroll: true }) }}>Find a Crew</button>
                </div>
              </div>
            </div>
          </div>
          <div className="quick-rail">
            {state.quickDraws.map(q => (
              <QuickDrawCard key={q.id} q={q} onJoin={() => dispatch({ type: 'openJoinLottery', eventId: q.id })} />
            ))}
          </div>
          <div className="hero-proof">
            <span><b><AnimatedNumber value={state.mega.crews} format={v => Math.round(v).toLocaleString('en-IE')} /></b> crews in tonight's Mega</span> · <span><b>12,438</b> players in</span> · <span><b>€48,210</b> shared last week</span>
          </div>
        </div>
      </div>

      <div className="zone-fade" aria-hidden="true" />

      <div className="container home-main">
        <h2 className="section-title lg">My Lotteries</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <div className="tabs" role="group" aria-label="Filter lotteries">
            <button className={`tab ${lotTab === 'open' ? 'active' : ''}`} aria-pressed={lotTab === 'open'} onClick={() => setLotTab('open')}>Open ({openLots.length})</button>
            <button className={`tab ${lotTab === 'locked' ? 'active' : ''}`} aria-pressed={lotTab === 'locked'} onClick={() => setLotTab('locked')}>Locked ({lockedLots.length})</button>
            <button className={`tab ${lotTab === 'completed' ? 'active' : ''}`} aria-pressed={lotTab === 'completed'} onClick={() => setLotTab('completed')}>Completed ({completed.length})</button>
          </div>
          <div className="spacer" />
          {lotTab !== 'completed' && tabLots.length > 4 && (
            <div className="carousel-nav">
              <button className="icon-btn" aria-label="Previous lotteries" aria-disabled={!lotArrows.prev} onClick={() => lotArrows.prev && scrollLots(-1)}>←</button>
              <button className="icon-btn" aria-label="Next lotteries" aria-disabled={!lotArrows.next} onClick={() => lotArrows.next && scrollLots(1)}>→</button>
            </div>
          )}
        </div>

        {lotTab !== 'completed' && (
          tabLots.length === 0 ? (
            <div className="card card-pad empty" style={{ marginBottom: 46 }}>
              {lotTab === 'open' ? 'No open entries. Hit "Join a Lottery" above to get a crew into tonight\'s draw.' : 'Nothing locked right now. Entries lock shortly before their draw.'}
            </div>
          ) : (
            <div className="lottery-carousel" ref={lotsRef} onScroll={updateLotArrows}>
              {tabLots.map(l => <LotteryCard key={l.id} lottery={l} />)}
            </div>
          )
        )}

        {lotTab === 'completed' && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 46 }}>
            {completed.map(l => <CompletedLotteryCard key={l.id} lottery={l} />)}
            {completed.length === 0 && <div className="card card-pad empty" style={{ marginBottom: 46 }}>Nothing settled yet.</div>}
          </div>
        )}

        <hr className="section-divider" />

        <div className="section-head">
          <h2 className="section-title lg" style={{ flex: 1, marginBottom: 0 }}>My Crews</h2>
          <div className="carousel-nav">
            <button className="icon-btn" aria-label="Previous crews" aria-disabled={!arrows.prev} onClick={() => arrows.prev && scrollCrews(-1)}>←</button>
            <button className="icon-btn" aria-label="Next crews" aria-disabled={!arrows.next} onClick={() => arrows.next && scrollCrews(1)}>→</button>
          </div>
        </div>
        <div className="crew-carousel" ref={crewsRef} onScroll={updateArrows}>
          {myCrews.map(c => <CrewCard key={c.id} crew={c} joinLotteryCta />)}
          <button className="crew-create-card" onClick={() => nav(dispatch, { name: 'create' })}>
            <span aria-hidden="true" style={{ fontSize: 20 }}>＋</span> New crew
          </button>
        </div>
      </div>

      <section className="discover-zone" id="discover">
        <div className="container">
          <h2 className="section-title lg" id="discover-title" tabIndex={-1}>Discover public crews <span className="hint">open to everyone · join instantly</span></h2>
          <div className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
            {(showAllCrews ? discover : discover.slice(0, 4)).map(c => <CrewTableRow key={c.id} crew={c} />)}
            {discover.length === 0 && <div className="empty" style={{ padding: 24 }}>You've joined every public crew. Impressive.</div>}
            {discover.length > 4 && (
              <button className="show-more" onClick={() => setShowAllCrews(v => !v)}>
                {showAllCrews ? 'Show less ↑' : `Show ${discover.length - 4} more crews ↓`}
              </button>
            )}
          </div>

          <p className="how-line">
            How Group Play works: a crew fills a pot in shares → the pot buys tickets → everyone owns a slice of every ticket → winnings are split by ownership, instantly and automatically. No treasurer, full ledger.
          </p>
        </div>
      </section>
    </>
  )
}

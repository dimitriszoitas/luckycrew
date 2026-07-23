import React, { useState } from 'react'
import { useStore, isMemberOf } from '../store.jsx'
import { GAME, fmtEUR } from '../game.js'
import { Countdown, CrewCard, CrewTableRow, LotteryCard, CompletedLotteryCard, Sparkles } from '../ui.jsx'

export default function Home() {
  const { state, dispatch } = useStore()
  const [lotTab, setLotTab] = useState('ongoing')
  const [showAllCrews, setShowAllCrews] = useState(false)
  const myCrewIds = new Set(state.crews.filter(isMemberOf).map(c => c.id))
  const ongoing = state.lotteries.filter(l => myCrewIds.has(l.crewId) && l.status !== 'settled')
  const completed = state.lotteries.filter(l => myCrewIds.has(l.crewId) && l.status === 'settled')
  const myCrews = state.crews.filter(isMemberOf)
  const discover = state.crews.filter(c => c.privacy === 'public' && !isMemberOf(c))

  return (
    <>
      {/* Full-bleed golden backdrop with speckles behind the hero card */}
      <div className="hero-zone">
        <Sparkles count={34} dots={40} />
        <div className="container" style={{ position: 'relative' }}>
          <div className="hero">
            <Sparkles count={16} dots={14} />
            <div className="hero-content">
              <div className="hero-kicker" style={{ color: 'var(--gold)' }}><span className="dot" /> {GAME.name} · Draw #214 · Tonight 21:00</div>
              <div className="jackpot">{fmtEUR(GAME.jackpot)}</div>
              <div className="hero-sub">Tonight's jackpot. Why chase it alone? <b style={{ color: 'var(--text)' }}>Crews share tickets and split every win, automatically.</b></div>
              <div className="hero-row">
                <Countdown target={state.drawCloses} />
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button className="btn btn-gold btn-lg gold-pulse" onClick={() => dispatch({ type: 'openJoinLottery' })}>Join a Lottery</button>
                  <button className="btn btn-ghost btn-lg" onClick={() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })}>Find a Crew</button>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-proof">
            <span><b>1,872</b> crews playing tonight</span> · <span><b>12,438</b> players in</span> · <span><b>€48,210</b> shared last week</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="section-title" style={{ marginTop: 8 }}>🎟️ My Lotteries</div>
        <div className="tabs" style={{ marginBottom: 16 }}>
          <button className={`tab ${lotTab === 'ongoing' ? 'active' : ''}`} onClick={() => setLotTab('ongoing')}>● Ongoing / upcoming ({ongoing.length})</button>
          <button className={`tab ${lotTab === 'completed' ? 'active' : ''}`} onClick={() => setLotTab('completed')}>✓ Completed ({completed.length})</button>
        </div>

        {lotTab === 'ongoing' && (
          <div className="grid-2" style={{ marginBottom: 34 }}>
            {ongoing.map(l => <LotteryCard key={l.id} lottery={l} />)}
            {ongoing.length === 0 && <div className="card card-pad empty" style={{ gridColumn: '1 / -1' }}>No ongoing entries. Hit "Join a Lottery" above to get a crew into tonight's draw.</div>}
          </div>
        )}

        {lotTab === 'completed' && (
          <div style={{ display: 'grid', gap: 10, marginBottom: 34 }}>
            {completed.map(l => <CompletedLotteryCard key={l.id} lottery={l} />)}
            {completed.length === 0 && <div className="card card-pad empty">Nothing settled yet.</div>}
          </div>
        )}

        <div className="section-title">👥 My Crews <span className="hint">reusable teams · hover to jump into a lottery</span></div>
        <div className="grid-2" style={{ marginBottom: 34 }}>
          {myCrews.map(c => <CrewCard key={c.id} crew={c} joinLotteryCta />)}
        </div>

        <div className="section-title" id="discover">🔎 Discover public crews <span className="hint">open to everyone · join instantly</span></div>
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
    </>
  )
}

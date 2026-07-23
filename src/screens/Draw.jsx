import React, { useEffect, useRef, useState } from 'react'
import { useStore, nav, crewById } from '../store.jsx'
import { GAME, fairDraw, luckyDraw, settleDraw } from '../game.js'
import { Balls } from '../ui.jsx'

export default function Draw({ lotteryId }) {
  const { state, dispatch } = useStore()
  const lottery = state.lotteries.find(l => l.id === lotteryId)
  const crew = lottery ? crewById(state, lottery.crewId) : null
  const [phase, setPhase] = useState('ready')
  const [count, setCount] = useState(3)
  const [revealed, setRevealed] = useState(0)
  const resultRef = useRef(null)

  const start = lucky => {
    resultRef.current = lucky ? luckyDraw(lottery.tickets) : fairDraw()
    setPhase('count')
    setCount(3)
  }

  useEffect(() => {
    if (phase !== 'count') return
    if (count === 0) { setPhase('reveal'); setRevealed(0); return }
    const t = setTimeout(() => setCount(c => c - 1), 800)
    return () => clearTimeout(t)
  }, [phase, count])

  useEffect(() => {
    if (phase !== 'reveal') return
    if (revealed >= GAME.pickCount + 1) {
      const result = resultRef.current
      dispatch({ type: 'setResult', lotteryId, result })
      const t = setTimeout(() => {
        const settlement = settleDraw(lottery, crew, result)
        dispatch({ type: 'settle', lotteryId, settlement })
        nav(dispatch, { name: 'results', lotteryId })
      }, 1600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setRevealed(r => r + 1), 900)
    return () => clearTimeout(t)
  }, [phase, revealed]) // eslint-disable-line

  if (!lottery || !crew) return null
  const result = resultRef.current

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'lottery', lotteryId })}>← Draw #{lottery.drawNo} entry</button>

      <div className="draw-stage">
        <div className="hero-kicker" style={{ justifyContent: 'center' }}><span className="dot" /> {GAME.name} · Draw #{lottery.drawNo} · Live</div>
        <h1 className="draw-title">{crew.emoji} {crew.name} is watching</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>{lottery.tickets.length} crew tickets in play · every contributor shares every one</p>

        {phase === 'ready' && (
          <div style={{ margin: '38px 0 10px' }}>
            <div className="machine-row">
              {Array.from({ length: GAME.pickCount }, (_, i) => <div key={i} className="ball lg ghost">?</div>)}
              <span className="plus-sep" style={{ fontSize: 26 }}>+</span>
              <div className="ball lg ghost">★</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 30, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg pulse-glow" onClick={() => start(true)}>▶ Start the draw</button>
              <button className="btn btn-ghost" onClick={() => start(false)} title="True random, most draws win nothing">🎲 Fair random draw</button>
            </div>
            <div className="row-sub" style={{ marginTop: 14 }}>Demo: "Start" guarantees a decent hit so you can see the split · "Fair" is honest randomness</div>
          </div>
        )}

        {phase === 'count' && <div className="big-count" key={count}>{count === 0 ? 'GO' : count}</div>}

        {(phase === 'reveal') && result && (
          <div className="machine-row">
            {result.nums.map((n, i) => (
              i < revealed
                ? <div key={i} className="ball lg drop">{n}</div>
                : <div key={i} className="ball lg ghost">?</div>
            ))}
            <span className="plus-sep" style={{ fontSize: 26 }}>+</span>
            {revealed >= GAME.pickCount + 1
              ? <div className="ball lg star drop">{result.star}</div>
              : <div className="ball lg ghost">★</div>}
          </div>
        )}

        {phase === 'reveal' && revealed >= GAME.pickCount + 1 && (
          <div style={{ marginTop: 20, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 19, color: 'var(--cyan)' }}>
            Checking crew tickets… ✨
          </div>
        )}
      </div>

      {lottery.tickets.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 18 }}>
          <div className="section-title" style={{ fontSize: 17 }}>Crew tickets {phase === 'reveal' && revealed >= GAME.pickCount + 1 ? '· matches light up' : ''}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {lottery.tickets.map((t, i) => (
              <div className="ticket-card" key={t.id}>
                <span className="ticket-id">#{String(i + 1).padStart(2, '0')}</span>
                <Balls nums={t.nums} star={t.star} size="sm" result={phase === 'reveal' && revealed >= GAME.pickCount + 1 ? result : null} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

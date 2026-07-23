import React from 'react'
import { useStore, nav, toast, crewById, ongoingForCrew, nextDrawFor } from '../store.jsx'
import { fmtEUR2, fmtPct } from '../game.js'
import { Balls, Confetti } from '../ui.jsx'

const SLICE_COLORS = ['#fbbf24', '#4f5fe8', '#93c5fd', '#f59e0b', '#fde047', '#8fa3ff', '#d97706', '#60a5fa', '#fcd34d']

export default function Results({ lotteryId }) {
  const { state, dispatch } = useStore()
  const lottery = state.lotteries.find(l => l.id === lotteryId)
  if (!lottery || !lottery.settlement) return null
  const crew = crewById(state, lottery.crewId)
  const { scored, totalWon, splits, remainder } = lottery.settlement
  const won = totalWon > 0
  const yourCut = splits.find(s => s.memberId === 'you')?.amount || 0
  const winningTickets = scored.filter(s => s.prize > 0)
  const isCaptain = crew.captainId === 'you'
  const hasOngoing = !!ongoingForCrew(state, crew.id)
  const nextDraw = nextDrawFor(state, crew.id)

  const playAgain = () => {
    dispatch({ type: 'enterLottery', crewId: crew.id, drawNo: nextDraw })
    toast(dispatch, `${crew.name} entered draw #${nextDraw}. Fill the pot!`, '🎟️')
  }

  return (
    <div className="container" style={{ maxWidth: 820 }}>
      {won && <Confetti />}
      <button className="back-link" onClick={() => nav(dispatch, { name: 'crew', crewId: crew.id })}>← {crew.emoji} {crew.name}</button>

      <div className="win-banner" style={!won ? { borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' } : undefined}>
        <div className="hero-kicker" style={{ justifyContent: 'center' }}><span className="dot" /> Draw #{lottery.drawNo} · settled</div>
        {won ? (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>{crew.emoji} {crew.name} WON!</h1>
            <div className="win-amount">{fmtEUR2(totalWon)}</div>
            <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>
              Split automatically across {splits.length} contributors. Your cut <b style={{ color: 'var(--money)' }}>{fmtEUR2(yourCut)}</b> is already in your wallet. ⚡
            </p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>Not this time 💜</h1>
            <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>No winning tickets in draw #{lottery.drawNo}. The crew rides again next draw.</p>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
          <div className="card card-pad" style={{ display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 20px' }}>
            <span className="crew-meta">Winning numbers</span>
            <Balls nums={lottery.result.nums} star={lottery.result.star} />
          </div>
        </div>
      </div>

      {won && (
        <div className="card card-pad" style={{ marginBottom: 18 }}>
          <h2 className="section-title"><span aria-hidden="true">⚡</span> The split: automatic, proportional, on-ledger</h2>
          <div className="split-bar" aria-hidden="true" style={{ marginBottom: 14 }}>
            {splits.map((s, i) => (
              <i key={s.memberId} title={`${s.name} ${fmtPct(s.pct)}`} style={{ width: `${s.pct * 100}%`, background: SLICE_COLORS[i % SLICE_COLORS.length] }} />
            ))}
          </div>
          <table className="split">
            <thead>
              <tr><th scope="col">Member</th><th scope="col">Stake</th><th scope="col">Ownership</th><th scope="col" style={{ textAlign: 'right' }}>Credited</th></tr>
            </thead>
            <tbody>
              {splits.map((s, i) => (
                <tr key={s.memberId} className={s.memberId === 'you' ? 'you' : ''}>
                  <td><span style={{ marginRight: 8 }}>{s.avatar}</span>{s.name}{s.memberId === 'you' && ' (you)'}</td>
                  <td>{fmtEUR2(s.stake)}</td>
                  <td><b style={{ color: 'var(--text)' }}><i style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, marginRight: 6, background: SLICE_COLORS[i % SLICE_COLORS.length], border: '1px solid var(--text-dim)' }} /> {fmtPct(s.pct)}</b></td>
                  <td className="amt">+{fmtEUR2(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {remainder > 0 && (
            <div className="row-sub" style={{ marginTop: 10 }}>Rounding remainder of {fmtEUR2(remainder)} carried to the crew's next pot, on the ledger like everything else.</div>
          )}
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <h2 className="section-title"><span aria-hidden="true">🎫</span> Ticket results</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {scored.map((s, i) => (
            <div className="ticket-card" key={s.ticket.id} style={s.prize > 0 ? { borderColor: 'color-mix(in srgb, var(--gold) 45%, transparent)', boxShadow: 'var(--glow-lime)' } : undefined}>
              <span className="ticket-id">#{String(i + 1).padStart(2, '0')}</span>
              <Balls nums={s.ticket.nums} star={s.ticket.star} size="sm" result={lottery.result} />
              <span className="ticket-prize" style={{ color: s.prize > 0 ? 'var(--money)' : 'var(--text-faint)' }}>
                {s.prize > 0 ? `${s.tier.label} · +${fmtEUR2(s.prize)}` : `${s.matched.length} match${s.matched.length !== 1 ? 'es' : ''}`}
              </span>
            </div>
          ))}
        </div>
        {winningTickets.length === 0 && <div className="row-sub" style={{ marginTop: 10, textAlign: 'center' }}>Closest call: {Math.max(...scored.map(s => s.matched.length))} matched numbers.</div>}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 30, flexWrap: 'wrap' }}>
        {isCaptain && !hasOngoing && (
          <button className="btn btn-gold btn-lg gold-pulse" onClick={playAgain}>
            🎟️ Enter draw #{nextDraw} with {crew.name}
          </button>
        )}
        <button className="btn btn-ghost btn-lg" onClick={() => nav(dispatch, { name: 'wallet' })}>See wallet</button>
      </div>
    </div>
  )
}

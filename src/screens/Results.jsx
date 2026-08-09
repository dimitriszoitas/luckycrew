import React from 'react'
import { useStore, nav, toast, crewById, ongoingForCrew, nextDrawFor } from '../store.jsx'
import { fmtEUR2 } from '../game.js'
import { Balls, Confetti } from '../ui.jsx'

export default function Results({ lotteryId }) {
  const { state, dispatch } = useStore()
  const lottery = state.lotteries.find(l => l.id === lotteryId)
  if (!lottery || !lottery.settlement) return null
  const crew = crewById(state, lottery.crewId)
  const { scored, totalWon, splits, remainder, boostsPay, boostTotal, multiplier } = lottery.settlement
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
      <button className="back-link" onClick={() => nav(dispatch, { name: 'crew', crewId: crew.id })}>← {crew.name}</button>

      <div className="win-banner" style={!won ? { borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' } : undefined}>
        <div className="hero-kicker" style={{ justifyContent: 'center' }}><span className="dot" /> Draw #{lottery.drawNo} · settled</div>
        {won ? (
          <>
            <h1 style={{ fontSize: 26, marginBottom: 4 }}>{crew.emoji} {crew.name} WON!</h1>
            <div className="win-amount">{fmtEUR2(totalWon)}</div>
            <p style={{ color: 'var(--text-dim)', marginTop: 8 }}>
              Split equally across {splits.length} member{splits.length > 1 ? 's' : ''}. Your cut <b style={{ color: 'var(--money)' }}>{fmtEUR2(yourCut)}</b> is already in your wallet. ⚡
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
          <h2 className="section-title"><span aria-hidden="true">⚡</span> The split: equal shares, boosts on top</h2>
          <table className="split">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Share paid</th>
                <th scope="col">Equal cut</th>
                <th scope="col">Boost {multiplier}x</th>
                <th scope="col" style={{ textAlign: 'right' }}>Credited</th>
              </tr>
            </thead>
            <tbody>
              {splits.map(s => (
                <tr key={s.memberId} className={s.memberId === 'you' ? 'you' : ''}>
                  <td><span style={{ marginRight: 8 }}>{s.avatar}</span>{s.name}{s.memberId === 'you' && ' (you)'}</td>
                  <td>{fmtEUR2(s.share)}</td>
                  <td><b style={{ color: 'var(--text)' }}>{fmtEUR2(s.base)}</b></td>
                  <td>{s.boost > 0 ? (s.boostAmount > 0 ? <b style={{ color: 'var(--money)' }}>+{fmtEUR2(s.boostAmount)}</b> : <span className="row-sub">{fmtEUR2(s.boost)} · no top tier</span>) : <span className="row-sub">none</span>}</td>
                  <td className="amt">+{fmtEUR2(s.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="row-sub" style={{ marginTop: 10, lineHeight: 1.7 }}>
            Everyone paid the same share, so everyone takes the same cut: {fmtEUR2(splits[0]?.base || 0)} each.
            {boostsPay
              ? ` Top tier hit, so boosts paid out at ${multiplier}x: ${fmtEUR2(boostTotal)} on top.`
              : ' Boosts pay out only on 5 numbers or the jackpot, so they sit this one out.'}
            {remainder > 0 && ` Rounding remainder of ${fmtEUR2(remainder)} carried to the crew's next pot.`}
          </div>
        </div>
      )}

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <h2 className="section-title"><span aria-hidden="true">🎫</span> Ticket results</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {scored.map((s, i) => (
            <div className="ticket-card" key={s.ticket.id} style={s.prize > 0 ? { borderColor: 'color-mix(in srgb, var(--gold) 45%, transparent)', boxShadow: 'var(--glow-lime)' } : undefined}>
              <span className="ticket-id">#{String(i + 1).padStart(2, '0')}</span>
              <Balls nums={s.ticket.nums} stars={s.ticket.stars} size="sm" result={lottery.result} />
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
            Enter draw #{nextDraw} with {crew.name}
          </button>
        )}
        <button className="btn btn-ghost btn-lg" onClick={() => nav(dispatch, { name: 'wallet' })}>See wallet</button>
      </div>
    </div>
  )
}

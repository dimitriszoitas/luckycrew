import React from 'react'
import { useStore, nav, toast, isMemberOf, ongoingForCrew, potTotal } from '../store.jsx'
import { GAME, fmtEUR, fmtEUR2 } from '../game.js'
import { FacePile, Countdown } from '../ui.jsx'

// Invite landing: what a friend sees before joining a crew
export default function Join({ crewId, preview }) {
  const { state, dispatch } = useStore()
  const crew = state.crews.find(c => c.id === crewId)
  if (!crew) return null
  const member = isMemberOf(crew)
  const captain = crew.members.find(m => m.id === crew.captainId)
  const ongoing = ongoingForCrew(state, crew.id)

  const join = () => {
    dispatch({ type: 'joinCrew', crewId: crew.id })
    toast(dispatch, `Welcome to ${crew.name}!`, '🎉')
  }

  return (
    <div className="container" style={{ maxWidth: 560 }}>
      <button className="back-link" onClick={() => nav(dispatch, preview ? { name: 'crew', crewId: crew.id } : { name: 'home' })}>
        ← {preview ? 'Back to crew' : 'Back'}
      </button>

      {preview && (
        <div className="chip" style={{ marginBottom: 14 }}>👀 Preview: this is what your invitees see</div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '34px 26px 26px', textAlign: 'center', background: 'radial-gradient(420px 220px at 50% -30%, var(--bg-glow-1), transparent 70%)' }}>
          <div className="crew-emoji" style={{ width: 84, height: 84, fontSize: 44, margin: '0 auto 14px', borderRadius: 24 }}>{crew.emoji}</div>
          <div className="hero-kicker" style={{ justifyContent: 'center' }}><span className="dot" /> You're invited</div>
          <h1 style={{ fontSize: 30 }}>{crew.name}</h1>
          <p style={{ color: 'var(--text-dim)', marginTop: 6 }}>
            {captain?.name || 'The captain'} invited you to join the crew and chase tonight's <b style={{ color: 'var(--money)' }}>{fmtEUR(GAME.jackpot)}</b> {GAME.name} jackpot together.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '18px 0 6px' }}>
            <FacePile members={crew.members} max={7} />
          </div>
          <div className="crew-meta">{crew.members.length} member{crew.members.length !== 1 ? 's' : ''} already in</div>
        </div>

        <div style={{ padding: '0 26px 26px' }}>
          {ongoing ? (
            <div className="stat-tiles" style={{ marginBottom: 16 }}>
              <div className="stat-tile"><div className="k">Ongoing entry</div><div className="v">Draw #{ongoing.drawNo}</div></div>
              <div className="stat-tile"><div className="k">Pot so far</div><div className="v">{fmtEUR2(potTotal(ongoing))}</div></div>
              <div className="stat-tile"><div className="k">Tickets</div><div className="v">{ongoing.tickets.length} 🎫</div></div>
            </div>
          ) : (
            <p className="crew-meta" style={{ textAlign: 'center', marginBottom: 16 }}>
              The crew isn't in a draw right now. Join and be ready when the captain opens the next entry.
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <Countdown target={state.drawCloses} />
          </div>
          {member ? (
            <button className="btn btn-ghost btn-lg" style={{ width: '100%' }} onClick={() => nav(dispatch, { name: 'crew', crewId: crew.id })}>You're in. Open the crew →</button>
          ) : (
            <button className="btn btn-gold btn-lg gold-pulse" style={{ width: '100%' }} onClick={join}>🍀 Join {crew.name}</button>
          )}
          <div className="row-sub" style={{ textAlign: 'center', marginTop: 12 }}>
            Joining is free. You choose how much to chip in per draw · winnings split automatically · 18+ play responsibly
          </div>
        </div>
      </div>
    </div>
  )
}

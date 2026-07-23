import React, { useState } from 'react'
import { useStore, nav, toast, ongoingForCrew, nextDrawFor, crewLuck } from '../store.jsx'
import { GAME, fmtEUR2 } from '../game.js'
import { Modal, FakeQR, FacePile, CompletedLotteryCard, LotteryCard, LuckBadge } from '../ui.jsx'

const timeAgo = t => {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// The crew is a reusable team. It enters lotteries; history lives here.
export default function CrewPage({ crewId, justCreated }) {
  const { state, dispatch } = useStore()
  const crew = state.crews.find(c => c.id === crewId)
  const [showEnter, setShowEnter] = useState(false)
  if (!crew) return null

  const isCaptain = crew.captainId === 'you'
  const ongoing = ongoingForCrew(state, crew.id)
  const nextDraw = nextDrawFor(state, crew.id)
  const luck = crewLuck(state, crew.id)
  const history = state.lotteries.filter(l => l.crewId === crew.id && l.status === 'settled')

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'home' })}>← Home</button>

      {/* Crew header */}
      <div className="card card-pad" style={{ marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div className={`stripe ${crew.color}`} style={{ position: 'absolute', inset: '0 0 auto 0', height: 4 }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="crew-emoji" style={{ width: 64, height: 64, fontSize: 33 }}>{crew.emoji}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26 }}>{crew.name}</h1>
              {isCaptain && <span className="chip captain">⭐ You're captain</span>}
              <span className="chip">{crew.privacy === 'public' ? '🌍 Public' : '🔗 Invite only'}</span>
            </div>
            <div className="crew-meta" style={{ marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              Reusable team · {crew.members.length} member{crew.members.length !== 1 ? 's' : ''} · <LuckBadge luck={luck} /> · won {luck.won} of {luck.played} draws
            </div>
          </div>
          <FacePile members={crew.members} max={6} />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          {!ongoing && isCaptain && (
            <button className="btn btn-gold gold-pulse" onClick={() => setShowEnter(true)}>🎟️ Enter draw #{nextDraw}</button>
          )}
          {!ongoing && !isCaptain && (
            <span className="crew-meta" style={{ alignSelf: 'center' }}>The captain opens draw entries. You'll see them here.</span>
          )}
          {ongoing && (
            <button className="btn btn-primary" onClick={() => nav(dispatch, { name: 'lottery', lotteryId: ongoing.id })}>🎟️ Open ongoing entry · draw #{ongoing.drawNo}</button>
          )}
        </div>
      </div>

      {justCreated && (
        <div className="card card-pad" style={{ marginBottom: 18, borderColor: 'color-mix(in srgb, var(--gold) 40%, transparent)' }}>
          <div className="row-title" style={{ marginBottom: 4 }}>🎉 Crew created. Two things to do next:</div>
          <div className="row-sub" style={{ lineHeight: 1.7 }}>1. Invite your people below. 2. Enter tonight's draw and set the pot rules. The crew sticks around after the draw, ready for the next one.</div>
        </div>
      )}

      {ongoing && (
        <>
          <div className="sub-heading">● Ongoing entry</div>
          <div style={{ marginBottom: 22 }}><LotteryCard lottery={ongoing} /></div>
        </>
      )}

      <div className="grid-2" style={{ marginBottom: 18 }}>
        {/* Members */}
        <div className="card card-pad">
          <div className="section-title" style={{ fontSize: 18 }}>👥 Members</div>
          {crew.members.map(m => (
            <div className="row" key={m.id}>
              <div className="member-avatar">{m.avatar}</div>
              <div className="grow">
                <div className="row-title">{m.name}{m.id === 'you' && ' (you)'} {crew.captainId === m.id && <span className="chip captain" style={{ marginLeft: 6 }}>⭐ Captain</span>}</div>
                <div className="row-sub">joined {timeAgo(m.joinedAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Invite */}
        <InviteBlock crew={crew} />
      </div>

      {history.length > 0 && (
        <>
          <div className="sub-heading">✓ Past draws together</div>
          <div style={{ display: 'grid', gap: 10, marginBottom: 26 }}>
            {history.map(l => <CompletedLotteryCard key={l.id} lottery={l} />)}
          </div>
        </>
      )}

      {showEnter && <EnterLotteryModal crew={crew} drawNo={nextDraw} onClose={() => setShowEnter(false)} />}
    </div>
  )
}

function InviteBlock({ crew }) {
  const { dispatch } = useStore()
  const code = crew.id.replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase().padEnd(6, 'X')
  const link = `luckycrew.app/join/${code}`
  const copy = () => { try { navigator.clipboard?.writeText(`https://${link}`) } catch {} ; toast(dispatch, 'Invite link copied', '🔗') }
  return (
    <div className="card card-pad">
      <div className="section-title" style={{ fontSize: 18 }}>📨 Invite to the crew</div>
      <div className="input" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 14 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link}</span>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-sm" onClick={copy}>Copy link</button>
        <button className="btn btn-ghost btn-sm" onClick={() => nav(dispatch, { name: 'join', crewId: crew.id, preview: true })}>👀 Preview landing</button>
      </div>
      <div className="code-box" style={{ fontSize: 26, padding: 13, marginBottom: 16 }}>{code}</div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><FakeQR /></div>
      <button className="btn btn-money btn-sm" style={{ width: '100%' }} onClick={() => { dispatch({ type: 'friendJoins', crewId: crew.id }); toast(dispatch, 'A friend joined through your link!', '🎉') }}>
        ✨ Simulate a friend joining
      </button>
    </div>
  )
}

// Captain sets the pot rules per draw entry. The crew itself stays rule-free.
function EnterLotteryModal({ crew, drawNo, onClose }) {
  const { dispatch } = useStore()
  const [rules, setRules] = useState({ sharePrice: 2.5, targetShares: 20, maxPerMember: 4 })
  const set = patch => setRules(r => ({ ...r, ...patch }))
  const potMax = rules.sharePrice * rules.targetShares
  const enter = () => {
    dispatch({ type: 'enterLottery', crewId: crew.id, drawNo, rules })
    toast(dispatch, `${crew.name} entered draw #${drawNo}. Fill the pot!`, '🎟️')
  }
  return (
    <Modal onClose={onClose} width={520}>
      <h3 className="display">Enter draw #{drawNo} with {crew.emoji} {crew.name}</h3>
      <p className="sub">Set the pot rules for this draw. Members then buy shares and the pot buys tickets.</p>
      <div className="field">
        <label>Share price</label>
        <div className="seg">
          {[1, 2, 2.5, 5].map(p => <button key={p} className={rules.sharePrice === p ? 'on' : ''} onClick={() => set({ sharePrice: p })}>€{p.toFixed(2)}</button>)}
        </div>
      </div>
      <div className="field">
        <label>Target shares (pot size)</label>
        <div className="seg">
          {[10, 20, 40, 50].map(p => <button key={p} className={rules.targetShares === p ? 'on' : ''} onClick={() => set({ targetShares: p })}>{p}</button>)}
        </div>
      </div>
      <div className="field">
        <label>Max shares per member, keeps it fair</label>
        <div className="seg">
          {[1, 2, 4, 10].map(p => <button key={p} className={rules.maxPerMember === p ? 'on' : ''} onClick={() => set({ maxPerMember: p })}>{p === 1 ? '1 · equal split' : p}</button>)}
        </div>
      </div>
      <div className="stat-tiles" style={{ margin: '18px 0' }}>
        <div className="stat-tile"><div className="k">Pot at full</div><div className="v">{fmtEUR2(potMax)}</div></div>
        <div className="stat-tile"><div className="k">Tickets at full</div><div className="v">{Math.floor(potMax / GAME.ticketPrice)} 🎫</div></div>
        <div className="stat-tile"><div className="k">Game</div><div className="v">{GAME.name}</div></div>
      </div>
      <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={enter}>🎟️ Open entry for draw #{drawNo}</button>
    </Modal>
  )
}

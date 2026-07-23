import React, { useState } from 'react'
import { useStore, nav, toast, isMemberOf, ongoingForCrew, nextDrawFor, crewLuck } from '../store.jsx'
import { GAME, fmtEUR2 } from '../game.js'
import { Modal, LuckBadge, FacePile } from '../ui.jsx'

// The hero flow: 1) pick a crew (or create a new one), 2) define the entry options.
// Crews are just people; all the options live on the lottery entry.
export default function JoinLotteryModal() {
  const { state, dispatch } = useStore()
  const jl = state.joinLottery
  const myCrews = state.crews.filter(isMemberOf)
  const [selected, setSelected] = useState(jl?.crewId || myCrews[0]?.id || null)
  const [step, setStep] = useState(1)
  const [rules, setRules] = useState({ sharePrice: 2.5, targetShares: 20, maxPerMember: 4 })
  const set = patch => setRules(r => ({ ...r, ...patch }))
  if (!jl) return null

  const close = () => dispatch({ type: 'closeJoinLottery' })
  const crew = state.crews.find(c => c.id === selected)
  const ongoing = crew ? ongoingForCrew(state, crew.id) : null
  const isCaptain = crew?.captainId === 'you'
  const drawNo = crew ? nextDrawFor(state, crew.id) : null
  const potMax = rules.sharePrice * rules.targetShares

  const proceed = () => {
    if (!crew) return
    if (ongoing) {
      toast(dispatch, `Joining ${crew.name}'s entry for draw #${ongoing.drawNo}`, '🎟️')
      nav(dispatch, { name: 'lottery', lotteryId: ongoing.id })
      return
    }
    setStep(2)
  }

  const openEntry = () => {
    dispatch({ type: 'enterLottery', crewId: crew.id, drawNo, rules })
    toast(dispatch, `${crew.name} entered draw #${drawNo}. Fill the pot!`, '🎟️')
  }

  const continueLabel = !crew
    ? 'Pick a crew'
    : ongoing
      ? `Join ongoing entry · draw #${ongoing.drawNo} →`
      : isCaptain
        ? 'Set entry options →'
        : 'Waiting for the captain'

  return (
    <Modal onClose={close} width={540}>
      {step === 1 && (
        <>
          <h3 className="display">Join a Lottery</h3>
          <p className="sub">Step 1 of 2 · Pick the crew you're playing with. A crew is just people; the money options come next, per entry.</p>

          <div className="crew-pick">
            {myCrews.map(c => {
              const luck = crewLuck(state, c.id)
              const og = ongoingForCrew(state, c.id)
              const captain = c.captainId === 'you'
              return (
                <button key={c.id} className={`crew-pick-row ${selected === c.id ? 'on' : ''}`} onClick={() => setSelected(c.id)}>
                  <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div className="row-title">{c.name} {captain && '⭐'}</div>
                    <div className="row-sub">
                      {c.members.length} members · <LuckBadge luck={luck} dim />
                      {og ? ` · entry open for draw #${og.drawNo}` : captain ? ' · ready for a new entry' : ' · captain opens entries'}
                    </div>
                  </div>
                  <FacePile members={c.members} max={3} />
                </button>
              )
            })}
            <button className="crew-pick-row create" onClick={() => nav(dispatch, { name: 'create' })}>
              <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }}>➕</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="row-title">Create a new crew</div>
                <div className="row-sub">Name it, invite your people, come back here</div>
              </div>
            </button>
          </div>

          <button
            className="btn btn-gold btn-lg"
            style={{ width: '100%', marginTop: 18 }}
            disabled={!crew || (!ongoing && !isCaptain)}
            onClick={proceed}
          >
            {continueLabel}
          </button>
          {crew && !ongoing && !isCaptain && (
            <div className="row-sub" style={{ textAlign: 'center', marginTop: 10 }}>
              Only {crew.name}'s captain can open a new entry. You'll see it here the moment it opens.
            </div>
          )}
        </>
      )}

      {step === 2 && crew && (
        <>
          <h3 className="display">Entry options · {crew.emoji} {crew.name}</h3>
          <p className="sub">Step 2 of 2 · Draw #{drawNo}. These options belong to this entry only; your crew stays just people.</p>
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
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
            <button className="btn btn-gold btn-lg" style={{ flex: 2 }} onClick={openEntry}>🎟️ Open entry for draw #{drawNo}</button>
          </div>
        </>
      )}
    </Modal>
  )
}

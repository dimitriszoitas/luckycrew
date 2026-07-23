import React, { useState } from 'react'
import { useStore, nav, toast, isMemberOf, crewLuck, potTotal, NEXT_DRAW } from '../store.jsx'
import { GAME, fmtEUR, fmtEUR2, fmtPct } from '../game.js'
import { Modal, LuckBadge, FacePile, StakeInput } from '../ui.jsx'

// The join flow: 1) tickets · 2) crew · 3) money.
// No shares: whatever you put in defines your cut of every win.
export default function JoinLotteryModal() {
  const { state, dispatch } = useStore()
  const jl = state.joinLottery
  const myCrews = state.crews.filter(isMemberOf)
  const [step, setStep] = useState(1)
  const [tickets, setTickets] = useState(2)
  const [selected, setSelected] = useState(jl?.crewId || myCrews[0]?.id || null)
  const [extra, setExtra] = useState(0) // stake on top of the minimum
  if (!jl) return null

  const close = () => dispatch({ type: 'closeJoinLottery' })
  const crew = state.crews.find(c => c.id === selected)
  const minStake = Math.round(tickets * GAME.ticketPrice * 100) / 100
  const stake = Math.round((minStake + extra) * 100) / 100
  const entry = crew ? state.lotteries.find(l => l.crewId === crew.id && l.status !== 'settled') : null
  const potNow = entry ? potTotal(entry) : 0
  const yourExisting = entry?.contributions?.you || 0
  const newPct = (yourExisting + stake) / (potNow + stake)
  const megaPot = Math.floor(state.mega.pot)
  const canAfford = stake <= state.wallet.balance

  const confirm = () => {
    dispatch({ type: 'joinDraw', crewId: crew.id, drawNo: entry?.drawNo || NEXT_DRAW, tickets, amount: stake })
    if (jl.eventId) dispatch({ type: 'eventJoined', eventId: jl.eventId })
    toast(dispatch, `You're in with ${crew.name}: ${tickets} ticket${tickets > 1 ? 's' : ''}, ${fmtEUR2(stake)} staked`, '🎟️')
  }

  return (
    <Modal onClose={close} width={620} label="Join a lottery">
      {step === 1 && (
        <>
          <div className="wizard-step">Step 1 of 3</div>
          <h2 className="display">How many tickets should this pot have?</h2>
          <p className="sub">These are shared among all crew members, in proportion to how much each one puts in.</p>
          <div className="stepper" style={{ margin: '20px 0' }}>
            <button aria-disabled={tickets <= 1} aria-label="One fewer ticket" onClick={() => tickets > 1 && setTickets(tickets - 1)}>−</button>
            <div className="val" aria-live="polite" aria-label={`${tickets} tickets`}>{tickets}</div>
            <button aria-disabled={tickets >= 20} aria-label="One more ticket" onClick={() => tickets < 20 && setTickets(tickets + 1)}>+</button>
          </div>
          <div className="stat-tiles" style={{ marginBottom: 18 }}>
            <div className="stat-tile"><div className="k">Ticket price</div><div className="v">{fmtEUR2(GAME.ticketPrice)}</div></div>
            <div className="stat-tile"><div className="k">Minimum stake</div><div className="v">{fmtEUR2(minStake)}</div></div>
            <div className="stat-tile"><div className="k">Draw</div><div className="v">#{NEXT_DRAW}</div></div>
          </div>
          <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={() => setStep(2)}>Continue →</button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="wizard-step">Step 2 of 3</div>
          <h2 className="display">Who are you playing with?</h2>
          <p className="sub">Pick a crew, or start a new one and invite your people.</p>
          <div className="crew-pick" role="group" aria-label="Pick a crew">
            {myCrews.map(c => {
              const luck = crewLuck(state, c.id)
              const og = state.lotteries.find(l => l.crewId === c.id && l.status !== 'settled')
              return (
                <button key={c.id} className={`crew-pick-row ${selected === c.id ? 'on' : ''}`} aria-pressed={selected === c.id} onClick={() => setSelected(c.id)}>
                  <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div className="row-title">{c.name} {c.captainId === 'you' && '⭐'}</div>
                    <div className="row-sub">
                      {c.members.length} members · <LuckBadge luck={luck} dim />
                      {og ? ` · ${fmtEUR2(potTotal(og))} already in the pot` : ' · fresh entry'}
                    </div>
                  </div>
                  <FacePile members={c.members} max={3} />
                </button>
              )
            })}
            <button className="crew-pick-row create" onClick={() => nav(dispatch, { name: 'create' })}>
              <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }} aria-hidden="true">➕</div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="row-title">New crew · invite your people</div>
                <div className="row-sub">Create it, share the invite link, come back here</div>
              </div>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
            <button className="btn btn-gold btn-lg" style={{ flex: 2 }} disabled={!crew} onClick={() => setStep(3)}>Continue →</button>
          </div>
        </>
      )}

      {step === 3 && crew && (
        <>
          <div className="wizard-step">Step 3 of 3</div>
          <h2 className="display">How much do you want to pitch in?</h2>
          <p className="sub">
            Minimum {fmtEUR2(minStake)} covers your {tickets} ticket{tickets > 1 ? 's' : ''}.
            What you put in defines your cut of every win.
          </p>
          <div style={{ margin: '20px 0' }}>
            <StakeInput
              value={stake}
              min={minStake}
              onChange={v => setExtra(Math.round((v - minStake) * 100) / 100)}
              label="Your stake for this draw"
            />
          </div>
          <div className="stat-tiles" style={{ marginBottom: 10, gridTemplateColumns: '1fr 1fr' }}>
            <div className="stat-tile"><div className="k">Crew pot now</div><div className="v">{fmtEUR2(potNow)}</div></div>
            <div className="stat-tile"><div className="k">Your cut right now</div><div className="v" style={{ color: 'var(--cyan)' }}>{fmtPct(newPct)}</div></div>
          </div>
          <p className="row-sub" style={{ textAlign: 'center', marginBottom: 8 }}>
            Currently in wallet: <b style={{ color: canAfford ? 'var(--money)' : 'var(--hotpink)' }}>{fmtEUR2(state.wallet.balance)}</b>
          </p>
          <p className="row-sub" style={{ textAlign: 'center', marginBottom: 18, lineHeight: 1.6 }}>
            Your cut moves as crewmates chip in. Right now it'd be worth up to <b style={{ color: 'var(--money)' }}>{fmtEUR(Math.floor(megaPot * newPct))}</b> of the Mega pot. The split is final when entries lock.
          </p>
          {!canAfford && <p className="sub" style={{ color: 'var(--hotpink)' }}>Not enough balance. Top up in Wallet first.</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
            <button className="btn btn-gold btn-lg" style={{ flex: 2 }} disabled={!canAfford} onClick={confirm}>
              Pay {fmtEUR2(stake)} · you're in
            </button>
          </div>
          <div className="row-sub" style={{ textAlign: 'center', marginTop: 12 }}>Refundable until entries lock · Play responsibly 18+</div>
        </>
      )}
    </Modal>
  )
}

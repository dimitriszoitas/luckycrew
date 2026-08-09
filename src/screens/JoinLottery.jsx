import React, { useState } from 'react'
import { useStore, nav, toast, isMemberOf, crewLuck, ongoingForCrew, NEXT_DRAW } from '../store.jsx'
import { GAME, fmtEUR, fmtEUR2, mainCount, starCount, ticketPrice, shareFor } from '../game.js'
import { Modal, LuckBadge, StakeInput, Countdown, MultiplierChip, AnimatedNumber } from '../ui.jsx'

const seatsLine = crew => {
  const free = Math.max(0, GAME.maxCrew - crew.members.length)
  const members = `${crew.members.length} member${crew.members.length !== 1 ? 's' : ''}`
  if (!free) return `${members} · crew full`
  return `${members} · ${free} available seat${free !== 1 ? 's' : ''}`
}

// The join flow: 1) how many tickets · 2) which crew · 3) your share + boost.
// Price never appears before the crew is picked, because the crew sets the price.
export default function JoinLotteryModal() {
  const { state, dispatch } = useStore()
  const jl = state.joinLottery
  const myCrews = state.crews.filter(isMemberOf)
  const [step, setStep] = useState(1)
  const [tickets, setTickets] = useState(1)
  const [selected, setSelected] = useState(jl?.crewId || myCrews[0]?.id || null)
  const [boost, setBoost] = useState(0)
  if (!jl) return null

  const close = () => dispatch({ type: 'closeJoinLottery' })
  const quick = jl.eventId ? state.quickDraws.find(q => q.id === jl.eventId) : null
  const kind = quick ? 'quick' : 'mega'
  const drawLabel = quick ? 'Quick Draw' : 'Weekly Mega'
  const closesAt = quick ? quick.closesAt : state.drawCloses
  const crew = state.crews.find(c => c.id === selected)
  const entry = crew ? ongoingForCrew(state, crew.id) : null
  // the draw you clicked owns the multiplier; only the Mega defers to a live entry
  const multiplier = quick ? quick.multiplier : entry?.multiplier || state.mega.multiplier

  // Everything below depends on the crew, which is exactly why step 1 stays quiet
  const size = crew ? Math.min(GAME.maxCrew, crew.members.length) : 0
  const totalTickets = (entry?.tickets.length || 0) + tickets
  const due = crew ? shareFor(size, totalTickets) : 0
  const alreadyPaid = entry?.contributions?.you || 0
  const owed = Math.max(0, Math.round((due - alreadyPaid) * 100) / 100)
  const total = Math.round((owed + boost) * 100) / 100
  const canAfford = total <= state.wallet.balance
  const jackpot = quick ? Math.floor(quick.pot) : Math.floor(state.mega.pot)

  const confirm = () => {
    dispatch({ type: 'joinDraw', crewId: crew.id, drawNo: entry?.drawNo || NEXT_DRAW, tickets, boost, kind })
    if (jl.eventId) dispatch({ type: 'eventJoined', eventId: jl.eventId })
    toast(dispatch, `You're in with ${crew.name}: ${fmtEUR2(owed)} share${boost > 0 ? ` + ${fmtEUR2(boost)} boost at ${multiplier}x` : ''}`, '🎟️')
  }

  return (
    <Modal onClose={close} width={620} label="Join a lottery">
      {/* The draw is the hero, and it rides along through all three steps */}
      <div className={`draw-hero ${quick ? 'quick' : 'mega'}`}>
        <div className="draw-hero-top">
          <span className="draw-hero-kind">{drawLabel}</span>
          <span className="draw-hero-no">Draw #{quick ? quick.drawNo : NEXT_DRAW}</span>
          <div className="spacer" />
          <MultiplierChip x={multiplier} small />
        </div>
        <div className="draw-hero-pot">
          {quick
            ? <AnimatedNumber value={quick.pot} format={v => fmtEUR2(v)} />
            : <><AnimatedNumber value={jackpot} format={v => fmtEUR(Math.floor(v))} /><span className="plus" aria-hidden="true">+</span></>}
        </div>
        <div className="draw-hero-meta">
          <span>{quick ? 'Quick Draw pot' : `Rolling Mega pot · ${state.mega.rollovers} draws without a winner`}</span>
          <div className="spacer" />
          <span>closes in <Countdown target={closesAt} small /></span>
        </div>
      </div>

      {step === 1 && (
        <>
          <h2 className="display">How many tickets?</h2>
          <p className="sub">Every ticket belongs to the whole crew. More tickets, more chances, and the cost still splits evenly.</p>
          <div className="stepper" style={{ margin: '20px 0' }}>
            <button aria-disabled={tickets <= 1} aria-label="One fewer ticket" onClick={() => tickets > 1 && setTickets(tickets - 1)}>−</button>
            <div className="val" aria-live="polite" aria-label={`${tickets} tickets`}>{tickets}</div>
            <button aria-disabled={tickets >= 10} aria-label="One more ticket" onClick={() => tickets < 10 && setTickets(tickets + 1)}>+</button>
          </div>
          <p className="row-sub" style={{ textAlign: 'center', marginBottom: 18 }}>
            What this costs depends on your crew. Pick them next.
          </p>
          <button className="btn btn-gold btn-lg" style={{ width: '100%' }} onClick={() => setStep(2)}>Continue →</button>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="display">Who are you playing with?</h2>
          <p className="sub">
            The draw pulls 5 numbers + 1 star. Every crewmate adds a number to the ticket, so the more of you there
            are, the more room the draw has to land inside it. Six is the maximum.
          </p>
          <div className="crew-pick" role="group" aria-label="Pick a crew">
            {myCrews.map(c => {
              const luck = crewLuck(state, c.id)
              const n = Math.min(GAME.maxCrew, c.members.length)
              const og = ongoingForCrew(state, c.id)
              const count = (og?.tickets.length || 0) + tickets
              return (
                <button key={c.id} className={`crew-pick-row ${selected === c.id ? 'on' : ''}`} aria-pressed={selected === c.id} onClick={() => setSelected(c.id)}>
                  <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }}>{c.emoji}</div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div className="row-title">
                      {c.name}
                      {c.captainId === 'you' && <span className="chip captain" style={{ marginLeft: 6 }}>Captain</span>}
                      <span className="pick-luck"><LuckBadge luck={luck} dim /></span>
                    </div>
                    <div className="row-sub">{seatsLine(c)}</div>
                    <div className="crew-pick-spec">
                      <b>{mainCount(n)} numbers + {starCount(n)} star{starCount(n) > 1 ? 's' : ''}</b>
                      <span> · {fmtEUR2(shareFor(n, count))} each</span>
                    </div>
                  </div>
                </button>
              )
            })}
            <button className="crew-pick-row create" onClick={() => nav(dispatch, { name: 'create' })}>
              <div className="crew-emoji" style={{ width: 44, height: 44, fontSize: 22 }} aria-hidden="true">+</div>
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
          <h2 className="display">Your seat at the ticket</h2>
          <p className="sub">
            {crew.emoji} {crew.name} plays <b>{mainCount(size)} numbers + {starCount(size)} star{starCount(size) > 1 ? 's' : ''}</b> on {totalTickets} ticket{totalTickets > 1 ? 's' : ''}.
            That is {fmtEUR2(ticketPrice(size))} a ticket, split {size} ways.
          </p>

          <div className="pay-block">
            <div className="pay-row">
              <div>
                <div className="row-title">Your share</div>
                <div className="row-sub">Mandatory. Everyone pays the same, and the draw locks when they have.</div>
              </div>
              <div className="pay-amount">{fmtEUR2(owed)}</div>
            </div>
          </div>

          <div className="boost-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <div className="row-title">Boost <span className="row-sub" style={{ fontWeight: 500 }}>optional</span></div>
              <MultiplierChip x={multiplier} small />
            </div>
            <div className="row-sub" style={{ marginBottom: 12 }}>
              Anything on top of your share pays back at {multiplier}x, yours alone, if the crew lands 5 numbers or the jackpot.
            </div>
            <StakeInput value={boost} min={0} onChange={setBoost} label="Boost amount" />
            <div className="boost-payout">
              {boost > 0
                ? <>If we hit it, your boost returns <b>{fmtEUR(Math.round(boost * multiplier))}</b> on top of your share of the pot.</>
                : <>Skip it and you still play every number on every ticket.</>}
            </div>
          </div>

          {/* Spell the max win out, so the boost line and this tile reconcile */}
          <div className="maxwin-block">
            <div className="maxwin-row">
              <span>Your equal cut of the {quick ? 'pot' : 'Mega'}</span>
              <b>{fmtEUR(Math.floor(jackpot / size))}</b>
            </div>
            <div className={`maxwin-row ${boost > 0 ? '' : 'off'}`}>
              <span>Your boost at {multiplier}x</span>
              <b>{boost > 0 ? `+ ${fmtEUR(Math.round(boost * multiplier))}` : '+ €0'}</b>
            </div>
            <div className="maxwin-row total">
              <span>Your max win</span>
              <b>{fmtEUR(Math.floor(jackpot / size + boost * multiplier))}</b>
            </div>
          </div>
          <p className="row-sub" style={{ textAlign: 'center', margin: '10px 0 12px' }}>
            Wallet after this: <b style={{ color: canAfford ? 'var(--money)' : 'var(--hotpink)' }}>{fmtEUR2(Math.max(0, state.wallet.balance - total))}</b>
          </p>

          {!canAfford && <p className="sub" style={{ color: 'var(--hotpink)' }}>Not enough balance. Top up in Wallet first.</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</button>
            <button className="btn btn-gold btn-lg" style={{ flex: 2 }} disabled={!canAfford} onClick={confirm}>
              Pay {fmtEUR2(total)} · you're in
            </button>
          </div>
          <div className="row-sub" style={{ textAlign: 'center', marginTop: 12 }}>Refundable until entries lock · Play responsibly 18+</div>
        </>
      )}
    </Modal>
  )
}

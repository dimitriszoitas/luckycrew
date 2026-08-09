import React, { useState } from 'react'
import {
  useStore, nav, toast, crewById, potTotal, sharesTotal, boostsTotal,
  entrySize, shareDue, ticketCost, hasPaid, paidMembers, unpaidMembers, isReady,
} from '../store.jsx'
import { GAME, quickPick, fmtEUR, fmtEUR2, mainCount, starCount, ticketPrice, shareFor } from '../game.js'
import { AnimatedNumber, Countdown, Balls, StatusChip, Modal, StakeInput, MultiplierChip } from '../ui.jsx'

const timeAgo = t => {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// One crew's entry in one draw. Everyone owes the same share; the entry locks
// once they have paid, and anyone who has not is dropped at lock.
export default function LotteryPage({ lotteryId }) {
  const { state, dispatch } = useStore()
  const lottery = state.lotteries.find(l => l.id === lotteryId)
  const [tab, setTab] = useState('tickets')
  const [showBoost, setShowBoost] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  if (!lottery) return null
  const crew = crewById(state, lottery.crewId)
  const size = entrySize(state, lottery)
  const due = shareDue(state, lottery)
  const paid = paidMembers(state, lottery)
  const unpaid = unpaidMembers(state, lottery)
  const ready = isReady(state, lottery)
  const youPaid = hasPaid(state, lottery, 'you')
  const yourShare = lottery.contributions.you || 0
  const yourBoost = lottery.boosts?.you || 0
  const isCaptain = crew.captainId === 'you'
  const open = lottery.status === 'open'
  const lastEvent = [...lottery.ledger].reverse().find(e => e.icon === '💶' || e.icon === '🚀')

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'crew', crewId: crew.id })}>← {crew.name}</button>

      <div className="card card-pad" style={{ marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div className={`stripe ${crew.color}`} style={{ position: 'absolute', inset: '0 0 auto 0', height: 4 }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="crew-emoji" style={{ width: 64, height: 64, fontSize: 33 }}>🎟️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26 }}>Draw #{lottery.drawNo}</h1>
              <StatusChip status={lottery.status} />
              <MultiplierChip x={lottery.multiplier} small />
              {isCaptain && <span className="chip captain">You're captain</span>}
            </div>
            <div className="crew-meta" style={{ marginTop: 3 }}>
              {GAME.name} · Weekly Mega · <b style={{ color: 'var(--text)' }}>{crew.emoji} {crew.name}</b>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="count-lbl" style={{ marginBottom: 4 }}>Draw closes in</div>
            <Countdown target={state.drawCloses} small />
          </div>
        </div>

        {/* The ticket this crew is playing */}
        <div className="entry-spec">
          <div className="spec-cell">
            <div className="k">Playing</div>
            <div className="v">{mainCount(size)} numbers <span>+ {starCount(size)} star{starCount(size) > 1 ? 's' : ''}</span></div>
          </div>
          <div className="spec-cell">
            <div className="k">Tickets</div>
            <div className="v">{lottery.tickets.length} <span>at {fmtEUR2(ticketPrice(size))}</span></div>
          </div>
          <div className="spec-cell">
            <div className="k">Everyone pays</div>
            <div className="v">{fmtEUR2(due)} <span>each</span></div>
          </div>
          <div className="spec-cell">
            <div className="k">Boosted</div>
            <div className="v">{fmtEUR2(boostsTotal(lottery))} <span>at {lottery.multiplier}x</span></div>
          </div>
        </div>

        {/* Readiness: the entry cannot lock until everyone has paid */}
        <div className={`ready-bar ${ready ? 'on' : ''}`}>
          <span className="ready-pill on">{paid.length} of {crew.members.length} paid</span>
          <div className="ready-faces">
            {crew.members.map(m => (
              <span key={m.id} className={`ready-face ${hasPaid(state, lottery, m.id) ? 'paid' : ''}`} title={`${m.name}: ${hasPaid(state, lottery, m.id) ? 'paid' : 'owes ' + fmtEUR2(due)}`}>
                {m.avatar}
              </span>
            ))}
          </div>
          <div className="spacer" />
          <span className="row-sub">
            {ready
              ? 'Everyone is in. The captain can lock the entry.'
              : `Waiting on ${unpaid.map(m => (m.id === 'you' ? 'you' : m.name)).join(', ')}. Unpaid members drop at lock and the ticket shrinks.`}
          </span>
        </div>

        {lastEvent && (
          <div className="live-chip" key={lastEvent.id} style={{ marginTop: 12 }}>
            <span className="live-dot" aria-hidden="true" />
            <span aria-hidden="true">{lastEvent.icon}</span>
            <b>{lastEvent.text}</b>
            <span className="when">{timeAgo(lastEvent.t)}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          {open && !youPaid && (
            <button className="btn btn-money" onClick={() => { dispatch({ type: 'payShare', lotteryId: lottery.id }); toast(dispatch, `Share paid: ${fmtEUR2(Math.max(0, due - yourShare))}`, '💶') }}>
              Pay my share · {fmtEUR2(Math.max(0, due - yourShare))}
            </button>
          )}
          {open && youPaid && <button className="btn btn-money" onClick={() => setShowBoost(true)}>Boost my win ({lottery.multiplier}x)</button>}
          {open && isCaptain && <button className="btn btn-primary" onClick={() => setShowPicker(true)}>Add tickets</button>}
          {open && isCaptain && (
            <button
              className="btn btn-ghost"
              disabled={!paid.length}
              onClick={() => {
                dispatch({ type: 'lockLottery', lotteryId: lottery.id })
                toast(dispatch, unpaid.length ? `Locked. ${unpaid.length} unpaid member${unpaid.length > 1 ? 's' : ''} dropped` : 'Entries locked. Everyone is in', '🔒')
              }}
            >
              Lock &amp; go to draw
            </button>
          )}
          {lottery.status === 'locked' && <button className="btn btn-primary btn-lg pulse-glow" onClick={() => nav(dispatch, { name: 'draw', lotteryId: lottery.id })}>Watch the draw live</button>}
          {lottery.status === 'settled' && <button className="btn btn-money" onClick={() => nav(dispatch, { name: 'results', lotteryId: lottery.id })}>View results &amp; split</button>}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['tickets', `Tickets (${lottery.tickets.length})`], ['contributors', `Players (${paid.length}/${crew.members.length})`], ['ledger', 'Ledger']].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'tickets' && (
        <div className="card card-pad">
          {lottery.tickets.length === 0 ? (
            <div className="empty">
              <div className="big">🎫</div>
              <div>No tickets yet. The captain adds them: quick picks or hand-picked numbers.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {lottery.tickets.map((t, i) => (
                <div className="ticket-card" key={t.id}>
                  <span className="ticket-id">#{String(i + 1).padStart(2, '0')}</span>
                  <Balls nums={t.nums} stars={t.stars} size="sm" result={lottery.result} />
                  <span className="crew-meta" style={{ marginLeft: 'auto' }}>{t.source}</span>
                </div>
              ))}
              <div className="match-note">
                The draw pulls <b>5 numbers + 1 star</b>. You win when those land inside your ticket, not when every
                number matches: 3 of the 5 pays, 5 of the 5 plus the star is the jackpot. More numbers on the ticket
                simply means more ways for the draw to fall inside it.
              </div>
              <div className="crew-meta" style={{ textAlign: 'center' }}>
                Every paid member plays <b>every number on every ticket</b>. Wins split equally.
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'contributors' && (
        <div className="card card-pad">
          {crew.members.map(m => {
            const share = lottery.contributions[m.id] || 0
            const boost = lottery.boosts?.[m.id] || 0
            const done = hasPaid(state, lottery, m.id)
            return (
              <div className="row" key={m.id}>
                <div className="member-avatar">{m.avatar}</div>
                <div className="grow">
                  <div className="row-title">{m.name}{m.id === 'you' && ' (you)'} {crew.captainId === m.id && <span className="chip captain" style={{ marginLeft: 6 }}>Captain</span>}</div>
                  <div className="row-sub">
                    {done ? `share ${fmtEUR2(share)} paid` : `owes ${fmtEUR2(due - share)}`}
                    {boost > 0 && ` · boost ${fmtEUR2(boost)} at ${lottery.multiplier}x`}
                  </div>
                </div>
                <span className={`ready-pill ${done ? 'on' : 'off'}`} style={{ whiteSpace: 'nowrap' }}>{done ? '✓ paid' : 'unpaid'}</span>
              </div>
            )
          })}
          <div className="row-sub" style={{ marginTop: 12 }}>
            {fmtEUR2(sharesTotal(lottery))} of {fmtEUR2(ticketCost(state, lottery))} in shares · {fmtEUR2(boostsTotal(lottery))} in boosts · {fmtEUR2(potTotal(lottery))} committed
          </div>
          {open && unpaid.filter(m => m.id !== 'you').length > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { dispatch({ type: 'botsPayUp', lotteryId: lottery.id }); toast(dispatch, 'Crewmates settled up!', '💶') }}>
              Simulate crewmates paying up
            </button>
          )}
        </div>
      )}

      {tab === 'ledger' && (
        <div className="card card-pad">
          <div className="crew-meta" style={{ marginBottom: 10 }}>Append-only. Every cent, every event, visible to every member. This is the trust anchor.</div>
          {[...lottery.ledger].reverse().map(l => (
            <div className="ledger-item" key={l.id}>
              <span>{l.icon}</span>
              <span>{l.text}</span>
              <span className="when">{timeAgo(l.t)}</span>
            </div>
          ))}
        </div>
      )}

      {showBoost && <BoostModal lottery={lottery} size={size} onClose={() => setShowBoost(false)} />}
      {showPicker && <TicketPickerModal lottery={lottery} size={size} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ── Boost modal ──────────────────────────────────────────────────────────────

function BoostModal({ lottery, size, onClose }) {
  const { state, dispatch } = useStore()
  const [amount, setAmount] = useState(5)
  const x = lottery.multiplier
  const yourBoost = lottery.boosts?.you || 0
  const canAfford = amount <= state.wallet.balance
  const confirm = () => {
    dispatch({ type: 'boostEntry', lotteryId: lottery.id, amount })
    toast(dispatch, `Boosted ${fmtEUR2(amount)} at ${x}x`, '🚀')
    onClose()
  }
  return (
    <Modal onClose={onClose} label="Boost my win">
      <h2 className="display">Boost my win</h2>
      <p className="sub">
        Your share is already paid, so you own an equal cut of anything this crew wins. A boost is yours alone: it pays
        back at <b>{x}x</b> if the crew lands 5 numbers or the jackpot.
      </p>
      <div style={{ margin: '20px 0' }}>
        <StakeInput value={amount} min={0} onChange={setAmount} label="Boost amount" />
      </div>
      <div className="stat-tiles" style={{ marginBottom: 18 }}>
        <div className="stat-tile"><div className="k">Pays back</div><div className="v" style={{ color: 'var(--cyan)' }}>{fmtEUR(Math.round(amount * x))}</div></div>
        <div className="stat-tile"><div className="k">Boost total</div><div className="v">{fmtEUR2(yourBoost + amount)}</div></div>
        <div className="stat-tile"><div className="k">Wallet</div><div className="v" style={{ color: canAfford ? 'var(--money)' : 'var(--hotpink)' }}>{fmtEUR2(state.wallet.balance)}</div></div>
      </div>
      {!canAfford && <p className="sub" style={{ color: 'var(--hotpink)' }}>Not enough balance. Top up in Wallet first.</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        <button className="btn btn-money" disabled={!canAfford || amount <= 0} onClick={confirm} style={{ flex: 2 }}>Boost {fmtEUR2(amount)}</button>
      </div>
      <div className="row-sub" style={{ textAlign: 'center', marginTop: 12 }}>Refundable until entries lock · Play responsibly 18+</div>
    </Modal>
  )
}

// ── Ticket picker modal ──────────────────────────────────────────────────────

function TicketPickerModal({ lottery, size, onClose }) {
  const { dispatch } = useStore()
  const [mode, setMode] = useState('quick')
  const [qty, setQty] = useState(1)
  const [nums, setNums] = useState([])
  const [stars, setStars] = useState([])
  const needNums = mainCount(size)
  const needStars = starCount(size)

  const toggleNum = n => setNums(x => (x.includes(n) ? x.filter(v => v !== n) : x.length < needNums ? [...x, n] : x))
  const toggleStar = n => setStars(x => (x.includes(n) ? x.filter(v => v !== n) : x.length < needStars ? [...x, n] : x))
  const manualReady = nums.length === needNums && stars.length === needStars

  const newShare = count => shareFor(size, lottery.tickets.length + count)

  const buyQuick = () => {
    const tickets = Array.from({ length: qty }, () => ({ id: `t${Math.random().toString(36).slice(2, 8)}`, ...quickPick(size), source: 'Quick pick' }))
    dispatch({ type: 'addTickets', lotteryId: lottery.id, tickets })
    toast(dispatch, `${qty} ticket${qty > 1 ? 's' : ''} added. Everyone now owes ${fmtEUR2(newShare(qty))}`, '🎫')
    onClose()
  }
  const buyManual = () => {
    dispatch({
      type: 'addTickets',
      lotteryId: lottery.id,
      tickets: [{ id: `t${Math.random().toString(36).slice(2, 8)}`, nums: [...nums].sort((a, b) => a - b), stars: [...stars].sort((a, b) => a - b), source: "Captain's pick" }],
    })
    toast(dispatch, `Ticket added. Everyone now owes ${fmtEUR2(newShare(1))}`, '🎫')
    onClose()
  }

  return (
    <Modal onClose={onClose} width={560} label="Add tickets">
      <h2 className="display">Add tickets</h2>
      <p className="sub">
        This crew's ticket carries <b>{needNums} numbers + {needStars} star{needStars > 1 ? 's' : ''}</b> and costs {fmtEUR2(ticketPrice(size))}.
        Every ticket you add raises everyone's share equally.
      </p>
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={`tab ${mode === 'quick' ? 'active' : ''}`} aria-pressed={mode === 'quick'} onClick={() => setMode('quick')}>Quick pick</button>
        <button className={`tab ${mode === 'manual' ? 'active' : ''}`} aria-pressed={mode === 'manual'} onClick={() => setMode('manual')}>Pick numbers</button>
      </div>

      {mode === 'quick' && (
        <>
          <div className="stepper" style={{ margin: '10px 0 20px' }}>
            <button aria-disabled={qty <= 1} aria-label="One fewer ticket" onClick={() => qty > 1 && setQty(qty - 1)}>−</button>
            <div className="val" aria-live="polite" aria-label={`${qty} tickets selected`}>{qty}</div>
            <button aria-disabled={qty >= 10} aria-label="One more ticket" onClick={() => qty < 10 && setQty(qty + 1)}>+</button>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={buyQuick}>
            Add {qty} ticket{qty > 1 ? 's' : ''} · share becomes {fmtEUR2(newShare(qty))} each
          </button>
        </>
      )}

      {mode === 'manual' && (
        <>
          <fieldset className="field">
            <legend>Pick {needNums} numbers (1 to {GAME.numberMax}), {nums.length}/{needNums} picked</legend>
            <div className="num-grid">
              {Array.from({ length: GAME.numberMax }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" className={`num-cell ${nums.includes(n) ? 'sel' : ''}`} aria-pressed={nums.includes(n)} onClick={() => toggleNum(n)}>{n}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>Pick {needStars} ★ Star Ball{needStars > 1 ? 's' : ''} (1 to {GAME.starMax}), {stars.length}/{needStars} picked</legend>
            <div className="num-grid">
              {Array.from({ length: GAME.starMax }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" className={`num-cell ${stars.includes(n) ? 'star-sel' : ''}`} aria-pressed={stars.includes(n)} onClick={() => toggleStar(n)}>{n}</button>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={!manualReady} onClick={buyManual}>
            Add this ticket · share becomes {fmtEUR2(newShare(1))} each
          </button>
        </>
      )}
    </Modal>
  )
}

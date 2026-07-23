import React, { useState } from 'react'
import { useStore, nav, toast, crewById, potTotal, potBalance } from '../store.jsx'
import { GAME, quickPick, fmtEUR2, fmtPct } from '../game.js'
import { AnimatedNumber, Countdown, Balls, StatusChip, Modal, StakeInput } from '../ui.jsx'

const timeAgo = t => {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000))
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// One crew's entry in one draw: pot, contributions, tickets, ledger.
// No shares: each member's stake defines their cut.
export default function LotteryPage({ lotteryId }) {
  const { state, dispatch } = useStore()
  const lottery = state.lotteries.find(l => l.id === lotteryId)
  const [tab, setTab] = useState('tickets')
  const [showContribute, setShowContribute] = useState(false)
  const [showPicker, setShowPicker] = useState(false)

  if (!lottery) return null
  const crew = crewById(state, lottery.crewId)
  const pot = potTotal(lottery)
  const unspent = potBalance(lottery)
  const yourStake = lottery.contributions.you || 0
  const yourPct = pot ? yourStake / pot : 0
  const isCaptain = crew.captainId === 'you'
  const affordable = Math.floor(unspent / GAME.ticketPrice)
  const open = lottery.status === 'open'
  const contributors = crew.members.filter(m => (lottery.contributions[m.id] || 0) > 0)
  const lastChip = [...lottery.ledger].reverse().find(e => e.icon === '💰')

  return (
    <div className="container" style={{ maxWidth: 880 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'crew', crewId: crew.id })}>← {crew.emoji} {crew.name}</button>

      <div className="card card-pad" style={{ marginBottom: 18, position: 'relative', overflow: 'hidden' }}>
        <div className={`stripe ${crew.color}`} style={{ position: 'absolute', inset: '0 0 auto 0', height: 4 }} />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="crew-emoji" style={{ width: 64, height: 64, fontSize: 33 }}>🎟️</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26 }}>Draw #{lottery.drawNo}</h1>
              <StatusChip status={lottery.status} />
              {isCaptain && <span className="chip captain">⭐ You're captain</span>}
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

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21 }}>
              <AnimatedNumber value={pot} format={v => fmtEUR2(v)} /><span style={{ color: 'var(--text-faint)', fontSize: 15 }}> in the pot</span>
            </span>
            <span className="crew-meta">unspent {fmtEUR2(unspent)} · {lottery.tickets.length} tickets</span>
            <div className="spacer" />
            <span className="crew-meta">your stake: <b className="pct-badge">{fmtEUR2(yourStake)}</b> ({fmtPct(yourPct)})</span>
          </div>
          <div className="progress money" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(yourPct * 100)} aria-label={`Your share of the pot: ${fmtPct(yourPct)}`}><i style={{ width: `${yourPct * 100}%` }} aria-hidden="true" /></div>
          {lastChip && (
            <div className="live-chip" key={lastChip.id}>
              <span className="live-dot" aria-hidden="true" />
              <span aria-hidden="true">💰</span>
              <b>{lastChip.text}</b>
              <span className="when">{timeAgo(lastChip.t)}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          {open && <button className="btn btn-money" onClick={() => setShowContribute(true)}>💰 Add money</button>}
          {open && isCaptain && <button className="btn btn-primary" disabled={affordable < 1} onClick={() => setShowPicker(true)}>🎫 Buy tickets {affordable > 0 ? `(pot covers ${affordable})` : '(add money first)'}</button>}
          {open && isCaptain && lottery.tickets.length > 0 && (
            <button className="btn btn-ghost" onClick={() => { dispatch({ type: 'lockLottery', lotteryId: lottery.id }); toast(dispatch, 'Entries locked. Stakes snapshot taken', '🔒') }}>🔒 Lock &amp; go to draw</button>
          )}
          {lottery.status === 'locked' && <button className="btn btn-primary btn-lg pulse-glow" onClick={() => nav(dispatch, { name: 'draw', lotteryId: lottery.id })}>🎥 Watch the draw live</button>}
          {lottery.status === 'settled' && <button className="btn btn-money" onClick={() => nav(dispatch, { name: 'results', lotteryId: lottery.id })}>🏆 View results &amp; split</button>}
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 16 }}>
        {[['tickets', `🎫 Tickets (${lottery.tickets.length})`], ['contributors', `💰 Stakes (${contributors.length})`], ['ledger', '📜 Ledger']].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? 'active' : ''}`} aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'tickets' && (
        <div className="card card-pad">
          {lottery.tickets.length === 0 ? (
            <div className="empty">
              <div className="big">🎫</div>
              <div>No tickets yet. Add money to the pot, then the captain converts it into tickets: quick picks or hand-picked numbers.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {lottery.tickets.map((t, i) => (
                <div className="ticket-card" key={t.id}>
                  <span className="ticket-id">#{String(i + 1).padStart(2, '0')}</span>
                  <Balls nums={t.nums} star={t.star} size="sm" result={lottery.result} />
                  <span className="crew-meta" style={{ marginLeft: 'auto' }}>{t.source}</span>
                </div>
              ))}
              <div className="crew-meta" style={{ textAlign: 'center', marginTop: 6 }}>
                Every contributor owns a slice of <b>every</b> ticket. Your slice is {fmtPct(yourPct)}.
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'contributors' && (
        <div className="card card-pad">
          {contributors.map(m => {
            const stake = lottery.contributions[m.id]
            const pct = pot ? stake / pot : 0
            return (
              <div className="row" key={m.id}>
                <div className="member-avatar">{m.avatar}</div>
                <div className="grow">
                  <div className="row-title">{m.name}{m.id === 'you' && ' (you)'} {crew.captainId === m.id && <span className="chip captain" style={{ marginLeft: 6 }}>⭐ Captain</span>}</div>
                  <div className="row-sub">staked {fmtEUR2(stake)}</div>
                </div>
                <div style={{ width: 120 }}>
                  <div className="progress" aria-hidden="true" style={{ height: 8, marginBottom: 4 }}><i style={{ width: `${pct * 100}%` }} /></div>
                  <div className="row-sub" style={{ textAlign: 'right' }}><b className="pct-badge" style={{ fontSize: 13 }}>{fmtPct(pct)}</b> of the pot</div>
                </div>
              </div>
            )
          })}
          {open && crew.members.length > contributors.length && (
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { dispatch({ type: 'botsChipIn', lotteryId: lottery.id }); toast(dispatch, 'Crew members chipped in!', '💰') }}>
              ✨ Simulate crew chipping in
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

      {showContribute && <ContributeModal lottery={lottery} onClose={() => setShowContribute(false)} />}
      {showPicker && <TicketPickerModal lottery={lottery} affordable={affordable} onClose={() => setShowPicker(false)} />}
    </div>
  )
}

// ── Add money modal ──────────────────────────────────────────────────────────

function ContributeModal({ lottery, onClose }) {
  const { state, dispatch } = useStore()
  const step = GAME.ticketPrice
  const [amount, setAmount] = useState(step)
  const pot = potTotal(lottery)
  const yourStake = lottery.contributions.you || 0
  const newPct = (yourStake + amount) / (pot + amount)
  const canAfford = amount <= state.wallet.balance
  const confirm = () => {
    dispatch({ type: 'contribute', lotteryId: lottery.id, amount })
    toast(dispatch, `You added ${fmtEUR2(amount)} to the pot`, '💰')
    onClose()
  }
  return (
    <Modal onClose={onClose} label="Add money">
      <h2 className="display">Add money</h2>
      <p className="sub">Type any amount, minimum {fmtEUR2(step)}. The more you add, the bigger your cut of every win.</p>
      <div style={{ margin: '20px 0' }}>
        <StakeInput value={amount} min={step} onChange={setAmount} label="Amount to add to the pot" />
      </div>
      <div className="stat-tiles" style={{ marginBottom: 18 }}>
        <div className="stat-tile"><div className="k">Your stake after</div><div className="v">{fmtEUR2(yourStake + amount)}</div></div>
        <div className="stat-tile"><div className="k">Your cut after</div><div className="v" style={{ color: 'var(--cyan)' }}>{fmtPct(newPct)}</div></div>
        <div className="stat-tile"><div className="k">Wallet</div><div className="v" style={{ color: canAfford ? 'var(--money)' : 'var(--hotpink)' }}>{fmtEUR2(state.wallet.balance)}</div></div>
      </div>
      {!canAfford && <p className="sub" style={{ color: 'var(--hotpink)' }}>Not enough balance. Top up in Wallet first.</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
        <button className="btn btn-money" disabled={!canAfford} onClick={confirm} style={{ flex: 2 }}>Pay {fmtEUR2(amount)}</button>
      </div>
      <div className="row-sub" style={{ textAlign: 'center', marginTop: 12 }}>Refundable until entries lock · Play responsibly 18+</div>
    </Modal>
  )
}

// ── Ticket picker modal ──────────────────────────────────────────────────────

function TicketPickerModal({ lottery, affordable, onClose }) {
  const { dispatch } = useStore()
  const [mode, setMode] = useState('quick')
  const [qty, setQty] = useState(Math.min(affordable, 5))
  const [nums, setNums] = useState([])
  const [star, setStar] = useState(null)

  const toggleNum = n => setNums(x => x.includes(n) ? x.filter(v => v !== n) : x.length < GAME.pickCount ? [...x, n] : x)
  const manualReady = nums.length === GAME.pickCount && star !== null

  const buyQuick = () => {
    const tickets = Array.from({ length: qty }, () => ({ id: `t${Math.random().toString(36).slice(2, 8)}`, ...quickPick(), source: 'Quick pick' }))
    dispatch({ type: 'buyTickets', lotteryId: lottery.id, tickets })
    toast(dispatch, `${qty} quick-pick ticket${qty > 1 ? 's' : ''} bought from the pot`, '🎫')
    onClose()
  }
  const buyManual = () => {
    dispatch({ type: 'buyTickets', lotteryId: lottery.id, tickets: [{ id: `t${Math.random().toString(36).slice(2, 8)}`, nums: [...nums].sort((a, b) => a - b), star, source: "Captain's pick" }] })
    toast(dispatch, 'Ticket added from the pot', '🎫')
    onClose()
  }

  return (
    <Modal onClose={onClose} width={560} label="Buy tickets from the pot">
      <h2 className="display">Buy tickets from the pot</h2>
      <p className="sub">Pot covers {affordable} ticket{affordable !== 1 ? 's' : ''} at €{GAME.ticketPrice.toFixed(2)} each. Tickets belong to the crew, everyone owns their slice.</p>
      <div className="tabs" style={{ marginBottom: 18 }}>
        <button className={`tab ${mode === 'quick' ? 'active' : ''}`} aria-pressed={mode === 'quick'} onClick={() => setMode('quick')}>⚡ Quick pick</button>
        <button className={`tab ${mode === 'manual' ? 'active' : ''}`} aria-pressed={mode === 'manual'} onClick={() => setMode('manual')}>🎯 Pick numbers</button>
      </div>

      {mode === 'quick' && (
        <>
          <div className="stepper" style={{ margin: '10px 0 20px' }}>
            <button aria-disabled={qty <= 1} aria-label="One fewer ticket" onClick={() => qty > 1 && setQty(qty - 1)}>−</button>
            <div className="val" aria-live="polite" aria-label={`${qty} tickets selected`}>{qty}</div>
            <button aria-disabled={qty >= affordable} aria-label="One more ticket" onClick={() => qty < affordable && setQty(qty + 1)}>+</button>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={buyQuick}>Buy {qty} ticket{qty > 1 ? 's' : ''} · {fmtEUR2(qty * GAME.ticketPrice)} from pot</button>
        </>
      )}

      {mode === 'manual' && (
        <>
          <fieldset className="field">
            <legend>Pick {GAME.pickCount} numbers (1 to {GAME.numberMax}), {nums.length}/{GAME.pickCount} picked</legend>
            <div className="num-grid">
              {Array.from({ length: GAME.numberMax }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" className={`num-cell ${nums.includes(n) ? 'sel' : ''}`} aria-pressed={nums.includes(n)} onClick={() => toggleNum(n)}>{n}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="field">
            <legend>Pick your ★ Star Ball (1 to {GAME.starMax})</legend>
            <div className="num-grid">
              {Array.from({ length: GAME.starMax }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" className={`num-cell ${star === n ? 'star-sel' : ''}`} aria-pressed={star === n} onClick={() => setStar(n)}>{n}</button>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={!manualReady} onClick={buyManual}>
            Buy this ticket · {fmtEUR2(GAME.ticketPrice)} from pot
          </button>
        </>
      )}
    </Modal>
  )
}

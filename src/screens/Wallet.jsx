import React from 'react'
import { useStore, nav, toast } from '../store.jsx'
import { fmtEUR2 } from '../game.js'

const when = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Wallet() {
  const { state, dispatch } = useStore()
  return (
    <div className="container" style={{ maxWidth: 620 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'home' })}>← Back</button>
      <h1 style={{ fontSize: 30, margin: '6px 0 18px' }}>Wallet</h1>

      <div className="card card-pad" style={{ textAlign: 'center', marginBottom: 18 }}>
        <div className="count-lbl">Balance</div>
        <div className="win-amount" style={{ fontSize: 52 }}>{fmtEUR2(state.wallet.balance)}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
          {[10, 25, 50].map(a => (
            <button key={a} className="btn btn-ghost" onClick={() => { dispatch({ type: 'topUp', amount: a }); toast(dispatch, `Topped up ${fmtEUR2(a)} (demo)`, '💶') }}>+ €{a}</button>
          ))}
        </div>
        <div className="row-sub" style={{ marginTop: 14 }}>Demo wallet, no real money. Deposit limits &amp; self-exclusion would live here.</div>
      </div>

      <div className="card card-pad">
        <div className="section-title">📒 Movements</div>
        {state.wallet.txns.map(x => (
          <div className="row" key={x.id}>
            <div className="member-avatar" style={{ fontSize: 17 }}>{x.amount > 0 ? '⬇️' : '⬆️'}</div>
            <div className="grow">
              <div className="row-title">{x.label}</div>
              <div className="row-sub">{when(x.t)}</div>
            </div>
            <div className="ticket-prize" style={{ color: x.amount > 0 ? 'var(--money)' : 'var(--text-dim)' }}>
              {x.amount > 0 ? '+' : ''}{fmtEUR2(x.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

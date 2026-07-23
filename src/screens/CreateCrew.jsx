import React, { useState } from 'react'
import { useStore, nav, toast } from '../store.jsx'

const EMOJIS = ['🚀', '🍀', '⚡', '🌙', '🔥', '🦄', '🐙', '💎', '🎯', '🥑']
const COLORS = [['violet', 'Royal'], ['lime', 'Gold'], ['cyan', 'Sky'], ['pink', 'Copper'], ['amber', 'Sunset']]

// Crews are reusable teams. Pot rules are set per draw entry, not here.
export default function CreateCrew() {
  const { dispatch } = useStore()
  const [f, setF] = useState({ name: '', emoji: '🚀', color: 'violet', privacy: 'private' })
  const set = patch => setF(x => ({ ...x, ...patch }))

  const create = () => {
    dispatch({ type: 'createCrew', crew: f })
    toast(dispatch, `Crew "${f.name || 'My Crew'}" created. Invite your people!`, '🎉')
  }

  return (
    <div className="container" style={{ maxWidth: 620 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'home' })}>← Back</button>
      <h1 style={{ fontSize: 30, margin: '6px 0 4px' }}>Start a Crew</h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: 20 }}>
        A crew is your reusable team. Create it once, play every draw together. You'll be the captain: you open draw entries and set the pot rules each time, but the platform holds the money.
      </p>

      <div className="card card-pad">
        <div className="section-title">Give it a face</div>
        <div className="field">
          <label>Crew name</label>
          <input className="input" placeholder="e.g. Office Legends" value={f.name} onChange={e => set({ name: e.target.value })} maxLength={26} autoFocus />
        </div>
        <div className="field">
          <label>Mascot</label>
          <div className="emoji-pick">
            {EMOJIS.map(e => <button key={e} className={f.emoji === e ? 'on' : ''} onClick={() => set({ emoji: e })}>{e}</button>)}
          </div>
        </div>
        <div className="field">
          <label>Vibe</label>
          <div className="seg">
            {COLORS.map(([key, label]) => (
              <button key={key} className={f.color === key ? 'on' : ''} onClick={() => set({ color: key })}>{label}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Who can join?</label>
          <div className="seg">
            <button className={f.privacy === 'private' ? 'on' : ''} onClick={() => set({ privacy: 'private' })}>🔗 Invite only</button>
            <button className={f.privacy === 'public' ? 'on' : ''} onClick={() => set({ privacy: 'public' })}>🌍 Public, anyone can join</button>
          </div>
        </div>

        <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, margin: '4px 0 18px' }}>
          Next step after creating: invite members, then enter tonight's draw and set share price, pot size and per-member cap for that entry.
        </p>

        <button className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={!f.name.trim()} onClick={create}>🎉 Create Crew</button>
      </div>
    </div>
  )
}

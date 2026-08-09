import React, { useState } from 'react'
import { useStore, nav, toast } from '../store.jsx'
import { GAME, fmtEUR2, mainCount, starCount, ticketPrice, shareFor } from '../game.js'
import { SizeLadder } from '../ui.jsx'

const EMOJIS = ['🚀', '🍀', '⚡', '🌙', '🔥', '🦄', '🐙', '💎', '🎯', '🥑']
const COLORS = [['violet', 'Royal'], ['lime', 'Gold'], ['cyan', 'Sky'], ['pink', 'Copper'], ['amber', 'Sunset']]

// Crews are reusable teams. This is also where the crew-size mechanic is
// explained, because it is the one decision that changes the whole ticket.
export default function CreateCrew() {
  const { dispatch } = useStore()
  const [f, setF] = useState({ name: '', emoji: '🚀', color: 'violet', privacy: 'private' })
  const [planned, setPlanned] = useState(GAME.maxCrew) // how big they intend the crew to be
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
        A crew is your reusable team of up to {GAME.maxCrew}. Create it once, play every draw together. You'll be the
        captain: you add the tickets and lock the entry each time, but the platform holds the money.
      </p>

      <div className="card card-pad">
        <div className="section-title">Give it a face</div>
        <div className="field">
          <label htmlFor="crew-name">Crew name</label>
          <input id="crew-name" className="input" placeholder="e.g. Office Legends" value={f.name} onChange={e => set({ name: e.target.value })} maxLength={26} autoFocus />
        </div>
        <fieldset className="field">
          <legend>Mascot</legend>
          <div className="emoji-pick">
            {EMOJIS.map(e => <button key={e} type="button" className={f.emoji === e ? 'on' : ''} aria-pressed={f.emoji === e} aria-label={`Mascot ${e}`} onClick={() => set({ emoji: e })}>{e}</button>)}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>Vibe</legend>
          <div className="seg">
            {COLORS.map(([key, label]) => (
              <button key={key} type="button" className={f.color === key ? 'on' : ''} aria-pressed={f.color === key} onClick={() => set({ color: key })}>{label}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend>Who can join?</legend>
          <div className="seg">
            <button type="button" className={f.privacy === 'private' ? 'on' : ''} aria-pressed={f.privacy === 'private'} onClick={() => set({ privacy: 'private' })}>Invite only</button>
            <button type="button" className={f.privacy === 'public' ? 'on' : ''} aria-pressed={f.privacy === 'public'} onClick={() => set({ privacy: 'public' })}>Public, anyone can join</button>
          </div>
        </fieldset>
      </div>

      {/* The size mechanic, explained where the decision actually gets made */}
      <div className="card card-pad ladder-card" style={{ marginTop: 18 }}>
        <h2 className="section-title" style={{ marginBottom: 4 }}>How big are you thinking?</h2>
        <p className="row-sub" style={{ lineHeight: 1.7, marginBottom: 14 }}>
          The draw always pulls <b>5 numbers + 1 star</b>, and you win when those land inside your ticket. Every
          crewmate adds a main number to that ticket, and four or more unlock three Star Balls, so a bigger crew gives
          the draw more room to fall your way. The price rises by {fmtEUR2(GAME.perMate)} a head but splits further
          every time: most numbers, least money each, at {GAME.maxCrew}.
        </p>

        <SizeLadder highlight={planned} onSelect={setPlanned} />

        <p className="match-note" style={{ marginBottom: 0 }}>
          With <b>{planned} player{planned > 1 ? 's' : ''}</b>, {f.name.trim() || 'your crew'} plays{' '}
          <b>{mainCount(planned)} numbers + {starCount(planned)} star{starCount(planned) > 1 ? 's' : ''}</b> for{' '}
          {fmtEUR2(ticketPrice(planned))} a ticket, which is <b>{fmtEUR2(shareFor(planned))} each</b>. Nothing is locked
          in: the ticket grows the moment someone new joins.
        </p>
      </div>

      <div className="card card-pad" style={{ marginTop: 18 }}>
        <p style={{ fontSize: 13.5, color: 'var(--text-dim)', lineHeight: 1.6, margin: '0 0 16px' }}>
          Next step after creating: invite up to {GAME.maxCrew - 1} people, then enter tonight's draw. Every member you
          add puts another number on the ticket and lowers what each of you pays.
        </p>
        <button className="btn btn-gold btn-lg" style={{ width: '100%' }} disabled={!f.name.trim()} onClick={create}>Create Crew</button>
      </div>
    </div>
  )
}

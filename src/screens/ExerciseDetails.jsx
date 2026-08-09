import React from 'react'
import { useStore, nav } from '../store.jsx'

// The assignment behind this prototype, what was built, and how it works.
export default function ExerciseDetails() {
  const { dispatch } = useStore()
  return (
    <div className="container doc" style={{ maxWidth: 860 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'home' })}>← Home</button>
      <h1 style={{ fontSize: 32, margin: '6px 0 6px' }}>Exercise Details</h1>
      <p className="doc-lead">The assignment behind this prototype, an outline of what was built, and how the platform works.</p>

      <section className="card card-pad doc-section">
        <h2 className="section-title">1 · Brief / Objective</h2>
        <h3>Group Play for a Lottery Platform</h3>
        <p>
          Design a Group Play experience for a lottery website or mobile app. Group Play allows multiple users to
          participate in the same ticket or set of tickets, increasing their chances of winning while sharing the cost.
        </p>
        <p>
          The goal is to create a simple and engaging experience that enables users to create or join groups, invite
          others, contribute to ticket purchases, track participation and ticket ownership, and automatically split
          winnings among members.
        </p>
        <p><b>Deliverables:</b> High-level design proposal to present at the scheduled interview.</p>
        <p><b>Duration:</b> Spend no more than 2 days to complete and deliver.</p>
      </section>

      <section className="card card-pad doc-section">
        <h2 className="section-title">2 · Feature Details Outline</h2>

        <h3>The game</h3>
        <ul>
          <li><b>Star 5</b>: the draw is 5 numbers of 40 plus a Star Ball (1–10); seven prize tiers up to the jackpot.</li>
          <li><b>The crew ticket grows</b>: every member adds a main number, so six players cover 11 numbers, and four or more unlock 3 Star Balls.</li>
          <li><b>Weekly Mega</b>: the headline draw. One big pot that grows with every crew that joins.</li>
          <li><b>Quick Draws</b>: smaller lotteries every 30 minutes; the next three (1.5 hours) are always on the home page.</li>
          <li><b>Multipliers</b>: every draw carries one (20x to 50x on Quick Draws, 100x to 500x on the Mega) for boosts.</li>
        </ul>

        <h3>Crews</h3>
        <ul>
          <li>Create a crew: name, mascot, vibe, privacy. Maximum six players.</li>
          <li>Invite your people: share link, 6-letter code, QR</li>
          <li>Discover &amp; join public crews, with full crews marked as such</li>
          <li>Crew records: luck %, total earnings, draws won</li>
          <li>Captain role: adds tickets and locks the entry for the draw</li>
        </ul>

        <h3>Playing together</h3>
        <ul>
          <li>Three-step join flow: tickets → crew → your share. Price appears only after the crew is picked, because the crew sets it.</li>
          <li>Equal shares: the ticket costs €4 plus €2 per extra member, split evenly, and everyone must pay before the entry can lock</li>
          <li>Boosts: money above your share pays back at the draw's multiplier, to you alone, on a top-tier win</li>
          <li>Readiness state on every entry ("4 of 6 paid"); at lock, unpaid members drop and the ticket shrinks to fit</li>
          <li>Quick picks or the captain's hand-picked numbers, sized to the crew</li>
          <li>Automatic equal split, credited straight to member wallets, on an append-only ledger</li>
          <li>Live draw theatre: skippable, screen-reader announced, with a full results &amp; split breakdown</li>
        </ul>

        <h3>Platform</h3>
        <ul>
          <li>Live activity ticker and simulated crew activity across the app</li>
          <li>Wallet with full movement history</li>
          <li>Two complete brand identities: playful night mode and an official “corporate” mode</li>
          <li>WCAG AAA accessibility, with an in-app accessibility hub</li>
        </ul>
      </section>

      <section className="card card-pad doc-section">
        <h2 className="section-title">3 · Platform Explanation &amp; Functionality</h2>

        <h3>The mental model</h3>
        <p>
          <b>Crews are persistent teams; entries are per-draw.</b> A crew is just people: friends, colleagues,
          neighbours. For each draw the crew opens a fresh entry with its own pot, tickets and ledger. You can play the
          same draw with several crews, and join a draw multiple times; the hero always shows where you're already in.
        </p>

        <h3>The crew ticket</h3>
        <p>
          Crew size is the core mechanic. The draw itself never changes: <b>5 numbers and 1 star</b> come out, and a
          ticket wins on how many of those land inside it, not on matching every number it holds. Every member adds one
          main number, so a solo player covers 6 numbers and a full crew of six covers <b>11 numbers plus 3 Star
          Balls</b>, giving the draw far more room to fall inside the ticket. The ticket costs €4 for one player and €2 more
          per extra member, capping at €14, and that price splits evenly. The result is the whole pitch in one line:
          <b> the bigger your crew, the more numbers you cover and the less each of you pays</b> (€4,00 alone, €2,34
          each at six).
        </p>

        <h3>Money: equal shares, personal boosts</h3>
        <p>
          There is no proportional ownership. Everyone pays the same mandatory share, so everyone takes the same cut of
          any win. On top of that sits the <b>boost</b>: money above your share is a personal side bet that pays back at
          the draw's multiplier (20x to 50x on Quick Draws, 100x to 500x on the Mega) if the crew lands 5 numbers or the
          jackpot. A €10 boost at 500x returns €5.000, to that member alone.
        </p>

        <h3>Entry lifecycle</h3>
        <p>
          <b>Open</b>: members pay their share; the entry shows who has and who has not. Adding tickets raises everyone's
          share equally, and the ledger says so. <b>Ready</b>: all members paid, the captain can lock. <b>Lock</b>:
          anyone who never paid is dropped and the ticket shrinks to the crew that did, with the surplus carried to the
          next pot. <b>Draw</b>: the live reveal (skippable, never on a timer you can't control). <b>Settlement</b>:
          winnings split equally to the cent, boosts paid on top where the tier allows, straight into member wallets.
        </p>

        <h3>Trust &amp; transparency</h3>
        <p>
          Every cent is on an append-only ledger: shares, boosts, tickets, locks, settlements. The Players tab shows
          exactly who has paid and who still owes; the results screen shows the full split table with equal cuts and
          boost payouts side by side. No treasurer, no spreadsheets, no arguments.
        </p>

        <h3>The live layer</h3>
        <p>
          The platform feels inhabited: a ticker streams recent wins and entries, pots tick upward with odometer-style
          count-ups, quick draws rotate on the half-hour, and your own entries show crewmates chipping in as it
          happens. In this prototype that activity is simulated client-side on a heartbeat.
        </p>

        <h3>Two identities, one product</h3>
        <p>
          The theme toggle switches between two complete brand worlds: a playful night-sky mode (gold, waves,
          sparkles) and a corporate mode modelled on official lottery portals: institutional blues, Inter typography,
          restrained chrome. Functionality is identical in both; only the personality changes.
        </p>

        <h3>Accessibility</h3>
        <p>
          Both themes hold WCAG AAA: 7:1 text contrast, full keyboard operability with visible focus, screen-reader
          semantics throughout, 44px touch targets, and comprehensive motion opt-outs. An accessibility hub in the
          header adds animation pause, text sizing, high contrast and reduced transparency, applied instantly.
        </p>

        <h3>About this prototype</h3>
        <p>
          Built as an interactive React + Vite prototype with dummy data: no backend, no real money, no real draws.
          The live behaviour (growing pots, crew activity, rollovers) is deterministic simulation, designed to make the
          Group Play concept tangible end-to-end, from creating a crew to watching the split hit your wallet.
        </p>
      </section>
    </div>
  )
}

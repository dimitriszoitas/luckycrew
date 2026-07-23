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
          <li><b>Star 5</b>: pick 5 of 40 numbers plus a Star Ball (1–10); seven prize tiers up to the jackpot.</li>
          <li><b>Weekly Mega</b>: the headline draw. One big pot that grows with every crew that joins.</li>
          <li><b>Quick Draws</b>: smaller lotteries every 30 minutes; the next three (1.5 hours) are always on the home page.</li>
          <li><b>Live pots</b>: every pot is visible at all times and rises in real time as crews join.</li>
        </ul>

        <h3>Crews</h3>
        <ul>
          <li>Create a crew: name, mascot, vibe, privacy</li>
          <li>Invite your people: share link, 6-letter code, QR</li>
          <li>Discover &amp; join public crews</li>
          <li>Crew records: luck %, total earnings, draws won</li>
          <li>Captain role: opens entries, converts the pot to tickets, locks the draw</li>
        </ul>

        <h3>Playing together</h3>
        <ul>
          <li>Three-step join flow: tickets → crew → stake</li>
          <li>Stake-based ownership: what you put in defines your cut of every win (no share units)</li>
          <li>Pot → tickets: quick picks or the captain's hand-picked numbers</li>
          <li>Automatic winnings split, credited straight to member wallets</li>
          <li>Append-only ledger on every entry, the trust anchor</li>
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

        <h3>Money &amp; ownership</h3>
        <p>
          There are no abstract “shares”. When you join, you choose how many tickets to add and a stake. The minimum
          simply covers your tickets (tickets × €0.50), and anything above it raises your cut. Your cut of every win is
          <b> your stake ÷ the crew's pot</b>, shown live as crewmates chip in, and locked the moment entries lock. The
          join flow deliberately labels it “your cut right now”: it never promises a number that other members'
          contributions could change.
        </p>

        <h3>Entry lifecycle</h3>
        <p>
          <b>Open</b>: any member adds money, any amount, any time; the pot and each member's percentage update live.
          <b> Tickets</b>: the captain converts unspent pot into tickets: instant quick picks or a manual number picker.
          <b> Lock</b>: ownership snapshot; no more changes. <b>Draw</b>: the live reveal (skippable, never on a
          timer you can't control). <b>Settlement</b>: winnings split proportionally to the cent, the rounding
          remainder carries into the crew's next pot, and every member's cut lands in their wallet instantly.
        </p>

        <h3>Trust &amp; transparency</h3>
        <p>
          Every cent is on an append-only ledger: contributions, ticket purchases, locks, settlements. The Stakes tab
          shows exactly who holds what percentage of the pot; the results screen shows the full split table. No
          treasurer, no spreadsheets, no arguments.
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

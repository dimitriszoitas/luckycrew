import React, { useState } from 'react'
import { useStore, nav } from '../store.jsx'
import { GAME, fmtEUR, fmtEUR2 } from '../game.js'
import { SizeLadder } from '../ui.jsx'

// ── Flow diagram ─────────────────────────────────────────────────────────────
// Labelled boxes joined by arrows: the step, what the user sees, in their order.

function Flow({ steps }) {
  return (
    <div className="flow">
      {steps.map((s, i) => (
        <React.Fragment key={s.title}>
          <div className={`flow-node ${s.on ? 'on' : ''}`}>
            <span className="flow-step">Step {i + 1}</span>
            <span className="flow-title">{s.title}</span>
            <span className="flow-text">{s.text}</span>
          </div>
          {i < steps.length - 1 && <div className="flow-arrow" aria-hidden="true">→</div>}
        </React.Fragment>
      ))}
    </div>
  )
}

function Track({ steps }) {
  return (
    <div className="track">
      {steps.map((s, i) => (
        <React.Fragment key={s.name}>
          <div className={`track-step ${s.key ? 'key' : ''}`}>
            <div className="track-pill">{s.name}</div>
            <div className="track-note">{s.note}</div>
          </div>
          {i < steps.length - 1 && <div className="flow-arrow" aria-hidden="true">→</div>}
        </React.Fragment>
      ))}
    </div>
  )
}

const Block = ({ title, children }) => (
  <div className="pres-block">
    {title && <h3>{title}</h3>}
    {children}
  </div>
)

const ReqList = ({ items }) => (
  <div className="req">
    {items.map(([t, h]) => (
      <div className="req-row" key={t}>
        <span className="req-tick" aria-hidden="true">✓</span>
        <div>
          <div className="req-title">{t}</div>
          <div className="req-how">{h}</div>
        </div>
      </div>
    ))}
  </div>
)

// ── Panels ───────────────────────────────────────────────────────────────────

function Brief() {
  return (
    <div className="pres-panel">
      <div className="pres-head">
        <h2>The assignment, exactly as it arrived</h2>
        <p>Reproduced verbatim, followed by the requirements I read out of it and treated as the minimum bar.</p>
      </div>

      <blockquote className="brief-quote">
        <div className="brief-kicker">Design Exercise</div>
        <h3 style={{ marginTop: 0 }}>Group Play for a Lottery Platform</h3>
        <p className="brief-label">Objective:</p>
        <p>
          Design a Group Play experience for a lottery website or mobile app.
          <br />
          Group Play allows multiple users to participate in the same ticket or set of tickets, increasing their
          chances of winning while sharing the cost.
        </p>
        <p>
          The goal is to create a simple and engaging experience that enables users to create or join groups, invite
          others, contribute to ticket purchases, track participation and ticket ownership, and automatically split
          winnings among members.
        </p>
        <p className="brief-label">Deliverables:</p>
        <p>High level design proposal to present at our scheduled interview.</p>
        <p className="brief-label">Duration:</p>
        <p>Spend no more than 2 days to complete and deliver.</p>
      </blockquote>

      <div className="pres-note" style={{ marginTop: 18 }}>
        <p>
          Due to the brief being broad and leaving almost everything up to me, I decided to work on the whole concept
          and answer as many design questions and decisions as possible, <b>including the branding</b>. There was no
          existing product to slot into, no brand to follow and no platform constraints, so treating it as a real
          product problem rather than a set of screens was the only way to make the decisions defensible.
        </p>
      </div>

      <Block title="The minimum bar, and the question each one opened">
        <ReqList
          items={[
            ['Create or join groups', 'How big is a group, who runs it, and what happens when it is full?'],
            ['Invite others', 'What does someone see before they commit, and what do they owe when they arrive?'],
            ['Contribute to ticket purchases', 'Does everyone pay the same, or whatever they feel like?'],
            ['Track participation and ownership', 'What does owning part of a shared ticket actually mean to a player?'],
            ['Split winnings automatically', 'Split by which rule, and at what moment does that rule become final?'],
            ['Increase chances by playing together', 'Is that just cost sharing, or can the group genuinely buy a better ticket?'],
            ['Simple and engaging', 'Which single mechanic makes this feel like play rather than admin?'],
            ['Web or mobile app', 'One responsive product, or two? It ships as one, from 375px upward.'],
          ]}
        />
        <p className="req-how" style={{ marginTop: 14 }}>
          The Concept tab answers each of these, and closes with how the finished design covers every line.
        </p>
      </Block>
    </div>
  )
}

function Approach() {
  const stages = [
    {
      n: '01',
      title: 'Read the brief, fix the bar',
      body: 'Pulled the eight requirements above out of two paragraphs, and decided what finished means before drawing anything.',
    },
    {
      n: '02',
      title: 'Concept and spec, in Claude chat',
      body: 'Many rounds back and forth to pressure test the concept, then a product specification document: the concept, the money model, the flows, and as much detail as the format allowed.',
    },
    {
      n: '03',
      title: 'First visual passes, in Claude Design',
      body: 'Fed the specification in markdown and generated the first screens, then revised through more chat rounds until the direction held together.',
    },
    {
      n: '04',
      title: 'Build and refine, in Claude Code',
      body: 'Once the direction was solid I moved it into Claude Code on desktop and iterated on the real thing: flows, copy, states, accessibility and both themes.',
    },
  ]
  return (
    <div className="pres-panel">
      <div className="pres-head">
        <h2>How this was made</h2>
        <p>Four stages, each one narrowing the problem. The tool changed when the question changed.</p>
      </div>

      <div className="pres-grid two">
        {stages.map(s => (
          <div className="pres-card" key={s.n}>
            <span className="pres-num">{s.n}</span>
            <h4>{s.title}</h4>
            <p>{s.body}</p>
          </div>
        ))}
      </div>

      <Block title="What changed along the way">
        <ul className="pres-list">
          <li><b>Ownership by stake was cut.</b> The first model gave you a percentage equal to your money divided by the pot. Accurate, hard to explain, and it punished whoever chipped in first. Equal shares replaced it.</li>
          <li><b>Crew size became the mechanic, not a detail.</b> Once every member added a number to the ticket, the group had a reason to exist beyond splitting a bill.</li>
          <li><b>Price moved out of step one.</b> Cost depends on how many of you play, so asking for the crew first makes the number honest when it finally appears.</li>
          <li><b>Boosts replaced put in more to win more.</b> A separate multiplier bet keeps the shared ticket fair while still rewarding appetite.</li>
          <li><b>Readiness became a first class state.</b> A group product has to show who is holding everyone else up.</li>
        </ul>
      </Block>

      <Block title="Prototype, not a deck">
        <p className="req-how">
          The deliverable is a working React prototype with simulated data: live pots, crewmates paying up on a
          heartbeat, a real draw and a real settlement. No backend, no real money, no real draws. Everything you can
          click here is the proposal.
        </p>
      </Block>
    </div>
  )
}

function Concept() {
  return (
    <div className="pres-panel">
      <div className="pres-head">
        <h2>The concept in one line</h2>
        <p>
          A crew is up to six people, and every member adds a number to the crew's ticket. The group is not just
          splitting a cost, it is buying a materially better ticket than any of them could alone.
        </p>
      </div>

      <Block title="The game">
        <div className="pres-grid">
          <div className="pres-card">
            <h4>{GAME.name}</h4>
            <p>The draw pulls <b>5 numbers of 40 plus 1 Star Ball</b>. It never changes shape.</p>
          </div>
          <div className="pres-card">
            <h4>You win by covering</h4>
            <p>A ticket wins on how many drawn numbers <b>land inside it</b>, not on matching every number it holds.</p>
          </div>
          <div className="pres-card">
            <h4>Two rhythms</h4>
            <p>A <b>Weekly Mega</b> rolling from {fmtEUR(GAME.jackpot)}, and <b>Quick Draws</b> every 30 minutes.</p>
          </div>
        </div>
      </Block>

      <Block title="Crew size is the whole product">
        <p className="req-how" style={{ marginBottom: 12 }}>
          One extra member means one extra main number, and four or more unlocks three Star Balls. The ticket price
          rises {fmtEUR2(GAME.perMate)} a head but splits further every time, so the biggest crew covers the most
          numbers for the least money each.
        </p>
        <SizeLadder highlight={GAME.maxCrew} />
      </Block>

      <Block title="The money model">
        <div className="lanes">
          <div className="lane share">
            <div className="lane-tag">Share · mandatory</div>
            <p className="req-how">Everyone pays the same amount, so everyone owns the same thing. No percentages, no treasurer, no arguments about who put in what.</p>
            <div className="lane-flow">
              <span>Ticket cost splits evenly across the crew</span>
              <span>The entry locks only when everyone has paid</span>
              <span>Any win splits equally, to the cent</span>
              <span>Credited to each wallet instantly</span>
            </div>
          </div>
          <div className="lane boost">
            <div className="lane-tag">Boost · optional</div>
            <p className="req-how">Appetite has somewhere to go without unbalancing the shared ticket. A boost is a personal side bet at the draw's multiplier.</p>
            <div className="lane-flow">
              <span>Money on top of your share, yours alone</span>
              <span>Quick Draws pay 20x to 50x, the Mega 100x to 500x</span>
              <span>Pays out only on 5 numbers or the jackpot</span>
              <span>Never changes anyone else's cut</span>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Where the concept meets the brief">
        <ReqList
          items={[
            ['Same ticket, multiple users', 'Every paid member plays every number on every ticket in the entry. The Tickets tab states it, the results table proves it.'],
            ['Increases chances of winning', 'Not a slogan here: six players cover 11 numbers and 3 stars instead of 5 and 1. The crew size table quantifies it.'],
            ['Shares the cost', 'The ticket price splits evenly, and the cost per head falls as the crew grows, from €4,00 alone to €2,34 each at six.'],
            ['Create or join groups', 'Create a crew in one screen, or join a public crew from the discover list. Full crews are marked as full.'],
            ['Invite others', 'Link, six letter code and QR on the crew page, plus a preview of exactly what the invitee sees.'],
            ['Contribute to purchases', 'Pay my share on the entry, or the third step of the join flow. Adding tickets raises everyone’s share and says so on the ledger.'],
            ['Track participation and ownership', 'A readiness bar with a face per member, a Players tab splitting paid from unpaid, and an append only ledger.'],
            ['Split winnings automatically', 'Settlement runs at the end of the draw, splits equally, pays boosts where the tier allows, and lands in wallets with no action needed.'],
          ]}
        />
      </Block>
    </div>
  )
}

function Flows() {
  return (
    <div className="pres-panel">
      <div className="pres-head">
        <h2>The flows</h2>
        <p>Four paths carry the whole product. Each is built to ask one question per screen.</p>
      </div>

      <Block title="1 · Join a lottery">
        <Flow
          steps={[
            { title: 'Pick a draw', text: 'The Mega hero or one of the Quick Draw cards. The multiplier is on both.' },
            { title: 'How many tickets', text: 'A stepper and nothing else. No price yet, because the crew has not been chosen.' },
            { title: 'Which crew', text: 'Each crew row reveals its numbers, its stars and the price per head.', on: true },
            { title: 'Your share and boost', text: 'The mandatory share is fixed. The optional boost is the only number you can move.' },
            { title: 'You are in', text: 'Lands on the crew entry with readiness, tickets and the ledger updated.' },
          ]}
        />
        <ul className="pres-list" style={{ marginTop: 12 }}>
          <li>The draw stays pinned as a hero across all three steps, so you never lose track of what you are buying into.</li>
          <li>Money appears only after the crew is chosen, because the crew is what determines it.</li>
          <li>The share is shown as fixed and not editable. The boost is the only number you can move.</li>
        </ul>
      </Block>

      <Block title="2 · Start a crew and fill the seats">
        <Flow
          steps={[
            { title: 'Give it an identity', text: 'Name, mascot, vibe and privacy on one screen.' },
            { title: 'Choose your size', text: 'Six selectable tiles show what each crew size buys, and what it costs each.', on: true },
            { title: 'Crew page', text: 'Free seats are drawn as real rows, so what is missing is always visible.' },
            { title: 'Invite your people', text: 'Share link, six letter code or QR, with a preview of what they will see.' },
            { title: 'The ticket grows', text: 'Every open entry gains a number the moment someone joins, on the ledger.', on: true },
          ]}
        />
        <ul className="pres-list" style={{ marginTop: 12 }}>
          <li>The size explainer sits inside the create flow, at the exact moment you decide how many people to invite.</li>
          <li>Empty seats are drawn as rows, so the crew page always shows what you are missing.</li>
          <li>A crewmate joining mid entry grows every open ticket by a number, live, and the ledger records it.</li>
        </ul>
      </Block>

      <Block title="3 · The entry lifecycle">
        <Track
          steps={[
            { name: 'Open', note: 'Members pay their equal share. Adding tickets raises it for everyone.' },
            { name: 'Ready', key: true, note: 'All members paid. Only now can the captain lock.' },
            { name: 'Locked', note: 'Anyone unpaid is dropped and the ticket shrinks to fit the crew that paid.' },
            { name: 'Draw', note: 'Live reveal, skippable, announced for screen readers.' },
            { name: 'Settled', key: true, note: 'Equal split to the cent, boosts on top where the tier allows.' },
            { name: 'Wallet', note: 'Every cut lands instantly, with a matching ledger line.' },
          ]}
        />
        <ul className="pres-list" style={{ marginTop: 12 }}>
          <li>Readiness is the state the first model was missing: a group product needs to show who is holding it up.</li>
          <li>Dropping unpaid members at lock stops one silent crewmate freezing everyone out of the draw.</li>
          <li>Surplus from a shrunk ticket carries into the crew's next pot rather than vanishing.</li>
        </ul>
      </Block>

    </div>
  )
}

function Design() {
  return (
    <div className="pres-panel">
      <div className="pres-head">
        <h2>Two design directions</h2>
        <p>
          The brief named no brand, so rather than invent one and hope, I built two complete identities. Same product,
          same flows, same components. Only the personality changes, and the toggle in the header switches between
          them live.
        </p>
      </div>

      <div className="dir-grid">
        <div className="pres-card">
          <h4>Direction A · Playful night</h4>
          <div className="swatches" aria-hidden="true">
            <i style={{ background: '#0f0f2d' }} />
            <i style={{ background: '#1c1c3a' }} />
            <i style={{ background: '#fbbf24' }} />
            <i style={{ background: '#4f5fe8' }} />
          </div>
          <ul>
            <li>For a consumer, social, mobile first audience.</li>
            <li>Gold on midnight, Baloo 2 display type, generous radii.</li>
            <li>Sparkles, waves, count ups, a golden slab under the hero.</li>
            <li>The pot is the loudest thing on the page.</li>
          </ul>
        </div>
        <div className="pres-card">
          <h4>Direction B · Corporate official</h4>
          <div className="swatches" aria-hidden="true">
            <i style={{ background: '#ecf8fc' }} />
            <i style={{ background: '#ffffff' }} />
            <i style={{ background: '#0e5673' }} />
            <i style={{ background: '#ff9d00' }} />
          </div>
          <ul>
            <li>Modelled on official state lottery portals.</li>
            <li>Institutional navy and teal, Inter throughout, tight radii.</li>
            <li>Restrained motion, flat surfaces, high trust tone.</li>
            <li>The same numbers, presented as a public service.</li>
          </ul>
        </div>
      </div>

      <Block title="The same screens, both ways">
        <div className="dir-grid">
          <figure className="shot">
            <img src="shots/home-dark.png" alt="Home screen in the playful night direction: gold pot on a midnight background" loading="lazy" />
            <figcaption className="shot-cap">Home · playful night</figcaption>
          </figure>
          <figure className="shot">
            <img src="shots/home-light.png" alt="Home screen in the corporate direction: navy and white, institutional layout" loading="lazy" />
            <figcaption className="shot-cap">Home · corporate</figcaption>
          </figure>
          <figure className="shot">
            <img src="shots/entry-dark.png" alt="Crew entry screen in the playful night direction" loading="lazy" />
            <figcaption className="shot-cap">Crew entry · playful night</figcaption>
          </figure>
          <figure className="shot">
            <img src="shots/entry-light.png" alt="Crew entry screen in the corporate direction" loading="lazy" />
            <figcaption className="shot-cap">Crew entry · corporate</figcaption>
          </figure>
        </div>
      </Block>

      <Block title="Why two, and not one">
        <ul className="pres-list">
          <li><b>It answers a question the brief left open.</b> Group Play sells differently to a social audience than to a state operator's existing customers.</li>
          <li><b>It proves the system, not the skin.</b> Every component takes colour, radius, typography and motion from tokens, so a third direction is a variable change.</li>
          <li><b>It stress tests contrast.</b> Holding AAA in both a dark and a light identity is a far harder constraint than passing once.</li>
        </ul>
      </Block>
    </div>
  )
}

function Accessibility() {
  return (
    <div className="pres-panel">
      <div className="pres-head">
        <h2>Accessibility</h2>
        <p>Both directions are built to WCAG 2.1 AAA rather than AA. Lottery products reach everyone, including people who will never touch a mouse.</p>
      </div>

      <div className="pres-grid">
        <div className="pres-card">
          <h4>Contrast</h4>
          <ul>
            <li>7:1 on body text in both themes.</li>
            <li>Gold, money and status colours retuned per theme rather than reused.</li>
            <li>A high contrast mode strengthens borders and lifts secondary text further.</li>
          </ul>
        </div>
        <div className="pres-card">
          <h4>Keyboard</h4>
          <ul>
            <li>Every action reachable, with a visible focus ring.</li>
            <li>Clickable cards take Enter and Space without stealing keys from nested buttons.</li>
            <li>Modals trap focus, close on Escape, and return focus to the opener.</li>
          </ul>
        </div>
        <div className="pres-card">
          <h4>Screen readers</h4>
          <ul>
            <li>Ball rows are single images with a spoken label, including which numbers matched.</li>
            <li>Countdowns are timers, toasts are polite live regions, stake changes are announced.</li>
            <li>Decorative sparkles, confetti and waves are hidden from the tree.</li>
          </ul>
        </div>
        <div className="pres-card">
          <h4>Motion</h4>
          <ul>
            <li>prefers-reduced-motion is honoured everywhere.</li>
            <li>An in app switch pauses decorative motion regardless of the system setting.</li>
            <li>The draw reveal is skippable and never runs on a timer you cannot control.</li>
          </ul>
        </div>
        <div className="pres-card">
          <h4>Targets and text</h4>
          <ul>
            <li>44px minimum on every interactive element, including the small steppers.</li>
            <li>Text size control at normal, large and extra large.</li>
            <li>Layouts hold from 375px upward with no horizontal scrolling.</li>
          </ul>
        </div>
        <div className="pres-card">
          <h4>The accessibility hub</h4>
          <ul>
            <li>One panel in the header: motion, text size, contrast, transparency.</li>
            <li>Applies instantly and stays on while you browse.</li>
            <li>Built as a product feature, not a settings page nobody finds.</li>
          </ul>
        </div>
      </div>

      <div className="pres-note" style={{ marginTop: 18 }}>
        <p>
          <b>Reduce transparency</b> earns its place. The playful direction leans on blur and glass, which is a
          readability problem for some people and a performance problem on older devices. One switch swaps every
          blurred surface for a solid one without changing the layout.
        </p>
      </div>
    </div>
  )
}

const TABS = [
  ['brief', 'Brief', Brief],
  ['approach', 'Approach', Approach],
  ['concept', 'Concept', Concept],
  ['flows', 'Flows', Flows],
  ['design', 'Design', Design],
  ['a11y', 'Accessibility', Accessibility],
]

export default function ExerciseDetails() {
  const { dispatch } = useStore()
  const [tab, setTab] = useState('brief')
  const Panel = TABS.find(t => t[0] === tab)[2]
  return (
    <div className="container doc" style={{ maxWidth: 1040 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'home' })}>← Home</button>
      <h1 style={{ fontSize: 32, margin: '6px 0 6px' }}>Exercise Details</h1>
      <p className="doc-lead">
        The brief, how I worked through it, the concept it produced, and the decisions behind it.
      </p>

      <div className="pres-tabs">
        <div className="tabs" role="tablist" aria-label="Exercise sections">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              className={`tab ${tab === key ? 'active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card card-pad" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={-1}>
        <Panel />
      </div>

      <div style={{ height: 40 }} />
    </div>
  )
}

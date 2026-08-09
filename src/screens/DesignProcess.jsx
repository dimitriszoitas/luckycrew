import React from 'react'
import { useStore, nav } from '../store.jsx'

// How the brief was read, unpacked and turned into a design direction.
export default function DesignProcess() {
  const { dispatch } = useStore()
  return (
    <div className="container doc" style={{ maxWidth: 860 }}>
      <button className="back-link" onClick={() => nav(dispatch, { name: 'home' })}>← Home</button>
      <h1 style={{ fontSize: 32, margin: '6px 0 6px' }}>Design Process</h1>
      <p className="doc-lead">
        The route from the brief to the prototype: what was asked, how it was interpreted, and the decisions taken along
        the way.
      </p>

      <section className="card card-pad doc-section">
        <h2 className="section-title">1 · Brief</h2>
        <p>The assignment exactly as it was handed over:</p>

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
      </section>
    </div>
  )
}

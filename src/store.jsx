import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { GAME, quickPick, growTicket, settleDraw, shareFor, ticketPrice, rollMultiplier, mainCount, starCount, fmtEUR2 } from './game.js'

// ── People ───────────────────────────────────────────────────────────────────

export const YOU = { id: 'you', name: 'Jim', avatar: '😎' }

const BOTS = [
  { id: 'b1', name: 'Maria K.', avatar: '🦊' },
  { id: 'b2', name: 'Nikos P.', avatar: '🐙' },
  { id: 'b3', name: 'Elena V.', avatar: '🦄' },
  { id: 'b4', name: 'Kostas D.', avatar: '🐸' },
  { id: 'b5', name: 'Sofia L.', avatar: '🐼' },
  { id: 'b6', name: 'Alex T.', avatar: '🦁' },
  { id: 'b7', name: 'Dora M.', avatar: '🐨' },
  { id: 'b8', name: 'Petros G.', avatar: '🐯' },
]

let _id = 100
export const uid = p => `${p}${_id++}`

const now = Date.now()
const ago = mins => now - mins * 60000

export const NEXT_DRAW = 214

// Platform draw schedule: one weekly Mega + a Quick Draw every 30 minutes
const HALF_HOUR = 30 * 60000
const firstSlot = Math.ceil(now / HALF_HOUR) * HALF_HOUR

// ── Seed: crews are reusable teams, lotteries are per-draw entries ──────────

function seedCrews() {
  return [
    {
      id: 'c-office',
      name: 'Office Legends',
      emoji: '🚀',
      color: 'violet',
      privacy: 'private',
      captainId: 'you',
      record: { played: 8, won: 2, earned: 940 },
      members: [
        { ...YOU, joinedAt: ago(30000) },
        { ...BOTS[0], joinedAt: ago(29000) },
        { ...BOTS[1], joinedAt: ago(28000) },
        { ...BOTS[2], joinedAt: ago(14000) },
        { ...BOTS[3], joinedAt: ago(3000) },
      ],
    },
    {
      id: 'c-fam',
      name: 'Friday Fam',
      emoji: '🍀',
      color: 'lime',
      privacy: 'private',
      captainId: 'b4',
      record: { played: 14, won: 3, earned: 210 },
      members: [
        { ...BOTS[3], joinedAt: ago(90000) },
        { ...YOU, joinedAt: ago(88000) },
        { ...BOTS[4], joinedAt: ago(80000) },
      ],
    },
    {
      id: 'c-gym',
      name: 'Gym Rats',
      emoji: '🏋️',
      color: 'cyan',
      privacy: 'private',
      captainId: 'b6',
      record: { played: 5, won: 1, earned: 75 },
      members: [
        { ...BOTS[5], joinedAt: ago(70000) },
        { ...YOU, joinedAt: ago(66000) },
        { ...BOTS[2], joinedAt: ago(40000) },
      ],
    },
    {
      id: 'c-block',
      name: 'Block 12 Neighbours',
      emoji: '🏘️',
      color: 'amber',
      privacy: 'private',
      captainId: 'you',
      record: { played: 2, won: 0, earned: 0 },
      members: [
        { ...YOU, joinedAt: ago(20000) },
        { ...BOTS[7], joinedAt: ago(18000) },
      ],
    },
    {
      id: 'c-uni',
      name: 'Uni Alumni',
      emoji: '🎓',
      color: 'violet',
      privacy: 'private',
      captainId: 'b2',
      record: { played: 19, won: 4, earned: 480 },
      members: [
        { ...BOTS[1], joinedAt: ago(200000) },
        { ...BOTS[6], joinedAt: ago(150000) },
        { ...YOU, joinedAt: ago(120000) },
      ],
    },
    {
      id: 'c-pub1',
      name: 'Jackpot Chasers',
      emoji: '⚡',
      color: 'cyan',
      privacy: 'public',
      captainId: 'b5',
      record: { played: 40, won: 11, earned: 3120 },
      members: [
        { ...BOTS[4], joinedAt: ago(50000) },
        { ...BOTS[5], joinedAt: ago(44000) },
        { ...BOTS[6], joinedAt: ago(43000) },
        { ...BOTS[7], joinedAt: ago(21000) },
      ],
    },
    {
      id: 'c-pub2',
      name: 'Moonshot Mondays',
      emoji: '🌙',
      color: 'pink',
      privacy: 'public',
      captainId: 'b6',
      record: { played: 6, won: 1, earned: 90 },
      members: [
        { ...BOTS[5], joinedAt: ago(60000) },
        { ...BOTS[6], joinedAt: ago(55000) },
      ],
    },
    {
      id: 'c-pub3',
      name: 'Golden Tickets',
      emoji: '🎫',
      color: 'amber',
      privacy: 'public',
      captainId: 'b7',
      record: { played: 62, won: 19, earned: 5480 },
      members: [
        { ...BOTS[6], joinedAt: ago(120000) },
        { ...BOTS[7], joinedAt: ago(110000) },
        { ...BOTS[0], joinedAt: ago(90000) },
        { ...BOTS[1], joinedAt: ago(70000) },
        { ...BOTS[2], joinedAt: ago(30000) },
      ],
    },
    {
      id: 'c-pub4',
      name: 'Night Owls',
      emoji: '🦉',
      color: 'violet',
      privacy: 'public',
      captainId: 'b8',
      record: { played: 23, won: 5, earned: 610 },
      members: [
        { ...BOTS[7], joinedAt: ago(80000) },
        { ...BOTS[2], joinedAt: ago(60000) },
        { ...BOTS[4], joinedAt: ago(20000) },
      ],
    },
    {
      id: 'c-pub5',
      name: 'Rollover Club',
      emoji: '🌀',
      color: 'cyan',
      privacy: 'public',
      captainId: 'b1',
      record: { played: 31, won: 8, earned: 1495 },
      members: [
        { ...BOTS[0], joinedAt: ago(150000) },
        { ...BOTS[3], joinedAt: ago(140000) },
        { ...BOTS[5], joinedAt: ago(50000) },
        { ...BOTS[6], joinedAt: ago(10000) },
      ],
    },
    {
      id: 'c-pub6',
      name: 'Break Room Bandits',
      emoji: '🍩',
      color: 'pink',
      privacy: 'public',
      captainId: 'b3',
      record: { played: 12, won: 2, earned: 165 },
      members: [
        { ...BOTS[2], joinedAt: ago(40000) },
        { ...BOTS[1], joinedAt: ago(35000) },
      ],
    },
  ]
}

// Shares are the mandatory equal minimum; boosts are the optional side bet.
const entryOf = ({ id, crewId, drawNo, size, tickets, status = 'open', contributions = {}, boosts = {}, multiplier, ledger }) => ({
  id, crewId, drawNo, status,
  crewSize: size,
  multiplier,
  contributions,
  boosts,
  tickets: Array.from({ length: tickets }, () => ({ id: uid('t'), ...quickPick(size), source: 'Quick pick' })),
  ledger,
  result: null,
  settlement: null,
})

function seedLotteries(crews) {
  const office = crews[0]

  // Ongoing: Office Legends in draw 214 · 5 members, 2 tickets, €4.80 each
  const lOffice = entryOf({
    id: 'l-office-214', crewId: 'c-office', drawNo: 214, size: 5, tickets: 2, multiplier: 300,
    contributions: { you: 4.8, b1: 4.8, b2: 4.8 },
    boosts: { b1: 5 },
    ledger: [
      { id: uid('l'), t: ago(3200), icon: '🎟️', text: 'Office Legends entered draw #214 with 2 tickets' },
      { id: uid('l'), t: ago(3100), icon: '💶', text: 'Maria K. paid their share (€4,80)' },
      { id: uid('l'), t: ago(2900), icon: '💶', text: 'Nikos P. paid their share (€4,80)' },
      { id: uid('l'), t: ago(2800), icon: '💶', text: 'Jim paid their share (€4,80)' },
      { id: uid('l'), t: ago(1380), icon: '🚀', text: 'Maria K. boosted €5,00 at 300x' },
    ],
  })

  // Ongoing: Friday Fam in draw 214 · 3 members, 1 ticket, €2.67 each
  const lFam = entryOf({
    id: 'l-fam-214', crewId: 'c-fam', drawNo: 214, size: 3, tickets: 1, multiplier: 200,
    contributions: { b4: 2.67, you: 2.67 },
    ledger: [
      { id: uid('l'), t: ago(9000), icon: '🎟️', text: 'Friday Fam entered draw #214 with 1 ticket' },
      { id: uid('l'), t: ago(8900), icon: '💶', text: 'Kostas D. paid their share (€2,67)' },
      { id: uid('l'), t: ago(8800), icon: '💶', text: 'Jim paid their share (€2,67)' },
    ],
  })

  // Ongoing: Gym Rats in draw 214 · 3 members, 2 tickets, fully paid up
  const lGym = entryOf({
    id: 'l-gym-214', crewId: 'c-gym', drawNo: 214, size: 3, tickets: 2, multiplier: 500,
    contributions: { b6: 5.34, you: 5.34, b3: 5.34 },
    boosts: { you: 5, b3: 2.5 },
    ledger: [
      { id: uid('l'), t: ago(6000), icon: '🎟️', text: 'Gym Rats entered draw #214 with 2 tickets' },
      { id: uid('l'), t: ago(5800), icon: '💶', text: 'Alex T. paid their share (€5,34)' },
      { id: uid('l'), t: ago(5600), icon: '💶', text: 'Jim paid their share (€5,34)' },
      { id: uid('l'), t: ago(5000), icon: '💶', text: 'Elena V. paid their share (€5,34)' },
      { id: uid('l'), t: ago(4900), icon: '🚀', text: 'Jim boosted €5,00 at 500x' },
      { id: uid('l'), t: ago(4800), icon: '✅', text: 'All 3 members paid. Ready to lock' },
    ],
  })

  // Ongoing: Uni Alumni in draw 214 · 3 members, 1 ticket, fully paid up
  const lUni = entryOf({
    id: 'l-uni-214', crewId: 'c-uni', drawNo: 214, size: 3, tickets: 1, multiplier: 100,
    contributions: { b2: 2.67, you: 2.67, b7: 2.67 },
    boosts: { b2: 10 },
    ledger: [
      { id: uid('l'), t: ago(7500), icon: '🎟️', text: 'Uni Alumni entered draw #214 with 1 ticket' },
      { id: uid('l'), t: ago(7300), icon: '💶', text: 'Nikos P. paid their share (€2,67)' },
      { id: uid('l'), t: ago(7100), icon: '💶', text: 'Jim paid their share (€2,67)' },
      { id: uid('l'), t: ago(6900), icon: '💶', text: 'Dora M. paid their share (€2,67)' },
      { id: uid('l'), t: ago(6800), icon: '🚀', text: 'Nikos P. boosted €10,00 at 100x' },
    ],
  })

  // Ongoing: Block 12 Neighbours in draw 214 · 2 members, 2 tickets, one unpaid
  const lBlock = entryOf({
    id: 'l-block-214', crewId: 'c-block', drawNo: 214, size: 2, tickets: 2, multiplier: 400,
    contributions: { you: 6 },
    ledger: [
      { id: uid('l'), t: ago(4200), icon: '🎟️', text: 'Block 12 Neighbours entered draw #214 with 2 tickets' },
      { id: uid('l'), t: ago(4000), icon: '💶', text: 'Jim paid their share (€6,00)' },
    ],
  })

  // Completed: Office Legends won €150 in draw 213 (5 members: 10 numbers + 3 stars)
  const result213 = { nums: [3, 9, 14, 22, 31], star: 6 }
  const tickets213 = [
    // 4 of the 5 drawn numbers, no star: €150
    { id: uid('t'), nums: [3, 5, 9, 14, 17, 22, 26, 33, 38, 40], stars: [2, 7, 9], source: 'Quick pick' },
    { id: uid('t'), nums: [1, 4, 8, 12, 18, 25, 27, 30, 33, 36], stars: [3, 5, 8], source: "Captain's pick" },
  ]
  const lOffice213 = {
    id: 'l-office-213',
    crewId: 'c-office',
    drawNo: 213,
    status: 'settled',
    crewSize: 5,
    multiplier: 200,
    contributions: { you: 4.8, b1: 4.8, b2: 4.8, b3: 4.8 },
    boosts: { b1: 5 },
    tickets: tickets213,
    ledger: [
      { id: uid('l'), t: ago(11000), icon: '🎟️', text: 'Office Legends entered draw #213 with 2 tickets' },
      { id: uid('l'), t: ago(10600), icon: '✅', text: '4 members paid their share (€4,80 each)' },
      { id: uid('l'), t: ago(10200), icon: '🔒', text: 'Entries locked. Elena V. dropped, ticket resized to 4 players' },
      { id: uid('l'), t: ago(10000), icon: '🏆', text: 'Draw #213 settled. Crew won €150,00' },
      { id: uid('l'), t: ago(10000), icon: '⚡', text: 'Winnings split equally across 4 members' },
    ],
    result: result213,
    settlement: null, // filled below
  }
  lOffice213.settlement = settleDraw(lOffice213, office, result213)

  // Completed: Friday Fam won nothing in draw 212 (3 members: 8 numbers + 1 star)
  const result212 = { nums: [6, 12, 19, 27, 35], star: 3 }
  const lFam212 = {
    id: 'l-fam-212',
    crewId: 'c-fam',
    drawNo: 212,
    status: 'settled',
    crewSize: 3,
    multiplier: 100,
    contributions: { b4: 2.67, you: 2.67, b5: 2.67 },
    boosts: {},
    tickets: [
      { id: uid('t'), nums: [1, 6, 15, 21, 24, 30, 34, 39], stars: [8], source: 'Quick pick' },
      { id: uid('t'), nums: [4, 9, 13, 19, 22, 28, 31, 37], stars: [1], source: 'Quick pick' },
    ],
    ledger: [
      { id: uid('l'), t: ago(20000), icon: '🎟️', text: 'Friday Fam entered draw #212 with 2 tickets' },
      { id: uid('l'), t: ago(19000), icon: '✅', text: 'All 3 members paid their share (€2,67 each)' },
      { id: uid('l'), t: ago(18500), icon: '💜', text: 'Draw #212 settled. No winning tickets this time' },
    ],
    result: result212,
    settlement: null,
  }
  lFam212.settlement = settleDraw(lFam212, crews[1], result212)

  return [lOffice, lFam, lGym, lUni, lBlock, lOffice213, lFam212]
}

const seededCrews = seedCrews()

const initialState = {
  // ?theme=light opens straight into the corporate direction, which makes the
  // two design directions shareable as links and screenshottable side by side
  theme: new URLSearchParams(window.location.search).get('theme') === 'light' ? 'light' : 'dark',
  route: { name: 'home' },
  wallet: {
    balance: 1500,
    txns: [
      { id: uid('x'), t: ago(100000), label: 'Top-up', amount: 1500 },
      { id: uid('x'), t: ago(19500), label: 'Friday Fam · draw #212 · share', amount: -2.67 },
      { id: uid('x'), t: ago(11000), label: 'Office Legends · draw #213 · share', amount: -4.8 },
      { id: uid('x'), t: ago(10000), label: 'Office Legends · draw #213 winnings 🏆', amount: 37.5 },
      { id: uid('x'), t: ago(8800), label: 'Friday Fam · draw #214 · share', amount: -2.67 },
      { id: uid('x'), t: ago(5600), label: 'Gym Rats · draw #214 · share', amount: -5.34 },
      { id: uid('x'), t: ago(4900), label: 'Gym Rats · draw #214 · boost 500x', amount: -5 },
      { id: uid('x'), t: ago(2800), label: 'Office Legends · draw #214 · share', amount: -4.8 },
      { id: uid('x'), t: ago(1000), label: 'Top-up', amount: 4 },
    ],
  },
  crews: seededCrews,
  lotteries: seedLotteries(seededCrews),
  drawCloses: now + 1000 * 60 * 47 + 1000 * 12,
  // Live events: pots grow as crews join (simulated by the potTick action)
  // The Mega rolls over: it starts at the game's floor and climbs until it's hit
  mega: { pot: GAME.jackpot, crews: 1872, multiplier: 300, rollovers: 3 },
  quickDraws: [
    { id: 'q0', drawNo: 1041, closesAt: firstSlot, pot: 342.5, crews: 47, joined: 0, multiplier: 50 },
    { id: 'q1', drawNo: 1042, closesAt: firstSlot + HALF_HOUR, pot: 180, crews: 23, joined: 0, multiplier: 30 },
    { id: 'q2', drawNo: 1043, closesAt: firstSlot + 2 * HALF_HOUR, pot: 95, crews: 11, joined: 0, multiplier: 20 },
  ],
  toast: null,
  joinLottery: null,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export const crewById = (state, id) => state.crews.find(c => c.id === id)
export const lotteryById = (state, id) => state.lotteries.find(l => l.id === id)
const sum = o => Object.values(o || {}).reduce((s, n) => s + n, 0)
export const sharesTotal = l => Math.round(sum(l.contributions) * 100) / 100
export const boostsTotal = l => Math.round(sum(l.boosts) * 100) / 100
export const potTotal = l => Math.round((sum(l.contributions) + sum(l.boosts)) * 100) / 100

// The crew size an entry is priced at: live headcount while open, frozen at lock
export const entrySize = (state, l) => {
  if (l.crewSize && l.status !== 'open') return l.crewSize
  const crew = crewById(state, l.crewId)
  return Math.min(GAME.maxCrew, crew?.members.length || l.crewSize || 1)
}
// What every member owes for this entry: ticket price x tickets, split equally
export const shareDue = (state, l) => shareFor(entrySize(state, l), Math.max(1, l.tickets.length))
export const ticketCost = (state, l) => Math.round(ticketPrice(entrySize(state, l)) * l.tickets.length * 100) / 100
export const hasPaid = (state, l, memberId) => (l.contributions[memberId] || 0) + 0.001 >= shareDue(state, l)
export const paidMembers = (state, l) => {
  const crew = crewById(state, l.crewId)
  return (crew?.members || []).filter(m => hasPaid(state, l, m.id))
}
export const unpaidMembers = (state, l) => {
  const crew = crewById(state, l.crewId)
  return (crew?.members || []).filter(m => !hasPaid(state, l, m.id))
}
export const isReady = (state, l) => unpaidMembers(state, l).length === 0
export const crewIsFull = crew => crew.members.length >= GAME.maxCrew
export const ongoingForCrew = (state, crewId) =>
  state.lotteries.find(l => l.crewId === crewId && l.status !== 'settled')
export const nextDrawFor = (state, crewId) => {
  const nums = state.lotteries.filter(l => l.crewId === crewId).map(l => l.drawNo)
  return nums.length ? Math.max(NEXT_DRAW, Math.max(...nums) + 1) : NEXT_DRAW
}
export const isMemberOf = crew => crew.members.some(m => m.id === 'you')
// Luck = share of draws this crew has played that ended in a win.
// Base record covers history before the demo seed; settled lotteries in state add on top.
export const crewLuck = (state, crewId) => {
  const crew = crewById(state, crewId)
  const settled = state.lotteries.filter(l => l.crewId === crewId && l.status === 'settled')
  const played = (crew.record?.played || 0) + settled.length
  const won = (crew.record?.won || 0) + settled.filter(l => (l.settlement?.totalWon || 0) > 0).length
  return { played, won, pct: played ? Math.round((won / played) * 100) : 0 }
}
// All-time crew winnings: base record + settled lotteries in state
export const crewEarnings = (state, crewId) => {
  const crew = crewById(state, crewId)
  const settled = state.lotteries.filter(l => l.crewId === crewId && l.status === 'settled')
  const inState = settled.reduce((s, l) => s + (l.settlement?.totalWon || 0), 0)
  return Math.round(((crew.record?.earned || 0) + inState) * 100) / 100
}

// ── Reducer ──────────────────────────────────────────────────────────────────

function withLedger(lottery, icon, text) {
  return { ...lottery, ledger: [...lottery.ledger, { id: uid('l'), t: Date.now(), icon, text }] }
}

function updateLottery(state, lotteryId, fn) {
  return { ...state, lotteries: state.lotteries.map(l => (l.id === lotteryId ? fn(l) : l)) }
}

function updateCrew(state, crewId, fn) {
  return { ...state, crews: state.crews.map(c => (c.id === crewId ? fn(c) : c)) }
}

// A new member means a new number on every ticket of every open entry
function growOpenEntries(state, crewId, memberName) {
  const crew = crewById(state, crewId)
  const size = Math.min(GAME.maxCrew, crew.members.length)
  return {
    ...state,
    lotteries: state.lotteries.map(l => {
      if (l.crewId !== crewId || l.status !== 'open' || !l.tickets.length) return l
      const grown = { ...l, crewSize: size, tickets: l.tickets.map(t => growTicket(t, size)) }
      return withLedger(
        grown,
        '➕',
        `${memberName} joined. Tickets grew to ${mainCount(size)} numbers + ${starCount(size)} star${starCount(size) > 1 ? 's' : ''}, share is now ${fmtEUR2(shareFor(size, l.tickets.length))}`
      )
    }),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'nav':
      return { ...state, route: action.route, joinLottery: null }
    case 'theme':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' }
    case 'toast':
      return { ...state, toast: action.toast }
    case 'openJoinLottery':
      return { ...state, joinLottery: { crewId: action.crewId || null, eventId: action.eventId || null } }
    case 'closeJoinLottery':
      return { ...state, joinLottery: null }

    case 'createCrew': {
      const crew = {
        ...action.crew,
        id: uid('c'),
        captainId: 'you',
        record: { played: 0, won: 0, earned: 0 },
        members: [{ ...YOU, joinedAt: Date.now() }],
      }
      return { ...state, crews: [crew, ...state.crews], joinLottery: null, route: { name: 'crew', crewId: crew.id, justCreated: true } }
    }

    case 'joinCrew': {
      const target = crewById(state, action.crewId)
      if (!target || (crewIsFull(target) && !target.members.some(m => m.id === 'you'))) return state
      let s = updateCrew(state, action.crewId, c => {
        if (c.members.some(m => m.id === 'you')) return c
        return { ...c, members: [...c.members, { ...YOU, joinedAt: Date.now() }] }
      })
      s = growOpenEntries(s, action.crewId, YOU.name)
      return { ...s, route: { name: 'crew', crewId: action.crewId } }
    }

    case 'friendJoins': {
      const crew = crewById(state, action.crewId)
      if (crewIsFull(crew)) return state
      const existing = new Set(crew.members.map(m => m.id))
      const candidate = BOTS.find(b => !existing.has(b.id))
      if (!candidate) return state
      const s = updateCrew(state, action.crewId, c => ({ ...c, members: [...c.members, { ...candidate, joinedAt: Date.now() }] }))
      return growOpenEntries(s, action.crewId, candidate.name)
    }

    case 'enterLottery': {
      const crew = crewById(state, action.crewId)
      const size = Math.min(GAME.maxCrew, crew.members.length)
      const lottery = {
        id: uid('lot'),
        crewId: action.crewId,
        drawNo: action.drawNo,
        status: 'open',
        crewSize: size,
        multiplier: rollMultiplier('mega'),
        contributions: {},
        boosts: {},
        tickets: [{ id: uid('t'), ...quickPick(size), source: 'Quick pick' }],
        ledger: [{ id: uid('l'), t: Date.now(), icon: '🎟️', text: `${crew.name} entered draw #${action.drawNo} with 1 ticket` }],
        result: null,
        settlement: null,
      }
      return { ...state, lotteries: [lottery, ...state.lotteries], joinLottery: null, route: { name: 'lottery', lotteryId: lottery.id } }
    }

    // Pay your mandatory share, whatever is still outstanding
    case 'payShare': {
      const lottery = lotteryById(state, action.lotteryId)
      const crew = crewById(state, lottery.crewId)
      const due = Math.round((shareDue(state, lottery) - (lottery.contributions.you || 0)) * 100) / 100
      if (due <= 0 || due > state.wallet.balance) return state
      const s = updateLottery(state, action.lotteryId, l =>
        withLedger(
          { ...l, contributions: { ...l.contributions, you: shareDue(state, l) } },
          '💶',
          `${YOU.name} paid their share (${fmtEUR2(due)})`
        )
      )
      return {
        ...s,
        wallet: {
          balance: Math.round((state.wallet.balance - due) * 100) / 100,
          txns: [{ id: uid('x'), t: Date.now(), label: `${crew.name} · draw #${lottery.drawNo} · share`, amount: -due }, ...state.wallet.txns],
        },
      }
    }

    // The optional side bet: pays out at the entry multiplier on a top-tier win
    case 'boostEntry': {
      const { lotteryId, amount } = action
      const lottery = lotteryById(state, lotteryId)
      const crew = crewById(state, lottery.crewId)
      if (amount <= 0 || amount > state.wallet.balance) return state
      const s = updateLottery(state, lotteryId, l =>
        withLedger(
          { ...l, boosts: { ...l.boosts, you: Math.round(((l.boosts?.you || 0) + amount) * 100) / 100 } },
          '🚀',
          `${YOU.name} boosted ${fmtEUR2(amount)} at ${lottery.multiplier}x`
        )
      )
      return {
        ...s,
        wallet: {
          balance: Math.round((state.wallet.balance - amount) * 100) / 100,
          txns: [{ id: uid('x'), t: Date.now(), label: `${crew.name} · draw #${lottery.drawNo} · boost ${lottery.multiplier}x`, amount: -amount }, ...state.wallet.txns],
        },
      }
    }

    // The whole join flow in one action: tickets, your share, optional boost
    case 'joinDraw': {
      const { crewId, tickets: tCount, boost = 0, drawNo, kind = 'mega' } = action
      const crew = crewById(state, crewId)
      const size = Math.min(GAME.maxCrew, crew.members.length)
      let s = state
      let entry = s.lotteries.find(l => l.crewId === crewId && l.status !== 'settled')
      const fresh = !entry
      if (fresh) {
        entry = {
          id: uid('lot'), crewId, drawNo, status: 'open', crewSize: size,
          multiplier: rollMultiplier(kind), contributions: {}, boosts: {}, tickets: [],
          ledger: [{ id: uid('l'), t: Date.now(), icon: '🎟️', text: `${crew.name} entered draw #${drawNo} with ${tCount} ticket${tCount > 1 ? 's' : ''}` }],
          result: null, settlement: null,
        }
        s = { ...s, lotteries: [entry, ...s.lotteries] }
      }
      const newTickets = Array.from({ length: tCount }, () => ({ id: uid('t'), ...quickPick(size), source: 'Quick pick' }))
      s = updateLottery(s, entry.id, l => {
        const withTickets = { ...l, tickets: [...l.tickets, ...newTickets] }
        return fresh ? withTickets : withLedger(withTickets, '🎫', `${YOU.name} added ${tCount} ticket${tCount > 1 ? 's' : ''}. Everyone's share is now ${fmtEUR2(shareFor(size, withTickets.tickets.length))}`)
      })
      const updated = lotteryById(s, entry.id)
      const due = Math.round((shareFor(size, updated.tickets.length) - (updated.contributions.you || 0)) * 100) / 100
      const total = Math.round((Math.max(0, due) + boost) * 100) / 100
      if (total > state.wallet.balance) return state
      s = updateLottery(s, entry.id, l => {
        let next = { ...l, contributions: { ...l.contributions, you: shareFor(size, l.tickets.length) } }
        next = withLedger(next, '💶', `${YOU.name} paid their share (${fmtEUR2(Math.max(0, due))})`)
        if (boost > 0) {
          next = { ...next, boosts: { ...next.boosts, you: Math.round(((next.boosts?.you || 0) + boost) * 100) / 100 } }
          next = withLedger(next, '🚀', `${YOU.name} boosted ${fmtEUR2(boost)} at ${l.multiplier}x`)
        }
        return next
      })
      const txns = [{ id: uid('x'), t: Date.now(), label: `${crew.name} · draw #${entry.drawNo} · share`, amount: -Math.max(0, due) }]
      if (boost > 0) txns.unshift({ id: uid('x'), t: Date.now(), label: `${crew.name} · draw #${entry.drawNo} · boost ${entry.multiplier}x`, amount: -boost })
      return {
        ...s,
        wallet: {
          balance: Math.round((state.wallet.balance - total) * 100) / 100,
          txns: [...txns, ...state.wallet.txns],
        },
        joinLottery: null,
        route: { name: 'lottery', lotteryId: entry.id },
      }
    }

    // Demo helper: the crewmates who still owe their share settle up
    case 'botsPayUp': {
      const lottery = lotteryById(state, action.lotteryId)
      const owing = unpaidMembers(state, lottery).filter(m => m.id !== 'you')
      if (!owing.length) return state
      const due = shareDue(state, lottery)
      let s = state
      for (const m of owing.slice(0, 2)) {
        s = updateLottery(s, action.lotteryId, l =>
          withLedger({ ...l, contributions: { ...l.contributions, [m.id]: due } }, '💶', `${m.name} paid their share (${fmtEUR2(due)})`)
        )
      }
      return s
    }

    case 'addTickets': {
      const { lotteryId, tickets } = action
      const lottery = lotteryById(state, lotteryId)
      const size = entrySize(state, lottery)
      const count = lottery.tickets.length + tickets.length
      return updateLottery(state, lotteryId, l =>
        withLedger(
          { ...l, tickets: [...l.tickets, ...tickets] },
          '🎫',
          `${tickets.length} ticket${tickets.length > 1 ? 's' : ''} added. Everyone's share is now ${fmtEUR2(shareFor(size, count))}`
        )
      )
    }

    // Lock drops anyone who never paid and resizes the ticket to the crew that did
    case 'lockLottery': {
      const lottery = lotteryById(state, action.lotteryId)
      const paid = paidMembers(state, lottery)
      const dropped = unpaidMembers(state, lottery)
      if (!paid.length) return state
      const size = Math.max(1, paid.length)
      const spec = { main: mainCount(size), stars: starCount(size) }
      const paidIds = new Set(paid.map(m => m.id))
      return updateLottery(state, action.lotteryId, l => {
        const tickets = l.tickets.map(t => ({
          ...t,
          nums: t.nums.slice(0, spec.main),
          stars: (t.stars || []).slice(0, spec.stars),
        }))
        const contributions = Object.fromEntries(Object.entries(l.contributions).filter(([id]) => paidIds.has(id)))
        const boosts = Object.fromEntries(Object.entries(l.boosts || {}).filter(([id]) => paidIds.has(id)))
        const surplus = Math.round((Object.values(contributions).reduce((s, n) => s + n, 0) - ticketPrice(size) * tickets.length) * 100) / 100
        let next = { ...l, status: 'locked', crewSize: size, tickets, contributions, boosts }
        if (dropped.length) {
          next = withLedger(next, '🔒', `Entries locked. ${dropped.map(m => m.name).join(', ')} never paid and ${dropped.length > 1 ? 'were' : 'was'} dropped. Ticket resized to ${spec.main} numbers + ${spec.stars} star${spec.stars > 1 ? 's' : ''}`)
          if (surplus > 0) next = withLedger(next, '↩️', `${fmtEUR2(surplus)} surplus carried to the crew's next pot`)
        } else {
          next = withLedger(next, '🔒', `Entries locked. All ${size} members paid, ${spec.main} numbers + ${spec.stars} star${spec.stars > 1 ? 's' : ''} in play`)
        }
        return next
      })
    }

    case 'setResult':
      return updateLottery(state, action.lotteryId, l => ({ ...l, status: 'drawing', result: action.result }))

    case 'settle': {
      const { lotteryId, settlement } = action
      const lottery = lotteryById(state, lotteryId)
      const crew = crewById(state, lottery.crewId)
      const yourCut = settlement.splits.find(x => x.memberId === 'you')?.amount || 0
      let s = updateLottery(state, lotteryId, l => {
        let next = withLedger({ ...l, status: 'settled', settlement }, '🏆', `Draw #${l.drawNo} settled. Crew won ${fmtEUR2(settlement.totalWon)}`)
        next = withLedger(next, '⚡', `Winnings split equally across ${settlement.splits.length} member${settlement.splits.length > 1 ? 's' : ''}`)
        if (settlement.boostTotal > 0) next = withLedger(next, '🚀', `Boosts paid out at ${settlement.multiplier}x: ${fmtEUR2(settlement.boostTotal)}`)
        return next
      })
      if (yourCut > 0) {
        s = {
          ...s,
          wallet: {
            balance: Math.round((s.wallet.balance + yourCut) * 100) / 100,
            txns: [{ id: uid('x'), t: Date.now(), label: `${crew.name} · draw #${lottery.drawNo} winnings 🏆`, amount: yourCut }, ...s.wallet.txns],
          },
        }
      }
      return s
    }

    case 'eventJoined': {
      if (!action.eventId) return state
      return { ...state, quickDraws: state.quickDraws.map(q => (q.id === action.eventId ? { ...q, joined: q.joined + 1, crews: q.crews + 1, pot: Math.round((q.pot + 5) * 100) / 100 } : q)) }
    }

    case 'potTick': {
      // Simulated live activity: crews keep joining, pots keep growing.
      // An expired quick draw rotates to the back of the 90-minute window.
      const t = Date.now()
      const quickDraws = state.quickDraws.map(q => {
        if (q.closesAt <= t) {
          return { ...q, drawNo: q.drawNo + 3, closesAt: q.closesAt + 3 * HALF_HOUR, pot: 40 + Math.random() * 45, crews: 3 + Math.floor(Math.random() * 7), joined: 0, multiplier: rollMultiplier('quick') }
        }
        if (Math.random() < 0.6) {
          return { ...q, pot: Math.round((q.pot + 2.5 * (1 + Math.floor(Math.random() * 4))) * 100) / 100, crews: q.crews + (Math.random() < 0.5 ? 1 : 0) }
        }
        return q
      })
      const mega = Math.random() < 0.7
        ? { ...state.mega, pot: state.mega.pot + 12.5 * (1 + Math.floor(Math.random() * 4)), crews: state.mega.crews + (Math.random() < 0.4 ? 1 : 0) }
        : state.mega
      // crewmates settle up and boost in real time
      let lotteries = state.lotteries
      if (Math.random() < 0.4) {
        lotteries = state.lotteries.map(l => {
          if (l.status !== 'open' || Math.random() < 0.5) return l
          const crew = state.crews.find(c => c.id === l.crewId)
          if (!crew) return l
          const due = shareFor(Math.min(GAME.maxCrew, crew.members.length), Math.max(1, l.tickets.length))
          const owing = crew.members.filter(m => m.id !== 'you' && (l.contributions[m.id] || 0) + 0.001 < due)
          if (owing.length) {
            const m = owing[Math.floor(Math.random() * owing.length)]
            return {
              ...l,
              contributions: { ...l.contributions, [m.id]: due },
              ledger: [...l.ledger, { id: uid('l'), t, icon: '💶', text: `${m.name} paid their share (${fmtEUR2(due)})` }],
            }
          }
          // everyone is paid up: someone throws a boost on instead
          const mates = crew.members.filter(m => m.id !== 'you')
          if (!mates.length) return l
          const m = mates[Math.floor(Math.random() * mates.length)]
          const amt = 2.5 * (1 + Math.floor(Math.random() * 3))
          return {
            ...l,
            boosts: { ...l.boosts, [m.id]: Math.round(((l.boosts?.[m.id] || 0) + amt) * 100) / 100 },
            ledger: [...l.ledger, { id: uid('l'), t, icon: '🚀', text: `${m.name} boosted ${fmtEUR2(amt)} at ${l.multiplier}x` }],
          }
        })
      }
      return { ...state, quickDraws, mega, lotteries }
    }

    case 'topUp':
      return {
        ...state,
        wallet: {
          balance: Math.round((state.wallet.balance + action.amount) * 100) / 100,
          txns: [{ id: uid('x'), t: Date.now(), label: 'Top-up', amount: action.amount }, ...state.wallet.txns],
        },
      }

    default:
      return state
  }
}

// ── Context ──────────────────────────────────────────────────────────────────

const StoreCtx = createContext(null)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    document.documentElement.dataset.theme = state.theme
  }, [state.theme])
  useEffect(() => {
    if (!state.toast) return
    const t = setTimeout(() => dispatch({ type: 'toast', toast: null }), 6000)
    return () => clearTimeout(t)
  }, [state.toast])
  // Live pots: crews keep joining, pots keep rising
  useEffect(() => {
    const iv = setInterval(() => dispatch({ type: 'potTick' }), 3500)
    return () => clearInterval(iv)
  }, [])
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)

export const nav = (dispatch, route) => dispatch({ type: 'nav', route })
export const toast = (dispatch, text, icon = '✅') => dispatch({ type: 'toast', toast: { text, icon } })

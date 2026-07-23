import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { quickPick, settleDraw } from './game.js'

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
      record: { played: 8, won: 2 },
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
      record: { played: 14, won: 3 },
      members: [
        { ...BOTS[3], joinedAt: ago(90000) },
        { ...YOU, joinedAt: ago(88000) },
        { ...BOTS[4], joinedAt: ago(80000) },
      ],
    },
    {
      id: 'c-pub1',
      name: 'Jackpot Chasers',
      emoji: '⚡',
      color: 'cyan',
      privacy: 'public',
      captainId: 'b5',
      record: { played: 40, won: 11 },
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
      record: { played: 6, won: 1 },
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
      record: { played: 62, won: 19 },
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
      record: { played: 23, won: 5 },
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
      record: { played: 31, won: 8 },
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
      record: { played: 12, won: 2 },
      members: [
        { ...BOTS[2], joinedAt: ago(40000) },
        { ...BOTS[1], joinedAt: ago(35000) },
      ],
    },
  ]
}

function seedLotteries(crews) {
  const office = crews[0]

  // Ongoing: Office Legends in draw 214
  const lOffice = {
    id: 'l-office-214',
    crewId: 'c-office',
    drawNo: 214,
    sharePrice: 2.5,
    targetShares: 20,
    maxPerMember: 4,
    status: 'open',
    shares: { you: 4, b1: 4, b2: 3, b3: 3, b4: 2 },
    tickets: Array.from({ length: 6 }, () => ({ id: uid('t'), ...quickPick(), source: 'Quick pick' })),
    ledger: [
      { id: uid('l'), t: ago(3200), icon: '🎟️', text: 'Office Legends entered draw #214' },
      { id: uid('l'), t: ago(3100), icon: '💰', text: 'Maria K. bought 4 shares (€10.00)' },
      { id: uid('l'), t: ago(2900), icon: '💰', text: 'Nikos P. bought 3 shares (€7.50)' },
      { id: uid('l'), t: ago(2800), icon: '💰', text: 'Jim bought 4 shares (€10.00)' },
      { id: uid('l'), t: ago(1380), icon: '💰', text: 'Elena V. bought 3 shares (€7.50)' },
      { id: uid('l'), t: ago(600), icon: '🎫', text: 'Crew bought 6 tickets from the pot (€15.00)' },
      { id: uid('l'), t: ago(290), icon: '💰', text: 'Kostas D. bought 2 shares (€5.00)' },
    ],
    result: null,
    settlement: null,
  }

  // Ongoing: Friday Fam in draw 214
  const lFam = {
    id: 'l-fam-214',
    crewId: 'c-fam',
    drawNo: 214,
    sharePrice: 2,
    targetShares: 10,
    maxPerMember: 2,
    status: 'open',
    shares: { b4: 2, you: 1, b5: 2 },
    tickets: [
      { id: uid('t'), ...quickPick(), source: 'Quick pick' },
      { id: uid('t'), ...quickPick(), source: 'Quick pick' },
    ],
    ledger: [
      { id: uid('l'), t: ago(9000), icon: '🎟️', text: 'Friday Fam entered draw #214' },
      { id: uid('l'), t: ago(8800), icon: '💰', text: 'Jim bought 1 share (€2.00)' },
      { id: uid('l'), t: ago(7000), icon: '🎫', text: 'Crew bought 2 tickets from the pot (€5.00)' },
    ],
    result: null,
    settlement: null,
  }

  // Completed: Office Legends won €150 in draw 213
  const result213 = { nums: [3, 9, 14, 22, 31], star: 6 }
  const tickets213 = [
    { id: uid('t'), nums: [3, 9, 14, 22, 40], star: 2, source: 'Quick pick' }, // 4 matches = €150
    { id: uid('t'), nums: [1, 5, 18, 25, 33], star: 6, source: 'Quick pick' },
    { id: uid('t'), nums: [2, 9, 20, 31, 38], star: 4, source: 'Quick pick' },
    { id: uid('t'), nums: [7, 11, 16, 30, 40], star: 9, source: 'Quick pick' },
  ]
  const lOffice213 = {
    id: 'l-office-213',
    crewId: 'c-office',
    drawNo: 213,
    sharePrice: 2.5,
    targetShares: 16,
    maxPerMember: 4,
    status: 'settled',
    shares: { you: 4, b1: 4, b2: 4, b3: 4 },
    tickets: tickets213,
    ledger: [
      { id: uid('l'), t: ago(11000), icon: '🎟️', text: 'Office Legends entered draw #213' },
      { id: uid('l'), t: ago(10200), icon: '🎫', text: 'Crew bought 4 tickets from the pot (€10.00)' },
      { id: uid('l'), t: ago(10000), icon: '🏆', text: 'Draw #213 settled. Crew won €150.00' },
      { id: uid('l'), t: ago(10000), icon: '⚡', text: 'Winnings split automatically across 4 members' },
    ],
    result: result213,
    settlement: null, // filled below
  }
  lOffice213.settlement = settleDraw(lOffice213, office, result213)

  // Completed: Friday Fam won nothing in draw 212
  const result212 = { nums: [6, 12, 19, 27, 35], star: 3 }
  const lFam212 = {
    id: 'l-fam-212',
    crewId: 'c-fam',
    drawNo: 212,
    sharePrice: 2,
    targetShares: 10,
    maxPerMember: 2,
    status: 'settled',
    shares: { b4: 2, you: 2, b5: 2 },
    tickets: [
      { id: uid('t'), nums: [1, 6, 21, 30, 39], star: 8, source: 'Quick pick' },
      { id: uid('t'), nums: [4, 13, 19, 28, 37], star: 1, source: 'Quick pick' },
      { id: uid('t'), nums: [2, 10, 24, 33, 40], star: 5, source: 'Quick pick' },
    ],
    ledger: [
      { id: uid('l'), t: ago(20000), icon: '🎟️', text: 'Friday Fam entered draw #212' },
      { id: uid('l'), t: ago(19000), icon: '🎫', text: 'Crew bought 3 tickets from the pot (€6.00)' },
      { id: uid('l'), t: ago(18500), icon: '💜', text: 'Draw #212 settled. No winning tickets this time' },
    ],
    result: result212,
    settlement: null,
  }
  lFam212.settlement = settleDraw(lFam212, crews[1], result212)

  return [lOffice, lFam, lOffice213, lFam212]
}

const seededCrews = seedCrews()

const initialState = {
  theme: 'dark',
  route: { name: 'home' },
  wallet: {
    balance: 65.5,
    txns: [
      { id: uid('x'), t: ago(100000), label: 'Top-up', amount: 50 },
      { id: uid('x'), t: ago(19500), label: 'Friday Fam · draw #212 · 2 shares', amount: -4 },
      { id: uid('x'), t: ago(11000), label: 'Office Legends · draw #213 · 4 shares', amount: -10 },
      { id: uid('x'), t: ago(10000), label: 'Office Legends · draw #213 winnings 🏆', amount: 37.5 },
      { id: uid('x'), t: ago(8800), label: 'Friday Fam · draw #214 · 1 share', amount: -2 },
      { id: uid('x'), t: ago(2800), label: 'Office Legends · draw #214 · 4 shares', amount: -10 },
      { id: uid('x'), t: ago(1000), label: 'Top-up', amount: 4 },
    ],
  },
  crews: seededCrews,
  lotteries: seedLotteries(seededCrews),
  drawCloses: now + 1000 * 60 * 47 + 1000 * 12,
  toast: null,
  joinLottery: null,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export const crewById = (state, id) => state.crews.find(c => c.id === id)
export const lotteryById = (state, id) => state.lotteries.find(l => l.id === id)
export const lotteryFilled = l => Object.values(l.shares).reduce((s, n) => s + n, 0)
export const potBalance = l => {
  const contributed = lotteryFilled(l) * l.sharePrice
  const spent = l.tickets.length * 2.5
  return Math.max(0, Math.round((contributed - spent) * 100) / 100)
}
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

function reducer(state, action) {
  switch (action.type) {
    case 'nav':
      return { ...state, route: action.route, joinLottery: null }
    case 'theme':
      return { ...state, theme: state.theme === 'dark' ? 'light' : 'dark' }
    case 'toast':
      return { ...state, toast: action.toast }
    case 'openJoinLottery':
      return { ...state, joinLottery: { crewId: action.crewId || null } }
    case 'closeJoinLottery':
      return { ...state, joinLottery: null }

    case 'createCrew': {
      const crew = {
        ...action.crew,
        id: uid('c'),
        captainId: 'you',
        record: { played: 0, won: 0 },
        members: [{ ...YOU, joinedAt: Date.now() }],
      }
      return { ...state, crews: [crew, ...state.crews], joinLottery: null, route: { name: 'crew', crewId: crew.id, justCreated: true } }
    }

    case 'joinCrew': {
      let s = updateCrew(state, action.crewId, c => {
        if (c.members.some(m => m.id === 'you')) return c
        return { ...c, members: [...c.members, { ...YOU, joinedAt: Date.now() }] }
      })
      return { ...s, route: { name: 'crew', crewId: action.crewId } }
    }

    case 'friendJoins': {
      const crew = crewById(state, action.crewId)
      const existing = new Set(crew.members.map(m => m.id))
      const candidate = BOTS.find(b => !existing.has(b.id))
      if (!candidate) return state
      return updateCrew(state, action.crewId, c => ({ ...c, members: [...c.members, { ...candidate, joinedAt: Date.now() }] }))
    }

    case 'enterLottery': {
      const crew = crewById(state, action.crewId)
      const lottery = {
        id: uid('lot'),
        crewId: action.crewId,
        drawNo: action.drawNo,
        sharePrice: action.rules.sharePrice,
        targetShares: action.rules.targetShares,
        maxPerMember: action.rules.maxPerMember,
        status: 'open',
        shares: {},
        tickets: [],
        ledger: [{ id: uid('l'), t: Date.now(), icon: '🎟️', text: `${crew.name} entered draw #${action.drawNo}` }],
        result: null,
        settlement: null,
      }
      return { ...state, lotteries: [lottery, ...state.lotteries], joinLottery: null, route: { name: 'lottery', lotteryId: lottery.id } }
    }

    case 'contribute': {
      const { lotteryId, shares } = action
      const lottery = lotteryById(state, lotteryId)
      const crew = crewById(state, lottery.crewId)
      const cost = shares * lottery.sharePrice
      if (cost > state.wallet.balance) return state
      let s = updateLottery(state, lotteryId, l =>
        withLedger(
          { ...l, shares: { ...l.shares, you: (l.shares.you || 0) + shares } },
          '💰',
          `${YOU.name} bought ${shares} share${shares > 1 ? 's' : ''} (€${cost.toFixed(2)})`
        )
      )
      return {
        ...s,
        wallet: {
          balance: Math.round((state.wallet.balance - cost) * 100) / 100,
          txns: [{ id: uid('x'), t: Date.now(), label: `${crew.name} · draw #${lottery.drawNo} · ${shares} share${shares > 1 ? 's' : ''}`, amount: -cost }, ...state.wallet.txns],
        },
      }
    }

    case 'botsChipIn': {
      const lottery = lotteryById(state, action.lotteryId)
      const crew = crewById(state, lottery.crewId)
      const filled = lotteryFilled(lottery)
      let room = lottery.targetShares - filled
      if (room <= 0) return state
      let s = state
      const candidates = crew.members.filter(m => m.id !== 'you' && (lottery.shares[m.id] || 0) < lottery.maxPerMember)
      if (!candidates.length) return state
      const picks = candidates.sort(() => Math.random() - 0.5).slice(0, Math.min(2, candidates.length))
      for (const m of picks) {
        if (room <= 0) break
        const can = Math.min(lottery.maxPerMember - (lottery.shares[m.id] || 0), room)
        const n = Math.max(1, Math.min(can, 1 + Math.floor(Math.random() * 2)))
        room -= n
        s = updateLottery(s, action.lotteryId, l =>
          withLedger(
            { ...l, shares: { ...l.shares, [m.id]: (l.shares[m.id] || 0) + n } },
            '💰',
            `${m.name} bought ${n} share${n > 1 ? 's' : ''} (€${(n * lottery.sharePrice).toFixed(2)})`
          )
        )
      }
      return s
    }

    case 'buyTickets': {
      const { lotteryId, tickets } = action
      const cost = tickets.length * 2.5
      return updateLottery(state, lotteryId, l =>
        withLedger({ ...l, tickets: [...l.tickets, ...tickets] }, '🎫', `Crew bought ${tickets.length} ticket${tickets.length > 1 ? 's' : ''} from the pot (€${cost.toFixed(2)})`)
      )
    }

    case 'lockLottery':
      return updateLottery(state, action.lotteryId, l => withLedger({ ...l, status: 'locked' }, '🔒', 'Entries locked. Ownership snapshot taken'))

    case 'setResult':
      return updateLottery(state, action.lotteryId, l => ({ ...l, status: 'drawing', result: action.result }))

    case 'settle': {
      const { lotteryId, settlement } = action
      const lottery = lotteryById(state, lotteryId)
      const crew = crewById(state, lottery.crewId)
      const yourCut = settlement.splits.find(x => x.memberId === 'you')?.amount || 0
      let s = updateLottery(state, lotteryId, l =>
        withLedger(
          withLedger({ ...l, status: 'settled', settlement }, '🏆', `Draw #${l.drawNo} settled. Crew won €${settlement.totalWon.toFixed(2)}`),
          '⚡',
          `Winnings split automatically across ${settlement.splits.length} contributors`
        )
      )
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
    const t = setTimeout(() => dispatch({ type: 'toast', toast: null }), 2600)
    return () => clearTimeout(t)
  }, [state.toast])
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}

export const useStore = () => useContext(StoreCtx)

export const nav = (dispatch, route) => dispatch({ type: 'nav', route })
export const toast = (dispatch, text, icon = '✅') => dispatch({ type: 'toast', toast: { text, icon } })

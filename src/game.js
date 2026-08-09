// ── Star 5 group game ────────────────────────────────────────────────────────
// The draw is always 5 numbers of 40 plus one Star Ball. What changes is the
// crew's ticket: every member adds a main number, and four or more members
// unlock a second and third star. Bigger crew, wider net, cheaper per head.

export const GAME = {
  name: 'Star 5',
  pickCount: 5, // main numbers before the crew bonus
  numberMax: 40,
  starMax: 10,
  maxCrew: 6,
  basePrice: 4, // ticket price for a crew of one
  perMate: 2, // every extra crewmate adds this much to the ticket
  jackpot: 500000, // the Mega's floor: it rolls over and grows from here
}

const clampSize = n => Math.max(1, Math.min(GAME.maxCrew, n || 1))
const round2 = n => Math.round(n * 100) / 100
const ceil2 = n => Math.ceil(n * 100) / 100

export const mainCount = size => GAME.pickCount + clampSize(size)
export const starCount = size => (clampSize(size) >= 4 ? 3 : 1)
export const ticketPrice = size => GAME.basePrice + GAME.perMate * (clampSize(size) - 1)
// Everyone pays the same. Rounded up to the cent so the ticket is always covered.
export const shareFor = (size, tickets = 1) => ceil2((ticketPrice(size) * tickets) / clampSize(size))
export const ticketSpec = size => ({
  size: clampSize(size),
  main: mainCount(size),
  stars: starCount(size),
  price: ticketPrice(size),
  share: shareFor(size),
})
// The pitch, in one array: bigger crew, more numbers, less each
export const SIZE_TABLE = Array.from({ length: GAME.maxCrew }, (_, i) => ticketSpec(i + 1))

// Every entry carries a multiplier. Money staked above your share pays out at
// this rate if the crew lands a top-tier win.
export const MULTIPLIERS = { quick: [20, 30, 40, 50], mega: [100, 200, 300, 400, 500] }
export const rollMultiplier = (kind = 'mega') => {
  const opts = MULTIPLIERS[kind] || MULTIPLIERS.mega
  return opts[Math.floor(Math.random() * opts.length)]
}

// boosts: this tier is big enough to pay out the multiplier
export const PRIZE_TIERS = [
  { match: 5, star: true, label: '5 + ★', prize: null, isJackpot: true, boosts: true },
  { match: 5, star: false, label: '5 numbers', prize: 50000, boosts: true },
  { match: 4, star: true, label: '4 + ★', prize: 2500 },
  { match: 4, star: false, label: '4 numbers', prize: 150 },
  { match: 3, star: true, label: '3 + ★', prize: 50 },
  { match: 3, star: false, label: '3 numbers', prize: 10 },
  { match: 2, star: true, label: '2 + ★', prize: 4 },
]

const drawFrom = (max, count, exclude = []) => {
  const pool = Array.from({ length: max }, (_, i) => i + 1).filter(n => !exclude.includes(n))
  const out = []
  for (let i = 0; i < count && pool.length; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
  return out.sort((a, b) => a - b)
}

// A crew ticket, sized for the crew that plays it
export function quickPick(size = 1) {
  const spec = ticketSpec(size)
  return { nums: drawFrom(GAME.numberMax, spec.main), stars: drawFrom(GAME.starMax, spec.stars) }
}

// A crewmate joining mid-entry grows every open ticket by their number
export function growTicket(ticket, size) {
  const spec = ticketSpec(size)
  const nums = [...ticket.nums]
  const stars = [...(ticket.stars || [])]
  if (nums.length < spec.main) nums.push(...drawFrom(GAME.numberMax, spec.main - nums.length, nums))
  if (stars.length < spec.stars) stars.push(...drawFrom(GAME.starMax, spec.stars - stars.length, stars))
  return { ...ticket, nums: nums.sort((a, b) => a - b), stars: stars.sort((a, b) => a - b) }
}

// The draw itself never changes shape: 5 numbers + 1 star
export function fairDraw() {
  return { nums: drawFrom(GAME.numberMax, GAME.pickCount), star: 1 + Math.floor(Math.random() * GAME.starMax) }
}

// A demo-friendly draw: guarantees at least one ticket lands a mid-tier win,
// so the winnings-split experience can always be shown. Clearly labelled in UI.
export function luckyDraw(tickets) {
  if (!tickets.length) return fairDraw()
  const lucky = tickets[Math.floor(Math.random() * tickets.length)]
  const keep = [...lucky.nums].sort(() => Math.random() - 0.5).slice(0, 4)
  const nums = [...keep, ...drawFrom(GAME.numberMax, GAME.pickCount - keep.length, lucky.nums)]
  return { nums: nums.sort((a, b) => a - b), star: lucky.stars[0] }
}

// jackpot: the live rolling pot at draw time, defaulting to the game's floor
export function scoreTicket(ticket, result, jackpot = GAME.jackpot) {
  const stars = ticket.stars || (ticket.star ? [ticket.star] : [])
  const matched = result.nums.filter(n => ticket.nums.includes(n))
  const starHit = stars.includes(result.star)
  const tier = PRIZE_TIERS.find(t => t.match === matched.length && t.star === starHit)
  const prize = tier ? (tier.isJackpot ? jackpot : tier.prize) : 0
  return { matched, starHit, tier: tier || null, prize }
}

// Equal shares, equal cuts. Boosts are a personal side bet on top: they pay
// out at the entry's multiplier, but only when the crew lands a top tier.
// lottery: { tickets, contributions: {memberId: share paid}, boosts: {memberId: €}, multiplier }
export function settleDraw(lottery, crew, result, jackpot = GAME.jackpot) {
  const scored = lottery.tickets.map(t => ({ ticket: t, ...scoreTicket(t, result, jackpot) }))
  const totalWon = scored.reduce((s, x) => s + x.prize, 0)
  const boostsPay = scored.some(x => x.prize > 0 && x.tier?.boosts)
  const multiplier = lottery.multiplier || 0
  const paid = crew.members.filter(m => (lottery.contributions[m.id] || 0) > 0)
  const each = paid.length ? Math.floor((totalWon / paid.length) * 100) / 100 : 0
  const splits = paid.map(m => {
    const share = lottery.contributions[m.id] || 0
    const boost = lottery.boosts?.[m.id] || 0
    const boostAmount = boostsPay ? round2(boost * multiplier) : 0
    return {
      memberId: m.id, name: m.name, avatar: m.avatar,
      share, boost, base: each, boostAmount,
      amount: round2(each + boostAmount),
    }
  })
  const boostTotal = splits.reduce((s, x) => s + x.boostAmount, 0)
  const remainder = round2(totalWon - each * paid.length)
  return { scored, totalWon, boostsPay, multiplier, boostTotal, totalPaid: round2(totalWon + boostTotal), splits, remainder }
}

// European numerals throughout: dot groups the thousands, comma marks the
// decimals (€500.325,00), with the symbol kept in front the way the UI reads.
const EU = opts => new Intl.NumberFormat('de-DE', opts)

export const fmtNum = n => EU({ maximumFractionDigits: 0 }).format(n)

// whole amounts stay clean (€500.000), fractional ones keep both cents (€1.250,50)
export const fmtEUR = n =>
  n % 1 === 0 ? `€${EU({ maximumFractionDigits: 0 }).format(n)}` : fmtEUR2(n)

export const fmtEUR2 = n => `€${EU({ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`

export const fmtPct = p => `${EU({ maximumFractionDigits: 1 }).format(p * 100)}%`

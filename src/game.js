// ── Star 5 game logic (5 of 40 + Star Ball 1–10) ─────────────────────────────

export const GAME = {
  name: 'Star 5',
  pickCount: 5,
  numberMax: 40,
  starMax: 10,
  ticketPrice: 2.5,
  jackpot: 1250000,
}

export const PRIZE_TIERS = [
  { match: 5, star: true, label: '5 + ★', prize: null, isJackpot: true },
  { match: 5, star: false, label: '5 numbers', prize: 50000 },
  { match: 4, star: true, label: '4 + ★', prize: 2500 },
  { match: 4, star: false, label: '4 numbers', prize: 150 },
  { match: 3, star: true, label: '3 + ★', prize: 50 },
  { match: 3, star: false, label: '3 numbers', prize: 10 },
  { match: 2, star: true, label: '2 + ★', prize: 4 },
]

export function quickPick() {
  const pool = Array.from({ length: GAME.numberMax }, (_, i) => i + 1)
  const nums = []
  for (let i = 0; i < GAME.pickCount; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    nums.push(pool.splice(idx, 1)[0])
  }
  return { nums: nums.sort((a, b) => a - b), star: 1 + Math.floor(Math.random() * GAME.starMax) }
}

export function fairDraw() {
  return quickPick()
}

// A demo-friendly draw: guarantees at least one ticket lands a mid-tier win,
// so the winnings-split experience can always be shown. Clearly labelled in UI.
export function luckyDraw(tickets) {
  if (!tickets.length) return fairDraw()
  const lucky = tickets[Math.floor(Math.random() * tickets.length)]
  // take 4 of the lucky ticket's numbers + its star, fill the rest randomly
  const keep = [...lucky.nums].sort(() => Math.random() - 0.5).slice(0, 4)
  const pool = Array.from({ length: GAME.numberMax }, (_, i) => i + 1).filter(n => !lucky.nums.includes(n))
  const nums = [...keep]
  while (nums.length < GAME.pickCount) {
    const idx = Math.floor(Math.random() * pool.length)
    nums.push(pool.splice(idx, 1)[0])
  }
  return { nums: nums.sort((a, b) => a - b), star: lucky.star }
}

export function scoreTicket(ticket, result) {
  const matched = ticket.nums.filter(n => result.nums.includes(n))
  const starHit = ticket.star === result.star
  const tier = PRIZE_TIERS.find(t => t.match === matched.length && t.star === starHit)
  const prize = tier ? (tier.isJackpot ? GAME.jackpot : tier.prize) : 0
  return { matched, starHit, tier: tier || null, prize }
}

// lottery: { tickets, shares: {memberId: n} } · crew: { members }
export function settleDraw(lottery, crew, result) {
  const scored = lottery.tickets.map(t => ({ ticket: t, ...scoreTicket(t, result) }))
  const totalWon = scored.reduce((s, x) => s + x.prize, 0)
  const totalShares = Object.values(lottery.shares).reduce((s, n) => s + n, 0)
  const splits = crew.members
    .filter(m => (lottery.shares[m.id] || 0) > 0)
    .map(m => {
      const shares = lottery.shares[m.id]
      const pct = totalShares ? shares / totalShares : 0
      return { memberId: m.id, name: m.name, avatar: m.avatar, shares, pct, amount: Math.floor(totalWon * pct * 100) / 100 }
    })
  const distributed = splits.reduce((s, x) => s + x.amount, 0)
  const remainder = Math.round((totalWon - distributed) * 100) / 100
  return { scored, totalWon, splits, remainder }
}

export const fmtEUR = n =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n)

export const fmtEUR2 = n =>
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(n)

export const fmtPct = p => `${(p * 100).toFixed(1).replace(/\.0$/, '')}%`

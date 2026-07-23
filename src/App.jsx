import React from 'react'
import { useStore } from './store.jsx'
import { Header, Toast, Footer } from './ui.jsx'
import Home from './screens/Home.jsx'
import CreateCrew from './screens/CreateCrew.jsx'
import CrewPage from './screens/CrewPage.jsx'
import LotteryPage from './screens/LotteryPage.jsx'
import Join from './screens/Join.jsx'
import Draw from './screens/Draw.jsx'
import Results from './screens/Results.jsx'
import Wallet from './screens/Wallet.jsx'
import JoinLotteryModal from './screens/JoinLottery.jsx'

export default function App() {
  const { state } = useStore()
  const r = state.route
  return (
    <>
      <Header />
      <div style={{ paddingBottom: 30 }}>
        {r.name === 'home' && <Home />}
        {r.name === 'create' && <CreateCrew />}
        {r.name === 'crew' && <CrewPage key={r.crewId} crewId={r.crewId} justCreated={r.justCreated} />}
        {r.name === 'lottery' && <LotteryPage key={r.lotteryId} lotteryId={r.lotteryId} />}
        {r.name === 'join' && <Join crewId={r.crewId} preview={r.preview} />}
        {r.name === 'draw' && <Draw key={r.lotteryId} lotteryId={r.lotteryId} />}
        {r.name === 'results' && <Results lotteryId={r.lotteryId} />}
        {r.name === 'wallet' && <Wallet />}
      </div>
      <Footer />
      {state.joinLottery && <JoinLotteryModal key={state.joinLottery.crewId || 'pick'} />}
      <Toast />
    </>
  )
}

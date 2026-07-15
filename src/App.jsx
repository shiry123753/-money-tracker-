import { Routes, Route } from 'react-router-dom'
import { useSession } from './hooks/useSession'
import Layout from './components/Layout'
import SetupScreen from './pages/SetupScreen'
import HomePage from './pages/HomePage'
import TransactionsPage from './pages/TransactionsPage'
import DebtsPage from './pages/DebtsPage'
import DashboardPage from './pages/DashboardPage'
import MorePage from './pages/MorePage'
import RulesPage from './pages/RulesPage'
import SharePage from './pages/SharePage'
import PartnerPage from './pages/PartnerPage'

export default function App() {
  const session = useSession()
  if (!session) return <SetupScreen />

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/list" element={<TransactionsPage />} />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/more" element={<MorePage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/share" element={<SharePage />} />
        <Route path="/partner" element={<PartnerPage />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  )
}

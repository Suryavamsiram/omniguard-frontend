import { NavLink, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import WorkflowsPage from './pages/WorkflowsPage'
import NotificationsPage from './pages/NotificationsPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>OmniGuard</h1>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/documents">Documents</NavLink>
          <NavLink to="/workflows">Workflows</NavLink>
          <NavLink to="/notifications">Notifications</NavLink>
          <NavLink to="/search">Search</NavLink>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/workflows" element={<WorkflowsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

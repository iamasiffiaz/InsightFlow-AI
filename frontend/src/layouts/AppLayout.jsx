import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pageMeta, setPageMeta] = useState({
    title: 'Dashboard',
    subtitle: 'Your AI business command center',
  })

  return (
    <div className="flex min-h-screen bg-dash text-ink-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          onMenu={() => setSidebarOpen(true)}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet context={{ setPageMeta }} />
        </main>
      </div>
    </div>
  )
}

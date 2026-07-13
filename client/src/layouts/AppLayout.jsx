import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toggleSidebar } from '../features/ui/uiSlice.js'

export default function AppLayout() {
  const dispatch = useDispatch()
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`shrink-0 border-r border-gray-200 bg-white transition-all duration-200 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <div className="flex h-full w-64 flex-col p-4">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
              TM
            </div>
            <span className="text-lg font-semibold text-gray-900">
              Task Manager
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            <span className="rounded-md bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700">
              Dashboard
            </span>
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Toggle sidebar"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <div className="text-sm text-gray-500">Foundation scaffold</div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

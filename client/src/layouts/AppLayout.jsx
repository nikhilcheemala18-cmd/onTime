import { Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { Briefcase, LayoutDashboard, LogOut, Menu, Plus, Users, X } from '../components/ui/icons.jsx'
import { useEffect, useState } from 'react'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Modal from '../components/ui/Modal.jsx'
import { Field, Input, Textarea } from '../components/ui/FormControls.jsx'
import NotificationMenu from '../components/notifications/NotificationMenu.jsx'
import RealtimeProvider from '../features/realtime/RealtimeProvider.jsx'
import { logout } from '../features/auth/authSlice.js'
import { toggleSidebar } from '../features/ui/uiSlice.js'
import { useBoards } from '../features/boards/hooks.js'
import { useCreateWorkspace, useWorkspaces } from '../features/workspaces/hooks.js'
import { useToast } from '../components/ui/toastContext.js'

export default function AppLayout() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { workspaceId, boardId } = useParams()
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen)
  const user = useSelector((state) => state.auth.user)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' })
  const { showToast } = useToast()
  const workspaces = useWorkspaces()
  const boards = useBoards(workspaceId)
  const createWorkspace = useCreateWorkspace()
  const currentWorkspace = workspaces.data?.find((workspace) => workspace._id === workspaceId)

  useEffect(() => {
    const onExpired = () => {
      dispatch(logout())
      navigate('/login', { replace: true })
    }

    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [dispatch, navigate])

  const submitWorkspace = (event) => {
    event.preventDefault()
    createWorkspace.mutate(
      {
        name: workspaceForm.name,
        description: workspaceForm.description || undefined,
      },
      {
        onSuccess: (workspace) => {
          setCreateOpen(false)
          setWorkspaceForm({ name: '', description: '' })
          navigate(`/workspaces/${workspace._id}`)
        },
        onError: (error) => showToast({ tone: 'error', title: 'Workspace not created', message: error.message }),
      },
    )
  }

  const onLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const Sidebar = (
    <aside className="flex h-full w-[17rem] max-w-[17rem] flex-col border-r border-line bg-white">
      <div className="flex h-16 items-center justify-between px-4">
        <Link to="/app" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-600 text-sm font-bold text-white">
            TM
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Task Manager</p>
            <p className="text-xs text-ink-500">Workspace flow</p>
          </div>
        </Link>
        <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Close navigation">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-y border-line px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase text-ink-500">Workspaces</span>
          <Button variant="ghost" size="icon" onClick={() => setCreateOpen(true)} aria-label="Create workspace">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="max-h-44 space-y-1 overflow-y-auto scrollbar-soft">
          {workspaces.data?.map((workspace) => (
            <NavLink
              key={workspace._id}
              to={`/workspaces/${workspace._id}`}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `focus-ring flex items-center gap-2 rounded-md px-2 py-2 text-sm transition ${
                  isActive ? 'bg-accent-50 font-medium text-accent-700' : 'text-ink-700 hover:bg-warm-100'
                }`
              }
            >
              <Briefcase className="h-4 w-4" />
              <span className="truncate">{workspace.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 scrollbar-soft">
        <NavLink
          to="/app"
          className={({ isActive }) =>
            `focus-ring mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
              isActive ? 'bg-warm-100 font-medium text-ink-900' : 'text-ink-700 hover:bg-warm-100'
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" /> Overview
        </NavLink>
        {workspaceId && (
          <>
            <div className="mb-2 mt-4 flex items-center justify-between px-3">
              <span className="text-xs font-semibold uppercase text-ink-500">Boards</span>
              <Badge tone="accent">{boards.data?.length || 0}</Badge>
            </div>
            <div className="space-y-1">
              {boards.data?.map((board) => (
                <NavLink
                  key={board._id}
                  to={`/workspaces/${workspaceId}/boards/${board._id}`}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `focus-ring block rounded-md px-3 py-2 text-sm transition ${
                      isActive || board._id === boardId ? 'bg-accent-50 font-medium text-accent-700' : 'text-ink-700 hover:bg-warm-100'
                    }`
                  }
                >
                  <span className="truncate">{board.title}</span>
                </NavLink>
              ))}
            </div>
            <NavLink
              to={`/workspaces/${workspaceId}`}
              className="focus-ring mt-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-warm-100"
            >
              <Users className="h-4 w-4" /> Members and activity
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )

  return (
    <RealtimeProvider>
      <div className="flex min-h-screen bg-warm-50">
        <div className={`hidden shrink-0 transition-all duration-200 lg:block ${sidebarOpen ? 'w-[17rem] max-w-[17rem]' : 'w-0 overflow-hidden'}`}>
          {Sidebar}
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <button className="flex-1 bg-ink-900/30" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
            {Sidebar}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-white px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebar())}
                className="hidden lg:inline-flex"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {currentWorkspace?.name || 'Your workspaces'}
                </p>
                <p className="hidden truncate text-xs text-ink-500 sm:block">
                  {boardId ? 'Board workspace' : 'Plan, track, and discuss work'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <NotificationMenu />
              <div className="hidden items-center gap-2 sm:flex">
                <Avatar user={user} />
                <div className="max-w-36">
                  <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
                  <p className="truncate text-xs text-ink-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Log out">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>

        <Modal
          open={createOpen}
          title="Create workspace"
          description="Start a clean space for boards, members, and task activity."
          onClose={() => setCreateOpen(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" form="workspace-create-form" loading={createWorkspace.isPending}>Create</Button>
            </>
          }
        >
          <form id="workspace-create-form" className="space-y-4" onSubmit={submitWorkspace}>
            <Field label="Name">
              <Input required minLength={3} maxLength={80} value={workspaceForm.name} onChange={(event) => setWorkspaceForm((current) => ({ ...current, name: event.target.value }))} />
            </Field>
            <Field label="Description">
              <Textarea maxLength={500} value={workspaceForm.description} onChange={(event) => setWorkspaceForm((current) => ({ ...current, description: event.target.value }))} />
            </Field>
          </form>
        </Modal>
      </div>
    </RealtimeProvider>
  )
}

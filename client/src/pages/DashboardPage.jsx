import { Briefcase, Plus } from '../components/ui/icons.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { Field, Input, Textarea } from '../components/ui/FormControls.jsx'
import Modal from '../components/ui/Modal.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import { useToast } from '../components/ui/toastContext.js'
import { useCreateWorkspace, useWorkspaces } from '../features/workspaces/hooks.js'
import { formatDateTime } from '../lib/format.js'

export default function DashboardPage() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const navigate = useNavigate()
  const { showToast } = useToast()
  const workspaces = useWorkspaces()
  const createWorkspace = useCreateWorkspace()

  const submit = (event) => {
    event.preventDefault()
    createWorkspace.mutate(
      { name: form.name, description: form.description || undefined },
      {
        onSuccess: (workspace) => {
          setOpen(false)
          setForm({ name: '', description: '' })
          navigate(`/workspaces/${workspace._id}`)
        },
        onError: (error) => showToast({ tone: 'error', title: 'Workspace not created', message: error.message }),
      },
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-accent-700">Overview</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink-900">Choose a workspace</h1>
          <p className="mt-1 text-sm text-ink-500">Open a workspace to manage boards, members, notifications, and activity.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> New workspace
        </Button>
      </div>

      <div className="mt-6">
        {workspaces.isLoading && <LoadingState label="Loading workspaces..." />}
        {workspaces.isError && <ErrorState message={workspaces.error.message} onRetry={workspaces.refetch} />}
        {workspaces.data?.length === 0 && (
          <EmptyState
            title="No workspaces yet"
            description="Create your first workspace to start organizing boards and tasks."
            action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Create workspace</Button>}
          />
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.data?.map((workspace) => (
            <button
              key={workspace._id}
              type="button"
              data-testid="workspace-card"
              onClick={() => navigate(`/workspaces/${workspace._id}`)}
              className="focus-ring rounded-lg border border-line bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent-100 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-ink-900">{workspace.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{workspace.description || 'No description yet.'}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-ink-500">Created {formatDateTime(workspace.createdAt)}</p>
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={open}
        title="Create workspace"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" form="dashboard-workspace-form" loading={createWorkspace.isPending}>Create</Button>
          </>
        }
      >
        <form id="dashboard-workspace-form" className="space-y-4" onSubmit={submit}>
          <Field label="Name">
            <Input required minLength={3} maxLength={80} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </Field>
          <Field label="Description">
            <Textarea maxLength={500} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}

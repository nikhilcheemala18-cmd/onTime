import { Activity, Edit3, Plus, Trash2, UserPlus } from '../components/ui/icons.jsx'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input, Select, Textarea } from '../components/ui/FormControls.jsx'
import Modal from '../components/ui/Modal.jsx'
import Panel from '../components/ui/Panel.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui/States.jsx'
import { useToast } from '../components/ui/toastContext.js'
import { useActivities } from '../features/activities/hooks.js'
import { useBoards, useCreateBoard, useDeleteBoard, useUpdateBoard } from '../features/boards/hooks.js'
import { useAddMember, useMembers, useMyMembership, useRemoveMember, useUpdateMemberRole } from '../features/members/hooks.js'
import { useDeleteWorkspace, useUpdateWorkspace, useWorkspace } from '../features/workspaces/hooks.js'
import { formatDateTime } from '../lib/format.js'

function roleTone(role) {
  if (role === 'owner') return 'accent'
  if (role === 'admin') return 'green'
  return 'neutral'
}

function humanActivity(action) {
  return action.replace('.', ' ').replace('_', ' ')
}

export default function WorkspacePage() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [boardOpen, setBoardOpen] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)
  const [memberOpen, setMemberOpen] = useState(false)
  const [boardForm, setBoardForm] = useState({ title: '', description: '' })
  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' })
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'member' })
  const workspace = useWorkspace(workspaceId)
  const boards = useBoards(workspaceId)
  const members = useMembers(workspaceId)
  const myMembership = useMyMembership(workspaceId)
  const activities = useActivities(workspaceId)
  const createBoard = useCreateBoard(workspaceId)
  const updateBoard = useUpdateBoard(workspaceId)
  const deleteBoard = useDeleteBoard(workspaceId)
  const updateWorkspace = useUpdateWorkspace(workspaceId)
  const deleteWorkspace = useDeleteWorkspace()
  const addMember = useAddMember(workspaceId)
  const updateRole = useUpdateMemberRole(workspaceId)
  const removeMember = useRemoveMember(workspaceId)
  const canManageMembers = ['owner', 'admin'].includes(myMembership.data?.role)
  const isOwner = myMembership.data?.role === 'owner'

  const openWorkspaceEdit = () => {
    setWorkspaceForm({ name: workspace.data?.name || '', description: workspace.data?.description || '' })
    setWorkspaceOpen(true)
  }

  const submitBoard = (event) => {
    event.preventDefault()
    createBoard.mutate(
      { ...boardForm, description: boardForm.description || undefined, workspaceId },
      {
        onSuccess: (board) => {
          setBoardOpen(false)
          setBoardForm({ title: '', description: '' })
          navigate(`/workspaces/${workspaceId}/boards/${board._id}`)
        },
        onError: (error) => showToast({ tone: 'error', title: 'Board not created', message: error.message }),
      },
    )
  }

  const submitWorkspace = (event) => {
    event.preventDefault()
    updateWorkspace.mutate(
      { name: workspaceForm.name, description: workspaceForm.description || undefined },
      {
        onSuccess: () => setWorkspaceOpen(false),
        onError: (error) => showToast({ tone: 'error', title: 'Workspace not updated', message: error.message }),
      },
    )
  }

  const removeWorkspace = () => {
    if (!window.confirm('Delete this workspace? This cannot be undone.')) return
    deleteWorkspace.mutate(workspaceId, {
      onSuccess: () => navigate('/app'),
      onError: (error) => showToast({ tone: 'error', title: 'Workspace not deleted', message: error.message }),
    })
  }

  const submitMember = (event) => {
    event.preventDefault()
    addMember.mutate(memberForm, {
      onSuccess: () => {
        setMemberOpen(false)
        setMemberForm({ userId: '', role: 'member' })
      },
      onError: (error) => showToast({ tone: 'error', title: 'Member not added', message: error.message }),
    })
  }

  if (workspace.isLoading) return <LoadingState label="Loading workspace..." />
  if (workspace.isError) return <div className="p-6"><ErrorState message={workspace.error.message} /></div>

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-ink-900">{workspace.data.name}</h1>
            {myMembership.data?.role && <Badge tone={roleTone(myMembership.data.role)}>{myMembership.data.role}</Badge>}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">{workspace.data.description || 'Boards, members, and activity for this workspace.'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openWorkspaceEdit}><Edit3 className="h-4 w-4" /> Edit</Button>
          {isOwner && <Button variant="danger" onClick={removeWorkspace}><Trash2 className="h-4 w-4" /> Delete</Button>}
          <Button onClick={() => setBoardOpen(true)}><Plus className="h-4 w-4" /> New board</Button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Boards</h2>
          </div>
          {boards.isLoading && <LoadingState label="Loading boards..." />}
          {boards.data?.length === 0 && (
            <EmptyState title="No boards yet" description="Create a board to start shaping your workflow." action={<Button onClick={() => setBoardOpen(true)}><Plus className="h-4 w-4" /> Create board</Button>} />
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {boards.data?.map((board) => (
              <Panel key={board._id} className="p-4" data-testid="board-card">
                <Link to={`/workspaces/${workspaceId}/boards/${board._id}`} className="focus-ring block rounded-md">
                  <h3 className="font-semibold text-ink-900">{board.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{board.description || 'No description yet.'}</p>
                </Link>
                <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                  <span>{formatDateTime(board.createdAt)}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const title = window.prompt('Board title', board.title)
                        if (title?.trim()) updateBoard.mutate({ id: board._id, payload: { title } })
                      }}
                      aria-label="Edit board"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => window.confirm('Delete this board?') && deleteBoard.mutate(board._id)} aria-label="Delete board">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <Panel>
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h2 className="font-semibold text-ink-900">Members</h2>
              {canManageMembers && (
                <Button size="sm" variant="secondary" onClick={() => setMemberOpen(true)}>
                  <UserPlus className="h-4 w-4" /> Add
                </Button>
              )}
            </div>
            <div className="divide-y divide-line">
              {members.data?.map((member) => (
                <div key={member._id} className="flex items-center gap-3 px-4 py-3" data-testid="member-row">
                  <Avatar user={member.user} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-900">{member.user?.name || 'Unknown user'}</p>
                    <p className="truncate text-xs text-ink-500">{member.user?.email}</p>
                  </div>
                  {canManageMembers && member.role !== 'owner' ? (
                    <Select
                      className="w-28"
                      value={member.role}
                      onChange={(event) => updateRole.mutate({ memberId: member._id, payload: { role: event.target.value } })}
                    >
                      <option value="member">member</option>
                      <option value="admin" disabled={myMembership.data?.role !== 'owner' && member.role !== 'member'}>admin</option>
                    </Select>
                  ) : (
                    <Badge tone={roleTone(member.role)}>{member.role}</Badge>
                  )}
                  {canManageMembers && member.role !== 'owner' && (
                    <Button variant="ghost" size="icon" onClick={() => window.confirm('Remove this member?') && removeMember.mutate(member._id)} aria-label="Remove member">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <Activity className="h-4 w-4 text-accent-700" />
              <h2 className="font-semibold text-ink-900">Activity</h2>
            </div>
            <div className="max-h-[30rem] overflow-y-auto p-4 scrollbar-soft" data-testid="activity-feed">
              {activities.isLoading && <LoadingState label="Loading activity..." />}
              {activities.data?.activities?.length === 0 && <p className="text-sm text-ink-500">No activity yet.</p>}
              <div className="space-y-4">
                {activities.data?.activities?.map((item) => (
                  <div key={item._id} className="border-l-2 border-accent-100 pl-3">
                    <p className="text-sm font-medium capitalize text-ink-900">{humanActivity(item.action)}</p>
                    <p className="text-xs text-ink-500">{formatDateTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Modal open={boardOpen} title="Create board" onClose={() => setBoardOpen(false)} footer={<><Button variant="secondary" onClick={() => setBoardOpen(false)}>Cancel</Button><Button type="submit" form="board-form" loading={createBoard.isPending}>Create</Button></>}>
        <form id="board-form" className="space-y-4" onSubmit={submitBoard}>
          <Field label="Title"><Input required minLength={3} maxLength={100} value={boardForm.title} onChange={(event) => setBoardForm((current) => ({ ...current, title: event.target.value }))} /></Field>
          <Field label="Description"><Textarea maxLength={500} value={boardForm.description} onChange={(event) => setBoardForm((current) => ({ ...current, description: event.target.value }))} /></Field>
        </form>
      </Modal>

      <Modal open={workspaceOpen} title="Edit workspace" onClose={() => setWorkspaceOpen(false)} footer={<><Button variant="secondary" onClick={() => setWorkspaceOpen(false)}>Cancel</Button><Button type="submit" form="workspace-edit-form" loading={updateWorkspace.isPending}>Save</Button></>}>
        <form id="workspace-edit-form" className="space-y-4" onSubmit={submitWorkspace}>
          <Field label="Name"><Input required minLength={3} maxLength={80} value={workspaceForm.name} onChange={(event) => setWorkspaceForm((current) => ({ ...current, name: event.target.value }))} /></Field>
          <Field label="Description"><Textarea maxLength={500} value={workspaceForm.description} onChange={(event) => setWorkspaceForm((current) => ({ ...current, description: event.target.value }))} /></Field>
        </form>
      </Modal>

      <Modal open={memberOpen} title="Add member" description="Use the registered user's ID for this phase." onClose={() => setMemberOpen(false)} footer={<><Button variant="secondary" onClick={() => setMemberOpen(false)}>Cancel</Button><Button type="submit" form="member-form" loading={addMember.isPending}>Add member</Button></>}>
        <form id="member-form" className="space-y-4" onSubmit={submitMember}>
          <Field label="User ID"><Input required value={memberForm.userId} onChange={(event) => setMemberForm((current) => ({ ...current, userId: event.target.value }))} /></Field>
          <Field label="Role"><Select value={memberForm.role} onChange={(event) => setMemberForm((current) => ({ ...current, role: event.target.value }))}><option value="member">member</option>{isOwner && <option value="admin">admin</option>}</Select></Field>
        </form>
      </Modal>
    </div>
  )
}

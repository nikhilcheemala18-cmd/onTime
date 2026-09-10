import { MoreHorizontal, Plus, Trash2 } from '../components/ui/icons.jsx'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CardDetailModal from '../components/cards/CardDetailModal.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input, Textarea } from '../components/ui/FormControls.jsx'
import Modal from '../components/ui/Modal.jsx'
import { EmptyState, ErrorState, LoadingState, Skeleton } from '../components/ui/States.jsx'
import { useToast } from '../components/ui/toastContext.js'
import { useBoard, useDeleteBoard, useUpdateBoard } from '../features/boards/hooks.js'
import { useCards, useCreateCard } from '../features/cards/hooks.js'
import { useCreateList, useDeleteList, useLists, useUpdateList } from '../features/lists/hooks.js'

function ListColumn({ list, boardId, onOpenCard }) {
  const [cardTitle, setCardTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const cards = useCards(list._id)
  const createCard = useCreateCard(boardId)
  const updateList = useUpdateList(boardId, list._id)
  const deleteList = useDeleteList(boardId)
  const { showToast } = useToast()

  const submitCard = (event) => {
    event.preventDefault()
    if (!cardTitle.trim()) return

    createCard.mutate(
      { listId: list._id, title: cardTitle },
      {
        onSuccess: () => {
          setCardTitle('')
          setAdding(false)
          cards.refetch()
        },
        onError: (error) => showToast({ tone: 'error', title: 'Card not created', message: error.message }),
      },
    )
  }

  return (
    <section className="flex max-h-full w-80 shrink-0 flex-col rounded-lg border border-line bg-white shadow-sm" data-testid="list-column">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-3">
        <div className="min-w-0">
          <button
            type="button"
            className="focus-ring rounded text-left text-sm font-semibold text-ink-900"
            onClick={() => {
              const name = window.prompt('List name', list.name)
              if (name?.trim()) updateList.mutate({ name })
            }}
          >
            {list.name}
          </button>
          <p className="text-xs text-ink-500">{cards.data?.length || 0} cards</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => window.confirm('Delete this list?') && deleteList.mutate(list._id)} aria-label="Delete list">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-warm-50/70 p-3 scrollbar-soft">
        {cards.isLoading && (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-20" />
          </>
        )}
        {cards.data?.map((card) => (
          <button
            key={card._id}
            type="button"
            data-testid="card-item"
            onClick={() => onOpenCard(card)}
            className="focus-ring block w-full rounded-lg border border-line bg-white p-3 text-left shadow-sm transition hover:border-accent-100 hover:shadow-md"
          >
            <h3 className="text-sm font-semibold text-ink-900">{card.title}</h3>
            {card.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink-500">{card.description}</p>}
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="neutral">#{card.position + 1}</Badge>
              <MoreHorizontal className="h-4 w-4 text-ink-500" />
            </div>
          </button>
        ))}
        {adding ? (
          <form className="rounded-lg border border-line bg-white p-2 shadow-sm" onSubmit={submitCard}>
            <Input autoFocus placeholder="Card title" value={cardTitle} onChange={(event) => setCardTitle(event.target.value)} />
            <div className="mt-2 flex gap-2">
              <Button size="sm" type="submit" loading={createCard.isPending}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <Button className="w-full justify-start" variant="ghost" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" /> Add card
          </Button>
        )}
      </div>
    </section>
  )
}

export default function BoardPage() {
  const { workspaceId, boardId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [listOpen, setListOpen] = useState(false)
  const [boardOpen, setBoardOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [listName, setListName] = useState('')
  const [boardForm, setBoardForm] = useState({ title: '', description: '' })
  const board = useBoard(boardId)
  const lists = useLists(boardId)
  const createList = useCreateList(boardId)
  const updateBoard = useUpdateBoard(workspaceId, boardId)
  const deleteBoard = useDeleteBoard(workspaceId)

  const submitList = (event) => {
    event.preventDefault()
    createList.mutate(
      { boardId, name: listName },
      {
        onSuccess: () => {
          setListName('')
          setListOpen(false)
        },
        onError: (error) => showToast({ tone: 'error', title: 'List not created', message: error.message }),
      },
    )
  }

  const openBoardEdit = () => {
    setBoardForm({ title: board.data?.title || '', description: board.data?.description || '' })
    setBoardOpen(true)
  }

  const submitBoard = (event) => {
    event.preventDefault()
    updateBoard.mutate(
      { title: boardForm.title, description: boardForm.description || undefined },
      {
        onSuccess: () => setBoardOpen(false),
        onError: (error) => showToast({ tone: 'error', title: 'Board not updated', message: error.message }),
      },
    )
  }

  const removeBoard = () => {
    if (!window.confirm('Delete this board?')) return
    deleteBoard.mutate(boardId, {
      onSuccess: () => navigate(`/workspaces/${workspaceId}`),
      onError: (error) => showToast({ tone: 'error', title: 'Board not deleted', message: error.message }),
    })
  }

  if (board.isLoading) return <LoadingState label="Loading board..." />
  if (board.isError) return <div className="p-6"><ErrorState message={board.error.message} /></div>

  return (
    <div className="flex h-[calc(100vh-4rem)] min-w-0 flex-col">
      <div className="border-b border-line bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold text-ink-900">{board.data.title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-ink-500">{board.data.description || 'Build lists, cards, comments, and attachments here.'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={openBoardEdit}>Edit board</Button>
            <Button variant="danger" onClick={removeBoard}><Trash2 className="h-4 w-4" /> Delete</Button>
            <Button onClick={() => setListOpen(true)}><Plus className="h-4 w-4" /> Add list</Button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-hidden p-4 scrollbar-soft sm:p-6">
        {lists.isLoading && <LoadingState label="Loading lists..." />}
        {lists.isError && <ErrorState message={lists.error.message} />}
        {lists.data?.length === 0 && (
          <EmptyState title="No lists yet" description="Add workflow columns like To Do, In Progress, Review, and Done." action={<Button onClick={() => setListOpen(true)}><Plus className="h-4 w-4" /> Add first list</Button>} />
        )}
        <div className="flex h-full gap-4">
          {lists.data?.map((list) => (
            <ListColumn key={list._id} list={list} boardId={boardId} onOpenCard={setSelectedCard} />
          ))}
          {lists.data?.length > 0 && (
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="focus-ring flex h-28 w-72 shrink-0 items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-white/70 text-sm font-medium text-ink-700 hover:bg-white"
            >
              <Plus className="h-4 w-4" /> Add list
            </button>
          )}
        </div>
      </div>

      <Modal open={listOpen} title="Create list" onClose={() => setListOpen(false)} footer={<><Button variant="secondary" onClick={() => setListOpen(false)}>Cancel</Button><Button type="submit" form="list-form" loading={createList.isPending}>Create</Button></>}>
        <form id="list-form" onSubmit={submitList}>
          <Field label="List name"><Input required maxLength={100} value={listName} onChange={(event) => setListName(event.target.value)} /></Field>
        </form>
      </Modal>

      <Modal open={boardOpen} title="Edit board" onClose={() => setBoardOpen(false)} footer={<><Button variant="secondary" onClick={() => setBoardOpen(false)}>Cancel</Button><Button type="submit" form="board-edit-form" loading={updateBoard.isPending}>Save</Button></>}>
        <form id="board-edit-form" className="space-y-4" onSubmit={submitBoard}>
          <Field label="Title"><Input required minLength={3} maxLength={100} value={boardForm.title} onChange={(event) => setBoardForm((current) => ({ ...current, title: event.target.value }))} /></Field>
          <Field label="Description"><Textarea maxLength={500} value={boardForm.description} onChange={(event) => setBoardForm((current) => ({ ...current, description: event.target.value }))} /></Field>
        </form>
      </Modal>

      <CardDetailModal card={selectedCard} open={Boolean(selectedCard)} onClose={() => setSelectedCard(null)} />
    </div>
  )
}

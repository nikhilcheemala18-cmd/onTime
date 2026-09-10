import { Download, Paperclip, Send, Trash2 } from '../ui/icons.jsx'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import Badge from '../ui/Badge.jsx'
import Button from '../ui/Button.jsx'
import { Field, Input, Textarea } from '../ui/FormControls.jsx'
import Modal from '../ui/Modal.jsx'
import { EmptyState, ErrorState, LoadingState } from '../ui/States.jsx'
import { useToast } from '../ui/toastContext.js'
import { downloadAttachment } from '../../features/attachments/api.js'
import { useAttachments, useDeleteAttachment, useUploadAttachment } from '../../features/attachments/hooks.js'
import { useDeleteCard, useUpdateCard } from '../../features/cards/hooks.js'
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from '../../features/comments/hooks.js'
import { formatDateTime, formatFileSize } from '../../lib/format.js'

export default function CardDetailModal({ card, open, onClose }) {
  const user = useSelector((state) => state.auth.user)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ title: card?.title || '', description: card?.description || '' })
  const [comment, setComment] = useState('')
  const [uploadProgress, setUploadProgress] = useState(null)
  const { showToast } = useToast()
  const comments = useComments(card?._id)
  const attachments = useAttachments(card?._id)
  const updateCard = useUpdateCard(card?._id)
  const deleteCard = useDeleteCard()
  const createComment = useCreateComment(card?._id)
  const updateComment = useUpdateComment(card?._id)
  const deleteComment = useDeleteComment(card?._id)
  const uploadAttachment = useUploadAttachment(card?._id)
  const deleteAttachment = useDeleteAttachment(card?._id)

  if (!card) return null

  const submitCard = (event) => {
    event.preventDefault()
    updateCard.mutate(form, {
      onSuccess: () => setEditing(false),
      onError: (error) => showToast({ tone: 'error', title: 'Card not updated', message: error.message }),
    })
  }

  const submitComment = (event) => {
    event.preventDefault()
    if (!comment.trim()) return
    createComment.mutate(
      { cardId: card._id, content: comment },
      {
        onSuccess: () => setComment(''),
        onError: (error) => showToast({ tone: 'error', title: 'Comment not added', message: error.message }),
      },
    )
  }

  const uploadFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    uploadAttachment.mutate(
      {
        cardId: card._id,
        file,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total))
          }
        },
      },
      {
        onSettled: () => {
          setUploadProgress(null)
          event.target.value = ''
        },
        onError: (error) => showToast({ tone: 'error', title: 'Upload failed', message: error.message }),
      },
    )
  }

  const removeCard = () => {
    if (!window.confirm('Delete this card?')) return
    deleteCard.mutate(card._id, {
      onSuccess: onClose,
      onError: (error) => showToast({ tone: 'error', title: 'Card not deleted', message: error.message }),
    })
  }

  return (
    <Modal
      open={open}
      title="Card details"
      onClose={onClose}
      footer={
        <>
          <Button variant="danger" onClick={removeCard} loading={deleteCard.isPending}>
            <Trash2 className="h-4 w-4" /> Delete card
          </Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </>
      }
    >
      <div className="space-y-6">
        {editing ? (
          <form className="space-y-4" onSubmit={submitCard}>
            <Field label="Title"><Input required maxLength={200} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></Field>
            <Field label="Description"><Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></Field>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" loading={updateCard.isPending}>Save card</Button>
            </div>
          </form>
        ) : (
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-ink-900">{card.title}</h3>
                <p className="mt-1 text-xs text-ink-500">Created {formatDateTime(card.createdAt)}</p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => {
                setForm({ title: card.title, description: card.description || '' })
                setEditing(true)
              }}>
                Edit
              </Button>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-ink-700">{card.description || 'No description yet.'}</p>
          </div>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-ink-900">Attachments</h4>
            <Badge tone="neutral">{attachments.data?.length || 0}</Badge>
          </div>
          <label className="focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-line bg-warm-50 px-4 py-3 text-sm font-medium text-ink-700 hover:bg-warm-100">
            <Paperclip className="h-4 w-4" />
            {uploadProgress === null ? 'Upload attachment' : `Uploading ${uploadProgress}%`}
            <input className="sr-only" type="file" onChange={uploadFile} disabled={uploadAttachment.isPending} />
          </label>
          <div className="mt-3 space-y-2">
            {attachments.isLoading && <LoadingState label="Loading attachments..." />}
            {attachments.data?.map((attachment) => (
              <div key={attachment._id} className="flex items-center gap-3 rounded-md border border-line px-3 py-2" data-testid="attachment-row">
                <Paperclip className="h-4 w-4 text-ink-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{attachment.originalName}</p>
                  <p className="text-xs text-ink-500">{formatFileSize(attachment.size)}</p>
                </div>
                <Button variant="ghost" size="icon" aria-label="Download attachment" onClick={() => downloadAttachment(attachment)}>
                  <Download className="h-4 w-4" />
                </Button>
                {attachment.uploadedBy === user?._id && (
                  <Button variant="ghost" size="icon" onClick={() => deleteAttachment.mutate(attachment._id)} aria-label="Delete attachment">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="mb-3 font-semibold text-ink-900">Comments</h4>
          {comments.isLoading && <LoadingState label="Loading comments..." />}
          {comments.isError && <ErrorState message={comments.error.message} />}
          {comments.data?.length === 0 && <EmptyState title="No comments" description="Start the discussion for this card." />}
          <div className="space-y-3">
            {comments.data?.map((item) => (
              <div key={item._id} className="rounded-md border border-line bg-warm-50 p-3" data-testid="comment-row">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-500">{formatDateTime(item.createdAt)}</p>
                  {item.createdBy === user?._id && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => {
                        const content = window.prompt('Edit comment', item.content)
                        if (content?.trim()) updateComment.mutate({ id: item._id, payload: { content } })
                      }}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => window.confirm('Delete this comment?') && deleteComment.mutate(item._id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-wrap text-sm text-ink-700">{item.content}</p>
              </div>
            ))}
          </div>
          <form className="mt-4 flex gap-2" onSubmit={submitComment}>
            <Input aria-label="Add comment" placeholder="Add a comment..." value={comment} onChange={(event) => setComment(event.target.value)} />
            <Button type="submit" loading={createComment.isPending} aria-label="Post comment">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </section>
      </div>
    </Modal>
  )
}

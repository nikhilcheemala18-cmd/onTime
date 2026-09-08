import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { Board } from '../board/board.model.js'
import { Card } from '../card/card.model.js'
import { List } from '../list/list.model.js'
import { assertWorkspacePermission } from '../member/member.authorization.js'
import { broadcastWorkspaceEvent } from '../../realtime/broadcaster.js'
import { Comment } from './comment.model.js'

function assertCommentCreator(userId, comment) {
  if (comment.createdBy.toString() !== userId) {
    throw new AppError('You are not allowed to modify this comment', 403)
  }
}

async function getAuthorizedCard(userId, cardId) {
  const card = await Card.findById(cardId)

  if (!card) {
    throw new AppError('Card not found', 404)
  }

  const list = await List.findById(card.list)

  if (!list) {
    throw new AppError('List not found', 404)
  }

  const board = await Board.findById(list.board)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  await assertWorkspacePermission(userId, board.workspace)

  return card
}

async function getAuthorizedComment(userId, commentId) {
  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new AppError('Comment not found', 404)
  }

  await getAuthorizedCard(userId, comment.card)

  return comment
}

export async function createComment(userId, payload) {
  const card = await getAuthorizedCard(userId, payload.cardId)
  const list = await List.findById(card.list)
  const board = await Board.findById(list.board)

  const comment = await Comment.create({
    content: payload.content,
    card: card._id,
    createdBy: userId,
  })

  await recordActivity({
    action: 'comment.created',
    entityType: 'comment',
    entityId: comment._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      preview: comment.content.slice(0, 120),
    },
  })

  broadcastWorkspaceEvent({
    type: 'comment.created',
    workspaceId: board.workspace,
    data: {
      comment,
    },
  })

  return comment
}

export async function listComments(userId, cardId) {
  await getAuthorizedCard(userId, cardId)

  return Comment.find({ card: cardId }).sort({ createdAt: 1 })
}

export async function getCommentById(userId, commentId) {
  return getAuthorizedComment(userId, commentId)
}

export async function updateComment(userId, commentId, payload) {
  const comment = await getAuthorizedComment(userId, commentId)

  assertCommentCreator(userId, comment)

  const changedFields = Object.keys(payload)
  const card = await Card.findById(comment.card)
  const list = await List.findById(card.list)
  const board = await Board.findById(list.board)

  Object.assign(comment, payload)
  await comment.save()

  await recordActivity({
    action: 'comment.updated',
    entityType: 'comment',
    entityId: comment._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      changedFields,
      preview: comment.content.slice(0, 120),
    },
  })

  broadcastWorkspaceEvent({
    type: 'comment.updated',
    workspaceId: board.workspace,
    data: {
      comment,
      changedFields,
    },
  })

  return comment
}

export async function deleteComment(userId, commentId) {
  const comment = await getAuthorizedComment(userId, commentId)

  assertCommentCreator(userId, comment)
  const card = await Card.findById(comment.card)
  const list = await List.findById(card.list)
  const board = await Board.findById(list.board)
  await comment.deleteOne()

  await recordActivity({
    action: 'comment.deleted',
    entityType: 'comment',
    entityId: comment._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      preview: comment.content.slice(0, 120),
    },
  })

  broadcastWorkspaceEvent({
    type: 'comment.deleted',
    workspaceId: board.workspace,
    data: {
      commentId: comment._id,
      card: comment.card,
    },
  })
}

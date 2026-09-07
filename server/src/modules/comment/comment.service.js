import { AppError } from '../../utils/AppError.js'
import { Board } from '../board/board.model.js'
import { Card } from '../card/card.model.js'
import { List } from '../list/list.model.js'
import { Workspace } from '../workspace/workspace.model.js'
import { Comment } from './comment.model.js'

async function getWorkspaceForBoard(board) {
  const workspace = await Workspace.findById(board.workspace)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  return workspace
}

async function assertWorkspaceOwner(userId, workspace) {
  if (workspace.owner.toString() !== userId) {
    throw new AppError('You are not allowed to access this workspace', 403)
  }
}

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

  const workspace = await getWorkspaceForBoard(board)
  await assertWorkspaceOwner(userId, workspace)

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

  return Comment.create({
    content: payload.content,
    card: card._id,
    createdBy: userId,
  })
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

  Object.assign(comment, payload)
  await comment.save()

  return comment
}

export async function deleteComment(userId, commentId) {
  const comment = await getAuthorizedComment(userId, commentId)

  assertCommentCreator(userId, comment)
  await comment.deleteOne()
}

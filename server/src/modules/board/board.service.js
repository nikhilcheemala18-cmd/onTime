import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { assertWorkspacePermission } from '../member/member.authorization.js'
import { Board } from './board.model.js'

export async function createBoard(userId, payload) {
  await assertWorkspacePermission(userId, payload.workspaceId)

  const board = await Board.create({
    title: payload.title,
    description: payload.description,
    workspace: payload.workspaceId,
    createdBy: userId,
  })

  await recordActivity({
    action: 'board.created',
    entityType: 'board',
    entityId: board._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      title: board.title,
    },
  })

  return board
}

export async function listBoards(userId, workspaceId) {
  await assertWorkspacePermission(userId, workspaceId)

  return Board.find({ workspace: workspaceId }).sort({ createdAt: -1 })
}

export async function getBoardById(userId, boardId) {
  const board = await Board.findById(boardId)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  await assertWorkspacePermission(userId, board.workspace)

  return board
}

export async function updateBoard(userId, boardId, payload) {
  const changedFields = Object.keys(payload)
  const board = await Board.findById(boardId)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  await assertWorkspacePermission(userId, board.workspace)

  Object.assign(board, payload)
  await board.save()

  await recordActivity({
    action: 'board.updated',
    entityType: 'board',
    entityId: board._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      changedFields,
    },
  })

  return board
}

export async function deleteBoard(userId, boardId) {
  const board = await Board.findById(boardId)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  await assertWorkspacePermission(userId, board.workspace)
  await board.deleteOne()

  await recordActivity({
    action: 'board.deleted',
    entityType: 'board',
    entityId: board._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      title: board.title,
    },
  })
}

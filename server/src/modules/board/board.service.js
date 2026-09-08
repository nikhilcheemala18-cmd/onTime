import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { Workspace } from '../workspace/workspace.model.js'
import { Board } from './board.model.js'

async function assertWorkspaceOwner(ownerId, workspaceId) {
  const workspace = await Workspace.exists({
    _id: workspaceId,
    owner: ownerId,
  })

  if (!workspace) {
    throw new AppError('You are not allowed to access this workspace', 403)
  }
}

export async function createBoard(userId, payload) {
  await assertWorkspaceOwner(userId, payload.workspaceId)

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
  await assertWorkspaceOwner(userId, workspaceId)

  return Board.find({ workspace: workspaceId }).sort({ createdAt: -1 })
}

export async function getBoardById(userId, boardId) {
  const board = await Board.findById(boardId)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  await assertWorkspaceOwner(userId, board.workspace)

  return board
}

export async function updateBoard(userId, boardId, payload) {
  const changedFields = Object.keys(payload)
  const board = await Board.findById(boardId)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  await assertWorkspaceOwner(userId, board.workspace)

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

  await assertWorkspaceOwner(userId, board.workspace)
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

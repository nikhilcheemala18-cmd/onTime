import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { Board } from '../board/board.model.js'
import { Workspace } from '../workspace/workspace.model.js'
import { List } from './list.model.js'

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

async function getAuthorizedBoard(userId, boardId) {
  const board = await Board.findById(boardId)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  const workspace = await getWorkspaceForBoard(board)
  await assertWorkspaceOwner(userId, workspace)

  return board
}

async function getAuthorizedList(userId, listId) {
  const list = await List.findById(listId)

  if (!list) {
    throw new AppError('List not found', 404)
  }

  await getAuthorizedBoard(userId, list.board)

  return list
}

async function getNextPosition(boardId) {
  const lastList = await List.findOne({ board: boardId }).sort({ position: -1 })

  return lastList ? lastList.position + 1 : 0
}

export async function createList(userId, payload) {
  const board = await getAuthorizedBoard(userId, payload.boardId)
  const position = await getNextPosition(board._id)

  const list = await List.create({
    name: payload.name,
    board: board._id,
    position,
    createdBy: userId,
  })

  await recordActivity({
    action: 'list.created',
    entityType: 'list',
    entityId: list._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      name: list.name,
      position: list.position,
    },
  })

  return list
}

export async function listLists(userId, boardId) {
  await getAuthorizedBoard(userId, boardId)

  return List.find({ board: boardId }).sort({ position: 1 })
}

export async function getListById(userId, listId) {
  return getAuthorizedList(userId, listId)
}

export async function updateList(userId, listId, payload) {
  const changedFields = Object.keys(payload)
  const list = await getAuthorizedList(userId, listId)
  const board = await Board.findById(list.board)

  Object.assign(list, payload)
  await list.save()

  await recordActivity({
    action: 'list.updated',
    entityType: 'list',
    entityId: list._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      changedFields,
    },
  })

  return list
}

export async function deleteList(userId, listId) {
  const list = await getAuthorizedList(userId, listId)
  const board = await Board.findById(list.board)

  await list.deleteOne()

  await recordActivity({
    action: 'list.deleted',
    entityType: 'list',
    entityId: list._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      name: list.name,
    },
  })
}

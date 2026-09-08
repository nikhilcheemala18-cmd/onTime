import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { Board } from '../board/board.model.js'
import { List } from '../list/list.model.js'
import { Workspace } from '../workspace/workspace.model.js'
import { Card } from './card.model.js'

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

async function getAuthorizedList(userId, listId) {
  const list = await List.findById(listId)

  if (!list) {
    throw new AppError('List not found', 404)
  }

  const board = await Board.findById(list.board)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  const workspace = await getWorkspaceForBoard(board)
  await assertWorkspaceOwner(userId, workspace)

  return list
}

async function getAuthorizedCard(userId, cardId) {
  const card = await Card.findById(cardId)

  if (!card) {
    throw new AppError('Card not found', 404)
  }

  await getAuthorizedList(userId, card.list)

  return card
}

async function getNextPosition(listId) {
  const lastCard = await Card.findOne({ list: listId }).sort({ position: -1 })

  return lastCard ? lastCard.position + 1 : 0
}

export async function createCard(userId, payload) {
  const list = await getAuthorizedList(userId, payload.listId)
  const board = await Board.findById(list.board)
  const position = await getNextPosition(list._id)

  const card = await Card.create({
    title: payload.title,
    description: payload.description,
    list: list._id,
    position,
    createdBy: userId,
  })

  await recordActivity({
    action: 'card.created',
    entityType: 'card',
    entityId: card._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      title: card.title,
      position: card.position,
    },
  })

  return card
}

export async function listCards(userId, listId) {
  await getAuthorizedList(userId, listId)

  return Card.find({ list: listId }).sort({ position: 1 })
}

export async function getCardById(userId, cardId) {
  return getAuthorizedCard(userId, cardId)
}

export async function updateCard(userId, cardId, payload) {
  const changedFields = Object.keys(payload)
  const card = await getAuthorizedCard(userId, cardId)
  const list = await List.findById(card.list)
  const board = await Board.findById(list.board)

  Object.assign(card, payload)
  await card.save()

  await recordActivity({
    action: 'card.updated',
    entityType: 'card',
    entityId: card._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      changedFields,
    },
  })

  return card
}

export async function deleteCard(userId, cardId) {
  const card = await getAuthorizedCard(userId, cardId)
  const list = await List.findById(card.list)
  const board = await Board.findById(list.board)

  await card.deleteOne()

  await recordActivity({
    action: 'card.deleted',
    entityType: 'card',
    entityId: card._id,
    workspaceId: board.workspace,
    performedBy: userId,
    metadata: {
      title: card.title,
    },
  })
}

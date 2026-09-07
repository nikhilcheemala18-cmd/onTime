import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createCard,
  deleteCard,
  getCardById,
  listCards,
  updateCard,
} from './card.service.js'

export const create = asyncHandler(async (req, res) => {
  const card = await createCard(req.user.id, req.body)

  res.status(201).json({
    success: true,
    data: card,
  })
})

export const list = asyncHandler(async (req, res) => {
  const cards = await listCards(req.user.id, req.query.listId)

  res.status(200).json({
    success: true,
    data: cards,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const card = await getCardById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: card,
  })
})

export const update = asyncHandler(async (req, res) => {
  const card = await updateCard(req.user.id, req.params.id, req.body)

  res.status(200).json({
    success: true,
    data: card,
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteCard(req.user.id, req.params.id)

  res.status(204).send()
})

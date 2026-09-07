import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createList,
  deleteList,
  getListById,
  listLists,
  updateList,
} from './list.service.js'

export const create = asyncHandler(async (req, res) => {
  const list = await createList(req.user.id, req.body)

  res.status(201).json({
    success: true,
    data: list,
  })
})

export const list = asyncHandler(async (req, res) => {
  const lists = await listLists(req.user.id, req.query.boardId)

  res.status(200).json({
    success: true,
    data: lists,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const list = await getListById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: list,
  })
})

export const update = asyncHandler(async (req, res) => {
  const list = await updateList(req.user.id, req.params.id, req.body)

  res.status(200).json({
    success: true,
    data: list,
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteList(req.user.id, req.params.id)

  res.status(204).send()
})

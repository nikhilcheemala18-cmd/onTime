import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createBoard,
  deleteBoard,
  getBoardById,
  listBoards,
  updateBoard,
} from './board.service.js'

export const create = asyncHandler(async (req, res) => {
  const board = await createBoard(req.user.id, req.body)

  res.status(201).json({
    success: true,
    data: board,
  })
})

export const list = asyncHandler(async (req, res) => {
  const boards = await listBoards(req.user.id, req.query.workspaceId)

  res.status(200).json({
    success: true,
    data: boards,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const board = await getBoardById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: board,
  })
})

export const update = asyncHandler(async (req, res) => {
  const board = await updateBoard(req.user.id, req.params.id, req.body)

  res.status(200).json({
    success: true,
    data: board,
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteBoard(req.user.id, req.params.id)

  res.status(204).send()
})

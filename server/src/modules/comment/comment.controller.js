import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createComment,
  deleteComment,
  getCommentById,
  listComments,
  updateComment,
} from './comment.service.js'

export const create = asyncHandler(async (req, res) => {
  const comment = await createComment(req.user.id, req.body)

  res.status(201).json({
    success: true,
    data: comment,
  })
})

export const list = asyncHandler(async (req, res) => {
  const comments = await listComments(req.user.id, req.query.cardId)

  res.status(200).json({
    success: true,
    data: comments,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const comment = await getCommentById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: comment,
  })
})

export const update = asyncHandler(async (req, res) => {
  const comment = await updateComment(req.user.id, req.params.id, req.body)

  res.status(200).json({
    success: true,
    data: comment,
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteComment(req.user.id, req.params.id)

  res.status(204).send()
})

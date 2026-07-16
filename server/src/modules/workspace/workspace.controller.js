import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspaceById,
  listWorkspaces,
  updateWorkspace,
} from './workspace.service.js'

export const create = asyncHandler(async (req, res) => {
  const workspace = await createWorkspace(req.user.id, req.body)

  res.status(201).json({
    success: true,
    data: workspace,
  })
})

export const list = asyncHandler(async (req, res) => {
  const workspaces = await listWorkspaces(req.user.id)

  res.status(200).json({
    success: true,
    data: workspaces,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const workspace = await getWorkspaceById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: workspace,
  })
})

export const update = asyncHandler(async (req, res) => {
  const workspace = await updateWorkspace(req.user.id, req.params.id, req.body)

  res.status(200).json({
    success: true,
    data: workspace,
  })
})

export const remove = asyncHandler(async (req, res) => {
  await deleteWorkspace(req.user.id, req.params.id)

  res.status(204).send()
})

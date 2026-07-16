import { AppError } from '../../utils/AppError.js'
import { Workspace } from './workspace.model.js'

export async function createWorkspace(ownerId, payload) {
  return Workspace.create({
    ...payload,
    owner: ownerId,
  })
}

export async function listWorkspaces(ownerId) {
  return Workspace.find({ owner: ownerId }).sort({ createdAt: -1 })
}

export async function getWorkspaceById(ownerId, workspaceId) {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    owner: ownerId,
  })

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  return workspace
}

export async function updateWorkspace(ownerId, workspaceId, payload) {
  const workspace = await Workspace.findOneAndUpdate(
    {
      _id: workspaceId,
      owner: ownerId,
    },
    payload,
    {
      new: true,
      runValidators: true,
    },
  )

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  return workspace
}

export async function deleteWorkspace(ownerId, workspaceId) {
  const workspace = await Workspace.findOneAndDelete({
    _id: workspaceId,
    owner: ownerId,
  })

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }
}

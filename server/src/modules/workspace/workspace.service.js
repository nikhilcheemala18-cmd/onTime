import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { Workspace } from './workspace.model.js'

export async function createWorkspace(ownerId, payload) {
  const workspace = await Workspace.create({
    ...payload,
    owner: ownerId,
  })

  await recordActivity({
    action: 'workspace.created',
    entityType: 'workspace',
    entityId: workspace._id,
    workspaceId: workspace._id,
    performedBy: ownerId,
    metadata: {
      name: workspace.name,
    },
  })

  return workspace
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
  const changedFields = Object.keys(payload)
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

  await recordActivity({
    action: 'workspace.updated',
    entityType: 'workspace',
    entityId: workspace._id,
    workspaceId: workspace._id,
    performedBy: ownerId,
    metadata: {
      changedFields,
    },
  })

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

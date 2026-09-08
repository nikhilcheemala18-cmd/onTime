import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { assertWorkspacePermission } from '../member/member.authorization.js'
import { createOwnerMembership } from '../member/member.service.js'
import { WorkspaceMember } from '../member/member.model.js'
import { broadcastWorkspaceEvent } from '../../realtime/broadcaster.js'
import { Workspace } from './workspace.model.js'

export async function createWorkspace(ownerId, payload) {
  const workspace = await Workspace.create({
    ...payload,
    owner: ownerId,
  })
  await createOwnerMembership(workspace._id, ownerId)

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

  broadcastWorkspaceEvent({
    type: 'workspace.created',
    workspaceId: workspace._id,
    data: {
      workspace,
    },
  })

  return workspace
}

export async function listWorkspaces(ownerId) {
  const memberships = await WorkspaceMember.find({ user: ownerId }).select('workspace')
  const workspaceIds = memberships.map((membership) => membership.workspace)

  return Workspace.find({
    $or: [{ owner: ownerId }, { _id: { $in: workspaceIds } }],
  }).sort({ createdAt: -1 })
}

export async function getWorkspaceById(ownerId, workspaceId) {
  const { workspace } = await assertWorkspacePermission(ownerId, workspaceId)

  return workspace
}

export async function updateWorkspace(ownerId, workspaceId, payload) {
  const changedFields = Object.keys(payload)
  await assertWorkspacePermission(ownerId, workspaceId)
  const workspace = await Workspace.findByIdAndUpdate(
    workspaceId,
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

  broadcastWorkspaceEvent({
    type: 'workspace.updated',
    workspaceId: workspace._id,
    data: {
      workspace,
      changedFields,
    },
  })

  return workspace
}

export async function deleteWorkspace(ownerId, workspaceId) {
  const { workspace } = await assertWorkspacePermission(ownerId, workspaceId)

  if (workspace.owner.toString() !== ownerId) {
    throw new AppError('Only the workspace owner can delete this workspace', 403)
  }

  await workspace.deleteOne()

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }
}

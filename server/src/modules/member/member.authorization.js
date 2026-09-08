import { AppError } from '../../utils/AppError.js'
import { Workspace } from '../workspace/workspace.model.js'
import { WorkspaceMember } from './member.model.js'

const permissionsByRole = {
  owner: ['workspace:access', 'member:manage'],
  admin: ['workspace:access', 'member:manage'],
  member: ['workspace:access'],
}

export async function getWorkspaceMembership(userId, workspaceId) {
  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  let membership = await WorkspaceMember.findOne({
    workspace: workspace._id,
    user: userId,
  })

  if (!membership && workspace.owner.toString() === userId) {
    membership = await WorkspaceMember.findOneAndUpdate(
      {
        workspace: workspace._id,
        user: userId,
      },
      {
        role: 'owner',
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    )
  }

  if (!membership) {
    throw new AppError('You are not a member of this workspace', 403)
  }

  return {
    workspace,
    membership,
    role: membership.role,
  }
}

export async function assertWorkspacePermission(
  userId,
  workspaceId,
  permission = 'workspace:access',
) {
  const context = await getWorkspaceMembership(userId, workspaceId)
  const permissions = permissionsByRole[context.role] || []

  if (!permissions.includes(permission)) {
    throw new AppError('You do not have permission to perform this action', 403)
  }

  return context
}

export function canManageTargetRole(requesterRole, targetRole) {
  if (requesterRole === 'owner') {
    return targetRole !== 'owner'
  }

  if (requesterRole === 'admin') {
    return targetRole === 'member'
  }

  return false
}

import { AppError } from '../../utils/AppError.js'
import { recordActivity } from '../activity/activity.service.js'
import { User } from '../auth/auth.model.js'
import {
  broadcastWorkspaceEvent,
  removeUserFromWorkspaceRoom,
} from '../../realtime/broadcaster.js'
import { createNotification } from '../notification/notification.service.js'
import {
  assertWorkspacePermission,
  canManageTargetRole,
  getWorkspaceMembership,
} from './member.authorization.js'
import { WorkspaceMember } from './member.model.js'

function assertCanManageMember(requesterRole, targetRole) {
  if (!canManageTargetRole(requesterRole, targetRole)) {
    throw new AppError('You do not have permission to manage this member', 403)
  }
}

function assertNotCanonicalOwner(workspace, targetMembership) {
  if (workspace.owner.toString() === targetMembership.user.toString()) {
    throw new AppError('The workspace owner cannot be modified or removed', 403)
  }
}

export async function createOwnerMembership(workspaceId, userId) {
  return WorkspaceMember.findOneAndUpdate(
    {
      workspace: workspaceId,
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

export async function addWorkspaceMember(userId, workspaceId, payload) {
  const { membership: requesterMembership, workspace } =
    await assertWorkspacePermission(userId, workspaceId, 'member:manage')

  const targetUser = await User.findById(payload.userId)

  if (!targetUser) {
    throw new AppError('User not found', 404)
  }

  const existingMembership = await WorkspaceMember.exists({
    workspace: workspaceId,
    user: payload.userId,
  })

  if (existingMembership) {
    throw new AppError('User is already a member of this workspace', 409)
  }

  if (requesterMembership.role === 'admin' && payload.role === 'admin') {
    throw new AppError('You do not have permission to add admins', 403)
  }

  const membership = await WorkspaceMember.create({
    workspace: workspaceId,
    user: payload.userId,
    role: payload.role,
  })

  await recordActivity({
    action: 'member.added',
    entityType: 'member',
    entityId: membership._id,
    workspaceId,
    performedBy: userId,
    metadata: {
      targetUserId: membership.user,
      role: membership.role,
    },
  })

  await createNotification({
    recipient: membership.user,
    workspace: workspace._id,
    type: 'member.added',
    message: `You were added to ${workspace.name} as ${membership.role}.`,
    actor: userId,
    entityType: 'workspace_member',
    entityId: membership._id,
  })

  broadcastWorkspaceEvent({
    type: 'member.added',
    workspaceId,
    data: {
      member: membership,
    },
  })

  return WorkspaceMember.findById(membership._id).populate(
    'user',
    'name email createdAt',
  )
}

export async function listWorkspaceMembers(userId, workspaceId) {
  await assertWorkspacePermission(userId, workspaceId)

  return WorkspaceMember.find({ workspace: workspaceId })
    .sort({ createdAt: 1 })
    .populate('user', 'name email createdAt')
}

export async function getMyWorkspaceMembership(userId, workspaceId) {
  const { membership } = await getWorkspaceMembership(userId, workspaceId)

  return WorkspaceMember.findById(membership._id).populate(
    'user',
    'name email createdAt',
  )
}

export async function updateWorkspaceMemberRole(
  userId,
  workspaceId,
  memberId,
  payload,
) {
  const { membership: requesterMembership, workspace } =
    await assertWorkspacePermission(userId, workspaceId, 'member:manage')
  const targetMembership = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId,
  })

  if (!targetMembership) {
    throw new AppError('Membership not found', 404)
  }

  assertNotCanonicalOwner(workspace, targetMembership)
  assertCanManageMember(requesterMembership.role, targetMembership.role)

  const previousRole = targetMembership.role
  targetMembership.role = payload.role
  await targetMembership.save()

  await recordActivity({
    action: 'member.role_updated',
    entityType: 'member',
    entityId: targetMembership._id,
    workspaceId,
    performedBy: userId,
    metadata: {
      targetUserId: targetMembership.user,
      previousRole,
      newRole: targetMembership.role,
    },
  })

  await createNotification({
    recipient: targetMembership.user,
    workspace: workspace._id,
    type: 'member.role_updated',
    message: `Your role in ${workspace.name} was changed to ${targetMembership.role}.`,
    actor: userId,
    entityType: 'workspace_member',
    entityId: targetMembership._id,
  })

  broadcastWorkspaceEvent({
    type: 'member.role_updated',
    workspaceId,
    data: {
      member: targetMembership,
      previousRole,
      newRole: targetMembership.role,
    },
  })

  return WorkspaceMember.findById(targetMembership._id).populate(
    'user',
    'name email createdAt',
  )
}

export async function removeWorkspaceMember(userId, workspaceId, memberId) {
  const { membership: requesterMembership, workspace } =
    await assertWorkspacePermission(userId, workspaceId, 'member:manage')
  const targetMembership = await WorkspaceMember.findOne({
    _id: memberId,
    workspace: workspaceId,
  })

  if (!targetMembership) {
    throw new AppError('Membership not found', 404)
  }

  assertNotCanonicalOwner(workspace, targetMembership)
  assertCanManageMember(requesterMembership.role, targetMembership.role)

  await targetMembership.deleteOne()

  await recordActivity({
    action: 'member.removed',
    entityType: 'member',
    entityId: targetMembership._id,
    workspaceId,
    performedBy: userId,
    metadata: {
      targetUserId: targetMembership.user,
      previousRole: targetMembership.role,
    },
  })

  await createNotification({
    recipient: targetMembership.user,
    workspace: workspace._id,
    type: 'member.removed',
    message: `You were removed from ${workspace.name}.`,
    actor: userId,
    entityType: 'workspace_member',
    entityId: targetMembership._id,
  })

  removeUserFromWorkspaceRoom(targetMembership.user, workspaceId)

  broadcastWorkspaceEvent({
    type: 'member.removed',
    workspaceId,
    data: {
      memberId: targetMembership._id,
      user: targetMembership.user,
      previousRole: targetMembership.role,
    },
  })
}

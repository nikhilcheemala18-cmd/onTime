import { AppError } from '../../utils/AppError.js'
import { Workspace } from '../workspace/workspace.model.js'
import { Activity } from './activity.model.js'
import { createActivitySchema } from './activity.validation.js'

async function getOwnedWorkspace(userId, workspaceId) {
  const workspace = await Workspace.findById(workspaceId)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  if (workspace.owner.toString() !== userId) {
    throw new AppError('You are not allowed to access this workspace', 403)
  }

  return workspace
}

export async function recordActivity({
  action,
  entityType,
  entityId,
  workspaceId,
  performedBy,
  metadata,
}) {
  try {
    const payload = {
      action,
      entityType,
      entityId: entityId.toString(),
      workspace: workspaceId.toString(),
      performedBy: performedBy.toString(),
      metadata,
    }
    const result = createActivitySchema.safeParse(payload)

    if (!result.success) {
      return
    }

    await Activity.create(result.data)
  } catch {
    // Activity logging is best-effort and must not break the primary operation.
  }
}

export async function listActivities(userId, { workspaceId, page, limit }) {
  await getOwnedWorkspace(userId, workspaceId)

  const skip = (page - 1) * limit
  const [activities, total] = await Promise.all([
    Activity.find({ workspace: workspaceId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Activity.countDocuments({ workspace: workspaceId }),
  ])

  return {
    activities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getActivityById(userId, activityId) {
  const activity = await Activity.findById(activityId)

  if (!activity) {
    throw new AppError('Activity not found', 404)
  }

  await getOwnedWorkspace(userId, activity.workspace)

  return activity
}

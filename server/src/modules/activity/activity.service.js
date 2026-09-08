import { AppError } from '../../utils/AppError.js'
import { assertWorkspacePermission } from '../member/member.authorization.js'
import { Activity } from './activity.model.js'
import { createActivitySchema } from './activity.validation.js'

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
  await assertWorkspacePermission(userId, workspaceId)

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

  await assertWorkspacePermission(userId, activity.workspace)

  return activity
}

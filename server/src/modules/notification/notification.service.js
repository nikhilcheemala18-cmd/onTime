import { AppError } from '../../utils/AppError.js'
import { broadcastUserEvent } from '../../realtime/broadcaster.js'
import { Notification } from './notification.model.js'
import { createNotificationSchema } from './notification.validation.js'

function buildNotificationPayload(notification) {
  return {
    id: notification._id.toString(),
    type: notification.type,
    message: notification.message,
    entityType: notification.entityType,
    entityId: notification.entityId?.toString(),
    actor: notification.actor.toString(),
    createdAt: notification.createdAt,
  }
}

export async function createNotification(payload) {
  try {
    const result = createNotificationSchema.safeParse({
      recipient: payload.recipient.toString(),
      workspace: payload.workspace.toString(),
      type: payload.type,
      message: payload.message,
      entityType: payload.entityType,
      entityId: payload.entityId?.toString(),
      actor: payload.actor.toString(),
    })

    if (!result.success || result.data.recipient === result.data.actor) {
      return null
    }

    const notification = await Notification.create(result.data)

    broadcastUserEvent({
      userId: notification.recipient,
      type: 'notification.created',
      workspaceId: notification.workspace,
      data: buildNotificationPayload(notification),
    })

    return notification
  } catch {
    return null
  }
}

export async function listNotifications(userId, { page, limit, unread }) {
  const query = {
    recipient: userId,
  }

  if (unread === true) {
    query.readAt = null
  }

  const skip = (page - 1) * limit
  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('actor', 'name email createdAt'),
    Notification.countDocuments(query),
  ])

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getUnreadNotificationCount(userId) {
  const count = await Notification.countDocuments({
    recipient: userId,
    readAt: null,
  })

  return {
    count,
  }
}

export async function markNotificationRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      recipient: userId,
    },
    {
      readAt: new Date(),
    },
    {
      new: true,
    },
  ).populate('actor', 'name email createdAt')

  if (!notification) {
    throw new AppError('Notification not found', 404)
  }

  return notification
}

export async function markAllNotificationsRead(userId) {
  const result = await Notification.updateMany(
    {
      recipient: userId,
      readAt: null,
    },
    {
      readAt: new Date(),
    },
  )

  return {
    updatedCount: result.modifiedCount,
  }
}

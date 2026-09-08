import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service.js'

export const list = asyncHandler(async (req, res) => {
  const notifications = await listNotifications(req.user.id, req.query)

  res.status(200).json({
    success: true,
    data: notifications,
  })
})

export const unreadCount = asyncHandler(async (req, res) => {
  const count = await getUnreadNotificationCount(req.user.id)

  res.status(200).json({
    success: true,
    data: count,
  })
})

export const markRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: notification,
  })
})

export const markAllRead = asyncHandler(async (req, res) => {
  const result = await markAllNotificationsRead(req.user.id)

  res.status(200).json({
    success: true,
    data: result,
  })
})

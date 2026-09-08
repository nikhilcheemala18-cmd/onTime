import { z } from 'zod'
import { notificationTypes } from './notification.model.js'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

const unreadSchema = z.preprocess((value) => {
  if (value === undefined) {
    return undefined
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return value
}, z.boolean().optional())

export const notificationIdParamSchema = z.object({
  id: objectIdSchema,
})

export const notificationQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  unread: unreadSchema,
})

export const createNotificationSchema = z.object({
  recipient: objectIdSchema,
  workspace: objectIdSchema,
  type: z.enum(notificationTypes),
  message: z.string().trim().min(1, 'Notification message is required'),
  entityType: z.string().trim().min(1).optional(),
  entityId: objectIdSchema.optional(),
  actor: objectIdSchema,
})

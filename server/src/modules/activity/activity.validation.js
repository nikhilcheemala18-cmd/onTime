import { z } from 'zod'

export const activityActions = [
  'workspace.created',
  'workspace.updated',
  'board.created',
  'board.updated',
  'board.deleted',
  'list.created',
  'list.updated',
  'list.deleted',
  'card.created',
  'card.updated',
  'card.deleted',
  'comment.created',
  'comment.updated',
  'comment.deleted',
  'attachment.uploaded',
  'attachment.deleted',
  'member.added',
  'member.role_updated',
  'member.removed',
]

export const activityEntityTypes = [
  'workspace',
  'board',
  'list',
  'card',
  'comment',
  'attachment',
  'member',
]

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

export const activityIdParamSchema = z.object({
  id: objectIdSchema,
})

export const activityQuerySchema = z.object({
  workspaceId: objectIdSchema,
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
})

export const createActivitySchema = z.object({
  action: z.enum(activityActions),
  entityType: z.enum(activityEntityTypes),
  entityId: objectIdSchema,
  workspace: objectIdSchema,
  performedBy: objectIdSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
})

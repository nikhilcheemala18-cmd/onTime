import { z } from 'zod'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

const contentSchema = z
  .string()
  .trim()
  .min(1, 'Comment content must be at least 1 character')
  .max(2000, 'Comment content cannot exceed 2000 characters')

export const commentIdParamSchema = z.object({
  id: objectIdSchema,
})

export const commentQuerySchema = z.object({
  cardId: objectIdSchema,
})

export const createCommentSchema = z.object({
  content: contentSchema,
  cardId: objectIdSchema,
})

export const updateCommentSchema = z
  .object({
    content: contentSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

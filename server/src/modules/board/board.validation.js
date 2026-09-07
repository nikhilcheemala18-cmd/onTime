import { z } from 'zod'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

const titleSchema = z
  .string()
  .trim()
  .min(3, 'Board title must be at least 3 characters')
  .max(100, 'Board title cannot exceed 100 characters')

const descriptionSchema = z
  .string()
  .trim()
  .max(500, 'Board description cannot exceed 500 characters')

export const boardIdParamSchema = z.object({
  id: objectIdSchema,
})

export const boardListQuerySchema = z.object({
  workspaceId: objectIdSchema,
})

export const createBoardSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  workspaceId: objectIdSchema,
})

export const updateBoardSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

import { z } from 'zod'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

const nameSchema = z
  .string()
  .trim()
  .min(1, 'List name must be at least 1 character')
  .max(100, 'List name cannot exceed 100 characters')

const positionSchema = z
  .number()
  .int('List position must be an integer')
  .min(0, 'List position cannot be negative')

export const listIdParamSchema = z.object({
  id: objectIdSchema,
})

export const listQuerySchema = z.object({
  boardId: objectIdSchema,
})

export const createListSchema = z.object({
  name: nameSchema,
  boardId: objectIdSchema,
})

export const updateListSchema = z
  .object({
    name: nameSchema.optional(),
    position: positionSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

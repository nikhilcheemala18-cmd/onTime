import { z } from 'zod'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

const titleSchema = z
  .string()
  .trim()
  .min(1, 'Card title must be at least 1 character')
  .max(200, 'Card title cannot exceed 200 characters')

const descriptionSchema = z.string().trim()

const positionSchema = z
  .number()
  .int('Card position must be an integer')
  .min(0, 'Card position cannot be negative')

export const cardIdParamSchema = z.object({
  id: objectIdSchema,
})

export const cardQuerySchema = z.object({
  listId: objectIdSchema,
})

export const createCardSchema = z.object({
  title: titleSchema,
  description: descriptionSchema.optional(),
  listId: objectIdSchema,
})

export const updateCardSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema.optional(),
    position: positionSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

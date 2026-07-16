import { z } from 'zod'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Workspace id must be a valid ObjectId')

const nameSchema = z
  .string()
  .trim()
  .min(3, 'Workspace name must be at least 3 characters')
  .max(80, 'Workspace name cannot exceed 80 characters')

const descriptionSchema = z
  .string()
  .trim()
  .max(500, 'Workspace description cannot exceed 500 characters')

export const workspaceIdParamSchema = z.object({
  id: objectIdSchema,
})

export const createWorkspaceSchema = z.object({
  name: nameSchema,
  description: descriptionSchema.optional(),
})

export const updateWorkspaceSchema = z
  .object({
    name: nameSchema.optional(),
    description: descriptionSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

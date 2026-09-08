import { z } from 'zod'

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Id must be a valid ObjectId')

export const attachmentIdParamSchema = z.object({
  id: objectIdSchema,
})

export const attachmentQuerySchema = z.object({
  cardId: objectIdSchema,
})

export const createAttachmentSchema = z.object({
  cardId: objectIdSchema,
})

export const attachmentMetadataSchema = z.object({
  filename: z.string().trim().min(1, 'Filename is required'),
  originalName: z.string().trim().min(1, 'Original filename is required'),
  mimeType: z.string().trim().min(1, 'MIME type is required'),
  size: z.number().min(1, 'Attachment size must be at least 1 byte'),
  url: z.string().trim().min(1, 'Attachment URL is required'),
  card: objectIdSchema,
  uploadedBy: objectIdSchema,
})

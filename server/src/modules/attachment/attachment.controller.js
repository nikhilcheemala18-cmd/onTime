import { asyncHandler } from '../../utils/asyncHandler.js'
import {
  createAttachment,
  deleteAttachment,
  getAttachmentById,
  getAttachmentFile,
  listAttachments,
} from './attachment.service.js'

export const create = asyncHandler(async (req, res) => {
  const attachment = await createAttachment(req.user.id, req.body, req.file)

  res.status(201).json({
    success: true,
    data: attachment,
  })
})

export const list = asyncHandler(async (req, res) => {
  const attachments = await listAttachments(req.user.id, req.query.cardId)

  res.status(200).json({
    success: true,
    data: attachments,
  })
})

export const getById = asyncHandler(async (req, res) => {
  const attachment = await getAttachmentById(req.user.id, req.params.id)

  res.status(200).json({
    success: true,
    data: attachment,
  })
})

export const download = asyncHandler(async (req, res) => {
  const { attachment, filePath } = await getAttachmentFile(req.user.id, req.params.id)

  res.download(filePath, attachment.originalName)
})

export const remove = asyncHandler(async (req, res) => {
  await deleteAttachment(req.user.id, req.params.id)

  res.status(204).send()
})

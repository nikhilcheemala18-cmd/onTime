import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { AppError } from '../../utils/AppError.js'
import { Board } from '../board/board.model.js'
import { Card } from '../card/card.model.js'
import { List } from '../list/list.model.js'
import { Workspace } from '../workspace/workspace.model.js'
import { Attachment } from './attachment.model.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.resolve(__dirname, '../../../uploads/attachments')
const MAX_FILE_SIZE = 10 * 1024 * 1024

const allowedTypes = new Map([
  ['.png', ['image/png']],
  ['.jpg', ['image/jpeg']],
  ['.jpeg', ['image/jpeg']],
  ['.gif', ['image/gif']],
  ['.webp', ['image/webp']],
  ['.pdf', ['application/pdf']],
  ['.txt', ['text/plain']],
  ['.csv', ['text/csv', 'text/plain']],
  ['.doc', ['application/msword']],
  [
    '.docx',
    [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ],
  ],
  ['.xls', ['application/vnd.ms-excel']],
  [
    '.xlsx',
    [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
    ],
  ],
  ['.ppt', ['application/vnd.ms-powerpoint']],
  [
    '.pptx',
    [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
    ],
  ],
])

async function removeStoredFile(filePath) {
  if (!filePath) {
    return
  }

  const resolvedPath = path.resolve(filePath)

  if (!resolvedPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return
  }

  try {
    await fs.unlink(resolvedPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

function getSafeExtension(originalName) {
  const extension = path.extname(originalName || '').toLowerCase()

  if (!extension || !allowedTypes.has(extension)) {
    throw new AppError('Attachment file type is not allowed', 400)
  }

  return extension
}

function assertSafeUploadFile(file) {
  if (!file) {
    throw new AppError('Attachment file is required', 400)
  }

  if (!file.originalname || file.originalname !== path.basename(file.originalname)) {
    throw new AppError('Attachment filename is invalid', 400)
  }

  if (!file.filename || file.filename !== path.basename(file.filename)) {
    throw new AppError('Stored attachment filename is invalid', 400)
  }

  if (!file.mimetype) {
    throw new AppError('Attachment MIME type is required', 400)
  }

  if (!file.size || file.size < 1) {
    throw new AppError('Attachment file is empty', 400)
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError('Attachment file cannot exceed 10 MB', 400)
  }

  const extension = getSafeExtension(file.originalname)
  const allowedMimeTypes = allowedTypes.get(extension)

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError('Attachment file type does not match its MIME type', 400)
  }

  return extension
}

async function assertFileSignature(file, extension) {
  const fileBuffer = await fs.readFile(file.path)

  if (!fileBuffer.length) {
    throw new AppError('Attachment file is empty', 400)
  }

  const hex = fileBuffer.subarray(0, 8).toString('hex')
  const text = fileBuffer.subarray(0, 16).toString('utf8')

  if (extension === '.png' && !hex.startsWith('89504e47')) {
    throw new AppError('Attachment file content does not match PNG type', 400)
  }

  if ((extension === '.jpg' || extension === '.jpeg') && !hex.startsWith('ffd8ff')) {
    throw new AppError('Attachment file content does not match JPEG type', 400)
  }

  if (extension === '.gif' && !text.startsWith('GIF87a') && !text.startsWith('GIF89a')) {
    throw new AppError('Attachment file content does not match GIF type', 400)
  }

  if (extension === '.webp' && (!text.startsWith('RIFF') || text.slice(8, 12) !== 'WEBP')) {
    throw new AppError('Attachment file content does not match WEBP type', 400)
  }

  if (extension === '.pdf' && !text.startsWith('%PDF-')) {
    throw new AppError('Attachment file content does not match PDF type', 400)
  }

  if (['.docx', '.xlsx', '.pptx'].includes(extension) && !hex.startsWith('504b0304')) {
    throw new AppError('Attachment file content does not match Office document type', 400)
  }

  if (['.doc', '.xls', '.ppt'].includes(extension) && !hex.startsWith('d0cf11e0')) {
    throw new AppError('Attachment file content does not match Office document type', 400)
  }

  if (['.txt', '.csv'].includes(extension) && fileBuffer.includes(0)) {
    throw new AppError('Attachment text file content is invalid', 400)
  }
}

export async function validateAttachmentUploadFile(file) {
  const extension = assertSafeUploadFile(file)
  const resolvedPath = path.resolve(file.path)

  if (!resolvedPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new AppError('Stored attachment path is invalid', 400)
  }

  await assertFileSignature(file, extension)
}

async function getWorkspaceForBoard(board) {
  const workspace = await Workspace.findById(board.workspace)

  if (!workspace) {
    throw new AppError('Workspace not found', 404)
  }

  return workspace
}

async function assertWorkspaceOwner(userId, workspace) {
  if (workspace.owner.toString() !== userId) {
    throw new AppError('You are not allowed to access this workspace', 403)
  }
}

function assertAttachmentUploader(userId, attachment) {
  if (attachment.uploadedBy.toString() !== userId) {
    throw new AppError('You are not allowed to delete this attachment', 403)
  }
}

async function getAuthorizedCard(userId, cardId) {
  const card = await Card.findById(cardId)

  if (!card) {
    throw new AppError('Card not found', 404)
  }

  const list = await List.findById(card.list)

  if (!list) {
    throw new AppError('List not found', 404)
  }

  const board = await Board.findById(list.board)

  if (!board) {
    throw new AppError('Board not found', 404)
  }

  const workspace = await getWorkspaceForBoard(board)
  await assertWorkspaceOwner(userId, workspace)

  return card
}

async function getAuthorizedAttachment(userId, attachmentId) {
  const attachment = await Attachment.findById(attachmentId)

  if (!attachment) {
    throw new AppError('Attachment not found', 404)
  }

  await getAuthorizedCard(userId, attachment.card)

  return attachment
}

export async function createAttachment(userId, payload, file) {
  try {
    const card = await getAuthorizedCard(userId, payload.cardId)

    await validateAttachmentUploadFile(file)

    const attachment = await Attachment.create({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: '/api/attachments/pending/download',
      card: card._id,
      uploadedBy: userId,
    })

    attachment.url = `/api/attachments/${attachment._id}/download`
    await attachment.save()

    return attachment
  } catch (error) {
    await removeStoredFile(file?.path)
    throw error
  }
}

export async function listAttachments(userId, cardId) {
  await getAuthorizedCard(userId, cardId)

  return Attachment.find({ card: cardId }).sort({ createdAt: 1 })
}

export async function getAttachmentById(userId, attachmentId) {
  return getAuthorizedAttachment(userId, attachmentId)
}

export async function getAttachmentFile(userId, attachmentId) {
  const attachment = await getAuthorizedAttachment(userId, attachmentId)
  const filePath = path.resolve(uploadsRoot, attachment.filename)

  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    throw new AppError('Attachment file path is invalid', 400)
  }

  try {
    await fs.access(filePath)
  } catch {
    throw new AppError('Attachment file not found', 404)
  }

  return {
    attachment,
    filePath,
  }
}

export async function deleteAttachment(userId, attachmentId) {
  const attachment = await getAuthorizedAttachment(userId, attachmentId)

  assertAttachmentUploader(userId, attachment)

  const filePath = path.resolve(uploadsRoot, attachment.filename)

  await attachment.deleteOne()
  await removeStoredFile(filePath)
}

export { MAX_FILE_SIZE, uploadsRoot }

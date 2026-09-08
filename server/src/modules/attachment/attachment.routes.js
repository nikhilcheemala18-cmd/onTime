import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { AppError } from '../../utils/AppError.js'
import { create, download, getById, list, remove } from './attachment.controller.js'
import {
  attachmentIdParamSchema,
  attachmentQuerySchema,
  createAttachmentSchema,
} from './attachment.validation.js'
import { MAX_FILE_SIZE, uploadsRoot } from './attachment.service.js'

const router = Router()

fs.mkdirSync(uploadsRoot, { recursive: true })

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadsRoot)
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase()
    callback(null, `${crypto.randomUUID()}${extension}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
})

function removeUploadedFile(file) {
  if (!file?.path) {
    return
  }

  const resolvedPath = path.resolve(file.path)

  if (!resolvedPath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return
  }

  fs.unlink(resolvedPath, () => {})
}

function handleUpload(req, res, next) {
  upload.single('file')(req, res, (error) => {
    if (!error) {
      return next()
    }

    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Attachment file cannot exceed 10 MB', 400))
    }

    return next(new AppError(error.message || 'Attachment upload failed', 400))
  })
}

function validateUploadedBody(schema) {
  const validator = validate(schema)

  return (req, res, next) => {
    validator(req, res, (error) => {
      if (error) {
        removeUploadedFile(req.file)
      }

      next(error)
    })
  }
}

router.use(authenticate)

router
  .route('/')
  .post(handleUpload, validateUploadedBody(createAttachmentSchema), create)
  .get(validate(attachmentQuerySchema, 'query'), list)

router.get(
  '/:id/download',
  validate(attachmentIdParamSchema, 'params'),
  download,
)

router
  .route('/:id')
  .get(validate(attachmentIdParamSchema, 'params'), getById)
  .delete(validate(attachmentIdParamSchema, 'params'), remove)

export default router

import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { create, getById, list, remove, update } from './comment.controller.js'
import {
  commentIdParamSchema,
  commentQuerySchema,
  createCommentSchema,
  updateCommentSchema,
} from './comment.validation.js'

const router = Router()

router.use(authenticate)

router
  .route('/')
  .post(validate(createCommentSchema), create)
  .get(validate(commentQuerySchema, 'query'), list)

router
  .route('/:id')
  .get(validate(commentIdParamSchema, 'params'), getById)
  .patch(
    validate(commentIdParamSchema, 'params'),
    validate(updateCommentSchema),
    update,
  )
  .delete(validate(commentIdParamSchema, 'params'), remove)

export default router

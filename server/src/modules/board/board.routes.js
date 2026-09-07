import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { create, getById, list, remove, update } from './board.controller.js'
import {
  boardIdParamSchema,
  boardListQuerySchema,
  createBoardSchema,
  updateBoardSchema,
} from './board.validation.js'

const router = Router()

router.use(authenticate)

router
  .route('/')
  .post(validate(createBoardSchema), create)
  .get(validate(boardListQuerySchema, 'query'), list)

router
  .route('/:id')
  .get(validate(boardIdParamSchema, 'params'), getById)
  .patch(
    validate(boardIdParamSchema, 'params'),
    validate(updateBoardSchema),
    update,
  )
  .delete(validate(boardIdParamSchema, 'params'), remove)

export default router

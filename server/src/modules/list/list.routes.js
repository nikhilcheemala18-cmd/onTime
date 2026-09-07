import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { create, getById, list, remove, update } from './list.controller.js'
import {
  createListSchema,
  listIdParamSchema,
  listQuerySchema,
  updateListSchema,
} from './list.validation.js'

const router = Router()

router.use(authenticate)

router
  .route('/')
  .post(validate(createListSchema), create)
  .get(validate(listQuerySchema, 'query'), list)

router
  .route('/:id')
  .get(validate(listIdParamSchema, 'params'), getById)
  .patch(
    validate(listIdParamSchema, 'params'),
    validate(updateListSchema),
    update,
  )
  .delete(validate(listIdParamSchema, 'params'), remove)

export default router

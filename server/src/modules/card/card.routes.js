import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { create, getById, list, remove, update } from './card.controller.js'
import {
  cardIdParamSchema,
  cardQuerySchema,
  createCardSchema,
  updateCardSchema,
} from './card.validation.js'

const router = Router()

router.use(authenticate)

router
  .route('/')
  .post(validate(createCardSchema), create)
  .get(validate(cardQuerySchema, 'query'), list)

router
  .route('/:id')
  .get(validate(cardIdParamSchema, 'params'), getById)
  .patch(
    validate(cardIdParamSchema, 'params'),
    validate(updateCardSchema),
    update,
  )
  .delete(validate(cardIdParamSchema, 'params'), remove)

export default router

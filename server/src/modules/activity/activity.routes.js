import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { getById, list } from './activity.controller.js'
import {
  activityIdParamSchema,
  activityQuerySchema,
} from './activity.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', validate(activityQuerySchema, 'query'), list)
router.get('/:id', validate(activityIdParamSchema, 'params'), getById)

export default router

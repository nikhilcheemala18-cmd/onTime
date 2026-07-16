import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { create, getById, list, remove, update } from './workspace.controller.js'
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceIdParamSchema,
} from './workspace.validation.js'

const router = Router()

router.use(authenticate)

router
  .route('/')
  .post(validate(createWorkspaceSchema), create)
  .get(list)

router
  .route('/:id')
  .get(validate(workspaceIdParamSchema, 'params'), getById)
  .patch(
    validate(workspaceIdParamSchema, 'params'),
    validate(updateWorkspaceSchema),
    update,
  )
  .delete(validate(workspaceIdParamSchema, 'params'), remove)

export default router

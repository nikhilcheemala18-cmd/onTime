import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { add, list, me, remove, updateRole } from './member.controller.js'
import {
  addMemberSchema,
  updateMemberRoleSchema,
  workspaceMemberIdParamSchema,
  workspaceMemberParamSchema,
} from './member.validation.js'

const router = Router({ mergeParams: true })

router.use(authenticate)

router
  .route('/')
  .post(
    validate(workspaceMemberParamSchema, 'params'),
    validate(addMemberSchema),
    add,
  )
  .get(validate(workspaceMemberParamSchema, 'params'), list)

router.get(
  '/me',
  validate(workspaceMemberParamSchema, 'params'),
  me,
)

router
  .route('/:memberId')
  .patch(
    validate(workspaceMemberIdParamSchema, 'params'),
    validate(updateMemberRoleSchema),
    updateRole,
  )
  .delete(validate(workspaceMemberIdParamSchema, 'params'), remove)

export default router

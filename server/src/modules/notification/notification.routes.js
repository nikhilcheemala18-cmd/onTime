import { Router } from 'express'
import { authenticate } from '../../middleware/authenticate.js'
import { validate } from '../../middleware/validate.js'
import { list, markAllRead, markRead, unreadCount } from './notification.controller.js'
import {
  notificationIdParamSchema,
  notificationQuerySchema,
} from './notification.validation.js'

const router = Router()

router.use(authenticate)

router.get('/', validate(notificationQuerySchema, 'query'), list)
router.get('/unread-count', unreadCount)
router.patch('/read-all', markAllRead)
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), markRead)

export default router

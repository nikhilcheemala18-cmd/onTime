import { Router } from 'express'
import { validate } from '../../middleware/validate.js'
import { login, register } from './auth.controller.js'
import { loginSchema, registerSchema } from './auth.validation.js'

const router = Router()

router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

export default router

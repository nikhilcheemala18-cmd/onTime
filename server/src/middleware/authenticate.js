import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../modules/auth/auth.model.js'

export const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization || ''
  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication token is required', 401)
  }

  let payload

  try {
    payload = jwt.verify(token, env.JWT_SECRET)
  } catch {
    throw new AppError('Authentication token is invalid or expired', 401)
  }

  const user = await User.findById(payload.sub)

  if (!user) {
    throw new AppError('Authenticated user no longer exists', 401)
  }

  req.user = {
    id: user._id.toString(),
  }

  next()
})

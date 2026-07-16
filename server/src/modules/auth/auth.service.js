import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/AppError.js'
import { User } from './auth.model.js'

const SALT_ROUNDS = 12

function signAccessToken(userId) {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  })
}

function buildAuthResponse(user) {
  return {
    user,
    token: signAccessToken(user._id.toString()),
  }
}

export async function registerUser({ name, email, password }) {
  const existingUser = await User.exists({ email })

  if (existingUser) {
    throw new AppError('Email is already in use', 409)
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const user = await User.create({ name, email, passwordHash })

  return buildAuthResponse(user)
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+passwordHash')

  if (!user) {
    throw new AppError('Invalid email or password', 401)
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  return buildAuthResponse(user)
}

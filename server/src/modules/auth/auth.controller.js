import { asyncHandler } from '../../utils/asyncHandler.js'
import { loginUser, registerUser } from './auth.service.js'

export const register = asyncHandler(async (req, res) => {
  const auth = await registerUser(req.body)

  res.status(201).json({
    success: true,
    data: auth,
  })
})

export const login = asyncHandler(async (req, res) => {
  const auth = await loginUser(req.body)

  res.status(200).json({
    success: true,
    data: auth,
  })
})

import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal server error'

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid resource identifier'
  }

  if (err.name === 'ValidationError') {
    statusCode = 400
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }

  if (err.code === 11000) {
    statusCode = 409
    message = 'Duplicate field value entered'
  }

  if (env.NODE_ENV === 'development') {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

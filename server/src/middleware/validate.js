import { AppError } from '../utils/AppError.js'

export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source])

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ')

      return next(new AppError(message, 400))
    }

    req[source] = result.data
    next()
  }

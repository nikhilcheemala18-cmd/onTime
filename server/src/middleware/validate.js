import { AppError } from '../utils/AppError.js'

function setValidatedSource(req, source, value) {
  Object.defineProperty(req, source, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  })
}

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

    setValidatedSource(req, source, result.data)
    next()
  }

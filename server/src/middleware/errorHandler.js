import { validationResult } from 'express-validator'

/**
 * Express middleware to attach validation errors to `next()`.
 * Use after express-validator chains: if (!errors.isEmpty()) return next(errors)
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const err = new Error('Validation failed')
    err.status = 400
    err.details = errors.array()
    return next(err)
  }
  next()
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  if (err.status === 400 || err.statusCode === 400) {
    return res.status(400).json({
      error: err.message || 'Validation failed',
      ...(err.details ? { details: err.details } : {}),
    })
  }

  if (err.status === 404 || err.statusCode === 404) {
    return res.status(404).json({ error: err.message || 'Not found' })
  }

  console.error(err)
  return res.status(500).json({ error: err.message || 'Internal server error' })
}

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import discussionsRouter from './routes/discussions.js'
import leadsRouter from './routes/leads.js'
import { errorHandler } from './middleware/errorHandler.js'

/**
 * CORS allowed origins from env (comma-separated). Sensible dev defaults if unset.
 */
export function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGINS
  if (raw && raw.trim()) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return ['http://localhost:5173', 'http://127.0.0.1:5173']
}

export function createApp() {
  const app = express()

  app.set('trust proxy', 1)

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(compression())

  app.use(
    cors({
      origin: (origin, cb) => {
        const allowed = parseCorsOrigins()
        if (!origin) return cb(null, true)
        if (allowed.includes(origin)) return cb(null, true)
        return cb(null, false)
      },
    }),
  )

  app.use(express.json({ limit: '256kb' }))

  const writeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.API_WRITE_RATE_LIMIT_MAX ?? 400),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many write requests, please try again later' },
  })

  app.use('/api', (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return next()
    }
    return writeLimiter(req, res, next)
  })

  app.use('/api/leads', discussionsRouter)
  app.use('/api/leads', leadsRouter)

  app.use(errorHandler)

  return app
}

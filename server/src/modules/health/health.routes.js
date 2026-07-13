import { Router } from 'express'
import mongoose from 'mongoose'
import { asyncHandler } from '../../utils/asyncHandler.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dbState = mongoose.connection.readyState
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected'

    res.status(dbState === 1 ? 200 : 503).json({
      success: true,
      status: dbState === 1 ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
    })
  }),
)

export default router

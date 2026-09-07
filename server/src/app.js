import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import authRoutes from './modules/auth/auth.routes.js'
import boardRoutes from './modules/board/board.routes.js'
import cardRoutes from './modules/card/card.routes.js'
import commentRoutes from './modules/comment/comment.routes.js'
import healthRoutes from './modules/health/health.routes.js'
import listRoutes from './modules/list/list.routes.js'
import workspaceRoutes from './modules/workspace/workspace.routes.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Real-Time Task Manager API',
    version: '1.0.0',
  })
})

app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/workspaces', workspaceRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/lists', listRoutes)
app.use('/api/cards', cardRoutes)
app.use('/api/comments', commentRoutes)

app.use(notFound)
app.use(errorHandler)

export default app

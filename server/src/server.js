import app from './app.js'
import { env } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'

async function startServer() {
  await connectDB()

  const server = app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
  })

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err)
    shutdown('unhandledRejection')
  })
}

startServer().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

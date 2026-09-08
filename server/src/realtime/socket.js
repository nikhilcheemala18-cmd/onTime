import jwt from 'jsonwebtoken'
import { Server } from 'socket.io'
import { env } from '../config/env.js'
import { User } from '../modules/auth/auth.model.js'
import { assertWorkspacePermission } from '../modules/member/member.authorization.js'
import { setSocketServer } from './broadcaster.js'
import { getUserRoom, getWorkspaceRoom } from './events.js'

function buildSocketError(code, message) {
  return {
    code,
    message,
  }
}

function getHandshakeToken(socket) {
  const authToken = socket.handshake.auth?.token
  const authorization = socket.handshake.headers?.authorization || ''
  const [scheme, headerToken] = authorization.split(' ')

  if (authToken) {
    return authToken
  }

  if (scheme === 'Bearer' && headerToken) {
    return headerToken
  }

  return null
}

async function authenticateSocket(socket, next) {
  const token = getHandshakeToken(socket)

  if (!token) {
    return next(new Error('UNAUTHORIZED: Authentication token is required'))
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET)
    const user = await User.findById(payload.sub)

    if (!user) {
      return next(new Error('UNAUTHORIZED: Authenticated user no longer exists'))
    }

    socket.user = {
      id: user._id.toString(),
    }

    return next()
  } catch {
    return next(
      new Error('UNAUTHORIZED: Authentication token is invalid or expired'),
    )
  }
}

function getSocketErrorCode(error) {
  if (error.statusCode === 403) {
    return 'FORBIDDEN'
  }

  if (error.statusCode === 404) {
    return 'NOT_FOUND'
  }

  return 'BAD_REQUEST'
}

function handleJoinWorkspace(socket) {
  return async (payload, callback) => {
    try {
      const workspaceId = payload?.workspaceId

      if (!workspaceId) {
        const error = buildSocketError('BAD_REQUEST', 'workspaceId is required')
        callback?.(error)
        return
      }

      await assertWorkspacePermission(socket.user.id, workspaceId)

      const room = getWorkspaceRoom(workspaceId)
      await socket.join(room)

      callback?.(null, {
        success: true,
        room,
      })
    } catch (error) {
      callback?.(
        buildSocketError(
          getSocketErrorCode(error),
          error.message || 'Unable to join workspace',
        ),
      )
    }
  }
}

function handleLeaveWorkspace(socket) {
  return async (payload, callback) => {
    try {
      const workspaceId = payload?.workspaceId

      if (!workspaceId) {
        const error = buildSocketError('BAD_REQUEST', 'workspaceId is required')
        callback?.(error)
        return
      }

      const room = getWorkspaceRoom(workspaceId)
      await socket.leave(room)

      callback?.(null, {
        success: true,
        room,
      })
    } catch {
      callback?.(buildSocketError('BAD_REQUEST', 'Unable to leave workspace'))
    }
  }
}

export function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  })

  io.use(authenticateSocket)

  io.on('connection', handleConnection)

  setSocketServer(io)

  return io
}

function handleConnection(socket) {
  socket.join(getUserRoom(socket.user.id))
  socket.on('workspace.join', handleJoinWorkspace(socket))
  socket.on('workspace.leave', handleLeaveWorkspace(socket))
  socket.on('disconnect', () => {})
}

export {
  authenticateSocket,
  buildSocketError,
  handleConnection,
  handleJoinWorkspace,
  handleLeaveWorkspace,
}

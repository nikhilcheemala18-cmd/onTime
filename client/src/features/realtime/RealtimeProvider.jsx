import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  connectRealtime,
  disconnectRealtime,
  getRealtimeSocket,
  joinWorkspaceRoom,
  leaveWorkspaceRoom,
} from './realtimeClient.js'

const workspaceEvents = [
  'workspace.created',
  'workspace.updated',
  'board.created',
  'board.updated',
  'board.deleted',
  'list.created',
  'list.updated',
  'list.deleted',
  'card.created',
  'card.updated',
  'card.deleted',
  'comment.created',
  'comment.updated',
  'comment.deleted',
  'attachment.uploaded',
  'attachment.deleted',
  'member.added',
  'member.role_updated',
  'member.removed',
]

function invalidateForEvent(queryClient, payload) {
  const workspaceId = payload?.workspaceId

  queryClient.invalidateQueries({ queryKey: ['workspaces'] })
  if (workspaceId) {
    queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['members', 'me', workspaceId] })
    queryClient.invalidateQueries({ queryKey: ['activities', workspaceId] })
  }

  queryClient.invalidateQueries({
    predicate: (query) =>
      ['board', 'lists', 'cards', 'card', 'comments', 'attachments'].includes(query.queryKey[0]),
  })
}

export default function RealtimeProvider({ children }) {
  const token = useSelector((state) => state.auth.token)
  const { workspaceId } = useParams()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!token) {
      disconnectRealtime()
      return undefined
    }

    const socket = connectRealtime(token)

    workspaceEvents.forEach((eventName) => {
      socket.on(eventName, (payload) => invalidateForEvent(queryClient, payload))
    })

    socket.on('notification.created', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      disconnectRealtime()
    }
  }, [queryClient, token])

  useEffect(() => {
    if (!token || !workspaceId) return undefined

    joinWorkspaceRoom(workspaceId)

    return () => {
      leaveWorkspaceRoom(workspaceId)
    }
  }, [token, workspaceId])

  useEffect(() => {
    const socket = getRealtimeSocket()
    if (!socket || !workspaceId) return undefined

    joinWorkspaceRoom(workspaceId)
    return undefined
  }, [workspaceId])

  return children
}


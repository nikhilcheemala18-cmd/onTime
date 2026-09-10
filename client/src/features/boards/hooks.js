import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBoard, deleteBoard, getBoard, listBoards, updateBoard } from './api.js'

export function useBoards(workspaceId) {
  return useQuery({
    queryKey: ['boards', workspaceId],
    queryFn: () => listBoards(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useBoard(id) {
  return useQuery({
    queryKey: ['board', id],
    queryFn: () => getBoard(id),
    enabled: Boolean(id),
  })
}

export function useCreateBoard(workspaceId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] }),
  })
}

export function useUpdateBoard(workspaceId, boardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id = boardId, payload, ...directPayload }) =>
      updateBoard(id, payload || directPayload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] })
      if (boardId) queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })
}

export function useDeleteBoard(workspaceId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', workspaceId] }),
  })
}

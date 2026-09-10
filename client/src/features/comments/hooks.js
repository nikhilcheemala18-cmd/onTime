import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createComment, deleteComment, listComments, updateComment } from './api.js'

export function useComments(cardId) {
  return useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => listComments(cardId),
    enabled: Boolean(cardId),
  })
}

export function useCreateComment(cardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', cardId] }),
  })
}

export function useUpdateComment(cardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }) => updateComment(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', cardId] }),
  })
}

export function useDeleteComment(cardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteComment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', cardId] }),
  })
}


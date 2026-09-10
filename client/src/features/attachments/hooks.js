import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteAttachment, listAttachments, uploadAttachment } from './api.js'

export function useAttachments(cardId) {
  return useQuery({
    queryKey: ['attachments', cardId],
    queryFn: () => listAttachments(cardId),
    enabled: Boolean(cardId),
  })
}

export function useUploadAttachment(cardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', cardId] }),
  })
}

export function useDeleteAttachment(cardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', cardId] }),
  })
}


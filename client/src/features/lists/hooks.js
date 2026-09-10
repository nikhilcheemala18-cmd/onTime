import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createList, deleteList, listLists, updateList } from './api.js'

export function useLists(boardId) {
  return useQuery({
    queryKey: ['lists', boardId],
    queryFn: () => listLists(boardId),
    enabled: Boolean(boardId),
  })
}

export function useCreateList(boardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] }),
  })
}

export function useUpdateList(boardId, listId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateList(listId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] }),
  })
}

export function useDeleteList(boardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteList,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] }),
  })
}


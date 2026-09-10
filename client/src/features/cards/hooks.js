import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createCard, deleteCard, getCard, listCards, updateCard } from './api.js'

export function useCards(listId) {
  return useQuery({
    queryKey: ['cards', listId],
    queryFn: () => listCards(listId),
    enabled: Boolean(listId),
  })
}

export function useCard(cardId) {
  return useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getCard(cardId),
    enabled: Boolean(cardId),
  })
}

export function useCreateCard(boardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lists', boardId] }),
  })
}

export function useUpdateCard(cardId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateCard(cardId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', cardId] })
      queryClient.invalidateQueries({ queryKey: ['cards'] })
    },
  })
}

export function useDeleteCard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cards'] }),
  })
}


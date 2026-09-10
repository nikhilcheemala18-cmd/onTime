import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addMember,
  getMyMembership,
  listMembers,
  removeMember,
  updateMemberRole,
} from './api.js'

export function useMembers(workspaceId) {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => listMembers(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useMyMembership(workspaceId) {
  return useQuery({
    queryKey: ['members', 'me', workspaceId],
    queryFn: () => getMyMembership(workspaceId),
    enabled: Boolean(workspaceId),
  })
}

export function useAddMember(workspaceId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => addMember(workspaceId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', workspaceId] }),
  })
}

export function useUpdateMemberRole(workspaceId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, payload }) => updateMemberRole(workspaceId, memberId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', workspaceId] }),
  })
}

export function useRemoveMember(workspaceId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId) => removeMember(workspaceId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['members', workspaceId] }),
  })
}


import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  listWorkspaces,
  updateWorkspace,
} from './api.js'

export function useWorkspaces() {
  return useQuery({ queryKey: ['workspaces'], queryFn: listWorkspaces })
}

export function useWorkspace(id) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn: () => getWorkspace(id),
    enabled: Boolean(id),
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}

export function useUpdateWorkspace(id) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload) => updateWorkspace(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspace', id] })
    },
  })
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkspace,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspaces'] }),
  })
}


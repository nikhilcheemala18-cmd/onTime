import { useQuery } from '@tanstack/react-query'
import { listActivities } from './api.js'

export function useActivities(workspaceId, page = 1) {
  return useQuery({
    queryKey: ['activities', workspaceId, page],
    queryFn: () => listActivities({ workspaceId, page, limit: 20 }),
    enabled: Boolean(workspaceId),
  })
}


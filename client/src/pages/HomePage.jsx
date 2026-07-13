import { useQuery } from '@tanstack/react-query'
import api from '../lib/axios.js'

async function fetchHealth() {
  const { data } = await api.get('/api/health')
  return data
}

export default function HomePage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">
        Real-Time Task Manager
      </h1>
      <p className="mt-2 text-gray-600">
        Foundation scaffold is ready. Features will be built on top of this
        structure.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500">API Health Check</h2>

        {isLoading && (
          <p className="mt-2 text-sm text-gray-400">Checking connection...</p>
        )}

        {isError && (
          <p className="mt-2 text-sm text-red-600">{error.message}</p>
        )}

        {data && (
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium capitalize text-gray-900">
                {data.status}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Database</dt>
              <dd className="font-medium capitalize text-gray-900">
                {data.database}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Uptime</dt>
              <dd className="font-medium text-gray-900">
                {Math.floor(data.uptime)}s
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Timestamp</dt>
              <dd className="font-medium text-gray-900">
                {new Date(data.timestamp).toLocaleTimeString()}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  )
}

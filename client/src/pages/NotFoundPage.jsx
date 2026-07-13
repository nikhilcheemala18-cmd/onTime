import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-2 text-lg text-gray-600">Page not found</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

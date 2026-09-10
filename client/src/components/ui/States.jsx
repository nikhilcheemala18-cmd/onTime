import { AlertCircle, Inbox, Loader2 } from './icons.jsx'
import Button from './Button.jsx'

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-line bg-white px-6 py-10 text-center">
      <Inbox className="h-8 w-8 text-ink-500" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-ink-500">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      {label}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">{title}</p>
          {message && <p className="mt-1">{message}</p>}
          {onRetry && (
            <Button className="mt-3" size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-warm-100 ${className}`} />
}

import { Bell, CheckCheck } from '../ui/icons.jsx'
import { useState } from 'react'
import Button from '../ui/Button.jsx'
import { EmptyState, LoadingState } from '../ui/States.jsx'
import { formatDateTime } from '../../lib/format.js'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '../../features/notifications/hooks.js'

export default function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const notifications = useNotifications({ page: 1, limit: 10 })
  const unread = useUnreadCount()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const count = unread.data?.count || 0

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="Open notifications" data-testid="notifications-button">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 top-11 z-30 w-[min(24rem,calc(100vw-1rem))] rounded-lg border border-line bg-white shadow-xl" data-testid="notifications-panel">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Notifications</h2>
              <p className="text-xs text-ink-500">{count} unread</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => markAll.mutate()} disabled={!count || markAll.isPending}>
              <CheckCheck className="h-4 w-4" /> Read all
            </Button>
          </div>
          <div className="max-h-96 overflow-y-auto p-2 scrollbar-soft">
            {notifications.isLoading && <LoadingState label="Loading notifications..." />}
            {notifications.data?.notifications?.length === 0 && (
              <EmptyState title="No notifications" description="Important updates for you will appear here." />
            )}
            {notifications.data?.notifications?.map((notification) => (
              <button
                key={notification._id}
                type="button"
                onClick={() => !notification.readAt && markRead.mutate(notification._id)}
                className={`focus-ring block w-full rounded-md px-3 py-2 text-left transition hover:bg-warm-100 ${
                  notification.readAt ? 'opacity-70' : 'bg-accent-50'
                }`}
              >
                <p className="text-sm font-medium text-ink-900">{notification.message}</p>
                <p className="mt-1 text-xs text-ink-500">{formatDateTime(notification.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

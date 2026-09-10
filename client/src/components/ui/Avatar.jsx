import { initials } from '../../lib/format.js'

export default function Avatar({ user, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : 'h-9 w-9 text-sm'

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-accent-100 font-semibold text-accent-700 ${sizeClass}`} title={user?.name || user?.email}>
      {initials(user?.name, user?.email)}
    </div>
  )
}


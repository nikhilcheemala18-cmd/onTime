export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </label>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-900 placeholder:text-ink-500 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`focus-ring min-h-24 w-full resize-y rounded-md border border-line bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-500 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`focus-ring h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink-900 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}


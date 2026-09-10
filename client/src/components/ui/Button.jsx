import { Loader2 } from './icons.jsx'

const variants = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700 border-accent-600',
  secondary: 'bg-white text-ink-700 hover:bg-warm-100 border-line',
  ghost: 'border-transparent text-ink-700 hover:bg-warm-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 border-red-600',
}

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-9 w-9 p-0',
}

export default function Button({
  as: Component = 'button',
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const elementProps =
    Component === 'button'
      ? { type, disabled: disabled || loading }
      : { 'aria-disabled': disabled || loading }

  return (
    <Component
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md border font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...elementProps}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  )
}

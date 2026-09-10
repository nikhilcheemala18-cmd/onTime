export default function Panel({ children, className = '', ...props }) {
  return (
    <section className={`rounded-lg border border-line bg-white shadow-sm ${className}`} {...props}>
      {children}
    </section>
  )
}

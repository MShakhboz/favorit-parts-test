export function Loader({ text = 'Загрузка…' }) {
  return (
    <span className="d-inline-flex align-items-center gap-2 text-body-secondary" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{text}</span>
    </span>
  )
}

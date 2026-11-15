export function ErrorAlert({ message }) {
  return (
    <div className="alert alert-danger d-flex align-items-start gap-2 mb-0" role="alert">
      <i className="bi bi-exclamation-triangle-fill flex-shrink-0" aria-hidden="true" />
      <div>
        <div className="fw-semibold">Не удалось загрузить данные</div>
        <div>{message}</div>
      </div>
    </div>
  )
}

export function ErrorAlert({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex align-items-start gap-3 mb-0" role="alert">
      <i className="bi bi-exclamation-circle alert-icon flex-shrink-0" aria-hidden="true" />
      <div>
        <div className="fw-semibold">Не удалось загрузить данные</div>
        <div className="small">{message}</div>
        {onRetry && (
          <button type="button" className="btn btn-link btn-sm alert-action p-0 mt-2" onClick={onRetry}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            Повторить
          </button>
        )}
      </div>
    </div>
  )
}

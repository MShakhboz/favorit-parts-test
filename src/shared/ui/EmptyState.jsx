export function EmptyState({ icon, title, children }) {
  return (
    <div className="empty-state text-center py-5 px-3">
      <div className="empty-state-icon mb-3" aria-hidden="true">
        <i className={`bi ${icon}`} />
      </div>
      <h2 className="h6 mb-1">{title}</h2>
      {children && (
        <p className="small text-body-secondary mx-auto mb-0" style={{ maxWidth: '28rem' }}>
          {children}
        </p>
      )}
    </div>
  )
}

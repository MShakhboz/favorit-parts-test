// compact — для узких колонок: на телефоне «нет» вместо «нет в наличии»
export function StockBadge({ count, compact = false }) {
  if (count > 0) {
    return <span className="badge rounded-pill bg-success-subtle text-success-emphasis">{count} шт.</span>
  }
  return (
    <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">
      {compact ? (
        <>
          <span className="d-none d-md-inline">нет в наличии</span>
          <span className="d-md-none">нет</span>
        </>
      ) : (
        'нет в наличии'
      )}
    </span>
  )
}

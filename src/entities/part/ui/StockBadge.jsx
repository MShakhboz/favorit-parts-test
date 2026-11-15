export function StockBadge({ count }) {
  if (count > 0) {
    return <span className="badge rounded-pill bg-success-subtle text-success-emphasis">{count} шт.</span>
  }
  return <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">нет в наличии</span>
}

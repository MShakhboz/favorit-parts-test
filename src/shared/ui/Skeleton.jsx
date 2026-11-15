// Заглушка строки текста. Обёртка берёт шрифт и межстрочный интервал у переданного класса
// (например, text-lg или stat-value), поэтому высота совпадает с настоящим текстом и после
// загрузки разметка не сдвигается. pill — заглушка бейджа
export function Skeleton({ width = '100%', pill = false, className = '' }) {
  if (pill) {
    return <span className={`skeleton skeleton-pill ${className}`} style={{ width }} aria-hidden="true" />
  }
  return (
    <span className={`skeleton-line ${className}`} style={{ width }} aria-hidden="true">
      <span className="skeleton" />
    </span>
  )
}

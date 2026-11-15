import { useSelector } from 'react-redux'
import { selectSearch } from '@/features/search'
import { ErrorAlert, Loader } from '@/shared/ui'

export function BrandList() {
  const { number, brands, brandsStatus, brandsError } = useSelector(selectSearch)

  if (brandsStatus === 'idle') return null
  if (brandsStatus === 'loading') return <Loader text="Ищем производителей…" />
  if (brandsStatus === 'failed') return <ErrorAlert message={brandsError} />
  if (brands.length === 0) {
    return <div className="alert alert-secondary">По артикулу «{number}» ничего не найдено.</div>
  }

  return (
    <div>
      <h2 className="h5 mb-3">Производители</h2>
      <div className="list-group">
        {brands.map((part) => (
          <button
            key={part.goodsID}
            type="button"
            className="list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-2"
          >
            <div>
              <div className="fw-semibold">{part.brand}</div>
              <div className="small text-secondary">
                {part.number} · {part.name}
              </div>
            </div>
            {part.count > 0 ? (
              <span className="badge text-bg-success">{part.count} шт.</span>
            ) : (
              <span className="badge text-bg-secondary">нет в наличии</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

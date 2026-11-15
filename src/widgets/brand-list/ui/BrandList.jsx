import { useDispatch, useSelector } from 'react-redux'
import { fetchOffers, selectSearch } from '@/features/search'
import { ErrorAlert, Loader } from '@/shared/ui'

export function BrandList() {
  const dispatch = useDispatch()
  const { number, brands, brandsStatus, brandsError, selectedPart } = useSelector(selectSearch)

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
            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start gap-2${
              part.goodsID === selectedPart?.goodsID ? ' active' : ''
            }`}
            onClick={() => dispatch(fetchOffers(part))}
          >
            <div>
              <div className="fw-semibold">{part.brand}</div>
              <div className="small opacity-75">
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

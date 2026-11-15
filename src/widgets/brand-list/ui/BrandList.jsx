import { useDispatch, useSelector } from 'react-redux'
import { StockBadge } from '@/entities/part'
import { fetchOffers, selectSearch } from '@/features/search'
import { EmptyState, ErrorAlert } from '@/shared/ui'

export function BrandList() {
  const dispatch = useDispatch()
  const { number, brands, brandsStatus, brandsError, selectedPart } = useSelector(selectSearch)

  if (brandsStatus === 'idle') return null
  if (brandsStatus === 'failed') return <ErrorAlert message={brandsError} />
  if (brandsStatus === 'succeeded' && brands.length === 0) {
    return (
      <EmptyState icon="bi-inbox" title={`По артикулу «${number}» ничего не найдено`}>
        Проверьте номер детали: возможно, в нём опечатка или лишние символы.
      </EmptyState>
    )
  }

  return (
    <section className="card shadow-sm brand-panel">
      <div className="card-header d-flex justify-content-between align-items-center py-3">
        <h2 className="h6 mb-0">Производители</h2>
        {brandsStatus === 'succeeded' && (
          <span className="badge rounded-pill text-bg-light border">{brands.length}</span>
        )}
      </div>
      {brandsStatus === 'loading' ? (
        <BrandListSkeleton />
      ) : (
        <div className="list-group list-group-flush">
          {brands.map((part) => {
            const isActive = part.goodsID === selectedPart?.goodsID
            return (
              <button
                key={part.goodsID}
                type="button"
                className={`list-group-item list-group-item-action py-3${isActive ? ' active' : ''}`}
                aria-current={isActive || undefined}
                onClick={() => dispatch(fetchOffers(part))}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <span className="fw-semibold">{part.brand}</span>
                  <StockBadge count={part.count} />
                </div>
                <div className="small font-monospace mt-1">{part.number}</div>
                <div className="small text-body-secondary">{part.name}</div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

function BrandListSkeleton() {
  return (
    <div className="list-group list-group-flush placeholder-glow" role="status" aria-busy="true">
      <span className="visually-hidden">Загрузка производителей…</span>
      {['a', 'b', 'c'].map((key) => (
        <div key={key} className="list-group-item py-3" aria-hidden="true">
          <span className="placeholder col-5 mb-2" />
          <span className="placeholder placeholder-sm col-3 d-block mb-1" />
          <span className="placeholder placeholder-sm col-8 d-block" />
        </div>
      ))}
    </div>
  )
}

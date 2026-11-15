import { useDispatch, useSelector } from 'react-redux'
import { getMinPrice, StockBadge } from '@/entities/part'
import { fetchBrands, fetchOffers, selectSearch } from '@/features/search'
import { formatPrice } from '@/shared/lib'
import { EmptyState, ErrorAlert, Skeleton } from '@/shared/ui'

export function BrandList() {
  const dispatch = useDispatch()
  const { number, brands, brandsStatus, brandsError, selectedPart } = useSelector(selectSearch)

  if (brandsStatus === 'idle') return null
  if (brandsStatus === 'failed') {
    return <ErrorAlert message={brandsError} onRetry={() => dispatch(fetchBrands(number))} />
  }
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
        <h2 className="text-lg fw-semibold mb-0">Производители</h2>
        {brandsStatus === 'succeeded' && <span className="count-badge">{brands.length}</span>}
        {brandsStatus === 'loading' && <Skeleton pill width="1.75rem" />}
      </div>
      {brandsStatus === 'loading' ? (
        <BrandListSkeleton />
      ) : (
        <div className="list-group brand-nav">
          {brands.map((part) => {
            const isActive = part.goodsID === selectedPart?.goodsID
            const minPrice = getMinPrice(part)
            return (
              <button
                key={part.goodsID}
                type="button"
                className={`list-group-item list-group-item-action${isActive ? ' active' : ''}`}
                aria-current={isActive || undefined}
                onClick={() => dispatch(fetchOffers(part))}
              >
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <span className="text-lg fw-medium">{part.brand}</span>
                  <StockBadge count={part.count} />
                </div>
                <div className="d-flex justify-content-between gap-2 text-body-secondary mt-1">
                  <span>{part.number}</span>
                  {minPrice !== null && <span className="tabular-nums text-nowrap">от {formatPrice(minPrice)}</span>}
                </div>
                <div className="small text-body-secondary">{part.name}</div>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

// Ширины разные, чтобы заглушка выглядела как настоящий список, а не как полосатый фон
const SKELETON_ITEMS = [
  { brand: '35%', number: '20%', price: '32%', name: '55%' },
  { brand: '50%', number: '24%', price: '28%', name: '70%' },
  { brand: '40%', number: '18%', price: '34%', name: '45%' },
  { brand: '30%', number: '22%', price: '30%', name: '62%' },
]

function BrandListSkeleton() {
  return (
    <div className="list-group brand-nav" role="status" aria-busy="true">
      <span className="visually-hidden">Загрузка производителей…</span>
      {SKELETON_ITEMS.map((item, index) => (
        <div key={index} className="list-group-item" aria-hidden="true">
          <div className="d-flex justify-content-between align-items-start gap-2">
            <Skeleton className="text-lg" width={item.brand} />
            <Skeleton pill width="3.25rem" />
          </div>
          <div className="d-flex justify-content-between gap-2 mt-1">
            <Skeleton width={item.number} />
            <Skeleton width={item.price} />
          </div>
          <Skeleton className="small" width={item.name} />
        </div>
      ))}
    </div>
  )
}

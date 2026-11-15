import { useSelector } from 'react-redux'
import { compareOfferRows, getOfferRows, StockBadge } from '@/entities/part'
import { selectSearch } from '@/features/search'
import { EmptyState, ErrorAlert } from '@/shared/ui'

const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })

export function OffersTable() {
  const { selectedPart, offers, offersStatus, offersError } = useSelector(selectSearch)

  if (offersStatus === 'idle') {
    return (
      <EmptyState icon="bi-hand-index" title="Выберите производителя">
        Нажмите на производителя в списке, чтобы увидеть цены, остатки на складах и аналоги детали.
      </EmptyState>
    )
  }
  if (offersStatus === 'failed') return <ErrorAlert message={offersError} />

  const analogues = offers.flatMap((part) => part.analogues ?? [])
  const partRows = offers.flatMap(getOfferRows).sort(compareOfferRows)
  const analogueRows = analogues.flatMap(getOfferRows).sort(compareOfferRows)
  const prices = [...partRows, ...analogueRows].filter((row) => row.warehouse).map((row) => row.warehouse.price)

  return (
    <section className="card shadow-sm">
      <div className="card-header py-3">
        <div className="d-flex flex-wrap justify-content-between align-items-baseline gap-2">
          <h2 className="h5 mb-0">
            {selectedPart.brand}{' '}
            <span className="font-monospace fw-normal text-body-secondary">{selectedPart.number}</span>
          </h2>
          {offersStatus === 'succeeded' && prices.length > 0 && (
            <span className="small text-body-secondary">
              Предложений в наличии: {prices.length} · от{' '}
              <span className="fw-semibold text-body tabular-nums">{priceFormat.format(Math.min(...prices))}</span>
            </span>
          )}
        </div>
        <div className="small text-body-secondary">{selectedPart.name}</div>
      </div>

      {offersStatus === 'loading' && <OffersSkeleton />}

      {offersStatus === 'succeeded' && offers.length === 0 && (
        <div className="card-body text-body-secondary">Предложений не найдено.</div>
      )}

      {offersStatus === 'succeeded' && offers.length > 0 && (
        <div className="table-responsive-lg">
          <table className="table table-hover align-middle mb-0 offers-table">
            <thead>
              <tr>
                <th scope="col">Наименование / Производитель</th>
                <th scope="col" className="d-none d-sm-table-cell">
                  Склад
                </th>
                <th scope="col" className="text-end">
                  Цена
                </th>
                <th scope="col" className="text-end">
                  Остаток
                </th>
              </tr>
            </thead>
            <tbody>
              <GroupRow title="Искомая деталь" />
              {partRows.map((row) => (
                <OfferRow key={row.id} row={row} />
              ))}
              <GroupRow title={`Аналоги · ${analogues.length}`} />
              {analogueRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-body-secondary">
                    Аналогов не найдено.
                  </td>
                </tr>
              )}
              {analogueRows.map((row) => (
                <OfferRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function GroupRow({ title }) {
  return (
    <tr className="offers-group">
      <th colSpan={4} scope="colgroup">
        {title}
      </th>
    </tr>
  )
}

function OfferRow({ row: { part, warehouse } }) {
  return (
    <tr className={warehouse ? undefined : 'is-unavailable'}>
      <td>
        <div className="fw-medium">{part.name}</div>
        <div className="small text-body-secondary">
          <span className="fw-semibold">{part.brand}</span> · <span className="font-monospace">{part.number}</span>
          {warehouse?.code && <span className="d-sm-none text-nowrap"> · {warehouse.code}</span>}
        </div>
      </td>
      <td className="text-nowrap d-none d-sm-table-cell">{warehouse?.code || '—'}</td>
      <td className="text-end text-nowrap fw-semibold tabular-nums">
        {warehouse ? priceFormat.format(warehouse.price) : '—'}
      </td>
      <td className="text-end">
        <StockBadge count={warehouse ? warehouse.stock : 0} />
      </td>
    </tr>
  )
}

function OffersSkeleton() {
  return (
    <div className="card-body placeholder-glow" role="status" aria-busy="true">
      <span className="visually-hidden">Загрузка предложений…</span>
      {['a', 'b', 'c', 'd', 'e'].map((key) => (
        <div key={key} className="d-flex align-items-center gap-3 py-2 border-bottom" aria-hidden="true">
          <span className="placeholder col-6" />
          <span className="placeholder col-2" />
          <span className="placeholder col-2 ms-auto" />
        </div>
      ))}
    </div>
  )
}

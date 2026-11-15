import { useSelector } from 'react-redux'
import { compareOfferRows, getOfferRows } from '@/entities/part'
import { selectSearch } from '@/features/search'
import { ErrorAlert, Loader } from '@/shared/ui'

const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })

export function OffersTable() {
  const { brands, selectedPart, offers, offersStatus, offersError } = useSelector(selectSearch)

  if (offersStatus === 'idle') {
    if (brands.length === 0) return null
    return <p className="text-secondary">Выберите производителя, чтобы увидеть аналоги и предложения.</p>
  }
  if (offersStatus === 'loading') return <Loader text="Загружаем аналоги и предложения…" />
  if (offersStatus === 'failed') return <ErrorAlert message={offersError} />
  if (offers.length === 0) {
    return <div className="alert alert-secondary">Предложений не найдено.</div>
  }

  const analogues = offers.flatMap((part) => part.analogues ?? [])
  const partRows = offers.flatMap(getOfferRows).sort(compareOfferRows)
  const analogueRows = analogues.flatMap(getOfferRows).sort(compareOfferRows)

  return (
    <div>
      <h2 className="h5 mb-3">
        {selectedPart.brand} {selectedPart.number}
      </h2>
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead>
            <tr>
              <th>Наименование / Производитель</th>
              <th>Склад</th>
              <th className="text-end">Цена</th>
              <th className="text-end">Остаток</th>
            </tr>
          </thead>
          <tbody>
            <GroupRow title="Искомая деталь" />
            {partRows.map((row) => (
              <OfferRow key={row.id} row={row} />
            ))}
            <GroupRow title={`Аналоги (${analogues.length})`} />
            {analogueRows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-secondary">
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
    </div>
  )
}

function GroupRow({ title }) {
  return (
    <tr className="table-light">
      <th colSpan={4}>{title}</th>
    </tr>
  )
}

function OfferRow({ row: { part, warehouse } }) {
  return (
    <tr className={warehouse ? undefined : 'text-secondary'}>
      <td>
        <div>{part.name}</div>
        <div className="small text-secondary">
          {part.brand} · {part.number}
        </div>
      </td>
      <td className="text-nowrap">{warehouse ? warehouse.code || '—' : '—'}</td>
      <td className="text-end text-nowrap">{warehouse ? priceFormat.format(warehouse.price) : '—'}</td>
      <td className="text-end text-nowrap">{warehouse ? `${warehouse.stock} шт.` : 'нет в наличии'}</td>
    </tr>
  )
}

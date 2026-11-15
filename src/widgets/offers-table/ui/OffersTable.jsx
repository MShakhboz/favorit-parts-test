import { skipToken } from '@reduxjs/toolkit/query/react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  getSortedWarehouses,
  parseShipmentDate,
  StockBadge,
  summarizeOffers,
  useGetOffersQuery,
} from '@/entities/part'
import { selectSearch } from '@/features/search'
import { formatDate, formatPrice, formatTime } from '@/shared/lib'
import { EmptyState, ErrorAlert, Skeleton } from '@/shared/ui'

const COLUMNS = 5

export function OffersTable() {
  const { selectedPart } = useSelector(selectSearch)
  const query = useGetOffersQuery(
    selectedPart ? { number: selectedPart.number, brand: selectedPart.brand } : skipToken,
  )
  const panelRef = useRef(null)

  // На узком экране таблица ниже списка производителей — прокручиваем к ней после выбора.
  // Повторяем, когда данные загрузились: пока виден скелетон, страница может быть короче нужного.
  // Ждём два кадра, чтобы виртуализатор успел измерить строки — его мгновенная поправка
  // прокрутки иначе прервала бы плавную
  useEffect(() => {
    if (!selectedPart || !window.matchMedia('(max-width: 991.98px)').matches) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        panelRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedPart, query.currentData])

  return (
    <div ref={panelRef} className="offers-panel">
      <OffersContent part={selectedPart} query={query} />
    </div>
  )
}

function OffersContent({ part, query }) {
  // currentData — только для выбранной детали: при смене бренда старая таблица не мелькает
  const { currentData: offers, isError, error, refetch } = query

  if (!part) {
    return (
      <EmptyState icon="bi-hand-index" title="Выберите производителя">
        Нажмите на производителя в списке, чтобы увидеть цены, остатки на складах и аналоги детали.
      </EmptyState>
    )
  }
  if (isError) return <ErrorAlert message={error.message} onRetry={refetch} />

  const summary = offers?.length > 0 ? summarizeOffers(offers) : null

  return (
    <section aria-labelledby="offers-title">
      <div className="mb-3">
        <h2 id="offers-title" className="title-md mb-1">
          {part.brand} <span className="fw-normal text-body-secondary">{part.number}</span>
        </h2>
        <p className="text-body-secondary mb-0">{part.name}</p>
      </div>

      {!offers && <OffersSkeleton />}

      {offers?.length === 0 && (
        <EmptyState icon="bi-inbox" title="Предложений не найдено">
          По этой детали сейчас нет предложений. Попробуйте выбрать другого производителя.
        </EmptyState>
      )}

      {summary && (
        <>
          <OffersStats summary={summary} />
          <div className="card shadow-sm">
            <OffersGrid key={part.goodsID} summary={summary} />
          </div>
        </>
      )}
    </section>
  )
}

function OffersStats({ summary }) {
  const stats = [
    { label: 'Предложений в наличии', value: summary.offersCount },
    { label: 'Лучшая цена', value: summary.bestPrice !== null ? formatPrice(summary.bestPrice) : '—' },
    { label: 'Аналоги в наличии', value: `${summary.availableAnalogues.length} из ${summary.analogues.length}` },
  ]

  return (
    <div className="row row-cols-3 g-2 g-md-3 mb-3">
      {stats.map((stat) => (
        <div key={stat.label} className="col">
          <div className="card shadow-sm h-100">
            <div className="card-body p-2 p-md-3">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value tabular-nums">{stat.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Высоты для первой отрисовки; настоящие виртуализатор измеряет сам. На телефоне строки выше:
// под ценой ещё склад и дата
const GROUP_HEIGHT = 43
const ROW_HEIGHT = { wide: 61, narrow: 82 }

const isWideScreen = () => window.matchMedia('(min-width: 768px)').matches

// Плоский список элементов таблицы: заголовки групп, детали (каждая со своими складами) и сообщения.
// rowIndex — номер первой строки элемента в таблице для aria-rowindex (строка 1 — шапка)
function buildItems(parts, analogues, analoguesTotal) {
  const items = [{ key: 'group:parts', type: 'group', title: 'Искомая деталь' }]
  if (parts.length > 0) items.push(...parts.map((part) => ({ key: part.goodsID, type: 'part', part })))
  else items.push({ key: 'message:parts', type: 'message', text: 'Искомой детали нет в наличии.' })

  items.push({ key: 'group:analogues', type: 'group', title: 'Аналоги', count: analogues.length })
  if (analogues.length > 0) items.push(...analogues.map((part) => ({ key: part.goodsID, type: 'part', part })))
  else {
    const text = analoguesTotal === 0 ? 'Аналогов не найдено.' : 'Аналогов в наличии нет.'
    items.push({ key: 'message:analogues', type: 'message', text })
  }

  let rowIndex = 2
  return items.map((item) => {
    const rows = item.type === 'part' ? Math.max(item.part.warehouses?.length ?? 0, 1) : 1
    const result = { ...item, rows, rowIndex }
    rowIndex += rows
    return result
  })
}

// Расстояние от начала документа до первой строки тела таблицы: виртуализатор следит за прокруткой окна.
// Шапка таблицы липкая, поэтому считаем от самой таблицы плюс высота шапки
function useTableBodyOffset(tableRef, headRef) {
  const [offset, setOffset] = useState(0)

  useLayoutEffect(() => {
    const update = () => {
      if (!tableRef.current || !headRef.current) return
      const top = tableRef.current.getBoundingClientRect().top + window.scrollY
      setOffset(Math.round(top + headRef.current.offsetHeight))
    }
    update()
    // Всё, что выше таблицы, может поменять высоту (шрифты, перенос строк, ширина окна)
    const observer = new ResizeObserver(update)
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [tableRef, headRef])

  return offset
}

// Таблица виртуализирована: в DOM только видимые детали и небольшой запас, остальное — пустые строки-распорки.
// Единица виртуализации — деталь целиком (tbody со всеми её складами), поэтому группировка
// с rowspan и липкие наименования работают как раньше
function OffersGrid({ summary }) {
  const [filter, setFilter] = useState('available')
  const { parts, availableParts, analogues, availableAnalogues, bestPrice } = summary
  const shownParts = filter === 'available' ? availableParts : parts
  const shownAnalogues = filter === 'available' ? availableAnalogues : analogues
  const filters = [
    { id: 'available', label: 'В наличии', count: availableParts.length + availableAnalogues.length },
    { id: 'all', label: 'Все позиции', count: parts.length + analogues.length },
  ]

  const items = buildItems(shownParts, shownAnalogues, analogues.length)
  const rowCount = items.reduce((sum, item) => sum + item.rows, 1)

  const tableRef = useRef(null)
  const headRef = useRef(null)
  const scrollMargin = useTableBodyOffset(tableRef, headRef)
  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: (index) => {
      const item = items[index]
      if (item.type !== 'part') return GROUP_HEIGHT
      return item.rows * (isWideScreen() ? ROW_HEIGHT.wide : ROW_HEIGHT.narrow)
    },
    getItemKey: (index) => items[index].key,
    overscan: 6,
    scrollMargin,
  })
  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start - scrollMargin : 0
  const paddingBottom =
    virtualItems.length > 0 ? virtualizer.getTotalSize() - (virtualItems.at(-1).end - scrollMargin) : 0

  return (
    <>
      <div className="nav nav-underline offers-tabs" role="group" aria-label="Фильтр предложений">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            className="nav-link"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
            <span className="count-badge">{item.count}</span>
          </button>
        ))}
      </div>
      <div className="table-responsive-lg">
        <table ref={tableRef} className="table align-middle mb-0 offers-table" aria-rowcount={rowCount}>
          <thead ref={headRef}>
            <tr aria-rowindex={1}>
              <th scope="col">Наименование / Производитель</th>
              <th scope="col" className="col-warehouse d-none d-md-table-cell">
                Склад
              </th>
              <th scope="col" className="col-shipment d-none d-md-table-cell">
                Отгрузка
              </th>
              <th scope="col" className="col-price text-end">
                Цена
              </th>
              <th scope="col" className="col-stock text-end">
                Остаток
              </th>
            </tr>
          </thead>

          {paddingTop > 0 && <SpacerRow height={paddingTop} />}
          {virtualItems.map((virtualItem) => {
            const item = items[virtualItem.index]
            const itemProps = { ref: virtualizer.measureElement, index: virtualItem.index, rowIndex: item.rowIndex }
            if (item.type === 'group') return <GroupRow key={item.key} {...itemProps} title={item.title} count={item.count} />
            if (item.type === 'message') return <MessageRow key={item.key} {...itemProps} text={item.text} />
            return <PartRows key={item.key} {...itemProps} part={item.part} bestPrice={bestPrice} />
          })}
          {paddingBottom > 0 && <SpacerRow height={paddingBottom} />}
        </table>
      </div>
    </>
  )
}

// Пустая строка вместо деталей за пределами экрана — сохраняет высоту таблицы и полосу прокрутки
function SpacerRow({ height }) {
  return (
    <tbody aria-hidden="true">
      <tr>
        <td colSpan={COLUMNS} className="p-0 border-0" style={{ height }} />
      </tr>
    </tbody>
  )
}

function MessageRow({ ref, index, rowIndex, text }) {
  return (
    <tbody ref={ref} data-index={index}>
      <tr aria-rowindex={rowIndex}>
        <td colSpan={COLUMNS} className="text-body-secondary">
          {text}
        </td>
      </tr>
    </tbody>
  )
}

function GroupRow({ ref, index, rowIndex, title, count }) {
  return (
    <tbody ref={ref} data-index={index}>
      <tr className="offers-group" aria-rowindex={rowIndex}>
        <th colSpan={COLUMNS} scope="colgroup">
          {title}
          {count !== undefined && <span className="count-badge ms-2">{count}</span>}
        </th>
      </tr>
    </tbody>
  )
}

// Деталь и её склады: наименование показываем один раз на всю группу строк
function PartRows({ ref, index, rowIndex, part, bestPrice }) {
  const warehouses = getSortedWarehouses(part)
  const nameCell = (
    <th scope="rowgroup" rowSpan={Math.max(warehouses.length, 1)} className="offer-name fw-normal">
      <div className="offer-name-sticky">
        <div className="fw-medium">{part.name}</div>
        <div className="text-body-secondary">
          {part.brand} · <span className="text-nowrap">{part.number}</span>
        </div>
      </div>
    </th>
  )

  if (warehouses.length === 0) {
    return (
      <tbody ref={ref} data-index={index} className="offer-part is-unavailable">
        <tr aria-rowindex={rowIndex}>
          {nameCell}
          <td className="d-none d-md-table-cell">—</td>
          <td className="d-none d-md-table-cell">—</td>
          <td className="text-end">—</td>
          <td className="text-end">
            <StockBadge count={0} compact />
          </td>
        </tr>
      </tbody>
    )
  }

  return (
    <tbody ref={ref} data-index={index} className="offer-part">
      {warehouses.map((warehouse, warehouseIndex) => {
        const shipment = parseShipmentDate(warehouse.shipmentDate)
        return (
          <tr key={warehouse.id} aria-rowindex={rowIndex + warehouseIndex}>
            {warehouseIndex === 0 && nameCell}
            <td className="text-nowrap d-none d-md-table-cell">{warehouse.code || '—'}</td>
            <td className="text-nowrap d-none d-md-table-cell">
              {shipment ? (
                <>
                  <div>{formatDate(shipment)}</div>
                  <div className="small text-body-secondary">заказ до {formatTime(shipment)}</div>
                </>
              ) : (
                '—'
              )}
            </td>
            <td className="text-end text-nowrap">
              <div className="fw-semibold tabular-nums">{formatPrice(warehouse.price)}</div>
              {warehouse.price === bestPrice && (
                <span className="badge rounded-pill bg-success-subtle text-success-emphasis mt-1">
                  <i className="bi bi-arrow-down-short" aria-hidden="true" />
                  лучшая цена
                </span>
              )}
              <div className="small text-body-secondary text-wrap d-md-none">
                {warehouse.code && <span className="text-nowrap">{warehouse.code}</span>}
                {warehouse.code && shipment && ' · '}
                {shipment && <span className="text-nowrap">{formatDate(shipment)}</span>}
              </div>
            </td>
            <td className="text-end">
              <StockBadge count={warehouse.stock} compact />
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

// Заглушка повторяет то, что появится после загрузки: метрики, вкладки, шапку и строки таблицы
const SKELETON_ROWS = [
  { name: '70%', meta: '45%' },
  { name: '55%', meta: '35%' },
  { name: '80%', meta: '50%' },
  { name: '60%', meta: '40%' },
  { name: '75%', meta: '30%' },
]

function OffersSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="visually-hidden">Загрузка предложений…</span>

      <div className="row row-cols-3 g-2 g-md-3 mb-3" aria-hidden="true">
        {['60%', '50%', '45%'].map((width, index) => (
          <div key={index} className="col">
            <div className="card shadow-sm h-100">
              <div className="card-body p-2 p-md-3">
                <Skeleton className="stat-label" width="75%" />
                <Skeleton className="stat-value" width={width} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card shadow-sm" aria-hidden="true">
        <div className="skeleton-tabs">
          {['4.5rem', '5.5rem'].map((width) => (
            <div key={width} className="d-flex align-items-center gap-2">
              <Skeleton width={width} />
              <Skeleton pill width="1.75rem" />
            </div>
          ))}
        </div>
        <div className="skeleton-table-head small">
          <Skeleton width="30%" />
          <Skeleton width="3rem" className="d-none d-md-block ms-auto" />
          <Skeleton width="4rem" className="d-none d-md-block" />
          <Skeleton width="3rem" className="ms-auto ms-md-0" />
          <Skeleton width="3.5rem" />
        </div>
        <div className="skeleton-row-group">
          <Skeleton width="7rem" />
          <Skeleton pill width="1.75rem" />
        </div>
        {SKELETON_ROWS.map((row, index) => (
          <div key={index} className="skeleton-row">
            <div className="flex-grow-1">
              <Skeleton width={row.name} />
              <Skeleton width={row.meta} />
            </div>
            <Skeleton width="3.5rem" className="d-none d-md-block" />
            <div className="d-none d-md-block" style={{ width: '4.5rem' }}>
              <Skeleton />
              <Skeleton className="small" width="80%" />
            </div>
            <Skeleton width="4.5rem" />
            <Skeleton pill width="3rem" />
          </div>
        ))}
      </div>
    </div>
  )
}

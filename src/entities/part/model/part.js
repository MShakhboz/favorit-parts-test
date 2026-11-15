// Минимальная цена по складам детали или null, если остатков нет
export function getMinPrice(part) {
  const prices = (part.warehouses ?? []).map((warehouse) => warehouse.price)
  return prices.length > 0 ? Math.min(...prices) : null
}

// Склады детали от дешёвых к дорогим
export function getSortedWarehouses(part) {
  return [...(part.warehouses ?? [])].sort((a, b) => a.price - b.price)
}

// Сначала детали в наличии (дешёвые выше), затем позиции без остатков
export function comparePartsByPrice(a, b) {
  const priceA = getMinPrice(a)
  const priceB = getMinPrice(b)
  if (priceA === null || priceB === null) return (priceA === null) - (priceB === null)
  return priceA - priceB
}

// Дата отгрузки: дата — день отгрузки, время — до какого часа нужно заказать
export function parseShipmentDate(value) {
  const date = new Date(value)
  return value && !Number.isNaN(date.getTime()) ? date : null
}

// Сводка по ответу второго этапа: искомые детали, аналоги, число предложений и лучшая цена
export function summarizeOffers(offers) {
  const parts = [...offers].sort(comparePartsByPrice)
  const analogues = offers.flatMap((part) => part.analogues ?? []).sort(comparePartsByPrice)
  const allParts = [...parts, ...analogues]
  const prices = allParts.map(getMinPrice).filter((price) => price !== null)
  return {
    parts,
    availableParts: parts.filter((part) => getMinPrice(part) !== null),
    analogues,
    availableAnalogues: analogues.filter((part) => getMinPrice(part) !== null),
    offersCount: allParts.reduce((sum, part) => sum + (part.warehouses?.length ?? 0), 0),
    bestPrice: prices.length > 0 ? Math.min(...prices) : null,
  }
}

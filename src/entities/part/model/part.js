// Строки таблицы предложений: по одной на каждый склад, где есть деталь.
// Деталь без остатков тоже попадает в таблицу — одной строкой без склада.
export function getOfferRows(part) {
  const warehouses = part.warehouses ?? []
  if (warehouses.length === 0) return [{ id: part.goodsID, part, warehouse: null }]
  return warehouses.map((warehouse) => ({ id: `${part.goodsID}:${warehouse.id}`, part, warehouse }))
}

// Сначала предложения в наличии (дешёвые выше), затем позиции без остатков
export function compareOfferRows(a, b) {
  if (!a.warehouse || !b.warehouse) return Boolean(b.warehouse) - Boolean(a.warehouse)
  return a.warehouse.price - b.warehouse.price
}

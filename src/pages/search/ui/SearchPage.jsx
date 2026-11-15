import { useSelector } from 'react-redux'
import { SearchInput, selectSearch } from '@/features/search'
import { EmptyState } from '@/shared/ui'
import { BrandList } from '@/widgets/brand-list'
import { OffersTable } from '@/widgets/offers-table'

export function SearchPage() {
  const { brands, brandsStatus } = useSelector(selectSearch)
  const hasBrands = brands.length > 0

  return (
    <main className="container py-4 py-lg-5">
      <header className="d-flex align-items-center gap-3 mb-4">
        <div className="app-logo" aria-hidden="true">
          <i className="bi bi-gear-wide-connected" />
        </div>
        <div>
          <h1 className="h3 mb-0">Поиск автозапчастей</h1>
          <p className="text-body-secondary mb-0">Цены, наличие на складах и аналоги по артикулу</p>
        </div>
      </header>

      <section className="card shadow-sm mb-4">
        <div className="card-body p-3 p-md-4">
          <SearchInput />
        </div>
      </section>

      {brandsStatus === 'idle' ? (
        <EmptyState icon="bi-upc-scan" title="Введите артикул детали">
          Покажем производителей, которые выпускают деталь с таким номером. Выберите производителя — и увидите цены,
          остатки на складах и аналоги.
        </EmptyState>
      ) : (
        <div className="row g-4">
          <div className={hasBrands || brandsStatus === 'loading' ? 'col-lg-4' : 'col-12'}>
            <BrandList />
          </div>
          {hasBrands && (
            <div className="col-lg-8">
              <OffersTable />
            </div>
          )}
        </div>
      )}
    </main>
  )
}

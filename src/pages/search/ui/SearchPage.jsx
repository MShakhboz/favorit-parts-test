import { SearchInput } from '@/features/search'
import { BrandList } from '@/widgets/brand-list'

export function SearchPage() {
  return (
    <main className="container py-4">
      <h1 className="h3 mb-4">Поиск автозапчастей</h1>
      <SearchInput />
      <div className="row mt-4">
        <div className="col-lg-4">
          <BrandList />
        </div>
      </div>
    </main>
  )
}

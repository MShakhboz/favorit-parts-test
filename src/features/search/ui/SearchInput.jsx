import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader } from '@/shared/ui'
import { fetchBrands, searchReset, selectSearch } from '../model/searchSlice.js'

const DEBOUNCE_MS = 500
const EXAMPLES = ['0189', '7160500039S']

export function SearchInput() {
  const dispatch = useDispatch()
  const { brandsStatus } = useSelector(selectSearch)
  const [value, setValue] = useState('')
  const number = value.trim()

  // Запрос уходит, когда пользователь перестал печатать. Пустое поле сбрасывает поиск
  useEffect(() => {
    if (!number) {
      dispatch(searchReset())
      return
    }
    const timer = setTimeout(() => dispatch(fetchBrands(number)), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [number, dispatch])

  return (
    <div>
      <label htmlFor="part-number" className="form-label fw-semibold">
        Артикул детали
      </label>
      <div className="search-field">
        <i className="bi bi-search search-field-icon" aria-hidden="true" />
        <input
          id="part-number"
          type="search"
          className="form-control form-control-lg font-monospace"
          placeholder="Например, 0189"
          autoComplete="off"
          spellCheck={false}
          autoFocus
          aria-describedby="part-number-help"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <div id="part-number-help" className="form-text d-flex flex-wrap align-items-center gap-2 mt-2">
        {brandsStatus === 'loading' ? (
          <Loader text="Ищем производителей…" />
        ) : (
          <>
            <span>Поиск начнётся сам, как только вы закончите ввод. Попробуйте:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill font-monospace"
                onClick={() => setValue(example)}
              >
                {example}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

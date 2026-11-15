import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader } from '@/shared/ui'
import { fetchBrands, searchReset, selectSearch } from '../model/searchSlice.js'

const DEBOUNCE_MS = 500
const EXAMPLES = ['0189', '7160500039S']

export function SearchInput() {
  const dispatch = useDispatch()
  const { brandsStatus } = useSelector(selectSearch)
  const [value, setValue] = useState('')
  const timerRef = useRef(null)
  const number = value.trim()

  // Запрос уходит, когда пользователь перестал печатать. Пустое поле сбрасывает поиск
  useEffect(() => {
    if (!number) {
      dispatch(searchReset())
      return
    }
    const timer = setTimeout(() => dispatch(fetchBrands(number)), DEBOUNCE_MS)
    timerRef.current = timer
    return () => clearTimeout(timer)
  }, [number, dispatch])

  // Enter запускает поиск сразу, не дожидаясь паузы
  function handleSubmit(event) {
    event.preventDefault()
    if (!number) return
    clearTimeout(timerRef.current)
    dispatch(fetchBrands(number))
  }

  return (
    <form role="search" onSubmit={handleSubmit}>
      <label htmlFor="part-number" className="form-label">
        Артикул детали
      </label>
      <div className="search-row d-flex gap-2">
        <div className="search-field flex-grow-1">
          <i className="bi bi-search search-field-icon" aria-hidden="true" />
          <input
            id="part-number"
            type="search"
            className="form-control"
            placeholder="Например, 0189"
            autoComplete="off"
            spellCheck={false}
            autoFocus
            enterKeyHint="search"
            aria-describedby="part-number-help"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={!number}>
          Найти
        </button>
      </div>
      <div id="part-number-help" className="form-text d-flex flex-wrap align-items-center gap-2 mt-2">
        {brandsStatus === 'loading' ? (
          <Loader text="Ищем производителей…" />
        ) : (
          <>
            <span>Поиск начнётся сам после ввода. Попробуйте:</span>
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="btn btn-sm btn-soft"
                onClick={() => setValue(example)}
              >
                {example}
              </button>
            ))}
          </>
        )}
      </div>
    </form>
  )
}

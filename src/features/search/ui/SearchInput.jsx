import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchBrands, searchReset } from '../model/searchSlice.js'

const DEBOUNCE_MS = 500

export function SearchInput() {
  const dispatch = useDispatch()
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
      <label htmlFor="part-number" className="form-label">
        Артикул детали
      </label>
      <input
        id="part-number"
        type="search"
        className="form-control form-control-lg"
        placeholder="Например, 0189"
        autoComplete="off"
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div className="form-text">Производители появятся автоматически после ввода артикула.</div>
    </div>
  )
}

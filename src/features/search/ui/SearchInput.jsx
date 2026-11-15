import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { fetchBrands } from '../model/searchSlice.js'

const DEBOUNCE_MS = 500

export function SearchInput() {
  const dispatch = useDispatch()
  const [value, setValue] = useState('')

  // Запрос уходит, когда пользователь перестал печатать
  useEffect(() => {
    const number = value.trim()
    if (!number) return
    const timer = setTimeout(() => dispatch(fetchBrands(number)), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, dispatch])

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

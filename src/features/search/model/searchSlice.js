import { createSlice } from '@reduxjs/toolkit'

// Здесь только состояние интерфейса: какой артикул ищем и какую деталь выбрали.
// Загрузка, ошибки и данные — в RTK Query (entities/part/api)
const initialState = {
  number: '',
  selectedPart: null,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchSubmitted: (state, action) => {
      if (state.number === action.payload) return
      state.number = action.payload
      state.selectedPart = null
    },
    // part — позиция из списка производителей. Номер для второго запроса берём из неё, а не из поля ввода:
    // у разных брендов он записан по-разному (например, 0189 и 01-89)
    partSelected: (state, action) => {
      state.selectedPart = action.payload
    },
    searchReset: () => initialState,
  },
})

export const { searchSubmitted, partSelected, searchReset } = searchSlice.actions
export const searchReducer = searchSlice.reducer

export const selectSearch = (state) => state.search

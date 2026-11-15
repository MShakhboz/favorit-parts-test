import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getBrands, getOffers } from '@/shared/api'

const initialState = {
  number: '',
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  brandsRequestId: null,
  selectedPart: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
  offersRequestId: null,
}

export const fetchBrands = createAsyncThunk('search/fetchBrands', (number, { signal }) =>
  getBrands(number, { signal }),
)

// part — позиция из списка производителей. Номер берём из неё, а не из поля ввода:
// у разных брендов он записан по-разному (например, 0189 и 01-89)
export const fetchOffers = createAsyncThunk('search/fetchOffers', (part, { signal }) =>
  getOffers(part.number, part.brand, { signal }),
)

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchReset: () => initialState,
  },
  // Учитываем только ответ на последний запрос: если пользователь успел ввести
  // другой артикул или выбрать другой бренд, старый ответ отбрасываем
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => ({
        ...initialState,
        number: action.meta.arg,
        brandsStatus: 'loading',
        brandsRequestId: action.meta.requestId,
      }))
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.brandsRequestId) return
        state.brands = action.payload
        state.brandsStatus = 'succeeded'
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (action.meta.requestId !== state.brandsRequestId) return
        state.brandsStatus = 'failed'
        state.brandsError = action.error.message
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedPart = action.meta.arg
        state.offers = []
        state.offersStatus = 'loading'
        state.offersError = null
        state.offersRequestId = action.meta.requestId
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (action.meta.requestId !== state.offersRequestId) return
        state.offers = action.payload
        state.offersStatus = 'succeeded'
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (action.meta.requestId !== state.offersRequestId) return
        state.offersStatus = 'failed'
        state.offersError = action.error.message
      })
  },
})

export const { searchReset } = searchSlice.actions
export const searchReducer = searchSlice.reducer

export const selectSearch = (state) => state.search

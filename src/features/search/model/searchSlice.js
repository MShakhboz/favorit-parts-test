import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getBrands, getOffers } from '@/shared/api'

const initialState = {
  number: '',
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  selectedPart: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        state.number = action.meta.arg
        state.brands = []
        state.brandsStatus = 'loading'
        state.brandsError = null
        state.selectedPart = null
        state.offers = []
        state.offersStatus = 'idle'
        state.offersError = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload
        state.brandsStatus = 'succeeded'
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.brandsStatus = 'failed'
        state.brandsError = action.error.message
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.selectedPart = action.meta.arg
        state.offers = []
        state.offersStatus = 'loading'
        state.offersError = null
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offers = action.payload
        state.offersStatus = 'succeeded'
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.offersStatus = 'failed'
        state.offersError = action.error.message
      })
  },
})

export const searchReducer = searchSlice.reducer

export const selectSearch = (state) => state.search

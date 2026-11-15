import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getBrands } from '@/shared/api'

const initialState = {
  number: '',
  brands: [],
  brandsStatus: 'idle',
  brandsError: null,
  selectedBrand: null,
  offers: [],
  offersStatus: 'idle',
  offersError: null,
}

export const fetchBrands = createAsyncThunk('search/fetchBrands', (number, { signal }) =>
  getBrands(number, { signal }),
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
        state.selectedBrand = null
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
  },
})

export const searchReducer = searchSlice.reducer

export const selectSearch = (state) => state.search

import { createSlice } from '@reduxjs/toolkit'

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

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {},
})

export const searchReducer = searchSlice.reducer

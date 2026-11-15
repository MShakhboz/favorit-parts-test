import { configureStore } from '@reduxjs/toolkit'
import { searchReducer } from '@/features/search'
import { baseApi } from '@/shared/api'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

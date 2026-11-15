import { baseApi } from '@/shared/api'

// Если деталь не найдена, API возвращает один пустой элемент с таким goodsID
const EMPTY_GOODS_ID = '00000000-0000-0000-0000-000000000000'

const toParts = (response) => (response.goods ?? []).filter((part) => part.goodsID !== EMPTY_GOODS_ID)

export const partApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Этап 1: детали с этим номером у всех производителей
    getBrands: build.query({
      query: (number) => ({ url: '', params: { number } }),
      transformResponse: toParts,
    }),
    // Этап 2: деталь выбранного производителя вместе с аналогами
    getOffers: build.query({
      query: ({ number, brand }) => ({ url: '', params: { number, brand, analogues: 'on' } }),
      transformResponse: toParts,
    }),
  }),
})

export const { useGetBrandsQuery, useGetOffersQuery } = partApi

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_ERRORS = {
  'Empty key!': 'Не указан ключ API',
  'Invalid key client!': 'Неверный ключ API',
  'Empty number goods!': 'Не указан номер детали',
  'Request quota exceeded!': 'Превышен лимит запросов, попробуйте позже',
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: 'https://api.favorit-parts.ru/hs/hsprice/',
  // encodeURIComponent, а не URLSearchParams: пробел должен стать %20, а не «+»
  paramsSerializer: (params) =>
    Object.entries(params)
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join('&'),
  // Ошибки приходят в теле как { error } — обычно со статусом 403, но проверяем и при 200
  validateStatus: (response, body) => response.ok && !body?.error,
})

function toErrorMessage(error) {
  if (error.status === 'FETCH_ERROR') return 'Не удалось связаться с сервером. Проверьте подключение к интернету.'
  if (error.status === 'PARSING_ERROR') return `Некорректный ответ сервера (${error.originalStatus})`
  const apiError = error.data?.error
  if (apiError) return API_ERRORS[apiError] ?? apiError
  return `Ошибка сервера (${error.status})`
}

// Ключ покупателя добавляется к каждому запросу, ошибка превращается в сообщение для пользователя
async function favoritBaseQuery(args, api, extraOptions) {
  const params = { key: import.meta.env.VITE_FAVORIT_KEY ?? '', ...args.params }
  const result = await rawBaseQuery({ ...args, params }, api, extraOptions)
  if (result.error) return { error: { message: toErrorMessage(result.error) } }
  return result
}

export const baseApi = createApi({
  reducerPath: 'favoritApi',
  baseQuery: favoritBaseQuery,
  endpoints: () => ({}),
})

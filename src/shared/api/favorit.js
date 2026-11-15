const BASE_URL = 'https://api.favorit-parts.ru/hs/hsprice/'

// Если деталь не найдена, API возвращает один пустой элемент с таким goodsID
const EMPTY_GOODS_ID = '00000000-0000-0000-0000-000000000000'

const API_ERRORS = {
  'Empty key!': 'Не указан ключ API',
  'Invalid key client!': 'Неверный ключ API',
  'Empty number goods!': 'Не указан номер детали',
  'Request quota exceeded!': 'Превышен лимит запросов, попробуйте позже',
}

async function request(params, { signal } = {}) {
  const query = Object.entries({ key: import.meta.env.VITE_FAVORIT_KEY ?? '', ...params })
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join('&')

  let response
  try {
    response = await fetch(`${BASE_URL}?${query}`, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Не удалось связаться с сервером. Проверьте подключение к интернету.', {
      cause: error,
    })
  }

  let data
  try {
    data = await response.json()
  } catch (error) {
    throw new Error(`Некорректный ответ сервера (${response.status})`, { cause: error })
  }

  // Ошибки приходят в теле как { error } со статусом 403
  if (data.error) throw new Error(API_ERRORS[data.error] ?? data.error)
  if (!response.ok) throw new Error(`Ошибка сервера (${response.status})`)

  return (data.goods ?? []).filter((item) => item.goodsID !== EMPTY_GOODS_ID)
}

export function getBrands(number, options) {
  return request({ number }, options)
}

export function getOffers(number, brand, options) {
  return request({ number, brand, analogues: 'on' }, options)
}

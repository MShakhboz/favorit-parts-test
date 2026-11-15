const priceFormat = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' })

// Даты Favorit приходят по московскому времени — показываем их так же
const dateFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'Europe/Moscow' })
const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' })

export const formatPrice = (value) => priceFormat.format(value)
export const formatDate = (date) => dateFormat.format(date)
export const formatTime = (date) => timeFormat.format(date)

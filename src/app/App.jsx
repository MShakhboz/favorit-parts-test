import 'bootstrap/dist/css/bootstrap.min.css'
import { Provider } from 'react-redux'
import { SearchPage } from '@/pages/search'
import { store } from './store.js'

function App() {
  return (
    <Provider store={store}>
      <SearchPage />
    </Provider>
  )
}

export default App

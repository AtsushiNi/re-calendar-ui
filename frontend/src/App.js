import {
  Routes,
  Route
} from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import Home from './pages/Home'

const App = () => {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </LocalizationProvider>
  )
}

export default App;

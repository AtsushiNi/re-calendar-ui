import {
  Routes,
  Route
} from 'react-router-dom'

import Calendar from './pages/Calendar'
import { CalendarProvider } from './context/CalendarContext'

const App = () => {

  return (
    <CalendarProvider>
      <Routes>
        <Route path="/" element={<Calendar />} />
      </Routes>
    </CalendarProvider>
  )
}

export default App;

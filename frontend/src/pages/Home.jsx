import { CalendarProvider } from '../context/CalendarContext'
import Calendar from '../components/Calendar'
import ControlPanel from '../components/ControlPanel'

const Home = () => {
  return (
    <CalendarProvider>
      <div style={{ display: 'flex', paddingTop: '80px' }}>
        <Calendar />
        <ControlPanel />
      </div>
    </CalendarProvider>
  )
}

export default Home

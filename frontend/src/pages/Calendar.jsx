import { useEffect, useState } from 'react'
import { CircularProgress, Box } from '@mui/material'

import { useCalendarContext } from '../context/CalendarContext'

import "../css/Calendar.css"
import HeaderDay from '../components/calendar/HeaderDay'
import DayColumn from '../components/calendar/DayColumn'
import Event from '../models/Event'

const Calendar = () => {
  const { days, calendars, loading } = useCalendarContext()

  useEffect(() => {
    // スクロール同期のCDN
    const head = document.getElementsByTagName('head')[0];

    const jqueryScript = document.createElement('script');
    jqueryScript.type = 'text/javascript';
    jqueryScript.src = 'https://code.jquery.com/jquery-3.3.1.js';
    jqueryScript.defer = true

    head.appendChild(jqueryScript);

    jqueryScript.onload = () => {
      const sideColumn = $(".side-column") // eslint-disable-line
      const scrollWindow = $(".scroll-window") // eslint-disable-line
      const header = $(".header-days-wrapper") // eslint-disable-line
      sideColumn.scroll(() => scrollWindow.scrollTop(sideColumn.scrollTop()))
      scrollWindow.scroll(() => sideColumn.scrollTop(scrollWindow.scrollTop()))
      header.scroll(() => scrollWindow.scrollLeft(header.scrollLeft()))
      scrollWindow.scroll(() => header.scrollLeft(scrollWindow.scrollLeft()))
    }
  }, [])

  const alldayEvents = days.map(day => day.events.filter(event => event.startAt.hour() === 0 && event.startAt.minute() === 0 && event.endAt.hour() === 23 && event.endAt.minute() === 59))

  return (
    <div role="main">
      <h1 style={{display: "none"}}>xx年xx月xx日の週、xx件の予定</h1>
      <div>
        <div role="grid" className="calendar-grid">
          <div role="presentation" className="calendar-headers">
            <div className="header-spacer">
              <div></div>
              <div></div>
            </div>
            <div role="presentation" className="header-days-wrapper">
              <div></div>
              <div role="row" className="header-days-row-wrapper">
                <div role="presentation" className="header-days" key="1">
                  <div></div>
                  {
                    days?.map((day, key) => <HeaderDay dayWeek={day.dayWeek} dayNumber={day.dayNumber} key={key}/>)
                  }
                </div>
              </div>
              <div role="row" className="header-row-spacer">
                <div></div>
                <div className="header-row-spacer-content">
                  <div></div>
                  <div className="header-spacer-cells">
                    {
                      [...Array(days.length)].map((_, key) => (
                        <div tabIndex="-1" className="header-spacer-cell" key={key}>
                          <div role="button" className="header-spacer-cell-content">
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div></div>
              </div>
              <div role="row">
                <div></div>
                <div>
                  <ul>
                    {
                      [...Array(days.length)].map((_, key) => (
                        <li className="long-event-box-li" key={key}></li>
                      ))
                    }
                  </ul>
                  <div className="long-event-boxes-div">
                    {
                      alldayEvents.map((events, key) => (
                        <div className="long-event-box-div" key={key}>
                          <div>
                            {events.map((event, key) => (
                              <div className="long-event-wrapper" key={key} style={{backgroundColor: event.color}}>
                                <div className="long-event-content">
                                  <span style={{whiteSpace: "nowrap"}}>
                                    {event.title}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
          <div role="presentation" className="calendar-content-wrapper">
            <div role="presentation" className="calendar-content">
              <div className="side-column">
                <div className="side-time-list">
                  {
                    [...Array(17)].map((_, key) => (
                      <div className="side-time" key={key}>
                        <span>{key+7}時</span>
                      </div>
                    ))
                  }
                </div>
              </div>
              <div role="presentation" className="scroll-window">
                {
                  loading
                  ? (
                    <Box sx={{ margin: 'auto' }}>
                      <CircularProgress />
                    </Box>
                  )
                  : (
                    <div role="row" className="day-columns">
                      <div className="h-borders">
                        {
                          [...Array(17)].map((_, key) => (<div className="gap-cell" key={key}></div>))
                        }
                      </div>
                      <div className="day-column-2"></div>
                      {
                        days.map((day, key) => <DayColumn events={day.events} day={day.dayObject} key={key} />)
                      }
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Calendar

import { useState } from 'react'
import { Popover, Card, CardContent, CardActions, Button, Typography, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material/styles"
import CircleIcon from '@mui/icons-material/Circle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import Event from './Event'
import {default as EventModel } from '../../models/Event'
import { useCalendarContext } from '../../context/CalendarContext'

dayjs.extend(isSameOrBefore)

const DayColumn = props => {
  const { appendCandidate } = useCalendarContext()
  const { events, day } = props

  const [anchorEl, setAnchorEl] = useState(null)
  const [newEvent, setNewEvent] = useState(null)
  const [isTmpNewEvent, setIsTmpNewEvent] = useState(true) // 作成モーダルを開いてすぐ閉じると、候補イベントは作成されずにモーダルが閉じる

  const handleOpenModal = clickEvent => {
    setAnchorEl(clickEvent.currentTarget)
    const startAt = Math.trunc((clickEvent.pageY - clickEvent.target.getBoundingClientRect().top)/37) + 7
    const event = new EventModel("候補", "re-calendar", "", day.clone(), day.clone())
    event.startAt = event.startAt.hour(startAt).startOf('hour')
    event.endAt = event.startAt.add(2, 'hour')
    setNewEvent(event)
  }

  const handleCloseModal = event => {
    if(!isTmpNewEvent) { appendCandidate(newEvent) }
    setAnchorEl(null)
    setNewEvent(null)
  }
  const handleClickOKButton = event => {
    appendCandidate(newEvent)
    setAnchorEl(null)
    setNewEvent(null)
  }
  const open = Boolean(anchorEl)

  const theme = createTheme({
    palette: {
      calendar: {
        main: "#26A69A"
      }
    }
  })

  const handleChangeStartAt = newValue => {
    let event = newEvent.copy()
    event.startAt = newValue
    setIsTmpNewEvent(false)
    setNewEvent(event)
  }

  const handleChangeEndAt = newValue => {
    let event = newEvent.copy()
    event.endAt = newValue
    setIsTmpNewEvent(false)
    setNewEvent(event)
  }

  const alldayEvents = events.filter(event => event.startAt.hour() === 0 && event.startAt.minute() === 0 && event.endAt.hour() === 23 && event.endAt.minute() === 59)
  let partialEvents = events.filter(event => alldayEvents.indexOf(event) === -1)
  newEvent && partialEvents.push(newEvent)

  partialEvents.sort((a, b) => {
    if(a.startAt.isBefore(b.startAt)) return -1
    if(a.startAt.isAfter(b.startAt)) return 1
    if(a.endAt.isBefore(b.endAt)) return -1
    if(a.endAt.isAfter(b.endAt)) return 1
    return 0
  })

  // eventの重なり表示を計算
  // しっかり重なってる
  partialEvents.forEach(event => {
    const nowEvents = partialEvents.filter(item => item.startAt.isSameOrBefore(event.startAt) && item.endAt.isAfter(event.startAt) && item.startAt.isAfter(event.startAt.subtract(1, 'hour')))
    nowEvents.forEach((item, index) => {
      const width = 100 / (index + 1)
      if (item.width > width) { item.width = width }
      const left = 100 - width
      if (item.left < left) { item.left = left }
    })
  })

  // 表示は重ならないけど時間は被ってる
  partialEvents.forEach(event => {
    const nowEvents = partialEvents.filter(item => item.startAt.isSameOrBefore(event.startAt) && item.endAt.isAfter(event.startAt) && !item.startAt.isAfter(event.startAt.subtract(1, 'hour')))
    nowEvents.forEach((item, index) => {
      const width = 100 - index * 5
      if (item.width > width) { item.width = width }
      const left = 5 * index
      if (item.left < left) { item.left = left }
    })
  })

  return (
    <>
      <div
        role="gridcell"
        className="day-column"
        onClick={handleOpenModal}
        >
        <div role="presentation" className="events">
          {
            partialEvents.map((event, key) => <Event event={event} key={key} />)
          }
        </div>
      </div>
      <ThemeProvider theme={theme}>
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseModal}
          anchorOrigin={{
            vertical: 'center',
            horizontal: 'right'
          }}
        >
          <Card>
            {newEvent &&
              <CardContent>
                <Typography variant="h5" sx={{marginBottom: "20px"}}>
                  <CircleIcon sx={{color: newEvent.color, marginRight: '5px'}}/>
                  "候補"
                </Typography>
                <div style={{display: "flex", marginBottom: "15px"}}>
                  <div style={{display: "inline-block", width: "24px", marginRight: '5px'}}></div>
                  <div style={{display: "flex", alignItems: "center"}}>
                    <Typography sx={{marginRight: "5px"}}>
                      {newEvent.startAt.format('DD/MM (ddd)')}
                    </Typography>
                    <MobileTimePicker
                      value={newEvent.startAt}
                      onChange={handleChangeStartAt}
                      renderInput={params => <TextField sx={{'& .MuiInputBase-input': {paddingTop: '5px', paddingBottom: '5px', width: "100px"}}} {...params}/>}
                    />
                    ~
                    <MobileTimePicker
                      value={newEvent.endAt}
                      onChange={handleChangeEndAt}
                      renderInput={params => <TextField sx={{'& .MuiInputBase-input': {paddingTop: '5px', paddingBottom: '5px', width: "100px"}}} {...params}/>}
                    />
                  </div>
                </div>
                <div style={{display: "flex"}}>
                  <CalendarMonthIcon color="grey" sx={{marginRight: "5px"}}/>
                  <Typography color="grey">
                    {newEvent.calendarTitle}
                  </Typography>
                </div>
              </CardContent>
            }
            <CardActions sx={{justifyContent: "end"}}>
              <Button color="calendar" onClick={handleCloseModal}>close</Button>
              <Button color="calendar"onClick={handleClickOKButton}>OK</Button>
            </CardActions>
          </Card>
        </Popover>
      </ThemeProvider>
    </>
  )
}

export default DayColumn

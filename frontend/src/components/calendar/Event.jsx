import { useState } from 'react'
import dayjs from 'dayjs'
import { Popover, Card, CardContent, CardActions, Button, Typography, TextField } from '@mui/material'
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { grey } from '@mui/material/colors'
import CircleIcon from '@mui/icons-material/Circle';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'

const Event = props => {
  const { event } = props

  const [anchorEl, setAnchorEl] = useState(null)

  const handleOpenModal = clickEvent => {
    if(event.calendarTitle === "re-calendar") clickEvent.stopPropagation()
    setAnchorEl(clickEvent.currentTarget)
  }
  const handleCloseModal = clickEvent => {
    if(event.calendarTitle === "re-calendar") clickEvent.stopPropagation()
    setAnchorEl(null)
  }
  const open = Boolean(anchorEl)

  const theme = createTheme({
    palette: {
      calendar: {
        main: event.color
      },
      grey: {
        main: grey[700],
      }
    }
  })

  const calculateY = startAt => {
    let top = 37/60*(startAt.hour()*60 + startAt.minute()) - 259
    return Math.max(top, -20)
  }

  const height = (startAt, endAt) => {
    const startY = Math.max(37/60*(startAt.hour()*60 + startAt.minute()), 259)
    const endY = 37/60*(endAt.hour()*60 + endAt.minute())
    return endY - startY
  }

  let eventStyle = {
    backgroundColor: event.color,
    borderColor: event.color,
    top: calculateY(event.startAt) + "px",
    height: height(event.startAt, event.endAt) - 2 + "px",
    width: event.width + "%",
    left: event.left + "%"
  }
  if(event.calendarTitle == "re-calendar") {eventStyle.cursor = 'pointer'}

  return (
    <div>
      <ThemeProvider theme={theme}>
        <div
          role="button"
          className="event"
          style={eventStyle}
          onClick={handleOpenModal}
        >
          <div></div>
          <div className="event-content-wrapper">
            <div className="event-content">
              <div className="event-title">
                <span>
                  <span>
                    {event.title}
                  </span>
                </span>
              </div>
              <div className="event-time">
                {event.time}
              </div>
              <div>
              </div>
            </div>
          </div>
        </div>
        {(event.calendarTitle === "re-calendar") && (
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
              <CardContent>
                <Typography variant="h5" sx={{marginBottom: "20px"}}>
                  <CircleIcon sx={{color: event.color, marginRight: '5px'}}/>
                  {event.title}
                </Typography>
                <div style={{display: "flex", marginBottom: "15px"}}>
                  <div style={{display: "inline-block", width: "24px", marginRight: '5px'}}></div>
                  <div style={{display: "flex", alignItems: "center"}}>
                    <Typography sx={{marginRight: "5px"}}>
                      {event.startAt.format('DD/MM (ddd)')}
                    </Typography>
                    <MobileTimePicker
                      value={event.startAt}
                      onChange={() => console.log('')}
                      renderInput={params => <TextField sx={{'& .MuiInputBase-input': {paddingTop: '5px', paddingBottom: '5px', width: "100px"}}} {...params}/>}
                    />
                    ~
                    <MobileTimePicker
                      value={event.endAt}
                      onChange={() => console.log('')}
                      renderInput={params => <TextField sx={{'& .MuiInputBase-input': {paddingTop: '5px', paddingBottom: '5px', width: "100px"}}} {...params}/>}
                    />
                  </div>
                </div>
                <div style={{display: "flex"}}>
                  <CalendarMonthIcon color="grey" sx={{marginRight: "5px"}}/>
                  <Typography color="grey">
                    {event.calendarTitle}
                  </Typography>
                </div>
              </CardContent>
              <CardActions sx={{justifyContent: "end"}}>
                <Button color="calendar" onClick={handleCloseModal}>close</Button>
                <Button color="calendar"onClick={handleCloseModal}>OK</Button>
              </CardActions>
            </Card>
          </Popover>
        )}
      </ThemeProvider>
    </div>
  )
}

export default Event

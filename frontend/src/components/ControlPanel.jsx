import { useState, useEffect } from 'react'
import { TextField, ToggleButtonGroup, ToggleButton, Box, Stack, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, Button } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker'
import dayjs from 'dayjs'

import { useCalendarContext } from '../context/CalendarContext'
import { getColor } from './calendar/Colors'

const ControlPanel = () => {
  const {
    calendars,
    candidates,
    useCalendarIDs,
    requiredTime,
    gapTime,
    startDate,
    endDate,
    startTime,
    endTime,
    updateUseCalendarIDs,
    updateRequiredTime,
    updateGapTime,
    updateStartDate,
    updateEndDate,
    updateStartTime,
    updateEndTime
  } = useCalendarContext()

  const [useCalendarNames, setUseCalendarNames] = useState([])
  const [candidateText, setCandidateText] = useState("")

  useEffect(() => {
    !!calendars && !!useCalendarIDs && setUseCalendarNames(calendars.filter(item => useCalendarIDs.indexOf(item.id) > -1).map(item => item.summary))
  }, [calendars, useCalendarIDs])

  useEffect(() => {
    setCandidateText(createCandidateText())
  }, [candidates])

  const handleCalendarSelectChange = event => {
    const {
      target: { value }
    } = event

    const useIds = calendars.filter(item => value.indexOf(item.summary) > -1).map(item => item.id)
    updateUseCalendarIDs(useIds)

    setUseCalendarNames(
      typeof value === 'string' ? value.split(',') : value
    )
  }

  const handleChangeRequiredTime = (_event, value) => value && updateRequiredTime(Number(value))
  const handleChangeGapTime = (_event, value) => value && updateGapTime(Number(value))

  const handleChangeStartDate = value => updateStartDate(value)
  const handleChangeEndDate = value => updateEndDate(value)
  const handleChangeStartTime = value => updateStartTime(value)
  const handleChangeEndTime = value => updateEndTime(value)
  const handleCopyText = event => navigator.clipboard.writeText(candidateText)

  const today = (new Date())
  const dayString = today.getFullYear() + '/' + ('0' + (today.getMonth() + 1)).slice(-1) + '/' + ('0' + today.getDay()).slice(-2)

  let themeObject = {palette: {}}
  calendars.length && calendars.forEach(item => {
    themeObject.palette[item.id] = {
      main: getColor(item.colorId).main
    }
  })
  const theme = createTheme(themeObject)
  calendars.forEach(item => console.log(getColor(item.colorId).main))

  const createCandidateText = () => {
    let candidateDays = candidates
      .map(candidate => candidate.startAt.format('M/D(ddd)'))
    candidateDays = [...new Set(candidateDays)] // 重複を除く
    candidateDays = candidateDays.map(day => {return {"day": day, "text": day + ' '}})
    candidates.forEach(candidate => {
      const dayObject = candidateDays.find(day => day.day === candidate.startAt.format('M/D(ddd)'))
      const endAtText = candidate.endAt.minute() === 59
        ? candidate.endAt.add(1, 'minute').format('HH:mm')
        : candidate.endAt.format('HH:mm')
      dayObject.text = dayObject.text + candidate.startAt.format('HH:mm')+"~"+ endAtText + ', '
    })
    return candidateDays.map(item => item.text.slice(0,-2)).join('\n')
  }

  return (
    <div style={{ width: '35%', padding: '20px' }}>
      <Stack sx={{ width: '60%', margin: 'auto'}}>
    {/*
        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: '30px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>カレンダー名</div>
          <TextField defaultValue={dayString + '作成のカレンダー'}/>
        </Box>
*/}

        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: '0px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>使用するカレンダー</div>
          <Select
            multiple
            value={useCalendarNames}
            onChange={handleCalendarSelectChange}
            input={<OutlinedInput />}
            renderValue={selected => selected.join(',')}
          >
            {calendars.map(item => (
              <MenuItem key={item.summary} value={item.summary}>
                <ThemeProvider theme={theme}>
                  <Checkbox checked={useCalendarNames.indexOf(item.summary) > -1} sx={{color: item.backgroundColor}} color={item.id}/>
                </ThemeProvider>
                <ListItemText primary={item.summary} />
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: '30px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>所要時間</div>
          <ToggleButtonGroup value={String(requiredTime)} onChange={handleChangeRequiredTime} exclusive color="primary">
            <ToggleButton value="30" sx={{width: 'calc(100% / 3)'}}>30分</ToggleButton>
            <ToggleButton value="60" sx={{width: 'calc(100% / 3)'}}>60分</ToggleButton>
            <ToggleButton value="90" sx={{width: 'calc(100% / 3)'}}>90分</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: '30px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>前後の確保時間</div>
          <ToggleButtonGroup value={String(gapTime)} onChange={handleChangeGapTime} exclusive color="primary">
            <ToggleButton value="30" sx={{width: 'calc(100% / 3)'}}>30分</ToggleButton>
            <ToggleButton value="60" sx={{width: 'calc(100% / 3)'}}>60分</ToggleButton>
            <ToggleButton value="90" sx={{width: 'calc(100% / 3)'}}>90分</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: '30px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>候補日程</div>
          <Box sx={{display: 'flex', alignItems: "center"}}>
            <DesktopDatePicker
              inputFormat="MM/DD/YYYY"
              value={startDate}
              onChange={handleChangeStartDate}
              renderInput={(params) => <TextField {...params} />}
            />
            <span>~</span>
            <DesktopDatePicker
              inputFormat="MM/DD/YYYY"
              value={endDate}
              onChange={handleChangeEndDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>
        </Box>

        <Box sx={{ textAlign: 'left', marginTop: '30px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>候補時間</div>
          <Box sx={{display: 'flex', alignItems: "center"}}>
            <MobileTimePicker
              value={startTime}
              onChange={handleChangeStartTime}
              renderInput={params => <TextField {...params}/>}
            />
            <span>~</span>
            <MobileTimePicker
              value={endTime}
              onChange={handleChangeEndTime}
              renderInput={params => <TextField {...params}/>}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginTop: '30px' }}>
          <div style={{fontWeight: 'bold', marginBottom: '10px'}}>空き時間出力</div>
          <Box sx={{ display: 'flex'}}>
            <TextField multiline rows={3} value={candidateText}/>
            <Button endDecorator={<ContentCopyIcon />} variant="outlined" sx={{margin: "auto 0 auto auto"}} onClick={handleCopyText}>
              <ContentCopyIcon/>
            </Button>
          </Box>
        </Box>
      </Stack>
    </div>
  )
}

export default ControlPanel

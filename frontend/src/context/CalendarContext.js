import { createContext, useState, useContext, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'

import Event from '../models/Event'

dayjs.locale('ja')
dayjs.extend(require('dayjs/plugin/isSameOrAfter'))
dayjs.extend(require('dayjs/plugin/isBetween'))

const CalendarContext = createContext({ candidates: [] })

export function useCalendarContext() {
  return useContext(CalendarContext)
}

export function CalendarProvider({ children }) {

  const [useCalendarIDs, setUseCalendarIDs] = useState([])
  const [requiredTime, setRequiredTime] = useState(60)
  const [gapTime, setGapTime] = useState(30)
  const [startDate, setStartDate] = useState(dayjs()) // 今日から
  const [endDate, setEndDate] = useState(dayjs().add(2, 'w')) // 2週間後まで
  const [startTime, setStartTime] = useState(dayjs().hour(10).minute(0).second(0)) // 10時から
  const [endTime, setEndTime] = useState(dayjs().hour(22).minute(0).second(0)) // 22時まで

  const [calendars, setCalendars] = useState([])
  const [candidates, setCandidates] = useState([])
  const [events, setEvents] = useState([])

  const defaultDays = [...Array(endDate.diff(startDate, 'day') + 1)].map((_, i) => {
    const day = startDate.add(i, 'day')
    return {
      dayNumber: day.date(),
      dayWeek: day.format('ddd'),
      events: []
    }
  })
  const [days, setDays] = useState(defaultDays)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    createCandidates()
  }, [useCalendarIDs, startTime, endTime, requiredTime, gapTime])

  useEffect(() => createCandidates(), [calendars])

  // 候補が変わると表示されるイベントリストを更新する
  useEffect(() => createDays(), [candidates])

  // ログイン直後に認証が成功するとカレンダーを読み込む
  useEffect(() => {
    getCalendars()
  }, [startDate, endDate])

  const updateUseCalendarIDs = value => setUseCalendarIDs(value)
  const updateRequiredTime = value => setRequiredTime(value)
  const updateGapTime = value => setGapTime(value)
  const updateStartDate = value => setStartDate(value)
  const updateEndDate = value => setEndDate(value)
  const updateStartTime = value => setStartTime(value)
  const updateEndTime = value => setEndTime(value)

  const getCalendars = async() => {
    setLoading(true)

    let result
    let calendarsData
    try {
      result = await fetch(`http://localhost:3001/calendars?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      calendarsData = await result.json()
    } catch (error) {
      console.log(error)
      // signOut()
    }

    // レスポンスを加工
    calendarsData?.forEach(calendar => {
      let googleEvents = calendar.events.map(item => {
        let startAt = null
        let endAt = null
        if(item.start.date) {
          startAt = dayjs(item.start.date).startOf('day')
          endAt = dayjs(item.end.date).subtract(1, 'day').endOf('day')
        } else {
          startAt = dayjs(item.start.dateTime)
          endAt = dayjs(item.end.dateTime)
        }
        const title = item.summary

        return new Event(title, calendar.summary, "", startAt, endAt, calendar.colorId)
      })

      // 複数日にまたがる予定は毎日分Eventを作る
      googleEvents
        .filter(event => event.startAt.date() !== event.endAt.date())
        .forEach(startDateEvent => {
          // イベント終了日
          let finishDateEvent = startDateEvent.copy()
          finishDateEvent.startAt = startDateEvent.endAt.startOf('day')
          googleEvents.push(finishDateEvent)

          // イベント開始日
          startDateEvent.startAt.endOf('day')

          // イベント中日
          let middleDateEvent = startDateEvent.copy()
          middleDateEvent.startAt = middleDateEvent.startAt.startOf('day')
          while(true) {
            middleDateEvent = middleDateEvent.copy()
            middleDateEvent.startAt = middleDateEvent.startAt.add(1, 'day')
            middleDateEvent.endAt = middleDateEvent.endAt.add(1, 'day')
            if (middleDateEvent.startAt.date() === finishDateEvent.startAt.date()) {
              break
            }
            googleEvents.push(middleDateEvent)
          }
        })

      calendar.events = googleEvents
    })

    setCalendars(calendarsData)
    setUseCalendarIDs(calendarsData?.map(item => item.id))

    setLoading(false)
  }

  const createCandidates = () => {
    const diff = endDate.diff(startDate, 'day') + 1

    let candidateEvents = [];
    let dayCandidates = [];
    [...Array(diff)].map((_, i) => {
      const startAt = startDate.add(i, 'd').hour(startTime.hour()).minute(startTime.minute()).second(0)
      const endAt = startDate.add(i, 'd').hour(endTime.hour()).minute(endTime.minute()).second(0).subtract(1, 's')

      dayCandidates = [new Event("候補", "re-calendar", "", startAt, endAt)]
      calendars
        ?.filter(item => useCalendarIDs.indexOf(item.id) > -1)
        .forEach(googleCalendar => {
          googleCalendar.events.forEach(googleEvent => {
            dayCandidates.forEach(candidateEvent => {
              // googleEventとcandidateEventが被っていたら、candidateEventを削る
              if(
                googleEvent.startAt.subtract(gapTime, 'minute').isSameOrBefore(candidateEvent.startAt)
                  && googleEvent.endAt.add(gapTime, 'minute').isBetween(candidateEvent.startAt, candidateEvent.endAt, null, '[]')
              ) {
                candidateEvent.startAt = googleEvent.endAt.add(gapTime, 'minute')

              } else if(
                googleEvent.startAt.subtract(gapTime, 'minute').isBetween(candidateEvent.startAt, candidateEvent.endAt, null, '()')
                  && googleEvent.endAt.add(gapTime, 'minute').isSameOrAfter(candidateEvent.endAt)
              ) {
                candidateEvent.endAt = googleEvent.startAt.subtract(gapTime, 'minute')

              } else if(
                googleEvent.startAt.subtract(gapTime, 'minute').isSameOrBefore(candidateEvent.startAt)
                  && googleEvent.endAt.add(gapTime, 'minute').isSameOrAfter(candidateEvent.endAt)
              ) {
                dayCandidates = dayCandidates.filter(event => event !== candidateEvent)

              } else if(
                googleEvent.startAt.subtract(gapTime, 'minute').isAfter(candidateEvent.startAt)
                  && googleEvent.endAt.add(gapTime, 'minute').isBefore(candidateEvent.endAt)
              ) {
                dayCandidates.push(new Event("候補", "re-calendar", "", googleEvent.endAt.add(gapTime, 'minute') , candidateEvent.endAt.clone()))
                candidateEvent.endAt = googleEvent.startAt.subtract(gapTime, 'minute')
              }
            })
          })
        })

      // 所要時間より短い候補は消す
      dayCandidates = dayCandidates.filter(event => event.endAt.add(1, 'second').diff(event.startAt, 'minute') >= requiredTime)

      candidateEvents.push(...dayCandidates)
    })

    setCandidates(candidateEvents)
  }

  const createDays = () => {
    const diff = endDate.diff(startDate, 'day') + 1
    let newDays = [...Array(endDate.diff(startDate, 'day') + 1)].map((_, i) => {
      const day = startDate.add(i, 'day')
      return {
        dayObject: day,
        dayNumber: day.date(),
        dayWeek: day.format('ddd'),
        events: []
      }
    })

    newDays.forEach(day => {
      const dayGoogleEvents = calendars?
        calendars
          .filter(item => useCalendarIDs.indexOf(item.id) > -1)
          .map(item => item.events?.filter(event => event.startAt.date() === day.dayNumber))
          .flat()
        : []
      const dayCandidates = candidates.filter(event => event.startAt.date() === day.dayNumber)
      dayCandidates.push(...dayGoogleEvents)

      day.events = dayCandidates
    })

    setDays(newDays)
  }

  const appendCandidate = newEvent => {
    setCandidates(prevCandidates => [...prevCandidates, newEvent])
  }

  return (
    <CalendarContext.Provider value={{
      calendars,
      useCalendarIDs,
      candidates,
      events,
      days,
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
      updateEndTime,
      loading,
      appendCandidate
    }}>
      {children}
    </CalendarContext.Provider>
  )
}


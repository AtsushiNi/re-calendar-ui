import { getColor, rgbToHsl } from '../components/calendar/Colors'

export default class Event {
  constructor(title, calendarTitle, time, startAt, endAt, colorId, left, width) {
    this.title = title
    this.calendarTitle = calendarTitle
    this.time = time
    this.startAt = startAt
    this.endAt = endAt
    this.colorId = colorId
    this.color = colorId ? getColor(colorId).event : "#26A69A"
    this.left = 0 // px
    this.width = 100 // %
  }

  copy() {
    return new Event(
      this.title,
      this.calendarTitle,
      this.time,
      this.startAt.clone(),
      this.endAt.clone(),
      this.colorId,
      this.left,
      this.width
    )
  }
}

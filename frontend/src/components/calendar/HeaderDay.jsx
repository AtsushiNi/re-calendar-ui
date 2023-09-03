const HeaderDay = props => {
  const { dayWeek, dayNumber } = props
  return (
    <div role="columnheader" className="header-day">
      <div className="header-day-border"></div>
      <h2 className="header-day-content">
        <div className="day-week">{dayWeek}</div>
        <div className="day-number">{dayNumber}</div>
      </h2>
    </div>
  )
}

export default HeaderDay

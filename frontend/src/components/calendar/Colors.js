export const getColor = id => {
  const mainColors = {
    1: '#795548',
    2: '#e67c73',
    3: '#d50000',
    4: '#f4511e',
    5: '#ef6c00',
    6: '#f09300',
    7: '#009688',
    8: '#0b8043',
    9: '#7cb342',
    10: '#c0ca33',
    11: '#e4c441',
    12: '#f6bf26',
    13: '#33b679',
    14: '#039be5',
    15: '#4285f4',
    16: '#3f51b5',
    17: '#7986cb',
    18: '#b39ddb',
    19: '#616161',
    20: '#a79b8e',
    21: '#ad1457',
    22: '#d81b60',
    23: '#8e24aa',
    24: '#9e69af'
  }
  const eventColors = {
    1: '#C9AEA5',
    2: '#F0B5B1',
    3: '#FF9E9E',
    4: '#F9AB94',
    5: '#FFBB84',
    6: '#FFD089',
    7: '#93FFF4',
    8: '#93F5C1',
    9: '#C7E0AD',
    10: '#DFE395',
    11: '#F0DE98',
    12: '#F9DA84',
    13: '#9BE2C1',
    14: '#81D5FD',
    15: '#9EC1F9',
    16: '#A8B1E0',
    17: '#AEB6DF',
    18: '#CDBFE7',
    19: '#C6C6C6',
    20: '#C6BFB7',
    21: '#F296BF',
    22: '#F197B8',
    23: '#D695E8',
    24: '#D1B9D9'
  }

  return {main: mainColors[id], event: eventColors[id]}
}
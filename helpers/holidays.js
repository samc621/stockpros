const moment = require('moment-business-days');

const nthDoWofMonth = (month, year, dayOfWeek, numWeeks) => {
  const result = moment(new Date(year, month - 1, 1));
  let counter = numWeeks - 1;
  while (counter >= 0) {
    if (result.day() !== dayOfWeek) {
      result.add(1, 'day');
    } else if (counter > 0) {
      result.add(1, 'day');
      counter -= 1;
    } else {
      break;
    }
  }

  return result;
};

const lastDoWofMonth = (month, year, dayOfWeek) => {
  const result = moment(new Date(year, month - 1, 1)).endOf('month');
  while (moment(result).date() !== 1) {
    if (result.day() !== dayOfWeek) {
      result.subtract(1, 'day');
    } else {
      break;
    }
  }

  return result;
};

const goodFriday = (year) => {
  const easter = {
    2020: new Date(2020, 3, 12),
    2021: new Date(2021, 3, 4),
    2022: new Date(2022, 3, 17),
    2023: new Date(2023, 3, 9),
    2024: new Date(2024, 2, 31),
    2025: new Date(2025, 3, 20)
  };

  if (!easter[year]) {
    return null;
  }

  return moment(easter[year]).subtract(2, 'd');
};

exports.calculateHolidays = (year) => {
  const holidays = {
    newYearsDay: moment(new Date(year, 0, 1)),
    mlkDay: nthDoWofMonth(1, year, 1, 3),
    washingtonsBirthday: nthDoWofMonth(2, year, 1, 3),
    goodFriday: goodFriday(year),
    memorialDay: lastDoWofMonth(5, year, 1),
    independenceDay: moment(new Date(year, 6, 4)),
    laborDay: nthDoWofMonth(9, year, 1, 1),
    thanksgivingDay: nthDoWofMonth(11, year, 4, 4),
    christmasDay: moment(new Date(year, 11, 25))
  };

  Object.entries(holidays).forEach(([holiday, date]) => {
    const dayOfWeek = moment(date).day();
    if (dayOfWeek === 6) holidays[holiday] = moment(date).subtract(1, 'd');
    if (dayOfWeek === 0) holidays[holiday] = moment(date).add(1, 'd');

    if (moment(holidays[holiday]).year() !== year) holidays[holiday] = null;
    if (holidays[holiday]) {
      holidays[holiday] = moment(holidays[holiday]).format('MM-DD-YYYY');
    }
  });

  return holidays;
};

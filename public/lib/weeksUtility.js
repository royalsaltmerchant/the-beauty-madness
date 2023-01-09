export function getCurrentWeek() {
  let curr = new Date();
  let week = [];

  for (let i = 1; i <= 7; i++) {
    let first = curr.getDate() - curr.getDay() + i;
    let day = new Date(curr.setDate(first));
    day.setHours(0, 0, 0, 0);
    week.push(day);
  }
  return week;
}

export function getNextWeek() {
  let curr = new Date();
  let week = [];
  curr.setDate(curr.getDate() - curr.getDay() + 7);
  for (let i = 1; i <= 7; i++) {
    let first = curr.getDate() - curr.getDay() + i;
    let day = new Date(curr.setDate(first));
    day.setHours(0, 0, 0, 0);
    week.push(day);
  }
  return week;
}
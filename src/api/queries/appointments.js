const db = require('../dbconfig')

async function addAppointmentQuery(data) {
  const query = {
    text: /*sql*/ `insert into public."Appointment" (date_of, uuid, length_in_hours, type, name, email, phone_number) values($1,$2,$3,$4,$5,$6,$7) returning *`,
    values: [
      data.date_of,
      data.uuid,
      data.length_in_hours,
      data.type,
      data.name,
      data.email,
      data.phone_number
    ]
  }
  return await db.query(query)
}

async function getAppointmentsQuery(startTime, endTime) {
  const query = {
    text: /*sql*/ `select * from public."Appointment" where date_of > $1 and date_of < $2 order by date_of asc`,
    values: [startTime, endTime]
  }
  return await db.query(query)
}

async function getAppointmentByDateQuery(date) {
  const query = {
    text: /*sql*/ `select * from public."Appointment" where date_of = $1`,
    values: [date]
  }
  return await db.query(query)
}

async function removeAppointmentQuery(id) {
  const query = {
    text: /*sql*/ `delete from public."Appointment" where id = $1`,
    values: [id]
  }

  return await db.query(query)
}

async function editAppointmentQuery(id, data) {
  let edits = ``
  let values = []
  let iterator = 1

  for(const [key, value] of Object.entries(data)) {
    edits += `${key} = $${iterator}, `;
    values.push(value)
    iterator++
  }

  edits = edits.slice(0, -2)
  values.push(id)

  const query = {
    text: /*sql*/ `update public."Appointment" set ${edits} where id = $${iterator} returning *`,
    values: values,
  }

  return await db.query(query)
}

module.exports = {
  addAppointmentQuery,
  getAppointmentsQuery,
  removeAppointmentQuery,
  editAppointmentQuery,
  getAppointmentByDateQuery
}
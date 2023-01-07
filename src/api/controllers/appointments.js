const {
  addAppointmentQuery,
  getAppointmentsQuery,
  removeAppointmentQuery,
  editAppointmentQuery,
  getAppointmentByDateQuery,
} = require("../queries/appointments.js");
const { v4: uuidv4 } = require("uuid");

async function addAppointment(req, res, next) {
  const uuid = uuidv4();
  req.body.uuid = uuid;
  try {
    // const dateConflict = await getAppointmentByDateQuery(req.body.date_of)
    // if(dateConflict.rows.length) throw {status: 400, message: "Appointment already exists"}
    const data = await addAppointmentQuery(req.body);
    res.status(201).json(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function getAppointments(req, res, next) {
  console.log(req.params);
  try {
    const data = await getAppointmentsQuery(
      req.params.start_time,
      req.params.end_time
    );

    res.send(data.rows);
  } catch (err) {
    next(err);
  }
}

async function removeAppointment(req, res, next) {
  try {
    const data = await removeAppointmentQuery(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function editAppointment(req, res, next) {
  try {
    const data = await editAppointmentQuery(req.params.id, req.body);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAppointments,
  addAppointment,
  removeAppointment,
  editAppointment,
};

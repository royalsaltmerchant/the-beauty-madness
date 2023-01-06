const express = require("express");
const {
  getAppointments,
  addAppointment,
  removeAppointment,
  editAppointment,
} = require("./controllers/appointments");
const { updateAppointmentBySessionId } = require("./controllers/stripe");

const router = express.Router();

// stripe
router.post("/update_appointment_by_session_id/:appointment_id", updateAppointmentBySessionId);
// appointments
router.get("/get_appointments/:start_time/:end_time", getAppointments);
router.post("/add_appointment", addAppointment);
router.delete("/remove_appointment/:id", removeAppointment);
router.post("/edit_appointment/:id", editAppointment);

module.exports = router;

const Stripe = require("stripe");
const stripe = Stripe(
  "sk_test_51MMXU4H2Keai9TtJeTCs69mTSJfW676nVpAiSXkiCTh6vHQbKEWndFCp2ctVxKSqBE5EsOECFDyPUDKjF68OATKZ00MMZNGLGe"
);
const { editAppointmentQuery } = require("../queries/appointments");
const mail = require("../services/mail.js");

async function updateAppointmentBySessionId(req, res, next) {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.body.session_id
    );
    // console.log(session, "SESSION ************");
    const appointmentData = await editAppointmentQuery(
      req.params.appointment_id,
      {
        paid: session.status === "complete" ? true : false,
        customer_id: session.customer,
        payment_id: session.id,
      }
    );
    // send confirmation email
    mail.sendMessage({
      email: session.customer_details.email,
      title: "Testing",
      message: `Here is your appointment ID: ${appointmentData.rows[0].uuid}`,
    });

    res.send(200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  updateAppointmentBySessionId,
};

async function updateAppointment(session_id, appointment_id) {
  try {
    const res = await fetch(`${window.location.origin}/api/update_appointment_by_session_id/${appointment_id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointment_id,
        session_id,
      }),
    });
    await res.json();
    if (res.status === 200) {
      return true
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return false
  }
}

async function handleConfirmation() {
  var searchParams = new URLSearchParams(window.location.search)
  var session_id = searchParams.get('session_id')
  var appointmentLocalStorage = localStorage.getItem("appointment")
  var appointment = await JSON.parse(appointmentLocalStorage)
  var appointment_id = appointment.id


  const res = await updateAppointment(session_id, appointment_id)
  console.log(res)
  if(!res) {
    window.alert("Something went wrong...")
  }
  window.location.href = "/index.html";
  localStorage.removeItem("appointment")
}

handleConfirmation()

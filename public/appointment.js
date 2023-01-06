function getCurrentWeek() {
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

function getNextWeek() {
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

class TimePicker {
  constructor() {
    this.parentElem = document.getElementById("time-picker");
    this.selectedDate = null;
    this.times = [
      "9:00",
      "9:30",
      "10:00",
      "10:30",
      "11:00",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
    ];

    this.viewNextWeek = false; // either current or next
    this.loading = false;

    this.render();
  }

  toggleViewNextWeek = () => {
    this.viewNextWeek = !this.viewNextWeek;
    this.render();
  };

  newAppointment = async (date) => {
    var searchParams = new URLSearchParams(window.location.search);
    var length = searchParams.get("length");

    try {
      // refetch appointments to check if conflict
      const days = this.viewNextWeek ? getNextWeek() : getCurrentWeek();
      const appointments = await this.getCurrentAppointmentTimes(days);
      if (appointments.includes(date.getTime())) {
        return window.alert(
          "We are sorry, this time has already been booked, please select a different time."
        );
      }
      // add appointment
      const res = await fetch(`${window.location.origin}/api/add_appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_of: date,
          length_in_hours: length,
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        return data;
      } else if (res.status === 400) {
        window.alert(
          "We are sorry, this time has already been booked, please select a different time."
        );
        this.render();
      } else throw new Error();
    } catch (err) {
      window.alert("Something went wrong, failed to create new appointment...");
      console.log(err);
      return null;
    }
  };

  getCurrentAppointmentTimes = async (days) => {
    const firstDay = days[0];
    const lastDay = days[6];
    lastDay.setHours(23, 59, 59, 59);
    try {
      const res = await fetch(
        `${
          window.location.origin
        }/api/get_appointments/${firstDay.toISOString()}/${lastDay.toISOString()}`,
        {
          method: "GET",
        }
      );
      const data = await res.json();
      console.log(data);
      if (res.status === 200) {
        // calculate all times times
        const calculatedTimes = [];
        this.times.forEach((time) => {
          days.forEach((day) => {
            const calculatedTime = this.getCalculatedTime(day, time).getTime();
            calculatedTimes.push(calculatedTime);
          });
        });
        // calculate current appointments booked
        const appointmentTimes = [];
        data.forEach((appointment) => {
          const initialAppointmentTime = new Date(
            appointment.date_of
          ).getTime();
          appointmentTimes.push(initialAppointmentTime);

          if (appointment.length_in_hours) {
            const endTimeInMilliseconds =
              appointment.length_in_hours * 60 * 60 * 1000 +
              initialAppointmentTime;
            for (var i = 0; i < calculatedTimes.length; i++) {
              if (
                calculatedTimes[i] > initialAppointmentTime &&
                calculatedTimes[i] <= endTimeInMilliseconds
              ) {
                if (!appointmentTimes.includes(calculatedTimes[i]))
                  appointmentTimes.push(calculatedTimes[i]);
              }
            }
          }
        });
        return appointmentTimes;
      } else throw new Error();
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  renderLoading = () => {
    this.parentElem.append("Please wait, confirming appointment...");
  };

  confirmDate = async () => {
    const date = new Date(this.selectedDate);
    this.loading = true;
    this.render();
    const appointment = await this.newAppointment(date);
    this.loading = false;

    var searchParams = new URLSearchParams(window.location.search);
    var service = searchParams.get("service");

    const serviceUrls = {
      premium: "https://book.stripe.com/test_28o9EA6Ai2GMdfGcMM",
      simple: "https://book.stripe.com/test_fZe184bUC8162B2002",
      special: "https://book.stripe.com/test_28o9EA6Ai2GMdfGcMM",
    };

    if (appointment) {
      localStorage.setItem("appointment", JSON.stringify(appointment));
      window.location.href = serviceUrls[service];
    } else this.render();
  };

  getCalculatedTime = (day, time) => {
    const newDate = day;
    const timeSplit = time.split(":");
    for (var i = 0; i < timeSplit.length; i++) {
      timeSplit[i] = parseInt(timeSplit[i]);
    }
    newDate.setHours(timeSplit[0], timeSplit[1], 0, 0);
    return newDate;
  };

  render = async () => {
    // clear
    this.parentElem.innerHTML = "";
    // loading
    if (this.loading) return this.renderLoading();

    const days = this.viewNextWeek ? getNextWeek() : getCurrentWeek();
    const appointments = await this.getCurrentAppointmentTimes(days);

    const switchWeeksButton = document.createElement("button");
    switchWeeksButton.innerText = this.viewNextWeek
      ? "View This Week"
      : "View Next Week";
    switchWeeksButton.addEventListener("click", this.toggleViewNextWeek);

    const refreshButton = document.createElement("button");
    refreshButton.innerText = "Refresh";
    refreshButton.addEventListener("click", this.render);

    const confirmButton = document.createElement("button");
    confirmButton.innerText = "Confirm";
    confirmButton.addEventListener("click", this.confirmDate);

    // final append
    this.parentElem.append(
      switchWeeksButton,
      refreshButton
    );
    
    const gridDiv = document.createElement("div");
    new Grid({
      parentElem: gridDiv,
      days,
      times: this.times,
      appointments,
      getCalculatedTime: this.getCalculatedTime,
      setSelectedDate: (date) => this.selectedDate = date
    })

    this.parentElem.append(
      gridDiv,
      document.createElement("br"),
      confirmButton
    )
  };
}

new TimePicker();

class Grid {
  constructor(props) {
    this.parentElem = props.parentElem,
    this.days = props.days
    this.times = props.times
    this.appointments = props.appointments
    this.getCalculatedTime = props.getCalculatedTime
    this.setSelectedDate = props.setSelectedDate

    this.highlightedDate = null;

    this.render()
  }

  render = () => {
    // clear
    this.parentElem.innerHTML = "";

    const divsToAppend = [];
    // days
    const daysDiv = document.createElement("div");
    daysDiv.style.display = "flex";
    this.days.forEach((day) => {
      const dayString =
        day.toLocaleDateString("it-IT", { weekday: "long" }) +
        " " +
        day.toLocaleDateString("it-IT", {
          month: "numeric",
          day: "numeric",
        });
      const elem = document.createElement("div");
      elem.className = "time-picker-grid-day";
      elem.innerText = dayString;
      daysDiv.appendChild(elem);
    });
    divsToAppend.push(daysDiv);
    // times
    this.times.forEach((time) => {
      const timesDiv = document.createElement("div");
      timesDiv.style.display = "flex";
      this.days.forEach((day) => {
        const elem = document.createElement("div");
        const calculatedTime = this.getCalculatedTime(day, time).getTime();
  
        if (this.appointments.includes(calculatedTime)) {
          elem.className = "time-picker-grid-time-unavailable";
          elem.innerText = new Date(calculatedTime).toLocaleTimeString(
            "it-IT",
            { hour: "2-digit", minute: "2-digit" }
          );
          timesDiv.appendChild(elem);
          return;
        }
  
        elem.className = "time-picker-grid-time";

        if (this.highlightedDate && this.highlightedDate === calculatedTime) {
          elem.className = "time-picker-grid-time-selected";
        }
  
        elem.innerText = new Date(calculatedTime).toLocaleTimeString("it-IT", {
          hour: "2-digit",
          minute: "2-digit",
        });
        // even handler
        elem.addEventListener("click", () => {
          this.highlightedDate = calculatedTime;
          this.setSelectedDate(calculatedTime);
          elem.className = "time-picker-grid-time-selected";
          this.render();
        });
  
        timesDiv.appendChild(elem);
      });
  
      divsToAppend.push(timesDiv);
    });
    this.parentElem.append(...divsToAppend)
  }
}

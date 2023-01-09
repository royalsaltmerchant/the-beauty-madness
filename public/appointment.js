import { getCurrentWeek, getNextWeek } from "./lib/weeksUtility.js";
import createElement from "./lib/createElement.js";
import Grid from "./lib/Grid.js";
import { enforceFormat, formatToPhone } from "./lib/phoneUtils.js";

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
    this.hasSelectedDate = false;
    this.loading = false;

    // form
    this.name = "";
    this.email = "";
    this.phoneNumber = "";

    this.render();
  }

  toggleViewNextWeek = () => {
    this.viewNextWeek = !this.viewNextWeek;
    this.render();
  };

  toggleHasSelectedDate = () => {
    this.hasSelectedDate = !this.hasSelectedDate;
    this.render();
  };

  newAppointment = async (date) => {
    var searchParams = new URLSearchParams(window.location.search);
    var length = searchParams.get("length");
    var service = searchParams.get("service")

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
          type: service,
          name: this.name,
          email: this.email,
          phone_number: this.phoneNumber
        }),
      });
      const data = await res.json();
      if (res.status === 201) {
        return data;
      } else if (res.status === 400) {
        window.alert(
          "We are sorry, this time has already been booked, please select a different time."
        );
        this.toggleHasSelectedDate();
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

        // removal
        const appointmentTimes = [];
        // remove the past
        calculatedTimes.forEach((time) => {
          if (time < Date.now()) {
            appointmentTimes.push(time);
          }
        });
        // remove previously booke appointments
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

  renderPersonalInfoForm = async () => {
    this.parentElem.append(
      createElement(
        "h1",
        {},
        "Please provide some information so we can contact you if necessary"
      ),
      createElement("br"),
      createElement("form", {}, [
        createElement("div", {}, [
          createElement("div", {}, "Name"),
          createElement(
            "input",
            {
              id: "name",
              name: "name",
              value: this.name,
              placeholder: "Full Name",
              required: true,
            }
          ),
        ]),
        createElement("br"),
        createElement("div", {}, [
          createElement("div", {type: "email"}, "Email"),
          createElement(
            "input",
            {
              id: "email",
              name: "email",
              value: this.email,
              placeholder: "Email Address",
              required: true,
            }
          ),
        ]),
        createElement("br"),
        createElement("div", {}, [
          createElement("div", {}, "Phone Number"),
          createElement(
            "input",
            {
              maxlength: "16",
              id: "phone-number",
              name: "phone-number",
              placeholder: "Phone Number",
              value: this.phoneNumber,
              required: true,
            },
            [
              { type: "keydown", event: enforceFormat },
              { type: "keyup", event: formatToPhone },
            ]
          ),
        ]),
        createElement("br"),
        createElement("button", {type: "submit"}, "Complete")
      ], {
        type: "submit",
        event: (e) => {
          e.preventDefault();
          console.log(e);
          const formData = new FormData(e.target);
          const formProps = Object.fromEntries(formData);
          this.name = formProps.name;
          this.phoneNumber = formProps["phone-number"];
          this.email = formProps.email;
          this.confirmDate()
        },
      })
    );
  };

  render = async () => {
    // clear
    this.parentElem.innerHTML = "";
    // loading
    if (this.loading) return this.renderLoading();
    // render personal info form
    if (this.hasSelectedDate) return this.renderPersonalInfoForm();

    // switch weeks button
    const switchWeeksButton = createElement(
      "button",
      { style: "margin-right: 5px;" },
      this.viewNextWeek ? "View This Week" : "View Next Week",
      { type: "click", event: this.toggleViewNextWeek }
    );
    // refresh button
    const refreshButton = createElement("button", {}, "Refresh", {
      type: "click",
      event: this.render,
    });
    // div for buttons
    const buttonDiv = createElement("div", {}, [
      switchWeeksButton,
      refreshButton,
    ]);
    // grid
    const days = this.viewNextWeek ? getNextWeek() : getCurrentWeek();
    const appointments = await this.getCurrentAppointmentTimes(days);
    const gridDiv = createElement("div", { id: "grid" });
    new Grid({
      parentElem: gridDiv,
      days,
      times: this.times,
      appointments,
      getCalculatedTime: this.getCalculatedTime,
      setSelectedDate: (date) => {
        var searchParams = new URLSearchParams(window.location.search);
        var length = searchParams.get("length");

        this.selectedDate = date;
        date = new Date(date);
        const dateString = date.toLocaleTimeString("it-IT", {
          month: "long",
          day: "numeric",
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
        });
        // calculate ending time
        const initialAppointmentTime = date.getTime();
        const endTimeInMilliseconds =
          length * 60 * 60 * 1000 + initialAppointmentTime;
        const endTimeString = new Date(
          endTimeInMilliseconds
        ).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
        document.getElementById(
          "selected-date-info"
        ).innerHTML = /*html*/ `<div id="selected-date">${dateString} - ${endTimeString}</div>`;

        nextButton.style.visibility = "visible";
        window.scrollTo(0, document.body.scrollHeight);
      },
    });
    // info
    const selectedDateInfoElem = createElement("div");
    selectedDateInfoElem.id = "selected-date-info";

    // next button
    const nextButton = createElement(
      "button",
      { style: "visibility: hidden;" },
      "Next",
      {
        type: "click",
        event: () => this.toggleHasSelectedDate(),
      }
    );

    // render
    this.parentElem.append(
      createElement("h1", {}, "Choose a time"),
      createElement("br"),
      buttonDiv,
      createElement("br"),
      gridDiv,
      createElement("br"),
      selectedDateInfoElem,
      createElement("br"),
      nextButton
    );
  };
}

new TimePicker();

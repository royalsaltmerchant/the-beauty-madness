import createElement from "./createElement.js";

export default class Grid {
  constructor(props) {
    (this.parentElem = props.parentElem), (this.days = props.days);
    this.times = props.times;
    this.appointments = props.appointments;
    this.getCalculatedTime = props.getCalculatedTime;
    this.setSelectedDate = props.setSelectedDate;

    this.highlightedDate = null;

    this.render();
  }

  render = () => {
    // clear
    this.parentElem.innerHTML = "";

    const divsToAppend = [];
    // days
    const daysDiv = createElement("div", {class: "grid-row-day"});
    this.days.forEach((day) => {
      const dayString =
        // day.toLocaleDateString("it-IT", { weekday: "long" }) +
        // " " +
        day.toLocaleDateString("it-IT", {
          month: "numeric",
          day: "numeric",
        });
      const elem = createElement("div");
      elem.className = "time-picker-grid-day";
      elem.innerText = dayString;
      daysDiv.appendChild(elem);
    });
    divsToAppend.push(daysDiv);
    // times
    this.times.forEach((time) => {
      const timesDiv = createElement("div", {class: "grid-row-time"});
      this.days.forEach((day) => {
        const elem = createElement("div");
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
    this.parentElem.append(...divsToAppend);
  };
}
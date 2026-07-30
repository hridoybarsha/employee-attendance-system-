"use strict";

/* =========================================
STORAGE
========================================= */

const EMPLOYEE_STORAGE =
"EMPLOYEE_ATTENDANCE_EMPLOYEES_V2";

const ATTENDANCE_STORAGE =
"EMPLOYEE_ATTENDANCE_RECORDS_V2";

let employees =
JSON.parse(
localStorage.getItem(EMPLOYEE_STORAGE)
) || [];

let attendance =
JSON.parse(
localStorage.getItem(ATTENDANCE_STORAGE)
) || [];

/* =========================================
APP STATE
========================================= */

let currentCalendarDate =
new Date();

let selectedDate =
getToday();

/* =========================================
START
========================================= */

document.addEventListener(
"DOMContentLoaded",
function () {

setupNavigation();

setupButtons();

setInitialDates();

renderEverything();

}
);

/* =========================================
NAVIGATION
========================================= */

function setupNavigation() {

const navItems =
document.querySelectorAll(
".nav-item"
);

navItems.forEach(
function (item) {

  item.addEventListener(
    "click",
    function () {

      const page =
        item.dataset.page;


      document
        .querySelectorAll(".nav-item")
        .forEach(
          function (nav) {

            nav.classList.remove(
              "active"
            );

          }
        );


      item.classList.add(
        "active"
      );


      document
        .querySelectorAll(".page")
        .forEach(
          function (section) {

            section.classList.remove(
              "active"
            );

          }
        );


      const target =
        document.getElementById(
          page + "Page"
        );


      if (target) {

        target.classList.add(
          "active"
        );

      }


      const titles = {

        dashboard:
          "Dashboard",

        employees:
          "Employees",

        attendance:
          "Attendance",

        reports:
          "Reports"

      };


      document
        .getElementById(
          "pageTitle"
        )
        .textContent =
        titles[page] ||
        "Dashboard";


      if (
        page ===
        "attendance"
      ) {

        renderCalendar();

      }


      if (
        page ===
        "reports"
      ) {

        generateReport();

      }

    }
  );

}

);

}

/* =========================================
BUTTONS
========================================= */

function setupButtons() {

document
.getElementById(
"addEmployeeBtn"
)
.addEventListener(
"click",
openAddEmployee
);

document
.getElementById(
"closeModalBtn"
)
.addEventListener(
"click",
closeEmployeeModal
);

document
.getElementById(
"cancelModalBtn"
)
.addEventListener(
"click",
closeEmployeeModal
);

document
.getElementById(
"employeeForm"
)
.addEventListener(
"submit",
saveEmployee
);

document
.getElementById(
"employeeSearch"
)
.addEventListener(
"input",
renderEmployees
);

document
.getElementById(
"previousMonth"
)
.addEventListener(
"click",
previousMonth
);

document
.getElementById(
"nextMonth"
)
.addEventListener(
"click",
nextMonth
);

document
.getElementById(
"markAllPresentBtn"
)
.addEventListener(
"click",
markAllPresent
);

document
.getElementById(
"goAttendanceBtn"
)
.addEventListener(
"click",
function () {

    document
      .querySelector(
        '[data-page="attendance"]'
      )
      .click();

  }
);

document
.getElementById(
"generateReportBtn"
)
.addEventListener(
"click",
generateReport
);

document
.getElementById(
"exportCsvBtn"
)
.addEventListener(
"click",
exportCSV
);

document
.getElementById(
"employeeModal"
)
.addEventListener(
"click",
function (event) {

    if (
      event.target ===
      this
    ) {

      closeEmployeeModal();

    }

  }
);

}

/* =========================================
INITIAL DATE
========================================= */

function setInitialDates() {

const today =
new Date();

document
.getElementById(
"todayDate"
)
.textContent =
today.toLocaleDateString(
"en-IN",
{
weekday: "long",
year: "numeric",
month: "long",
day: "numeric"
}
);

document
.getElementById(
"reportMonth"
)
.value =
formatMonth(
today
);

}

/* =========================================
DATE HELPERS
========================================= */

function getToday() {

const date =
new Date();

return formatDate(
date
);

}

function formatDate(date) {

const year =
date.getFullYear();

const month =
String(
date.getMonth() + 1
).padStart(
2,
"0"
);

const day =
String(
date.getDate()
).padStart(
2,
"0"
);

return (
year +
"-" +
month +
"-" +
day
);

}

function formatMonth(date) {

return (

date.getFullYear() +

"-" +

String(
  date.getMonth() + 1
).padStart(
  2,
  "0"
)

);

}

/* =========================================
SAVE
========================================= */

function saveData() {

localStorage.setItem(

EMPLOYEE_STORAGE,

JSON.stringify(
  employees
)

);

localStorage.setItem(

ATTENDANCE_STORAGE,

JSON.stringify(
  attendance
)

);

}

/* =========================================
EMPLOYEE MODAL
========================================= */

function openAddEmployee() {

document
.getElementById(
"modalTitle"
)
.textContent =
"Add Employee";

document
.getElementById(
"employeeForm"
)
.reset();

document
.getElementById(
"editEmployeeId"
)
.value =
"";

document
.getElementById(
"employeeId"
)
.disabled =
false;

document
.getElementById(
"joinDate"
)
.value =
getToday();

document
.getElementById(
"employeeModal"
)
.classList.add(
"show"
);

}

function closeEmployeeModal() {

document
.getElementById(
"employeeModal"
)
.classList.remove(
"show"
);

}

/* =========================================
SAVE EMPLOYEE
========================================= */

function saveEmployee(event) {

event.preventDefault();

const id =
document
.getElementById(
"employeeId"
)
.value
.trim();

const name =
document
.getElementById(
"employeeName"
)
.value
.trim();

const phone =
document
.getElementById(
"employeePhone"
)
.value
.trim();

const position =
document
.getElementById(
"employeePosition"
)
.value
.trim();

const joinDate =
document
.getElementById(
"joinDate"
)
.value;

const status =
document
.getElementById(
"employeeStatus"
)
.value;

const editId =
document
.getElementById(
"editEmployeeId"
)
.value;

if (
!id ||
!name ||
!joinDate
) {

alert(
  "Please fill all required fields."
);

return;

}

/* EDIT */

if (editId) {

const employee =
  employees.find(
    function (item) {

      return (
        item.id ===
        editId
      );

    }
  );


if (employee) {

  employee.name =
    name;

  employee.phone =
    phone;

  employee.position =
    position;

  employee.joinDate =
    joinDate;

  employee.status =
    status;

}

}

/* ADD */

else {

const exists =
  employees.some(
    function (item) {

      return (
        item.id.toLowerCase() ===
        id.toLowerCase()
      );

    }
  );


if (exists) {

  alert(
    "Employee ID already exists!"
  );

  return;

}


employees.push({

  id: id,

  name: name,

  phone: phone,

  position: position,

  joinDate: joinDate,

  status: status

});

}

saveData();

closeEmployeeModal();

renderEverything();

alert(
editId
? "Employee updated successfully!"
: "Employee added successfully!"
);

}

/* =========================================
RENDER EMPLOYEES
========================================= */

function renderEmployees() {

const table =
document.getElementById(
"employeeTable"
);

const search =
document
.getElementById(
"employeeSearch"
)
.value
.toLowerCase()
.trim();

const list =
employees.filter(
function (employee) {

    return (

      employee.id
        .toLowerCase()
        .includes(search)

      ||

      employee.name
        .toLowerCase()
        .includes(search)

      ||

      employee.phone
        .toLowerCase()
        .includes(search)

    );

  }
);

if (
list.length ===
0
) {

table.innerHTML = `

  <tr>

    <td
      colspan="7"
      class="empty">

      No employees found.

    </td>

  </tr>

`;

return;

}

table.innerHTML =
list.map(
function (employee) {

    return `

      <tr>

        <td>
          ${safe(employee.id)}
        </td>

        <td>
          ${safe(employee.name)}
        </td>

        <td>
          ${safe(employee.phone || "-")}
        </td>

        <td>
          ${safe(employee.position || "-")}
        </td>

        <td>
          ${employee.joinDate}
        </td>

        <td>

          <span class="status ${
            employee.status ===
            "Active"

            ? "status-present"

            : "status-absent"
          }">

            ${employee.status}

          </span>

        </td>

        <td>

          <button
            class="primary-btn"
            data-edit="${employee.id}">

            Edit

          </button>


          <button
            class="danger-btn"
            data-delete="${employee.id}">

            Delete

          </button>

        </td>

      </tr>

    `;

  }
).join("");

table
.querySelectorAll(
"[data-edit]"
)
.forEach(
function (button) {

    button.addEventListener(
      "click",
      function () {

        editEmployee(
          button.dataset.edit
        );

      }
    );

  }
);

table
.querySelectorAll(
"[data-delete]"
)
.forEach(
function (button) {

    button.addEventListener(
      "click",
      function () {

        deleteEmployee(
          button.dataset.delete
        );

      }
    );

  }
);

}

/* =========================================
EDIT
========================================= */

function editEmployee(id) {

const employee =
employees.find(
function (item) {

    return item.id === id;

  }
);

if (!employee) {

return;

}

document
.getElementById(
"modalTitle"
)
.textContent =
"Edit Employee";

document
.getElementById(
"editEmployeeId"
)
.value =
employee.id;

document
.getElementById(
"employeeId"
)
.value =
employee.id;

document
.getElementById(
"employeeId"
)
.disabled =
true;

document
.getElementById(
"employeeName"
)
.value =
employee.name;

document
.getElementById(
"employeePhone"
)
.value =
employee.phone || "";

document
.getElementById(
"employeePosition"
)
.value =
employee.position || "";

document
.getElementById(
"joinDate"
)
.value =
employee.joinDate;

document
.getElementById(
"employeeStatus"
)
.value =
employee.status;

document
.getElementById(
"employeeModal"
)
.classList.add(
"show"
);

}

/* =========================================
DELETE
========================================= */

function deleteEmployee(id) {

if (
!confirm(
"Delete this employee?"
)
) {

return;

}

employees =
employees.filter(
function (employee) {

    return (
      employee.id !== id
    );

  }
);

attendance =
attendance.filter(
function (record) {

    return (
      record.employeeId !==
      id
    );

  }
);

saveData();

renderEverything();

}

/* =========================================
CALENDAR
========================================= */

function renderCalendar() {

const calendar =
document.getElementById(
"calendar"
);

const year =
currentCalendarDate
.getFullYear();

const month =
currentCalendarDate
.getMonth();

const firstDay =
new Date(
year,
month,
1
).getDay();

const daysInMonth =
new Date(
year,
month + 1,
0
).getDate();

document
.getElementById(
"calendarTitle"
)
.textContent =
currentCalendarDate.toLocaleDateString(
"en-IN",
{
month: "long",
year: "numeric"
}
);

calendar.innerHTML = "";

/* EMPTY DAYS */

for (
let i = 0;
i < firstDay;
i++
) {

const empty =
  document.createElement(
    "div"
  );


empty.className =
  "calendar-day empty-day";


calendar.appendChild(
  empty
);

}

/* DAYS */

for (
let day = 1;
day <= daysInMonth;
day++
) {

const date =
  new Date(
    year,
    month,
    day
  );


const dateString =
  formatDate(
    date
  );


const cell =
  document.createElement(
    "div"
  );


cell.className =
  "calendar-day";


if (
  dateString ===
  getToday()
) {

  cell.classList.add(
    "today-highlight"
  );

}


if (
  dateString ===
  selectedDate
) {

  cell.classList.add(
    "selected-day"
  );

}


const status =
  getDayStatus(
    dateString
  );


if (status) {

  cell.classList.add(
    "day-" +
    status.toLowerCase()
  );

}


cell.innerHTML = `

  <div class="day-number">

    ${day}

  </div>


  <div class="day-status">

    ${
      status
        ? getStatusEmoji(status) +
          " " +
          status
        : employees.length
          ? "No Mark"
          : ""
    }

  </div>

`;


cell.addEventListener(
  "click",
  function () {

    selectDate(
      dateString
    );

  }
);


calendar.appendChild(
  cell
);

}

}

/* =========================================
CALENDAR STATUS
========================================= */

function getDayStatus(date) {

if (
employees.length ===
0
) {

return "";

}

const records =
attendance.filter(
function (record) {

    return (
      record.date ===
      date
    );

  }
);

if (
records.length ===
0
) {

return "";

}

const statuses =
records.map(
function (record) {

    return record.status;

  }
);

if (
statuses.includes(
"Present"
)
) {

return "Present";

}

if (
statuses.includes(
"Late"
)
) {

return "Late";

}

if (
statuses.includes(
"Leave"
)
) {

return "Leave";

}

return "Absent";

}

function getStatusEmoji(status) {

const icons = {

Present: "🟢",

Absent: "🔴",

Late: "🟡",

Leave: "🔵"

};

return (
icons[status] ||
""
);

}

/* =========================================
MONTH CHANGE
========================================= */

function previousMonth() {

currentCalendarDate =
new Date(
currentCalendarDate
.getFullYear(),

  currentCalendarDate
    .getMonth() - 1,

  1

);

renderCalendar();

}

function nextMonth() {

currentCalendarDate =
new Date(
currentCalendarDate
.getFullYear(),

  currentCalendarDate
    .getMonth() + 1,

  1

);

renderCalendar();

}

/* =========================================
SELECT DATE
========================================= */

function selectDate(date) {

selectedDate =
date;

renderCalendar();

document
.getElementById(
"selectedDateCard"
)
.classList.remove(
"hidden"
);

document
.getElementById(
"selectedDateTitle"
)
.textContent =
"Attendance - " +
formatDisplayDate(
date
);

renderSelectedDate();

}

function formatDisplayDate(date) {

return new Date(
date + "T00:00:00"
).toLocaleDateString(
"en-IN",
{
weekday: "long",
day: "numeric",
month: "long",
year: "numeric"
}
);

}

/* =========================================
SELECTED DATE TABLE
========================================= */

function renderSelectedDate() {

const table =
document.getElementById(
"selectedDateTable"
);

if (
employees.length ===
0
) {

table.innerHTML = `

  <tr>

    <td
      colspan="6"
      class="empty">

      Add employees first.

    </td>

  </tr>

`;

return;

}

table.innerHTML =
employees.map(
function (employee) {

    const record =
      getRecord(
        employee.id,
        selectedDate
      );


    const status =
      record
        ? record.status
        : "Absent";


    return `

      <tr>

        <td>
          ${safe(employee.id)}
        </td>

        <td>
          ${safe(employee.name)}
        </td>

        <td>
          ${
            record?.checkIn ||
            "-"
          }
        </td>

        <td>
          ${
            record?.checkOut ||
            "-"
          }
        </td>

        <td>

          <span class="status ${
            getStatusClass(
              status
            )
          }">

            ${status}

          </span>

        </td>

        <td>

          <button
            class="primary-btn"
            data-checkin="${employee.id}">

            Check In

          </button>


          <button
            class="secondary-btn"
            data-checkout="${employee.id}">

            Check Out

          </button>


          <button
            class="danger-btn"
            data-absent="${employee.id}">

            Absent

          </button>

        </td>

      </tr>

    `;

  }
).join("");

table
.querySelectorAll(
"[data-checkin]"
)
.forEach(
function (button) {

    button.addEventListener(
      "click",
      function () {

        checkIn(
          button.dataset.checkin
        );

      }
    );

  }
);

table
.querySelectorAll(
"[data-checkout]"
)
.forEach(
function (button) {

    button.addEventListener(
      "click",
      function () {

        checkOut(
          button.dataset.checkout
        );

      }
    );

  }
);

table
.querySelectorAll(
"[data-absent]"
)
.forEach(
function (button) {

    button.addEventListener(
      "click",
      function () {

        markAbsent(
          button.dataset.absent
        );

      }
    );

  }
);

}

/* =========================================
ATTENDANCE RECORD
========================================= */

function getRecord(
employeeId,
date
) {

return attendance.find(
function (record) {

  return (

    record.employeeId ===
    employeeId

    &&

    record.date ===
    date

  );

}

);

}

/* =========================================
CHECK IN
========================================= */

function checkIn(
employeeId
) {

let record =
getRecord(
employeeId,
selectedDate
);

const time =
new Date().toLocaleTimeString(
"en-IN",
{
hour: "2-digit",
minute: "2-digit"
}
);

if (!record) {

attendance.push({

  employeeId:
    employeeId,

  date:
    selectedDate,

  checkIn:
    time,

  checkOut:
    "",

  status:
    "Present"

});

}

else {

record.checkIn =
  time;

record.status =
  "Present";

}

saveData();

renderEverything();

selectDate(
selectedDate
);

}

/* =========================================
CHECK OUT
========================================= */

function checkOut(
employeeId
) {

const record =
getRecord(
employeeId,
selectedDate
);

if (!record) {

alert(
  "Please Check In first."
);

return;

}

record.checkOut =
new Date().toLocaleTimeString(
"en-IN",
{
hour: "2-digit",
minute: "2-digit"
}
);

saveData();

renderEverything();

selectDate(
selectedDate
);

}

/* =========================================
ABSENT
========================================= */

function markAbsent(
employeeId
) {

let record =
getRecord(
employeeId,
selectedDate
);

if (!record) {

attendance.push({

  employeeId:
    employeeId,

  date:
    selectedDate,

  checkIn:
    "",

  checkOut:
    "",

  status:
    "Absent"

});

}

else {

record.status =
  "Absent";

record.checkIn =
  "";

record.checkOut =
  "";

}

saveData();

renderEverything();

selectDate(
selectedDate
);

}

/* =========================================
MARK ALL PRESENT
========================================= */

function markAllPresent() {

if (
employees.length ===
0
) {

alert(
  "Please add employees first."
);

return;

}

employees.forEach(
function (employee) {

  let record =
    getRecord(
      employee.id,
      selectedDate
    );


  if (!record) {

    attendance.push({

      employeeId:
        employee.id,

      date:
        selectedDate,

      checkIn:
        "",

      checkOut:
        "",

      status:
        "Present"

    });

  }

  else {

    record.status =
      "Present";

  }

}

);

saveData();

renderEverything();

selectDate(
selectedDate
);

}

/* =========================================
STATUS CLASS
========================================= */

function getStatusClass(
status
) {

if (
status ===
"Present"
) {

return "status-present";

}

if (
status ===
"Late"
) {

return "status-late";

}

if (
status ===
"Leave"
) {

return "status-leave";

}

return "status-absent";

}

/* =========================================
DASHBOARD
========================================= */

function updateDashboard() {

const today =
getToday();

const records =
attendance.filter(
function (record) {

    return (
      record.date ===
      today
    );

  }
);

const present =
records.filter(
r =>
r.status ===
"Present"
).length;

const late =
records.filter(
r =>
r.status ===
"Late"
).length;

const leave =
records.filter(
r =>
r.status ===
"Leave"
).length;

const absent =
Math.max(
employees.length -
present -
late -
leave,
0
);

document
.getElementById(
"totalEmployees"
)
.textContent =
employees.length;

document
.getElementById(
"presentToday"
)
.textContent =
present;

document
.getElementById(
"absentToday"
)
.textContent =
absent;

document
.getElementById(
"lateToday"
)
.textContent =
late;

document
.getElementById(
"leaveToday"
)
.textContent =
leave;

const table =
document.getElementById(
"todayAttendanceTable"
);

if (
employees.length ===
0
) {

table.innerHTML = `

  <tr>

    <td
      colspan="5"
      class="empty">

      No employees added.

    </td>

  </tr>

`;

return;

}

table.innerHTML =
employees.map(
function (employee) {

    const record =
      getRecord(
        employee.id,
        today
      );


    const status =
      record
        ? record.status
        : "Absent";


    return `

      <tr>

        <td>
          ${safe(employee.id)}
        </td>

        <td>
          ${safe(employee.name)}
        </td>

        <td>
          ${
            record?.checkIn ||
            "-"
          }
        </td>

        <td>
          ${
            record?.checkOut ||
            "-"
          }
        </td>

        <td>

          <span class="status ${
            getStatusClass(
              status
            )
          }">

            ${status}

          </span>

        </td>

      </tr>

    `;

  }
).join("");

}

/* =========================================
REPORT
========================================= */

function generateReport() {

const month =
document
.getElementById(
"reportMonth"
)
.value;

const table =
document.getElementById(
"reportTable"
);

if (
!month
) {

return;

}

table.innerHTML =
employees.map(
function (employee) {

    const records =
      attendance.filter(
        function (record) {

          return (

            record.employeeId ===
            employee.id

            &&

            record.date.startsWith(
              month
            )

          );

        }
      );


    const present =
      records.filter(
        r =>
          r.status ===
          "Present"
      ).length;


    const absent =
      records.filter(
        r =>
          r.status ===
          "Absent"
      ).length;


    const late =
      records.filter(
        r =>
          r.status ===
          "Late"
      ).length;


    const leave =
      records.filter(
        r =>
          r.status ===
          "Leave"
      ).length;


    return `

      <tr>

        <td>
          ${safe(employee.id)}
        </td>

        <td>
          ${safe(employee.name)}
        </td>

        <td>
          ${present}
        </td>

        <td>
          ${absent}
        </td>

        <td>
          ${late}
        </td>

        <td>
          ${leave}
        </td>

        <td>
          ${records.length}
        </td>

      </tr>

    `;

  }
).join("");

}

/* =========================================
CSV
========================================= */

function exportCSV() {

const month =
document
.getElementById(
"reportMonth"
)
.value;

if (
!month
) {

alert(
  "Select a month first."
);

return;

}

let csv =
"Employee ID,Name,Date,Check In,Check Out,Status\n";

attendance
.filter(
function (record) {

    return record.date.startsWith(
      month
    );

  }
)
.forEach(
  function (record) {

    const employee =
      employees.find(
        function (item) {

          return (
            item.id ===
            record.employeeId
          );

        }
      );


    if (!employee) {

      return;

    }


    csv += [

      employee.id,

      employee.name,

      record.date,

      record.checkIn,

      record.checkOut,

      record.status

    ]
      .map(
        value =>
          `"${String(value)
            .replace(
              /"/g,
              '""'
            )}"`
      )
      .join(",") +

      "\n";

  }
);

const blob =
new Blob(
[csv],
{
type:
"text/csv;charset=utf-8;"
}
);

const url =
URL.createObjectURL(
blob
);

const link =
document.createElement(
"a"
);

link.href =
url;

link.download =
"attendance-" +
month +
".csv";

document.body.appendChild(
link
);

link.click();

document.body.removeChild(
link
);

URL.revokeObjectURL(
url
);

}

/* =========================================
RENDER EVERYTHING
========================================= */

function renderEverything() {

renderEmployees();

renderCalendar();

updateDashboard();

}

/* =========================================
SAFE TEXT
========================================= */

function safe(value) {

const div =
document.createElement(
"div"
);

div.textContent =
value;

return div.innerHTML;

}
"use strict";

/* ================================
DATABASE
================================ */

const EMPLOYEE_KEY = "EA_EMPLOYEES";
const ATTENDANCE_KEY = "EA_ATTENDANCE";

let employees =
JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];

let attendance =
JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];

/* ================================
START APP
================================ */

document.addEventListener("DOMContentLoaded", function () {

const today = getToday();

document.getElementById("currentDate").textContent =
new Date().toLocaleDateString("en-IN", {
weekday: "long",
year: "numeric",
month: "long",
day: "numeric"
});

document.getElementById("attendanceDate").value =
today;

document.getElementById("reportMonth").value =
today.substring(0, 7);

setupNavigation();

setupButtons();

renderAll();

});

/* ================================
NAVIGATION
================================ */

function setupNavigation() {

const buttons =
document.querySelectorAll(".nav-btn");

buttons.forEach(function (button) {

button.addEventListener("click", function () {

  showPage(button.dataset.page);

});

});

}

function showPage(pageName) {

document.querySelectorAll(".page")
.forEach(function (page) {

  page.classList.remove("active");

});

document.querySelectorAll(".nav-btn")
.forEach(function (button) {

  button.classList.remove("active");

});

const page =
document.getElementById(pageName);

if (page) {

page.classList.add("active");

}

const navButton =
document.querySelector(
"[data-page="${pageName}"]"
);

if (navButton) {

navButton.classList.add("active");

}

const titles = {

dashboard: "Dashboard",

employees: "Employees",

attendance: "Attendance",

reports: "Reports"

};

document.getElementById("pageTitle")
.textContent =
titles[pageName] || "Dashboard";

renderAll();

}

/* ================================
BUTTON EVENTS
================================ */

function setupButtons() {

/* ADD EMPLOYEE */

document
.getElementById("addEmployeeBtn")
.addEventListener("click", function () {

  openEmployeeModal();

});

/* CLOSE */

document
.getElementById("closeModalBtn")
.addEventListener("click", function () {

  closeEmployeeModal();

});

/* CANCEL */

document
.getElementById("cancelModalBtn")
.addEventListener("click", function () {

  closeEmployeeModal();

});

/* FORM */

document
.getElementById("employeeForm")
.addEventListener("submit", function (event) {

  event.preventDefault();

  addEmployee();

});

/* SEARCH */

document
.getElementById("employeeSearch")
.addEventListener("input", function () {

  renderEmployees();

});

/* DATE */

document
.getElementById("attendanceDate")
.addEventListener("change", function () {

  renderAttendance();

});

/* MARK ALL */

document
.getElementById("markAllBtn")
.addEventListener("click", function () {

  markAllPresent();

});

/* REPORT */

document
.getElementById("generateReportBtn")
.addEventListener("click", function () {

  generateReport();

});

/* EXPORT */

document
.getElementById("exportBtn")
.addEventListener("click", function () {

  exportCSV();

});

/* CLOSE MODAL OUTSIDE */

document
.getElementById("employeeModal")
.addEventListener("click", function (event) {

  if (event.target === this) {

    closeEmployeeModal();

  }

});

}

/* ================================
DATE
================================ */

function getToday() {

const date = new Date();

const year =
date.getFullYear();

const month =
String(date.getMonth() + 1)
.padStart(2, "0");

const day =
String(date.getDate())
.padStart(2, "0");

return "${year}-${month}-${day}";

}

/* ================================
SAVE DATABASE
================================ */

function saveData() {

localStorage.setItem(
EMPLOYEE_KEY,
JSON.stringify(employees)
);

localStorage.setItem(
ATTENDANCE_KEY,
JSON.stringify(attendance)
);

}

/* ================================
MODAL
================================ */

function openEmployeeModal() {

document
.getElementById("employeeModal")
.classList.add("show");

setTimeout(function () {

document
  .getElementById("employeeId")
  .focus();

}, 100);

}

function closeEmployeeModal() {

document
.getElementById("employeeModal")
.classList.remove("show");

document
.getElementById("employeeForm")
.reset();

}

/* ================================
ADD EMPLOYEE
================================ */

function addEmployee() {

const id =
document
.getElementById("employeeId")
.value
.trim();

const name =
document
.getElementById("employeeName")
.value
.trim();

const phone =
document
.getElementById("employeePhone")
.value
.trim();

const position =
document
.getElementById("employeePosition")
.value
.trim();

const joinDate =
document
.getElementById("joinDate")
.value;

const status =
document
.getElementById("employeeStatus")
.value;

if (!id || !name || !joinDate) {

alert(
  "Please fill Employee ID, Name and Join Date."
);

return;

}

const exists =
employees.some(function (employee) {

  return employee.id.toLowerCase() ===
    id.toLowerCase();

});

if (exists) {

alert("Employee ID already exists!");

return;

}

const employee = {

id: id,

name: name,

phone: phone,

position: position,

joinDate: joinDate,

status: status

};

employees.push(employee);

saveData();

closeEmployeeModal();

renderAll();

alert(
"Employee added successfully!"
);

}

/* ================================
EMPLOYEE TABLE
================================ */

function renderEmployees() {

const table =
document.getElementById(
"employeeTable"
);

const search =
document
.getElementById("employeeSearch")
.value
.toLowerCase()
.trim();

const filtered =
employees.filter(function (employee) {

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

});

if (filtered.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="7" class="empty">
      No Employees Found
    </td>
  </tr>
`;

return;

}

table.innerHTML =
filtered.map(function (employee) {

  return `

    <tr>

      <td>${escapeHTML(employee.id)}</td>

      <td>${escapeHTML(employee.name)}</td>

      <td>${escapeHTML(employee.phone || "-")}</td>

      <td>${escapeHTML(employee.position || "-")}</td>

      <td>${employee.joinDate}</td>

      <td>

        <span class="status ${
          employee.status === "Active"
            ? "status-present"
            : "status-absent"
        }">

          ${employee.status}

        </span>

      </td>

      <td>

        <button
          class="danger-btn"
          onclick="deleteEmployee('${employee.id}')">

          Delete

        </button>

      </td>

    </tr>

  `;

}).join("");

}

/* ================================
DELETE EMPLOYEE
================================ */

function deleteEmployee(id) {

const confirmDelete =
confirm(
"Are you sure you want to delete this employee?"
);

if (!confirmDelete) {

return;

}

employees =
employees.filter(function (employee) {

  return employee.id !== id;

});

attendance =
attendance.filter(function (record) {

  return record.employeeId !== id;

});

saveData();

renderAll();

}

/* ================================
GET ATTENDANCE
================================ */

function getRecord(employeeId, date) {

return attendance.find(function (record) {

return (

  record.employeeId === employeeId

  &&

  record.date === date

);

});

}

/* ================================
ATTENDANCE TABLE
================================ */

function renderAttendance() {

const table =
document.getElementById(
"attendanceTable"
);

const date =
document.getElementById(
"attendanceDate"
).value;

if (employees.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="6" class="empty">
      Please add employees first.
    </td>
  </tr>
`;

return;

}

table.innerHTML =
employees.map(function (employee) {

  const record =
    getRecord(
      employee.id,
      date
    );


  const status =
    record
      ? record.status
      : "Absent";


  return `

    <tr>

      <td>${escapeHTML(employee.id)}</td>

      <td>${escapeHTML(employee.name)}</td>

      <td>
        ${record?.checkIn || "-"}
      </td>

      <td>
        ${record?.checkOut || "-"}
      </td>

      <td>

        <span class="status ${
          getStatusClass(status)
        }">

          ${status}

        </span>

      </td>

      <td>

        <button
          class="primary-btn"
          onclick="checkIn('${employee.id}')">

          Check In

        </button>


        <button
          class="secondary-btn"
          onclick="checkOut('${employee.id}')">

          Check Out

        </button>


        <button
          class="danger-btn"
          onclick="markAbsent('${employee.id}')">

          Absent

        </button>

      </td>

    </tr>

  `;

}).join("");

}

/* ================================
CHECK IN
================================ */

function checkIn(employeeId) {

const date =
document
.getElementById("attendanceDate")
.value;

let record =
getRecord(
employeeId,
date
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

record = {

  employeeId: employeeId,

  date: date,

  checkIn: time,

  checkOut: "",

  status: "Present"

};


attendance.push(record);

}

else {

record.checkIn = time;

record.status = "Present";

}

saveData();

renderAll();

}

/* ================================
CHECK OUT
================================ */

function checkOut(employeeId) {

const date =
document
.getElementById("attendanceDate")
.value;

const record =
getRecord(
employeeId,
date
);

if (!record) {

alert(
  "Please Check In first!"
);

return;

}

const time =
new Date().toLocaleTimeString(
"en-IN",
{
hour: "2-digit",
minute: "2-digit"
}
);

record.checkOut = time;

saveData();

renderAll();

}

/* ================================
ABSENT
================================ */

function markAbsent(employeeId) {

const date =
document
.getElementById("attendanceDate")
.value;

let record =
getRecord(
employeeId,
date
);

if (!record) {

attendance.push({

  employeeId: employeeId,

  date: date,

  checkIn: "",

  checkOut: "",

  status: "Absent"

});

}

else {

record.status = "Absent";

record.checkIn = "";

record.checkOut = "";

}

saveData();

renderAll();

}

/* ================================
MARK ALL PRESENT
================================ */

function markAllPresent() {

const date =
document
.getElementById("attendanceDate")
.value;

employees.forEach(function (employee) {

let record =
  getRecord(
    employee.id,
    date
  );


if (!record) {

  attendance.push({

    employeeId: employee.id,

    date: date,

    checkIn: "",

    checkOut: "",

    status: "Present"

  });

}

else {

  record.status = "Present";

}

});

saveData();

renderAll();

}

/* ================================
STATUS
================================ */

function getStatusClass(status) {

if (status === "Present") {

return "status-present";

}

if (status === "Late") {

return "status-late";

}

if (status === "Leave") {

return "status-leave";

}

return "status-absent";

}

/* ================================
DASHBOARD
================================ */

function updateDashboard() {

const today =
getToday();

const todayRecords =
attendance.filter(function (record) {

  return record.date === today;

});

const present =
todayRecords.filter(function (record) {

  return record.status === "Present";

}).length;

const late =
todayRecords.filter(function (record) {

  return record.status === "Late";

}).length;

const absent =
employees.length -
present -
late;

document
.getElementById("totalEmployees")
.textContent =
employees.length;

document
.getElementById("presentToday")
.textContent =
present;

document
.getElementById("lateToday")
.textContent =
late;

document
.getElementById("absentToday")
.textContent =
Math.max(absent, 0);

const table =
document.getElementById(
"dashboardAttendance"
);

if (employees.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="5" class="empty">
      No employees added.
    </td>
  </tr>
`;

return;

}

table.innerHTML =
employees.map(function (employee) {

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

      <td>${escapeHTML(employee.id)}</td>

      <td>${escapeHTML(employee.name)}</td>

      <td>${record?.checkIn || "-"}</td>

      <td>${record?.checkOut || "-"}</td>

      <td>

        <span class="status ${
          getStatusClass(status)
        }">

          ${status}

        </span>

      </td>

    </tr>

  `;

}).join("");

}

/* ================================
REPORT
================================ */

function generateReport() {

const month =
document
.getElementById("reportMonth")
.value;

const table =
document
.getElementById("reportTable");

if (!month) {

alert(
  "Please select a month."
);

return;

}

if (employees.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="7" class="empty">
      No employees found.
    </td>
  </tr>
`;

return;

}

table.innerHTML =
employees.map(function (employee) {

  const records =
    attendance.filter(function (record) {

      return (

        record.employeeId === employee.id

        &&

        record.date.startsWith(month)

      );

    });


  const present =
    records.filter(r =>
      r.status === "Present"
    ).length;


  const absent =
    records.filter(r =>
      r.status === "Absent"
    ).length;


  const late =
    records.filter(r =>
      r.status === "Late"
    ).length;


  const leave =
    records.filter(r =>
      r.status === "Leave"
    ).length;


  return `

    <tr>

      <td>${escapeHTML(employee.id)}</td>

      <td>${escapeHTML(employee.name)}</td>

      <td>${present}</td>

      <td>${absent}</td>

      <td>${late}</td>

      <td>${leave}</td>

      <td>${records.length}</td>

    </tr>

  `;

}).join("");

}

/* ================================
CSV EXPORT
================================ */

function exportCSV() {

const month =
document
.getElementById("reportMonth")
.value;

if (!month) {

alert(
  "Please select a month."
);

return;

}

let csv =
"Employee ID,Name,Date,Check In,Check Out,Status\n";

attendance
.filter(function (record) {

  return record.date.startsWith(month);

})
.forEach(function (record) {

  const employee =
    employees.find(function (emp) {

      return emp.id ===
        record.employeeId;

    });


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

  ].map(function (value) {

    return `"${String(value).replace(/"/g, '""')}"`;

  }).join(",") + "\n";

});

const blob =
new Blob(
[csv],
{
type: "text/csv;charset=utf-8;"
}
);

const url =
URL.createObjectURL(blob);

const link =
document.createElement("a");

link.href = url;

link.download =
"attendance-${month}.csv";

document.body.appendChild(link);

link.click();

document.body.removeChild(link);

URL.revokeObjectURL(url);

}

/* ================================
ESCAPE HTML
================================ */

function escapeHTML(value) {

const div =
document.createElement("div");

div.textContent =
value;

return div.innerHTML;

}

/* ================================
RENDER ALL
================================ */

function renderAll() {

renderEmployees();

renderAttendance();

updateDashboard();

}
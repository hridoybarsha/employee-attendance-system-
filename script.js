const EMPLOYEE_KEY = "EMPLOYEE_ATTENDANCE_EMPLOYEES";
const ATTENDANCE_KEY = "EMPLOYEE_ATTENDANCE_RECORDS";

let employees = JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
let attendance = JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || [];

// ===============================
// INITIAL LOAD
// ===============================

document.addEventListener("DOMContentLoaded", () => {

document.getElementById("currentDate").textContent =
new Date().toLocaleDateString("en-IN", {
weekday: "long",
year: "numeric",
month: "long",
day: "numeric"
});

const today = getToday();

document.getElementById("attendanceDate").value = today;

document.getElementById("reportMonth").value = today.substring(0, 7);

setupNavigation();

renderAll();

});

// ===============================
// NAVIGATION
// ===============================

function setupNavigation() {

document.querySelectorAll(".nav-btn").forEach(button => {

button.addEventListener("click", () => {

  const page = button.dataset.page;

  showPage(page);

});

});

}

function showPage(pageName) {

document.querySelectorAll(".page").forEach(page => {
page.classList.remove("active");
});

document.querySelectorAll(".nav-btn").forEach(button => {
button.classList.remove("active");
});

const page = document.getElementById(pageName);

if (page) {
page.classList.add("active");
}

const navButton =
document.querySelector("[data-page="${pageName}"]");

if (navButton) {
navButton.classList.add("active");
}

const titles = {
dashboard: "Dashboard",
employees: "Employees",
attendance: "Attendance",
reports: "Reports"
};

document.getElementById("pageTitle").textContent =
titles[pageName] || "Dashboard";

renderAll();

}

// ===============================
// DATE
// ===============================

function getToday() {

const date = new Date();

const year = date.getFullYear();

const month =
String(date.getMonth() + 1).padStart(2, "0");

const day =
String(date.getDate()).padStart(2, "0");

return "${year}-${month}-${day}";

}

// ===============================
// LOCAL STORAGE
// ===============================

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

// ===============================
// EMPLOYEE MODAL
// ===============================

function openEmployeeModal() {

document.getElementById("employeeModal")
.classList.add("show");

}

function closeEmployeeModal() {

document.getElementById("employeeModal")
.classList.remove("show");

document.getElementById("employeeForm").reset();

}

// ===============================
// ADD EMPLOYEE
// ===============================

document.getElementById("employeeForm")
.addEventListener("submit", function(e) {

e.preventDefault();

const employeeId =
  document.getElementById("employeeId").value.trim();

const name =
  document.getElementById("employeeName").value.trim();

const phone =
  document.getElementById("employeePhone").value.trim();

const position =
  document.getElementById("employeePosition").value.trim();

const joinDate =
  document.getElementById("joinDate").value;

const status =
  document.getElementById("employeeStatus").value;


if (employees.some(emp => emp.id === employeeId)) {

  alert("Employee ID already exists!");

  return;

}


employees.push({

  id: employeeId,

  name: name,

  phone: phone,

  position: position,

  joinDate: joinDate,

  status: status

});


saveData();

closeEmployeeModal();

renderAll();

alert("Employee added successfully!");

});

// ===============================
// RENDER EMPLOYEES
// ===============================

function renderEmployees() {

const table =
document.getElementById("employeeTable");

const search =
document.getElementById("employeeSearch")
.value
.toLowerCase();

const filtered =
employees.filter(emp =>

  emp.name.toLowerCase().includes(search) ||

  emp.id.toLowerCase().includes(search) ||

  emp.phone.toLowerCase().includes(search)

);

if (filtered.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="7" style="text-align:center">
      No employees found
    </td>
  </tr>
`;

return;

}

table.innerHTML = filtered.map(emp => `

<tr>

  <td>${emp.id}</td>

  <td>${emp.name}</td>

  <td>${emp.phone || "-"}</td>

  <td>${emp.position || "-"}</td>

  <td>${emp.joinDate}</td>

  <td>
    <span class="status ${emp.status === "Active"
      ? "status-present"
      : "status-absent"}">
      ${emp.status}
    </span>
  </td>

  <td>
    <button
      class="danger-btn"
      onclick="deleteEmployee('${emp.id}')">
      Delete
    </button>
  </td>

</tr>

`).join("");

}

// ===============================
// DELETE EMPLOYEE
// ===============================

function deleteEmployee(id) {

if (!confirm("Delete this employee?")) {
return;
}

employees =
employees.filter(emp => emp.id !== id);

attendance =
attendance.filter(record => record.employeeId !== id);

saveData();

renderAll();

}

// ===============================
// ATTENDANCE RECORD
// ===============================

function getAttendance(employeeId, date) {

return attendance.find(record =>

record.employeeId === employeeId &&

record.date === date

);

}

// ===============================
// RENDER ATTENDANCE
// ===============================

function renderAttendance() {

const table =
document.getElementById("attendanceTable");

const date =
document.getElementById("attendanceDate").value;

if (employees.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="6" style="text-align:center">
      Add employees first
    </td>
  </tr>
`;

return;

}

table.innerHTML = employees.map(emp => {

const record =
  getAttendance(emp.id, date);


const status =
  record ? record.status : "Absent";


return `

  <tr>

    <td>${emp.id}</td>

    <td>${emp.name}</td>

    <td>${record?.checkIn || "-"}</td>

    <td>${record?.checkOut || "-"}</td>

    <td>
      <span class="status ${getStatusClass(status)}">
        ${status}
      </span>
    </td>

    <td>

      <button
        class="primary-btn"
        onclick="checkIn('${emp.id}')">
        Check In
      </button>

      <button
        class="secondary-btn"
        onclick="checkOut('${emp.id}')">
        Check Out
      </button>

      <button
        class="danger-btn"
        onclick="markAbsent('${emp.id}')">
        Absent
      </button>

    </td>

  </tr>

`;

}).join("");

}

// ===============================
// CHECK IN
// ===============================

function checkIn(employeeId) {

const date =
document.getElementById("attendanceDate").value;

let record =
getAttendance(employeeId, date);

const now =
new Date().toLocaleTimeString("en-IN", {
hour: "2-digit",
minute: "2-digit"
});

if (!record) {

record = {

  employeeId: employeeId,

  date: date,

  checkIn: now,

  checkOut: "",

  status: "Present"

};

attendance.push(record);

} else {

record.checkIn = now;

record.status = "Present";

}

saveData();

renderAll();

}

// ===============================
// CHECK OUT
// ===============================

function checkOut(employeeId) {

const date =
document.getElementById("attendanceDate").value;

let record =
getAttendance(employeeId, date);

if (!record) {

alert("Please Check In first!");

return;

}

record.checkOut =
new Date().toLocaleTimeString("en-IN", {
hour: "2-digit",
minute: "2-digit"
});

saveData();

renderAll();

}

// ===============================
// MARK ABSENT
// ===============================

function markAbsent(employeeId) {

const date =
document.getElementById("attendanceDate").value;

let record =
getAttendance(employeeId, date);

if (!record) {

attendance.push({

  employeeId: employeeId,

  date: date,

  checkIn: "",

  checkOut: "",

  status: "Absent"

});

} else {

record.status = "Absent";

record.checkIn = "";

record.checkOut = "";

}

saveData();

renderAll();

}

// ===============================
// MARK ALL PRESENT
// ===============================

function markAllPresent() {

const date =
document.getElementById("attendanceDate").value;

employees.forEach(emp => {

let record =
  getAttendance(emp.id, date);


if (!record) {

  attendance.push({

    employeeId: emp.id,

    date: date,

    checkIn: "",

    checkOut: "",

    status: "Present"

  });

} else {

  record.status = "Present";

}

});

saveData();

renderAll();

}

// ===============================
// STATUS CLASS
// ===============================

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

// ===============================
// DASHBOARD
// ===============================

function updateDashboard() {

const today = getToday();

const todayRecords =
attendance.filter(record =>
record.date === today
);

const present =
todayRecords.filter(record =>
record.status === "Present"
).length;

const late =
todayRecords.filter(record =>
record.status === "Late"
).length;

const absent =
employees.length - present - late;

document.getElementById("totalEmployees")
.textContent = employees.length;

document.getElementById("presentToday")
.textContent = present;

document.getElementById("lateToday")
.textContent = late;

document.getElementById("absentToday")
.textContent = Math.max(absent, 0);

const table =
document.getElementById("dashboardAttendance");

if (employees.length === 0) {

table.innerHTML = `
  <tr>
    <td colspan="5" style="text-align:center">
      No employees added
    </td>
  </tr>
`;

return;

}

table.innerHTML = employees.map(emp => {

const record =
  getAttendance(emp.id, today);


const status =
  record ? record.status : "Absent";


return `

  <tr>

    <td>${emp.id}</td>

    <td>${emp.name}</td>

    <td>${record?.checkIn || "-"}</td>

    <td>${record?.checkOut || "-"}</td>

    <td>
      <span class="status ${getStatusClass(status)}">
        ${status}
      </span>
    </td>

  </tr>

`;

}).join("");

}

// ===============================
// REPORT
// ===============================

function generateReport() {

const month =
document.getElementById("reportMonth").value;

const table =
document.getElementById("reportTable");

if (!month) {

alert("Please select a month");

return;

}

table.innerHTML =
employees.map(emp => {

  const records =
    attendance.filter(record =>

      record.employeeId === emp.id &&

      record.date.startsWith(month)

    );


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

      <td>${emp.id}</td>

      <td>${emp.name}</td>

      <td>${present}</td>

      <td>${absent}</td>

      <td>${late}</td>

      <td>${leave}</td>

      <td>${records.length}</td>

    </tr>

  `;

}).join("");

}

// ===============================
// CSV EXPORT
// ===============================

function exportCSV() {

const month =
document.getElementById("reportMonth").value;

if (!month) {

alert("Please select a month first");

return;

}

let csv =
"Employee ID,Name,Date,Check In,Check Out,Status\n";

attendance
.filter(record =>
record.date.startsWith(month)
)
.forEach(record => {

  const employee =
    employees.find(emp =>
      emp.id === record.employeeId
    );


  if (!employee) return;


  csv += [

    employee.id,

    employee.name,

    record.date,

    record.checkIn,

    record.checkOut,

    record.status

  ].join(",") + "\n";

});

const blob =
new Blob([csv], {
type: "text/csv;charset=utf-8;"
});

const url =
URL.createObjectURL(blob);

const link =
document.createElement("a");

link.href = url;

link.download =
"attendance-${month}.csv";

link.click();

URL.revokeObjectURL(url);

}

// ===============================
// RENDER ALL
// ===============================

function renderAll() {

renderEmployees();

renderAttendance();

updateDashboard();

}
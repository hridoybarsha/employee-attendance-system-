/* =========================================================
EMPLOYEE ATTENDANCE & PAYROLL MANAGEMENT SYSTEM
Complete Working JavaScript
========================================================= */

const STORAGE = {
employees: "EMP_PRO_EMPLOYEES",
attendance: "EMP_PRO_ATTENDANCE",
leaves: "EMP_PRO_LEAVES",
payroll: "EMP_PRO_PAYROLL",
settings: "EMP_PRO_SETTINGS"
};

let employees = JSON.parse(localStorage.getItem(STORAGE.employees)) || [];
let attendance = JSON.parse(localStorage.getItem(STORAGE.attendance)) || {};
let leaves = JSON.parse(localStorage.getItem(STORAGE.leaves)) || [];
let payroll = JSON.parse(localStorage.getItem(STORAGE.payroll)) || {};

let settings = JSON.parse(localStorage.getItem(STORAGE.settings)) || {
officeStartTime: "09:00",
officeEndTime: "18:00",
gracePeriod: 15,
weeklyOff: 0,
overtimeRate: 100
};

let currentCalendarDate = new Date();
let selectedAttendanceDate = getToday();

// =========================================================
// BASIC HELPERS
// =========================================================

function saveData() {

localStorage.setItem(
    STORAGE.employees,
    JSON.stringify(employees)
);

localStorage.setItem(
    STORAGE.attendance,
    JSON.stringify(attendance)
);

localStorage.setItem(
    STORAGE.leaves,
    JSON.stringify(leaves)
);

localStorage.setItem(
    STORAGE.payroll,
    JSON.stringify(payroll)
);

localStorage.setItem(
    STORAGE.settings,
    JSON.stringify(settings)
);

}

function getToday() {

const d = new Date();

return formatDate(d);

}

function formatDate(date) {

const year = date.getFullYear();

const month = String(
    date.getMonth() + 1
).padStart(2, "0");

const day = String(
    date.getDate()
).padStart(2, "0");

return `${year}-${month}-${day}`;

}

function formatMoney(amount) {

return "₹" + Number(
    amount || 0
).toLocaleString("en-IN", {
    maximumFractionDigits: 2
});

}

function escapeHTML(value) {

return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function getStatusClass(status) {

const map = {
    "Full Day": "status-full",
    "Half Day": "status-half",
    "Absent": "status-absent",
    "Paid Leave": "status-paid",
    "Unpaid Leave": "status-unpaid",
    "Holiday": "status-holiday",
    "Weekly Off": "status-weekoff"
};

return map[status] || "status-unpaid";

}

function getCalendarClass(status) {

const map = {
    "Full Day": "calendar-full",
    "Half Day": "calendar-half",
    "Absent": "calendar-absent",
    "Paid Leave": "calendar-paid",
    "Unpaid Leave": "calendar-unpaid",
    "Holiday": "calendar-holiday",
    "Weekly Off": "calendar-weekoff"
};

return map[status] || "";

}

function getMonthKey(date) {

return date.substring(0, 7);

}

function daysInMonth(year, month) {

return new Date(
    year,
    month + 1,
    0
).getDate();

}

function calculateDays(from, to) {

const start = new Date(from);
const end = new Date(to);

const diff =
    Math.abs(end - start);

return Math.floor(
    diff / (1000 * 60 * 60 * 24)
) + 1;

}

// =========================================================
// NAVIGATION
// =========================================================

document.querySelectorAll(".nav-item")
.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const page =
                button.dataset.page;

            document
                .querySelectorAll(".nav-item")
                .forEach(item =>
                    item.classList.remove("active")
                );

            button.classList.add("active");

            document
                .querySelectorAll(".page")
                .forEach(section =>
                    section.classList.remove("active")
                );

            const target =
                document.getElementById(
                    page + "Page"
                );

            if (target) {

                target.classList.add("active");

            }

            const title =
                button.textContent
                    .replace(/[^\p{L}\p{N}\s]/gu, "")
                    .trim();

            document.getElementById(
                "pageTitle"
            ).textContent = title;

            refreshPage(page);

        });

});

function refreshPage(page) {

if (page === "dashboard") {

    updateDashboard();

}

if (page === "employees") {

    renderEmployees();

}

if (page === "attendance") {

    renderCalendar();

    renderAttendanceDetails(
        selectedAttendanceDate
    );

}

if (page === "leave") {

    renderLeaves();

}

if (page === "payroll") {

    populatePayrollMonth();

    calculatePayroll();

}

if (page === "salarySlip") {

    populateSalaryEmployees();

}

if (page === "reports") {

    generateReport();

}

}

// =========================================================
// EMPLOYEE MANAGEMENT
// =========================================================

const employeeModal =
document.getElementById(
"employeeModal"
);

const employeeForm =
document.getElementById(
"employeeForm"
);

document.getElementById(
"addEmployeeBtn"
).addEventListener(
"click",
() => {

    employeeForm.reset();

    document.getElementById(
        "editEmployeeId"
    ).value = "";

    document.getElementById(
        "employeeModalTitle"
    ).textContent = "Add Employee";

    employeeModal.classList.add(
        "show"
    );

}

);

function closeEmployeeModal() {

employeeModal.classList.remove(
    "show"
);

}

document.getElementById(
"closeEmployeeModal"
).addEventListener(
"click",
closeEmployeeModal
);

document.getElementById(
"cancelEmployeeBtn"
).addEventListener(
"click",
closeEmployeeModal
);

employeeForm.addEventListener(
"submit",
function(e) {

    e.preventDefault();

    const editId =
        document.getElementById(
            "editEmployeeId"
        ).value;

    const employee = {

        id:
            document.getElementById(
                "employeeId"
            ).value.trim(),

        name:
            document.getElementById(
                "employeeName"
            ).value.trim(),

        phone:
            document.getElementById(
                "employeePhone"
            ).value.trim(),

        department:
            document.getElementById(
                "employeeDepartment"
            ).value.trim(),

        designation:
            document.getElementById(
                "employeeDesignation"
            ).value.trim(),

        salary:
            Number(
                document.getElementById(
                    "employeeSalary"
                ).value
            ) || 0,

        joinDate:
            document.getElementById(
                "employeeJoinDate"
            ).value,

        status:
            document.getElementById(
                "employeeStatus"
            ).value

    };


    if (!employee.id) {

        alert(
            "Employee ID is required"
        );

        return;

    }


    if (!employee.name) {

        alert(
            "Employee name is required"
        );

        return;

    }


    const duplicate =
        employees.find(
            emp =>
                emp.id === employee.id &&
                emp.id !== editId
        );


    if (duplicate) {

        alert(
            "This Employee ID already exists"
        );

        return;

    }


    if (editId) {

        const index =
            employees.findIndex(
                emp =>
                    emp.id === editId
            );

        if (index !== -1) {

            employees[index] =
                employee;

        }

    } else {

        employees.push(
            employee
        );

    }


    saveData();

    closeEmployeeModal();

    renderEmployees();

    updateDashboard();

    populateEmployeeSelects();

    alert(
        editId
            ? "Employee updated successfully"
            : "Employee added successfully"
    );

}

);

function renderEmployees() {

const tbody =
    document.getElementById(
        "employeeTable"
    );

const search =
    (
        document.getElementById(
            "employeeSearch"
        )?.value || ""
    ).toLowerCase();

const department =
    document.getElementById(
        "employeeDepartmentFilter"
    )?.value || "";


const filtered =
    employees.filter(
        emp => {

            const matchesSearch =
                emp.name.toLowerCase()
                    .includes(search) ||
                emp.id.toLowerCase()
                    .includes(search) ||
                emp.phone.toLowerCase()
                    .includes(search);

            const matchesDepartment =
                !department ||
                emp.department === department;

            return (
                matchesSearch &&
                matchesDepartment
            );

        }
    );


if (!filtered.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="9"
                style="text-align:center">
                No employees found
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    filtered.map(
        emp => `

        <tr>

            <td>${escapeHTML(emp.id)}</td>

            <td>
                <strong>
                    ${escapeHTML(emp.name)}
                </strong>
            </td>

            <td>
                ${escapeHTML(emp.phone)}
            </td>

            <td>
                ${escapeHTML(emp.department)}
            </td>

            <td>
                ${escapeHTML(emp.designation)}
            </td>

            <td>
                ${formatMoney(emp.salary)}
            </td>

            <td>
                ${escapeHTML(emp.joinDate)}
            </td>

            <td>
                <span class="status-badge
                    ${emp.status === "Active"
                        ? "status-full"
                        : "status-absent"}">
                    ${escapeHTML(emp.status)}
                </span>
            </td>

            <td>

                <button
                    class="secondary-btn"
                    onclick="editEmployee('${emp.id}')">
                    ✏️
                </button>

                <button
                    class="danger-btn"
                    onclick="deleteEmployee('${emp.id}')">
                    🗑️
                </button>

            </td>

        </tr>

    `
    ).join("");

}

window.editEmployee =
function(id) {

    const emp =
        employees.find(
            e => e.id === id
        );

    if (!emp) return;


    document.getElementById(
        "editEmployeeId"
    ).value = emp.id;

    document.getElementById(
        "employeeId"
    ).value = emp.id;

    document.getElementById(
        "employeeName"
    ).value = emp.name;

    document.getElementById(
        "employeePhone"
    ).value = emp.phone;

    document.getElementById(
        "employeeDepartment"
    ).value = emp.department;

    document.getElementById(
        "employeeDesignation"
    ).value = emp.designation;

    document.getElementById(
        "employeeSalary"
    ).value = emp.salary;

    document.getElementById(
        "employeeJoinDate"
    ).value = emp.joinDate;

    document.getElementById(
        "employeeStatus"
    ).value = emp.status;


    document.getElementById(
        "employeeModalTitle"
    ).textContent =
        "Edit Employee";


    employeeModal.classList.add(
        "show"
    );

};

window.deleteEmployee =
function(id) {

    const emp =
        employees.find(
            e => e.id === id
        );

    if (!emp) return;


    if (
        !confirm(
            `Delete ${emp.name}?`
        )
    ) return;


    employees =
        employees.filter(
            e => e.id !== id
        );


    Object.keys(
        attendance
    ).forEach(date => {

        delete attendance[date][id];

    });


    leaves =
        leaves.filter(
            leave =>
                leave.employeeId !== id
        );


    saveData();

    renderEmployees();

    updateDashboard();

    populateEmployeeSelects();

    alert(
        "Employee deleted successfully"
    );

};

document.getElementById(
"employeeSearch"
).addEventListener(
"input",
renderEmployees
);

document.getElementById(
"employeeDepartmentFilter"
).addEventListener(
"change",
renderEmployees
);

// =========================================================
// EMPLOYEE SELECTS
// =========================================================

function populateEmployeeSelects() {

const departmentSelect =
    document.getElementById(
        "employeeDepartmentFilter"
    );

const departments =
    [
        ...new Set(
            employees
                .map(
                    e => e.department
                )
                .filter(Boolean)
        )
    ]
    .sort();


departmentSelect.innerHTML =
    `<option value="">
        All Departments
    </option>`;


departments.forEach(
    dept => {

        departmentSelect.innerHTML += `
            <option value="${escapeHTML(dept)}">
                ${escapeHTML(dept)}
            </option>
        `;

    }
);


const leaveSelect =
    document.getElementById(
        "leaveEmployee"
    );


leaveSelect.innerHTML =
    `<option value="">
        Select Employee
    </option>`;


employees
    .filter(
        e => e.status === "Active"
    )
    .forEach(
        emp => {

            leaveSelect.innerHTML += `
                <option value="${escapeHTML(emp.id)}">
                    ${escapeHTML(emp.name)}
                    (${escapeHTML(emp.id)})
                </option>
            `;

        }
    );


populateSalaryEmployees();

}

function populateSalaryEmployees() {

const select =
    document.getElementById(
        "salaryEmployeeSelect"
    );

if (!select) return;


const current =
    select.value;


select.innerHTML =
    `<option value="">
        Select Employee
    </option>`;


employees.forEach(
    emp => {

        select.innerHTML += `
            <option value="${escapeHTML(emp.id)}">
                ${escapeHTML(emp.name)}
                (${escapeHTML(emp.id)})
            </option>
        `;

    }
);


select.value = current;

}

// =========================================================
// ATTENDANCE CALENDAR
// =========================================================

function renderCalendar() {

const calendar =
    document.getElementById(
        "attendanceCalendar"
    );

const year =
    currentCalendarDate.getFullYear();

const month =
    currentCalendarDate.getMonth();


const monthName =
    currentCalendarDate.toLocaleString(
        "en-US",
        {
            month: "long",
            year: "numeric"
        }
    );


document.getElementById(
    "calendarTitle"
).textContent =
    monthName;


calendar.innerHTML = "";


const firstDay =
    new Date(
        year,
        month,
        1
    ).getDay();


const totalDays =
    daysInMonth(
        year,
        month
    );


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


for (
    let day = 1;
    day <= totalDays;
    day++
) {

    const date =
        new Date(
            year,
            month,
            day
        );


    const dateString =
        formatDate(date);


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
            "today"
        );

    }


    if (
        dateString ===
        selectedAttendanceDate
    ) {

        cell.classList.add(
            "selected"
        );

    }


    const records =
        attendance[
            dateString
        ] || {};


    const employeeRecords =
        Object.values(
            records
        );


    let statusText = "";


    if (
        employeeRecords.length
    ) {

        const counts = {};

        employeeRecords.forEach(
            record => {

                counts[
                    record.status
                ] =
                    (
                        counts[
                            record.status
                        ] || 0
                    ) + 1;

            }
        );


        statusText =
            Object.entries(
                counts
            )
            .map(
                ([status, count]) =>
                    `${status}: ${count}`
            )
            .join(" • ");

    }


    cell.innerHTML = `

        <div class="day-number">
            ${day}
        </div>

        <div class="day-status">
            ${escapeHTML(statusText)}
        </div>

    `;


    if (
        employeeRecords.length ===
        employees.length &&
        employees.length > 0
    ) {

        const firstStatus =
            employeeRecords[0].status;

        if (
            employeeRecords.every(
                r =>
                    r.status ===
                    firstStatus
            )
        ) {

            cell.classList.add(
                getCalendarClass(
                    firstStatus
                )
            );

        }

    }


    cell.addEventListener(
        "click",
        () => {

            selectedAttendanceDate =
                dateString;

            renderCalendar();

            renderAttendanceDetails(
                dateString
            );

        }
    );


    calendar.appendChild(
        cell
    );

}

}

document.getElementById(
"previousMonth"
).addEventListener(
"click",
() => {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() - 1
    );

    renderCalendar();

}

);

document.getElementById(
"nextMonth"
).addEventListener(
"click",
() => {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() + 1
    );

    renderCalendar();

}

);

// =========================================================
// ATTENDANCE DETAILS
// =========================================================

function renderAttendanceDetails(
dateString
) {

const details =
    document.getElementById(
        "attendanceDetails"
    );

const tbody =
    document.getElementById(
        "attendanceTable"
    );


details.classList.remove(
    "hidden"
);


document.getElementById(
    "selectedDateTitle"
).textContent =
    `Attendance - ${dateString}`;


if (!employees.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="9"
                style="text-align:center">
                Add employees first
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    employees.map(
        emp => {

            const record =
                attendance[
                    dateString
                ]?.[
                    emp.id
                ] || {

                    status:
                        isWeeklyOff(
                            dateString
                        )
                        ? "Weekly Off"
                        : "Absent",

                    checkIn: "",
                    checkOut: ""

                };


            const hours =
                calculateWorkingHours(
                    record.checkIn,
                    record.checkOut
                );


            const late =
                calculateLateMinutes(
                    record.checkIn
                );


            const overtime =
                calculateOvertime(
                    record.checkOut
                );


            return `

            <tr>

                <td>
                    ${escapeHTML(emp.id)}
                </td>

                <td>
                    ${escapeHTML(emp.name)}
                </td>

                <td>
                    ${escapeHTML(
                        record.checkIn || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.checkOut || "-"
                    )}
                </td>

                <td>
                    ${hours.toFixed(2)} Hrs
                </td>

                <td>

                    <span class="status-badge
                        ${getStatusClass(
                            record.status
                        )}">

                        ${escapeHTML(
                            record.status
                        )}

                    </span>

                </td>

                <td>
                    ${late > 0
                        ? late + " min"
                        : "-"}
                </td>

                <td>
                    ${overtime > 0
                        ? overtime.toFixed(2) + " Hrs"
                        : "-"}
                </td>

                <td>

                    <button
                        class="primary-btn"
                        onclick="openAttendanceModal(
                            '${emp.id}',
                            '${dateString}'
                        )">
                        ✏️ Update
                    </button>

                </td>

            </tr>

        `;

        }
    ).join("");

}

function isWeeklyOff(
dateString
) {

const date =
    new Date(
        dateString + "T00:00:00"
    );

return (
    date.getDay() ===
    Number(
        settings.weeklyOff
    )
);

}

function calculateWorkingHours(
checkIn,
checkOut
) {

if (
    !checkIn ||
    !checkOut
) return 0;


const [h1, m1] =
    checkIn
        .split(":")
        .map(Number);

const [h2, m2] =
    checkOut
        .split(":")
        .map(Number);


let start =
    h1 * 60 + m1;

let end =
    h2 * 60 + m2;


if (end < start) {

    end += 24 * 60;

}


return (
    end - start
) / 60;

}

function calculateLateMinutes(
checkIn
) {

if (!checkIn) return 0;


const [h, m] =
    checkIn
        .split(":")
        .map(Number);


const [oh, om] =
    settings.officeStartTime
        .split(":")
        .map(Number);


const actual =
    h * 60 + m;

const office =
    oh * 60 + om;


const late =
    actual -
    office -
    Number(
        settings.gracePeriod
    );


return Math.max(
    0,
    late
);

}

function calculateOvertime(
checkOut
) {

if (!checkOut) return 0;


const [h, m] =
    checkOut
        .split(":")
        .map(Number);


const [oh, om] =
    settings.officeEndTime
        .split(":")
        .map(Number);


const actual =
    h * 60 + m;

const office =
    oh * 60 + om;


const overtime =
    actual -
    office;


return Math.max(
    0,
    overtime / 60
);

}

// =========================================================
// ATTENDANCE MODAL
// =========================================================

const attendanceModal =
document.getElementById(
"attendanceModal"
);

window.openAttendanceModal =
function(
employeeId,
dateString
) {

    const emp =
        employees.find(
            e =>
                e.id ===
                employeeId
        );

    if (!emp) return;


    const record =
        attendance[
            dateString
        ]?.[
            employeeId
        ] || {

            status:
                isWeeklyOff(
                    dateString
                )
                ? "Weekly Off"
                : "Absent",

            checkIn: "",
            checkOut: ""

        };


    document.getElementById(
        "attendanceEmployeeId"
    ).value =
        employeeId;

    document.getElementById(
        "attendanceDate"
    ).value =
        dateString;

    document.getElementById(
        "attendanceEmployeeName"
    ).value =
        emp.name;

    document.getElementById(
        "checkInTime"
    ).value =
        record.checkIn || "";

    document.getElementById(
        "checkOutTime"
    ).value =
        record.checkOut || "";

    document.getElementById(
        "attendanceStatus"
    ).value =
        record.status;


    attendanceModal.classList.add(
        "show"
    );

};

function closeAttendanceModal() {

attendanceModal.classList.remove(
    "show"
);

}

document.getElementById(
"closeAttendanceModal"
).addEventListener(
"click",
closeAttendanceModal
);

document.getElementById(
"cancelAttendanceBtn"
).addEventListener(
"click",
closeAttendanceModal
);

document.getElementById(
"attendanceForm"
).addEventListener(
"submit",
function(e) {

    e.preventDefault();


    const employeeId =
        document.getElementById(
            "attendanceEmployeeId"
        ).value;

    const dateString =
        document.getElementById(
            "attendanceDate"
        ).value;


    if (!attendance[
        dateString
    ]) {

        attendance[
            dateString
        ] = {};

    }


    attendance[
        dateString
    ][
        employeeId
    ] = {

        status:
            document.getElementById(
                "attendanceStatus"
            ).value,

        checkIn:
            document.getElementById(
                "checkInTime"
            ).value,

        checkOut:
            document.getElementById(
                "checkOutTime"
            ).value

    };


    saveData();

    closeAttendanceModal();

    renderCalendar();

    renderAttendanceDetails(
        dateString
    );

    updateDashboard();

}

);

// =========================================================
// MARK ALL PRESENT
// =========================================================

document.getElementById(
"markAllPresentBtn"
).addEventListener(
"click",
() => {

    if (!employees.length) {

        alert(
            "Add employees first"
        );

        return;

    }


    if (!attendance[
        selectedAttendanceDate
    ]) {

        attendance[
            selectedAttendanceDate
        ] = {};

    }


    employees.forEach(
        emp => {

            attendance[
                selectedAttendanceDate
            ][
                emp.id
            ] = {

                status:
                    "Full Day",

                checkIn:
                    settings.officeStartTime,

                checkOut:
                    settings.officeEndTime

            };

        }
    );


    saveData();

    renderCalendar();

    renderAttendanceDetails(
        selectedAttendanceDate
    );

    updateDashboard();

}

);

document.getElementById(
"markHolidayBtn"
).addEventListener(
"click",
() => {

    if (!employees.length) {

        alert(
            "Add employees first"
        );

        return;

    }


    if (!attendance[
        selectedAttendanceDate
    ]) {

        attendance[
            selectedAttendanceDate
        ] = {};

    }


    employees.forEach(
        emp => {

            attendance[
                selectedAttendanceDate
            ][
                emp.id
            ] = {

                status:
                    "Holiday",

                checkIn: "",
                checkOut: ""

            };

        }
    );


    saveData();

    renderCalendar();

    renderAttendanceDetails(
        selectedAttendanceDate
    );

    updateDashboard();

}

);

// =========================================================
// LEAVE MANAGEMENT
// =========================================================

const leaveModal =
document.getElementById(
"leaveModal"
);

document.getElementById(
"addLeaveBtn"
).addEventListener(
"click",
() => {

    document.getElementById(
        "leaveForm"
    ).reset();

    leaveModal.classList.add(
        "show"
    );

}

);

function closeLeaveModal() {

leaveModal.classList.remove(
    "show"
);

}

document.getElementById(
"closeLeaveModal"
).addEventListener(
"click",
closeLeaveModal
);

document.getElementById(
"cancelLeaveBtn"
).addEventListener(
"click",
closeLeaveModal
);

document.getElementById(
"leaveForm"
).addEventListener(
"submit",
function(e) {

    e.preventDefault();


    const employeeId =
        document.getElementById(
            "leaveEmployee"
        ).value;

    const from =
        document.getElementById(
            "leaveFrom"
        ).value;

    const to =
        document.getElementById(
            "leaveTo"
        ).value;


    if (to < from) {

        alert(
            "To date cannot be before From date"
        );

        return;

    }


    const leave = {

        id:
            Date.now().toString(),

        employeeId,

        type:
            document.getElementById(
                "leaveType"
            ).value,

        from,

        to,

        days:
            calculateDays(
                from,
                to
            ),

        reason:
            document.getElementById(
                "leaveReason"
            ).value,

        status:
            "Approved"

    };


    leaves.push(
        leave
    );


    applyLeaveToAttendance(
        leave
    );


    saveData();

    closeLeaveModal();

    renderLeaves();

    renderCalendar();

    updateDashboard();

    alert(
        "Leave added successfully"
    );

}

);

function applyLeaveToAttendance(
leave
) {

let current =
    new Date(
        leave.from +
        "T00:00:00"
    );


const end =
    new Date(
        leave.to +
        "T00:00:00"
    );


while (
    current <= end
) {

    const date =
        formatDate(
            current
        );


    if (!attendance[
        date
    ]) {

        attendance[
            date
        ] = {};

    }


    attendance[
        date
    ][
        leave.employeeId
    ] = {

        status:
            leave.type ===
            "Unpaid Leave"
                ? "Unpaid Leave"
                : "Paid Leave",

        checkIn: "",
        checkOut: ""

    };


    current.setDate(
        current.getDate() + 1
    );

}

}

function renderLeaves() {

const tbody =
    document.getElementById(
        "leaveTable"
    );


if (!leaves.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="8"
                style="text-align:center">
                No leave records found
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    leaves.map(
        leave => {

            const emp =
                employees.find(
                    e =>
                        e.id ===
                        leave.employeeId
                );


            return `

            <tr>

                <td>
                    ${escapeHTML(
                        emp?.name ||
                        leave.employeeId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        leave.type
                    )}
                </td>

                <td>
                    ${leave.from}
                </td>

                <td>
                    ${leave.to}
                </td>

                <td>
                    ${leave.days}
                </td>

                <td>
                    ${escapeHTML(
                        leave.reason
                    )}
                </td>

                <td>
                    <span class="status-badge status-paid">
                        ${escapeHTML(
                            leave.status
                        )}
                    </span>
                </td>

                <td>

                    <button
                        class="danger-btn"
                        onclick="deleteLeave('${leave.id}')">
                        🗑️
                    </button>

                </td>

            </tr>

        `;

        }
    ).join("");

}

window.deleteLeave =
function(id) {

    if (
        !confirm(
            "Delete this leave record?"
        )
    ) return;


    leaves =
        leaves.filter(
            leave =>
                leave.id !== id
        );


    saveData();

    renderLeaves();

    updateDashboard();

};

// =========================================================
// PAYROLL
// =========================================================

function populatePayrollMonth() {

const input =
    document.getElementById(
        "payrollMonth"
    );

if (
    !input.value
) {

    input.value =
        getToday().substring(
            0,
            7
        );

}

}

function getAttendanceSummary(
employeeId,
month
) {

const summary = {

    fullDay: 0,
    halfDay: 0,
    paidLeave: 0,
    absent: 0,
    overtime: 0

};


const totalDays =
    new Date(
        Number(
            month.split("-")[0]
        ),
        Number(
            month.split("-")[1]
        ),
        0
    ).getDate();


for (
    let day = 1;
    day <= totalDays;
    day++
) {

    const date =
        `${month}-${String(day).padStart(2, "0")}`;


    const record =
        attendance[
            date
        ]?.[
            employeeId
        ];


    if (!record) {

        continue;

    }


    if (
        record.status ===
        "Full Day"
    ) {

        summary.fullDay++;

    }


    if (
        record.status ===
        "Half Day"
    ) {

        summary.halfDay++;

    }


    if (
        record.status ===
        "Paid Leave"
    ) {

        summary.paidLeave++;

    }


    if (
        record.status ===
        "Absent"
    ) {

        summary.absent++;

    }


    summary.overtime +=
        calculateOvertime(
            record.checkOut
        );

}


return summary;

}

function calculateEmployeeSalary(
emp,
month
) {

const summary =
    getAttendanceSummary(
        emp.id,
        month
    );


const date =
    new Date(
        Number(
            month.split("-")[0]
        ),
        Number(
            month.split("-")[1]
        ),
        0
    );


const totalDays =
    date.getDate();


const dailySalary =
    Number(
        emp.salary
    ) /
    totalDays;


const earnedSalary =
    (
        summary.fullDay +
        summary.paidLeave
    ) *
    dailySalary
    +
    summary.halfDay *
    dailySalary *
    0.5;


const overtimeAmount =
    summary.overtime *
    Number(
        settings.overtimeRate
    );


const saved =
    payroll[
        month
    ]?.[
        emp.id
    ] || {};


const bonus =
    Number(
        saved.bonus
    ) || 0;


const advance =
    Number(
        saved.advance
    ) || 0;


const deduction =
    Number(
        saved.deduction
    ) || 0;


const netSalary =
    earnedSalary +
    overtimeAmount +
    bonus -
    advance -
    deduction;


return {

    ...summary,

    basicSalary:
        earnedSalary,

    overtimeAmount,

    bonus,

    advance,

    deduction,

    netSalary

};

}

function calculatePayroll() {

const month =
    document.getElementById(
        "payrollMonth"
    ).value;


if (!month) return;


if (!payroll[
    month
]) {

    payroll[
        month
    ] = {};

}


const tbody =
    document.getElementById(
        "payrollTable"
    );


let total =
    0;

let overtime =
    0;


tbody.innerHTML =
    employees.map(
        emp => {

            const data =
                calculateEmployeeSalary(
                    emp,
                    month
                );


            total +=
                data.netSalary;

            overtime +=
                data.overtime;


            if (!payroll[
                month
            ][
                emp.id
            ]) {

                payroll[
                    month
                ][
                    emp.id
                ] = {

                    bonus: 0,
                    advance: 0,
                    deduction: 0

                };

            }


            return `

            <tr>

                <td>
                    <strong>
                        ${escapeHTML(
                            emp.name
                        )}
                    </strong>
                    <br>
                    <small>
                        ${escapeHTML(
                            emp.id
                        )}
                    </small>
                </td>

                <td>
                    ${formatMoney(
                        emp.salary
                    )}
                </td>

                <td>
                    ${data.fullDay}
                </td>

                <td>
                    ${data.halfDay}
                </td>

                <td>
                    ${data.paidLeave}
                </td>

                <td>
                    ${data.absent}
                </td>

                <td>
                    ${data.overtime.toFixed(2)}
                </td>

                <td>

                    <input
                        class="salary-input"
                        type="number"
                        value="${data.bonus}"
                        onchange="updatePayrollValue(
                            '${emp.id}',
                            'bonus',
                            this.value
                        )">

                </td>

                <td>

                    <input
                        class="salary-input"
                        type="number"
                        value="${data.advance}"
                        onchange="updatePayrollValue(
                            '${emp.id}',
                            'advance',
                            this.value
                        )">

                </td>

                <td>

                    <input
                        class="salary-input"
                        type="number"
                        value="${data.deduction}"
                        onchange="updatePayrollValue(
                            '${emp.id}',
                            'deduction',
                            this.value
                        )">

                </td>

                <td>
                    <strong>
                        ${formatMoney(
                            data.netSalary
                        )}
                    </strong>
                </td>

                <td>

                    <button
                        class="primary-btn"
                        onclick="generateSlipFor(
                            '${emp.id}'
                        )">
                        🧾 Slip
                    </button>

                </td>

            </tr>

        `;

        }
    ).join("");


document.getElementById(
    "totalPayroll"
).textContent =
    formatMoney(total);


document.getElementById(
    "payrollEmployees"
).textContent =
    employees.length;


document.getElementById(
    "totalOvertimeHours"
).textContent =
    overtime.toFixed(2) +
    " Hrs";


saveData();

}

window.updatePayrollValue =
function(
employeeId,
field,
value
) {

    const month =
        document.getElementById(
            "payrollMonth"
        ).value;


    if (!payroll[
        month
    ]) {

        payroll[
            month
        ] = {};

    }


    if (!payroll[
        month
    ][
        employeeId
    ]) {

        payroll[
            month
        ][
            employeeId
        ] = {

            bonus: 0,
            advance: 0,
            deduction: 0

        };

    }


    payroll[
        month
    ][
        employeeId
    ][
        field
    ] =
        Number(value) || 0;


    saveData();

    calculatePayroll();

};

document.getElementById(
"calculatePayrollBtn"
).addEventListener(
"click",
calculatePayroll
);

document.getElementById(
"payrollMonth"
).addEventListener(
"change",
calculatePayroll
);

// =========================================================
// SALARY SLIP
// =========================================================

function generateSalarySlip() {

const employeeId =
    document.getElementById(
        "salaryEmployeeSelect"
    ).value;


const month =
    document.getElementById(
        "salarySlipMonth"
    ).value;


if (
    !employeeId ||
    !month
) {

    alert(
        "Select employee and month"
    );

    return;

}


generateSlipFor(
    employeeId,
    month
);

}

window.generateSlipFor =
function(
employeeId,
month
) {

    if (!month) {

        month =
            document.getElementById(
                "payrollMonth"
            ).value;

    }


    if (!month) {

        month =
            getToday().substring(
                0,
                7
            );

    }


    document.getElementById(
        "salaryEmployeeSelect"
    ).value =
        employeeId;


    document.getElementById(
        "salarySlipMonth"
    ).value =
        month;


    const emp =
        employees.find(
            e =>
                e.id ===
                employeeId
        );


    if (!emp) return;


    const data =
        calculateEmployeeSalary(
            emp,
            month
        );


    document.getElementById(
        "slipMonth"
    ).textContent =
        month;


    document.getElementById(
        "slipEmployeeName"
    ).textContent =
        emp.name;


    document.getElementById(
        "slipEmployeeId"
    ).textContent =
        emp.id;


    document.getElementById(
        "slipDepartment"
    ).textContent =
        emp.department || "-";


    document.getElementById(
        "slipFullDay"
    ).textContent =
        data.fullDay;


    document.getElementById(
        "slipHalfDay"
    ).textContent =
        data.halfDay;


    document.getElementById(
        "slipPaidLeave"
    ).textContent =
        data.paidLeave;


    document.getElementById(
        "slipAbsent"
    ).textContent =
        data.absent;


    document.getElementById(
        "slipOvertime"
    ).textContent =
        data.overtime.toFixed(2) +
        " Hrs";


    document.getElementById(
        "slipBasicSalary"
    ).textContent =
        formatMoney(
            data.basicSalary
        );


    document.getElementById(
        "slipBonus"
    ).textContent =
        formatMoney(
            data.bonus
        );


    document.getElementById(
        "slipAdvance"
    ).textContent =
        formatMoney(
            data.advance
        );


    document.getElementById(
        "slipDeduction"
    ).textContent =
        formatMoney(
            data.deduction
        );


    document.getElementById(
        "slipNetSalary"
    ).textContent =
        formatMoney(
            data.netSalary
        );


    document.getElementById(
        "salarySlipContainer"
    ).classList.remove(
        "hidden"
    );

};

document.getElementById(
"generateSalarySlipBtn"
).addEventListener(
"click",
generateSalarySlip
);

document.getElementById(
"printSalarySlipBtn"
).addEventListener(
"click",
() => {

    window.print();

}

);

// =========================================================
// DASHBOARD
// =========================================================

function updateDashboard() {

const today =
    getToday();


document.getElementById(
    "totalEmployees"
).textContent =
    employees.length;


let present = 0;

let half = 0;

let absent = 0;

let leave = 0;

let late = 0;

let overtime = 0;


const records =
    attendance[
        today
    ] || {};


employees.forEach(
    emp => {

        const record =
            records[
                emp.id
            ];


        if (!record) return;


        if (
            record.status ===
            "Full Day"
        ) {

            present++;

        }


        if (
            record.status ===
            "Half Day"
        ) {

            half++;

        }


        if (
            record.status ===
            "Absent"
        ) {

            absent++;

        }


        if (
            record.status ===
            "Paid Leave" ||
            record.status ===
            "Unpaid Leave"
        ) {

            leave++;

        }


        late +=
            calculateLateMinutes(
                record.checkIn
            );


        overtime +=
            calculateOvertime(
                record.checkOut
            );

    }
);


document.getElementById(
    "presentToday"
).textContent =
    present;


document.getElementById(
    "halfDayToday"
).textContent =
    half;


document.getElementById(
    "absentToday"
).textContent =
    absent;


document.getElementById(
    "leaveToday"
).textContent =
    leave;


document.getElementById(
    "lateToday"
).textContent =
    late > 0
        ? late + " min"
        : 0;


document.getElementById(
    "overtimeToday"
).textContent =
    overtime.toFixed(2) +
    " Hrs";


renderDashboardAttendance();

}

function renderDashboardAttendance() {

const tbody =
    document.getElementById(
        "dashboardAttendance"
    );


const today =
    getToday();


const records =
    attendance[
        today
    ] || {};


if (!employees.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="6"
                style="text-align:center">
                No employees yet
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    employees.map(
        emp => {

            const record =
                records[
                    emp.id
                ] || {};


            const hours =
                calculateWorkingHours(
                    record.checkIn,
                    record.checkOut
                );


            return `

            <tr>

                <td>
                    ${escapeHTML(
                        emp.id
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        emp.name
                    )}
                </td>

                <td>
                    ${record.checkIn || "-"}
                </td>

                <td>
                    ${record.checkOut || "-"}
                </td>

                <td>
                    ${hours.toFixed(2)} Hrs
                </td>

                <td>

                    <span class="status-badge
                        ${getStatusClass(
                            record.status
                        )}">

                        ${record.status || "Not Marked"}

                    </span>

                </td>

            </tr>

        `;

        }
    ).join("");

}

// =========================================================
// SETTINGS
// =========================================================

function loadSettings() {

document.getElementById(
    "officeStartTime"
).value =
    settings.officeStartTime;


document.getElementById(
    "officeEndTime"
).value =
    settings.officeEndTime;


document.getElementById(
    "gracePeriod"
).value =
    settings.gracePeriod;


document.getElementById(
    "weeklyOff"
).value =
    settings.weeklyOff;


document.getElementById(
    "overtimeRate"
).value =
    settings.overtimeRate;

}

document.getElementById(
"settingsForm"
).addEventListener(
"submit",
function(e) {

    e.preventDefault();


    settings = {

        officeStartTime:
            document.getElementById(
                "officeStartTime"
            ).value,

        officeEndTime:
            document.getElementById(
                "officeEndTime"
            ).value,

        gracePeriod:
            Number(
                document.getElementById(
                    "gracePeriod"
                ).value
            ) || 0,

        weeklyOff:
            Number(
                document.getElementById(
                    "weeklyOff"
                ).value
            ),

        overtimeRate:
            Number(
                document.getElementById(
                    "overtimeRate"
                ).value
            ) || 0

    };


    saveData();

    alert(
        "Settings saved successfully"
    );

    renderCalendar();

    updateDashboard();

}

);

// =========================================================
// REPORTS
// =========================================================

function generateReport() {

const type =
    document.getElementById(
        "reportType"
    ).value;


const month =
    document.getElementById(
        "reportMonth"
    ).value ||
    getToday().substring(
        0,
        7
    );


document.getElementById(
    "reportMonth"
).value =
    month;


const head =
    document.getElementById(
        "reportHead"
    );

const body =
    document.getElementById(
        "reportBody"
    );


if (type === "salary") {

    head.innerHTML = `
        <tr>
            <th>Employee</th>
            <th>Basic Salary</th>
            <th>Full Day</th>
            <th>Half Day</th>
            <th>Absent</th>
            <th>Overtime</th>
            <th>Net Salary</th>
        </tr>
    `;


    body.innerHTML =
        employees.map(
            emp => {

                const data =
                    calculateEmployeeSalary(
                        emp,
                        month
                    );


                return `
                    <tr>
                        <td>
                            ${escapeHTML(
                                emp.name
                            )}
                        </td>
                        <td>
                            ${formatMoney(
                                emp.salary
                            )}
                        </td>
                        <td>
                            ${data.fullDay}
                        </td>
                        <td>
                            ${data.halfDay}
                        </td>
                        <td>
                            ${data.absent}
                        </td>
                        <td>
                            ${data.overtime.toFixed(2)}
                        </td>
                        <td>
                            ${formatMoney(
                                data.netSalary
                            )}
                        </td>
                    </tr>
                `;

            }
        ).join("");

    return;

}


head.innerHTML = `
    <tr>
        <th>Employee</th>
        <th>Full Day</th>
        <th>Half Day</th>
        <th>Absent</th>
        <th>Paid Leave</th>
        <th>Late Minutes</th>
        <th>Overtime</th>
    </tr>
`;


body.innerHTML =
    employees.map(
        emp => {

            const data =
                getAttendanceSummary(
                    emp.id,
                    month
                );


            let late = 0;


            let current =
                new Date(
                    month +
                    "-01T00:00:00"
                );


            const totalDays =
                new Date(
                    current.getFullYear(),
                    current.getMonth() + 1,
                    0
                ).getDate();


            for (
                let d = 1;
                d <= totalDays;
                d++
            ) {

                const date =
                    `${month}-${String(d).padStart(2, "0")}`;


                const record =
                    attendance[
                        date
                    ]?.[
                        emp.id
                    ];


                if (record) {

                    late +=
                        calculateLateMinutes(
                            record.checkIn
                        );

                }

            }


            return `

                <tr>

                    <td>
                        ${escapeHTML(
                            emp.name
                        )}
                    </td>

                    <td>
                        ${data.fullDay}
                    </td>

                    <td>
                        ${data.halfDay}
                    </td>

                    <td>
                        ${data.absent}
                    </td>

                    <td>
                        ${data.paidLeave}
                    </td>

                    <td>
                        ${late} min
                    </td>

                    <td>
                        ${data.overtime.toFixed(2)} Hrs
                    </td>

                </tr>

            `;

        }
    ).join("");

}

document.getElementById(
"generateReportBtn"
).addEventListener(
"click",
generateReport
);

document.getElementById(
"reportType"
).addEventListener(
"change",
generateReport
);

document.getElementById(
"reportMonth"
).addEventListener(
"change",
generateReport
);

// =========================================================
// CSV EXPORT
// =========================================================

document.getElementById(
"exportReportBtn"
).addEventListener(
"click",
() => {

    const table =
        document.querySelector(
            "#reportsPage table"
        );


    if (!table) return;


    let csv = "";


    table.querySelectorAll(
        "tr"
    ).forEach(
        row => {

            const cells =
                row.querySelectorAll(
                    "th, td"
                );


            const values =
                Array.from(
                    cells
                ).map(
                    cell =>
                        `"${cell.textContent
                            .trim()
                            .replace(
                                /"/g,
                                '""'
                            )}"`
                );


            csv +=
                values.join(",") +
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


    const a =
        document.createElement(
            "a"
        );


    a.href = url;

    a.download =
        "employee-report.csv";

    a.click();


    URL.revokeObjectURL(
        url
    );

}

);

// =========================================================
// BACKUP & RESTORE
// =========================================================

document.getElementById(
"exportBackupBtn"
).addEventListener(
"click",
() => {

    const backup = {

        employees,

        attendance,

        leaves,

        payroll,

        settings,

        exportDate:
            new Date().toISOString()

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const a =
        document.createElement(
            "a"
        );


    a.href = url;

    a.download =
        "employee-backup.json";

    a.click();


    URL.revokeObjectURL(
        url
    );

}

);

document.getElementById(
"importBackupInput"
).addEventListener(
"change",
function(e) {

    const file =
        e.target.files[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            try {

                const data =
                    JSON.parse(
                        event.target.result
                    );


                if (
                    !data.employees ||
                    !data.attendance
                ) {

                    throw new Error(
                        "Invalid backup"
                    );

                }


                employees =
                    data.employees || [];

                attendance =
                    data.attendance || {};

                leaves =
                    data.leaves || [];

                payroll =
                    data.payroll || {};

                settings =
                    data.settings ||
                    settings;


                saveData();


                populateEmployeeSelects();

                renderEmployees();

                renderCalendar();

                renderLeaves();

                updateDashboard();

                loadSettings();


                alert(
                    "Backup restored successfully"
                );


            } catch (error) {

                alert(
                    "Invalid backup file"
                );

            }

        };


    reader.readAsText(
        file
    );

}

);

// =========================================================
// RESET ALL DATA
// =========================================================

document.getElementById(
"resetDataBtn"
).addEventListener(
"click",
() => {

    if (
        !confirm(
            "WARNING! This will delete all employees, attendance, leave and payroll data. Continue?"
        )
    ) return;


    localStorage.removeItem(
        STORAGE.employees
    );

    localStorage.removeItem(
        STORAGE.attendance
    );

    localStorage.removeItem(
        STORAGE.leaves
    );

    localStorage.removeItem(
        STORAGE.payroll
    );


    employees = [];

    attendance = {};

    leaves = [];

    payroll = {};


    saveData();


    populateEmployeeSelects();

    renderEmployees();

    renderCalendar();

    renderLeaves();

    updateDashboard();


    alert(
        "All data has been reset"
    );

}

);

// =========================================================
// INITIALIZE
// =========================================================

function initializeApp() {

document.getElementById(
    "currentDate"
).textContent =
    new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );


document.getElementById(
    "payrollMonth"
).value =
    getToday().substring(
        0,
        7
    );


document.getElementById(
    "salarySlipMonth"
).value =
    getToday().substring(
        0,
        7
    );


document.getElementById(
    "reportMonth"
).value =
    getToday().substring(
        0,
        7
    );


loadSettings();

populateEmployeeSelects();

renderEmployees();

renderCalendar();

renderAttendanceDetails(
    selectedAttendanceDate
);

renderLeaves();

updateDashboard();

calculatePayroll();

generateReport();

}

initializeApp();
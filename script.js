"use strict";

/* =========================================================
EMPLOYEE PRO
ATTENDANCE + LEAVE + PAYROLL + SALARY SLIP
COMPLETE SCRIPT.JS
========================================================= */

const KEYS = {
employees: "EMP_PRO_EMPLOYEES_V3",
attendance: "EMP_PRO_ATTENDANCE_V3",
leaves: "EMP_PRO_LEAVES_V3",
settings: "EMP_PRO_SETTINGS_V3",
payroll: "EMP_PRO_PAYROLL_V3"
};

let employees = load(KEYS.employees, []);
let attendance = load(KEYS.attendance, []);
let leaves = load(KEYS.leaves, []);
let settings = load(KEYS.settings, {
officeStartTime: "09:00",
officeEndTime: "18:00",
gracePeriod: 15,
weeklyOff: 0,
overtimeRate: 100
});

let payrollData = load(KEYS.payroll, []);

let calendarDate = new Date();
let selectedDate = getToday();
let currentReportData = [];

/* =========================================================
INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

initializeDates();

setupNavigation();

setupEmployeeEvents();

setupAttendanceEvents();

setupLeaveEvents();

setupPayrollEvents();

setupSalarySlipEvents();

setupReportEvents();

setupSettingsEvents();

setupBackupEvents();

loadSettingsForm();

renderAll();

});

/* =========================================================
STORAGE
========================================================= */

function load(key, fallback) {

try {

    const data = localStorage.getItem(key);

    return data ? JSON.parse(data) : fallback;

} catch (error) {

    console.error("Storage error:", error);

    return fallback;

}

}

function saveAll() {

localStorage.setItem(
    KEYS.employees,
    JSON.stringify(employees)
);

localStorage.setItem(
    KEYS.attendance,
    JSON.stringify(attendance)
);

localStorage.setItem(
    KEYS.leaves,
    JSON.stringify(leaves)
);

localStorage.setItem(
    KEYS.settings,
    JSON.stringify(settings)
);

localStorage.setItem(
    KEYS.payroll,
    JSON.stringify(payrollData)
);

}

/* =========================================================
DATE FUNCTIONS
========================================================= */

function getToday() {

const d = new Date();

return formatDate(d);

}

function formatDate(date) {

return date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

}

function parseDate(dateString) {

const parts = dateString.split("-");

return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
);

}

function getCurrentMonth() {

const d = new Date();

return d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0");

}

function daysInMonth(month) {

const [year, mon] = month.split("-");

return new Date(
    Number(year),
    Number(mon),
    0
).getDate();

}

/* =========================================================
INITIAL DATES
========================================================= */

function initializeDates() {

const today = new Date();

const month = getCurrentMonth();

const currentDate = document.getElementById(
    "currentDate"
);

if (currentDate) {

    currentDate.textContent =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}

setValue(
    "payrollMonth",
    month
);

setValue(
    "salarySlipMonth",
    month
);

setValue(
    "reportMonth",
    month
);

}

/* =========================================================
NAVIGATION
========================================================= */

function setupNavigation() {

document.querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                document.querySelectorAll(
                    ".nav-item"
                ).forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );

                document.querySelectorAll(
                    ".page"
                ).forEach(section => {

                    section.classList.remove(
                        "active"
                    );

                });

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

                    leave:
                        "Leave Management",

                    payroll:
                        "Payroll",

                    salarySlip:
                        "Salary Slip",

                    reports:
                        "Reports",

                    settings:
                        "Settings",

                    backup:
                        "Backup & Restore"

                };

                const title =
                    document.getElementById(
                        "pageTitle"
                    );

                if (title) {

                    title.textContent =
                        titles[page] ||
                        "Dashboard";

                }

            }

        );

    });

}

/* =========================================================
EMPLOYEE EVENTS
========================================================= */

function setupEmployeeEvents() {

const addButton =
    document.getElementById(
        "addEmployeeBtn"
    );

if (addButton) {

    addButton.onclick =
        openEmployeeModal;

}


const closeButton =
    document.getElementById(
        "closeEmployeeModal"
    );

if (closeButton) {

    closeButton.onclick =
        closeEmployeeModal;

}


const cancelButton =
    document.getElementById(
        "cancelEmployeeBtn"
    );

if (cancelButton) {

    cancelButton.onclick =
        closeEmployeeModal;

}


const form =
    document.getElementById(
        "employeeForm"
    );

if (form) {

    form.addEventListener(
        "submit",
        saveEmployee
    );

}


const search =
    document.getElementById(
        "employeeSearch"
    );

if (search) {

    search.addEventListener(
        "input",
        renderEmployees
    );

}


const departmentFilter =
    document.getElementById(
        "employeeDepartmentFilter"
    );

if (departmentFilter) {

    departmentFilter.addEventListener(
        "change",
        renderEmployees
    );

}

}

/* =========================================================
EMPLOYEE MODAL
========================================================= */

function openEmployeeModal() {

const form =
    document.getElementById(
        "employeeForm"
    );

if (form) {

    form.reset();

}

setValue(
    "editEmployeeId",
    ""
);

setValue(
    "employeeJoinDate",
    getToday()
);

setText(
    "employeeModalTitle",
    "Add Employee"
);

showModal(
    "employeeModal"
);

}

function closeEmployeeModal() {

hideModal(
    "employeeModal"
);

}

/* =========================================================
SAVE EMPLOYEE
========================================================= */

function saveEmployee(event) {

event.preventDefault();

const editId =
    getValue("editEmployeeId");

const id =
    getValue("employeeId").trim();

const name =
    getValue("employeeName").trim();

const phone =
    getValue("employeePhone").trim();

const department =
    getValue("employeeDepartment").trim();

const designation =
    getValue("employeeDesignation").trim();

const salary =
    Number(
        getValue("employeeSalary")
    );

const joinDate =
    getValue("employeeJoinDate");

const status =
    getValue("employeeStatus");


if (!id || !name || !salary || !joinDate) {

    alert(
        "Please fill all required fields."
    );

    return;

}


if (editId) {

    const employee =
        employees.find(
            e => e.id === editId
        );

    if (!employee) {

        alert(
            "Employee not found."
        );

        return;

    }

    employee.name =
        name;

    employee.phone =
        phone;

    employee.department =
        department;

    employee.designation =
        designation;

    employee.monthlySalary =
        salary;

    employee.joinDate =
        joinDate;

    employee.status =
        status;

} else {

    const exists =
        employees.some(
            e =>
                e.id.toLowerCase() ===
                id.toLowerCase()
        );

    if (exists) {

        alert(
            "Employee ID already exists."
        );

        return;

    }

    employees.push({

        id: id,

        name: name,

        phone: phone,

        department:
            department,

        designation:
            designation,

        monthlySalary:
            salary,

        joinDate:
            joinDate,

        status:
            status

    });

}


saveAll();

closeEmployeeModal();

renderAll();

alert(
    "Employee saved successfully."
);

}

/* =========================================================
RENDER EMPLOYEES
========================================================= */

function renderEmployees() {

const table =
    document.getElementById(
        "employeeTable"
    );

if (!table) return;


const search =
    getValue(
        "employeeSearch"
    ).toLowerCase();

const department =
    getValue(
        "employeeDepartmentFilter"
    );


let list =
    employees.filter(
        employee => {

            const matchesSearch =

                employee.id
                    .toLowerCase()
                    .includes(search)

                ||

                employee.name
                    .toLowerCase()
                    .includes(search)

                ||

                (employee.phone || "")
                    .toLowerCase()
                    .includes(search);


            const matchesDepartment =

                !department

                ||

                employee.department ===
                department;


            return (
                matchesSearch &&
                matchesDepartment
            );

        }
    );


if (!list.length) {

    table.innerHTML = `

    <tr>

        <td
            colspan="9"
            class="empty"
        >

            No employees found.

        </td>

    </tr>

    `;

    return;

}


table.innerHTML =
    list.map(
        employee => {

            return `

            <tr>

                <td>
                    ${safe(employee.id)}
                </td>

                <td>
                    <strong>
                        ${safe(employee.name)}
                    </strong>
                </td>

                <td>
                    ${safe(
                        employee.phone ||
                        "-"
                    )}
                </td>

                <td>
                    ${safe(
                        employee.department ||
                        "-"
                    )}
                </td>

                <td>
                    ${safe(
                        employee.designation ||
                        "-"
                    )}
                </td>

                <td>
                    ₹${formatMoney(
                        employee.monthlySalary
                    )}
                </td>

                <td>
                    ${employee.joinDate}
                </td>

                <td>

                    <span
                        class="status-badge
                        ${
                            employee.status ===
                            "Active"
                                ?
                            "status-active"
                                :
                            "status-inactive"
                        }"
                    >

                        ${employee.status}

                    </span>

                </td>

                <td>

                    <div
                        class="employee-action"
                    >

                        <button
                            class="primary-btn"
                            onclick="editEmployee('${escapeAttr(employee.id)}')"
                        >

                            Edit

                        </button>

                        <button
                            class="danger-btn"
                            onclick="deleteEmployee('${escapeAttr(employee.id)}')"
                        >

                            Delete

                        </button>

                    </div>

                </td>

            </tr>

            `;

        }
    ).join("");

}

/* =========================================================
EDIT EMPLOYEE
========================================================= */

function editEmployee(id) {

const employee =
    employees.find(
        e => e.id === id
    );

if (!employee) return;


setValue(
    "editEmployeeId",
    employee.id
);

setValue(
    "employeeId",
    employee.id
);

setValue(
    "employeeName",
    employee.name
);

setValue(
    "employeePhone",
    employee.phone || ""
);

setValue(
    "employeeDepartment",
    employee.department || ""
);

setValue(
    "employeeDesignation",
    employee.designation || ""
);

setValue(
    "employeeSalary",
    employee.monthlySalary
);

setValue(
    "employeeJoinDate",
    employee.joinDate
);

setValue(
    "employeeStatus",
    employee.status
);


setText(
    "employeeModalTitle",
    "Edit Employee"
);


showModal(
    "employeeModal"
);

}

/* =========================================================
DELETE EMPLOYEE
========================================================= */

function deleteEmployee(id) {

const employee =
    employees.find(
        e => e.id === id
    );

if (!employee) return;


if (
    !confirm(
        `Delete ${employee.name}?`
    )
) {

    return;

}


employees =
    employees.filter(
        e => e.id !== id
    );


attendance =
    attendance.filter(
        r =>
            r.employeeId !== id
    );


leaves =
    leaves.filter(
        r =>
            r.employeeId !== id
    );


saveAll();

renderAll();

}

/* =========================================================
DEPARTMENT FILTER
========================================================= */

function renderDepartmentFilter() {

const select =
    document.getElementById(
        "employeeDepartmentFilter"
    );

if (!select) return;


const current =
    select.value;


const departments = [
    ...new Set(
        employees
            .map(
                e =>
                    e.department
            )
            .filter(Boolean)
    )
].sort();


select.innerHTML = `

    <option value="">
        All Departments
    </option>

    ${
        departments.map(
            d =>
                `<option value="${safe(d)}">
                    ${safe(d)}
                </option>`
        ).join("")
    }

`;


select.value =
    departments.includes(
        current
    )
        ?
    current
        :
    "";

}

/* =========================================================
ATTENDANCE EVENTS
========================================================= */

function setupAttendanceEvents() {

const previous =
    document.getElementById(
        "previousMonth"
    );

if (previous) {

    previous.onclick = () => {

        calendarDate.setMonth(
            calendarDate.getMonth() - 1
        );

        renderCalendar();

    };

}


const next =
    document.getElementById(
        "nextMonth"
    );

if (next) {

    next.onclick = () => {

        calendarDate.setMonth(
            calendarDate.getMonth() + 1
        );

        renderCalendar();

    };

}


const markAll =
    document.getElementById(
        "markAllPresentBtn"
    );

if (markAll) {

    markAll.onclick =
        markAllFullDay;

}


const holiday =
    document.getElementById(
        "markHolidayBtn"
    );

if (holiday) {

    holiday.onclick =
        markSelectedDateHoliday;

}


const close =
    document.getElementById(
        "closeAttendanceModal"
    );

if (close) {

    close.onclick =
        closeAttendanceModal;

}


const cancel =
    document.getElementById(
        "cancelAttendanceBtn"
    );

if (cancel) {

    cancel.onclick =
        closeAttendanceModal;

}


const form =
    document.getElementById(
        "attendanceForm"
    );

if (form) {

    form.addEventListener(
        "submit",
        saveAttendance
    );

}

}

/* =========================================================
CALENDAR
========================================================= */

function renderCalendar() {

const calendar =
    document.getElementById(
        "attendanceCalendar"
    );

if (!calendar) return;


const year =
    calendarDate.getFullYear();

const month =
    calendarDate.getMonth();


setText(
    "calendarTitle",

    calendarDate.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    )

);


const firstDay =
    new Date(
        year,
        month,
        1
    ).getDay();


const totalDays =
    new Date(
        year,
        month + 1,
        0
    ).getDate();


calendar.innerHTML = "";


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
        formatDate(
            new Date(
                year,
                month,
                day
            )
        );


    const div =
        document.createElement(
            "div"
        );


    div.className =
        "calendar-day";


    if (
        date === getToday()
    ) {

        div.classList.add(
            "today"
        );

    }


    if (
        date === selectedDate
    ) {

        div.classList.add(
            "selected"
        );

    }


    const status =
        getDateSummary(
            date
        );


    const statusClass =
        getCalendarClass(
            status
        );


    if (statusClass) {

        div.classList.add(
            statusClass
        );

    }


    div.innerHTML = `

        <div
            class="day-number"
        >

            ${day}

        </div>


        <div
            class="day-status"
        >

            ${
                status
                    ?
                status
                    :
                ""
            }

        </div>

    `;


    div.onclick = () => {

        selectedDate =
            date;

        renderCalendar();

        renderAttendanceDetails();

        const details =
            document.getElementById(
                "attendanceDetails"
            );

        if (details) {

            details.classList.remove(
                "hidden"
            );

        }

    };


    calendar.appendChild(
        div
    );

}

}

/* =========================================================
DATE SUMMARY
========================================================= */

function getDateSummary(date) {

const records =
    attendance.filter(
        r =>
            r.date === date
    );


if (!records.length) {

    const d =
        parseDate(date);


    if (
        d.getDay() ===
        Number(
            settings.weeklyOff
        )
    ) {

        return "Weekly Off";

    }


    return "";

}


const statuses =
    records.map(
        r => r.status
    );


if (
    statuses.includes(
        "Holiday"
    )
) {

    return "Holiday";

}


if (
    statuses.includes(
        "Full Day"
    )
) {

    return "Full Day";

}


if (
    statuses.includes(
        "Half Day"
    )
) {

    return "Half Day";

}


if (
    statuses.includes(
        "Paid Leave"
    )
) {

    return "Paid Leave";

}


if (
    statuses.includes(
        "Unpaid Leave"
    )
) {

    return "Unpaid Leave";

}


if (
    statuses.includes(
        "Weekly Off"
    )
) {

    return "Weekly Off";

}


return "Absent";

}

/* =========================================================
CALENDAR CLASS
========================================================= */

function getCalendarClass(status) {

const classes = {

    "Full Day":
        "calendar-full",

    "Half Day":
        "calendar-half",

    "Absent":
        "calendar-absent",

    "Paid Leave":
        "calendar-paid",

    "Unpaid Leave":
        "calendar-unpaid",

    "Holiday":
        "calendar-holiday",

    "Weekly Off":
        "calendar-weekoff"

};


return classes[status] || "";

}

/* =========================================================
ATTENDANCE DETAILS
========================================================= */

function renderAttendanceDetails() {

const table =
    document.getElementById(
        "attendanceTable"
    );

if (!table) return;


setText(
    "selectedDateTitle",
    `Attendance - ${selectedDate}`
);


if (!employees.length) {

    table.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="empty"
            >

                Add employees first.

            </td>

        </tr>

    `;

    return;

}


table.innerHTML =
    employees.map(
        employee => {

            const record =
                getAttendance(
                    employee.id,
                    selectedDate
                );


            const status =
                record
                    ?
                record.status
                    :
                "Absent";


            const workingHours =
                record
                    ?
                calculateWorkingHours(
                    record.checkIn,
                    record.checkOut
                )
                    :
                0;


            const late =
                record
                    ?
                calculateLate(
                    record.checkIn
                )
                    :
                0;


            const overtime =
                record
                    ?
                calculateOvertime(
                    record.checkIn,
                    record.checkOut
                )
                    :
                0;


            return `

            <tr>

                <td>
                    ${safe(employee.id)}
                </td>

                <td>
                    ${safe(employee.name)}
                </td>

                <td>
                    ${record?.checkIn || "-"}
                </td>

                <td>
                    ${record?.checkOut || "-"}
                </td>

                <td>
                    ${workingHours.toFixed(2)} Hrs
                </td>

                <td>

                    <span
                        class="status-badge
                        ${statusClass(status)}"
                    >

                        ${status}

                    </span>

                </td>

                <td>

                    ${
                        late > 0
                            ?
                        `<span class="status-badge status-late">
                            ${late} min
                        </span>`
                            :
                        "-"
                    }

                </td>

                <td>

                    ${
                        overtime > 0
                            ?
                        `${overtime.toFixed(2)} Hrs`
                            :
                        "-"
                    }

                </td>

                <td>

                    <button
                        class="primary-btn"
                        onclick="openAttendanceModal(
                            '${escapeAttr(employee.id)}',
                            '${selectedDate}'
                        )"
                    >

                        Update

                    </button>

                </td>

            </tr>

            `;

        }
    ).join("");

}

/* =========================================================
OPEN ATTENDANCE MODAL
========================================================= */

function openAttendanceModal(
employeeId,
date
) {

const employee =
    employees.find(
        e =>
            e.id === employeeId
    );


if (!employee) return;


const record =
    getAttendance(
        employeeId,
        date
    );


setValue(
    "attendanceEmployeeId",
    employeeId
);

setValue(
    "attendanceDate",
    date
);

setValue(
    "attendanceEmployeeName",
    employee.name
);

setValue(
    "checkInTime",
    record?.checkIn || ""
);

setValue(
    "checkOutTime",
    record?.checkOut || ""
);

setValue(
    "attendanceStatus",
    record?.status ||
    "Absent"
);


showModal(
    "attendanceModal"
);

}

function closeAttendanceModal() {

hideModal(
    "attendanceModal"
);

}

/* =========================================================
SAVE ATTENDANCE
========================================================= */

function saveAttendance(event) {

event.preventDefault();


const employeeId =
    getValue(
        "attendanceEmployeeId"
    );

const date =
    getValue(
        "attendanceDate"
    );

const checkIn =
    getValue(
        "checkInTime"
    );

const checkOut =
    getValue(
        "checkOutTime"
    );

const status =
    getValue(
        "attendanceStatus"
    );


let record =
    getAttendance(
        employeeId,
        date
    );


if (!record) {

    record = {

        id:
            Date.now().toString(),

        employeeId,

        date,

        checkIn,

        checkOut,

        status

    };


    attendance.push(
        record
    );

} else {

    record.checkIn =
        checkIn;

    record.checkOut =
        checkOut;

    record.status =
        status;

}


saveAll();

closeAttendanceModal();

renderAll();

renderAttendanceDetails();

}

/* =========================================================
GET ATTENDANCE
========================================================= */

function getAttendance(
employeeId,
date
) {

return attendance.find(
    record =>

        record.employeeId ===
        employeeId

        &&

        record.date ===
        date
);

}

/* =========================================================
MARK ALL FULL DAY
========================================================= */

function markAllFullDay() {

if (!employees.length) {

    alert(
        "Add employees first."
    );

    return;

}


employees.forEach(
    employee => {

        let record =
            getAttendance(
                employee.id,
                selectedDate
            );


        if (!record) {

            attendance.push({

                id:
                    Date.now() +
                    Math.random(),

                employeeId:
                    employee.id,

                date:
                    selectedDate,

                checkIn:
                    "",

                checkOut:
                    "",

                status:
                    "Full Day"

            });

        } else {

            record.status =
                "Full Day";

        }

    }
);


saveAll();

renderAll();

renderAttendanceDetails();

}

/* =========================================================
MARK HOLIDAY
========================================================= */

function markSelectedDateHoliday() {

employees.forEach(
    employee => {

        let record =
            getAttendance(
                employee.id,
                selectedDate
            );


        if (!record) {

            attendance.push({

                id:
                    Date.now() +
                    Math.random(),

                employeeId:
                    employee.id,

                date:
                    selectedDate,

                checkIn:
                    "",

                checkOut:
                    "",

                status:
                    "Holiday"

            });

        } else {

            record.status =
                "Holiday";

        }

    }
);


saveAll();

renderAll();

renderAttendanceDetails();

}

/* =========================================================
LATE CALCULATION
========================================================= */

function calculateLate(
checkIn
) {

if (!checkIn) return 0;


const office =
    timeToMinutes(
        settings.officeStartTime
    );


const actual =
    timeToMinutes(
        checkIn
    );


const grace =
    Number(
        settings.gracePeriod
    ) || 0;


const difference =
    actual -
    office -
    grace;


return Math.max(
    0,
    difference
);

}

/* =========================================================
WORKING HOURS
========================================================= */

function calculateWorkingHours(
checkIn,
checkOut
) {

if (
    !checkIn ||
    !checkOut
) {

    return 0;

}


let start =
    timeToMinutes(
        checkIn
    );

let end =
    timeToMinutes(
        checkOut
    );


if (
    end < start
) {

    end += 24 * 60;

}


return (
    end -
    start
) / 60;

}

/* =========================================================
OVERTIME
========================================================= */

function calculateOvertime(
checkIn,
checkOut
) {

if (
    !checkIn ||
    !checkOut
) {

    return 0;

}


const end =
    timeToMinutes(
        checkOut
    );


const officeEnd =
    timeToMinutes(
        settings.officeEndTime
    );


if (
    end <= officeEnd
) {

    return 0;

}


return (
    end -
    officeEnd
) / 60;

}

/* =========================================================
TIME TO MINUTES
========================================================= */

function timeToMinutes(
time
) {

if (!time) return 0;


const [
    hours,
    minutes
] =
    time.split(":")
        .map(Number);


return (
    hours * 60 +
    minutes
);

}

/* =========================================================
LEAVE EVENTS
========================================================= */

function setupLeaveEvents() {

const add =
    document.getElementById(
        "addLeaveBtn"
    );

if (add) {

    add.onclick =
        openLeaveModal;

}


const close =
    document.getElementById(
        "closeLeaveModal"
    );

if (close) {

    close.onclick =
        closeLeaveModal;

}


const cancel =
    document.getElementById(
        "cancelLeaveBtn"
    );

if (cancel) {

    cancel.onclick =
        closeLeaveModal;

}


const form =
    document.getElementById(
        "leaveForm"
    );

if (form) {

    form.addEventListener(
        "submit",
        saveLeave
    );

}

}

/* =========================================================
LEAVE MODAL
========================================================= */

function openLeaveModal() {

populateEmployeeSelect(
    "leaveEmployee"
);


const form =
    document.getElementById(
        "leaveForm"
    );

if (form) {

    form.reset();

}


populateEmployeeSelect(
    "leaveEmployee"
);


showModal(
    "leaveModal"
);

}

function closeLeaveModal() {

hideModal(
    "leaveModal"
);

}

/* =========================================================
SAVE LEAVE
========================================================= */

function saveLeave(event) {

event.preventDefault();


const employeeId =
    getValue(
        "leaveEmployee"
    );

const type =
    getValue(
        "leaveType"
    );

const from =
    getValue(
        "leaveFrom"
    );

const to =
    getValue(
        "leaveTo"
    );

const reason =
    getValue(
        "leaveReason"
    );


if (
    !employeeId ||
    !from ||
    !to
) {

    alert(
        "Please fill all required fields."
    );

    return;

}


if (
    from > to
) {

    alert(
        "To Date cannot be before From Date."
    );

    return;

}


const leave = {

    id:
        Date.now().toString(),

    employeeId,

    type,

    from,

    to,

    reason,

    status:
        "Approved"

};


leaves.push(
    leave
);


applyLeaveToAttendance(
    leave
);


saveAll();

closeLeaveModal();

renderAll();

}

/* =========================================================
APPLY LEAVE TO ATTENDANCE
========================================================= */

function applyLeaveToAttendance(
leave
) {

let current =
    parseDate(
        leave.from
    );


const end =
    parseDate(
        leave.to
    );


while (
    current <= end
) {

    const date =
        formatDate(
            current
        );


    const employee =
        employees.find(
            e =>
                e.id ===
                leave.employeeId
        );


    if (employee) {

        let record =
            getAttendance(
                employee.id,
                date
            );


        const status =
            leave.type ===
            "Paid Leave"
                ||
            leave.type ===
            "Sick Leave"
                ||
            leave.type ===
            "Casual Leave"
                ?
            "Paid Leave"
                :
            "Unpaid Leave";


        if (!record) {

            attendance.push({

                id:
                    Date.now() +
                    Math.random(),

                employeeId:
                    employee.id,

                date,

                checkIn:
                    "",

                checkOut:
                    "",

                status

            });

        } else {

            record.status =
                status;

        }

    }


    current.setDate(
        current.getDate() + 1
    );

}

}

/* =========================================================
RENDER LEAVE
========================================================= */

function renderLeaves() {

const table =
    document.getElementById(
        "leaveTable"
    );

if (!table) return;


if (!leaves.length) {

    table.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="empty"
            >

                No leave records.

            </td>

        </tr>

    `;

    return;

}


table.innerHTML =
    leaves.map(
        leave => {

            const employee =
                employees.find(
                    e =>
                        e.id ===
                        leave.employeeId
                );


            const days =
                calculateLeaveDays(
                    leave.from,
                    leave.to
                );


            return `

            <tr>

                <td>
                    ${safe(
                        employee?.name ||
                        "Unknown"
                    )}
                </td>

                <td>
                    ${safe(
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
                    ${days}
                </td>

                <td>
                    ${safe(
                        leave.reason ||
                        "-"
                    )}
                </td>

                <td>
                    ${leave.status}
                </td>

                <td>

                    <button
                        class="danger-btn"
                        onclick="deleteLeave('${escapeAttr(leave.id)}')"
                    >

                        Delete

                    </button>

                </td>

            </tr>

            `;

        }
    ).join("");

}

/* =========================================================
LEAVE DAYS
========================================================= */

function calculateLeaveDays(
from,
to
) {

const start =
    parseDate(
        from
    );

const end =
    parseDate(
        to
    );


const difference =
    end.getTime() -
    start.getTime();


return (
    Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    ) + 1
);

}

/* =========================================================
DELETE LEAVE
========================================================= */

function deleteLeave(id) {

if (
    !confirm(
        "Delete this leave record?"
    )
) {

    return;

}


leaves =
    leaves.filter(
        leave =>
            leave.id !== id
    );


saveAll();

renderLeaves();

}

/* =========================================================
PAYROLL EVENTS
========================================================= */

function setupPayrollEvents() {

const calculate =
    document.getElementById(
        "calculatePayrollBtn"
    );

if (calculate) {

    calculate.onclick =
        calculatePayroll;

}

}

/* =========================================================
PAYROLL
========================================================= */

function calculatePayroll() {

const month =
    getValue(
        "payrollMonth"
    ) ||
    getCurrentMonth();


const table =
    document.getElementById(
        "payrollTable"
    );


if (!table) return;


let totalPayroll =
    0;

let totalOvertime =
    0;


const rows =
    employees.map(
        employee => {

            const records =
                attendance.filter(
                    record =>

                        record.employeeId ===
                        employee.id

                        &&

                        record.date.startsWith(
                            month
                        )
                );


            const fullDay =
                countStatus(
                    records,
                    "Full Day"
                );


            const halfDay =
                countStatus(
                    records,
                    "Half Day"
                );


            const paidLeave =
                countStatus(
                    records,
                    "Paid Leave"
                );


            const absent =
                countStatus(
                    records,
                    "Absent"
                );


            const unpaidLeave =
                countStatus(
                    records,
                    "Unpaid Leave"
                );


            let overtime =
                0;


            records.forEach(
                record => {

                    overtime +=
                        calculateOvertime(
                            record.checkIn,
                            record.checkOut
                        );

                }
            );


            const days =
                daysInMonth(
                    month
                );


            const perDay =
                employee.monthlySalary /
                days;


            const payableDays =

                fullDay +

                halfDay * 0.5 +

                paidLeave;


            const earnedSalary =
                perDay *
                payableDays;


            const payroll =
                payrollData.find(
                    p =>

                        p.employeeId ===
                        employee.id

                        &&

                        p.month ===
                        month
                );


            const bonus =
                Number(
                    payroll?.bonus || 0
                );


            const advance =
                Number(
                    payroll?.advance || 0
                );


            const deduction =
                Number(
                    payroll?.deduction || 0
                );


            const overtimePay =
                overtime *
                Number(
                    settings.overtimeRate ||
                    0
                );


            const netSalary =

                earnedSalary +

                bonus +

                overtimePay -

                advance -

                deduction;


            totalPayroll +=
                netSalary;


            totalOvertime +=
                overtime;


            return {

                employee,

                fullDay,

                halfDay,

                paidLeave,

                absent,

                unpaidLeave,

                overtime,

                bonus,

                advance,

                deduction,

                earnedSalary,

                overtimePay,

                netSalary

            };

        }
    );


table.innerHTML =
    rows.map(
        row => {

            return `

            <tr>

                <td>
                    ${safe(
                        row.employee.name
                    )}
                </td>

                <td>
                    ₹${formatMoney(
                        row.employee.monthlySalary
                    )}
                </td>

                <td>
                    ${row.fullDay}
                </td>

                <td>
                    ${row.halfDay}
                </td>

                <td>
                    ${row.paidLeave}
                </td>

                <td>
                    ${row.absent}
                </td>

                <td>
                    ${row.overtime.toFixed(2)}
                </td>

                <td>

                    <input
                        class="salary-input"
                        type="number"
                        min="0"
                        value="${row.bonus}"
                        onchange="updatePayrollValue(
                            '${escapeAttr(row.employee.id)}',
                            '${month}',
                            'bonus',
                            this.value
                        )"
                    >

                </td>

                <td>

                    <input
                        class="salary-input"
                        type="number"
                        min="0"
                        value="${row.advance}"
                        onchange="updatePayrollValue(
                            '${escapeAttr(row.employee.id)}',
                            '${month}',
                            'advance',
                            this.value
                        )"
                    >

                </td>

                <td>

                    <input
                        class="salary-input"
                        type="number"
                        min="0"
                        value="${row.deduction}"
                        onchange="updatePayrollValue(
                            '${escapeAttr(row.employee.id)}',
                            '${month}',
                            'deduction',
                            this.value
                        )"
                    >

                </td>

                <td>

                    <strong>
                        ₹${formatMoney(
                            row.netSalary
                        )}
                    </strong>

                </td>

                <td>

                    <button
                        class="primary-btn"
                        onclick="generateSalarySlipFor(
                            '${escapeAttr(row.employee.id)}',
                            '${month}'
                        )"
                    >

                        Slip

                    </button>

                </td>

            </tr>

            `;

        }
    ).join("");


setText(
    "totalPayroll",
    "₹" +
    formatMoney(
        totalPayroll
    )
);


setText(
    "payrollEmployees",
    employees.length
);


setText(
    "totalOvertimeHours",
    totalOvertime.toFixed(2) +
    " Hrs"
);

}

/* =========================================================
UPDATE PAYROLL VALUE
========================================================= */

function updatePayrollValue(
employeeId,
month,
field,
value
) {

let record =
    payrollData.find(
        p =>

            p.employeeId ===
            employeeId

            &&

            p.month ===
            month
    );


if (!record) {

    record = {

        employeeId,

        month,

        bonus: 0,

        advance: 0,

        deduction: 0

    };


    payrollData.push(
        record
    );

}


record[field] =
    Number(value) || 0;


saveAll();

calculatePayroll();

}

/* =========================================================
SALARY SLIP EVENTS
========================================================= */

function setupSalarySlipEvents() {

populateEmployeeSelect(
    "salaryEmployeeSelect"
);


const generate =
    document.getElementById(
        "generateSalarySlipBtn"
    );

if (generate) {

    generate.onclick =
        generateSalarySlip;

}


const print =
    document.getElementById(
        "printSalarySlipBtn"
    );

if (print) {

    print.onclick =
        () => {

            window.print();

        };

}

}

/* =========================================================
GENERATE SALARY SLIP
========================================================= */

function generateSalarySlip() {

const employeeId =
    getValue(
        "salaryEmployeeSelect"
    );


const month =
    getValue(
        "salarySlipMonth"
    );


if (
    !employeeId ||
    !month
) {

    alert(
        "Select employee and month."
    );

    return;

}


generateSalarySlipFor(
    employeeId,
    month
);

}

function generateSalarySlipFor(
employeeId,
month
) {

const employee =
    employees.find(
        e =>
            e.id ===
            employeeId
    );


if (!employee) return;


const records =
    attendance.filter(
        record =>

            record.employeeId ===
            employeeId

            &&

            record.date.startsWith(
                month
            )
    );


const fullDay =
    countStatus(
        records,
        "Full Day"
    );


const halfDay =
    countStatus(
        records,
        "Half Day"
    );


const paidLeave =
    countStatus(
        records,
        "Paid Leave"
    );


const absent =
    countStatus(
        records,
        "Absent"
    );


let overtime =
    0;


records.forEach(
    record => {

        overtime +=
            calculateOvertime(
                record.checkIn,
                record.checkOut
            );

    }
);


const payroll =
    payrollData.find(
        p =>

            p.employeeId ===
            employeeId

            &&

            p.month ===
            month
    );


const bonus =
    Number(
        payroll?.bonus || 0
    );


const advance =
    Number(
        payroll?.advance || 0
    );


const deduction =
    Number(
        payroll?.deduction || 0
    );


const perDay =
    employee.monthlySalary /
    daysInMonth(
        month
    );


const payableDays =

    fullDay +

    halfDay * 0.5 +

    paidLeave;


const earnedSalary =
    perDay *
    payableDays;


const overtimePay =
    overtime *
    Number(
        settings.overtimeRate ||
        0
    );


const netSalary =

    earnedSalary +

    overtimePay +

    bonus -

    advance -

    deduction;


setText(
    "slipEmployeeName",
    employee.name
);

setText(
    "slipEmployeeId",
    employee.id
);

setText(
    "slipDepartment",
    employee.department ||
    "-"
);

setText(
    "slipMonth",
    month
);

setText(
    "slipFullDay",
    fullDay
);

setText(
    "slipHalfDay",
    halfDay
);

setText(
    "slipPaidLeave",
    paidLeave
);

setText(
    "slipAbsent",
    absent
);

setText(
    "slipOvertime",
    overtime.toFixed(2) +
    " Hrs"
);

setText(
    "slipBasicSalary",
    "₹" +
    formatMoney(
        earnedSalary
    )
);

setText(
    "slipBonus",
    "₹" +
    formatMoney(
        bonus
    )
);

setText(
    "slipAdvance",
    "₹" +
    formatMoney(
        advance
    )
);

setText(
    "slipDeduction",
    "₹" +
    formatMoney(
        deduction
    )
);

setText(
    "slipNetSalary",
    "₹" +
    formatMoney(
        netSalary
    )
);


const container =
    document.getElementById(
        "salarySlipContainer"
    );

if (container) {

    container.classList.remove(
        "hidden"
    );

}

}

/* =========================================================
REPORT EVENTS
========================================================= */

function setupReportEvents() {

const generate =
    document.getElementById(
        "generateReportBtn"
    );

if (generate) {

    generate.onclick =
        generateReport;

}


const exportButton =
    document.getElementById(
        "exportReportBtn"
    );

if (exportButton) {

    exportButton.onclick =
        exportReport;

}

}

/* =========================================================
REPORT
========================================================= */

function generateReport() {

const type =
    getValue(
        "reportType"
    );


const month =
    getValue(
        "reportMonth"
    );


const head =
    document.getElementById(
        "reportHead"
    );


const body =
    document.getElementById(
        "reportBody"
    );


if (!head || !body) return;


if (type === "attendance") {

    head.innerHTML = `

        <tr>

            <th>Employee</th>

            <th>Full Day</th>

            <th>Half Day</th>

            <th>Paid Leave</th>

            <th>Absent</th>

            <th>Unpaid Leave</th>

        </tr>

    `;


    currentReportData =
        employees.map(
            employee => {

                const records =
                    getMonthlyRecords(
                        employee.id,
                        month
                    );


                return {

                    Employee:
                        employee.name,

                    "Full Day":
                        countStatus(
                            records,
                            "Full Day"
                        ),

                    "Half Day":
                        countStatus(
                            records,
                            "Half Day"
                        ),

                    "Paid Leave":
                        countStatus(
                            records,
                            "Paid Leave"
                        ),

                    Absent:
                        countStatus(
                            records,
                            "Absent"
                        ),

                    "Unpaid Leave":
                        countStatus(
                            records,
                            "Unpaid Leave"
                        )

                };

            }
        );


    body.innerHTML =
        currentReportData.map(
            row => `

            <tr>

                <td>
                    ${safe(row.Employee)}
                </td>

                <td>
                    ${row["Full Day"]}
                </td>

                <td>
                    ${row["Half Day"]}
                </td>

                <td>
                    ${row["Paid Leave"]}
                </td>

                <td>
                    ${row.Absent}
                </td>

                <td>
                    ${row["Unpaid Leave"]}
                </td>

            </tr>

            `
        ).join("");

}


if (type === "late") {

    head.innerHTML = `

        <tr>

            <th>Employee</th>

            <th>Date</th>

            <th>Check In</th>

            <th>Late Minutes</th>

        </tr>

    `;


    currentReportData = [];


    attendance.forEach(
        record => {

            if (
                !record.date.startsWith(
                    month
                )
            ) return;


            const late =
                calculateLate(
                    record.checkIn
                );


            if (late <= 0) return;


            const employee =
                employees.find(
                    e =>
                        e.id ===
                        record.employeeId
                );


            currentReportData.push({

                Employee:
                    employee?.name ||
                    "Unknown",

                Date:
                    record.date,

                "Check In":
                    record.checkIn,

                "Late Minutes":
                    late

            });

        }
    );


    body.innerHTML =
        currentReportData.map(
            row => `

            <tr>

                <td>
                    ${safe(row.Employee)}
                </td>

                <td>
                    ${row.Date}
                </td>

                <td>
                    ${row["Check In"]}
                </td>

                <td>
                    ${row["Late Minutes"]} min
                </td>

            </tr>

            `
        ).join("");

}


if (type === "overtime") {

    head.innerHTML = `

        <tr>

            <th>Employee</th>

            <th>Date</th>

            <th>Check Out</th>

            <th>Overtime</th>

        </tr>

    `;


    currentReportData = [];


    attendance.forEach(
        record => {

            if (
                !record.date.startsWith(
                    month
                )
            ) return;


            const overtime =
                calculateOvertime(
                    record.checkIn,
                    record.checkOut
                );


            if (
                overtime <= 0
            ) return;


            const employee =
                employees.find(
                    e =>
                        e.id ===
                        record.employeeId
                );


            currentReportData.push({

                Employee:
                    employee?.name ||
                    "Unknown",

                Date:
                    record.date,

                "Check Out":
                    record.checkOut,

                Overtime:
                    overtime.toFixed(2)

            });

        }
    );


    body.innerHTML =
        currentReportData.map(
            row => `

            <tr>

                <td>
                    ${safe(row.Employee)}
                </td>

                <td>
                    ${row.Date}
                </td>

                <td>
                    ${row["Check Out"]}
                </td>

                <td>
                    ${row.Overtime} Hrs
                </td>

            </tr>

            `
        ).join("");

}


if (type === "salary") {

    head.innerHTML = `

        <tr>

            <th>Employee</th>

            <th>Basic Salary</th>

            <th>Earned Salary</th>

            <th>Bonus</th>

            <th>Deduction</th>

            <th>Net Salary</th>

        </tr>

    `;


    currentReportData =
        employees.map(
            employee => {

                const records =
                    getMonthlyRecords(
                        employee.id,
                        month
                    );


                const full =
                    countStatus(
                        records,
                        "Full Day"
                    );


                const half =
                    countStatus(
                        records,
                        "Half Day"
                    );


                const paid =
                    countStatus(
                        records,
                        "Paid Leave"
                    );


                const perDay =
                    employee.monthlySalary /
                    daysInMonth(
                        month
                    );


                const earned =
                    perDay *
                    (
                        full +
                        half * 0.5 +
                        paid
                    );


                const payroll =
                    payrollData.find(
                        p =>

                            p.employeeId ===
                            employee.id

                            &&

                            p.month ===
                            month
                    );


                const bonus =
                    Number(
                        payroll?.bonus || 0
                    );


                const deduction =
                    Number(
                        payroll?.deduction || 0
                    );


                const net =
                    earned +
                    bonus -
                    deduction;


                return {

                    Employee:
                        employee.name,

                    "Basic Salary":
                        employee.monthlySalary,

                    "Earned Salary":
                        earned,

                    Bonus:
                        bonus,

                    Deduction:
                        deduction,

                    "Net Salary":
                        net

                };

            }
        );


    body.innerHTML =
        currentReportData.map(
            row => `

            <tr>

                <td>
                    ${safe(row.Employee)}
                </td>

                <td>
                    ₹${formatMoney(
                        row["Basic Salary"]
                    )}
                </td>

                <td>
                    ₹${formatMoney(
                        row["Earned Salary"]
                    )}
                </td>

                <td>
                    ₹${formatMoney(
                        row.Bonus
                    )}
                </td>

                <td>
                    ₹${formatMoney(
                        row.Deduction
                    )}
                </td>

                <td>
                    <strong>
                        ₹${formatMoney(
                            row["Net Salary"]
                        )}
                    </strong>
                </td>

            </tr>

            `
        ).join("");

}

}

/* =========================================================
EXPORT REPORT
========================================================= */

function exportReport() {

if (
    !currentReportData.length
) {

    alert(
        "Generate a report first."
    );

    return;

}


const headers =
    Object.keys(
        currentReportData[0]
    );


const rows =
    currentReportData.map(
        row =>

            headers.map(
                header =>
                    csvEscape(
                        row[header]
                    )
            ).join(",")

    );


const csv =

    headers
        .map(
            csvEscape
        )
        .join(",")
        +

    "\n" +

    rows.join(
        "\n"
    );


downloadCSV(
    csv,
    "employee-report.csv"
);

}

/* =========================================================
SETTINGS
========================================================= */

function setupSettingsEvents() {

const form =
    document.getElementById(
        "settingsForm"
    );

if (form) {

    form.addEventListener(
        "submit",
        saveSettings
    );

}

}

function loadSettingsForm() {

setValue(
    "officeStartTime",
    settings.officeStartTime
);

setValue(
    "officeEndTime",
    settings.officeEndTime
);

setValue(
    "gracePeriod",
    settings.gracePeriod
);

setValue(
    "weeklyOff",
    settings.weeklyOff
);

setValue(
    "overtimeRate",
    settings.overtimeRate
);

}

function saveSettings(event) {

event.preventDefault();


settings = {

    officeStartTime:
        getValue(
            "officeStartTime"
        ),

    officeEndTime:
        getValue(
            "officeEndTime"
        ),

    gracePeriod:
        Number(
            getValue(
                "gracePeriod"
            )
        ) || 0,

    weeklyOff:
        Number(
            getValue(
                "weeklyOff"
            )
        ),

    overtimeRate:
        Number(
            getValue(
                "overtimeRate"
            )
        ) || 0

};


saveAll();

alert(
    "Settings saved successfully."
);


renderAll();

}

/* =========================================================
BACKUP
========================================================= */

function setupBackupEvents() {

const exportButton =
    document.getElementById(
        "exportBackupBtn"
    );

if (exportButton) {

    exportButton.onclick =
        exportBackup;

}


const importInput =
    document.getElementById(
        "importBackupInput"
    );

if (importInput) {

    importInput.addEventListener(
        "change",
        importBackup
    );

}


const reset =
    document.getElementById(
        "resetDataBtn"
    );

if (reset) {

    reset.onclick =
        resetAllData;

}

}

/* =========================================================
EXPORT BACKUP
========================================================= */

function exportBackup() {

const backup = {

    version:
        "3.0",

    exportedAt:
        new Date()
            .toISOString(),

    employees,

    attendance,

    leaves,

    settings,

    payrollData

};


const json =
    JSON.stringify(
        backup,
        null,
        2
    );


const blob =
    new Blob(
        [json],
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


a.href =
    url;

a.download =
    "employee-pro-backup-" +
    getToday() +
    ".json";


document.body.appendChild(
    a
);


a.click();


a.remove();


URL.revokeObjectURL(
    url
);

}

/* =========================================================
IMPORT BACKUP
========================================================= */

function importBackup(event) {

const file =
    event.target.files[0];


if (!file) return;


const reader =
    new FileReader();


reader.onload =
    function () {

        try {

            const backup =
                JSON.parse(
                    reader.result
                );


            if (
                !confirm(
                    "Import backup and replace current data?"
                )
            ) {

                return;

            }


            employees =
                Array.isArray(
                    backup.employees
                )
                    ?
                backup.employees
                    :
                [];


            attendance =
                Array.isArray(
                    backup.attendance
                )
                    ?
                backup.attendance
                    :
                [];


            leaves =
                Array.isArray(
                    backup.leaves
                )
                    ?
                backup.leaves
                    :
                [];


            settings =
                backup.settings ||
                settings;


            payrollData =
                Array.isArray(
                    backup.payrollData
                )
                    ?
                backup.payrollData
                    :
                [];


            saveAll();

            loadSettingsForm();

            renderAll();

            alert(
                "Backup imported successfully."
            );


        } catch (error) {

            alert(
                "Invalid backup file."
            );

        }

    };


reader.readAsText(
    file
);

}

/* =========================================================
RESET DATA
========================================================= */

function resetAllData() {

const confirmation =
    prompt(
        "Type RESET to delete all data."
    );


if (
    confirmation !==
    "RESET"
) {

    return;

}


employees = [];

attendance = [];

leaves = [];

payrollData = [];


saveAll();

renderAll();


alert(
    "All data has been deleted."
);

}

/* =========================================================
DASHBOARD
========================================================= */

function updateDashboard() {

const today =
    getToday();


const records =
    attendance.filter(
        r =>
            r.date === today
    );


setText(
    "totalEmployees",
    employees.length
);


setText(
    "presentToday",
    countStatus(
        records,
        "Full Day"
    )
);


setText(
    "halfDayToday",
    countStatus(
        records,
        "Half Day"
    )
);


setText(
    "absentToday",
    employees.length -
    records.filter(
        r =>
            r.status !==
            "Absent"
    ).length
);


setText(
    "leaveToday",

    countStatus(
        records,
        "Paid Leave"
    )

    +

    countStatus(
        records,
        "Unpaid Leave"
    )
);


let late =
    0;

let overtime =
    0;


records.forEach(
    record => {

        late +=
            calculateLate(
                record.checkIn
            );


        overtime +=
            calculateOvertime(
                record.checkIn,
                record.checkOut
            );

    }
);


setText(
    "lateToday",
    late > 0
        ?
    records.filter(
        r =>
            calculateLate(
                r.checkIn
            ) > 0
    ).length
        :
    0
);


setText(
    "overtimeToday",
    overtime > 0
        ?
    overtime.toFixed(2)
        :
    0
);


let monthlyPayroll =
    0;


const month =
    getCurrentMonth();


employees.forEach(
    employee => {

        const records =
            getMonthlyRecords(
                employee.id,
                month
            );


        const full =
            countStatus(
                records,
                "Full Day"
            );


        const half =
            countStatus(
                records,
                "Half Day"
            );


        const paid =
            countStatus(
                records,
                "Paid Leave"
            );


        const perDay =
            employee.monthlySalary /
            daysInMonth(
                month
            );


        monthlyPayroll +=

            perDay *
            (
                full +
                half * 0.5 +
                paid
            );

    }
);


setText(
    "monthlyPayroll",
    "₹" +
    formatMoney(
        monthlyPayroll
    )
);


renderDashboardAttendance();

}

/* =========================================================
DASHBOARD ATTENDANCE
========================================================= */

function renderDashboardAttendance() {

const table =
    document.getElementById(
        "dashboardAttendance"
    );


if (!table) return;


if (!employees.length) {

    table.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="empty"
            >

                No employees found.

            </td>

        </tr>

    `;

    return;

}


table.innerHTML =
    employees.map(
        employee => {

            const record =
                getAttendance(
                    employee.id,
                    getToday()
                );


            const status =
                record?.status ||
                "Absent";


            const working =
                record
                    ?
                calculateWorkingHours(
                    record.checkIn,
                    record.checkOut
                )
                    :
                0;


            return `

            <tr>

                <td>
                    ${safe(
                        employee.id
                    )}
                </td>

                <td>
                    ${safe(
                        employee.name
                    )}
                </td>

                <td>
                    ${record?.checkIn || "-"}
                </td>

                <td>
                    ${record?.checkOut || "-"}
                </td>

                <td>
                    ${working.toFixed(2)}
                    Hrs
                </td>

                <td>

                    <span
                        class="status-badge
                        ${statusClass(
                            status
                        )}"
                    >

                        ${status}

                    </span>

                </td>

            </tr>

            `;

        }
    ).join("");

}

/* =========================================================
POPULATE EMPLOYEE SELECT
========================================================= */

function populateEmployeeSelect(
selectId
) {

const select =
    document.getElementById(
        selectId
    );


if (!select) return;


const current =
    select.value;


select.innerHTML = `

    <option value="">
        Select Employee
    </option>

    ${
        employees.map(
            employee =>

                `<option value="${escapeAttr(employee.id)}">
                    ${safe(employee.name)}
                    (${safe(employee.id)})
                </option>`

        ).join("")
    }

`;


select.value =
    current;

}

/* =========================================================
STATUS CLASS
========================================================= */

function statusClass(status) {

const classes = {

    "Full Day":
        "status-full",

    "Half Day":
        "status-half",

    "Absent":
        "status-absent",

    "Paid Leave":
        "status-paid",

    "Unpaid Leave":
        "status-unpaid",

    "Holiday":
        "status-holiday",

    "Weekly Off":
        "status-weekoff"

};


return classes[status] ||
    "status-absent";

}

/* =========================================================
RENDER ALL
========================================================= */

function renderAll() {

renderDepartmentFilter();

renderEmployees();

renderCalendar();

renderAttendanceDetails();

renderLeaves();

populateEmployeeSelect(
    "salaryEmployeeSelect"
);

populateEmployeeSelect(
    "leaveEmployee"
);

updateDashboard();

}

/* =========================================================
HELPERS
========================================================= */

function countStatus(
records,
status
) {

return records.filter(
    record =>
        record.status ===
        status
).length;

}

function getMonthlyRecords(
employeeId,
month
) {

return attendance.filter(
    record =>

        record.employeeId ===
        employeeId

        &&

        record.date.startsWith(
            month
        )
);

}

function setText(
id,
value
) {

const element =
    document.getElementById(
        id
    );


if (element) {

    element.textContent =
        value;

}

}

function setValue(
id,
value
) {

const element =
    document.getElementById(
        id
    );


if (element) {

    element.value =
        value;

}

}

function getValue(
id
) {

const element =
    document.getElementById(
        id
    );


return element
    ?
element.value
    :
"";

}

function showModal(
id
) {

const modal =
    document.getElementById(
        id
    );


if (modal) {

    modal.classList.add(
        "show"
    );

}

}

function hideModal(
id
) {

const modal =
    document.getElementById(
        id
    );


if (modal) {

    modal.classList.remove(
        "show"
    );

}

}

function formatMoney(
value
) {

return Number(
    value || 0
).toLocaleString(
    "en-IN",
    {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }
);

}

function safe(
value
) {

const div =
    document.createElement(
        "div"
    );


div.textContent =
    String(
        value ??
        ""
    );


return div.innerHTML;

}

function escapeAttr(
value
) {

return String(
    value
)
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    );

}

function csvEscape(
value
) {

return `"${String(
    value ??
    ""
).replace(
    /"/g,
    '""'
)}"`;

}

function downloadCSV(
csv,
filename
) {

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
    filename;


document.body.appendChild(
    link
);


link.click();


link.remove();


URL.revokeObjectURL(
    url
);

}

/* =========================================================
GLOBAL ACCESS
Needed for inline HTML onclick buttons
========================================================= */

window.editEmployee =
editEmployee;

window.deleteEmployee =
deleteEmployee;

window.deleteLeave =
deleteLeave;

window.openAttendanceModal =
openAttendanceModal;

window.updatePayrollValue =
updatePayrollValue;

window.generateSalarySlipFor =
generateSalarySlipFor;
/* =========================================================
EMPLOYEE PRO
FIREBASE FIRESTORE CONNECTED VERSION
No Login Required
========================================================= */

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
apiKey: "AIzaSyDR6Ab5X3PelrvdAjLhPsCi_n4Qi6MHf-o",
authDomain: "employee-attendance-syst-33351.firebaseapp.com",
projectId: "employee-attendance-syst-33351",
storageBucket: "employee-attendance-syst-33351.firebasestorage.app",
messagingSenderId: "672059529814",
appId: "1:672059529814:web:971eefee24b9a2ba33b9f7"
};

/* ================= FIREBASE INITIALIZE ================= */

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

console.log("Firebase Connected Successfully");

/* ================= COLLECTIONS ================= */

const EMPLOYEES = "employees";
const ATTENDANCE = "attendance";
const LEAVES = "leaves";
const SETTINGS = "settings";

/* ================= GLOBAL DATA ================= */

let employees = [];
let attendanceData = [];
let leaves = [];

let currentCalendarDate = new Date();
let selectedAttendanceDate = null;

let settings = {
officeStartTime: "09:00",
officeEndTime: "18:00",
gracePeriod: 15,
weeklyOff: 0,
overtimeRate: 100
};

/* =========================================================
HELPER FUNCTIONS
========================================================= */

function $(id) {
return document.getElementById(id);
}

function todayString() {
return new Date().toISOString().split("T")[0];
}

function formatDate(date) {
if (!date) return "";

const d = new Date(date + "T00:00:00");

return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
});

}

function formatCurrency(amount) {
return "" + Number(amount || 0).toLocaleString("en-IN");
}

function showMessage(message) {
alert(message);
}

function escapeHTML(value) {
if (value === null || value === undefined) return "";

return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

/* =========================================================
FIREBASE CONNECTION STATUS
========================================================= */

function setConnectionStatus(text, type = "") {

const status =
    $("connectionStatus") ||
    document.querySelector("#firebaseStatus") ||
    document.querySelector(".connection-status");

if (!status) return;

status.textContent = text;

status.classList.remove("connected", "error");

if (type) {
    status.classList.add(type);
}

}

/* =========================================================
LOAD ALL DATA
========================================================= */

async function loadAllData() {

try {

    setConnectionStatus(" Connecting...");

    const [
        employeesSnapshot,
        attendanceSnapshot,
        leavesSnapshot,
        settingsSnapshot
    ] = await Promise.all([

        db.collection(EMPLOYEES).get(),

        db.collection(ATTENDANCE).get(),

        db.collection(LEAVES).get(),

        db.collection(SETTINGS).doc("main").get()

    ]);


    employees = employeesSnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));


    attendanceData = attendanceSnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));


    leaves = leavesSnapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));


    if (settingsSnapshot.exists) {

        settings = {
            ...settings,
            ...settingsSnapshot.data()
        };

    }


    setConnectionStatus(" Connected", "connected");


    renderAll();

    console.log("All Firebase data loaded successfully");

} catch (error) {

    console.error("Firebase Load Error:", error);

    setConnectionStatus(" Connection Error", "error");

    alert(
        "Firebase  Data Load  \n\n" +
        "Firestore Rules  Firebase Config  \n\n" +
        error.message
    );

}

}

/* =========================================================
RENDER ALL
========================================================= */

function renderAll() {

renderEmployees();

renderEmployeeSelects();

renderAttendanceCalendar();

renderLeaveTable();

updateDashboard();

loadSettingsForm();

updateCurrentDate();

updatePageTitle();

}

/* =========================================================
PAGE NAVIGATION
========================================================= */

document.querySelectorAll(".nav-item").forEach(button => {

button.addEventListener("click", () => {

    const page = button.dataset.page;

    document.querySelectorAll(".nav-item")
        .forEach(item => item.classList.remove("active"));

    button.classList.add("active");


    document.querySelectorAll(".page")
        .forEach(section => section.classList.remove("active"));


    const target = $(page + "Page");

    if (target) {
        target.classList.add("active");
    }


    updatePageTitle();

});

});

function updatePageTitle() {

const activeButton =
    document.querySelector(".nav-item.active");

if (!activeButton) return;

const text =
    activeButton.textContent
        .replace(/[^\w\s]/gi, "")
        .trim();

if ($("pageTitle")) {
    $("pageTitle").textContent = text;
}

}

/* =========================================================
CURRENT DATE
========================================================= */

function updateCurrentDate() {

if (!$("currentDate")) return;

$("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

}

/* =========================================================
EMPLOYEE MANAGEMENT
========================================================= */

function renderEmployees() {

const table = $("employeeTable");

if (!table) return;

const search =
    ($("employeeSearch")?.value || "")
        .toLowerCase();

const department =
    $("employeeDepartmentFilter")?.value || "";


const filtered = employees.filter(employee => {

    const matchesSearch =
        !search ||
        String(employee.employeeId || "")
            .toLowerCase()
            .includes(search) ||
        String(employee.name || "")
            .toLowerCase()
            .includes(search) ||
        String(employee.phone || "")
            .toLowerCase()
            .includes(search);


    const matchesDepartment =
        !department ||
        employee.department === department;


    return matchesSearch && matchesDepartment;

});


if (!filtered.length) {

    table.innerHTML = `
        <tr>
            <td colspan="9" class="empty-state">
                No Employees Found
            </td>
        </tr>
    `;

    return;

}


table.innerHTML = filtered.map(employee => `

    <tr>

        <td>${escapeHTML(employee.employeeId)}</td>

        <td>
            <strong>${escapeHTML(employee.name)}</strong>
        </td>

        <td>${escapeHTML(employee.phone || "-")}</td>

        <td>${escapeHTML(employee.department || "-")}</td>

        <td>${escapeHTML(employee.designation || "-")}</td>

        <td>${formatCurrency(employee.salary)}</td>

        <td>${formatDate(employee.joiningDate)}</td>

        <td>
            <span class="status-badge ${
                employee.status === "Active"
                ? "status-active"
                : "status-inactive"
            }">
                ${escapeHTML(employee.status || "Active")}
            </span>
        </td>

        <td>

            <button
                class="action-btn edit-btn"
                onclick="editEmployee('${employee.firestoreId}')">
                 Edit
            </button>

            <button
                class="action-btn delete-btn"
                onclick="deleteEmployee('${employee.firestoreId}')">
                 Delete
            </button>

        </td>

    </tr>

`).join("");

}

/* ================= ADD EMPLOYEE BUTTON ================= */

$("addEmployeeBtn")?.addEventListener("click", () => {

$("employeeForm")?.reset();

$("editEmployeeId").value = "";

$("employeeModalTitle").textContent =
    "Add Employee";

$("employeeModal").classList.add("show");

});

/* ================= CLOSE EMPLOYEE MODAL ================= */

function closeEmployeeModal() {

$("employeeModal")?.classList.remove("show");

}

$("closeEmployeeModal")?.addEventListener(
"click",
closeEmployeeModal
);

$("cancelEmployeeBtn")?.addEventListener(
"click",
closeEmployeeModal
);

/* ================= SAVE EMPLOYEE ================= */

$("employeeForm")?.addEventListener(
"submit",
async event => {

    event.preventDefault();


    const firestoreId =
        $("editEmployeeId").value;


    const employee = {

        employeeId:
            $("employeeId").value.trim(),

        name:
            $("employeeName").value.trim(),

        phone:
            $("employeePhone").value.trim(),

        department:
            $("employeeDepartment").value.trim(),

        designation:
            $("employeeDesignation").value.trim(),

        salary:
            Number($("employeeSalary").value || 0),

        joiningDate:
            $("employeeJoinDate").value,

        status:
            $("employeeStatus").value,

        updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };


    if (!employee.employeeId ||
        !employee.name) {

        alert("Employee ID  Name ");

        return;

    }


    try {

        if (firestoreId) {

            await db
                .collection(EMPLOYEES)
                .doc(firestoreId)
                .update(employee);

        } else {

            employee.createdAt =
                firebase.firestore.FieldValue.serverTimestamp();

            await db
                .collection(EMPLOYEES)
                .add(employee);

        }


        closeEmployeeModal();

        await loadAllData();

        alert("Employee Successfully Saved");

    } catch (error) {

        console.error(error);

        alert(
            "Employee Save  :\n" +
            error.message
        );

    }

}

);

/* ================= EDIT EMPLOYEE ================= */

window.editEmployee = function(id) {

const employee =
    employees.find(
        item => item.firestoreId === id
    );

if (!employee) return;


$("editEmployeeId").value =
    employee.firestoreId;

$("employeeId").value =
    employee.employeeId || "";

$("employeeName").value =
    employee.name || "";

$("employeePhone").value =
    employee.phone || "";

$("employeeDepartment").value =
    employee.department || "";

$("employeeDesignation").value =
    employee.designation || "";

$("employeeSalary").value =
    employee.salary || 0;

$("employeeJoinDate").value =
    employee.joiningDate || "";

$("employeeStatus").value =
    employee.status || "Active";


$("employeeModalTitle").textContent =
    "Edit Employee";


$("employeeModal").classList.add("show");

};

/* ================= DELETE EMPLOYEE ================= */

window.deleteEmployee = async function(id) {

const employee =
    employees.find(
        item => item.firestoreId === id
    );

if (!employee) return;


if (!confirm(
    `${employee.name}  Delete  ?`
)) return;


try {

    await db
        .collection(EMPLOYEES)
        .doc(id)
        .delete();


    await loadAllData();

    alert("Employee Deleted");

} catch (error) {

    alert(
        "Delete  :\n" +
        error.message
    );

}

};

/* =========================================================
EMPLOYEE DEPARTMENT FILTER
========================================================= */

function renderDepartmentFilter() {

const select =
    $("employeeDepartmentFilter");

if (!select) return;


const current =
    select.value;


const departments =
    [...new Set(
        employees
            .map(e => e.department)
            .filter(Boolean)
    )];


select.innerHTML =
    `<option value="">All Departments</option>`;


departments.forEach(department => {

    select.innerHTML += `
        <option value="${escapeHTML(department)}">
            ${escapeHTML(department)}
        </option>
    `;

});


select.value = current;

}

$("employeeSearch")?.addEventListener(
"input",
renderEmployees
);

$("employeeDepartmentFilter")?.addEventListener(
"change",
renderEmployees
);

/* =========================================================
ATTENDANCE
========================================================= */

/*
IMPORTANT:
 Attendance document- :

employeeId
employeeName
date
checkIn
checkOut
status
workingHours
late
overtime

  Employee ID- Attendance  

*/

function attendanceDocumentId(employeeId, date) {

return `${employeeId}_${date}`;

}

function calculateWorkingHours(
checkIn,
checkOut
) {

if (!checkIn || !checkOut) {
    return 0;
}


const [inHour, inMinute] =
    checkIn.split(":").map(Number);

const [outHour, outMinute] =
    checkOut.split(":").map(Number);


let start =
    inHour * 60 + inMinute;

let end =
    outHour * 60 + outMinute;


if (end < start) {
    end += 24 * 60;
}


return Number(
    ((end - start) / 60).toFixed(2)
);

}

function calculateLate(checkIn) {

if (!checkIn) return 0;


const [hour, minute] =
    checkIn.split(":").map(Number);


const [officeHour, officeMinute] =
    settings.officeStartTime
        .split(":")
        .map(Number);


const checkInMinutes =
    hour * 60 + minute;

const officeMinutes =
    officeHour * 60 + officeMinute;


const late =
    checkInMinutes -
    officeMinutes -
    Number(settings.gracePeriod || 0);


return Math.max(0, late);

}

function calculateOvertime(
checkOut
) {

if (!checkOut) return 0;


const [hour, minute] =
    checkOut.split(":").map(Number);


const [officeHour, officeMinute] =
    settings.officeEndTime
        .split(":")
        .map(Number);


const checkoutMinutes =
    hour * 60 + minute;

const officeEndMinutes =
    officeHour * 60 + officeMinute;


if (checkoutMinutes <= officeEndMinutes) {
    return 0;
}


return Number(
    (
        (checkoutMinutes -
            officeEndMinutes) / 60
    ).toFixed(2)
);

}

/* ================= CALENDAR ================= */

function renderAttendanceCalendar() {

const calendar =
    $("attendanceCalendar");

if (!calendar) return;


const year =
    currentCalendarDate.getFullYear();

const month =
    currentCalendarDate.getMonth();


const firstDay =
    new Date(year, month, 1).getDay();

const daysInMonth =
    new Date(year, month + 1, 0).getDate();


$("calendarTitle").textContent =
    new Date(year, month, 1)
        .toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric"
        });


calendar.innerHTML = "";


for (
    let i = 0;
    i < firstDay;
    i++
) {

    calendar.innerHTML +=
        `<div class="calendar-day empty"></div>`;

}


for (
    let day = 1;
    day <= daysInMonth;
    day++
) {

    const date =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


    const today =
        date === todayString();


    const records =
        attendanceData.filter(
            item => item.date === date
        );


    const fullDay =
        records.filter(
            item => item.status === "Full Day"
        ).length;


    const halfDay =
        records.filter(
            item => item.status === "Half Day"
        ).length;


    const absent =
        records.filter(
            item => item.status === "Absent"
        ).length;


    calendar.innerHTML += `

        <div
            class="calendar-day ${
                today ? "today" : ""
            }"
            onclick="selectAttendanceDate('${date}')">

            <div class="calendar-day-number">
                ${day}
            </div>

            <div class="calendar-day-status">

                 ${fullDay}
                 ${halfDay}
                 ${absent}

            </div>

        </div>

    `;

}

}

/* ================= SELECT DATE ================= */

window.selectAttendanceDate = function(date) {

selectedAttendanceDate = date;

$("attendanceDetails")
    ?.classList.remove("hidden");

$("selectedDateTitle").textContent =
    `Attendance - ${formatDate(date)}`;


renderAttendanceTable(date);

};

/* ================= ATTENDANCE TABLE ================= */

function renderAttendanceTable(date) {

const table =
    $("attendanceTable");

if (!table) return;


table.innerHTML =
    employees.map(employee => {

        const record =
            attendanceData.find(item =>
                item.employeeId ===
                    employee.employeeId &&
                item.date === date
            );


        const checkIn =
            record?.checkIn || "";

        const checkOut =
            record?.checkOut || "";

        const status =
            record?.status ||
            "Absent";


        return `

            <tr>

                <td>
                    ${escapeHTML(employee.employeeId)}
                </td>

                <td>
                    ${escapeHTML(employee.name)}
                </td>

                <td>
                    ${checkIn || "-"}
                </td>

                <td>
                    ${checkOut || "-"}
                </td>

                <td>
                    ${record?.workingHours || 0} Hrs
                </td>

                <td>
                    <span class="status-badge">
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td>
                    ${record?.late || 0} Min
                </td>

                <td>
                    ${record?.overtime || 0} Hrs
                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="openAttendanceModal(
                            '${employee.employeeId}',
                            '${date}'
                        )">

                         Update

                    </button>

                </td>

            </tr>

        `;

    }).join("");

}

/* ================= ATTENDANCE MODAL ================= */

window.openAttendanceModal =
function(employeeId, date) {

const employee =
    employees.find(
        item =>
            item.employeeId === employeeId
    );

if (!employee) return;


const record =
    attendanceData.find(item =>
        item.employeeId === employeeId &&
        item.date === date
    );


$("attendanceEmployeeId").value =
    employeeId;

$("attendanceDate").value =
    date;

$("attendanceEmployeeName").value =
    employee.name;

$("checkInTime").value =
    record?.checkIn || "";

$("checkOutTime").value =
    record?.checkOut || "";

$("attendanceStatus").value =
    record?.status || "Full Day";


$("attendanceModal")
    .classList.add("show");

};

/* ================= CLOSE ATTENDANCE MODAL ================= */

function closeAttendanceModal() {

$("attendanceModal")
    ?.classList.remove("show");

}

$("closeAttendanceModal")?.addEventListener(
"click",
closeAttendanceModal
);

$("cancelAttendanceBtn")?.addEventListener(
"click",
closeAttendanceModal
);

/* ================= SAVE ATTENDANCE ================= */

$("attendanceForm")?.addEventListener(
"submit",
async event => {

    event.preventDefault();


    const employeeId =
        $("attendanceEmployeeId").value;

    const date =
        $("attendanceDate").value;

    const checkIn =
        $("checkInTime").value;

    const checkOut =
        $("checkOutTime").value;

    const status =
        $("attendanceStatus").value;


    const employee =
        employees.find(
            item =>
                item.employeeId === employeeId
        );


    if (!employee) return;


    const data = {

        employeeId,

        employeeName:
            employee.name,

        date,

        checkIn,

        checkOut,

        status,

        workingHours:
            calculateWorkingHours(
                checkIn,
                checkOut
            ),

        late:
            calculateLate(checkIn),

        overtime:
            calculateOvertime(checkOut),

        updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };


    try {

        await db
            .collection(ATTENDANCE)
            .doc(
                attendanceDocumentId(
                    employeeId,
                    date
                )
            )
            .set(
                data,
                { merge: true }
            );


        closeAttendanceModal();

        await loadAllData();

        if (selectedAttendanceDate) {

            renderAttendanceTable(
                selectedAttendanceDate
            );

        }


    } catch (error) {

        alert(
            "Attendance Save  :\n" +
            error.message
        );

    }

}

);

/* ================= PREVIOUS MONTH ================= */

$("previousMonth")?.addEventListener(
"click",
() => {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() - 1
    );

    renderAttendanceCalendar();

}

);

/* ================= NEXT MONTH ================= */

$("nextMonth")?.addEventListener(
"click",
() => {

    currentCalendarDate.setMonth(
        currentCalendarDate.getMonth() + 1
    );

    renderAttendanceCalendar();

}

);

/* ================= MARK ALL PRESENT ================= */

$("markAllPresentBtn")?.addEventListener(
"click",
async () => {

    const date =
        selectedAttendanceDate ||
        todayString();


    if (!employees.length) {

        alert("No Employees Found");

        return;

    }


    if (!confirm(
        `${formatDate(date)}   Employee- Full Day  ?`
    )) return;


    try {

        const batch =
            db.batch();


        employees.forEach(employee => {

            const ref =
                db
                    .collection(ATTENDANCE)
                    .doc(
                        attendanceDocumentId(
                            employee.employeeId,
                            date
                        )
                    );


            batch.set(
                ref,
                {

                    employeeId:
                        employee.employeeId,

                    employeeName:
                        employee.name,

                    date,

                    checkIn:
                        settings.officeStartTime,

                    checkOut:
                        settings.officeEndTime,

                    status:
                        "Full Day",

                    workingHours:
                        calculateWorkingHours(
                            settings.officeStartTime,
                            settings.officeEndTime
                        ),

                    late: 0,

                    overtime: 0,

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                },
                { merge: true }
            );

        });


        await batch.commit();

        await loadAllData();

        selectAttendanceDate(date);

    } catch (error) {

        alert(
            "Attendance Update Error:\n" +
            error.message
        );

    }

}

);

/* =========================================================
LEAVE MANAGEMENT
========================================================= */

function renderLeaveTable() {

const table =
    $("leaveTable");

if (!table) return;


if (!leaves.length) {

    table.innerHTML = `
        <tr>
            <td colspan="8"
                class="empty-state">
                No Leave Records
            </td>
        </tr>
    `;

    return;

}


table.innerHTML =
    leaves.map(leave => `

        <tr>

            <td>
                ${escapeHTML(
                    leave.employeeName || ""
                )}
            </td>

            <td>
                ${escapeHTML(
                    leave.leaveType || ""
                )}
            </td>

            <td>
                ${formatDate(leave.from)}
            </td>

            <td>
                ${formatDate(leave.to)}
            </td>

            <td>
                ${leave.days || 0}
            </td>

            <td>
                ${escapeHTML(
                    leave.reason || "-"
                )}
            </td>

            <td>
                <span class="status-badge status-paid-leave">
                    Approved
                </span>
            </td>

            <td>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteLeave('${leave.firestoreId}')">

                     Delete

                </button>

            </td>

        </tr>

    `).join("");

}

/* ================= EMPLOYEE SELECTS ================= */

function renderEmployeeSelects() {

const selects = [

    $("leaveEmployee"),

    $("salaryEmployeeSelect")

];


selects.forEach(select => {

    if (!select) return;


    const current =
        select.value;


    select.innerHTML = `

        <option value="">
            Select Employee
        </option>

    `;


    employees.forEach(employee => {

        select.innerHTML += `

            <option
                value="${escapeHTML(
                    employee.employeeId
                )}">

                ${escapeHTML(
                    employee.employeeId
                )}
                -
                ${escapeHTML(
                    employee.name
                )}

            </option>

        `;

    });


    select.value = current;

});


renderDepartmentFilter();

}

/* ================= ADD LEAVE ================= */

$("addLeaveBtn")?.addEventListener(
"click",
() => {

    $("leaveForm")?.reset();

    $("leaveModal")
        .classList.add("show");

}

);

/* ================= CLOSE LEAVE ================= */

function closeLeaveModal() {

$("leaveModal")
    ?.classList.remove("show");

}

$("closeLeaveModal")?.addEventListener(
"click",
closeLeaveModal
);

$("cancelLeaveBtn")?.addEventListener(
"click",
closeLeaveModal
);

/* ================= SAVE LEAVE ================= */

$("leaveForm")?.addEventListener(
"submit",
async event => {

    event.preventDefault();


    const employeeId =
        $("leaveEmployee").value;

    const employee =
        employees.find(
            item =>
                item.employeeId ===
                employeeId
        );


    if (!employee) {

        alert("Employee Select ");

        return;

    }


    const from =
        $("leaveFrom").value;

    const to =
        $("leaveTo").value;


    const days =
        Math.floor(
            (
                new Date(to) -
                new Date(from)
            ) /
            (1000 * 60 * 60 * 24)
        ) + 1;


    const leave = {

        employeeId,

        employeeName:
            employee.name,

        leaveType:
            $("leaveType").value,

        from,

        to,

        days:

            days > 0
                ? days
                : 0,

        reason:
            $("leaveReason").value.trim(),

        status:
            "Approved",

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };


    try {

        await db
            .collection(LEAVES)
            .add(leave);


        closeLeaveModal();

        await loadAllData();

    } catch (error) {

        alert(
            "Leave Save  :\n" +
            error.message
        );

    }

}

);

/* ================= DELETE LEAVE ================= */

window.deleteLeave = async function(id) {

if (!confirm(
    " Leave Delete  ?"
)) return;


try {

    await db
        .collection(LEAVES)
        .doc(id)
        .delete();


    await loadAllData();

} catch (error) {

    alert(error.message);

}

};

/* =========================================================
DASHBOARD
========================================================= */

function updateDashboard() {

const today =
    todayString();


const todayRecords =
    attendanceData.filter(
        item =>
            item.date === today
    );


const present =
    todayRecords.filter(
        item =>
            item.status === "Full Day"
    ).length;


const halfDay =
    todayRecords.filter(
        item =>
            item.status === "Half Day"
    ).length;


const absent =
    employees.length -
    todayRecords.filter(
        item =>
            [
                "Full Day",
                "Half Day",
                "Paid Leave",
                "Unpaid Leave",
                "Holiday",
                "Weekly Off"
            ].includes(item.status)
    ).length;


const leave =
    todayRecords.filter(
        item =>
            [
                "Paid Leave",
                "Unpaid Leave"
            ].includes(item.status)
    ).length;


const late =
    todayRecords.filter(
        item =>
            Number(item.late || 0) > 0
    ).length;


const overtime =
    todayRecords.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(
                item.overtime || 0
            ),
        0
    );


if ($("totalEmployees"))
    $("totalEmployees").textContent =
        employees.length;


if ($("presentToday"))
    $("presentToday").textContent =
        present;


if ($("halfDayToday"))
    $("halfDayToday").textContent =
        halfDay;


if ($("absentToday"))
    $("absentToday").textContent =
        Math.max(0, absent);


if ($("leaveToday"))
    $("leaveToday").textContent =
        leave;


if ($("lateToday"))
    $("lateToday").textContent =
        late;


if ($("overtimeToday"))
    $("overtimeToday").textContent =
        overtime.toFixed(2) +
        " Hrs";


renderDashboardAttendance(
    today
);

}

/* ================= DASHBOARD ATTENDANCE ================= */

function renderDashboardAttendance(date) {

const table =
    $("dashboardAttendance");

if (!table) return;


table.innerHTML =
    employees.map(employee => {

        const record =
            attendanceData.find(item =>
                item.employeeId ===
                    employee.employeeId &&
                item.date === date
            );


        return `

            <tr>

                <td>
                    ${escapeHTML(
                        employee.employeeId
                    )}
                </td>

                <td>
                    ${escapeHTML(
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
                    ${record?.workingHours || 0}
                    Hrs
                </td>

                <td>
                    ${record?.status || "Absent"}
                </td>

            </tr>

        `;

    }).join("");

}

/* =========================================================
SETTINGS
========================================================= */

function loadSettingsForm() {

if ($("officeStartTime"))
    $("officeStartTime").value =
        settings.officeStartTime;


if ($("officeEndTime"))
    $("officeEndTime").value =
        settings.officeEndTime;


if ($("gracePeriod"))
    $("gracePeriod").value =
        settings.gracePeriod;


if ($("weeklyOff"))
    $("weeklyOff").value =
        settings.weeklyOff;


if ($("overtimeRate"))
    $("overtimeRate").value =
        settings.overtimeRate;

}

$("settingsForm")?.addEventListener(
"submit",
async event => {

    event.preventDefault();


    settings = {

        officeStartTime:
            $("officeStartTime").value,

        officeEndTime:
            $("officeEndTime").value,

        gracePeriod:
            Number(
                $("gracePeriod").value || 0
            ),

        weeklyOff:
            Number(
                $("weeklyOff").value
            ),

        overtimeRate:
            Number(
                $("overtimeRate").value || 0
            )

    };


    try {

        await db
            .collection(SETTINGS)
            .doc("main")
            .set(
                settings,
                { merge: true }
            );


        alert(
            "Settings Successfully Saved"
        );

    } catch (error) {

        alert(
            "Settings Save Error:\n" +
            error.message
        );

    }

}

);

/* =========================================================
PAYROLL
========================================================= */

function calculateEmployeePayroll(
employee,
month
) {

const records =
    attendanceData.filter(item =>

        item.employeeId ===
            employee.employeeId &&

        item.date &&
        item.date.startsWith(month)

    );


const fullDay =
    records.filter(
        item =>
            item.status === "Full Day"
    ).length;


const halfDay =
    records.filter(
        item =>
            item.status === "Half Day"
    ).length;


const paidLeave =
    records.filter(
        item =>
            item.status === "Paid Leave"
    ).length;


const absent =
    records.filter(
        item =>
            item.status === "Absent"
    ).length;


const overtime =
    records.reduce(
        (
            total,
            item
        ) =>
            total +
            Number(
                item.overtime || 0
            ),
        0
    );


const basicSalary =
    Number(
        employee.salary || 0
    );


const overtimePay =
    overtime *
    Number(
        settings.overtimeRate || 0
    );


const netSalary =
    basicSalary +
    overtimePay;


return {

    employee,

    fullDay,

    halfDay,

    paidLeave,

    absent,

    overtime,

    basicSalary,

    overtimePay,

    bonus: 0,

    advance: 0,

    deduction: 0,

    netSalary

};

}

/* ================= CALCULATE PAYROLL ================= */

$("calculatePayrollBtn")?.addEventListener(
"click",
() => {

    const month =
        $("payrollMonth").value;


    if (!month) {

        alert("Month Select ");

        return;

    }


    renderPayroll(month);

}

);

function renderPayroll(month) {

const table =
    $("payrollTable");

if (!table) return;


const results =
    employees.map(
        employee =>
            calculateEmployeePayroll(
                employee,
                month
            )
    );


let totalPayroll = 0;

let totalOvertime = 0;


table.innerHTML =
    results.map(result => {

        totalPayroll +=
            result.netSalary;

        totalOvertime +=
            result.overtime;


        return `

            <tr>

                <td>
                    ${escapeHTML(
                        result.employee.name
                    )}
                </td>

                <td>
                    ${formatCurrency(
                        result.basicSalary
                    )}
                </td>

                <td>
                    ${result.fullDay}
                </td>

                <td>
                    ${result.halfDay}
                </td>

                <td>
                    ${result.paidLeave}
                </td>

                <td>
                    ${result.absent}
                </td>

                <td>
                    ${result.overtime.toFixed(2)}
                    Hrs
                </td>

                <td>
                    ${formatCurrency(
                        result.bonus
                    )}
                </td>

                <td>
                    ${formatCurrency(
                        result.advance
                    )}
                </td>

                <td>
                    ${formatCurrency(
                        result.deduction
                    )}
                </td>

                <td>
                    <strong>
                        ${formatCurrency(
                            result.netSalary
                        )}
                    </strong>
                </td>

                <td>
                    <button
                        class="action-btn view-btn"
                        onclick="generateSalarySlipFor(
                            '${result.employee.employeeId}',
                            '${month}'
                        )">
                         Slip
                    </button>
                </td>

            </tr>

        `;

    }).join("");


if ($("totalPayroll"))
    $("totalPayroll").textContent =
        formatCurrency(totalPayroll);


if ($("payrollEmployees"))
    $("payrollEmployees").textContent =
        employees.length;


if ($("totalOvertimeHours"))
    $("totalOvertimeHours").textContent =
        totalOvertime.toFixed(2) +
        " Hrs";

}

/* =========================================================
SALARY SLIP
========================================================= */

$("generateSalarySlipBtn")?.addEventListener(
"click",
() => {

    const employeeId =
        $("salaryEmployeeSelect").value;

    const month =
        $("salarySlipMonth").value;


    if (!employeeId || !month) {

        alert(
            "Employee  Month Select "
        );

        return;

    }


    generateSalarySlipFor(
        employeeId,
        month
    );

}

);

window.generateSalarySlipFor =
function(
employeeId,
month
) {

const employee =
    employees.find(
        item =>
            item.employeeId ===
            employeeId
    );


if (!employee) return;


const result =
    calculateEmployeePayroll(
        employee,
        month
    );


$("slipEmployeeName").textContent =
    employee.name;

$("slipEmployeeId").textContent =
    employee.employeeId;

$("slipDepartment").textContent =
    employee.department || "-";

$("slipMonth").textContent =
    month;


$("slipFullDay").textContent =
    result.fullDay;

$("slipHalfDay").textContent =
    result.halfDay;

$("slipPaidLeave").textContent =
    result.paidLeave;

$("slipAbsent").textContent =
    result.absent;

$("slipOvertime").textContent =
    result.overtime.toFixed(2) +
    " Hrs";

$("slipBasicSalary").textContent =
    formatCurrency(
        result.basicSalary
    );

$("slipBonus").textContent =
    formatCurrency(
        result.bonus
    );

$("slipAdvance").textContent =
    formatCurrency(
        result.advance
    );

$("slipDeduction").textContent =
    formatCurrency(
        result.deduction
    );

$("slipNetSalary").textContent =
    formatCurrency(
        result.netSalary
    );


$("salarySlipContainer")
    .classList.remove("hidden");

};

$("printSalarySlipBtn")?.addEventListener(
"click",
() => {

    window.print();

}

);

/* =========================================================
BACKUP EXPORT
========================================================= */

$("exportBackupBtn")?.addEventListener(
"click",
() => {

    const backup = {

        employees,

        attendanceData,

        leaves,

        settings,

        backupDate:
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
        document.createElement("a");


    a.href = url;

    a.download =
        `employee-pro-backup-${todayString()}.json`;


    a.click();


    URL.revokeObjectURL(url);

}

);

/* =========================================================
BACKUP IMPORT
========================================================= */

$("importBackupInput")?.addEventListener(
"change",
event => {

    const file =
        event.target.files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        async e => {

            try {

                const backup =
                    JSON.parse(
                        e.target.result
                    );


                if (
                    !confirm(
                        "Backup data Firebase- Import  ?"
                    )
                ) return;


                if (
                    Array.isArray(
                        backup.employees
                    )
                ) {

                    for (
                        const employee
                        of backup.employees
                    ) {

                        const data = {
                            ...employee
                        };

                        delete data.firestoreId;

                        await db
                            .collection(
                                EMPLOYEES
                            )
                            .doc(
                                employee.employeeId
                            )
                            .set(
                                data,
                                {
                                    merge: true
                                }
                            );

                    }

                }


                if (
                    Array.isArray(
                        backup.attendanceData
                    )
                ) {

                    for (
                        const record
                        of backup.attendanceData
                    ) {

                        const data = {
                            ...record
                        };

                        delete data.firestoreId;

                        await db
                            .collection(
                                ATTENDANCE
                            )
                            .doc(
                                attendanceDocumentId(
                                    record.employeeId,
                                    record.date
                                )
                            )
                            .set(
                                data,
                                {
                                    merge: true
                                }
                            );

                    }

                }


                alert(
                    "Backup Import Successfully Completed"
                );


                await loadAllData();


            } catch (error) {

                alert(
                    "Invalid Backup File:\n" +
                    error.message
                );

            }

        };


    reader.readAsText(file);

}

);

/* =========================================================
RESET ALL DATA
========================================================= */

$("resetDataBtn")?.addEventListener(
"click",
async () => {

    const confirmText =
        prompt(
            " Data Delete  : DELETE"
        );


    if (
        confirmText !==
        "DELETE"
    ) {

        alert(
            "Reset Cancelled"
        );

        return;

    }


    try {

        const collections = [

            EMPLOYEES,

            ATTENDANCE,

            LEAVES

        ];


        for (
            const collection
            of collections
        ) {

            const snapshot =
                await db
                    .collection(
                        collection
                    )
                    .get();


            const batch =
                db.batch();


            snapshot.docs.forEach(
                doc => {

                    batch.delete(
                        doc.ref
                    );

                }
            );


            await batch.commit();

        }


        alert(
            "All Data Successfully Deleted"
        );


        await loadAllData();


    } catch (error) {

        alert(
            "Reset Error:\n" +
            error.message
        );

    }

}

);

/* =========================================================
INITIALIZE APPLICATION
========================================================= */

document.addEventListener(
"DOMContentLoaded",
() => {

    console.log(
        "Employee Pro Starting..."
    );


    loadAllData();

}

);
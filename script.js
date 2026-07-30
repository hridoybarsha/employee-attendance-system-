import {
initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getFirestore,
collection,
getDocs,
addDoc,
updateDoc,
deleteDoc,
doc,
setDoc,
getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {
apiKey: "AIzaSyDR6Ab5X3PelrvdAjLhPsCi_n4Qi6MHf-o",
authDomain: "employee-attendance-syst-33351.firebaseapp.com",
projectId: "employee-attendance-syst-33351",
storageBucket: "employee-attendance-syst-33351.firebasestorage.app",
messagingSenderId: "672059529814",
appId: "1:672059529814:web:971eefee24b9a2ba33b9f7"
};

// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ======================================================
// COLLECTIONS
// ======================================================

const EMPLOYEES = "employees";
const ATTENDANCE = "attendance";
const LEAVES = "leaves";
const PAYROLL = "payroll";
const SETTINGS = "settings";

// ======================================================
// GLOBAL DATA
// ======================================================

let employees = [];
let attendanceData = [];
let leaves = [];
let payrollData = [];

let selectedDate = getToday();

let calendarDate = new Date();

let settings = {
officeStartTime: "09:00",
officeEndTime: "18:00",
gracePeriod: 15,
weeklyOff: 0,
overtimeRate: 100
};

// ======================================================
// HELPERS
// ======================================================

function getToday() {

const d = new Date();

return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0");

}

function formatCurrency(value) {

return "₹" + Number(value || 0).toLocaleString("en-IN");

}

function escapeHTML(value) {

return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}

function formatDate(date) {

if (!date) return "";

const d = new Date(date + "T00:00:00");

return d.toLocaleDateString("en-IN");

}

function getMonthKey(date) {

return date.substring(0, 7);

}

function calculateDays(from, to) {

const start = new Date(from);
const end = new Date(to);

const diff = end - start;

return Math.floor(diff / 86400000) + 1;

}

function getWorkingHours(checkIn, checkOut) {

if (!checkIn || !checkOut) return 0;

const [h1, m1] = checkIn.split(":").map(Number);
const [h2, m2] = checkOut.split(":").map(Number);

const start = h1 * 60 + m1;
const end = h2 * 60 + m2;

if (end <= start) return 0;

return Number(((end - start) / 60).toFixed(2));

}

function calculateLate(checkIn) {

if (!checkIn) return 0;

const [h, m] = checkIn.split(":").map(Number);

const [oh, om] = settings.officeStartTime.split(":").map(Number);

const actual = h * 60 + m;
const office = oh * 60 + om;

const late = actual - office - Number(settings.gracePeriod || 0);

return late > 0 ? late : 0;

}

function calculateOvertime(checkOut) {

if (!checkOut) return 0;

const [h, m] = checkOut.split(":").map(Number);

const [oh, om] = settings.officeEndTime.split(":").map(Number);

const actual = h * 60 + m;
const office = oh * 60 + om;

const overtime = actual - office;

return overtime > 0
    ? Number((overtime / 60).toFixed(2))
    : 0;

}

function statusBadge(status) {

let cls = "";

if (status === "Full Day") cls = "badge-full";
else if (status === "Half Day") cls = "badge-half";
else if (status === "Absent") cls = "badge-absent";
else if (
    status === "Paid Leave" ||
    status === "Sick Leave" ||
    status === "Casual Leave"
) cls = "badge-leave";
else if (
    status === "Holiday" ||
    status === "Weekly Off"
) cls = "badge-holiday";
else if (status === "Active") cls = "badge-active";

return `<span class="badge ${cls}">${escapeHTML(status)}</span>`;

}

// ======================================================
// FIRESTORE LOAD
// ======================================================

async function loadEmployees() {

const snapshot = await getDocs(
    collection(db, EMPLOYEES)
);

employees = snapshot.docs.map(item => ({
    firestoreId: item.id,
    ...item.data()
}));

}

async function loadAttendance() {

const snapshot = await getDocs(
    collection(db, ATTENDANCE)
);

attendanceData = snapshot.docs.map(item => ({
    firestoreId: item.id,
    ...item.data()
}));

}

async function loadLeaves() {

const snapshot = await getDocs(
    collection(db, LEAVES)
);

leaves = snapshot.docs.map(item => ({
    firestoreId: item.id,
    ...item.data()
}));

}

async function loadPayroll() {

const snapshot = await getDocs(
    collection(db, PAYROLL)
);

payrollData = snapshot.docs.map(item => ({
    firestoreId: item.id,
    ...item.data()
}));

}

async function loadSettings() {

try {

    const ref = doc(
        db,
        SETTINGS,
        "office"
    );

    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {

        settings = {
            ...settings,
            ...snapshot.data()
        };

    }

} catch (error) {

    console.log("Settings load error:", error);

}

}

async function loadAllData() {

try {

    setConnection("🟡 Loading...");

    await Promise.all([
        loadEmployees(),
        loadAttendance(),
        loadLeaves(),
        loadPayroll(),
        loadSettings()
    ]);

    setConnection(
        "🟢 Firebase Connected"
    );

    renderAll();

} catch (error) {

    console.error(error);

    setConnection(
        "🔴 Firebase Error"
    );

    alert(
        "Firebase থেকে Data Load করা যায়নি। Firestore Rules এবং Firebase Config পরীক্ষা করুন।\n\n" +
        error.message
    );

}

}

function setConnection(text) {

const el = document.getElementById(
    "connectionStatus"
);

if (el) el.textContent = text;

}

// ======================================================
// NAVIGATION
// ======================================================

document.querySelectorAll(".nav-item")
.forEach(button => {

    button.addEventListener("click", () => {

        const page = button.dataset.page;

        document.querySelectorAll(".nav-item")
            .forEach(item =>
                item.classList.remove("active")
            );

        button.classList.add("active");

        document.querySelectorAll(".page")
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

        document.getElementById(
            "pageTitle"
        ).textContent =
            button.textContent.trim();

        if (page === "employees") {
            renderEmployees();
        }

        if (page === "attendance") {
            renderCalendar();
        }

        if (page === "leave") {
            renderLeaves();
        }

        if (page === "payroll") {
            calculatePayroll();
        }

        if (page === "salarySlip") {
            populateSalaryEmployees();
        }

    });

});

// ======================================================
// CURRENT DATE
// ======================================================

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

// ======================================================
// EMPLOYEE MODAL
// ======================================================

const employeeModal =
document.getElementById(
"employeeModal"
);

function openEmployeeModal(employee = null) {

employeeModal.classList.add("show");

if (employee) {

    document.getElementById(
        "employeeModalTitle"
    ).textContent = "Edit Employee";

    document.getElementById(
        "editEmployeeId"
    ).value = employee.firestoreId;

    document.getElementById(
        "employeeId"
    ).value = employee.employeeId || "";

    document.getElementById(
        "employeeName"
    ).value = employee.name || "";

    document.getElementById(
        "employeePhone"
    ).value = employee.phone || "";

    document.getElementById(
        "employeeDepartment"
    ).value = employee.department || "";

    document.getElementById(
        "employeeDesignation"
    ).value = employee.designation || "";

    document.getElementById(
        "employeeSalary"
    ).value = employee.salary || 0;

    document.getElementById(
        "employeeJoinDate"
    ).value = employee.joiningDate || "";

    document.getElementById(
        "employeeStatus"
    ).value = employee.status || "Active";

} else {

    document.getElementById(
        "employeeModalTitle"
    ).textContent = "Add Employee";

    document.getElementById(
        "employeeForm"
    ).reset();

    document.getElementById(
        "editEmployeeId"
    ).value = "";

}

}

function closeEmployeeModal() {

employeeModal.classList.remove("show");

}

document.getElementById(
"addEmployeeBtn"
).addEventListener(
"click",
() => openEmployeeModal()
);

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

// ======================================================
// SAVE EMPLOYEE
// ======================================================

document.getElementById(
"employeeForm"
).addEventListener(
"submit",
async event => {

    event.preventDefault();

    const firestoreId =
        document.getElementById(
            "editEmployeeId"
        ).value;

    const data = {

        employeeId:
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
            ),

        joiningDate:
            document.getElementById(
                "employeeJoinDate"
            ).value,

        status:
            document.getElementById(
                "employeeStatus"
            ).value,

        updatedAt:
            new Date().toISOString()

    };


    try {

        if (firestoreId) {

            await updateDoc(
                doc(
                    db,
                    EMPLOYEES,
                    firestoreId
                ),
                data
            );

        } else {

            data.createdAt =
                new Date().toISOString();

            await addDoc(
                collection(
                    db,
                    EMPLOYEES
                ),
                data
            );

        }

        await loadEmployees();

        renderAll();

        closeEmployeeModal();

        alert(
            "Employee saved successfully!"
        );

    } catch (error) {

        console.error(error);

        alert(
            "Employee save failed:\n" +
            error.message
        );

    }

}

);

// ======================================================
// RENDER EMPLOYEES
// ======================================================

function renderEmployees() {

const tbody =
    document.getElementById(
        "employeeTable"
    );

const search =
    document.getElementById(
        "employeeSearch"
    ).value
        .toLowerCase()
        .trim();

const department =
    document.getElementById(
        "employeeDepartmentFilter"
    ).value;


const filtered =
    employees.filter(employee => {

        const matchesSearch =
            !search ||
            String(
                employee.name || ""
            ).toLowerCase().includes(search) ||
            String(
                employee.employeeId || ""
            ).toLowerCase().includes(search) ||
            String(
                employee.phone || ""
            ).toLowerCase().includes(search);

        const matchesDepartment =
            !department ||
            employee.department === department;

        return (
            matchesSearch &&
            matchesDepartment
        );

    });


if (!filtered.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="empty-row">
                No employees found
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    filtered.map(employee => `

    <tr>

        <td>
            ${escapeHTML(
                employee.employeeId
            )}
        </td>

        <td>
            <strong>
                ${escapeHTML(
                    employee.name
                )}
            </strong>
        </td>

        <td>
            ${escapeHTML(
                employee.phone || "-"
            )}
        </td>

        <td>
            ${escapeHTML(
                employee.department || "-"
            )}
        </td>

        <td>
            ${escapeHTML(
                employee.designation || "-"
            )}
        </td>

        <td>
            ${formatCurrency(
                employee.salary
            )}
        </td>

        <td>
            ${formatDate(
                employee.joiningDate
            )}
        </td>

        <td>
            ${statusBadge(
                employee.status || "Active"
            )}
        </td>

        <td>

            <button
                class="action-btn edit-btn"
                data-action="edit"
                data-id="${employee.firestoreId}"
            >
                ✏️ Edit
            </button>

            <button
                class="action-btn delete-btn"
                data-action="delete"
                data-id="${employee.firestoreId}"
            >
                🗑️ Delete
            </button>

        </td>

    </tr>

`).join("");

}

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

// EMPLOYEE ACTIONS

document.getElementById(
"employeeTable"
).addEventListener(
"click",
async event => {

    const button =
        event.target.closest(
            "button"
        );

    if (!button) return;

    const id =
        button.dataset.id;

    const employee =
        employees.find(
            item =>
                item.firestoreId === id
        );

    if (!employee) return;


    if (
        button.dataset.action ===
        "edit"
    ) {

        openEmployeeModal(
            employee
        );

    }


    if (
        button.dataset.action ===
        "delete"
    ) {

        if (
            !confirm(
                `Delete ${employee.name}?`
            )
        ) return;


        try {

            await deleteDoc(
                doc(
                    db,
                    EMPLOYEES,
                    id
                )
            );

            await loadEmployees();

            renderAll();

            alert(
                "Employee deleted!"
            );

        } catch (error) {

            alert(
                "Delete failed:\n" +
                error.message
            );

        }

    }

}

);

// ======================================================
// DEPARTMENT FILTER
// ======================================================

function populateDepartments() {

const select =
    document.getElementById(
        "employeeDepartmentFilter"
    );

const departments =
    [...new Set(
        employees
            .map(
                item =>
                    item.department
            )
            .filter(Boolean)
    )]
    .sort();


select.innerHTML =
    `<option value="">
        All Departments
    </option>` +
    departments.map(
        department =>
            `<option value="${escapeHTML(
                department
            )}">
                ${escapeHTML(
                    department
                )}
            </option>`
    ).join("");

}

// ======================================================
// ATTENDANCE
// ======================================================

function getAttendance(
employeeId,
date
) {

return attendanceData.find(
    item =>
        item.employeeId ===
            employeeId &&
        item.date === date
);

}

async function saveAttendance(
employeeId,
date,
checkIn,
checkOut,
status
) {

const existing =
    getAttendance(
        employeeId,
        date
    );


const data = {

    employeeId,
    date,

    checkIn:
        checkIn || "",

    checkOut:
        checkOut || "",

    status,

    workingHours:
        getWorkingHours(
            checkIn,
            checkOut
        ),

    lateMinutes:
        calculateLate(
            checkIn
        ),

    overtimeHours:
        calculateOvertime(
            checkOut
        ),

    updatedAt:
        new Date().toISOString()

};


if (existing) {

    await updateDoc(
        doc(
            db,
            ATTENDANCE,
            existing.firestoreId
        ),
        data
    );

} else {

    await addDoc(
        collection(
            db,
            ATTENDANCE
        ),
        data
    );

}

}

function renderCalendar() {

const calendar =
    document.getElementById(
        "attendanceCalendar"
    );

const year =
    calendarDate.getFullYear();

const month =
    calendarDate.getMonth();


document.getElementById(
    "calendarTitle"
).textContent =
    calendarDate.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );


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


let html = "";


for (
    let i = 0;
    i < firstDay;
    i++
) {

    html +=
        `<div class="calendar-day empty"></div>`;

}


for (
    let day = 1;
    day <= daysInMonth;
    day++
) {

    const date =
        `${year}-${String(
            month + 1
        ).padStart(2, "0")}-${String(
            day
        ).padStart(2, "0")}`;


    const records =
        attendanceData.filter(
            item =>
                item.date === date
        );


    const full =
        records.filter(
            item =>
                item.status ===
                "Full Day"
        ).length;


    const half =
        records.filter(
            item =>
                item.status ===
                "Half Day"
        ).length;


    let statusText = "";

    if (full) {
        statusText +=
            `🟢 ${full} Full `;
    }

    if (half) {
        statusText +=
            `🟡 ${half} Half`;
    }


    html += `

        <div
            class="calendar-day
            ${date === selectedDate
                ? "selected"
                : ""}
            ${date === getToday()
                ? "today"
                : ""}"
            data-date="${date}"
        >

            <div class="day-number">
                ${day}
            </div>

            <div class="day-status">
                ${statusText}
            </div>

        </div>

    `;

}


calendar.innerHTML = html;


calendar
    .querySelectorAll(
        ".calendar-day:not(.empty)"
    )
    .forEach(day => {

        day.addEventListener(
            "click",
            () => {

                selectedDate =
                    day.dataset.date;

                renderCalendar();

                renderAttendanceDetails();

            }
        );

    });


renderAttendanceDetails();

}

function renderAttendanceDetails() {

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
    `Attendance - ${formatDate(
        selectedDate
    )}`;


if (!employees.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="9" class="empty-row">
                No employees available
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    employees.map(
        employee => {

            const record =
                getAttendance(
                    employee.employeeId,
                    selectedDate
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
                    ${record?.workingHours || 0} Hrs
                </td>

                <td>
                    ${statusBadge(
                        record?.status ||
                        "Absent"
                    )}
                </td>

                <td>
                    ${record?.lateMinutes || 0} Min
                </td>

                <td>
                    ${record?.overtimeHours || 0} Hrs
                </td>

                <td>

                    <button
                        class="action-btn attendance-btn"
                        data-attendance-id="${employee.employeeId}"
                    >
                        ✏️ Update
                    </button>

                </td>

            </tr>

            `;

        }
    ).join("");


tbody
    .querySelectorAll(
        "[data-attendance-id]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const employee =
                    employees.find(
                        item =>
                            item.employeeId ===
                            button.dataset
                                .attendanceId
                    );

                if (
                    employee
                ) {

                    openAttendanceModal(
                        employee
                    );

                }

            }
        );

    });

}

// ATTENDANCE MODAL

const attendanceModal =
document.getElementById(
"attendanceModal"
);

function openAttendanceModal(
employee
) {

const record =
    getAttendance(
        employee.employeeId,
        selectedDate
    );


attendanceModal.classList.add(
    "show"
);


document.getElementById(
    "attendanceEmployeeId"
).value =
    employee.employeeId;


document.getElementById(
    "attendanceDate"
).value =
    selectedDate;


document.getElementById(
    "attendanceEmployeeName"
).value =
    employee.name;


document.getElementById(
    "checkInTime"
).value =
    record?.checkIn || "";


document.getElementById(
    "checkOutTime"
).value =
    record?.checkOut || "";


document.getElementById(
    "attendanceStatus"
).value =
    record?.status ||
    "Full Day";

}

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
async event => {

    event.preventDefault();


    try {

        await saveAttendance(

            document.getElementById(
                "attendanceEmployeeId"
            ).value,

            document.getElementById(
                "attendanceDate"
            ).value,

            document.getElementById(
                "checkInTime"
            ).value,

            document.getElementById(
                "checkOutTime"
            ).value,

            document.getElementById(
                "attendanceStatus"
            ).value

        );


        await loadAttendance();

        renderAll();

        closeAttendanceModal();

        alert(
            "Attendance saved!"
        );


    } catch (error) {

        alert(
            "Attendance save failed:\n" +
            error.message
        );

    }

}

);

// CALENDAR CONTROLS

document.getElementById(
"previousMonth"
).addEventListener(
"click",
() => {

    calendarDate.setMonth(
        calendarDate.getMonth() - 1
    );

    renderCalendar();

}

);

document.getElementById(
"nextMonth"
).addEventListener(
"click",
() => {

    calendarDate.setMonth(
        calendarDate.getMonth() + 1
    );

    renderCalendar();

}

);

// MARK ALL PRESENT

document.getElementById(
"markAllPresentBtn"
).addEventListener(
"click",
async () => {

    if (!employees.length) {

        alert(
            "No employees found."
        );

        return;

    }


    if (
        !confirm(
            `Mark all ${employees.length} employees as Full Day?`
        )
    ) return;


    try {

        for (
            const employee of employees
        ) {

            await saveAttendance(
                employee.employeeId,
                selectedDate,
                settings.officeStartTime,
                settings.officeEndTime,
                "Full Day"
            );

        }


        await loadAttendance();

        renderAll();

        alert(
            "All employees marked Full Day."
        );

    } catch (error) {

        alert(
            error.message
        );

    }

}

);

// MARK HOLIDAY

document.getElementById(
"markHolidayBtn"
).addEventListener(
"click",
async () => {

    if (!employees.length) return;


    if (
        !confirm(
            `Mark ${formatDate(
                selectedDate
            )} as Holiday?`
        )
    ) return;


    try {

        for (
            const employee of employees
        ) {

            await saveAttendance(
                employee.employeeId,
                selectedDate,
                "",
                "",
                "Holiday"
            );

        }


        await loadAttendance();

        renderAll();

    } catch (error) {

        alert(
            error.message
        );

    }

}

);

// ======================================================
// LEAVE
// ======================================================

const leaveModal =
document.getElementById(
"leaveModal"
);

function populateLeaveEmployees() {

const select =
    document.getElementById(
        "leaveEmployee"
    );


select.innerHTML =
    `<option value="">
        Select Employee
    </option>` +
    employees
        .filter(
            item =>
                item.status !==
                "Inactive"
        )
        .map(
            employee =>
                `<option value="${escapeHTML(
                    employee.employeeId
                )}">
                    ${escapeHTML(
                        employee.name
                    )}
                </option>`
        )
        .join("");

}

document.getElementById(
"addLeaveBtn"
).addEventListener(
"click",
() => {

    populateLeaveEmployees();

    document.getElementById(
        "leaveForm"
    ).reset();

    leaveModal.classList.add(
        "show"
    );

}

);

document.getElementById(
"closeLeaveModal"
).addEventListener(
"click",
() =>
leaveModal.classList.remove(
"show"
)
);

document.getElementById(
"cancelLeaveBtn"
).addEventListener(
"click",
() =>
leaveModal.classList.remove(
"show"
)
);

document.getElementById(
"leaveForm"
).addEventListener(
"submit",
async event => {

    event.preventDefault();


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
            "To date cannot be before From date."
        );

        return;

    }


    const data = {

        employeeId,

        leaveType:
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
            ).value.trim(),

        status:
            "Approved",

        createdAt:
            new Date().toISOString()

    };


    try {

        await addDoc(
            collection(
                db,
                LEAVES
            ),
            data
        );


        await loadLeaves();

        renderLeaves();

        leaveModal.classList.remove(
            "show"
        );

        alert(
            "Leave added successfully!"
        );

    } catch (error) {

        alert(
            "Leave save failed:\n" +
            error.message
        );

    }

}

);

function renderLeaves() {

const tbody =
    document.getElementById(
        "leaveTable"
    );


if (!leaves.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="empty-row">
                No leave records
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    leaves.map(leave => {

        const employee =
            employees.find(
                item =>
                    item.employeeId ===
                    leave.employeeId
            );


        return `

        <tr>

            <td>
                ${escapeHTML(
                    employee?.name ||
                    leave.employeeId
                )}
            </td>

            <td>
                ${escapeHTML(
                    leave.leaveType
                )}
            </td>

            <td>
                ${formatDate(
                    leave.from
                )}
            </td>

            <td>
                ${formatDate(
                    leave.to
                )}
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
                ${statusBadge(
                    leave.status ||
                    "Approved"
                )}
            </td>

            <td>

                <button
                    class="action-btn delete-btn"
                    data-leave-id="${leave.firestoreId}"
                >
                    🗑️ Delete
                </button>

            </td>

        </tr>

        `;

    }).join("");

}

document.getElementById(
"leaveTable"
).addEventListener(
"click",
async event => {

    const button =
        event.target.closest(
            "[data-leave-id]"
        );

    if (!button) return;


    if (
        !confirm(
            "Delete this leave record?"
        )
    ) return;


    try {

        await deleteDoc(
            doc(
                db,
                LEAVES,
                button.dataset.leaveId
            )
        );


        await loadLeaves();

        renderLeaves();

    } catch (error) {

        alert(
            error.message
        );

    }

}

);

// ======================================================
// PAYROLL
// ======================================================

function getMonthDays(month) {

const [year, m] =
    month.split("-").map(Number);

return new Date(
    year,
    m,
    0
).getDate();

}

function calculateEmployeePayroll(
employee,
month
) {

const records =
    attendanceData.filter(
        item =>
            item.employeeId ===
                employee.employeeId &&
            item.date.startsWith(
                month
            )
    );


const fullDay =
    records.filter(
        item =>
            item.status ===
            "Full Day"
    ).length;


const halfDay =
    records.filter(
        item =>
            item.status ===
            "Half Day"
    ).length;


const paidLeave =
    records.filter(
        item =>
            item.status ===
            "Paid Leave"
    ).length;


const absent =
    records.filter(
        item =>
            item.status ===
            "Absent"
    ).length;


const overtime =
    records.reduce(
        (sum, item) =>
            sum +
            Number(
                item.overtimeHours ||
                0
            ),
        0
    );


const daysInMonth =
    getMonthDays(month);


const dailySalary =
    Number(
        employee.salary || 0
    ) /
    daysInMonth;


const earnedBasic =
    (
        fullDay +
        paidLeave +
        halfDay * 0.5
    ) *
    dailySalary;


const absentDeduction =
    absent *
    dailySalary;


const overtimePay =
    overtime *
    Number(
        settings.overtimeRate || 0
    );


const previous =
    payrollData.find(
        item =>
            item.employeeId ===
                employee.employeeId &&
            item.month === month
    );


const bonus =
    Number(
        previous?.bonus || 0
    );


const advance =
    Number(
        previous?.advance || 0
    );


const deduction =
    Number(
        previous?.deduction || 0
    );


const netSalary =
    earnedBasic -
    absentDeduction +
    overtimePay +
    bonus -
    advance -
    deduction;


return {

    employeeId:
        employee.employeeId,

    employeeName:
        employee.name,

    month,

    basicSalary:
        Number(
            employee.salary || 0
        ),

    fullDay,

    halfDay,

    paidLeave,

    absent,

    overtime:
        Number(
            overtime.toFixed(2)
        ),

    earnedBasic:
        Number(
            earnedBasic.toFixed(2)
        ),

    absentDeduction:
        Number(
            absentDeduction.toFixed(2)
        ),

    overtimePay:
        Number(
            overtimePay.toFixed(2)
        ),

    bonus,

    advance,

    deduction,

    netSalary:
        Number(
            netSalary.toFixed(2)
        )

};

}

function calculatePayroll() {

const monthInput =
    document.getElementById(
        "payrollMonth"
    );


if (!monthInput.value) {

    const now =
        new Date();

    monthInput.value =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

}


const month =
    monthInput.value;


const results =
    employees.map(
        employee =>
            calculateEmployeePayroll(
                employee,
                month
            )
    );


renderPayroll(
    results
);

}

function renderPayroll(
results
) {

const tbody =
    document.getElementById(
        "payrollTable"
    );


const total =
    results.reduce(
        (sum, item) =>
            sum +
            item.netSalary,
        0
    );


const overtime =
    results.reduce(
        (sum, item) =>
            sum +
            item.overtime,
        0
    );


document.getElementById(
    "totalPayroll"
).textContent =
    formatCurrency(
        total
    );


document.getElementById(
    "payrollEmployees"
).textContent =
    results.length;


document.getElementById(
    "totalOvertimeHours"
).textContent =
    overtime.toFixed(2) +
    " Hrs";


if (!results.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="12" class="empty-row">
                No employees
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    results.map(
        item => `

        <tr>

            <td>
                ${escapeHTML(
                    item.employeeName
                )}
            </td>

            <td>
                ${formatCurrency(
                    item.basicSalary
                )}
            </td>

            <td>
                ${item.fullDay}
            </td>

            <td>
                ${item.halfDay}
            </td>

            <td>
                ${item.paidLeave}
            </td>

            <td>
                ${item.absent}
            </td>

            <td>
                ${item.overtime} Hrs
            </td>

            <td>
                ${formatCurrency(
                    item.bonus
                )}
            </td>

            <td>
                ${formatCurrency(
                    item.advance
                )}
            </td>

            <td>
                ${formatCurrency(
                    item.deduction
                )}
            </td>

            <td>
                <strong>
                    ${formatCurrency(
                        item.netSalary
                    )}
                </strong>
            </td>

            <td>

                <button
                    class="action-btn edit-btn payroll-edit"
                    data-id="${item.employeeId}"
                    data-month="${item.month}"
                >
                    ✏️
                </button>

            </td>

        </tr>

        `
    ).join("");

}

document.getElementById(
"calculatePayrollBtn"
).addEventListener(
"click",
calculatePayroll
);

// PAYROLL BONUS / ADVANCE / DEDUCTION

document.getElementById(
"payrollTable"
).addEventListener(
"click",
async event => {

    const button =
        event.target.closest(
            ".payroll-edit"
        );

    if (!button) return;


    const employeeId =
        button.dataset.id;

    const month =
        button.dataset.month;


    const existing =
        payrollData.find(
            item =>
                item.employeeId ===
                    employeeId &&
                item.month === month
        );


    const bonus =
        prompt(
            "Bonus amount:",
            existing?.bonus || 0
        );

    if (bonus === null) return;


    const advance =
        prompt(
            "Advance amount:",
            existing?.advance || 0
        );

    if (advance === null) return;


    const deduction =
        prompt(
            "Deduction amount:",
            existing?.deduction || 0
        );

    if (deduction === null) return;


    const data = {

        employeeId,

        month,

        bonus:
            Number(bonus) || 0,

        advance:
            Number(advance) || 0,

        deduction:
            Number(deduction) || 0,

        updatedAt:
            new Date().toISOString()

    };


    try {

        if (existing) {

            await updateDoc(
                doc(
                    db,
                    PAYROLL,
                    existing.firestoreId
                ),
                data
            );

        } else {

            await addDoc(
                collection(
                    db,
                    PAYROLL
                ),
                data
            );

        }


        await loadPayroll();

        calculatePayroll();

    } catch (error) {

        alert(
            error.message
        );

    }

}

);

// ======================================================
// SALARY SLIP
// ======================================================

function populateSalaryEmployees() {

const select =
    document.getElementById(
        "salaryEmployeeSelect"
    );


select.innerHTML =
    `<option value="">
        Select Employee
    </option>` +
    employees.map(
        employee =>
            `<option value="${escapeHTML(
                employee.employeeId
            )}">
                ${escapeHTML(
                    employee.name
                )}
            </option>`
    ).join("");

}

document.getElementById(
"generateSalarySlipBtn"
).addEventListener(
"click",
() => {

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
            "Select employee and month."
        );

        return;

    }


    const employee =
        employees.find(
            item =>
                item.employeeId ===
                employeeId
        );


    if (!employee) return;


    const payroll =
        calculateEmployeePayroll(
            employee,
            month
        );


    document.getElementById(
        "salarySlipContainer"
    ).classList.remove(
        "hidden"
    );


    document.getElementById(
        "slipMonth"
    ).textContent =
        month;


    document.getElementById(
        "slipEmployeeName"
    ).textContent =
        employee.name;


    document.getElementById(
        "slipEmployeeId"
    ).textContent =
        employee.employeeId;


    document.getElementById(
        "slipDepartment"
    ).textContent =
        employee.department || "-";


    document.getElementById(
        "slipFullDay"
    ).textContent =
        payroll.fullDay;


    document.getElementById(
        "slipHalfDay"
    ).textContent =
        payroll.halfDay;


    document.getElementById(
        "slipPaidLeave"
    ).textContent =
        payroll.paidLeave;


    document.getElementById(
        "slipAbsent"
    ).textContent =
        payroll.absent;


    document.getElementById(
        "slipOvertime"
    ).textContent =
        payroll.overtime +
        " Hrs";


    document.getElementById(
        "slipBasicSalary"
    ).textContent =
        formatCurrency(
            payroll.earnedBasic
        );


    document.getElementById(
        "slipBonus"
    ).textContent =
        formatCurrency(
            payroll.bonus
        );


    document.getElementById(
        "slipAdvance"
    ).textContent =
        formatCurrency(
            payroll.advance
        );


    document.getElementById(
        "slipDeduction"
    ).textContent =
        formatCurrency(
            payroll.deduction +
            payroll.absentDeduction
        );


    document.getElementById(
        "slipNetSalary"
    ).textContent =
        formatCurrency(
            payroll.netSalary
        );

}

);

document.getElementById(
"printSalarySlipBtn"
).addEventListener(
"click",
() => window.print()
);

// ======================================================
// REPORTS
// ======================================================

let currentReport = [];

document.getElementById(
"generateReportBtn"
).addEventListener(
"click",
generateReport
);

function generateReport() {

const type =
    document.getElementById(
        "reportType"
    ).value;


const month =
    document.getElementById(
        "reportMonth"
    ).value;


if (!month) {

    alert(
        "Select report month."
    );

    return;

}


const head =
    document.getElementById(
        "reportHead"
    );


const body =
    document.getElementById(
        "reportBody"
    );


if (
    type ===
    "attendance"
) {

    head.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Working Hours</th>
        </tr>
    `;


    currentReport =
        attendanceData
            .filter(
                item =>
                    item.date.startsWith(
                        month
                    )
            )
            .map(
                item => {

                    const employee =
                        employees.find(
                            emp =>
                                emp.employeeId ===
                                item.employeeId
                        );


                    return {

                        Date:
                            item.date,

                        Employee:
                            employee?.name ||
                            item.employeeId,

                        Status:
                            item.status,

                        "Check In":
                            item.checkIn ||
                            "",

                        "Check Out":
                            item.checkOut ||
                            "",

                        "Working Hours":
                            item.workingHours ||
                            0

                    };

                }
            );


    body.innerHTML =
        currentReport.map(
            row => `

            <tr>

                <td>${row.Date}</td>

                <td>${escapeHTML(
                    row.Employee
                )}</td>

                <td>${statusBadge(
                    row.Status
                )}</td>

                <td>${row["Check In"]}</td>

                <td>${row["Check Out"]}</td>

                <td>${row["Working Hours"]} Hrs</td>

            </tr>

            `
        ).join("");

}


if (
    type ===
    "late"
) {

    head.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Late Minutes</th>
        </tr>
    `;


    currentReport =
        attendanceData
            .filter(
                item =>
                    item.date.startsWith(
                        month
                    ) &&
                    Number(
                        item.lateMinutes
                    ) > 0
            )
            .map(
                item => {

                    const employee =
                        employees.find(
                            emp =>
                                emp.employeeId ===
                                item.employeeId
                        );


                    return {

                        Date:
                            item.date,

                        Employee:
                            employee?.name ||
                            item.employeeId,

                        "Late Minutes":
                            item.lateMinutes

                    };

                }
            );


    body.innerHTML =
        currentReport.map(
            row => `

            <tr>

                <td>${row.Date}</td>

                <td>${escapeHTML(
                    row.Employee
                )}</td>

                <td>${row["Late Minutes"]} Min</td>

            </tr>

            `
        ).join("");

}


if (
    type ===
    "overtime"
) {

    head.innerHTML = `
        <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Overtime</th>
        </tr>
    `;


    currentReport =
        attendanceData
            .filter(
                item =>
                    item.date.startsWith(
                        month
                    ) &&
                    Number(
                        item.overtimeHours
                    ) > 0
            )
            .map(
                item => {

                    const employee =
                        employees.find(
                            emp =>
                                emp.employeeId ===
                                item.employeeId
                        );


                    return {

                        Date:
                            item.date,

                        Employee:
                            employee?.name ||
                            item.employeeId,

                        Overtime:
                            item.overtimeHours

                    };

                }
            );


    body.innerHTML =
        currentReport.map(
            row => `

            <tr>

                <td>${row.Date}</td>

                <td>${escapeHTML(
                    row.Employee
                )}</td>

                <td>${row.Overtime} Hrs</td>

            </tr>

            `
        ).join("");

}


if (
    type ===
    "salary"
) {

    head.innerHTML = `
        <tr>
            <th>Employee</th>
            <th>Basic Salary</th>
            <th>Absent</th>
            <th>Overtime</th>
            <th>Net Salary</th>
        </tr>
    `;


    currentReport =
        employees.map(
            employee =>
                calculateEmployeePayroll(
                    employee,
                    month
                )
        );


    body.innerHTML =
        currentReport.map(
            row => `

            <tr>

                <td>${escapeHTML(
                    row.employeeName
                )}</td>

                <td>${formatCurrency(
                    row.basicSalary
                )}</td>

                <td>${row.absent}</td>

                <td>${row.overtime} Hrs</td>

                <td>${formatCurrency(
                    row.netSalary
                )}</td>

            </tr>

            `
        ).join("");

}


if (!currentReport.length) {

    body.innerHTML = `
        <tr>
            <td colspan="10" class="empty-row">
                No data found
            </td>
        </tr>
    `;

}

}

// EXPORT REPORT CSV

document.getElementById(
"exportReportBtn"
).addEventListener(
"click",
() => {

    if (!currentReport.length) {

        alert(
            "Generate a report first."
        );

        return;

    }


    const headers =
        Object.keys(
            currentReport[0]
        );


    const csv = [

        headers.join(","),

        ...currentReport.map(
            row =>
                headers.map(
                    header =>
                        `"${String(
                            row[header] ??
                            ""
                        ).replaceAll(
                            '"',
                            '""'
                        )}"`
                ).join(",")
        )

    ].join("\n");


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

// ======================================================
// SETTINGS
// ======================================================

function loadSettingsUI() {

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
async event => {

    event.preventDefault();


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
            ),

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
            )

    };


    try {

        await setDoc(

            doc(
                db,
                SETTINGS,
                "office"
            ),

            settings

        );


        alert(
            "Settings saved successfully!"
        );


    } catch (error) {

        alert(
            "Settings save failed:\n" +
            error.message
        );

    }

}

);

// ======================================================
// BACKUP
// ======================================================

document.getElementById(
"exportBackupBtn"
).addEventListener(
"click",
() => {

    const backup = {

        exportedAt:
            new Date().toISOString(),

        employees,

        attendance:
            attendanceData,

        leaves,

        payroll:
            payrollData,

        settings

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

// IMPORT BACKUP

document.getElementById(
"importBackupInput"
).addEventListener(
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
                    backup.employees
                ) {

                    for (
                        const employee
                        of backup.employees
                    ) {

                        const {
                            firestoreId,
                            ...data
                        } = employee;


                        await addDoc(
                            collection(
                                db,
                                EMPLOYEES
                            ),
                            data
                        );

                    }

                }


                if (
                    backup.attendance
                ) {

                    for (
                        const item
                        of backup.attendance
                    ) {

                        const {
                            firestoreId,
                            ...data
                        } = item;


                        await addDoc(
                            collection(
                                db,
                                ATTENDANCE
                            ),
                            data
                        );

                    }

                }


                if (
                    backup.leaves
                ) {

                    for (
                        const item
                        of backup.leaves
                    ) {

                        const {
                            firestoreId,
                            ...data
                        } = item;


                        await addDoc(
                            collection(
                                db,
                                LEAVES
                            ),
                            data
                        );

                    }

                }


                await loadAllData();


                alert(
                    "Backup imported successfully!"
                );


            } catch (error) {

                alert(
                    "Backup import failed:\n" +
                    error.message
                );

            }

        };


    reader.readAsText(
        file
    );

}

);

// RESET DATA

document.getElementById(
"resetDataBtn"
).addEventListener(
"click",
async () => {

    if (
        !confirm(
            "WARNING: This will delete ALL employees, attendance, leave and payroll data. Continue?"
        )
    ) return;


    try {

        const collections = [

            EMPLOYEES,
            ATTENDANCE,
            LEAVES,
            PAYROLL

        ];


        for (
            const collectionName
            of collections
        ) {

            const snapshot =
                await getDocs(
                    collection(
                        db,
                        collectionName
                    )
                );


            for (
                const item
                of snapshot.docs
            ) {

                await deleteDoc(
                    doc(
                        db,
                        collectionName,
                        item.id
                    )
                );

            }

        }


        await loadAllData();


        alert(
            "All data has been reset."
        );


    } catch (error) {

        alert(
            "Reset failed:\n" +
            error.message
        );

    }

}

);

// ======================================================
// DASHBOARD
// ======================================================

function renderDashboard() {

document.getElementById(
    "totalEmployees"
).textContent =
    employees.length;


const todayRecords =
    attendanceData.filter(
        item =>
            item.date ===
            getToday()
    );


const present =
    todayRecords.filter(
        item =>
            item.status ===
            "Full Day"
    ).length;


const half =
    todayRecords.filter(
        item =>
            item.status ===
            "Half Day"
    ).length;


const absent =
    todayRecords.filter(
        item =>
            item.status ===
            "Absent"
    ).length;


const leave =
    todayRecords.filter(
        item =>
            item.status ===
                "Paid Leave" ||
            item.status ===
                "Unpaid Leave"
    ).length;


const late =
    todayRecords.filter(
        item =>
            Number(
                item.lateMinutes
            ) > 0
    ).length;


const overtime =
    todayRecords.reduce(
        (sum, item) =>
            sum +
            Number(
                item.overtimeHours ||
                0
            ),
        0
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
    late;


document.getElementById(
    "overtimeToday"
).textContent =
    overtime.toFixed(2) +
    " Hrs";


const month =
    getToday().substring(
        0,
        7
    );


const monthlyPayroll =
    employees.reduce(
        (sum, employee) => {

            const payroll =
                calculateEmployeePayroll(
                    employee,
                    month
                );

            return sum +
                payroll.netSalary;

        },
        0
    );


document.getElementById(
    "monthlyPayroll"
).textContent =
    formatCurrency(
        monthlyPayroll
    );


const tbody =
    document.getElementById(
        "dashboardAttendance"
    );


if (!todayRecords.length) {

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-row">
                No attendance recorded today
            </td>
        </tr>
    `;

    return;

}


tbody.innerHTML =
    todayRecords.map(
        record => {

            const employee =
                employees.find(
                    item =>
                        item.employeeId ===
                        record.employeeId
                );


            return `

            <tr>

                <td>
                    ${escapeHTML(
                        record.employeeId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee?.name ||
                        "-"
                    )}
                </td>

                <td>
                    ${record.checkIn || "-"}
                </td>

                <td>
                    ${record.checkOut || "-"}
                </td>

                <td>
                    ${record.workingHours || 0} Hrs
                </td>

                <td>
                    ${statusBadge(
                        record.status
                    )}
                </td>

            </tr>

            `;

        }
    ).join("");

}

// ======================================================
// RENDER EVERYTHING
// ======================================================

function renderAll() {

renderDashboard();

populateDepartments();

renderEmployees();

renderCalendar();

renderLeaves();

populateLeaveEmployees();

populateSalaryEmployees();

loadSettingsUI();

}

// ======================================================
// INITIAL START
// ======================================================

document.addEventListener(
"DOMContentLoaded",
() => {

    const now =
        new Date();


    const currentMonth =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;


    document.getElementById(
        "payrollMonth"
    ).value =
        currentMonth;


    document.getElementById(
        "salarySlipMonth"
    ).value =
        currentMonth;


    document.getElementById(
        "reportMonth"
    ).value =
        currentMonth;


    loadAllData();

}

);
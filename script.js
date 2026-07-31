/* =========================================================
EMPLOYEE PRO
FIREBASE FIRESTORE CONNECTED
NO LOGIN REQUIRED
CORRECTED FINAL SCRIPT
========================================================= */

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {

apiKey: "AIzaSyDR6Ab5X3PelrvdAjLhPsCi_n4Qi6MHf-o",

authDomain:
    "employee-attendance-syst-33351.firebaseapp.com",

projectId:
    "employee-attendance-syst-33351",

storageBucket:
    "employee-attendance-syst-33351.firebasestorage.app",

messagingSenderId:
    "672059529814",

appId:
    "1:672059529814:web:971eefee24b9a2ba33b9f7"

};

/* ================= GLOBAL DATA ================= */

let db = null;

let employees = [];
let attendanceData = [];
let leaveData = [];
let payrollData = [];

let settings = {

officeStartTime: "09:00",
officeEndTime: "18:00",
gracePeriod: 15,
weeklyOff: 0,
overtimeRate: 100

};

let currentCalendarDate = new Date();

let selectedAttendanceDate = null;

let currentReportData = [];

/* ================= INITIALIZE FIREBASE ================= */

function initializeFirebase() {

try {

    if (typeof firebase === "undefined") {

        console.error(
            "Firebase SDK not loaded"
        );

        return false;

    }

    if (!firebase.apps.length) {

        firebase.initializeApp(
            firebaseConfig
        );

    }

    db = firebase.firestore();

    console.log(
        "Firebase initialized successfully"
    );

    return true;

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error
    );

    return false;

}

}

/* ================= HELPERS ================= */

function $(id) {

return document.getElementById(id);

}

function todayString() {

const d = new Date();

return (

    d.getFullYear() +

    "-" +

    String(
        d.getMonth() + 1
    ).padStart(2, "0") +

    "-" +

    String(
        d.getDate()
    ).padStart(2, "0")

);

}

function monthString(date) {

return (

    date.getFullYear() +

    "-" +

    String(
        date.getMonth() + 1
    ).padStart(2, "0")

);

}

function money(value) {

return (

    "₹" +

    Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    )

);

}

function escapeHTML(value) {

return String(
    value ?? ""
)

.replace(
    /&/g,
    "&amp;"
)

.replace(
    /</g,
    "&lt;"
)

.replace(
    />/g,
    "&gt;"
)

.replace(
    /"/g,
    "&quot;"
)

.replace(
    /'/g,
    "&#039;"
);

}

function showModal(id) {

const modal = $(id);

if (modal) {

    modal.classList.add(
        "show"
    );

}

}

function hideModal(id) {

const modal = $(id);

if (modal) {

    modal.classList.remove(
        "show"
    );

}

}

function safeValue(id) {

const el = $(id);

return el ? el.value : "";

}

function setText(id, value) {

const el = $(id);

if (el) {

    el.textContent =
        value ?? "";

}

}

/* ================= FIREBASE STATUS ================= */

function setFirebaseStatus(
type,
text
) {

const el =
    $("firebaseStatus");

if (!el) return;

el.className =
    "firebase-status " +
    type;

el.textContent =
    text;

}

/* ================= LOAD ALL DATA ================= */

async function loadAllData() {

if (!db) {

    setFirebaseStatus(
        "error",
        "🔴 Firebase Error"
    );

    return;

}

try {

    setFirebaseStatus(
        "connecting",
        "🟡 Loading..."
    );


    const employeeSnap =
        await db
            .collection(
                "employees"
            )
            .get();


    employees =
        employeeSnap.docs.map(
            doc => ({

                firestoreId:
                    doc.id,

                ...doc.data()

            })
        );


    const attendanceSnap =
        await db
            .collection(
                "attendance"
            )
            .get();


    attendanceData =
        attendanceSnap.docs.map(
            doc => ({

                firestoreId:
                    doc.id,

                ...doc.data()

            })
        );


    const leaveSnap =
        await db
            .collection(
                "leaves"
            )
            .get();


    leaveData =
        leaveSnap.docs.map(
            doc => ({

                firestoreId:
                    doc.id,

                ...doc.data()

            })
        );


    const payrollSnap =
        await db
            .collection(
                "payroll"
            )
            .get();


    payrollData =
        payrollSnap.docs.map(
            doc => ({

                firestoreId:
                    doc.id,

                ...doc.data()

            })
        );


    const settingsDoc =
        await db
            .collection(
                "settings"
            )
            .doc(
                "office"
            )
            .get();


    if (
        settingsDoc.exists
    ) {

        settings = {

            ...settings,

            ...settingsDoc.data()

        };

    }


    setFirebaseStatus(
        "connected",
        "🟢 Firebase Connected"
    );


    refreshUI();


} catch (error) {

    console.error(
        "Firestore Load Error:",
        error
    );


    setFirebaseStatus(
        "error",
        "🔴 Firestore Error"
    );


    alert(
        "Firebase থেকে Data Load করা যায়নি।\n\n" +
        error.message
    );

}

}

/* ================= REFRESH UI ================= */

function refreshUI() {

updateDate();

updateDashboard();

renderEmployees();

renderEmployeeSelectors();

renderLeave();

renderEmployeeIdList();

renderAttendanceCalendar();

loadSettingsForm();

}

/* ================= DATE ================= */

function updateDate() {

const el =
    $("currentDate");

if (!el) return;

el.textContent =

    new Date().toLocaleDateString(

        "en-IN",

        {

            weekday:
                "long",

            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"

        }

    );

}

/* ================= NAVIGATION ================= */

function initNavigation() {

document
    .querySelectorAll(
        ".nav-item"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;


                    document
                        .querySelectorAll(
                            ".nav-item"
                        )
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".page"
                        )
                        .forEach(
                            pageEl =>
                                pageEl.classList.remove(
                                    "active"
                                )
                        );


                    const target =
                        $(page + "Page");


                    if (target) {

                        target.classList.add(
                            "active"
                        );

                    }


                    setText(
                        "pageTitle",
                        button.textContent.trim()
                    );

                }
            );

        }
    );

}

/* ================= DASHBOARD ================= */

function updateDashboard() {

const today =
    todayString();


setText(
    "totalEmployees",
    employees.length
);


const todayRecords =
    attendanceData.filter(

        a =>
            a.date === today

    );


setText(

    "presentToday",

    todayRecords.filter(

        a =>
            a.status ===
            "Full Day"

    ).length

);


setText(

    "halfDayToday",

    todayRecords.filter(

        a =>
            a.status ===
            "Half Day"

    ).length

);


setText(

    "absentToday",

    todayRecords.filter(

        a =>
            a.status ===
            "Absent"

    ).length

);


setText(

    "leaveToday",

    todayRecords.filter(

        a =>

            a.status ===
                "Paid Leave" ||

            a.status ===
                "Unpaid Leave"

    ).length

);


setText(

    "lateToday",

    todayRecords.filter(

        a =>
            Number(
                a.late || 0
            ) > 0

    ).length

);


setText(

    "overtimeToday",

    todayRecords.reduce(

        (
            sum,
            a
        ) =>

            sum +
            Number(
                a.overtime || 0
            ),

        0

    ).toFixed(2)

);


const currentMonth =
    monthString(
        new Date()
    );


const currentPayroll =
    payrollData.filter(

        p =>
            p.month ===
            currentMonth

    );


setText(

    "monthlyPayroll",

    money(

        currentPayroll.reduce(

            (
                sum,
                p
            ) =>

                sum +
                Number(
                    p.netSalary || 0
                ),

            0

        )

    )

);


const tbody =
    $("dashboardAttendance");


if (!tbody) return;


tbody.innerHTML = "";


if (
    todayRecords.length === 0
) {

    tbody.innerHTML =

        `<tr>
            <td colspan="6">
                No attendance recorded today
            </td>
        </tr>`;

    return;

}


todayRecords.forEach(
    record => {

        const employee =
            employees.find(

                e =>
                    e.employeeId ===
                    record.employeeId

            );


        const hours =
            calculateWorkingHours(

                record.checkIn,

                record.checkOut

            );


        tbody.innerHTML +=

            `<tr>

                <td>
                    ${escapeHTML(
                        record.employeeId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee?.name ||
                        "Unknown"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.checkIn ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.checkOut ||
                        "-"
                    )}
                </td>

                <td>
                    ${hours}
                </td>

                <td>
                    ${escapeHTML(
                        record.status ||
                        "-"
                    )}
                </td>

            </tr>`;

    }
);

}

/* ================= EMPLOYEE ================= */

function renderEmployees() {

const tbody =
    $("employeeTable");


if (!tbody) return;


tbody.innerHTML = "";


const search =
    safeValue(
        "employeeSearch"
    )
    .toLowerCase()
    .trim();


const department =
    safeValue(
        "employeeDepartmentFilter"
    );


const filtered =
    employees.filter(

        e => {

            const matchesSearch =

                !search ||

                String(
                    e.name || ""
                )
                .toLowerCase()
                .includes(
                    search
                ) ||

                String(
                    e.employeeId ||
                    ""
                )
                .toLowerCase()
                .includes(
                    search
                ) ||

                String(
                    e.phone || ""
                )
                .toLowerCase()
                .includes(
                    search
                );


            const matchesDepartment =

                !department ||

                e.department ===
                department;


            return (

                matchesSearch &&

                matchesDepartment

            );

        }

    );


if (
    filtered.length === 0
) {

    tbody.innerHTML =

        `<tr>
            <td colspan="9">
                No Employees Found
            </td>
        </tr>`;

    updateDepartmentFilter();

    return;

}


filtered.forEach(
    e => {

        tbody.innerHTML +=

            `<tr>

                <td>
                    ${escapeHTML(
                        e.employeeId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        e.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        e.phone || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        e.department || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        e.designation || "-"
                    )}
                </td>

                <td>
                    ${money(
                        e.salary
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        e.joiningDate || "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        e.status ||
                        "Active"
                    )}
                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="editEmployee('${escapeHTML(
                            e.firestoreId
                        )}')">
                        Edit
                    </button>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteEmployee('${escapeHTML(
                            e.firestoreId
                        )}')">
                        Delete
                    </button>

                </td>

            </tr>`;

    }
);


updateDepartmentFilter();

}

/* ================= DEPARTMENT FILTER ================= */

function updateDepartmentFilter() {

const select =
    $("employeeDepartmentFilter");


if (!select) return;


const current =
    select.value;


const departments =

    [
        ...new Set(

            employees

                .map(
                    e =>
                        e.department
                )

                .filter(
                    Boolean
                )

        )
    ];


select.innerHTML =

    `<option value="">
        All Departments
    </option>`;


departments.forEach(
    d => {

        const option =
            document.createElement(
                "option"
            );

        option.value = d;

        option.textContent = d;

        select.appendChild(
            option
        );

    }
);


select.value =
    current;

}

/* ================= ADD EMPLOYEE ================= */

function initEmployeeEvents() {

const addBtn =
    $("addEmployeeBtn");


if (addBtn) {

    addBtn.addEventListener(

        "click",

        () => {

            const form =
                $("employeeForm");

            if (form) {

                form.reset();

            }


            if ($("editEmployeeId")) {

                $("editEmployeeId")
                    .value = "";

            }


            setText(

                "employeeModalTitle",

                "Add Employee"

            );


            showModal(
                "employeeModal"
            );

        }

    );

}


const form =
    $("employeeForm");


if (!form) return;


form.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        const editId =
            safeValue(
                "editEmployeeId"
            );


        const employeeId =
            safeValue(
                "employeeId"
            )
            .trim();


        const name =
            safeValue(
                "employeeName"
            )
            .trim();


        if (
            !employeeId ||
            !name
        ) {

            alert(
                "Employee ID এবং Name দিন।"
            );

            return;

        }


        const duplicate =
            employees.find(

                e =>

                    e.employeeId ===
                    employeeId &&

                    e.firestoreId !==
                    editId

            );


        if (duplicate) {

            alert(
                "এই Employee ID ইতিমধ্যে আছে।"
            );

            return;

        }


        const data = {

            employeeId,

            name,

            phone:
                safeValue(
                    "employeePhone"
                )
                .trim(),

            department:
                safeValue(
                    "employeeDepartment"
                )
                .trim(),

            designation:
                safeValue(
                    "employeeDesignation"
                )
                .trim(),

            salary:
                Number(
                    safeValue(
                        "employeeSalary"
                    ) || 0
                ),

            joiningDate:
                safeValue(
                    "employeeJoinDate"
                ),

            status:
                safeValue(
                    "employeeStatus"
                ) ||
                "Active",

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        try {

            if (editId) {

                await db
                    .collection(
                        "employees"
                    )
                    .doc(
                        editId
                    )
                    .update(
                        data
                    );

            } else {

                await db
                    .collection(
                        "employees"
                    )
                    .doc(
                        employeeId
                    )
                    .set({

                        ...data,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });

            }


            hideModal(
                "employeeModal"
            );


            await loadAllData();


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Employee Save Error:\n" +
                error.message
            );

        }

    }

);

}

/* ================= EDIT EMPLOYEE ================= */

window.editEmployee =
function(id) {

    const employee =
        employees.find(

            e =>
                e.firestoreId ===
                id

        );


    if (!employee) return;


    const values = {

        editEmployeeId:
            employee.firestoreId,

        employeeId:
            employee.employeeId || "",

        employeeName:
            employee.name || "",

        employeePhone:
            employee.phone || "",

        employeeDepartment:
            employee.department || "",

        employeeDesignation:
            employee.designation || "",

        employeeSalary:
            employee.salary || 0,

        employeeJoinDate:
            employee.joiningDate || "",

        employeeStatus:
            employee.status ||
            "Active"

    };


    Object.entries(
        values
    ).forEach(

        (
            [id, value]
        ) => {

            const el =
                $(id);

            if (el) {

                el.value =
                    value;

            }

        }

    );


    setText(

        "employeeModalTitle",

        "Edit Employee"

    );


    showModal(
        "employeeModal"
    );

};

/* ================= DELETE EMPLOYEE ================= */

window.deleteEmployee =
async function(id) {

    const employee =
        employees.find(

            e =>
                e.firestoreId ===
                id

        );


    if (!employee) return;


    if (
        !confirm(

            "এই Employee এবং তার সমস্ত Attendance, Leave ও Payroll Data মুছে ফেলবেন?"

        )
    ) {

        return;

    }


    try {

        const batch =
            db.batch();


        batch.delete(

            db
                .collection(
                    "employees"
                )
                .doc(
                    id
                )

        );


        attendanceData

            .filter(

                a =>
                    a.employeeId ===
                    employee.employeeId

            )

            .forEach(

                a => {

                    batch.delete(

                        db
                            .collection(
                                "attendance"
                            )
                            .doc(
                                a.firestoreId
                            )

                    );

                }

            );


        leaveData

            .filter(

                l =>
                    l.employeeId ===
                    employee.employeeId

            )

            .forEach(

                l => {

                    batch.delete(

                        db
                            .collection(
                                "leaves"
                            )
                            .doc(
                                l.firestoreId
                            )

                    );

                }

            );


        payrollData

            .filter(

                p =>
                    p.employeeId ===
                    employee.employeeId

            )

            .forEach(

                p => {

                    batch.delete(

                        db
                            .collection(
                                "payroll"
                            )
                            .doc(
                                p.firestoreId
                            )

                    );

                }

            );


        await batch.commit();


        alert(
            "Employee এবং related data delete হয়েছে।"
        );


        await loadAllData();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Delete Error:\n" +
            error.message
        );

    }

};

/* ================= EMPLOYEE SELECTORS ================= */

function renderEmployeeSelectors() {

const selectors = [

    $("attendanceEmployeeSelect"),

    $("salaryEmployeeSelect"),

    $("leaveEmployee")

];


selectors.forEach(

    select => {

        if (!select) return;


        const current =
            select.value;


        select.innerHTML =

            `<option value="">
                Select Employee
            </option>`;


        employees

            .filter(

                e =>
                    e.status !==
                    "Inactive"

            )

            .forEach(

                e => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        e.employeeId;


                    option.textContent =

                        e.employeeId +

                        " - " +

                        e.name;


                    select.appendChild(
                        option
                    );

                }

            );


        if (current) {

            select.value =
                current;

        }

    }

);

}

/* ================= ATTENDANCE CALENDAR ================= */

function renderAttendanceCalendar() {

const select =
    $("attendanceEmployeeSelect");


const calendar =
    $("attendanceCalendar");


if (
    !calendar
) return;


const employeeId =
    select ?
        select.value :
        "";


calendar.innerHTML = "";


const year =
    currentCalendarDate
        .getFullYear();


const month =
    currentCalendarDate
        .getMonth();


setText(

    "calendarTitle",

    currentCalendarDate
        .toLocaleDateString(

            "en-IN",

            {

                month:
                    "long",

                year:
                    "numeric"

            }

        )

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

        year +

        "-" +

        String(
            month + 1
        )
        .padStart(
            2,
            "0"
        ) +

        "-" +

        String(
            day
        )
        .padStart(
            2,
            "0"
        );


    const record =

        attendanceData.find(

            a =>

                a.employeeId ===
                employeeId &&

                a.date ===
                date

        );


    const dayOfWeek =
        new Date(
            year,
            month,
            day
        ).getDay();


    const isWeeklyOff =
        Number(
            settings.weeklyOff
        ) ===
        dayOfWeek;


    let statusText =

        record

            ?

            statusEmoji(
                record.status
            ) +

            " " +

            record.status

            :

            isWeeklyOff

                ?

                "⚫ Weekly Off"

                :

                "⚪ Not Set";


    calendar.innerHTML +=

        `<div
            class="calendar-day"
            onclick="openAttendanceForDate('${date}')">

            <span class="day-number">
                ${day}
            </span>

            <span class="day-status">
                ${escapeHTML(
                    statusText
                )}
            </span>

        </div>`;

}

}

/* ================= ATTENDANCE DATE ================= */

window.openAttendanceForDate =
function(date) {

    const employeeId =
        safeValue(
            "attendanceEmployeeSelect"
        );


    if (!employeeId) {

        alert(
            "প্রথমে Employee Select করুন।"
        );

        return;

    }


    const employee =
        employees.find(

            e =>
                e.employeeId ===
                employeeId

        );


    const record =
        attendanceData.find(

            a =>

                a.employeeId ===
                employeeId &&

                a.date ===
                date

        );


    if ($("attendanceEmployeeId")) {

        $("attendanceEmployeeId")
            .value =
            employeeId;

    }


    if ($("attendanceDate")) {

        $("attendanceDate")
            .value =
            date;

    }


    if ($("attendanceEmployeeName")) {

        $("attendanceEmployeeName")
            .value =
            employee?.name || "";

    }


    if ($("checkInTime")) {

        $("checkInTime")
            .value =
            record?.checkIn || "";

    }


    if ($("checkOutTime")) {

        $("checkOutTime")
            .value =
            record?.checkOut || "";

    }


    if ($("attendanceStatus")) {

        $("attendanceStatus")
            .value =

            record?.status ||

            "Full Day";

    }


    selectedAttendanceDate =
        date;


    setText(

        "selectedDateTitle",

        "Attendance - " +
        date

    );


    renderAttendanceTable();


    showModal(
        "attendanceModal"
    );

};

/* ================= ATTENDANCE SAVE ================= */

function initAttendanceEvents() {

const select =
    $("attendanceEmployeeSelect");


if (select) {

    select.addEventListener(

        "change",

        () => {

            renderAttendanceCalendar();

        }

    );

}


const form =
    $("attendanceForm");


if (!form) return;


form.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        const employeeId =
            safeValue(
                "attendanceEmployeeId"
            );


        const date =
            safeValue(
                "attendanceDate"
            );


        const checkIn =
            safeValue(
                "checkInTime"
            );


        const checkOut =
            safeValue(
                "checkOutTime"
            );


        const status =
            safeValue(
                "attendanceStatus"
            );


        if (
            !employeeId ||
            !date
        ) {

            alert(
                "Employee এবং Date নির্বাচন করুন।"
            );

            return;

        }


        const late =
            calculateLate(
                checkIn
            );


        const overtime =
            calculateOvertime(
                checkOut
            );


        const data = {

            employeeId,

            date,

            checkIn,

            checkOut,

            status,

            late,

            overtime,

            updatedAt:

                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        try {

            const existing =
                attendanceData.find(

                    a =>

                        a.employeeId ===
                        employeeId &&

                        a.date ===
                        date

                );


            if (existing) {

                await db
                    .collection(
                        "attendance"
                    )
                    .doc(
                        existing.firestoreId
                    )
                    .update(
                        data
                    );

            } else {

                await db
                    .collection(
                        "attendance"
                    )
                    .add({

                        ...data,

                        createdAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });

            }


            hideModal(
                "attendanceModal"
            );


            await loadAllData();


        } catch (error) {

            alert(
                "Attendance Save Error:\n" +
                error.message
            );

        }

    }

);

}

/* ================= ATTENDANCE TABLE ================= */

function renderAttendanceTable() {

const tbody =
    $("attendanceTable");


if (!tbody) return;


tbody.innerHTML = "";


const employeeId =
    safeValue(
        "attendanceEmployeeSelect"
    );


if (!employeeId) {

    tbody.innerHTML =

        `<tr>
            <td colspan="9">
                Select Employee First
            </td>
        </tr>`;

    return;

}


const records =

    attendanceData.filter(

        a =>

            a.employeeId ===
            employeeId &&

            a.date ===
            selectedAttendanceDate

    );


if (
    records.length === 0
) {

    tbody.innerHTML =

        `<tr>
            <td colspan="9">
                No Attendance
            </td>
        </tr>`;

    return;

}


records.forEach(

    record => {

        const employee =
            employees.find(

                e =>
                    e.employeeId ===
                    record.employeeId

            );


        tbody.innerHTML +=

            `<tr>

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
                    ${escapeHTML(
                        record.checkIn ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.checkOut ||
                        "-"
                    )}
                </td>

                <td>
                    ${calculateWorkingHours(
                        record.checkIn,
                        record.checkOut
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        record.status ||
                        "-"
                    )}
                </td>

                <td>
                    ${record.late || 0}
                    Min
                </td>

                <td>
                    ${record.overtime || 0}
                    Hrs
                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="openAttendanceForDate('${record.date}')">
                        Edit
                    </button>

                </td>

            </tr>`;

    }

);

}

/* ================= ATTENDANCE CALCULATIONS ================= */

function timeToMinutes(time) {

if (!time) return 0;


const parts =
    time.split(":");


return (

    Number(
        parts[0]
    ) * 60 +

    Number(
        parts[1]
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
) {

    return "0 Hrs";

}


const start =
    timeToMinutes(
        checkIn
    );


const end =
    timeToMinutes(
        checkOut
    );


if (
    end <= start
) {

    return "0 Hrs";

}


const total =
    end - start;


const hours =
    Math.floor(
        total / 60
    );


const minutes =
    total % 60;


return (

    hours +

    " Hrs " +

    minutes +

    " Min"

);

}

function calculateLate(
checkIn
) {

if (!checkIn) return 0;


const start =
    timeToMinutes(

        settings.officeStartTime

    );


const actual =
    timeToMinutes(
        checkIn
    );


const grace =
    Number(
        settings.gracePeriod || 0
    );


return Math.max(

    0,

    actual -
    start -
    grace

);

}

function calculateOvertime(
checkOut
) {

if (!checkOut) return 0;


const end =
    timeToMinutes(

        settings.officeEndTime

    );


const actual =
    timeToMinutes(
        checkOut
    );


return Number(

    Math.max(

        0,

        (
            actual -
            end
        ) / 60

    ).toFixed(2)

);

}

function statusEmoji(
status
) {

const map = {

    "Full Day":
        "🟢",

    "Half Day":
        "🟡",

    "Absent":
        "🔴",

    "Paid Leave":
        "🔵",

    "Unpaid Leave":
        "⚪",

    "Holiday":
        "🟣",

    "Weekly Off":
        "⚫"

};


return (

    map[
        status
    ] ||

    "⚪"

);

}

/* ================= CALENDAR BUTTONS ================= */

function initCalendarButtons() {

const previous =
    $("previousMonth");


if (previous) {

    previous.addEventListener(

        "click",

        () => {

            currentCalendarDate
                .setMonth(

                    currentCalendarDate
                        .getMonth() - 1

                );


            renderAttendanceCalendar();

        }

    );

}


const next =
    $("nextMonth");


if (next) {

    next.addEventListener(

        "click",

        () => {

            currentCalendarDate
                .setMonth(

                    currentCalendarDate
                        .getMonth() + 1

                );


            renderAttendanceCalendar();

        }

    );

}

}

/* ================= MARK ALL PRESENT ================= */

function initMarkAllPresent() {

const button =
    $("markAllPresentBtn");


if (!button) return;


button.addEventListener(

    "click",

    async () => {

        const employeeId =
            safeValue(
                "attendanceEmployeeSelect"
            );


        if (!employeeId) {

            alert(
                "Employee Select করুন।"
            );

            return;

        }


        if (
            !confirm(

                "এই মাসের সব Working Day Full Day করতে চান?"

            )
        ) {

            return;

        }


        const year =
            currentCalendarDate
                .getFullYear();


        const month =
            currentCalendarDate
                .getMonth();


        const days =

            new Date(

                year,

                month + 1,

                0

            ).getDate();


        try {

            for (
                let day = 1;
                day <= days;
                day++
            ) {

                const date =

                    year +

                    "-" +

                    String(
                        month + 1
                    )
                    .padStart(
                        2,
                        "0"
                    ) +

                    "-" +

                    String(
                        day
                    )
                    .padStart(
                        2,
                        "0"
                    );


                const dayOfWeek =
                    new Date(
                        year,
                        month,
                        day
                    ).getDay();


                if (

                    Number(
                        settings.weeklyOff
                    ) ===
                    dayOfWeek

                ) {

                    continue;

                }


                const existing =

                    attendanceData.find(

                        a =>

                            a.employeeId ===
                            employeeId &&

                            a.date ===
                            date

                    );


                const data = {

                    employeeId,

                    date,

                    status:
                        "Full Day",

                    checkIn:
                        settings.officeStartTime,

                    checkOut:
                        settings.officeEndTime,

                    late: 0,

                    overtime: 0,

                    updatedAt:

                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                };


                if (existing) {

                    await db
                        .collection(
                            "attendance"
                        )
                        .doc(
                            existing.firestoreId
                        )
                        .update(
                            data
                        );

                } else {

                    await db
                        .collection(
                            "attendance"
                        )
                        .add({

                            ...data,

                            createdAt:

                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });

                }

            }


            await loadAllData();


            alert(
                "Working Days marked as Full Day."
            );


        } catch (error) {

            alert(
                "Error:\n" +
                error.message
            );

        }

    }

);

}

/* ================= LEAVE ================= */

function initLeaveEvents() {

const addBtn =
    $("addLeaveBtn");


if (addBtn) {

    addBtn.addEventListener(

        "click",

        () => {

            const form =
                $("leaveForm");

            if (form) {

                form.reset();

            }


            showModal(
                "leaveModal"
            );

        }

    );

}


const form =
    $("leaveForm");


if (!form) return;


form.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        const employeeId =
            safeValue(
                "leaveEmployee"
            );


        const from =
            safeValue(
                "leaveFrom"
            );


        const to =
            safeValue(
                "leaveTo"
            );


        if (
            !employeeId ||
            !from ||
            !to
        ) {

            alert(
                "Employee এবং Leave Date দিন।"
            );

            return;

        }


        if (
            to < from
        ) {

            alert(
                "To Date ভুল।"
            );

            return;

        }


        try {

            const leaveType =
                safeValue(
                    "leaveType"
                );


            const days =
                calculateLeaveDays(
                    from,
                    to
                );


            await db
                .collection(
                    "leaves"
                )
                .add({

                    employeeId,

                    leaveType,

                    from,

                    to,

                    days,

                    reason:
                        safeValue(
                            "leaveReason"
                        ),

                    status:
                        "Approved",

                    createdAt:

                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            /*
                Automatically create attendance
                records for leave dates.
            */

            const batch =
                db.batch();


            const start =
                new Date(
                    from +
                    "T00:00:00"
                );


            const end =
                new Date(
                    to +
                    "T00:00:00"
                );


            for (

                let date =
                    new Date(
                        start
                    );

                date <= end;

                date.setDate(
                    date.getDate() + 1
                )

            ) {

                const dateString =

                    date
                        .getFullYear() +

                    "-" +

                    String(
                        date.getMonth() + 1
                    )
                    .padStart(
                        2,
                        "0"
                    ) +

                    "-" +

                    String(
                        date.getDate()
                    )
                    .padStart(
                        2,
                        "0"
                    );


                const existing =

                    attendanceData.find(

                        a =>

                            a.employeeId ===
                            employeeId &&

                            a.date ===
                            dateString

                    );


                const attendanceStatus =

                    leaveType ===
                    "Paid Leave"

                        ?

                        "Paid Leave"

                        :

                        "Unpaid Leave";


                const data = {

                    employeeId,

                    date:
                        dateString,

                    checkIn:
                        "",

                    checkOut:
                        "",

                    status:
                        attendanceStatus,

                    late:
                        0,

                    overtime:
                        0,

                    updatedAt:

                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                };


                if (existing) {

                    batch.update(

                        db
                            .collection(
                                "attendance"
                            )
                            .doc(
                                existing.firestoreId
                            ),

                        data

                    );

                } else {

                    const ref =
                        db
                            .collection(
                                "attendance"
                            )
                            .doc();


                    batch.set(

                        ref,

                        {

                            ...data,

                            createdAt:

                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        }

                    );

                }

            }


            await batch.commit();


            hideModal(
                "leaveModal"
            );


            await loadAllData();


        } catch (error) {

            alert(
                "Leave Save Error:\n" +
                error.message
            );

        }

    }

);

}

function calculateLeaveDays(
from,
to
) {

const start =
    new Date(
        from +
        "T00:00:00"
    );


const end =
    new Date(
        to +
        "T00:00:00"
    );


return Math.floor(

    (

        end -
        start

    )

    /

    (

        1000 *
        60 *
        60 *
        24

    )

) + 1;

}

function renderLeave() {

const tbody =
    $("leaveTable");


if (!tbody) return;


tbody.innerHTML = "";


if (
    leaveData.length === 0
) {

    tbody.innerHTML =

        `<tr>
            <td colspan="8">
                No Leave Records
            </td>
        </tr>`;

    return;

}


leaveData.forEach(

    leave => {

        const employee =
            employees.find(

                e =>
                    e.employeeId ===
                    leave.employeeId

            );


        tbody.innerHTML +=

            `<tr>

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
                    ${escapeHTML(
                        leave.from
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        leave.to
                    )}
                </td>

                <td>
                    ${leave.days || 0}
                </td>

                <td>
                    ${escapeHTML(
                        leave.reason ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        leave.status ||
                        "Approved"
                    )}
                </td>

                <td>

                    <button
                        class="action-btn delete-btn"
                        onclick="deleteLeave('${escapeHTML(
                            leave.firestoreId
                        )}')">
                        Delete
                    </button>

                </td>

            </tr>`;

    }

);

}

window.deleteLeave =
async function(id) {

    if (
        !confirm(
            "Delete this leave?"
        )
    ) {

        return;

    }


    try {

        await db
            .collection(
                "leaves"
            )
            .doc(
                id
            )
            .delete();


        await loadAllData();


    } catch (error) {

        alert(
            error.message
        );

    }

};

/* ================= PAYROLL ================= */

function calculateEmployeePayroll(
employee,
month
) {

const records =

    attendanceData.filter(

        a =>

            a.employeeId ===
            employee.employeeId &&

            String(
                a.date || ""
            )
            .startsWith(
                month
            )

    );


const fullDay =

    records.filter(

        a =>
            a.status ===
            "Full Day"

    ).length;


const halfDay =

    records.filter(

        a =>
            a.status ===
            "Half Day"

    ).length;


const paidLeave =

    records.filter(

        a =>
            a.status ===
            "Paid Leave"

    ).length;


const absent =

    records.filter(

        a =>
            a.status ===
            "Absent"

    ).length;


const overtime =

    records.reduce(

        (
            sum,
            a
        ) =>

            sum +
            Number(
                a.overtime || 0
            ),

        0

    );


const basicSalary =
    Number(
        employee.salary || 0
    );


const parts =
    month.split(
        "-"
    );


const year =
    Number(
        parts[0]
    );


const monthNumber =
    Number(
        parts[1]
    );


const daysInMonth =

    new Date(

        year,

        monthNumber,

        0

    ).getDate();


const perDay =

    basicSalary /
    daysInMonth;


const earnedSalary =

    (

        fullDay +

        paidLeave +

        (
            halfDay *
            0.5
        )

    )

    *

    perDay;


const overtimeAmount =

    overtime *

    Number(
        settings.overtimeRate ||
        0
    );


const netSalary =

    earnedSalary +

    overtimeAmount;


return {

    employeeId:
        employee.employeeId,

    month,

    basicSalary,

    fullDay,

    halfDay,

    paidLeave,

    absent,

    overtime,

    bonus: 0,

    advance: 0,

    deduction: 0,

    overtimeAmount,

    earnedSalary,

    netSalary

};

}

async function calculatePayroll() {

const month =
    safeValue(
        "payrollMonth"
    );


if (!month) {

    alert(
        "Payroll Month Select করুন।"
    );

    return;

}


const table =
    $("payrollTable");


if (!table) return;


table.innerHTML = "";


let totalPayroll = 0;

let totalOvertime = 0;


const payrollRows =

    employees.map(

        employee =>

            calculateEmployeePayroll(

                employee,

                month

            )

    );


payrollRows.forEach(

    row => {

        totalPayroll +=
            Number(
                row.netSalary
            );


        totalOvertime +=
            Number(
                row.overtime
            );


        table.innerHTML +=

            `<tr>

                <td>

                    ${escapeHTML(
                        employees.find(
                            e =>
                                e.employeeId ===
                                row.employeeId
                        )?.name ||
                        "-"
                    )}

                    <br>

                    <small>
                        ${escapeHTML(
                            row.employeeId
                        )}
                    </small>

                </td>

                <td>
                    ${money(
                        row.basicSalary
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
                    ${Number(
                        row.overtime
                    ).toFixed(2)}
                </td>

                <td>
                    ${money(
                        row.bonus
                    )}
                </td>

                <td>
                    ${money(
                        row.advance
                    )}
                </td>

                <td>
                    ${money(
                        row.deduction
                    )}
                </td>

                <td>

                    <strong>
                        ${money(
                            row.netSalary
                        )}
                    </strong>

                </td>

                <td>

                    <button
                        class="action-btn edit-btn"
                        onclick="savePayroll(
                            '${escapeHTML(
                                row.employeeId
                            )}',
                            '${escapeHTML(
                                row.month
                            )}',
                            ${row.basicSalary},
                            ${row.fullDay},
                            ${row.halfDay},
                            ${row.paidLeave},
                            ${row.absent},
                            ${row.overtime},
                            ${row.netSalary}
                        )">

                        Save

                    </button>

                </td>

            </tr>`;

    }

);


setText(

    "totalPayroll",

    money(
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

window.savePayroll =
async function(

    employeeId,

    month,

    basicSalary,

    fullDay,

    halfDay,

    paidLeave,

    absent,

    overtime,

    calculatedNetSalary

) {

    try {

        const existing =
            payrollData.find(

                p =>

                    p.employeeId ===
                    employeeId &&

                    p.month ===
                    month

            );


        const oldBonus =
            Number(
                existing?.bonus ||
                0
            );


        const oldAdvance =
            Number(
                existing?.advance ||
                0
            );


        const oldDeduction =
            Number(
                existing?.deduction ||
                0
            );


        const baseSalary =
            Number(
                calculatedNetSalary
            );


        const netSalary =

            baseSalary +

            oldBonus +

            oldAdvance -

            oldDeduction;


        const data = {

            employeeId,

            month,

            basicSalary,

            fullDay,

            halfDay,

            paidLeave,

            absent,

            overtime,

            bonus:
                oldBonus,

            advance:
                oldAdvance,

            deduction:
                oldDeduction,

            netSalary,

            updatedAt:

                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        if (existing) {

            await db
                .collection(
                    "payroll"
                )
                .doc(
                    existing.firestoreId
                )
                .update(
                    data
                );

        } else {

            await db
                .collection(
                    "payroll"
                )
                .add({

                    ...data,

                    createdAt:

                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

        }


        alert(
            "Payroll Saved Successfully"
        );


        await loadAllData();


    } catch (error) {

        alert(
            "Payroll Save Error:\n" +
            error.message
        );

    }

};

/* ================= SALARY SLIP ================= */

function initSalarySlip() {

const button =
    $("generateSalarySlipBtn");


if (!button) return;


button.addEventListener(

    "click",

    () => {

        const employeeId =
            safeValue(
                "salaryEmployeeSelect"
            );


        const month =
            safeValue(
                "salarySlipMonth"
            );


        if (
            !employeeId ||
            !month
        ) {

            alert(
                "Employee এবং Month Select করুন।"
            );

            return;

        }


        const employee =
            employees.find(

                e =>
                    e.employeeId ===
                    employeeId

            );


        if (!employee) {

            alert(
                "Employee পাওয়া যায়নি।"
            );

            return;

        }


        let payroll =
            payrollData.find(

                p =>

                    p.employeeId ===
                    employeeId &&

                    p.month ===
                    month

            );


        if (!payroll) {

            payroll =
                calculateEmployeePayroll(

                    employee,

                    month

                );

        }


        const records =

            attendanceData.filter(

                a =>

                    a.employeeId ===
                    employeeId &&

                    String(
                        a.date || ""
                    )
                    .startsWith(
                        month
                    )

            );


        const fullDay =

            records.filter(

                a =>
                    a.status ===
                    "Full Day"

            ).length;


        const halfDay =

            records.filter(

                a =>
                    a.status ===
                    "Half Day"

            ).length;


        const paidLeave =

            records.filter(

                a =>
                    a.status ===
                    "Paid Leave"

            ).length;


        const absent =

            records.filter(

                a =>
                    a.status ===
                    "Absent"

            ).length;


        const overtime =

            records.reduce(

                (
                    sum,
                    a
                ) =>

                    sum +
                    Number(
                        a.overtime ||
                        0
                    ),

                0

            );


        setText(
            "slipMonth",
            month
        );


        setText(
            "slipEmployeeName",
            employee.name
        );


        setText(
            "slipEmployeeId",
            employeeId
        );


        setText(
            "slipDepartment",
            employee.department ||
            ""
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

            money(
                payroll.basicSalary ||
                employee.salary ||
                0
            )

        );


        setText(

            "slipBonus",

            money(
                payroll.bonus ||
                0
            )

        );


        setText(

            "slipAdvance",

            money(
                payroll.advance ||
                0
            )

        );


        setText(

            "slipDeduction",

            money(
                payroll.deduction ||
                0
            )

        );


        setText(

            "slipNetSalary",

            money(
                payroll.netSalary ||
                0
            )

        );


        const container =
            $("salarySlipContainer");


        if (container) {

            container.classList.remove(
                "hidden"
            );

        }

    }

);

}

/* ================= REPORTS ================= */

function initReports() {

const button =
    $("generateReportBtn");


if (button) {

    button.addEventListener(

        "click",

        generateReport

    );

}


const exportBtn =
    $("exportReportBtn");


if (exportBtn) {

    exportBtn.addEventListener(

        "click",

        exportReportCSV

    );

}

}

function generateReport() {

const type =
    safeValue(
        "reportType"
    );


const month =
    safeValue(
        "reportMonth"
    );


if (!month) {

    alert(
        "Month Select করুন।"
    );

    return;

}


const head =
    $("reportHead");


const body =
    $("reportBody");


if (
    !head ||
    !body
) return;


head.innerHTML = "";

body.innerHTML = "";


if (
    type ===
    "salary"
) {

    head.innerHTML =

        `<tr>

            <th>Employee ID</th>

            <th>Employee</th>

            <th>Month</th>

            <th>Salary</th>

        </tr>`;


    currentReportData =

        payrollData.filter(

            p =>
                p.month ===
                month

        );


    currentReportData.forEach(

        p => {

            const employee =
                employees.find(

                    e =>
                        e.employeeId ===
                        p.employeeId

                );


            body.innerHTML +=

                `<tr>

                    <td>
                        ${escapeHTML(
                            p.employeeId
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            employee?.name ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            month
                        )}
                    </td>

                    <td>
                        ${money(
                            p.netSalary
                        )}
                    </td>

                </tr>`;

        }

    );


    return;

}


head.innerHTML =

    `<tr>

        <th>Employee ID</th>

        <th>Employee</th>

        <th>Date</th>

        <th>Status</th>

        <th>Late</th>

        <th>Overtime</th>

    </tr>`;


currentReportData =

    attendanceData.filter(

        a =>

            String(
                a.date || ""
            )
            .startsWith(
                month
            )

    );


if (
    type ===
    "late"
) {

    currentReportData =

        currentReportData.filter(

            a =>
                Number(
                    a.late || 0
                ) > 0

        );

}


if (
    type ===
    "overtime"
) {

    currentReportData =

        currentReportData.filter(

            a =>
                Number(
                    a.overtime || 0
                ) > 0

        );

}


currentReportData.forEach(

    a => {

        const employee =
            employees.find(

                e =>
                    e.employeeId ===
                    a.employeeId

            );


        body.innerHTML +=

            `<tr>

                <td>
                    ${escapeHTML(
                        a.employeeId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        employee?.name ||
                        "-"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        a.date
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        a.status
                    )}
                </td>

                <td>
                    ${a.late || 0}
                </td>

                <td>
                    ${a.overtime || 0}
                </td>

            </tr>`;

    }

);

}

/* ================= CSV EXPORT ================= */

function csvEscape(value) {

const string =
    String(
        value ?? ""
    );


if (

    string.includes(",") ||

    string.includes('"') ||

    string.includes("\n")

) {

    return (

        '"' +

        string.replace(
            /"/g,
            '""'
        ) +

        '"'

    );

}


return string;

}

function exportReportCSV() {

if (
    currentReportData.length === 0
) {

    alert(
        "প্রথমে Report Generate করুন।"
    );

    return;

}


const headers =
    Object.keys(
        currentReportData[0]
    );


const rows =

    currentReportData.map(

        item =>

            headers.map(

                key =>

                    csvEscape(
                        item[key]
                    )

            )

    );


const csv =

    [

        headers.map(
            csvEscape
        ),

        ...rows

    ]

    .map(
        row =>
            row.join(",")
    )

    .join(
        "\n"
    );


const blob =

    new Blob(

        [

            "\uFEFF" +

            csv

        ],

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


a.href =
    url;


a.download =
    "employee-report-" +
    todayString() +
    ".csv";


document.body.appendChild(
    a
);


a.click();


a.remove();


URL.revokeObjectURL(
    url
);

}

/* ================= SETTINGS ================= */

function loadSettingsForm() {

const fields = {

    officeStartTime:
        settings.officeStartTime,

    officeEndTime:
        settings.officeEndTime,

    gracePeriod:
        settings.gracePeriod,

    weeklyOff:
        settings.weeklyOff,

    overtimeRate:
        settings.overtimeRate

};


Object.entries(
    fields
).forEach(

    (
        [id, value]
    ) => {

        const el =
            $(id);

        if (el) {

            el.value =
                value;

        }

    }

);

}

function initSettings() {

const form =
    $("settingsForm");


if (!form) return;


form.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        settings = {

            officeStartTime:
                safeValue(
                    "officeStartTime"
                ),

            officeEndTime:
                safeValue(
                    "officeEndTime"
                ),

            gracePeriod:
                Number(
                    safeValue(
                        "gracePeriod"
                    ) || 0
                ),

            weeklyOff:
                Number(
                    safeValue(
                        "weeklyOff"
                    ) || 0
                ),

            overtimeRate:
                Number(
                    safeValue(
                        "overtimeRate"
                    ) || 0
                )

        };


        try {

            await db
                .collection(
                    "settings"
                )
                .doc(
                    "office"
                )
                .set(
                    settings
                );


            alert(
                "Settings Saved Successfully"
            );


            renderAttendanceCalendar();


        } catch (error) {

            alert(
                "Settings Error:\n" +
                error.message
            );

        }

    }

);

}

/* ================= EMPLOYEE ID LIST ================= */

function renderEmployeeIdList() {

const container =
    $("employeeIdList");


if (!container) return;


container.innerHTML = "";


employees.forEach(

    e => {

        container.innerHTML +=

            `<div class="employee-id-item">

                <span>

                    <strong>
                        ${escapeHTML(
                            e.employeeId
                        )}
                    </strong>

                    -

                    ${escapeHTML(
                        e.name
                    )}

                </span>

                <span>
                    ${escapeHTML(
                        e.status ||
                        "Active"
                    )}
                </span>

            </div>`;

    }

);

}

/* ================= EMPLOYEE ID FORM ================= */

function initEmployeeIdForm() {

const form =
    $("employeeIdForm");


if (!form) return;


form.addEventListener(

    "submit",

    async event => {

        event.preventDefault();


        const employeeId =

            safeValue(
                "newEmployeeId"
            )
            .trim()
            .toUpperCase();


        const name =

            safeValue(
                "newEmployeeName"
            )
            .trim();


        if (
            !employeeId ||
            !name
        ) {

            alert(
                "Employee ID এবং Name দিন।"
            );

            return;

        }


        if (

            employees.some(

                e =>

                    e.employeeId ===
                    employeeId

            )

        ) {

            alert(
                "Employee ID already exists"
            );

            return;

        }


        try {

            await db
                .collection(
                    "employees"
                )
                .doc(
                    employeeId
                )
                .set({

                    employeeId,

                    name,

                    phone:
                        "",

                    department:
                        "",

                    designation:
                        "",

                    salary:
                        0,

                    joiningDate:
                        todayString(),

                    status:
                        "Active",

                    createdAt:

                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            form.reset();


            await loadAllData();


        } catch (error) {

            alert(
                "Employee ID Error:\n" +
                error.message
            );

        }

    }

);

}

/* ================= FULL BACKUP EXPORT ================= */

function initBackup() {

const exportBtn =
    $("exportBackupBtn");


if (exportBtn) {

    exportBtn.addEventListener(

        "click",

        () => {

            const backup = {

                version:
                    "1.0",

                exportedAt:
                    new Date()
                        .toISOString(),

                employees,

                attendanceData,

                leaveData,

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


            a.href =
                url;


            a.download =

                "employee-full-backup-" +

                todayString() +

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

    );

}


const importInput =
    $("importBackupInput");


if (importInput) {

    importInput.addEventListener(

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

                        const data =
                            JSON.parse(
                                e.target.result
                            );


                        if (
                            !data ||
                            typeof data !==
                            "object"
                        ) {

                            throw new Error(
                                "Invalid backup file"
                            );

                        }


                        if (
                            !confirm(

                                "Backup Import করলে existing matching records overwrite হবে। Continue করবেন?"

                            )
                        ) {

                            return;

                        }


                        const batch =
                            db.batch();


                        if (
                            data.settings
                        ) {

                            batch.set(

                                db
                                    .collection(
                                        "settings"
                                    )
                                    .doc(
                                        "office"
                                    ),

                                data.settings,

                                {
                                    merge:
                                        true
                                }

                            );

                        }


                        (
                            data.employees ||
                            []
                        )
                        .forEach(

                            employee => {

                                if (
                                    !employee.employeeId
                                ) return;


                                const ref =

                                    db
                                        .collection(
                                            "employees"
                                        )
                                        .doc(
                                            employee.employeeId
                                        );


                                const clean =
                                    {
                                        ...employee
                                    };


                                delete clean.firestoreId;


                                batch.set(

                                    ref,

                                    clean,

                                    {
                                        merge:
                                            true
                                    }

                                );

                            }

                        );


                        (
                            data.attendanceData ||
                            []
                        )
                        .forEach(

                            record => {

                                if (
                                    !record.employeeId ||
                                    !record.date
                                ) return;


                                const id =

                                    record.firestoreId ||

                                    record.employeeId +
                                    "_" +
                                    record.date;


                                const ref =

                                    db
                                        .collection(
                                            "attendance"
                                        )
                                        .doc(
                                            id
                                        );


                                const clean =
                                    {
                                        ...record
                                    };


                                delete clean.firestoreId;


                                batch.set(

                                    ref,

                                    clean,

                                    {
                                        merge:
                                            true
                                    }

                                );

                            }

                        );


                        (
                            data.leaveData ||
                            []
                        )
                        .forEach(

                            leave => {

                                if (
                                    !leave.employeeId
                                ) return;


                                const id =

                                    leave.firestoreId ||

                                    db
                                        .collection(
                                            "leaves"
                                        )
                                        .doc()
                                        .id;


                                const ref =

                                    db
                                        .collection(
                                            "leaves"
                                        )
                                        .doc(
                                            id
                                        );


                                const clean =
                                    {
                                        ...leave
                                    };


                                delete clean.firestoreId;


                                batch.set(

                                    ref,

                                    clean,

                                    {
                                        merge:
                                            true
                                    }

                                );

                            }

                        );


                        (
                            data.payrollData ||
                            []
                        )
                        .forEach(

                            payroll => {

                                if (
                                    !payroll.employeeId ||
                                    !payroll.month
                                ) return;


                                const id =

                                    payroll.firestoreId ||

                                    payroll.employeeId +
                                    "_" +
                                    payroll.month;


                                const ref =

                                    db
                                        .collection(
                                            "payroll"
                                        )
                                        .doc(
                                            id
                                        );


                                const clean =
                                    {
                                        ...payroll
                                    };


                                delete clean.firestoreId;


                                batch.set(

                                    ref,

                                    clean,

                                    {
                                        merge:
                                            true
                                    }

                                );

                            }

                        );


                        await batch.commit();


                        alert(
                            "Full Backup Imported Successfully"
                        );


                        importInput.value =
                            "";


                        await loadAllData();


                    } catch (error) {

                        console.error(
                            error
                        );


                        alert(

                            "Backup Import Error:\n" +

                            error.message

                        );

                    }

                };


            reader.readAsText(
                file
            );

        }

    );

}

}

/* ================= RESET ================= */

function initReset() {

const button =
    $("resetDataBtn");


if (!button) return;


button.addEventListener(

    "click",

    () => {

        alert(

            "Security-এর কারণে Browser থেকে পুরো Firestore Database Delete করা হয়নি। Firebase Console থেকে manually delete করুন।"

        );

    }

);

}

/* ================= MODAL CLOSE ================= */

function initModalButtons() {

const buttons = {

    closeEmployeeModal:
        "employeeModal",

    cancelEmployeeBtn:
        "employeeModal",

    closeAttendanceModal:
        "attendanceModal",

    cancelAttendanceBtn:
        "attendanceModal",

    closeLeaveModal:
        "leaveModal",

    cancelLeaveBtn:
        "leaveModal"

};


Object.entries(
    buttons
).forEach(

    (
        [buttonId, modalId]
    ) => {

        const button =
            $(buttonId);


        if (button) {

            button.onclick = () =>

                hideModal(
                    modalId
                );

        }

    }

);

}

/* ================= SEARCH ================= */

function initSearch() {

const search =
    $("employeeSearch");


if (search) {

    search.addEventListener(

        "input",

        renderEmployees

    );

}


const department =
    $("employeeDepartmentFilter");


if (department) {

    department.addEventListener(

        "change",

        renderEmployees

    );

}

}

/* ================= PRINT ================= */

function initPrint() {

const button =
    $("printSalarySlipBtn");


if (button) {

    button.addEventListener(

        "click",

        () => {

            window.print();

        }

    );

}

}

/* ================= DEFAULT MONTH ================= */

function setDefaultMonths() {

const month =
    monthString(
        new Date()
    );


const fields = [

    "payrollMonth",

    "salarySlipMonth",

    "reportMonth"

];


fields.forEach(

    id => {

        const el =
            $(id);


        if (
            el &&
            !el.value
        ) {

            el.value =
                month;

        }

    }

);

}

/* ================= INIT APP ================= */

document.addEventListener(

"DOMContentLoaded",

async () => {

    console.log(
        "Employee Pro starting..."
    );


    const firebaseReady =
        initializeFirebase();


    if (!firebaseReady) {

        setFirebaseStatus(

            "error",

            "🔴 Firebase SDK Error"

        );

        return;

    }


    initNavigation();

    initEmployeeEvents();

    initAttendanceEvents();

    initCalendarButtons();

    initMarkAllPresent();

    initLeaveEvents();

    initSalarySlip();

    initReports();

    initSettings();

    initEmployeeIdForm();

    initBackup();

    initReset();

    initModalButtons();

    initSearch();

    initPrint();

    setDefaultMonths();


    updateDate();


    await loadAllData();


    console.log(
        "Employee Pro ready."
    );

}

);
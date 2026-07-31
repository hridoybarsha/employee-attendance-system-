/* =========================================================
   EMPLOYEE PRO
   FIREBASE FIRESTORE CONNECTED
   NO LOGIN REQUIRED
   FINAL PAYROLL + SALARY SLIP VERSION
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


/* ================= INITIALIZE FIREBASE ================= */

let db = null;

try {

    firebase.initializeApp(firebaseConfig);

    db = firebase.firestore();

    console.log(
        "Firebase initialized successfully"
    );

} catch (error) {

    console.error(
        "Firebase initialization error:",
        error
    );

}


/* ================= GLOBAL DATA ================= */

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


/* ================= HELPER ================= */

function $(id) {

    return document.getElementById(id);

}


function todayString() {

    const d = new Date();

    return d.getFullYear() +
        "-" +
        String(
            d.getMonth() + 1
        ).padStart(2, "0") +
        "-" +
        String(
            d.getDate()
        ).padStart(2, "0");

}


function monthString(date) {

    return date.getFullYear() +
        "-" +
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

}


function money(value) {

    return "₹" +
        Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
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

    const el = $(id);

    if (el) {

        el.classList.add(
            "show"
        );

    }

}


function hideModal(id) {

    const el = $(id);

    if (el) {

        el.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   PAYROLL CALCULATION ENGINE
   EVERY EMPLOYEE CALCULATED SEPARATELY
========================================================= */

function calculateEmployeePayroll(
    employee,
    month
) {

    if (!employee || !month) {

        return {

            employeeId:
            employee?.employeeId || "",

            basicSalary: 0,

            fullDay: 0,

            halfDay: 0,

            paidLeave: 0,

            absent: 0,

            overtime: 0,

            overtimeAmount: 0,

            earnedBasicSalary: 0,

            bonus: 0,

            advance: 0,

            deduction: 0,

            netSalary: 0

        };

    }


    /* ================= EMPLOYEE ATTENDANCE ================= */

    const records =
        attendanceData.filter(

            a =>

            a.employeeId ===
            employee.employeeId &&

            String(
                a.date || ""
            ).startsWith(
                month
            )

        );


    /* ================= COUNT ================= */

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


    /* ================= OVERTIME ================= */

    const overtime =
        records.reduce(

            (sum, a) =>

            sum +
            Number(
                a.overtime || 0
            ),

            0

        );


    /* ================= BASIC SALARY ================= */

    const basicSalary =
        Number(
            employee.salary || 0
        );


    /* ================= DAYS IN MONTH ================= */

    const year =
        Number(
            month.split("-")[0]
        );


    const monthNumber =
        Number(
            month.split("-")[1]
        );


    const daysInMonth =
        new Date(

            year,

            monthNumber,

            0

        ).getDate();


    /* ================= PER DAY ================= */

    const perDaySalary =

        basicSalary /
        daysInMonth;


    /* ================= EARNED BASIC ================= */

    const earnedBasicSalary =

        (

            fullDay +

            paidLeave +

            (
                halfDay *
                0.5
            )

        )

        *

        perDaySalary;


    /* ================= OVERTIME ================= */

    const overtimeAmount =

        overtime *

        Number(
            settings.overtimeRate || 0
        );


    /* ================= SAVED PAYROLL ================= */

    const savedPayroll =

        payrollData.find(

            p =>

            p.employeeId ===
            employee.employeeId &&

            p.month ===
            month

        );


    /* ================= BONUS ================= */

    const bonus =

        Number(
            savedPayroll?.bonus || 0
        );


    /* ================= ADVANCE ================= */

    const advance =

        Number(
            savedPayroll?.advance || 0
        );


    /* ================= DEDUCTION ================= */

    const deduction =

        Number(
            savedPayroll?.deduction || 0
        );


    /* ================= NET SALARY ================= */

    const netSalary =

        earnedBasicSalary +

        overtimeAmount +

        bonus -

        advance -

        deduction;


    return {

        employeeId:
        employee.employeeId,

        employeeName:
        employee.name || "",

        basicSalary,

        fullDay,

        halfDay,

        paidLeave,

        absent,

        overtime,

        overtimeAmount,

        earnedBasicSalary,

        bonus,

        advance,

        deduction,

        netSalary

    };

}


/* =========================================================
   FIREBASE STATUS
========================================================= */

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


/* =========================================================
   LOAD ALL DATA
========================================================= */

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


/* =========================================================
   REFRESH UI
========================================================= */

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


/* =========================================================
   DATE
========================================================= */

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


/* =========================================================
   NAVIGATION
========================================================= */

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


                if ($("pageTitle")) {

                    $("pageTitle")
                    .textContent =

                    button.textContent.trim();

                }

            }

        );

    }

);


/* =========================================================
   DASHBOARD
========================================================= */

function updateDashboard() {

    const today =
        todayString();


    if ($("totalEmployees")) {

        $("totalEmployees")
        .textContent =
        employees.length;

    }


    const todayRecords =

        attendanceData.filter(

            a =>
            a.date === today

        );


    if ($("presentToday")) {

        $("presentToday")
        .textContent =

        todayRecords.filter(

            a =>
            a.status ===
            "Full Day"

        ).length;

    }


    if ($("halfDayToday")) {

        $("halfDayToday")
        .textContent =

        todayRecords.filter(

            a =>
            a.status ===
            "Half Day"

        ).length;

    }


    if ($("absentToday")) {

        $("absentToday")
        .textContent =

        todayRecords.filter(

            a =>
            a.status ===
            "Absent"

        ).length;

    }


    if ($("leaveToday")) {

        $("leaveToday")
        .textContent =

        todayRecords.filter(

            a =>

            a.status ===
            "Paid Leave" ||

            a.status ===
            "Unpaid Leave"

        ).length;

    }


    if ($("lateToday")) {

        $("lateToday")
        .textContent =

        todayRecords.filter(

            a =>
            Number(
                a.late || 0
            ) > 0

        ).length;

    }


    if ($("overtimeToday")) {

        $("overtimeToday")
        .textContent =

        todayRecords.reduce(

            (sum, a) =>

            sum +
            Number(
                a.overtime || 0
            ),

            0

        ).toFixed(2);

    }


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


    if ($("monthlyPayroll")) {

        $("monthlyPayroll")
        .textContent =

        money(

            currentPayroll.reduce(

                (sum, p) =>

                sum +
                Number(
                    p.netSalary || 0
                ),

                0

            )

        );

    }


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


/* =========================================================
   EMPLOYEE
========================================================= */

function renderEmployees() {

    const tbody =
        $("employeeTable");

    if (!tbody) return;

    tbody.innerHTML = "";


    const search =
        $("employeeSearch")
        ?.value
        .toLowerCase() || "";


    const department =
        $("employeeDepartmentFilter")
        ?.value || "";


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
                        e.employeeId || ""
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
                    onclick="editEmployee(
                    '${e.firestoreId}'
                    )">

                    Edit

                    </button>


                    <button
                    class="action-btn delete-btn"
                    onclick="deleteEmployee(
                    '${e.firestoreId}'
                    )">

                    Delete

                    </button>

                </td>

            </tr>`;

        }

    );


    updateDepartmentFilter();

}


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

                .filter(Boolean)

            )
        ];


    select.innerHTML =

        `<option value="">
        All Departments
        </option>`;


    departments.forEach(

        d => {

            select.innerHTML +=

            `<option value="${
                escapeHTML(d)
            }">

            ${escapeHTML(d)}

            </option>`;

        }

    );


    select.value =
        current;

}


/* =========================================================
   ADD EMPLOYEE
========================================================= */

if ($("addEmployeeBtn")) {

    $("addEmployeeBtn")
    .addEventListener(

        "click",

        () => {

            $("employeeForm")
            ?.reset();

            $("editEmployeeId")
            .value = "";

            $("employeeModalTitle")
            .textContent =
            "Add Employee";

            showModal(
                "employeeModal"
            );

        }

    );

}


/* =========================================================
   SAVE EMPLOYEE
========================================================= */

if ($("employeeForm")) {

    $("employeeForm")
    .addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const editId =
                $("editEmployeeId")
                .value;


            const employeeId =
                $("employeeId")
                .value
                .trim();


            const data = {

                employeeId,

                name:
                $("employeeName")
                .value
                .trim(),

                phone:
                $("employeePhone")
                .value
                .trim(),

                department:
                $("employeeDepartment")
                .value
                .trim(),

                designation:
                $("employeeDesignation")
                .value
                .trim(),

                salary:
                Number(
                    $("employeeSalary")
                    .value || 0
                ),

                joiningDate:
                $("employeeJoinDate")
                .value,

                status:
                $("employeeStatus")
                .value,

                updatedAt:
                firebase.firestore
                .FieldValue
                .serverTimestamp()

            };


            try {

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


/* =========================================================
   EDIT EMPLOYEE
========================================================= */

window.editEmployee =

function(id) {

    const employee =

        employees.find(

            e =>
            e.firestoreId === id

        );


    if (!employee) return;


    $("editEmployeeId")
    .value =
    id;


    $("employeeId")
    .value =
    employee.employeeId ||
    "";


    $("employeeName")
    .value =
    employee.name ||
    "";


    $("employeePhone")
    .value =
    employee.phone ||
    "";


    $("employeeDepartment")
    .value =
    employee.department ||
    "";


    $("employeeDesignation")
    .value =
    employee.designation ||
    "";


    $("employeeSalary")
    .value =
    employee.salary ||
    0;


    $("employeeJoinDate")
    .value =
    employee.joiningDate ||
    "";


    $("employeeStatus")
    .value =
    employee.status ||
    "Active";


    $("employeeModalTitle")
    .textContent =
    "Edit Employee";


    showModal(
        "employeeModal"
    );

};


/* =========================================================
   DELETE EMPLOYEE
========================================================= */

window.deleteEmployee =

async function(id) {

    const employee =

        employees.find(

            e =>
            e.firestoreId === id

        );


    if (!employee) return;


    if (
        !confirm(
            "এই Employee Delete করবেন?"
        )
    ) return;


    try {

        await db
        .collection(
            "employees"
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


/* =========================================================
   EMPLOYEE SELECTORS
========================================================= */

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

                    select.innerHTML +=

                    `<option value="${
                        escapeHTML(
                            e.employeeId
                        )
                    }">

                    ${escapeHTML(
                        e.employeeId
                    )}

                    -
                    ${escapeHTML(
                        e.name
                    )}

                    </option>`;

                }

            );


            if (current) {

                select.value =
                    current;

            }

        }

    );

}


/* =========================================================
   ATTENDANCE CALENDAR
========================================================= */

if ($("attendanceEmployeeSelect")) {

    $("attendanceEmployeeSelect")
    .addEventListener(

        "change",

        () => {

            renderAttendanceCalendar();

        }

    );

}


function renderAttendanceCalendar() {

    const employeeId =

        $("attendanceEmployeeSelect")
        ?.value || "";


    const calendar =
        $("attendanceCalendar");

    if (!calendar) return;


    calendar.innerHTML = "";


    const year =

        currentCalendarDate
        .getFullYear();


    const month =

        currentCalendarDate
        .getMonth();


    if ($("calendarTitle")) {

        $("calendarTitle")
        .textContent =

        currentCalendarDate
        .toLocaleDateString(

            "en-IN",

            {

                month:
                "long",

                year:
                "numeric"

            }

        );

    }


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

        `<div class="calendar-day empty">
        </div>`;

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
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                day
            ).padStart(
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


        calendar.innerHTML +=

        `<div

        class="calendar-day"

        onclick="openAttendanceForDate(
        '${date}'
        )">

            <span class="day-number">
            ${day}
            </span>

            <span class="day-status">

            ${
                record

                ?

                statusEmoji(
                    record.status
                )

                +

                " " +

                escapeHTML(
                    record.status
                )

                :

                "⚪ Not Set"
            }

            </span>

        </div>`;

    }

}


/* =========================================================
   OPEN ATTENDANCE
========================================================= */

window.openAttendanceForDate =

function(date) {

    const employeeId =

        $("attendanceEmployeeSelect")
        .value;


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


    $("attendanceEmployeeId")
    .value =
    employeeId;


    $("attendanceDate")
    .value =
    date;


    $("attendanceEmployeeName")
    .value =
    employee?.name ||
    "";


    $("checkInTime")
    .value =
    record?.checkIn ||
    "";


    $("checkOutTime")
    .value =
    record?.checkOut ||
    "";


    $("attendanceStatus")
    .value =
    record?.status ||
    "Full Day";


    selectedAttendanceDate =
        date;


    $("selectedDateTitle")
    .textContent =
        "Attendance - " +
        date;


    renderAttendanceTable();


    showModal(
        "attendanceModal"
    );

};


/* =========================================================
   SAVE ATTENDANCE
========================================================= */

if ($("attendanceForm")) {

    $("attendanceForm")
    .addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const employeeId =
                $("attendanceEmployeeId")
                .value;


            const date =
                $("attendanceDate")
                .value;


            const checkIn =
                $("checkInTime")
                .value;


            const checkOut =
                $("checkOutTime")
                .value;


            const status =
                $("attendanceStatus")
                .value;


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


/* =========================================================
   ATTENDANCE TABLE
========================================================= */

function renderAttendanceTable() {

    const tbody =
        $("attendanceTable");

    if (!tbody) return;


    tbody.innerHTML = "";


    const employeeId =

        $("attendanceEmployeeSelect")
        ?.value || "";


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
                    record.status
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
                    onclick="openAttendanceForDate(
                    '${record.date}'
                    )">

                    Edit

                    </button>

                </td>

            </tr>`;

        }

    );

}


/* =========================================================
   ATTENDANCE CALCULATION
========================================================= */

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


function timeToMinutes(
    time
) {

    if (!time) return 0;


    const parts =
        time.split(":");


    return (

        Number(
            parts[0]
        ) *
        60 +

        Number(
            parts[1]
        )

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
            settings.gracePeriod ||
            0
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


    return Math.max(

        0,

        (
            actual -
            end
        ) / 60

    ).toFixed(2);

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

        map[status] ||
        "⚪"

    );

}


/* =========================================================
   CALENDAR BUTTONS
========================================================= */

if ($("previousMonth")) {

    $("previousMonth")
    .addEventListener(

        "click",

        () => {

            currentCalendarDate
            .setMonth(

                currentCalendarDate
                .getMonth() -
                1

            );


            renderAttendanceCalendar();

        }

    );

}


if ($("nextMonth")) {

    $("nextMonth")
    .addEventListener(

        "click",

        () => {

            currentCalendarDate
            .setMonth(

                currentCalendarDate
                .getMonth() +
                1

            );


            renderAttendanceCalendar();

        }

    );

}


/* =========================================================
   PAYROLL
========================================================= */

if ($("calculatePayrollBtn")) {

    $("calculatePayrollBtn")
    .addEventListener(

        "click",

        calculatePayroll

    );

}


function calculatePayroll() {

    const month =
        $("payrollMonth")
        .value;


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


    let totalPayroll =
        0;


    let totalOvertime =
        0;


    let employeeCount =
        0;


    /* IMPORTANT:
       forEach ব্যবহার করা হয়েছে
       async forEach নয়
    */

    employees.forEach(

        employee => {

            const result =

                calculateEmployeePayroll(

                    employee,

                    month

                );


            totalPayroll +=

                result.netSalary;


            totalOvertime +=

                result.overtime;


            employeeCount++;


            table.innerHTML +=

            `<tr>

                <td>

                    <strong>
                    ${escapeHTML(
                        employee.name
                    )}
                    </strong>

                    <br>

                    <small>
                    ${escapeHTML(
                        employee.employeeId
                    )}
                    </small>

                </td>


                <td>
                ${money(
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
                </td>


                <td>
                ${money(
                    result.bonus
                )}
                </td>


                <td>
                ${money(
                    result.advance
                )}
                </td>


                <td>
                ${money(
                    result.deduction
                )}
                </td>


                <td>

                    <strong>
                    ${money(
                        result.netSalary
                    )}
                    </strong>

                </td>


                <td>

                    <button

                    class="action-btn edit-btn"

                    onclick="openPayrollEditor(
                    '${employee.employeeId}',
                    '${month}'
                    )">

                    Edit

                    </button>


                    <button

                    class="action-btn success-btn"

                    onclick="savePayroll(
                    '${employee.employeeId}',
                    '${month}'
                    )">

                    Save

                    </button>

                </td>

            </tr>`;

        }

    );


    if ($("totalPayroll")) {

        $("totalPayroll")
        .textContent =
        money(
            totalPayroll
        );

    }


    if ($("payrollEmployees")) {

        $("payrollEmployees")
        .textContent =
        employeeCount;

    }


    if ($("totalOvertimeHours")) {

        $("totalOvertimeHours")
        .textContent =

        totalOvertime.toFixed(2) +
        " Hrs";

    }

}


/* =========================================================
   OPEN PAYROLL EDITOR
========================================================= */

window.openPayrollEditor =

function(
    employeeId,
    month
) {

    const employee =

        employees.find(

            e =>
            e.employeeId ===
            employeeId

        );


    if (!employee) return;


    const saved =

        payrollData.find(

            p =>

            p.employeeId ===
            employeeId &&

            p.month ===
            month

        );


    const bonus =

        Number(
            saved?.bonus || 0
        );


    const advance =

        Number(
            saved?.advance || 0
        );


    const deduction =

        Number(
            saved?.deduction || 0
        );


    const result =

        calculateEmployeePayroll(

            employee,

            month

        );


    const newBonus =

        prompt(

            "Bonus for " +
            employee.name,

            bonus

        );


    if (newBonus === null)
        return;


    const newAdvance =

        prompt(

            "Advance for " +
            employee.name,

            advance

        );


    if (newAdvance === null)
        return;


    const newDeduction =

        prompt(

            "Deduction for " +
            employee.name,

            deduction

        );


    if (newDeduction === null)
        return;


    savePayrollWithValues(

        employeeId,

        month,

        Number(
            newBonus || 0
        ),

        Number(
            newAdvance || 0
        ),

        Number(
            newDeduction || 0
        )

    );

};


/* =========================================================
   SAVE PAYROLL
   UNIQUE EMPLOYEE + MONTH
========================================================= */

window.savePayroll =

async function(
    employeeId,
    month
) {

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


    const saved =

        payrollData.find(

            p =>

            p.employeeId ===
            employeeId &&

            p.month ===
            month

        );


    const bonus =

        Number(
            saved?.bonus || 0
        );


    const advance =

        Number(
            saved?.advance || 0
        );


    const deduction =

        Number(
            saved?.deduction || 0
        );


    await savePayrollWithValues(

        employeeId,

        month,

        bonus,

        advance,

        deduction

    );

};


/* =========================================================
   SAVE PAYROLL WITH VALUES
========================================================= */

async function savePayrollWithValues(

    employeeId,

    month,

    bonus,

    advance,

    deduction

) {

    try {

        const employee =

            employees.find(

                e =>
                e.employeeId ===
                employeeId

            );


        if (!employee) return;


        /* Calculate fresh */

        const baseResult =

            calculateEmployeePayroll(

                employee,

                month

            );


        const earnedBasicSalary =

            baseResult.earnedBasicSalary;


        const overtimeAmount =

            baseResult.overtimeAmount;


        const netSalary =

            earnedBasicSalary +

            overtimeAmount +

            Number(
                bonus || 0
            ) -

            Number(
                advance || 0
            ) -

            Number(
                deduction || 0
            );


        const data = {

            employeeId,

            month,

            basicSalary:
            baseResult.basicSalary,

            earnedBasicSalary,

            fullDay:
            baseResult.fullDay,

            halfDay:
            baseResult.halfDay,

            paidLeave:
            baseResult.paidLeave,

            absent:
            baseResult.absent,

            overtime:
            baseResult.overtime,

            overtimeAmount,

            bonus:
            Number(
                bonus || 0
            ),

            advance:
            Number(
                advance || 0
            ),

            deduction:
            Number(
                deduction || 0
            ),

            netSalary,

            updatedAt:

            firebase.firestore
            .FieldValue
            .serverTimestamp()

        };


        const existing =

            payrollData.find(

                p =>

                p.employeeId ===
                employeeId &&

                p.month ===
                month

            );


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

            employee.name +

            " এর " +

            month +

            " Payroll Saved Successfully"

        );


        await loadAllData();


        /* Recalculate Payroll Table */

        calculatePayroll();


    } catch (error) {

        console.error(
            error
        );


        alert(

            "Payroll Save Error:\n" +

            error.message

        );

    }

}


/* =========================================================
   SALARY SLIP
   EMPLOYEE-WISE CALCULATION
========================================================= */

if ($("generateSalarySlipBtn")) {

    $("generateSalarySlipBtn")
    .addEventListener(

        "click",

        generateSalarySlip

    );

}


function generateSalarySlip() {

    const employeeId =

        $("salaryEmployeeSelect")
        .value;


    const month =

        $("salarySlipMonth")
        .value;


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


    /* =================
       FRESH CALCULATION
    ================= */

    const result =

        calculateEmployeePayroll(

            employee,

            month

        );


    /* =================
       MONTH NAME
    ================= */

    const year =

        Number(
            month.split("-")[0]
        );


    const monthNumber =

        Number(
            month.split("-")[1]
        );


    const monthName =

        new Date(

            year,

            monthNumber - 1,

            1

        )
        .toLocaleDateString(

            "en-IN",

            {

                month:
                "long",

                year:
                "numeric"

            }

        );


    /* =================
       SLIP DETAILS
    ================= */

    if ($("slipMonth")) {

        $("slipMonth")
        .textContent =
        monthName;

    }


    if ($("slipEmployeeName")) {

        $("slipEmployeeName")
        .textContent =

        employee.name ||
        "-";

    }


    if ($("slipEmployeeId")) {

        $("slipEmployeeId")
        .textContent =

        employee.employeeId ||
        "-";

    }


    if ($("slipDepartment")) {

        $("slipDepartment")
        .textContent =

        employee.department ||
        "-";

    }


    if ($("slipFullDay")) {

        $("slipFullDay")
        .textContent =

        result.fullDay;

    }


    if ($("slipHalfDay")) {

        $("slipHalfDay")
        .textContent =

        result.halfDay;

    }


    if ($("slipPaidLeave")) {

        $("slipPaidLeave")
        .textContent =

        result.paidLeave;

    }


    if ($("slipAbsent")) {

        $("slipAbsent")
        .textContent =

        result.absent;

    }


    if ($("slipOvertime")) {

        $("slipOvertime")
        .textContent =

        result.overtime
        .toFixed(2) +

        " Hrs";

    }


    /* =================
       SALARY
    ================= */

    if ($("slipBasicSalary")) {

        $("slipBasicSalary")
        .textContent =

        money(

            result.earnedBasicSalary

        );

    }


    if ($("slipBonus")) {

        $("slipBonus")
        .textContent =

        money(
            result.bonus
        );

    }


    if ($("slipAdvance")) {

        $("slipAdvance")
        .textContent =

        money(
            result.advance
        );

    }


    if ($("slipDeduction")) {

        $("slipDeduction")
        .textContent =

        money(
            result.deduction
        );

    }


    if ($("slipNetSalary")) {

        $("slipNetSalary")
        .textContent =

        money(

            result.netSalary

        );

    }


    /* =================
       SHOW SLIP
    ================= */

    if ($("salarySlipContainer")) {

        $("salarySlipContainer")
        .classList
        .remove(
            "hidden"
        );

    }

}


/* =========================================================
   PRINT SALARY SLIP
========================================================= */

if ($("printSalarySlipBtn")) {

    $("printSalarySlipBtn")
    .addEventListener(

        "click",

        () => {

            window.print();

        }

    );

}


/* =========================================================
   LEAVE
========================================================= */

if ($("addLeaveBtn")) {

    $("addLeaveBtn")
    .addEventListener(

        "click",

        () => {

            $("leaveForm")
            ?.reset();

            showModal(
                "leaveModal"
            );

        }

    );

}


if ($("leaveForm")) {

    $("leaveForm")
    .addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const from =
                $("leaveFrom")
                .value;


            const to =
                $("leaveTo")
                .value;


            if (to < from) {

                alert(
                    "To Date ভুল।"
                );

                return;

            }


            try {

                await db
                .collection(
                    "leaves"
                )
                .add({

                    employeeId:
                    $("leaveEmployee")
                    .value,

                    leaveType:
                    $("leaveType")
                    .value,

                    from,

                    to,

                    days:
                    calculateLeaveDays(
                        from,
                        to
                    ),

                    reason:
                    $("leaveReason")
                    .value,

                    status:
                    "Approved",

                    createdAt:

                    firebase.firestore
                    .FieldValue
                    .serverTimestamp()

                });


                hideModal(
                    "leaveModal"
                );


                await loadAllData();


            } catch (error) {

                alert(
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
            from
        );


    const end =
        new Date(
            to
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
                    onclick="deleteLeave(
                    '${leave.firestoreId}'
                    )">

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
    ) return;


    await db
    .collection(
        "leaves"
    )
    .doc(
        id
    )
    .delete();


    await loadAllData();

};


/* =========================================================
   SETTINGS
========================================================= */

async function loadSettingsForm() {

    if ($("officeStartTime")) {

        $("officeStartTime")
        .value =
        settings.officeStartTime;

    }


    if ($("officeEndTime")) {

        $("officeEndTime")
        .value =
        settings.officeEndTime;

    }


    if ($("gracePeriod")) {

        $("gracePeriod")
        .value =
        settings.gracePeriod;

    }


    if ($("weeklyOff")) {

        $("weeklyOff")
        .value =
        settings.weeklyOff;

    }


    if ($("overtimeRate")) {

        $("overtimeRate")
        .value =
        settings.overtimeRate;

    }

}


if ($("settingsForm")) {

    $("settingsForm")
    .addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            settings = {

                officeStartTime:
                $("officeStartTime")
                .value,

                officeEndTime:
                $("officeEndTime")
                .value,

                gracePeriod:
                Number(
                    $("gracePeriod")
                    .value || 0
                ),

                weeklyOff:
                Number(
                    $("weeklyOff")
                    .value
                ),

                overtimeRate:
                Number(
                    $("overtimeRate")
                    .value || 0
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


            } catch (error) {

                alert(
                    error.message
                );

            }

        }

    );

}


/* =========================================================
   EMPLOYEE ID LIST
========================================================= */

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


/* =========================================================
   SEARCH
========================================================= */

if ($("employeeSearch")) {

    $("employeeSearch")
    .addEventListener(

        "input",

        renderEmployees

    );

}


if ($("employeeDepartmentFilter")) {

    $("employeeDepartmentFilter")
    .addEventListener(

        "change",

        renderEmployees

    );

}


/* =========================================================
   DEFAULT MONTH
========================================================= */

if ($("payrollMonth")) {

    $("payrollMonth")
    .value =
    monthString(
        new Date()
    );

}


if ($("salarySlipMonth")) {

    $("salarySlipMonth")
    .value =
    monthString(
        new Date()
    );

}


/* =========================================================
   MODAL CLOSE
========================================================= */

if ($("closeEmployeeModal")) {

    $("closeEmployeeModal")
    .onclick = () =>

    hideModal(
        "employeeModal"
    );

}


if ($("cancelEmployeeBtn")) {

    $("cancelEmployeeBtn")
    .onclick = () =>

    hideModal(
        "employeeModal"
    );

}


if ($("closeAttendanceModal")) {

    $("closeAttendanceModal")
    .onclick = () =>

    hideModal(
        "attendanceModal"
    );

}


if ($("cancelAttendanceBtn")) {

    $("cancelAttendanceBtn")
    .onclick = () =>

    hideModal(
        "attendanceModal"
    );

}


if ($("closeLeaveModal")) {

    $("closeLeaveModal")
    .onclick = () =>

    hideModal(
        "leaveModal"
    );

}


if ($("cancelLeaveBtn")) {

    $("cancelLeaveBtn")
    .onclick = () =>

    hideModal(
        "leaveModal"
    );

}


/* =========================================================
   START APP
========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        updateDate();

        await loadAllData();

    }

);
/* =========================================================
EMPLOYEE PRO
FIREBASE FIRESTORE CONNECTED
NO LOGIN REQUIRED

FEATURES:
- Employee Management
- Attendance Management
- Full Day
- Night Duty
- Half Day
- Absent
- Paid Leave
- Unpaid Leave
- Holiday
- Weekly Off
- Leave Management
- Payroll
- Night Duty Payroll
- Salary Slip
- Reports
- Firebase Firestore
- Backup Export / Import
========================================================= */


/* =========================================================
FIREBASE CONFIG
========================================================= */

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


/* =========================================================
INITIALIZE FIREBASE
========================================================= */

let db = null;

try {

    firebase.initializeApp(
        firebaseConfig
    );

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


/* =========================================================
GLOBAL DATA
========================================================= */

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

let currentCalendarDate =
    new Date();

let selectedAttendanceDate =
    null;

let currentReportData = [];


/* =========================================================
HELPERS
========================================================= */

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
        ).padStart(
            2,
            "0"
        ) +

        "-" +

        String(
            d.getDate()
        ).padStart(
            2,
            "0"
        )

    );

}


function monthString(date) {

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


function money(value) {

    return (

        "" +

        Number(
            value || 0
        ).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
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
LOAD ALL FIRESTORE DATA
========================================================= */

async function loadAllData() {

    if (!db) {

        setFirebaseStatus(
            "error",
            " Firebase Error"
        );

        return;

    }

    try {

        setFirebaseStatus(
            "connecting",
            " Loading..."
        );


        /* EMPLOYEES */

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


        /* ATTENDANCE */

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


        /* LEAVES */

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


        /* PAYROLL */

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


        /* SETTINGS */

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
            " Firebase Connected"
        );


        refreshUI();


    } catch (error) {

        console.error(
            "Firestore Load Error:",
            error
        );


        setFirebaseStatus(
            "error",
            " Firestore Error"
        );


        alert(

            "Firebase  Data Load  \n\n" +

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

                                item.classList
                                    .remove(
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

                                pageEl.classList
                                    .remove(
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


                    if (
                        $("pageTitle")
                    ) {

                        $("pageTitle")
                            .textContent =
                            button.textContent
                                .trim();

                    }

                }

            );

        }

    );


/* =========================================================
DASHBOARD
========================================================= */

function updateDashboard() {

    if (!$("totalEmployees"))
        return;


    const today =
        todayString();


    $("totalEmployees")
        .textContent =
        employees.length;


    const todayRecords =

        attendanceData.filter(

            a =>
                a.date ===
                today

        );


    /* FULL DAY */

    $("presentToday")
        .textContent =

        todayRecords.filter(

            a =>
                a.status ===
                "Full Day"

        ).length;


    /* NIGHT DUTY */

    if (
        $("nightDutyToday")
    ) {

        $("nightDutyToday")
            .textContent =

            todayRecords.filter(

                a =>
                    a.status ===
                    "Night Duty"

            ).length;

    }


    /* HALF DAY */

    $("halfDayToday")
        .textContent =

        todayRecords.filter(

            a =>
                a.status ===
                "Half Day"

        ).length;


    /* ABSENT */

    $("absentToday")
        .textContent =

        todayRecords.filter(

            a =>
                a.status ===
                "Absent"

        ).length;


    /* LEAVE */

    $("leaveToday")
        .textContent =

        todayRecords.filter(

            a =>

                a.status ===
                "Paid Leave" ||

                a.status ===
                "Unpaid Leave"

        ).length;


    /* LATE */

    $("lateToday")
        .textContent =

        todayRecords.filter(

            a =>

                Number(
                    a.late || 0
                ) > 0

        ).length;


    /* OVERTIME */

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


    /* MONTHLY PAYROLL */

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


    /* DASHBOARD TABLE */

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

                        ${statusEmoji(
                            record.status
                        )}

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

        (
            $("employeeSearch")
                ?.value ||
            ""
        )

            .toLowerCase();


    const department =

        $("employeeDepartmentFilter")
            ?.value ||
        "";


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
                            e.phone ||
                            "-"
                        )}

                    </td>

                    <td>

                        ${escapeHTML(
                            e.department ||
                            "-"
                        )}

                    </td>

                    <td>

                        ${escapeHTML(
                            e.designation ||
                            "-"
                        )}

                    </td>

                    <td>

                        ${money(
                            e.salary
                        )}

                    </td>

                    <td>

                        ${escapeHTML(
                            e.joiningDate ||
                            "-"
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

                            onclick="editEmployee('${e.firestoreId}')"

                        >

                            Edit

                        </button>


                        <button

                            class="action-btn delete-btn"

                            onclick="deleteEmployee('${e.firestoreId}')"

                        >

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

            option.value =
                d;

            option.textContent =
                d;

            select.appendChild(
                option
            );

        }

    );


    select.value =
        current;

}


/* =========================================================
ADD EMPLOYEE
========================================================= */

$("addEmployeeBtn")
    ?.addEventListener(

        "click",

        () => {

            $("employeeForm")
                .reset();

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


/* =========================================================
SAVE EMPLOYEE
========================================================= */

$("employeeForm")
    ?.addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const editId =

                $("editEmployeeId")
                    .value;


            const employeeId =

                $("employeeId")
                    .value
                    .trim()
                    .toUpperCase();


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
                            .value ||

                        0

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

                        " Employee ID  "

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

                alert(

                    "Employee Save Error:\n" +

                    error.message

                );

            }

        }

    );


/* =========================================================
EDIT EMPLOYEE
========================================================= */

window.editEmployee =

    function (id) {

        const employee =

            employees.find(

                e =>
                    e.firestoreId ===
                    id

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

    async function (id) {

        const employee =

            employees.find(

                e =>
                    e.firestoreId ===
                    id

            );


        if (!employee) return;


        if (

            !confirm(

                " Employee   Attendance  ?"

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


/* =========================================================
ATTENDANCE CALENDAR
========================================================= */

$("attendanceEmployeeSelect")
    ?.addEventListener(

        "change",

        () => {

            renderAttendanceCalendar();

        }

    );


function renderAttendanceCalendar() {

    const employeeId =

        $("attendanceEmployeeSelect")
            ?.value;


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


    if (
        $("calendarTitle")
    ) {

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


        calendar.innerHTML +=

            `<div

                class="calendar-day"

                onclick="openAttendanceForDate('${date}')"

            >

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

                            " Not Set"

                    }

                </span>

            </div>`;

    }

}


/* =========================================================
OPEN ATTENDANCE
========================================================= */

window.openAttendanceForDate =

    function (date) {

        const employeeId =

            $("attendanceEmployeeSelect")
                ?.value;


        if (!employeeId) {

            alert(

                " Employee Select "

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


        if (
            $("selectedDateTitle")
        ) {

            $("selectedDateTitle")
                .textContent =

                "Attendance - " +
                date;

        }


        renderAttendanceTable();


        showModal(
            "attendanceModal"
        );

    };


/* =========================================================
SAVE ATTENDANCE
========================================================= */

$("attendanceForm")
    ?.addEventListener(

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
            ?.value;


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

                        ${statusEmoji(
                            record.status
                        )}

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

                        ${Number(
                            record.overtime || 0
                        ).toFixed(2)}

                        Hrs

                    </td>


                    <td>

                        <button

                            class="action-btn edit-btn"

                            onclick="openAttendanceForDate('${record.date}')"

                        >

                            Edit

                        </button>

                    </td>

                </tr>`;

        }

    );

}


/* =========================================================
ATTENDANCE CALCULATIONS
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


    /* NIGHT DUTY / OVERNIGHT */

    let total =

        end - start;


    if (
        total < 0
    ) {

        total += 24 * 60;

    }


    if (
        total <= 0
    ) {

        return "0 Hrs";

    }


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


function timeToMinutes(time) {

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


function calculateLate(checkIn) {

    if (!checkIn)
        return 0;


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


function calculateOvertime(checkOut) {

    if (!checkOut)
        return 0;


    const end =

        timeToMinutes(

            settings.officeEndTime

        );


    const actual =

        timeToMinutes(
            checkOut
        );


    let difference =

        actual -
        end;


    if (
        difference < 0
    ) {

        return "0.00";

    }


    return (

        difference / 60

    ).toFixed(2);

}


/* =========================================================
STATUS EMOJI
========================================================= */

function statusEmoji(status) {

    const map = {

        "Full Day":
            "",

        "Night Duty":
            "",

        "Half Day":
            "",

        "Absent":
            "",

        "Paid Leave":
            "",

        "Unpaid Leave":
            "",

        "Holiday":
            "",

        "Weekly Off":
            ""

    };


    return (

        map[status] ||

        ""

    );

}


/* =========================================================
CALENDAR BUTTONS
========================================================= */

$("previousMonth")
    ?.addEventListener(

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


$("nextMonth")
    ?.addEventListener(

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


/* =========================================================
MARK ALL PRESENT
========================================================= */

$("markAllPresentBtn")
    ?.addEventListener(

        "click",

        async () => {

            const employeeId =

                $("attendanceEmployeeSelect")
                    ?.value;


            if (!employeeId) {

                alert(
                    "Employee Select "
                );

                return;

            }


            if (

                !confirm(

                    "    Full Day  ?"

                )

            ) return;


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

                            settings
                                .officeStartTime,

                        checkOut:

                            settings
                                .officeEndTime,

                        late: 0,

                        overtime: 0

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


            } catch (error) {

                alert(
                    error.message
                );

            }

        }

    );


/* =========================================================
LEAVE
========================================================= */

$("addLeaveBtn")
    ?.addEventListener(

        "click",

        () => {

            $("leaveForm")
                .reset();

            showModal(
                "leaveModal"
            );

        }

    );


$("leaveForm")
    ?.addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const from =
                $("leaveFrom")
                    .value;


            const to =
                $("leaveTo")
                    .value;


            if (
                to < from
            ) {

                alert(
                    "To Date "
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


function calculateLeaveDays(

    from,

    to

) {

    const start =
        new Date(from);


    const end =
        new Date(to);


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

                            onclick="deleteLeave('${leave.firestoreId}')"

                        >

                            Delete

                        </button>

                    </td>

                </tr>`;

        }

    );

}


window.deleteLeave =

    async function (id) {

        if (

            !confirm(

                "Delete this leave?"

            )

        ) return;


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


/* =========================================================
PAYROLL
FULL DAY + NIGHT DUTY = FULL DAY SALARY
========================================================= */

$("calculatePayrollBtn")
    ?.addEventListener(

        "click",

        calculatePayroll

    );


function calculatePayroll() {

    const month =

        $("payrollMonth")
            .value;


    if (!month) {

        alert(
            "Payroll Month Select "
        );

        return;

    }


    const table =
        $("payrollTable");


    if (!table) return;


    table.innerHTML = "";


    let totalPayroll = 0;

    let totalOvertime = 0;

    let employeeCount = 0;


    employees

        .filter(

            employee =>

                employee.status !==
                "Inactive"

        )

        .forEach(

            employee => {


                employeeCount++;


                const records =

                    attendanceData.filter(

                        attendance =>

                            attendance.employeeId ===
                            employee.employeeId &&

                            String(
                                attendance.date ||
                                ""
                            )
                                .startsWith(
                                    month
                                )

                    );


                /* FULL DAY */

                const fullDay =

                    records.filter(

                        a =>

                            a.status ===
                            "Full Day"

                    ).length;


                /* NIGHT DUTY */

                const nightDuty =

                    records.filter(

                        a =>

                            a.status ===
                            "Night Duty"

                    ).length;


                /* HALF DAY */

                const halfDay =

                    records.filter(

                        a =>

                            a.status ===
                            "Half Day"

                    ).length;


                /* PAID LEAVE */

                const paidLeave =

                    records.filter(

                        a =>

                            a.status ===
                            "Paid Leave"

                    ).length;


                /* ABSENT */

                const absent =

                    records.filter(

                        a =>

                            a.status ===
                            "Absent"

                    ).length;


                /* OVERTIME */

                const overtime =

                    records.reduce(

                        (sum, a) =>

                            sum +

                            Number(
                                a.overtime ||
                                0
                            ),

                        0

                    );


                /* BASIC SALARY */

                const basicSalary =

                    Number(
                        employee.salary ||
                        0
                    );


                /* DAYS IN MONTH */

                const parts =
                    month.split("-");


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


                /* PER DAY SALARY */

                const perDaySalary =

                    daysInMonth > 0

                        ?

                        basicSalary /
                        daysInMonth

                        :

                        0;


                /* EARNED DAYS */

                const earnedDays =

                    fullDay +

                    nightDuty +

                    paidLeave +

                    (

                        halfDay *
                        0.5

                    );


                /* EARNED SALARY */

                const earnedSalary =

                    earnedDays *

                    perDaySalary;


                /* OVERTIME */

                const overtimeAmount =

                    overtime *

                    Number(
                        settings
                            .overtimeRate ||
                        0
                    );


                /* SAVED PAYROLL */

                const savedPayroll =

                    payrollData.find(

                        p =>

                            p.employeeId ===
                            employee.employeeId &&

                            p.month ===
                            month

                    );


                const bonus =

                    Number(
                        savedPayroll?.bonus ||
                        0
                    );


                const advance =

                    Number(
                        savedPayroll?.advance ||
                        0
                    );


                const deduction =

                    Number(
                        savedPayroll?.deduction ||
                        0
                    );


                /* NET SALARY */

                const netSalary =

                    earnedSalary +

                    overtimeAmount +

                    bonus -

                    advance -

                    deduction;


                totalPayroll +=

                    netSalary;


                totalOvertime +=

                    overtime;


                /* ROW */

                table.innerHTML +=

                    `<tr>

                        <td>

                            <strong>

                                ${escapeHTML(
                                    employee.name ||
                                    "Unknown"
                                )}

                            </strong>

                            <br>

                            <small>

                                ID:
                                ${escapeHTML(
                                    employee.employeeId
                                )}

                            </small>

                        </td>


                        <td>

                            ${money(
                                basicSalary
                            )}

                        </td>


                        <td>

                            ${fullDay}

                        </td>


                        <td>

                             ${nightDuty}

                        </td>


                        <td>

                            ${halfDay}

                        </td>


                        <td>

                            ${paidLeave}

                        </td>


                        <td>

                            ${absent}

                        </td>


                        <td>

                            ${overtime.toFixed(
                                2
                            )}

                        </td>


                        <td>

                            <input

                                type="number"

                                min="0"

                                value="${bonus}"

                                id="bonus-${employee.employeeId}"

                                style="width:90px"

                            >

                        </td>


                        <td>

                            <input

                                type="number"

                                min="0"

                                value="${advance}"

                                id="advance-${employee.employeeId}"

                                style="width:90px"

                            >

                        </td>


                        <td>

                            <input

                                type="number"

                                min="0"

                                value="${deduction}"

                                id="deduction-${employee.employeeId}"

                                style="width:90px"

                            >

                        </td>


                        <td>

                            <strong>

                                ${money(
                                    netSalary
                                )}

                            </strong>

                        </td>


                        <td>

                            <button

                                class="action-btn edit-btn"

                                onclick="savePayrollFromRow('${employee.employeeId}','${month}')"

                            >

                                Save

                            </button>

                        </td>

                    </tr>`;

            }

        );


    if (
        $("totalPayroll")
    ) {

        $("totalPayroll")
            .textContent =

            money(
                totalPayroll
            );

    }


    if (
        $("payrollEmployees")
    ) {

        $("payrollEmployees")
            .textContent =

            employeeCount;

    }


    if (
        $("totalOvertimeHours")
    ) {

        $("totalOvertimeHours")
            .textContent =

            totalOvertime.toFixed(
                2
            )

            +

            " Hrs";

    }

}


/* =========================================================
SAVE PAYROLL
========================================================= */

window.savePayrollFromRow =

    async function (

        employeeId,

        month

    ) {

        try {

            const employee =

                employees.find(

                    e =>

                        e.employeeId ===
                        employeeId

                );


            if (!employee) {

                alert(
                    "Employee  "
                );

                return;

            }


            const records =

                attendanceData.filter(

                    a =>

                        a.employeeId ===
                        employeeId &&

                        String(
                            a.date ||
                            ""
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


            const nightDuty =

                records.filter(

                    a =>

                        a.status ===
                        "Night Duty"

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

                    (sum, a) =>

                        sum +

                        Number(
                            a.overtime ||
                            0
                        ),

                    0

                );


            const basicSalary =

                Number(
                    employee.salary ||
                    0
                );


            const parts =
                month.split("-");


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


            const perDaySalary =

                basicSalary /
                daysInMonth;


            /* FULL DAY + NIGHT DUTY */

            const earnedDays =

                fullDay +

                nightDuty +

                paidLeave +

                (

                    halfDay *
                    0.5

                );


            const earnedSalary =

                earnedDays *

                perDaySalary;


            const overtimeAmount =

                overtime *

                Number(
                    settings
                        .overtimeRate ||
                    0
                );


            const bonus =

                Number(

                    $(
                        "bonus-" +
                        employeeId
                    )
                        ?.value ||

                    0

                );


            const advance =

                Number(

                    $(
                        "advance-" +
                        employeeId
                    )
                        ?.value ||

                    0

                );


            const deduction =

                Number(

                    $(
                        "deduction-" +
                        employeeId
                    )
                        ?.value ||

                    0

                );


            const netSalary =

                earnedSalary +

                overtimeAmount +

                bonus -

                advance -

                deduction;


            const existing =

                payrollData.find(

                    p =>

                        p.employeeId ===
                        employeeId &&

                        p.month ===
                        month

                );


            const data = {

                employeeId,

                employeeName:

                    employee.name ||
                    "",

                month,

                basicSalary,

                fullDay,

                nightDuty,

                halfDay,

                paidLeave,

                absent,

                earnedDays,

                overtime,

                earnedSalary,

                overtimeAmount,

                bonus,

                advance,

                deduction,

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

                employee.name +

                "  Payroll Successfully Saved\n\n" +

                "Full Day: " +

                fullDay +

                "\nNight Duty: " +

                nightDuty +

                "\nEarned Days: " +

                earnedDays +

                "\nNet Salary: " +

                money(
                    netSalary
                )

            );


            await loadAllData();


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

    };


/* =========================================================
SALARY SLIP
========================================================= */

$("generateSalarySlipBtn")
    ?.addEventListener(

        "click",

        generateSalarySlip

    );


function generateSalarySlip() {

    const employeeId =

        $("salaryEmployeeSelect")
            .value;


    const month =

        $("salarySlipMonth")
            .value;


    if (!employeeId) {

        alert(
            "Employee Select "
        );

        return;

    }


    if (!month) {

        alert(
            "Month Select "
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
            "Employee  "
        );

        return;

    }


    const payroll =

        payrollData.find(

            p =>

                p.employeeId ===
                employeeId &&

                p.month ===
                month

        );


    const records =

        attendanceData.filter(

            a =>

                a.employeeId ===
                employeeId &&

                String(
                    a.date ||
                    ""
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


    const nightDuty =

        records.filter(

            a =>

                a.status ===
                "Night Duty"

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

            (sum, a) =>

                sum +

                Number(
                    a.overtime ||
                    0
                ),

            0

        );


    const basicSalary =

        Number(
            employee.salary ||
            0
        );


    const parts =
        month.split("-");


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


    const perDaySalary =

        basicSalary /
        daysInMonth;


    const earnedDays =

        fullDay +

        nightDuty +

        paidLeave +

        (

            halfDay *
            0.5

        );


    const earnedSalary =

        earnedDays *

        perDaySalary;


    const overtimeAmount =

        overtime *

        Number(
            settings
                .overtimeRate ||
            0
        );


    const bonus =

        Number(
            payroll?.bonus ||
            0
        );


    const advance =

        Number(
            payroll?.advance ||
            0
        );


    const deduction =

        Number(
            payroll?.deduction ||
            0
        );


    const netSalary =

        payroll

            ?

            Number(
                payroll.netSalary ||
                0
            )

            :

            (

                earnedSalary +

                overtimeAmount +

                bonus -

                advance -

                deduction

            );


    /* DISPLAY */

    if (
        $("slipMonth")
    )

        $("slipMonth")
            .textContent =
            month;


    if (
        $("slipEmployeeName")
    )

        $("slipEmployeeName")
            .textContent =
            employee.name ||
            "";


    if (
        $("slipEmployeeId")
    )

        $("slipEmployeeId")
            .textContent =
            employee.employeeId ||
            "";


    if (
        $("slipDepartment")
    )

        $("slipDepartment")
            .textContent =
            employee.department ||
            "";


    if (
        $("slipFullDay")
    )

        $("slipFullDay")
            .textContent =
            fullDay;


    /* NIGHT DUTY */

    if (
        $("slipNightDuty")
    )

        $("slipNightDuty")
            .textContent =
            nightDuty;


    if (
        $("slipHalfDay")
    )

        $("slipHalfDay")
            .textContent =
            halfDay;


    if (
        $("slipPaidLeave")
    )

        $("slipPaidLeave")
            .textContent =
            paidLeave;


    if (
        $("slipAbsent")
    )

        $("slipAbsent")
            .textContent =
            absent;


    if (
        $("slipOvertime")
    )

        $("slipOvertime")
            .textContent =

            overtime.toFixed(
                2
            )

            +

            " Hrs";


    if (
        $("slipBasicSalary")
    )

        $("slipBasicSalary")
            .textContent =

            money(
                earnedSalary
            );


    if (
        $("slipBonus")
    )

        $("slipBonus")
            .textContent =

            money(
                bonus
            );


    if (
        $("slipAdvance")
    )

        $("slipAdvance")
            .textContent =

            money(
                advance
            );


    if (
        $("slipDeduction")
    )

        $("slipDeduction")
            .textContent =

            money(
                deduction
            );


    if (
        $("slipNetSalary")
    )

        $("slipNetSalary")
            .textContent =

            money(
                netSalary
            );


    if (
        $("salarySlipContainer")
    )

        $("salarySlipContainer")
            .classList
            .remove(
                "hidden"
            );

}


/* =========================================================
PRINT SALARY SLIP
========================================================= */

$("printSalarySlipBtn")
    ?.addEventListener(

        "click",

        () => {

            window.print();

        }

    );


/* =========================================================
REPORTS
========================================================= */

$("generateReportBtn")
    ?.addEventListener(

        "click",

        generateReport

    );


function generateReport() {

    const type =

        $("reportType")
            .value;


    const month =

        $("reportMonth")
            .value;


    if (!month) {

        alert(
            "Month Select "
        );

        return;

    }


    const head =
        $("reportHead");


    const body =
        $("reportBody");


    if (!head || !body)
        return;


    head.innerHTML = "";

    body.innerHTML = "";


    /* SALARY REPORT */

    if (
        type === "salary"
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

                                p.employeeName ||

                                "-"

                            )}

                        </td>

                        <td>

                            ${month}

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


    /* ATTENDANCE REPORT */

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
                    a.date ||
                    ""
                )
                    .startsWith(
                        month
                    )

        );


    if (
        type === "late"
    ) {

        currentReportData =

            currentReportData.filter(

                a =>

                    Number(
                        a.late ||
                        0
                    ) > 0

            );

    }


    if (
        type === "overtime"
    ) {

        currentReportData =

            currentReportData.filter(

                a =>

                    Number(
                        a.overtime ||
                        0
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

                        ${statusEmoji(
                            a.status
                        )}

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


/* =========================================================
CSV EXPORT
========================================================= */

$("exportReportBtn")
    ?.addEventListener(

        "click",

        () => {

            if (

                currentReportData.length ===
                0

            ) {

                alert(

                    " Report Generate "

                );

                return;

            }


            const rows =

                currentReportData.map(

                    item =>

                        Object.values(
                            item
                        )

                );


            const csv =

                rows.map(

                    row =>

                        row

                            .map(

                                value =>

                                    `"${String(
                                        value ?? ""
                                    )
                                        .replace(
                                            /"/g,
                                            '""'
                                        )}"`

                            )

                            .join(",")

                )

                    .join(
                        "\n"
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


            a.href =
                url;


            a.download =

                "employee-report.csv";


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


/* =========================================================
SETTINGS
========================================================= */

async function loadSettingsForm() {

    if (!$("officeStartTime"))
        return;


    $("officeStartTime")
        .value =
        settings.officeStartTime;


    $("officeEndTime")
        .value =
        settings.officeEndTime;


    $("gracePeriod")
        .value =
        settings.gracePeriod;


    $("weeklyOff")
        .value =
        settings.weeklyOff;


    $("overtimeRate")
        .value =
        settings.overtimeRate;

}


$("settingsForm")
    ?.addEventListener(

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
                            .value ||

                        0

                    ),

                weeklyOff:

                    Number(

                        $("weeklyOff")
                            .value

                    ),

                overtimeRate:

                    Number(

                        $("overtimeRate")
                            .value ||

                        0

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
EMPLOYEE ID FORM
========================================================= */

$("employeeIdForm")
    ?.addEventListener(

        "submit",

        async event => {

            event.preventDefault();


            const employeeId =

                $("newEmployeeId")
                    .value
                    .trim()
                    .toUpperCase();


            const name =

                $("newEmployeeName")
                    .value
                    .trim();


            if (

                !employeeId ||

                !name

            ) {

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

                        phone: "",

                        department: "",

                        designation: "",

                        salary: 0,

                        joiningDate:

                            todayString(),

                        status:
                            "Active",

                        createdAt:

                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                $("employeeIdForm")
                    .reset();


                await loadAllData();


            } catch (error) {

                alert(
                    error.message
                );

            }

        }

    );


/* =========================================================
BACKUP EXPORT
========================================================= */

$("exportBackupBtn")
    ?.addEventListener(

        "click",

        () => {

            const backup = {

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

                "employee-backup.json";


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


/* =========================================================
IMPORT BACKUP
========================================================= */

$("importBackupInput")
    ?.addEventListener(

        "change",

        event => {

            const file =

                event.target
                    .files[0];


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


                        /* SETTINGS */

                        if (
                            data.settings
                        ) {

                            await db

                                .collection(
                                    "settings"
                                )

                                .doc(
                                    "office"
                                )

                                .set(
                                    data.settings
                                );

                        }


                        /* EMPLOYEES */

                        for (

                            const employee

                            of

                            (

                                data.employees ||
                                []

                            )

                        ) {

                            await db

                                .collection(
                                    "employees"
                                )

                                .doc(
                                    employee.employeeId
                                )

                                .set(
                                    employee
                                );

                        }


                        /* ATTENDANCE */

                        for (

                            const attendance

                            of

                            (

                                data.attendanceData ||
                                []

                            )

                        ) {

                            const firestoreId =

                                attendance.firestoreId;


                            const cleanData = {

                                ...attendance

                            };


                            delete cleanData.firestoreId;


                            if (
                                firestoreId
                            ) {

                                await db

                                    .collection(
                                        "attendance"
                                    )

                                    .doc(
                                        firestoreId
                                    )

                                    .set(
                                        cleanData
                                    );

                            } else {

                                await db

                                    .collection(
                                        "attendance"
                                    )

                                    .add(
                                        cleanData
                                    );

                            }

                        }


                        /* LEAVES */

                        for (

                            const leave

                            of

                            (

                                data.leaveData ||
                                []

                            )

                        ) {

                            const firestoreId =

                                leave.firestoreId;


                            const cleanData = {

                                ...leave

                            };


                            delete cleanData.firestoreId;


                            if (
                                firestoreId
                            ) {

                                await db

                                    .collection(
                                        "leaves"
                                    )

                                    .doc(
                                        firestoreId
                                    )

                                    .set(
                                        cleanData
                                    );

                            } else {

                                await db

                                    .collection(
                                        "leaves"
                                    )

                                    .add(
                                        cleanData
                                    );

                            }

                        }


                        /* PAYROLL */

                        for (

                            const payroll

                            of

                            (

                                data.payrollData ||
                                []

                            )

                        ) {

                            const firestoreId =

                                payroll.firestoreId;


                            const cleanData = {

                                ...payroll

                            };


                            delete cleanData.firestoreId;


                            if (
                                firestoreId
                            ) {

                                await db

                                    .collection(
                                        "payroll"
                                    )

                                    .doc(
                                        firestoreId
                                    )

                                    .set(
                                        cleanData
                                    );

                            } else {

                                await db

                                    .collection(
                                        "payroll"
                                    )

                                    .add(
                                        cleanData
                                    );

                            }

                        }


                        alert(

                            "Backup Imported Successfully"

                        );


                        await loadAllData();


                    } catch (error) {

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


/* =========================================================
RESET
========================================================= */

$("resetDataBtn")
    ?.addEventListener(

        "click",

        async () => {

            if (

                !confirm(

                    "   Data Delete  ?"

                )

            ) return;


            alert(

                "Firestore-  Collection  Delete       Firebase Console  Data Delete "

            );

        }

    );


/* =========================================================
MODAL CLOSE
========================================================= */

$("closeEmployeeModal")
    ?.addEventListener(

        "click",

        () =>

            hideModal(
                "employeeModal"
            )

    );


$("cancelEmployeeBtn")
    ?.addEventListener(

        "click",

        () =>

            hideModal(
                "employeeModal"
            )

    );


$("closeAttendanceModal")
    ?.addEventListener(

        "click",

        () =>

            hideModal(
                "attendanceModal"
            )

    );


$("cancelAttendanceBtn")
    ?.addEventListener(

        "click",

        () =>

            hideModal(
                "attendanceModal"
            )

    );


$("closeLeaveModal")
    ?.addEventListener(

        "click",

        () =>

            hideModal(
                "leaveModal"
            )

    );


$("cancelLeaveBtn")
    ?.addEventListener(

        "click",

        () =>

            hideModal(
                "leaveModal"
            )

    );


/* =========================================================
SEARCH
========================================================= */

$("employeeSearch")
    ?.addEventListener(

        "input",

        renderEmployees

    );


$("employeeDepartmentFilter")
    ?.addEventListener(

        "change",

        renderEmployees

    );


/* =========================================================
DEFAULT MONTH
========================================================= */

if (
    $("payrollMonth")
) {

    $("payrollMonth")
        .value =

        monthString(
            new Date()
        );

}


if (
    $("salarySlipMonth")
) {

    $("salarySlipMonth")
        .value =

        monthString(
            new Date()
        );

}


if (
    $("reportMonth")
) {

    $("reportMonth")
        .value =

        monthString(
            new Date()
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
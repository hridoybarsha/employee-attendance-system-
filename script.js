/* =========================================================
   EMPLOYEE PRO
   COMPLETE FINAL SCRIPT.JS
   FIREBASE FIRESTORE
   NO LOGIN REQUIRED
   ========================================================= */


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDR6Ab5X3PelrvdAjLhPsCi_n4Qi6MHf-o",
    authDomain: "employee-attendance-syst-33351.firebaseapp.com",
    projectId: "employee-attendance-syst-33351",
    storageBucket: "employee-attendance-syst-33351.firebasestorage.app",
    messagingSenderId: "672059529814",
    appId: "1:672059529814:web:971eefee24b9a2ba33b9f7"
};


/* =========================================================
   FIREBASE INITIALIZE
   ========================================================= */

let db = null;

try {

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

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

let currentReportData =
    [];


/* =========================================================
   BASIC HELPERS
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
        "firebase-status " + type;

    el.textContent =
        text;

}


/* =========================================================
   LOAD FIRESTORE DATA
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
                .collection("employees")
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
                .collection("attendance")
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
                .collection("leaves")
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
                .collection("payroll")
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
                .collection("settings")
                .doc("office")
                .get();


        if (settingsDoc.exists) {

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
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const page =
                            button.dataset.page;


                        document
                            .querySelectorAll(".nav-item")
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
                            .querySelectorAll(".page")
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


                        if (
                            window.innerWidth <= 768
                        ) {

                            $("sidebar")
                                ?.classList
                                .remove(
                                    "open"
                                );

                            $("sidebarOverlay")
                                ?.classList
                                .remove(
                                    "show"
                                );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    if (!$("totalEmployees")) return;

    const today =
        todayString();


    $("totalEmployees")
        .textContent =
        employees.length;


    const todayRecords =

        attendanceData.filter(
            a =>
                a.date === today
        );


    $("presentToday")
        .textContent =

        todayRecords.filter(
            a =>
                a.status === "Full Day" ||
                a.status === "Night Duty"
        ).length;


    $("halfDayToday")
        .textContent =

        todayRecords.filter(
            a =>
                a.status === "Half Day"
        ).length;


    $("absentToday")
        .textContent =

        todayRecords.filter(
            a =>
                a.status === "Absent"
        ).length;


    $("leaveToday")
        .textContent =

        todayRecords.filter(
            a =>
                a.status === "Paid Leave" ||
                a.status === "Unpaid Leave"
        ).length;


    $("lateToday")
        .textContent =
        "0";


    $("overtimeToday")
        .textContent =
        "0.00";


    const currentMonth =
        monthString(
            new Date()
        );


    const currentPayroll =

        payrollData.filter(
            p =>
                p.month === currentMonth
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
                            record.date ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${statusEmoji(
                            record.status
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.status ||
                            "-"
                        )}
                    </td>

                    <td>
                        -
                    </td>

                </tr>`;

        }
    );

}


/* =========================================================
   EMPLOYEES
   ========================================================= */

function renderEmployees() {

    const tbody =
        $("employeeTable");

    if (!tbody) return;


    tbody.innerHTML = "";


    const search =

        (
            $("employeeSearch")?.value ||
            ""
        )
            .toLowerCase();


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
                        .includes(search) ||

                    String(
                        e.employeeId || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        e.phone || ""
                    )
                        .toLowerCase()
                        .includes(search);


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
                    .filter(Boolean)

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
   ADD / EDIT EMPLOYEE
   ========================================================= */

function setupEmployeeForm() {

    $("addEmployeeBtn")
        ?.addEventListener(
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


    $("employeeForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const editId =
                    $("editEmployeeId")
                        ?.value || "";


                const employeeId =
                    $("employeeId")
                        ?.value
                        .trim()
                        .toUpperCase();


                const data = {

                    employeeId,

                    name:
                        $("employeeName")
                            ?.value
                            .trim() || "",

                    phone:
                        $("employeePhone")
                            ?.value
                            .trim() || "",

                    department:
                        $("employeeDepartment")
                            ?.value
                            .trim() || "",

                    designation:
                        $("employeeDesignation")
                            ?.value
                            .trim() || "",

                    salary:
                        Number(
                            $("employeeSalary")
                                ?.value || 0
                        ),

                    joiningDate:
                        $("employeeJoinDate")
                            ?.value || "",

                    status:
                        $("employeeStatus")
                            ?.value ||
                        "Active",

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                };


                if (!employeeId) {

                    alert(
                        "Employee ID দিন।"
                    );

                    return;

                }


                if (!data.name) {

                    alert(
                        "Employee Name দিন।"
                    );

                    return;

                }


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
function (id) {

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
        employee.employeeId || "";

    $("employeeName")
        .value =
        employee.name || "";

    $("employeePhone")
        .value =
        employee.phone || "";

    $("employeeDepartment")
        .value =
        employee.department || "";

    $("employeeDesignation")
        .value =
        employee.designation || "";

    $("employeeSalary")
        .value =
        employee.salary || 0;

    $("employeeJoinDate")
        .value =
        employee.joiningDate || "";

    $("employeeStatus")
        .value =
        employee.status || "Active";


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
   ATTENDANCE STATUS
   ========================================================= */

function statusEmoji(status) {

    const map = {

        "Full Day": "🟢",

        "Night Duty": "🌙",

        "Half Day": "🟡",

        "Absent": "🔴",

        "Paid Leave": "🔵",

        "Unpaid Leave": "⚪",

        "Holiday": "🟣",

        "Weekly Off": "⚫"

    };


    return (
        map[status] ||
        "⚪"
    );

}


/* =========================================================
   ATTENDANCE CALENDAR
   ========================================================= */

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


    if ($("calendarTitle")) {

        $("calendarTitle")
            .textContent =

            currentCalendarDate
                .toLocaleDateString(
                    "en-IN",
                    {
                        month: "long",
                        year: "numeric"
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


        const status =
            record?.status ||
            "Not Set";


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
                            status
                        ) +
                        " " +
                        escapeHTML(
                            status
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
function (date) {

    const employeeId =

        $("attendanceEmployeeSelect")
            ?.value;


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
        employee?.name || "";


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
   ATTENDANCE FORM
   ========================================================= */

function setupAttendanceForm() {

    $("attendanceEmployeeSelect")
        ?.addEventListener(
            "change",
            renderAttendanceCalendar
        );


    $("attendanceForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const employeeId =
                    $("attendanceEmployeeId")
                        ?.value;


                const date =
                    $("attendanceDate")
                        ?.value;


                const status =
                    $("attendanceStatus")
                        ?.value;


                if (
                    !employeeId ||
                    !date ||
                    !status
                ) {

                    alert(
                        "Employee, Date এবং Status নির্বাচন করুন।"
                    );

                    return;

                }


                const data = {

                    employeeId,

                    date,

                    status,

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
            ?.value;


    if (!employeeId) {

        tbody.innerHTML =

            `<tr>
                <td colspan="5">
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
                <td colspan="5">
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
                            record.date ||
                            "-"
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
   CALENDAR BUTTONS
   ========================================================= */

function setupCalendarButtons() {

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

}


/* =========================================================
   MARK ALL PRESENT
   ========================================================= */

function setupMarkAllPresent() {

    $("markAllPresentBtn")
        ?.addEventListener(
            "click",
            async () => {

                const employeeId =

                    $("attendanceEmployeeSelect")
                        ?.value;


                if (!employeeId) {

                    alert(
                        "Employee Select করুন।"
                    );

                    return;

                }


                if (
                    !confirm(
                        "এই মাসের সব দিন Full Day করতে চান?"
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
                                "Full Day"

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

}


/* =========================================================
   LEAVE
   ========================================================= */

function setupLeaveForm() {

    $("addLeaveBtn")
        ?.addEventListener(
            "click",
            () => {

                $("leaveForm")
                    ?.reset();

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
                        ?.value;


                const to =
                    $("leaveTo")
                        ?.value;


                if (
                    !from ||
                    !to
                ) {

                    alert(
                        "Leave Date নির্বাচন করুন।"
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

                    await db
                        .collection(
                            "leaves"
                        )
                        .add({

                            employeeId:
                                $("leaveEmployee")
                                    ?.value,

                            leaveType:
                                $("leaveType")
                                    ?.value,

                            from,

                            to,

                            days:
                                calculateLeaveDays(
                                    from,
                                    to
                                ),

                            reason:
                                $("leaveReason")
                                    ?.value ||
                                "",

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
   PAYROLL CALCULATION
   ========================================================= */

function calculateEmployeePayroll(
    employee,
    month
) {

    const records =

        attendanceData.filter(
            attendance =>

                attendance.employeeId ===
                employee.employeeId &&

                String(
                    attendance.date || ""
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


    const basicSalary =

        Number(
            employee.salary || 0
        );


    const perDaySalary =

        daysInMonth > 0

        ?

        basicSalary /
        daysInMonth

        :

        0;


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


    const paidDays =

        fullDay +

        nightDuty +

        paidLeave +

        (
            halfDay *
            0.5
        );


    const earnedSalary =

        paidDays *
        perDaySalary;


    const overtime = 0;

    const overtimeAmount = 0;


    const netSalary =

        earnedSalary +

        bonus -

        advance -

        deduction;


    return {

        fullDay,

        nightDuty,

        halfDay,

        paidLeave,

        absent,

        overtime,

        basicSalary,

        earnedSalary,

        overtimeAmount,

        bonus,

        advance,

        deduction,

        netSalary

    };

}


/* =========================================================
   PAYROLL
   ========================================================= */

function setupPayroll() {

    $("calculatePayrollBtn")
        ?.addEventListener(
            "click",
            calculatePayroll
        );

}


function calculatePayroll() {

    const month =

        $("payrollMonth")
            ?.value;


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


                const result =

                    calculateEmployeePayroll(
                        employee,
                        month
                    );


                totalPayroll +=
                    result.netSalary;


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
                                result.basicSalary
                            )}
                        </td>

                        <td>
                            ${result.fullDay}
                        </td>

                        <td>
                            ${result.nightDuty}
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

                            <input
                                type="number"
                                min="0"
                                value="${result.bonus}"
                                id="bonus-${escapeHTML(
                                    employee.employeeId
                                )}"
                            >

                        </td>

                        <td>

                            <input
                                type="number"
                                min="0"
                                value="${result.advance}"
                                id="advance-${escapeHTML(
                                    employee.employeeId
                                )}"
                            >

                        </td>

                        <td>

                            <input
                                type="number"
                                min="0"
                                value="${result.deduction}"
                                id="deduction-${escapeHTML(
                                    employee.employeeId
                                )}"
                            >

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
                                onclick="savePayrollFromRow('${employee.employeeId}','${month}')"
                            >
                                Save
                            </button>

                        </td>

                    </tr>`;

            }
        );


    $("totalPayroll")
        .textContent =
        money(
            totalPayroll
        );


    $("payrollEmployees")
        .textContent =
        employeeCount;


    $("totalOvertimeHours")
        .textContent =
        "0.00 Hrs";

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
                "Employee পাওয়া যায়নি।"
            );

            return;

        }


        const result =

            calculateEmployeePayroll(
                employee,
                month
            );


        const bonus =

            Number(
                $(
                    "bonus-" +
                    employeeId
                )?.value || 0
            );


        const advance =

            Number(
                $(
                    "advance-" +
                    employeeId
                )?.value || 0
            );


        const deduction =

            Number(
                $(
                    "deduction-" +
                    employeeId
                )?.value || 0
            );


        const netSalary =

            result.earnedSalary +

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
                employee.name || "",

            month,

            basicSalary:
                result.basicSalary,

            fullDay:
                result.fullDay,

            nightDuty:
                result.nightDuty,

            halfDay:
                result.halfDay,

            paidLeave:
                result.paidLeave,

            absent:
                result.absent,

            overtime: 0,

            earnedSalary:
                result.earnedSalary,

            overtimeAmount: 0,

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

            " এর Payroll Successfully Saved\n\n" +

            "Net Salary: " +

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

function setupSalarySlip() {

    $("generateSalarySlipBtn")
        ?.addEventListener(
            "click",
            generateSalarySlip
        );


    $("printSalarySlipBtn")
        ?.addEventListener(
            "click",
            () => {

                window.print();

            }
        );

}


function generateSalarySlip() {

    const employeeId =

        $("salaryEmployeeSelect")
            ?.value;


    const month =

        $("salarySlipMonth")
            ?.value;


    if (!employeeId) {

        alert(
            "Employee Select করুন।"
        );

        return;

    }


    if (!month) {

        alert(
            "Month Select করুন।"
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
            "Employee পাওয়া যায়নি।"
        );

        return;

    }


    const result =

        calculateEmployeePayroll(
            employee,
            month
        );


    const payroll =

        payrollData.find(
            p =>
                p.employeeId ===
                employeeId &&

                p.month ===
                month
        );


    const bonus =
        Number(
            payroll?.bonus ||
            result.bonus ||
            0
        );


    const advance =
        Number(
            payroll?.advance ||
            result.advance ||
            0
        );


    const deduction =
        Number(
            payroll?.deduction ||
            result.deduction ||
            0
        );


    const netSalary =

        payroll

        ?

        Number(
            payroll.netSalary || 0
        )

        :

        (
            result.earnedSalary +
            bonus -
            advance -
            deduction
        );


    $("slipMonth")
        .textContent =
        month;


    $("slipEmployeeName")
        .textContent =
        employee.name || "";


    $("slipEmployeeId")
        .textContent =
        employee.employeeId || "";


    $("slipDepartment")
        .textContent =
        employee.department || "";


    $("slipFullDay")
        .textContent =
        result.fullDay;


    $("slipNightDuty")
        .textContent =
        result.nightDuty;


    $("slipHalfDay")
        .textContent =
        result.halfDay;


    $("slipPaidLeave")
        .textContent =
        result.paidLeave;


    $("slipAbsent")
        .textContent =
        result.absent;


    $("slipBasicSalary")
        .textContent =
        money(
            result.earnedSalary
        );


    $("slipBonus")
        .textContent =
        money(
            bonus
        );


    $("slipAdvance")
        .textContent =
        money(
            advance
        );


    $("slipDeduction")
        .textContent =
        money(
            deduction
        );


    $("slipNetSalary")
        .textContent =
        money(
            netSalary
        );


    $("salarySlipContainer")
        .classList
        .remove(
            "hidden"
        );

}


/* =========================================================
   REPORTS
   ========================================================= */

function setupReports() {

    $("generateReportBtn")
        ?.addEventListener(
            "click",
            generateReport
        );


    $("exportReportBtn")
        ?.addEventListener(
            "click",
            exportReport
        );

}


function generateReport() {

    const type =
        $("reportType")
            ?.value;


    const month =
        $("reportMonth")
            ?.value;


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


    if (!head || !body) return;


    head.innerHTML = "";

    body.innerHTML = "";


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
        type === "late" ||
        type === "overtime"
    ) {

        currentReportData = [];

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

                </tr>`;

        }
    );

}


/* =========================================================
   EXPORT REPORT
   ========================================================= */

function exportReport() {

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

                        String(
                            item[key] ?? ""
                        )
                            .replace(
                                /"/g,
                                '""'
                            )

                )

        );


    const csv =

        [
            headers,
            ...rows
        ]
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${value}"`
                        )
                        .join(",")
            )
            .join("\n");


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


/* =========================================================
   SETTINGS
   ========================================================= */

function loadSettingsForm() {

    if (!$("officeStartTime")) return;


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


function setupSettings() {

    $("settingsForm")
        ?.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                settings = {

                    officeStartTime:
                        $("officeStartTime")
                            ?.value ||
                        "09:00",

                    officeEndTime:
                        $("officeEndTime")
                            ?.value ||
                        "18:00",

                    gracePeriod:
                        Number(
                            $("gracePeriod")
                                ?.value ||
                            0
                        ),

                    weeklyOff:
                        Number(
                            $("weeklyOff")
                                ?.value ||
                            0
                        ),

                    overtimeRate:
                        Number(
                            $("overtimeRate")
                                ?.value ||
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
   BACKUP
   ========================================================= */

function setupBackup() {

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


    $("importBackupInput")
        ?.addEventListener(
            "change",
            importBackup
        );

}


async function importBackup(event) {

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


                for (
                    const employee
                    of
                    (
                        data.employees ||
                        []
                    )
                ) {

                    const cleanEmployee = {

                        ...employee

                    };


                    delete cleanEmployee
                        .firestoreId;


                    await db
                        .collection(
                            "employees"
                        )
                        .doc(
                            employee.employeeId
                        )
                        .set(
                            cleanEmployee
                        );

                }


                for (
                    const attendance
                    of
                    (
                        data.attendanceData ||
                        []
                    )
                ) {

                    const clean = {
                        ...attendance
                    };

                    delete clean.firestoreId;

                    await db
                        .collection(
                            "attendance"
                        )
                        .add(
                            clean
                        );

                }


                for (
                    const leave
                    of
                    (
                        data.leaveData ||
                        []
                    )
                ) {

                    const clean = {
                        ...leave
                    };

                    delete clean.firestoreId;

                    await db
                        .collection(
                            "leaves"
                        )
                        .add(
                            clean
                        );

                }


                for (
                    const payroll
                    of
                    (
                        data.payrollData ||
                        []
                    )
                ) {

                    const clean = {
                        ...payroll
                    };

                    delete clean.firestoreId;

                    await db
                        .collection(
                            "payroll"
                        )
                        .add(
                            clean
                        );

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


/* =========================================================
   RESET
   ========================================================= */

function setupReset() {

    $("resetDataBtn")
        ?.addEventListener(
            "click",
            async () => {

                alert(
                    "Firestore-এর সব Data Delete করার জন্য Firebase Console ব্যবহার করুন।"
                );

            }
        );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

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

}


/* =========================================================
   MODALS
   ========================================================= */

function setupModals() {

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


    document
        .querySelectorAll(".modal")
        .forEach(
            modal => {

                modal.addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            modal
                        ) {

                            modal.classList.remove(
                                "show"
                            );

                        }

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal.show"
                    )
                    .forEach(
                        modal =>
                            modal.classList.remove(
                                "show"
                            )
                    );

            }

        }
    );

}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function setupMobileSidebar() {

    const menuToggle =
        $("menuToggle");


    const sidebar =
        $("sidebar");


    const overlay =
        $("sidebarOverlay");


    if (
        menuToggle &&
        sidebar
    ) {

        menuToggle.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );


                if (overlay) {

                    overlay.classList.toggle(
                        "show"
                    );

                }

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            () => {

                sidebar
                    ?.classList
                    .remove(
                        "open"
                    );


                overlay
                    .classList
                    .remove(
                        "show"
                    );

            }
        );

    }

}


/* =========================================================
   DEFAULT MONTHS
   ========================================================= */

function setDefaultMonths() {

    const currentMonth =
        monthString(
            new Date()
        );


    if (
        $("payrollMonth") &&
        !$("payrollMonth").value
    ) {

        $("payrollMonth")
            .value =
            currentMonth;

    }


    if (
        $("salarySlipMonth") &&
        !$("salarySlipMonth").value
    ) {

        $("salarySlipMonth")
            .value =
            currentMonth;

    }


    if (
        $("reportMonth") &&
        !$("reportMonth").value
    ) {

        $("reportMonth")
            .value =
            currentMonth;

    }

}


/* =========================================================
   APP START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "EMPLOYEE PRO Starting..."
        );


        setDefaultMonths();


        setupNavigation();

        setupEmployeeForm();

        setupAttendanceForm();

        setupCalendarButtons();

        setupMarkAllPresent();

        setupLeaveForm();

        setupPayroll();

        setupSalarySlip();

        setupReports();

        setupSettings();

        setupBackup();

        setupReset();

        setupSearch();

        setupModals();

        setupMobileSidebar();


        updateDate();


        if (!db) {

            setFirebaseStatus(
                "error",
                "🔴 Firebase Not Connected"
            );

            return;

        }


        await loadAllData();


        console.log(
            "EMPLOYEE PRO Ready"
        );

    }
);


/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "JavaScript Error:",
            event.error ||
            event.message
        );

    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Unhandled Promise Error:",
            event.reason
        );

    }
);


console.log(
    "EMPLOYEE PRO - Complete Final Script Loaded"
);
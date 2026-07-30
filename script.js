// ============================================================
// EMPLOYEE PRO
// FIREBASE FIRESTORE - COMPLETE SCRIPT
// ============================================================

"use strict";

// ============================================================
// GLOBAL DATA
// ============================================================

let employees = [];
let attendance = [];
let leaves = [];
let payroll = [];

let settings = {
    officeStartTime: "09:00",
    officeEndTime: "18:00",
    gracePeriod: 15,
    weeklyOff: 0,
    overtimeRate: 0
};

let currentCalendarDate = new Date();
let selectedAttendanceDate = getToday();

let currentReportData = [];


// ============================================================
// BASIC HELPERS
// ============================================================

function getToday() {
    const d = new Date();

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getCurrentMonth() {
    const d = new Date();

    return `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}`;
}


function formatDate(date) {

    if (!date) return "";

    const d = new Date(date + "T00:00:00");

    if (isNaN(d)) return date;

    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatCurrency(amount) {

    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

}


function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function showMessage(message) {
    alert(message);
}


function getEmployee(employeeId) {

    return employees.find(
        e => e.id === employeeId ||
             e.employeeId === employeeId
    );

}


// ============================================================
// FIREBASE DATA LOADING
// ============================================================

async function loadAllData() {

    try {

        const [
            employeeSnapshot,
            attendanceSnapshot,
            leaveSnapshot,
            payrollSnapshot,
            settingsSnapshot
        ] = await Promise.all([

            db.collection(COLLECTIONS.EMPLOYEES).get(),

            db.collection(COLLECTIONS.ATTENDANCE).get(),

            db.collection(COLLECTIONS.LEAVES).get(),

            db.collection(COLLECTIONS.PAYROLL).get(),

            db.collection(COLLECTIONS.SETTINGS)
                .doc(SETTINGS_DOC)
                .get()

        ]);


        employees = employeeSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        attendance = attendanceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        leaves = leaveSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        payroll = payrollSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));


        if (settingsSnapshot.exists) {

            settings = {
                ...settings,
                ...settingsSnapshot.data()
            };

        }


        renderAll();


        console.log("✅ All Firebase Data Loaded");

    } catch (error) {

        console.error(
            "Firebase Data Loading Error:",
            error
        );

        showMessage(
            "Firebase থেকে Data Load করা যায়নি। Firestore Rules এবং Firebase Config পরীক্ষা করুন।"
        );

    }

}


// ============================================================
// RENDER ALL
// ============================================================

function renderAll() {

    renderEmployees();

    renderEmployeeFilters();

    renderLeaveEmployees();

    renderSalaryEmployees();

    renderDashboard();

    renderAttendanceCalendar();

    renderLeaveTable();

    renderPayroll();

    renderSettings();

    updateCurrentDate();

    updateDashboardStats();

}


// ============================================================
// CURRENT DATE
// ============================================================

function updateCurrentDate() {

    const element = document.getElementById(
        "currentDate"
    );

    if (!element) return;

    element.textContent = new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

}


// ============================================================
// NAVIGATION
// ============================================================

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
                    ).forEach(item => {

                        item.classList.remove(
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


                    const title =
                        document.getElementById(
                            "pageTitle"
                        );

                    if (title) {

                        title.textContent =
                            button.textContent
                                .replace(/[^\w\s]/g, "")
                                .trim();

                    }

                }

            );

        });

}


// ============================================================
// EMPLOYEE MANAGEMENT
// ============================================================

function openEmployeeModal(employee = null) {

    const modal =
        document.getElementById(
            "employeeModal"
        );

    document.getElementById(
        "employeeForm"
    ).reset();


    document.getElementById(
        "editEmployeeId"
    ).value = "";


    if (employee) {

        document.getElementById(
            "employeeModalTitle"
        ).textContent =
            "Edit Employee";


        document.getElementById(
            "editEmployeeId"
        ).value =
            employee.id;


        document.getElementById(
            "employeeId"
        ).value =
            employee.employeeId || "";


        document.getElementById(
            "employeeName"
        ).value =
            employee.name || "";


        document.getElementById(
            "employeePhone"
        ).value =
            employee.phone || "";


        document.getElementById(
            "employeeDepartment"
        ).value =
            employee.department || "";


        document.getElementById(
            "employeeDesignation"
        ).value =
            employee.designation || "";


        document.getElementById(
            "employeeSalary"
        ).value =
            employee.salary || "";


        document.getElementById(
            "employeeJoinDate"
        ).value =
            employee.joinDate || "";


        document.getElementById(
            "employeeStatus"
        ).value =
            employee.status || "Active";

    } else {

        document.getElementById(
            "employeeModalTitle"
        ).textContent =
            "Add Employee";

    }


    modal.classList.add("show");

}


function closeEmployeeModal() {

    document.getElementById(
        "employeeModal"
    ).classList.remove("show");

}


async function saveEmployee(event) {

    event.preventDefault();

    const editId =
        document.getElementById(
            "editEmployeeId"
        ).value;


    const employeeData = {

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
            ) || 0,

        joinDate:
            document.getElementById(
                "employeeJoinDate"
            ).value,

        status:
            document.getElementById(
                "employeeStatus"
            ).value,

        updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };


    try {

        if (editId) {

            await db.collection(
                COLLECTIONS.EMPLOYEES
            )
            .doc(editId)
            .update(employeeData);

            showMessage(
                "Employee updated successfully."
            );

        } else {

            employeeData.createdAt =
                firebase.firestore.FieldValue
                    .serverTimestamp();


            await db.collection(
                COLLECTIONS.EMPLOYEES
            )
            .add(employeeData);


            showMessage(
                "Employee added successfully."
            );

        }


        closeEmployeeModal();

        await loadAllData();

    } catch (error) {

        console.error(error);

        showMessage(
            "Employee save করতে সমস্যা হয়েছে।"
        );

    }

}


async function deleteEmployee(id) {

    const employee =
        getEmployee(id);

    if (!employee) return;


    if (
        !confirm(
            `Delete ${employee.name}?`
        )
    ) return;


    try {

        await db.collection(
            COLLECTIONS.EMPLOYEES
        )
        .doc(id)
        .delete();


        employees =
            employees.filter(
                e => e.id !== id
            );


        renderAll();

        showMessage(
            "Employee deleted successfully."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Employee delete করা যায়নি।"
        );

    }

}


// ============================================================
// EMPLOYEE TABLE
// ============================================================

function renderEmployees() {

    const table =
        document.getElementById(
            "employeeTable"
        );

    if (!table) return;


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
        employees.filter(employee => {

            const matchSearch =
                !search ||

                employee.name
                    ?.toLowerCase()
                    .includes(search) ||

                employee.employeeId
                    ?.toLowerCase()
                    .includes(search) ||

                employee.phone
                    ?.toLowerCase()
                    .includes(search);


            const matchDepartment =
                !department ||

                employee.department ===
                department;


            return (
                matchSearch &&
                matchDepartment
            );

        });


    table.innerHTML = "";


    if (!filtered.length) {

        table.innerHTML = `
            <tr>
                <td colspan="9">
                    No employees found
                </td>
            </tr>
        `;

        return;

    }


    filtered.forEach(employee => {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>${escapeHTML(
                employee.employeeId
            )}</td>

            <td>
                <strong>${escapeHTML(
                    employee.name
                )}</strong>
            </td>

            <td>${escapeHTML(
                employee.phone
            )}</td>

            <td>${escapeHTML(
                employee.department
            )}</td>

            <td>${escapeHTML(
                employee.designation
            )}</td>

            <td>${formatCurrency(
                employee.salary
            )}</td>

            <td>${formatDate(
                employee.joinDate
            )}</td>

            <td>
                <span class="status-badge">
                    ${escapeHTML(
                        employee.status
                    )}
                </span>
            </td>

            <td>

                <button
                    class="secondary-btn"
                    onclick="editEmployee('${employee.id}')"
                >
                    ✏️
                </button>

                <button
                    class="danger-btn"
                    onclick="deleteEmployee('${employee.id}')"
                >
                    🗑️
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


function editEmployee(id) {

    const employee =
        getEmployee(id);

    if (employee) {

        openEmployeeModal(
            employee
        );

    }

}


// ============================================================
// DEPARTMENT FILTER
// ============================================================

function renderEmployeeFilters() {

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
                    e => e.department
                )
                .filter(Boolean)
        )
    ];


    select.innerHTML =
        `<option value="">
            All Departments
        </option>`;


    departments.forEach(department => {

        const option =
            document.createElement(
                "option"
            );

        option.value =
            department;

        option.textContent =
            department;

        select.appendChild(
            option
        );

    });


    select.value =
        current;

}


// ============================================================
// ATTENDANCE CALENDAR
// ============================================================

function renderAttendanceCalendar() {

    const calendar =
        document.getElementById(
            "attendanceCalendar"
        );

    if (!calendar) return;


    const year =
        currentCalendarDate
            .getFullYear();


    const month =
        currentCalendarDate
            .getMonth();


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


    document.getElementById(
        "calendarTitle"
    ).textContent =
        currentCalendarDate.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    calendar.innerHTML = "";


    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const blank =
            document.createElement(
                "div"
            );

        blank.className =
            "calendar-day empty";

        calendar.appendChild(
            blank
        );

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


        const dayAttendance =
            attendance.filter(
                a => a.date === date
            );


        const full =
            dayAttendance.filter(
                a => a.status === "Full Day"
            ).length;


        const half =
            dayAttendance.filter(
                a => a.status === "Half Day"
            ).length;


        const absent =
            dayAttendance.filter(
                a => a.status === "Absent"
            ).length;


        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "calendar-day";


        if (
            date ===
            selectedAttendanceDate
        ) {

            cell.classList.add(
                "selected"
            );

        }


        cell.innerHTML = `

            <strong>${day}</strong>

            <small>
                🟢 ${full}
                🟡 ${half}
                🔴 ${absent}
            </small>

        `;


        cell.addEventListener(
            "click",
            () => {

                selectedAttendanceDate =
                    date;

                renderAttendanceCalendar();

                renderAttendanceDetails(
                    date
                );

            }
        );


        calendar.appendChild(
            cell
        );

    }

}


// ============================================================
// ATTENDANCE DETAILS
// ============================================================

function renderAttendanceDetails(
    date
) {

    const container =
        document.getElementById(
            "attendanceDetails"
        );


    const title =
        document.getElementById(
            "selectedDateTitle"
        );


    const table =
        document.getElementById(
            "attendanceTable"
        );


    if (!container || !table) return;


    container.classList.remove(
        "hidden"
    );


    title.textContent =
        `Attendance - ${formatDate(
            date
        )}`;


    table.innerHTML = "";


    employees.forEach(employee => {

        const record =
            attendance.find(
                a =>
                    a.employeeId ===
                    employee.id &&

                    a.date ===
                    date
            );


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>${escapeHTML(
                employee.employeeId
            )}</td>

            <td>${escapeHTML(
                employee.name
            )}</td>

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
                ${record?.status || "Absent"}
            </td>

            <td>
                ${record?.late || 0} Min
            </td>

            <td>
                ${record?.overtime || 0} Hrs
            </td>

            <td>

                <button
                    class="primary-btn"
                    onclick="openAttendanceModal(
                        '${employee.id}',
                        '${date}'
                    )"
                >
                    ✏️ Update
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


// ============================================================
// ATTENDANCE MODAL
// ============================================================

function openAttendanceModal(
    employeeId,
    date
) {

    const employee =
        getEmployee(employeeId);

    if (!employee) return;


    const record =
        attendance.find(
            a =>
                a.employeeId ===
                employeeId &&

                a.date ===
                date
        );


    document.getElementById(
        "attendanceEmployeeId"
    ).value =
        employeeId;


    document.getElementById(
        "attendanceDate"
    ).value =
        date;


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


    document.getElementById(
        "attendanceModal"
    ).classList.add(
        "show"
    );

}


function closeAttendanceModal() {

    document.getElementById(
        "attendanceModal"
    ).classList.remove(
        "show"
    );

}


// ============================================================
// ATTENDANCE CALCULATION
// ============================================================

function calculateHours(
    checkIn,
    checkOut
) {

    if (
        !checkIn ||
        !checkOut
    ) {

        return 0;

    }


    const [
        inHour,
        inMin
    ] =
        checkIn
            .split(":")
            .map(Number);


    const [
        outHour,
        outMin
    ] =
        checkOut
            .split(":")
            .map(Number);


    let minutes =
        (
            outHour * 60 +
            outMin
        ) -
        (
            inHour * 60 +
            inMin
        );


    if (minutes < 0) {

        minutes += 24 * 60;

    }


    return Number(
        (
            minutes / 60
        ).toFixed(2)
    );

}


function calculateLate(
    checkIn
) {

    if (!checkIn) return 0;


    const [
        h,
        m
    ] =
        checkIn
            .split(":")
            .map(Number);


    const [
        officeH,
        officeM
    ] =
        settings.officeStartTime
            .split(":")
            .map(Number);


    const actual =
        h * 60 + m;


    const office =
        officeH * 60 +
        officeM;


    const late =
        actual -
        office -
        Number(
            settings.gracePeriod || 0
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


    const [
        h,
        m
    ] =
        checkOut
            .split(":")
            .map(Number);


    const [
        officeH,
        officeM
    ] =
        settings.officeEndTime
            .split(":")
            .map(Number);


    const actual =
        h * 60 + m;


    const office =
        officeH * 60 +
        officeM;


    const overtimeMinutes =
        Math.max(
            0,
            actual -
            office
        );


    return Number(
        (
            overtimeMinutes / 60
        ).toFixed(2)
    );

}


// ============================================================
// SAVE ATTENDANCE
// ============================================================

async function saveAttendance(
    event
) {

    event.preventDefault();


    const employeeId =
        document.getElementById(
            "attendanceEmployeeId"
        ).value;


    const date =
        document.getElementById(
            "attendanceDate"
        ).value;


    const checkIn =
        document.getElementById(
            "checkInTime"
        ).value;


    const checkOut =
        document.getElementById(
            "checkOutTime"
        ).value;


    const status =
        document.getElementById(
            "attendanceStatus"
        ).value;


    const workingHours =
        calculateHours(
            checkIn,
            checkOut
        );


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

        workingHours,

        late,

        overtime,

        updatedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    try {

        const existing =
            attendance.find(
                a =>
                    a.employeeId ===
                    employeeId &&

                    a.date ===
                    date
            );


        if (existing) {

            await db.collection(
                COLLECTIONS.ATTENDANCE
            )
            .doc(existing.id)
            .update(data);

        } else {

            data.createdAt =
                firebase.firestore
                    .FieldValue
                    .serverTimestamp();


            await db.collection(
                COLLECTIONS.ATTENDANCE
            )
            .add(data);

        }


        closeAttendanceModal();

        await loadAllData();

        renderAttendanceDetails(
            date
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Attendance save করা যায়নি।"
        );

    }

}


// ============================================================
// MARK ALL PRESENT
// ============================================================

async function markAllPresent() {

    if (!employees.length) {

        showMessage(
            "কোনো Employee নেই।"
        );

        return;

    }


    if (
        !confirm(
            `Mark all ${employees.length} employees as Full Day?`
        )
    ) return;


    try {

        const batch =
            db.batch();


        employees.forEach(employee => {

            const existing =
                attendance.find(
                    a =>
                        a.employeeId ===
                        employee.id &&

                        a.date ===
                        selectedAttendanceDate
                );


            const data = {

                employeeId:
                    employee.id,

                date:
                    selectedAttendanceDate,

                checkIn:
                    settings.officeStartTime,

                checkOut:
                    settings.officeEndTime,

                status:
                    "Full Day",

                workingHours:
                    calculateHours(
                        settings.officeStartTime,
                        settings.officeEndTime
                    ),

                late: 0,

                overtime: 0,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            };


            if (existing) {

                batch.update(
                    db.collection(
                        COLLECTIONS.ATTENDANCE
                    ).doc(existing.id),
                    data
                );

            } else {

                const ref =
                    db.collection(
                        COLLECTIONS.ATTENDANCE
                    ).doc();


                batch.set(
                    ref,
                    data
                );

            }

        });


        await batch.commit();


        await loadAllData();

        renderAttendanceDetails(
            selectedAttendanceDate
        );


        showMessage(
            "All employees marked Full Day."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Attendance update failed."
        );

    }

}


// ============================================================
// MARK HOLIDAY
// ============================================================

async function markHoliday() {

    const date =
        selectedAttendanceDate;


    try {

        const batch =
            db.batch();


        employees.forEach(employee => {

            const existing =
                attendance.find(
                    a =>
                        a.employeeId ===
                        employee.id &&

                        a.date ===
                        date
                );


            const data = {

                employeeId:
                    employee.id,

                date,

                checkIn: "",

                checkOut: "",

                status:
                    "Holiday",

                workingHours: 0,

                late: 0,

                overtime: 0

            };


            if (existing) {

                batch.update(
                    db.collection(
                        COLLECTIONS.ATTENDANCE
                    ).doc(existing.id),
                    data
                );

            } else {

                batch.set(
                    db.collection(
                        COLLECTIONS.ATTENDANCE
                    ).doc(),
                    data
                );

            }

        });


        await batch.commit();

        await loadAllData();

        renderAttendanceDetails(
            date
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Holiday mark করা যায়নি।"
        );

    }

}


// ============================================================
// LEAVE MANAGEMENT
// ============================================================

function renderLeaveEmployees() {

    const select =
        document.getElementById(
            "leaveEmployee"
        );

    if (!select) return;


    select.innerHTML =
        `<option value="">
            Select Employee
        </option>`;


    employees.forEach(employee => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            employee.id;


        option.textContent =
            `${employee.employeeId} - ${employee.name}`;


        select.appendChild(
            option
        );

    });

}


function calculateLeaveDays(
    from,
    to
) {

    if (!from || !to) return 0;


    const start =
        new Date(
            from + "T00:00:00"
        );


    const end =
        new Date(
            to + "T00:00:00"
        );


    const difference =
        end - start;


    return Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    ) + 1;

}


async function saveLeave(
    event
) {

    event.preventDefault();


    const employeeId =
        document.getElementById(
            "leaveEmployee"
        ).value;


    const leaveType =
        document.getElementById(
            "leaveType"
        ).value;


    const from =
        document.getElementById(
            "leaveFrom"
        ).value;


    const to =
        document.getElementById(
            "leaveTo"
        ).value;


    const reason =
        document.getElementById(
            "leaveReason"
        ).value.trim();


    if (to < from) {

        showMessage(
            "To date cannot be before From date."
        );

        return;

    }


    const days =
        calculateLeaveDays(
            from,
            to
        );


    const data = {

        employeeId,

        leaveType,

        from,

        to,

        days,

        reason,

        status:
            "Approved",

        createdAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    try {

        await db.collection(
            COLLECTIONS.LEAVES
        )
        .add(data);


        closeLeaveModal();

        await loadAllData();

        showMessage(
            "Leave added successfully."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Leave save করা যায়নি।"
        );

    }

}


function renderLeaveTable() {

    const table =
        document.getElementById(
            "leaveTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (!leaves.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No leave records found
                </td>
            </tr>
        `;

        return;

    }


    leaves.forEach(leave => {

        const employee =
            getEmployee(
                leave.employeeId
            );


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>
                ${escapeHTML(
                    employee?.name ||
                    "Unknown"
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
                    leave.reason
                )}
            </td>

            <td>
                ${escapeHTML(
                    leave.status
                )}
            </td>

            <td>

                <button
                    class="danger-btn"
                    onclick="deleteLeave('${leave.id}')"
                >
                    🗑️
                </button>

            </td>

        `;


        table.appendChild(row);

    });

}


async function deleteLeave(id) {

    if (
        !confirm(
            "Delete this leave record?"
        )
    ) return;


    try {

        await db.collection(
            COLLECTIONS.LEAVES
        )
        .doc(id)
        .delete();


        await loadAllData();

    } catch (error) {

        console.error(error);

        showMessage(
            "Leave delete করা যায়নি।"
        );

    }

}


function openLeaveModal() {

    document.getElementById(
        "leaveForm"
    ).reset();


    document.getElementById(
        "leaveModal"
    ).classList.add(
        "show"
    );

}


function closeLeaveModal() {

    document.getElementById(
        "leaveModal"
    ).classList.remove(
        "show"
    );

}


// ============================================================
// PAYROLL
// ============================================================

function getPayrollCalculation(
    employee,
    month
) {

    const records =
        attendance.filter(
            a =>
                a.employeeId ===
                employee.id &&

                a.date.startsWith(
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


    const daysInMonth =
        new Date(
            Number(
                month.split("-")[0]
            ),
            Number(
                month.split("-")[1]
            ),
            0
        ).getDate();


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


    const overtimeAmount =
        overtime *
        Number(
            settings.overtimeRate || 0
        );


    return {

        fullDay,

        halfDay,

        paidLeave,

        absent,

        overtime,

        earnedBasic,

        overtimeAmount,

        bonus: 0,

        advance: 0,

        deduction: 0,

        netSalary:
            earnedBasic +
            overtimeAmount

    };

}


function renderPayroll() {

    const table =
        document.getElementById(
            "payrollTable"
        );


    if (!table) return;


    const month =
        document.getElementById(
            "payrollMonth"
        )?.value ||
        getCurrentMonth();


    table.innerHTML = "";


    let totalPayroll = 0;

    let totalOvertime = 0;


    employees.forEach(employee => {

        const calculation =
            getPayrollCalculation(
                employee,
                month
            );


        const saved =
            payroll.find(
                p =>
                    p.employeeId ===
                    employee.id &&

                    p.month ===
                    month
            );


        const bonus =
            Number(
                saved?.bonus ||
                calculation.bonus
            );


        const advance =
            Number(
                saved?.advance ||
                calculation.advance
            );


        const deduction =
            Number(
                saved?.deduction ||
                calculation.deduction
            );


        const netSalary =
            calculation.netSalary +
            bonus -
            advance -
            deduction;


        totalPayroll +=
            netSalary;


        totalOvertime +=
            calculation.overtime;


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>
                ${escapeHTML(
                    employee.name
                )}
            </td>

            <td>
                ${formatCurrency(
                    employee.salary
                )}
            </td>

            <td>
                ${calculation.fullDay}
            </td>

            <td>
                ${calculation.halfDay}
            </td>

            <td>
                ${calculation.paidLeave}
            </td>

            <td>
                ${calculation.absent}
            </td>

            <td>
                ${calculation.overtime.toFixed(2)} Hrs
            </td>

            <td>
                ${formatCurrency(
                    bonus
                )}
            </td>

            <td>
                ${formatCurrency(
                    advance
                )}
            </td>

            <td>
                ${formatCurrency(
                    deduction
                )}
            </td>

            <td>
                <strong>
                    ${formatCurrency(
                        netSalary
                    )}
                </strong>
            </td>

            <td>

                <button
                    class="primary-btn"
                    onclick="savePayrollRecord(
                        '${employee.id}',
                        '${month}',
                        ${bonus},
                        ${advance},
                        ${deduction}
                    )"
                >
                    💾
                </button>

            </td>

        `;


        table.appendChild(row);

    });


    document.getElementById(
        "totalPayroll"
    ).textContent =
        formatCurrency(
            totalPayroll
        );


    document.getElementById(
        "payrollEmployees"
    ).textContent =
        employees.length;


    document.getElementById(
        "totalOvertimeHours"
    ).textContent =
        `${totalOvertime.toFixed(
            2
        )} Hrs`;

}


async function savePayrollRecord(
    employeeId,
    month,
    bonus,
    advance,
    deduction
) {

    const calculation =
        getPayrollCalculation(
            getEmployee(
                employeeId
            ),
            month
        );


    const data = {

        employeeId,

        month,

        basicSalary:
            getEmployee(
                employeeId
            )?.salary || 0,

        fullDay:
            calculation.fullDay,

        halfDay:
            calculation.halfDay,

        paidLeave:
            calculation.paidLeave,

        absent:
            calculation.absent,

        overtime:
            calculation.overtime,

        bonus,

        advance,

        deduction,

        netSalary:
            calculation.netSalary +
            bonus -
            advance -
            deduction,

        updatedAt:
            firebase.firestore
                .FieldValue
                .serverTimestamp()

    };


    try {

        const existing =
            payroll.find(
                p =>
                    p.employeeId ===
                    employeeId &&

                    p.month ===
                    month
            );


        if (existing) {

            await db.collection(
                COLLECTIONS.PAYROLL
            )
            .doc(existing.id)
            .update(data);

        } else {

            await db.collection(
                COLLECTIONS.PAYROLL
            )
            .add(data);

        }


        await loadAllData();


        showMessage(
            "Payroll saved successfully."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Payroll save করা যায়নি।"
        );

    }

}


// ============================================================
// SALARY SLIP
// ============================================================

function renderSalaryEmployees() {

    const select =
        document.getElementById(
            "salaryEmployeeSelect"
        );


    if (!select) return;


    select.innerHTML =
        `<option value="">
            Select Employee
        </option>`;


    employees.forEach(employee => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            employee.id;


        option.textContent =
            `${employee.employeeId} - ${employee.name}`;


        select.appendChild(
            option
        );

    });

}


function generateSalarySlip() {

    const employeeId =
        document.getElementById(
            "salaryEmployeeSelect"
        ).value;


    const month =
        document.getElementById(
            "salarySlipMonth"
        ).value ||
        getCurrentMonth();


    if (!employeeId) {

        showMessage(
            "Select an employee."
        );

        return;

    }


    const employee =
        getEmployee(
            employeeId
        );


    const calculation =
        getPayrollCalculation(
            employee,
            month
        );


    const saved =
        payroll.find(
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


    const net =
        calculation.netSalary +
        bonus -
        advance -
        deduction;


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
        calculation.fullDay;


    document.getElementById(
        "slipHalfDay"
    ).textContent =
        calculation.halfDay;


    document.getElementById(
        "slipPaidLeave"
    ).textContent =
        calculation.paidLeave;


    document.getElementById(
        "slipAbsent"
    ).textContent =
        calculation.absent;


    document.getElementById(
        "slipOvertime"
    ).textContent =
        `${calculation.overtime.toFixed(
            2
        )} Hrs`;


    document.getElementById(
        "slipBasicSalary"
    ).textContent =
        formatCurrency(
            calculation.earnedBasic
        );


    document.getElementById(
        "slipBonus"
    ).textContent =
        formatCurrency(
            bonus
        );


    document.getElementById(
        "slipAdvance"
    ).textContent =
        formatCurrency(
            advance
        );


    document.getElementById(
        "slipDeduction"
    ).textContent =
        formatCurrency(
            deduction
        );


    document.getElementById(
        "slipNetSalary"
    ).textContent =
        formatCurrency(
            net
        );


    document.getElementById(
        "salarySlipContainer"
    ).classList.remove(
        "hidden"
    );

}


// ============================================================
// DASHBOARD
// ============================================================

function renderDashboard() {

    const table =
        document.getElementById(
            "dashboardAttendance"
        );


    if (!table) return;


    const today =
        getToday();


    table.innerHTML = "";


    employees.forEach(employee => {

        const record =
            attendance.find(
                a =>
                    a.employeeId ===
                    employee.id &&

                    a.date ===
                    today
            );


        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

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
                ${record?.status || "Absent"}
            </td>

        `;


        table.appendChild(row);

    });

}


function updateDashboardStats() {

    const today =
        getToday();


    const todayRecords =
        attendance.filter(
            a =>
                a.date ===
                today
        );


    const present =
        todayRecords.filter(
            a =>
                a.status ===
                "Full Day"
        ).length;


    const half =
        todayRecords.filter(
            a =>
                a.status ===
                "Half Day"
        ).length;


    const absent =
        employees.filter(
            employee => {

                const record =
                    todayRecords.find(
                        a =>
                            a.employeeId ===
                            employee.id
                    );

                return (
                    !record ||
                    record.status ===
                    "Absent"
                );

            }
        ).length;


    const leave =
        todayRecords.filter(
            a =>
                a.status ===
                    "Paid Leave" ||

                a.status ===
                    "Unpaid Leave"
        ).length;


    const late =
        todayRecords.filter(
            a =>
                Number(
                    a.late || 0
                ) > 0
        ).length;


    const overtime =
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
        );


    document.getElementById(
        "totalEmployees"
    ).textContent =
        employees.length;


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
        `${overtime.toFixed(
            2
        )} Hrs`;


    const monthlyPayroll =
        employees.reduce(
            (
                sum,
                employee
            ) => {

                const calculation =
                    getPayrollCalculation(
                        employee,
                        getCurrentMonth()
                    );

                return (
                    sum +
                    calculation.netSalary
                );

            },
            0
        );


    document.getElementById(
        "monthlyPayroll"
    ).textContent =
        formatCurrency(
            monthlyPayroll
        );

}


// ============================================================
// SETTINGS
// ============================================================

function renderSettings() {

    const start =
        document.getElementById(
            "officeStartTime"
        );


    if (!start) return;


    start.value =
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


async function saveSettings(
    event
) {

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


    try {

        await db.collection(
            COLLECTIONS.SETTINGS
        )
        .doc(SETTINGS_DOC)
        .set(
            settings,
            {
                merge: true
            }
        );


        showMessage(
            "Settings saved successfully."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Settings save করা যায়নি।"
        );

    }

}


// ============================================================
// REPORTS
// ============================================================

function generateReport() {

    const type =
        document.getElementById(
            "reportType"
        ).value;


    const month =
        document.getElementById(
            "reportMonth"
        ).value ||
        getCurrentMonth();


    const head =
        document.getElementById(
            "reportHead"
        );


    const body =
        document.getElementById(
            "reportBody"
        );


    head.innerHTML = "";

    body.innerHTML = "";


    let headers = [];


    if (
        type ===
        "attendance"
    ) {

        headers = [
            "Employee",
            "Full Day",
            "Half Day",
            "Paid Leave",
            "Absent"
        ];

    } else if (
        type ===
        "late"
    ) {

        headers = [
            "Employee",
            "Late Count",
            "Late Minutes"
        ];

    } else if (
        type ===
        "overtime"
    ) {

        headers = [
            "Employee",
            "Overtime Hours"
        ];

    } else if (
        type ===
        "salary"
    ) {

        headers = [
            "Employee",
            "Basic Salary",
            "Net Salary"
        ];

    }


    const headerRow =
        document.createElement(
            "tr"
        );


    headers.forEach(header => {

        const th =
            document.createElement(
                "th"
            );


        th.textContent =
            header;


        headerRow.appendChild(
            th
        );

    });


    head.appendChild(
        headerRow
    );


    currentReportData = [];


    employees.forEach(employee => {

        const records =
            attendance.filter(
                a =>
                    a.employeeId ===
                    employee.id &&

                    a.date.startsWith(
                        month
                    )
            );


        let rowData = [];


        if (
            type ===
            "attendance"
        ) {

            const full =
                records.filter(
                    a =>
                        a.status ===
                        "Full Day"
                ).length;


            const half =
                records.filter(
                    a =>
                        a.status ===
                        "Half Day"
                ).length;


            const paid =
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


            rowData = [

                employee.name,

                full,

                half,

                paid,

                absent

            ];

        }


        if (
            type ===
            "late"
        ) {

            const lateCount =
                records.filter(
                    a =>
                        Number(
                            a.late || 0
                        ) > 0
                ).length;


            const lateMinutes =
                records.reduce(
                    (
                        sum,
                        a
                    ) =>
                        sum +
                        Number(
                            a.late || 0
                        ),
                    0
                );


            rowData = [

                employee.name,

                lateCount,

                lateMinutes

            ];

        }


        if (
            type ===
            "overtime"
        ) {

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


            rowData = [

                employee.name,

                overtime.toFixed(
                    2
                )

            ];

        }


        if (
            type ===
            "salary"
        ) {

            const calculation =
                getPayrollCalculation(
                    employee,
                    month
                );


            rowData = [

                employee.name,

                formatCurrency(
                    employee.salary
                ),

                formatCurrency(
                    calculation.netSalary
                )

            ];

        }


        currentReportData.push(
            rowData
        );


        const tr =
            document.createElement(
                "tr"
            );


        rowData.forEach(value => {

            const td =
                document.createElement(
                    "td"
                );


            td.textContent =
                value;


            tr.appendChild(
                td
            );

        });


        body.appendChild(
            tr
        );

    });

}


// ============================================================
// CSV EXPORT
// ============================================================

function exportReportCSV() {

    if (
        !currentReportData.length
    ) {

        showMessage(
            "First generate a report."
        );

        return;

    }


    const type =
        document.getElementById(
            "reportType"
        ).value;


    const headers = {

        attendance: [
            "Employee",
            "Full Day",
            "Half Day",
            "Paid Leave",
            "Absent"
        ],

        late: [
            "Employee",
            "Late Count",
            "Late Minutes"
        ],

        overtime: [
            "Employee",
            "Overtime Hours"
        ],

        salary: [
            "Employee",
            "Basic Salary",
            "Net Salary"
        ]

    };


    let csv =
        headers[type].join(",") +
        "\n";


    currentReportData.forEach(row => {

        csv +=
            row
                .map(
                    value =>
                        `"${String(
                            value
                        ).replace(
                            /"/g,
                            '""'
                        )}"`
                )
                .join(",") +
            "\n";

    });


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
        `employee-report-${getCurrentMonth()}.csv`;


    link.click();


    URL.revokeObjectURL(
        url
    );

}


// ============================================================
// BACKUP EXPORT
// ============================================================

async function exportBackup() {

    try {

        const data = {

            employees,

            attendance,

            leaves,

            payroll,

            settings,

            exportedAt:
                new Date()
                    .toISOString()

        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
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


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            `employee-pro-backup-${getToday()}.json`;


        link.click();


        URL.revokeObjectURL(
            url
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Backup export failed."
        );

    }

}


// ============================================================
// BACKUP IMPORT
// ============================================================

async function importBackup(
    event
) {

    const file =
        event.target.files[0];


    if (!file) return;


    try {

        const text =
            await file.text();


        const data =
            JSON.parse(
                text
            );


        if (
            !confirm(
                "Import backup? Existing data will not be automatically deleted."
            )
        ) return;


        const batch =
            db.batch();


        (
            data.employees ||
            []
        ).forEach(employee => {

            const ref =
                db.collection(
                    COLLECTIONS.EMPLOYEES
                ).doc();


            delete employee.id;


            batch.set(
                ref,
                employee
            );

        });


        (
            data.attendance ||
            []
        ).forEach(record => {

            const ref =
                db.collection(
                    COLLECTIONS.ATTENDANCE
                ).doc();


            delete record.id;


            batch.set(
                ref,
                record
            );

        });


        (
            data.leaves ||
            []
        ).forEach(leave => {

            const ref =
                db.collection(
                    COLLECTIONS.LEAVES
                ).doc();


            delete leave.id;


            batch.set(
                ref,
                leave
            );

        });


        (
            data.payroll ||
            []
        ).forEach(record => {

            const ref =
                db.collection(
                    COLLECTIONS.PAYROLL
                ).doc();


            delete record.id;


            batch.set(
                ref,
                record
            );

        });


        await batch.commit();


        if (data.settings) {

            await db.collection(
                COLLECTIONS.SETTINGS
            )
            .doc(SETTINGS_DOC)
            .set(
                data.settings,
                {
                    merge: true
                }
            );

        }


        await loadAllData();


        showMessage(
            "Backup imported successfully."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Invalid backup file."
        );

    }

}


// ============================================================
// RESET ALL DATA
// ============================================================

async function resetAllData() {

    if (
        !confirm(
            "WARNING! This will delete all Employee, Attendance, Leave and Payroll data. Continue?"
        )
    ) return;


    try {

        const collections = [

            COLLECTIONS.EMPLOYEES,

            COLLECTIONS.ATTENDANCE,

            COLLECTIONS.LEAVES,

            COLLECTIONS.PAYROLL

        ];


        for (
            const collectionName
            of collections
        ) {

            const snapshot =
                await db.collection(
                    collectionName
                ).get();


            const batch =
                db.batch();


            snapshot.docs.forEach(doc => {

                batch.delete(
                    doc.ref
                );

            });


            await batch.commit();

        }


        await loadAllData();


        showMessage(
            "All data has been reset."
        );

    } catch (error) {

        console.error(error);

        showMessage(
            "Reset failed."
        );

    }

}


// ============================================================
// PRINT SALARY SLIP
// ============================================================

function printSalarySlip() {

    const slip =
        document.getElementById(
            "salarySlipContainer"
        );


    if (!slip) return;


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    printWindow.document.write(`

        <html>

        <head>

            <title>
                Salary Slip
            </title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                td {
                    border: 1px solid #ddd;
                    padding: 10px;
                }

                .net-row {
                    font-weight: bold;
                    font-size: 18px;
                }

                button {
                    display: none;
                }

            </style>

        </head>

        <body>

            ${slip.innerHTML}

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    printWindow.print();

    printWindow.close();

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {

    // Navigation

    setupNavigation();


    // Employee

    document.getElementById(
        "addEmployeeBtn"
    )?.addEventListener(
        "click",
        () =>
            openEmployeeModal()
    );


    document.getElementById(
        "closeEmployeeModal"
    )?.addEventListener(
        "click",
        closeEmployeeModal
    );


    document.getElementById(
        "cancelEmployeeBtn"
    )?.addEventListener(
        "click",
        closeEmployeeModal
    );


    document.getElementById(
        "employeeForm"
    )?.addEventListener(
        "submit",
        saveEmployee
    );


    document.getElementById(
        "employeeSearch"
    )?.addEventListener(
        "input",
        renderEmployees
    );


    document.getElementById(
        "employeeDepartmentFilter"
    )?.addEventListener(
        "change",
        renderEmployees
    );


    // Attendance

    document.getElementById(
        "closeAttendanceModal"
    )?.addEventListener(
        "click",
        closeAttendanceModal
    );


    document.getElementById(
        "cancelAttendanceBtn"
    )?.addEventListener(
        "click",
        closeAttendanceModal
    );


    document.getElementById(
        "attendanceForm"
    )?.addEventListener(
        "submit",
        saveAttendance
    );


    document.getElementById(
        "previousMonth"
    )?.addEventListener(
        "click",
        () => {

            currentCalendarDate.setMonth(
                currentCalendarDate.getMonth() - 1
            );

            renderAttendanceCalendar();

        }
    );


    document.getElementById(
        "nextMonth"
    )?.addEventListener(
        "click",
        () => {

            currentCalendarDate.setMonth(
                currentCalendarDate.getMonth() + 1
            );

            renderAttendanceCalendar();

        }
    );


    document.getElementById(
        "markAllPresentBtn"
    )?.addEventListener(
        "click",
        markAllPresent
    );


    document.getElementById(
        "markHolidayBtn"
    )?.addEventListener(
        "click",
        markHoliday
    );


    // Leave

    document.getElementById(
        "addLeaveBtn"
    )?.addEventListener(
        "click",
        openLeaveModal
    );


    document.getElementById(
        "closeLeaveModal"
    )?.addEventListener(
        "click",
        closeLeaveModal
    );


    document.getElementById(
        "cancelLeaveBtn"
    )?.addEventListener(
        "click",
        closeLeaveModal
    );


    document.getElementById(
        "leaveForm"
    )?.addEventListener(
        "submit",
        saveLeave
    );


    // Payroll

    document.getElementById(
        "payrollMonth"
    )?.addEventListener(
        "change",
        renderPayroll
    );


    document.getElementById(
        "calculatePayrollBtn"
    )?.addEventListener(
        "click",
        renderPayroll
    );


    // Salary Slip

    document.getElementById(
        "generateSalarySlipBtn"
    )?.addEventListener(
        "click",
        generateSalarySlip
    );


    document.getElementById(
        "printSalarySlipBtn"
    )?.addEventListener(
        "click",
        printSalarySlip
    );


    // Reports

    document.getElementById(
        "generateReportBtn"
    )?.addEventListener(
        "click",
        generateReport
    );


    document.getElementById(
        "exportReportBtn"
    )?.addEventListener(
        "click",
        exportReportCSV
    );


    // Settings

    document.getElementById(
        "settingsForm"
    )?.addEventListener(
        "submit",
        saveSettings
    );


    // Backup

    document.getElementById(
        "exportBackupBtn"
    )?.addEventListener(
        "click",
        exportBackup
    );


    document.getElementById(
        "importBackupInput"
    )?.addEventListener(
        "change",
        importBackup
    );


    document.getElementById(
        "resetDataBtn"
    )?.addEventListener(
        "click",
        resetAllData
    );

}


// ============================================================
// DEFAULT INPUT VALUES
// ============================================================

function setDefaultValues() {

    const payrollMonth =
        document.getElementById(
            "payrollMonth"
        );


    if (payrollMonth) {

        payrollMonth.value =
            getCurrentMonth();

    }


    const salaryMonth =
        document.getElementById(
            "salarySlipMonth"
        );


    if (salaryMonth) {

        salaryMonth.value =
            getCurrentMonth();

    }


    const reportMonth =
        document.getElementById(
            "reportMonth"
        );


    if (reportMonth) {

        reportMonth.value =
            getCurrentMonth();

    }

}


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "🚀 Employee Pro Starting..."
        );


        setupEventListeners();


        setDefaultValues();


        await loadAllData();


        console.log(
            "✅ Employee Pro Ready!"
        );

    }
);
/* =========================================================
   EMPLOYEE PRO
   FIREBASE FIRESTORE CONNECTED
   NO LOGIN REQUIRED
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

try{

    firebase.initializeApp(firebaseConfig);

    db = firebase.firestore();

    console.log("Firebase initialized successfully");

}catch(error){

    console.error("Firebase initialization error:",error);

}


/* ================= GLOBAL DATA ================= */

let employees = [];

let attendanceData = [];

let leaveData = [];

let payrollData = [];

let settings = {

    officeStartTime:"09:00",

    officeEndTime:"18:00",

    gracePeriod:15,

    weeklyOff:0,

    overtimeRate:100

};

let currentCalendarDate = new Date();

let selectedAttendanceDate = null;

let currentReportData = [];


/* ================= HELPERS ================= */

function $(id){

    return document.getElementById(id);

}


function todayString(){

    const d = new Date();

    return d.getFullYear() + "-" +

    String(d.getMonth()+1).padStart(2,"0") + "-" +

    String(d.getDate()).padStart(2,"0");

}


function monthString(date){

    return date.getFullYear() + "-" +

    String(date.getMonth()+1).padStart(2,"0");

}


function money(value){

    return "₹" + Number(value || 0).toLocaleString("en-IN");

}


function escapeHTML(value){

    return String(value ?? "")

    .replace(/&/g,"&amp;")

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;")

    .replace(/"/g,"&quot;")

    .replace(/'/g,"&#039;");

}


function showModal(id){

    $(id).classList.add("show");

}


function hideModal(id){

    $(id).classList.remove("show");

}


/* ================= FIREBASE STATUS ================= */

function setFirebaseStatus(type,text){

    const el = $("firebaseStatus");

    if(!el) return;

    el.className = "firebase-status " + type;

    el.textContent = text;

}


/* ================= LOAD ALL DATA ================= */

async function loadAllData(){

    if(!db){

        setFirebaseStatus(
            "error",
            "🔴 Firebase Error"
        );

        return;

    }

    try{

        setFirebaseStatus(
            "connecting",
            "🟡 Loading..."
        );


        const employeeSnap =
        await db.collection("employees").get();

        employees =
        employeeSnap.docs.map(doc => ({

            firestoreId:doc.id,

            ...doc.data()

        }));


        const attendanceSnap =
        await db.collection("attendance").get();

        attendanceData =
        attendanceSnap.docs.map(doc => ({

            firestoreId:doc.id,

            ...doc.data()

        }));


        const leaveSnap =
        await db.collection("leaves").get();

        leaveData =
        leaveSnap.docs.map(doc => ({

            firestoreId:doc.id,

            ...doc.data()

        }));


        const payrollSnap =
        await db.collection("payroll").get();

        payrollData =
        payrollSnap.docs.map(doc => ({

            firestoreId:doc.id,

            ...doc.data()

        }));


        const settingsDoc =
        await db.collection("settings")
        .doc("office")
        .get();


        if(settingsDoc.exists){

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


    }catch(error){

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

function refreshUI(){

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

function updateDate(){

    $("currentDate").textContent =

    new Date().toLocaleDateString(

        "en-IN",

        {

            weekday:"long",

            year:"numeric",

            month:"long",

            day:"numeric"

        }

    );

}


/* ================= NAVIGATION ================= */

document.querySelectorAll(".nav-item")

.forEach(button => {

    button.addEventListener(

        "click",

        () => {

            const page =
            button.dataset.page;


            document.querySelectorAll(
                ".nav-item"
            )

            .forEach(item =>

                item.classList.remove(
                    "active"
                )

            );


            button.classList.add(
                "active"
            );


            document.querySelectorAll(
                ".page"
            )

            .forEach(pageEl =>

                pageEl.classList.remove(
                    "active"
                )

            );


            const target =
            $(page + "Page");


            if(target){

                target.classList.add(
                    "active"
                );

            }


            $("pageTitle")
            .textContent =

            button.textContent.trim();

        }

    );

});


/* ================= DASHBOARD ================= */

function updateDashboard(){

    const today =
    todayString();


    $("totalEmployees")
    .textContent = employees.length;


    const todayRecords =
    attendanceData.filter(

        a => a.date === today

    );


    $("presentToday")
    .textContent =

    todayRecords.filter(

        a => a.status === "Full Day"

    ).length;


    $("halfDayToday")
    .textContent =

    todayRecords.filter(

        a => a.status === "Half Day"

    ).length;


    $("absentToday")
    .textContent =

    todayRecords.filter(

        a => a.status === "Absent"

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

    todayRecords.filter(

        a => Number(a.late || 0) > 0

    ).length;


    $("overtimeToday")
    .textContent =

    todayRecords.reduce(

        (sum,a) =>

        sum + Number(
            a.overtime || 0
        ),

        0

    ).toFixed(2);


    const currentMonth =
    monthString(new Date());


    const currentPayroll =
    payrollData.filter(

        p => p.month === currentMonth

    );


    $("monthlyPayroll")
    .textContent =

    money(

        currentPayroll.reduce(

            (sum,p) =>

            sum + Number(
                p.netSalary || 0
            ),

            0

        )

    );


    const tbody =
    $("dashboardAttendance");


    tbody.innerHTML = "";


    if(todayRecords.length === 0){

        tbody.innerHTML =

        `<tr>
            <td colspan="6">
                No attendance recorded today
            </td>
        </tr>`;

        return;

    }


    todayRecords.forEach(record => {

        const employee =
        employees.find(

            e => e.employeeId ===
            record.employeeId

        );


        const hours =
        calculateWorkingHours(

            record.checkIn,

            record.checkOut

        );


        tbody.innerHTML +=

        `<tr>

        <td>${escapeHTML(
            record.employeeId
        )}</td>

        <td>${escapeHTML(
            employee?.name || "Unknown"
        )}</td>

        <td>${escapeHTML(
            record.checkIn || "-"
        )}</td>

        <td>${escapeHTML(
            record.checkOut || "-"
        )}</td>

        <td>${hours}</td>

        <td>${escapeHTML(
            record.status || "-"
        )}</td>

        </tr>`;

    });

}


/* ================= EMPLOYEE ================= */

function renderEmployees(){

    const tbody =
    $("employeeTable");


    tbody.innerHTML = "";


    const search =
    $("employeeSearch").value
    .toLowerCase();


    const department =
    $("employeeDepartmentFilter").value;


    const filtered =
    employees.filter(e => {

        const matchesSearch =

        !search ||

        String(e.name || "")
        .toLowerCase()
        .includes(search) ||

        String(e.employeeId || "")
        .toLowerCase()
        .includes(search) ||

        String(e.phone || "")
        .toLowerCase()
        .includes(search);


        const matchesDepartment =

        !department ||

        e.department === department;


        return (

            matchesSearch &&

            matchesDepartment

        );

    });


    if(filtered.length === 0){

        tbody.innerHTML =

        `<tr>
        <td colspan="9">
        No Employees Found
        </td>
        </tr>`;

        return;

    }


    filtered.forEach(e => {

        tbody.innerHTML +=

        `<tr>

        <td>${escapeHTML(
            e.employeeId
        )}</td>

        <td>${escapeHTML(
            e.name
        )}</td>

        <td>${escapeHTML(
            e.phone || "-"
        )}</td>

        <td>${escapeHTML(
            e.department || "-"
        )}</td>

        <td>${escapeHTML(
            e.designation || "-"
        )}</td>

        <td>${money(
            e.salary
        )}</td>

        <td>${escapeHTML(
            e.joiningDate || "-"
        )}</td>

        <td>${escapeHTML(
            e.status || "Active"
        )}</td>

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

    });


    updateDepartmentFilter();

}


/* ================= DEPARTMENT FILTER ================= */

function updateDepartmentFilter(){

    const select =
    $("employeeDepartmentFilter");


    const current =
    select.value;


    const departments =

    [...new Set(

        employees

        .map(e => e.department)

        .filter(Boolean)

    )];


    select.innerHTML =

    `<option value="">
    All Departments
    </option>`;


    departments.forEach(d => {

        select.innerHTML +=

        `<option value="${
            escapeHTML(d)
        }">

        ${escapeHTML(d)}

        </option>`;

    });


    select.value = current;

}


/* ================= ADD EMPLOYEE ================= */

$("addEmployeeBtn")
.addEventListener(

"click",

() => {

    $("employeeForm").reset();

    $("editEmployeeId").value = "";

    $("employeeModalTitle")
    .textContent = "Add Employee";

    showModal(
        "employeeModal"
    );

}

);


/* ================= SAVE EMPLOYEE ================= */

$("employeeForm")
.addEventListener(

"submit",

async event => {

    event.preventDefault();


    const editId =
    $("editEmployeeId").value;


    const employeeId =
    $("employeeId").value.trim();


    const data = {

        employeeId,

        name:
        $("employeeName").value.trim(),

        phone:
        $("employeePhone").value.trim(),

        department:
        $("employeeDepartment").value.trim(),

        designation:
        $("employeeDesignation").value.trim(),

        salary:
        Number(
            $("employeeSalary").value || 0
        ),

        joiningDate:
        $("employeeJoinDate").value,

        status:
        $("employeeStatus").value,

        updatedAt:
        firebase.firestore.FieldValue.serverTimestamp()

    };


    try{

        const duplicate =
        employees.find(

            e =>

            e.employeeId === employeeId &&

            e.firestoreId !== editId

        );


        if(duplicate){

            alert(
                "এই Employee ID ইতিমধ্যে আছে।"
            );

            return;

        }


        if(editId){

            await db.collection(
                "employees"
            )
            .doc(editId)
            .update(data);

        }else{

            await db.collection(
                "employees"
            )
            .doc(employeeId)
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


    }catch(error){

        console.error(error);

        alert(
            "Employee Save Error:\n" +
            error.message
        );

    }

}

);


/* ================= EDIT EMPLOYEE ================= */

window.editEmployee = function(id){

    const employee =
    employees.find(

        e => e.firestoreId === id

    );


    if(!employee) return;


    $("editEmployeeId")
    .value = id;


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


/* ================= DELETE EMPLOYEE ================= */

window.deleteEmployee = async function(id){

    const employee =
    employees.find(

        e => e.firestoreId === id

    );


    if(!employee) return;


    if(!confirm(

        "এই Employee এবং তার Attendance মুছে ফেলবেন?"

    )) return;


    try{

        await db.collection(
            "employees"
        )
        .doc(id)
        .delete();


        await loadAllData();


    }catch(error){

        alert(
            error.message
        );

    }

};


/* ================= EMPLOYEE SELECTORS ================= */

function renderEmployeeSelectors(){

    const selectors = [

        $("attendanceEmployeeSelect"),

        $("salaryEmployeeSelect"),

        $("leaveEmployee")

    ];


    selectors.forEach(select => {

        if(!select) return;


        const current =
        select.value;


        let firstOption =

        select.id ===
        "leaveEmployee"

        ?

        `<option value="">
        Select Employee
        </option>`

        :

        `<option value="">
        Select Employee
        </option>`;


        select.innerHTML =
        firstOption;


        employees

        .filter(

            e =>

            e.status !== "Inactive"

        )

        .forEach(e => {

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

        });


        if(current){

            select.value =
            current;

        }

    });

}


/* ================= ATTENDANCE CALENDAR ================= */

$("attendanceEmployeeSelect")
.addEventListener(

"change",

() => {

    renderAttendanceCalendar();

}

);


function renderAttendanceCalendar(){

    const employeeId =
    $("attendanceEmployeeSelect")
    .value;


    const calendar =
    $("attendanceCalendar");


    calendar.innerHTML = "";


    const year =
    currentCalendarDate
    .getFullYear();


    const month =
    currentCalendarDate
    .getMonth();


    $("calendarTitle")
    .textContent =

    currentCalendarDate
    .toLocaleDateString(

        "en-IN",

        {

            month:"long",

            year:"numeric"

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


    for(let i=0;i<firstDay;i++){

        calendar.innerHTML +=

        `<div class="calendar-day empty"></div>`;

    }


    for(let day=1;

        day<=daysInMonth;

        day++){

        const date =

        year + "-" +

        String(month+1)
        .padStart(2,"0") +

        "-" +

        String(day)
        .padStart(2,"0");


        const record =

        attendanceData.find(

            a =>

            a.employeeId ===
            employeeId &&

            a.date === date

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


/* ================= ATTENDANCE DATE ================= */

window.openAttendanceForDate = function(date){

    const employeeId =
    $("attendanceEmployeeSelect")
    .value;


    if(!employeeId){

        alert(
            "প্রথমে Employee Select করুন।"
        );

        return;

    }


    const employee =
    employees.find(

        e => e.employeeId ===
        employeeId

    );


    const record =
    attendanceData.find(

        a =>

        a.employeeId ===
        employeeId &&

        a.date === date

    );


    $("attendanceEmployeeId")
    .value = employeeId;


    $("attendanceDate")
    .value = date;


    $("attendanceEmployeeName")
    .value =

    employee?.name || "";


    $("checkInTime")
    .value =

    record?.checkIn || "";


    $("checkOutTime")
    .value =

    record?.checkOut || "";


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


/* ================= SAVE ATTENDANCE ================= */

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


    try{

        const existing =
        attendanceData.find(

            a =>

            a.employeeId ===
            employeeId &&

            a.date === date

        );


        if(existing){

            await db.collection(
                "attendance"
            )
            .doc(
                existing.firestoreId
            )
            .update(data);

        }else{

            await db.collection(
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


        renderAttendanceTable();


    }catch(error){

        alert(
            "Attendance Save Error:\n" +
            error.message
        );

    }

}

);


/* ================= ATTENDANCE TABLE ================= */

function renderAttendanceTable(){

    const tbody =
    $("attendanceTable");


    tbody.innerHTML = "";


    const employeeId =
    $("attendanceEmployeeSelect")
    .value;


    if(!employeeId){

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


    if(records.length === 0){

        tbody.innerHTML =

        `<tr>
        <td colspan="9">
        No Attendance
        </td>
        </tr>`;

        return;

    }


    records.forEach(record => {

        const employee =
        employees.find(

            e =>

            e.employeeId ===
            record.employeeId

        );


        tbody.innerHTML +=

        `<tr>

        <td>${escapeHTML(
            record.employeeId
        )}</td>

        <td>${escapeHTML(
            employee?.name || "-"
        )}</td>

        <td>${escapeHTML(
            record.checkIn || "-"
        )}</td>

        <td>${escapeHTML(
            record.checkOut || "-"
        )}</td>

        <td>${calculateWorkingHours(
            record.checkIn,
            record.checkOut
        )}</td>

        <td>${escapeHTML(
            record.status
        )}</td>

        <td>${record.late || 0} Min</td>

        <td>${record.overtime || 0} Hrs</td>

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

    });

}


/* ================= ATTENDANCE CALCULATIONS ================= */

function calculateWorkingHours(
    checkIn,
    checkOut
){

    if(!checkIn || !checkOut){

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


    if(end <= start){

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


    return hours +

    " Hrs " +

    minutes +

    " Min";

}


function timeToMinutes(time){

    if(!time) return 0;


    const parts =
    time.split(":");


    return (

        Number(parts[0]) * 60 +

        Number(parts[1])

    );

}


function calculateLate(checkIn){

    if(!checkIn) return 0;


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


function calculateOvertime(checkOut){

    if(!checkOut) return 0;


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

        (actual - end) / 60

    ).toFixed(2);

}


function statusEmoji(status){

    const map = {

        "Full Day":"🟢",

        "Half Day":"🟡",

        "Absent":"🔴",

        "Paid Leave":"🔵",

        "Unpaid Leave":"⚪",

        "Holiday":"🟣",

        "Weekly Off":"⚫"

    };


    return map[status] || "⚪";

}


/* ================= CALENDAR BUTTONS ================= */

$("previousMonth")
.addEventListener(

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
.addEventListener(

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


/* ================= MARK ALL PRESENT ================= */

$("markAllPresentBtn")
.addEventListener(

"click",

async () => {

    const employeeId =
    $("attendanceEmployeeSelect")
    .value;


    if(!employeeId){

        alert(
            "Employee Select করুন।"
        );

        return;

    }


    if(!confirm(

        "এই মাসের সব দিন Full Day করতে চান?"

    )) return;


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


    try{

        for(let day=1;

            day<=days;

            day++){

            const date =

            year + "-" +

            String(month+1)
            .padStart(2,"0") +

            "-" +

            String(day)
            .padStart(2,"0");


            const existing =
            attendanceData.find(

                a =>

                a.employeeId ===
                employeeId &&

                a.date === date

            );


            const data = {

                employeeId,

                date,

                status:"Full Day",

                checkIn:
                settings.officeStartTime,

                checkOut:
                settings.officeEndTime,

                late:0,

                overtime:0

            };


            if(existing){

                await db.collection(
                    "attendance"
                )
                .doc(
                    existing.firestoreId
                )
                .update(data);

            }else{

                await db.collection(
                    "attendance"
                )
                .add(data);

            }

        }


        await loadAllData();


    }catch(error){

        alert(
            error.message
        );

    }

}

);


/* ================= LEAVE ================= */

$("addLeaveBtn")
.addEventListener(

"click",

() => {

    $("leaveForm").reset();

    showModal(
        "leaveModal"
    );

}

);


$("leaveForm")
.addEventListener(

"submit",

async event => {

    event.preventDefault();


    const from =
    $("leaveFrom").value;


    const to =
    $("leaveTo").value;


    if(to < from){

        alert(
            "To Date ভুল।"
        );

        return;

    }


    try{

        await db.collection(
            "leaves"
        )
        .add({

            employeeId:
            $("leaveEmployee").value,

            leaveType:
            $("leaveType").value,

            from,

            to,

            days:
            calculateLeaveDays(
                from,
                to
            ),

            reason:
            $("leaveReason").value,

            status:"Approved",

            createdAt:

            firebase.firestore
            .FieldValue
            .serverTimestamp()

        });


        hideModal(
            "leaveModal"
        );


        await loadAllData();


    }catch(error){

        alert(
            error.message
        );

    }

}

);


function calculateLeaveDays(
    from,
    to
){

    const start =
    new Date(from);


    const end =
    new Date(to);


    return Math.floor(

        (

            end - start

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


function renderLeave(){

    const tbody =
    $("leaveTable");


    tbody.innerHTML = "";


    if(leaveData.length === 0){

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
            leave.reason || "-"
        )}
        </td>

        <td>
        ${escapeHTML(
            leave.status || "Approved"
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

    });

}


window.deleteLeave =
async function(id){

    if(!confirm(
        "Delete this leave?"
    )) return;


    await db.collection(
        "leaves"
    )
    .doc(id)
    .delete();


    await loadAllData();

};


/* ================= PAYROLL ================= */

$("calculatePayrollBtn")
.addEventListener(

"click",

calculatePayroll

);


async function calculatePayroll(){

    const month =
    $("payrollMonth").value;


    if(!month){

        alert(
            "Payroll Month Select করুন।"
        );

        return;

    }


    const table =
    $("payrollTable");


    table.innerHTML = "";


    let totalPayroll = 0;

    let totalOvertime = 0;


    employees.forEach(

    async employee => {

        const records =

        attendanceData.filter(

            a =>

            a.employeeId ===
            employee.employeeId &&

            String(a.date || "")
            .startsWith(month)

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

            (sum,a) =>

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


        const perDay =
        basicSalary /
        daysInMonth;


        const earnedSalary =

        (

            fullDay +

            paidLeave +

            halfDay * 0.5

        )

        *

        perDay;


        const overtimeAmount =

        overtime *

        Number(
            settings.overtimeRate || 0
        );


        const netSalary =

        earnedSalary +

        overtimeAmount;


        totalPayroll +=
        netSalary;


        totalOvertime +=
        overtime;


        table.innerHTML +=

        `<tr>

        <td>

        ${escapeHTML(
            employee.name
        )}

        <br>

        <small>

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
        ${halfDay}
        </td>

        <td>
        ${paidLeave}
        </td>

        <td>
        ${absent}
        </td>

        <td>
        ${overtime.toFixed(2)}
        </td>

        <td>
        ₹0
        </td>

        <td>
        ₹0
        </td>

        <td>
        ₹0
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

        onclick="savePayroll(
        '${employee.employeeId}',
        '${month}',
        ${basicSalary},
        ${fullDay},
        ${halfDay},
        ${paidLeave},
        ${absent},
        ${overtime},
        ${netSalary}
        )">

        Save

        </button>

        </td>

        </tr>`;

    });


    $("totalPayroll")
    .textContent =
    money(totalPayroll);


    $("payrollEmployees")
    .textContent =
    employees.length;


    $("totalOvertimeHours")
    .textContent =
    totalOvertime.toFixed(2)
    + " Hrs";

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

netSalary

){

    try{

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

            month,

            basicSalary,

            fullDay,

            halfDay,

            paidLeave,

            absent,

            overtime,

            bonus:0,

            advance:0,

            deduction:0,

            netSalary

        };


        if(existing){

            await db.collection(
                "payroll"
            )
            .doc(
                existing.firestoreId
            )
            .update(data);

        }else{

            await db.collection(
                "payroll"
            )
            .add(data);

        }


        alert(
            "Payroll Saved Successfully"
        );


        await loadAllData();


    }catch(error){

        alert(
            error.message
        );

    }

};


/* ================= SALARY SLIP ================= */

$("generateSalarySlipBtn")
.addEventListener(

"click",

() => {

    const employeeId =
    $("salaryEmployeeSelect")
    .value;


    const month =
    $("salarySlipMonth")
    .value;


    if(!employeeId || !month){

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

        String(a.date || "")
        .startsWith(month)

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

        (sum,a) =>

        sum +
        Number(
            a.overtime || 0
        ),

        0

    );


    $("slipMonth")
    .textContent =
    month;


    $("slipEmployeeName")
    .textContent =
    employee?.name || "";


    $("slipEmployeeId")
    .textContent =
    employeeId;


    $("slipDepartment")
    .textContent =
    employee?.department || "";


    $("slipFullDay")
    .textContent =
    fullDay;


    $("slipHalfDay")
    .textContent =
    halfDay;


    $("slipPaidLeave")
    .textContent =
    paidLeave;


    $("slipAbsent")
    .textContent =
    absent;


    $("slipOvertime")
    .textContent =
    overtime.toFixed(2)
    + " Hrs";


    $("slipBasicSalary")
    .textContent =
    money(
        payroll?.basicSalary ||
        employee?.salary ||
        0
    );


    $("slipBonus")
    .textContent =
    money(
        payroll?.bonus || 0
    );


    $("slipAdvance")
    .textContent =
    money(
        payroll?.advance || 0
    );


    $("slipDeduction")
    .textContent =
    money(
        payroll?.deduction || 0
    );


    $("slipNetSalary")
    .textContent =
    money(
        payroll?.netSalary || 0
    );


    $("salarySlipContainer")
    .classList.remove(
        "hidden"
    );

}

);


/* ================= PRINT ================= */

$("printSalarySlipBtn")
.addEventListener(

"click",

() => {

    window.print();

}

);


/* ================= REPORTS ================= */

$("generateReportBtn")
.addEventListener(

"click",

generateReport

);


function generateReport(){

    const type =
    $("reportType").value;


    const month =
    $("reportMonth").value;


    if(!month){

        alert(
            "Month Select করুন।"
        );

        return;

    }


    const head =
    $("reportHead");


    const body =
    $("reportBody");


    head.innerHTML = "";

    body.innerHTML = "";


    if(type === "salary"){

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

            p.month === month

        );


        currentReportData.forEach(p => {

            const employee =
            employees.find(

                e =>

                e.employeeId ===
                p.employeeId

            );


            body.innerHTML +=

            `<tr>

            <td>${escapeHTML(
                p.employeeId
            )}</td>

            <td>${escapeHTML(
                employee?.name || "-"
            )}</td>

            <td>${month}</td>

            <td>${money(
                p.netSalary
            )}</td>

            </tr>`;

        });


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

        String(a.date || "")
        .startsWith(month)

    );


    if(type === "late"){

        currentReportData =

        currentReportData.filter(

            a =>

            Number(a.late || 0) > 0

        );

    }


    if(type === "overtime"){

        currentReportData =

        currentReportData.filter(

            a =>

            Number(a.overtime || 0) > 0

        );

    }


    currentReportData.forEach(a => {

        const employee =
        employees.find(

            e =>

            e.employeeId ===
            a.employeeId

        );


        body.innerHTML +=

        `<tr>

        <td>${escapeHTML(
            a.employeeId
        )}</td>

        <td>${escapeHTML(
            employee?.name || "-"
        )}</td>

        <td>${escapeHTML(
            a.date
        )}</td>

        <td>${escapeHTML(
            a.status
        )}</td>

        <td>${a.late || 0}</td>

        <td>${a.overtime || 0}</td>

        </tr>`;

    });

}


/* ================= CSV EXPORT ================= */

$("exportReportBtn")
.addEventListener(

"click",

() => {

    if(
        currentReportData.length === 0
    ){

        alert(
            "প্রথমে Report Generate করুন।"
        );

        return;

    }


    const rows =

    currentReportData.map(

        item =>

        Object.values(item)

    );


    const csv =

    rows.map(

        row =>

        row.join(",")

    )

    .join("\n");


    const blob =

    new Blob(

        [csv],

        {

            type:
            "text/csv"

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


/* ================= SETTINGS ================= */

async function loadSettingsForm(){

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
.addEventListener(

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


    try{

        await db.collection(
            "settings"
        )
        .doc("office")
        .set(settings);


        alert(
            "Settings Saved Successfully"
        );


    }catch(error){

        alert(
            error.message
        );

    }

});


/* ================= EMPLOYEE ID LIST ================= */

function renderEmployeeIdList(){

    const container =
    $("employeeIdList");


    container.innerHTML = "";


    employees.forEach(e => {

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
            e.status || "Active"
        )}
        </span>

        </div>`;

    });

}


$("employeeIdForm")
.addEventListener(

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


    if(!employeeId || !name){

        return;

    }


    if(

        employees.some(

            e =>

            e.employeeId ===
            employeeId

        )

    ){

        alert(
            "Employee ID already exists"
        );

        return;

    }


    try{

        await db.collection(
            "employees"
        )
        .doc(employeeId)
        .set({

            employeeId,

            name,

            phone:"",

            department:"",

            designation:"",

            salary:0,

            joiningDate:
            todayString(),

            status:"Active",

            createdAt:

            firebase.firestore
            .FieldValue
            .serverTimestamp()

        });


        $("employeeIdForm")
        .reset();


        await loadAllData();


    }catch(error){

        alert(
            error.message
        );

    }

});


/* ================= BACKUP ================= */

$("exportBackupBtn")
.addEventListener(

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


    a.href = url;

    a.download =
    "employee-backup.json";


    a.click();


    URL.revokeObjectURL(
        url
    );

}

);


/* ================= IMPORT BACKUP ================= */

$("importBackupInput")
.addEventListener(

"change",

event => {

    const file =
    event.target.files[0];


    if(!file) return;


    const reader =
    new FileReader();


    reader.onload = async e => {

        try{

            const data =
            JSON.parse(
                e.target.result
            );


            if(data.settings){

                await db.collection(
                    "settings"
                )
                .doc("office")
                .set(
                    data.settings
                );

            }


            for(
                const employee
                of
                (data.employees || [])
            ){

                await db.collection(
                    "employees"
                )
                .doc(
                    employee.employeeId
                )
                .set(employee);

            }


            alert(
                "Backup Imported Successfully"
            );


            await loadAllData();


        }catch(error){

            alert(
                "Backup Import Error:\n" +
                error.message
            );

        }

    };


    reader.readAsText(file);

}

);


/* ================= RESET ================= */

$("resetDataBtn")
.addEventListener(

"click",

async () => {

    if(!confirm(

        "সত্যিই কি সব Data Delete করতে চান?"

    )) return;


    alert(

        "Firestore-এর সব Collection একসাথে Delete করার নিরাপদ পদ্ধতি এখানে দেওয়া হয়নি। Firebase Console থেকে Data Delete করুন।"

    );

}

);


/* ================= MODAL CLOSE ================= */

$("closeEmployeeModal")
.onclick = () =>

hideModal(
    "employeeModal"
);


$("cancelEmployeeBtn")
.onclick = () =>

hideModal(
    "employeeModal"
);


$("closeAttendanceModal")
.onclick = () =>

hideModal(
    "attendanceModal"
);


$("cancelAttendanceBtn")
.onclick = () =>

hideModal(
    "attendanceModal"
);


$("closeLeaveModal")
.onclick = () =>

hideModal(
    "leaveModal"
);


$("cancelLeaveBtn")
.onclick = () =>

hideModal(
    "leaveModal"
);


/* ================= SEARCH ================= */

$("employeeSearch")
.addEventListener(

"input",

renderEmployees

);


$("employeeDepartmentFilter")
.addEventListener(

"change",

renderEmployees

);


/* ================= DEFAULT MONTH ================= */

$("payrollMonth")
.value =
monthString(
    new Date()
);


$("salarySlipMonth")
.value =
monthString(
    new Date()
);


$("reportMonth")
.value =
monthString(
    new Date()
);


/* ================= START APP ================= */

document.addEventListener(

"DOMContentLoaded",

async () => {

    updateDate();

    await loadAllData();

}

);
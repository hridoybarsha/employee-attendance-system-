/* =========================================================
   EMPLOYEE PRO - ATTENDANCE & PAYROLL MANAGEMENT
   REAL-TIME FIRESTORE CONNECTED (AUTO LIVE UPDATES)
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

/* ================= GLOBAL DATA ================= */
let db = null;

let employees = [];
let attendanceData = [];
let leaveData = [];
let payrollData = [];

let settings = {
    weeklyOff: 0
};

let currentCalendarDate = new Date();
let selectedAttendanceDate = null;
let currentReportData = [];

/* ================= INITIALIZE FIREBASE ================= */
function initializeFirebase() {
    try {
        if (typeof firebase === "undefined") {
            console.error("Firebase SDK not loaded");
            setFirebaseStatus("error", "🔴 SDK Missing");
            return false;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        db = firebase.firestore();

        db.settings({
            experimentalForceLongPolling: true
        });

        console.log("Firebase initialized successfully");
        return true;
    } catch (error) {
        console.error("Firebase initialization error:", error);
        setFirebaseStatus("error", "🔴 Init Error");
        return false;
    }
}

/* ================= HELPERS ================= */
function $(id) {
    return document.getElementById(id);
}

function todayString() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function monthString(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
}

function money(value) {
    const val = Math.round(Number(value || 0));
    if (val < 0) {
        return "-Tk " + Math.abs(val).toLocaleString("en-IN");
    }
    return "Tk " + val.toLocaleString("en-IN");
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showModal(id) {
    const modal = $(id);
    if (modal) modal.classList.add("show");
}

function hideModal(id) {
    const modal = $(id);
    if (modal) modal.classList.remove("show");
}

function safeValue(id) {
    const el = $(id);
    return el ? el.value : "";
}

function setText(id, value) {
    const el = $(id);
    if (el) el.textContent = value ?? "";
}

/* ================= NUMBER COUNTER ANIMATION ================= */
function animateValue(id, start, end, duration = 800) {
    const obj = document.getElementById(id);
    if (!obj) return;

    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);

        obj.textContent = money(currentValue);

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.textContent = money(end);
        }
    };
    window.requestAnimationFrame(step);
}

/* ================= 🌌 AUTO-CHANGING LIVE BG PARTICLE ANIMATION ================= */
function initLiveBackground() {
    const canvas = document.getElementById("liveBgCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const colorThemes = [
        { bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", pColor: "96, 165, 250" },
        { bg: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)", pColor: "52, 211, 153" },
        { bg: "linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)", pColor: "168, 85, 247" },
        { bg: "linear-gradient(135deg, #0f172a 0%, #172554 50%, #0f172a 100%)", pColor: "56, 189, 248" }
    ];

    let currentThemeIndex = 0;

    setInterval(() => {
        currentThemeIndex = (currentThemeIndex + 1) % colorThemes.length;
        canvas.style.background = colorThemes[currentThemeIndex].bg;
    }, 8000);

    canvas.style.background = colorThemes[0].bg;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.radius = Math.random() * 2 + 1;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.alpha = Math.random() * 0.5 + 0.3;
        }

        draw() {
            const rgb = colorThemes[currentThemeIndex].pColor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb}, ${this.alpha})`;
            ctx.fill();
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
    }

    function createParticles() {
        const count = Math.floor((canvas.width * canvas.height) / 10000);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const rgb = colorThemes[currentThemeIndex].pColor;
        
        particles.forEach((p, index) => {
            p.update();
            p.draw();

            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(${rgb}, ${0.15 - dist / 1000})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

/* ================= FIREBASE STATUS ================= */
function setFirebaseStatus(type, text) {
    const el = $("firebaseStatus");
    if (!el) return;
    el.className = "firebase-status " + type;
    el.textContent = text;
}

/* ================= REAL-TIME LOAD ALL DATA ================= */
function setupRealtimeListeners() {
    if (!db) {
        setFirebaseStatus("error", "🔴 No DB Connection");
        return;
    }

    setFirebaseStatus("connecting", "🟡 Syncing...");

    db.collection("employees").onSnapshot(snapshot => {
        employees = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        refreshUI();
        setFirebaseStatus("connected", "🟢 Live Sync");
    }, err => console.error("Employees Listener Error:", err));

    db.collection("attendance").onSnapshot(snapshot => {
        attendanceData = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        refreshUI();
    }, err => console.error("Attendance Listener Error:", err));

    db.collection("leaves").onSnapshot(snapshot => {
        leaveData = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        refreshUI();
    }, err => console.error("Leaves Listener Error:", err));

    db.collection("payroll").onSnapshot(snapshot => {
        payrollData = snapshot.docs.map(doc => ({ firestoreId: doc.id, ...doc.data() }));
        refreshUI();
    }, err => console.warn("Payroll Listener Error:", err));

    db.collection("settings").doc("office").onSnapshot(doc => {
        if (doc.exists) settings = { ...settings, ...doc.data() };
        refreshUI();
    }, err => console.warn("Settings Listener Error:", err));
}

/* ================= REFRESH UI ================= */
function refreshUI() {
    updateDate();
    updateDashboard();
    renderEmployees();
    renderEmployeeSelectors();
    renderLeave();
    renderAttendanceCalendar();
    loadSettingsForm();
}

/* ================= DATE ================= */
function updateDate() {
    const el = $("currentDate");
    if (!el) return;
    el.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

/* ================= MOBILE & SIDEBAR NAVIGATION ================= */
function initNavigation() {
    const navButtons = document.querySelectorAll(".nav-item, .mobile-nav-item");

    navButtons.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.dataset.page;

            navButtons.forEach(item => {
                if (item.dataset.page === page) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });

            document.querySelectorAll(".page").forEach(pageEl => {
                pageEl.classList.remove("active");
            });

            const target = $(page + "Page");
            if (target) {
                target.classList.add("active");
            }

            setText("pageTitle", button.textContent.trim());

            closeSidebar();
        });
    });

    const hamburgerBtn = $("hamburgerBtn");
    const closeSidebarBtn = $("closeSidebarBtn");
    const sidebarOverlay = $("sidebarOverlay");

    if (hamburgerBtn) hamburgerBtn.addEventListener("click", openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener("click", closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);
}

function openSidebar() {
    const sidebar = $("sidebar");
    const overlay = $("sidebarOverlay");
    if (sidebar) sidebar.classList.add("open");
    if (overlay) overlay.classList.add("active");
}

function closeSidebar() {
    const sidebar = $("sidebar");
    const overlay = $("sidebarOverlay");
    if (sidebar) sidebar.classList.remove("open");
    if (overlay) overlay.classList.remove("active");
}

/* ================= DASHBOARD WITH ANIMATIONS ================= */
function updateDashboard() {
    const today = todayString();

    const todayRecords = attendanceData.filter(a => a.date === today);

    animateValue("totalEmployees", 0, employees.length);
    animateValue("presentToday", 0, todayRecords.filter(a => a.status === "Full Day" || a.status === "Full Day/Night Shift").length);
    animateValue("nightShiftToday", 0, todayRecords.filter(a => a.status === "Night Shift" || a.status === "Night Duty" || a.status === "Full Day/Night Shift").length);
    animateValue("halfDayToday", 0, todayRecords.filter(a => a.status === "Half Day").length);
    animateValue("absentToday", 0, todayRecords.filter(a => a.status === "Absent").length);
    animateValue("leaveToday", 0, todayRecords.filter(a => a.status === "Paid Leave" || a.status === "Unpaid Leave").length);

    const currentMonth = monthString(new Date());
    const currentPayroll = payrollData.filter(p => p.month === currentMonth);
    const totalSalary = Math.round(currentPayroll.reduce((sum, p) => sum + Number(p.netSalary || 0), 0));

    animateValue("monthlyPayroll", 0, totalSalary, 1000);

    const tbody = $("dashboardAttendance");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (todayRecords.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No attendance recorded today</td></tr>`;
        return;
    }

    todayRecords.forEach(record => {
        const employee = employees.find(e => e.employeeId === record.employeeId);

        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(record.employeeId)}</td>
                <td>${escapeHTML(employee?.name || "Unknown")}</td>
                <td>${statusEmoji(record.status)} ${escapeHTML(record.status || "-")}</td>
                <td>${escapeHTML(record.pipeType || "None")}</td>
                <td>${escapeHTML(record.machine || "None")}</td>
            </tr>`;
    });
}

/* ================= EMPLOYEES ================= */
function renderEmployees() {
    const tbody = $("employeeTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    const search = safeValue("employeeSearch").toLowerCase().trim();
    const department = safeValue("employeeDepartmentFilter");

    const filtered = employees.filter(e => {
        const matchesSearch = !search ||
            String(e.name || "").toLowerCase().includes(search) ||
            String(e.employeeId || "").toLowerCase().includes(search) ||
            String(e.phone || "").toLowerCase().includes(search);

        const matchesDepartment = !department || e.department === department;
        return matchesSearch && matchesDepartment;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No Employees Found</td></tr>`;
        updateDepartmentFilter();
        return;
    }

    filtered.forEach(e => {
        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(e.employeeId)}</td>
                <td>${escapeHTML(e.name)}</td>
                <td>${escapeHTML(e.phone || "-")}</td>
                <td>${escapeHTML(e.department || "-")}</td>
                <td>${escapeHTML(e.designation || "-")}</td>
                <td>${money(e.salary)}</td>
                <td>${money(e.companyLoan || 0)}</td>
                <td>${escapeHTML(e.joiningDate || "-")}</td>
                <td>${escapeHTML(e.status || "Active")}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editEmployee('${escapeHTML(e.firestoreId)}')">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteEmployee('${escapeHTML(e.firestoreId)}')">Delete</button>
                </td>
            </tr>`;
    });

    updateDepartmentFilter();
}

function updateDepartmentFilter() {
    const select = $("employeeDepartmentFilter");
    if (!select) return;
    const current = select.value;

    const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

    select.innerHTML = `<option value="">All Departments</option>`;
    departments.forEach(d => {
        const option = document.createElement("option");
        option.value = d;
        option.textContent = d;
        select.appendChild(option);
    });

    select.value = current;
}

/* ================= ADD / EDIT EMPLOYEE ================= */
function initEmployeeEvents() {
    const addBtn = $("addEmployeeBtn");
    if (addBtn) {
        addBtn.addEventListener("click", () => {
            const form = $("employeeForm");
            if (form) form.reset();
            if ($("editEmployeeId")) $("editEmployeeId").value = "";
            setText("employeeModalTitle", "Add Employee");
            showModal("employeeModal");
        });
    }

    const form = $("employeeForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const editId = safeValue("editEmployeeId");
        const employeeId = safeValue("employeeId").trim();
        const name = safeValue("employeeName").trim();

        if (!employeeId || !name) {
            alert("Employee ID and Name are required!");
            return;
        }

        const duplicate = employees.find(e => e.employeeId === employeeId && e.firestoreId !== editId);
        if (duplicate) {
            alert("Employee ID already exists!");
            return;
        }

        const data = {
            employeeId,
            name,
            phone: safeValue("employeePhone").trim(),
            department: safeValue("employeeDepartment").trim(),
            designation: safeValue("employeeDesignation").trim(),
            salary: Number(safeValue("employeeSalary") || 0),
            companyLoan: Number(safeValue("employeeCompanyLoan") || 0),
            joiningDate: safeValue("employeeJoinDate"),
            status: safeValue("employeeStatus") || "Active",
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (editId) {
                await db.collection("employees").doc(editId).update(data);
            } else {
                await db.collection("employees").doc(employeeId).set({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            hideModal("employeeModal");
        } catch (error) {
            alert("Employee Save Error: " + error.message);
        }
    });
}

window.editEmployee = function(id) {
    const employee = employees.find(e => e.firestoreId === id);
    if (!employee) return;

    $("editEmployeeId").value = employee.firestoreId;
    $("employeeId").value = employee.employeeId || "";
    $("employeeName").value = employee.name || "";
    $("employeePhone").value = employee.phone || "";
    $("employeeDepartment").value = employee.department || "";
    $("employeeDesignation").value = employee.designation || "";
    $("employeeSalary").value = employee.salary || 0;
    $("employeeCompanyLoan").value = employee.companyLoan || 0;
    $("employeeJoinDate").value = employee.joiningDate || "";
    $("employeeStatus").value = employee.status || "Active";

    setText("employeeModalTitle", "Edit Employee");
    showModal("employeeModal");
};

window.deleteEmployee = async function(id) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
        await db.collection("employees").doc(id).delete();
    } catch (error) {
        alert("Delete Error: " + error.message);
    }
};

/* ================= EMPLOYEE SELECTORS ================= */
function renderEmployeeSelectors() {
    const selectors = [$("attendanceEmployeeSelect"), $("salaryEmployeeSelect"), $("leaveEmployee")];

    selectors.forEach(select => {
        if (!select) return;
        const current = select.value;
        select.innerHTML = `<option value="">Select Employee</option>`;

        employees.filter(e => e.status !== "Inactive").forEach(e => {
            const option = document.createElement("option");
            option.value = e.employeeId;
            option.textContent = e.employeeId + " - " + e.name;
            select.appendChild(option);
        });

        if (current) select.value = current;
    });
}

/* ================= ATTENDANCE CALENDAR & SUMMARY ================= */
function getStatusBgClass(status) {
    switch (status) {
        case "Full Day": return "bg-full-day";
        case "Night Shift":
        case "Night Duty": return "bg-night-shift";
        case "Full Day/Night Shift": return "bg-full-day-night";
        case "Half Day": return "bg-half-day";
        case "Absent": return "bg-absent";
        case "Paid Leave": return "bg-paid-leave";
        case "Unpaid Leave": return "bg-unpaid-leave";
        case "Holiday": return "bg-holiday";
        case "Weekly Off": return "bg-weekly-off";
        default: return "";
    }
}

function statusEmoji(status) {
    const map = {
        "Full Day": "🟢",
        "Night Shift": "🌙",
        "Night Duty": "🌙",
        "Full Day/Night Shift": "🌞🌙",
        "Half Day": "🟡",
        "Absent": "🔴",
        "Paid Leave": "🔵",
        "Unpaid Leave": "🟣",
        "Holiday": "🟠",
        "Weekly Off": "⚫"
    };
    return map[status] || "⚪";
}

function renderAttendanceCalendar() {
    const select = $("attendanceEmployeeSelect");
    const calendar = $("attendanceCalendar");
    if (!calendar) return;

    const employeeId = select ? select.value : "";
    calendar.innerHTML = "";

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const currentMonthStr = monthString(currentCalendarDate);

    const monthTitleFormatted = currentCalendarDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    setText("calendarTitle", monthTitleFormatted);

    setText("moneySummaryHeader", `Monthly Salary Summary (${monthTitleFormatted})`);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let summary = {
        "Full Day": 0, "Night Shift": 0, "Full Day/Night Shift": 0, "Half Day": 0, "Absent": 0, "Paid Leave": 0,
        "Unpaid Leave": 0, "Holiday": 0, "Weekly Off": 0, "Not Set": 0
    };

    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += `<div class="calendar-day empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
        const record = attendanceData.find(a => a.employeeId === employeeId && a.date === date);
        const dayOfWeek = new Date(year, month, day).getDay();
        const isWeeklyOff = Number(settings.weeklyOff) === dayOfWeek;

        let status = "Not Set";
        if (record) {
            status = record.status;
            if (status === "Night Duty") status = "Night Shift";
        } else if (isWeeklyOff) {
            status = "Weekly Off";
        }

        if (employeeId) {
            summary[status] = (summary[status] || 0) + 1;
        }

        let statusText = statusEmoji(status) + " " + (status === "Not Set" ? "--" : status);
        let bgClass = getStatusBgClass(status);

        calendar.innerHTML += `
            <div class="calendar-day ${bgClass}" onclick="openAttendanceForDate('${date}')">
                <span class="day-number">${day}</span>
                <span class="day-status">${escapeHTML(statusText)}</span>
            </div>`;
    }

    setText("summaryFullDay", summary["Full Day"]);
    setText("summaryNightShift", summary["Night Shift"]);
    setText("summaryFullDayNight", summary["Full Day/Night Shift"]);
    setText("summaryHalfDay", summary["Half Day"]);
    setText("summaryAbsent", summary["Absent"]);
    setText("summaryPaidLeave", summary["Paid Leave"]);
    setText("summaryUnpaidLeave", summary["Unpaid Leave"]);
    setText("summaryHoliday", summary["Holiday"]);
    setText("summaryWeeklyOff", summary["Weekly Off"]);
    setText("summaryNotSet", summary["Not Set"]);

    updateAttendanceMoneySummary(employeeId, currentMonthStr);
}

function updateAttendanceMoneySummary(employeeId, month) {
    if (!employeeId) {
        setText("attendanceEarnedSalary", "Tk 0");
        setText("attendanceAdvanceTaken", "Tk 0");
        setText("attendanceNetDue", "Tk 0");
        setText("attendanceCompanyLoan", "Tk 0");
        return;
    }

    const employee = employees.find(e => e.employeeId === employeeId);
    if (!employee) return;

    const payroll = calculateEmployeePayroll(employee, month);

    setText("attendanceEarnedSalary", money(payroll.earnedSalary));
    setText("attendanceAdvanceTaken", money(payroll.advance));
    setText("attendanceNetDue", money(payroll.netSalary));
    setText("attendanceCompanyLoan", money(payroll.remainingLoan));
}

window.openAttendanceForDate = function(date) {
    const employeeId = safeValue("attendanceEmployeeSelect");
    if (!employeeId) {
        alert("Please select an employee first!");
        return;
    }

    const employee = employees.find(e => e.employeeId === employeeId);
    const record = attendanceData.find(a => a.employeeId === employeeId && a.date === date);

    if ($("attendanceEmployeeId")) $("attendanceEmployeeId").value = employeeId;
    if ($("attendanceDate")) $("attendanceDate").value = date;
    if ($("attendanceEmployeeName")) $("attendanceEmployeeName").value = employee?.name || "";
    if ($("attendanceStatus")) $("attendanceStatus").value = (record?.status === "Night Duty" ? "Night Shift" : record?.status) || "Full Day";
    if ($("attendancePipeType")) $("attendancePipeType").value = record?.pipeType || "None";
    if ($("attendanceMachine")) $("attendanceMachine").value = record?.machine || "None";
    if ($("attendanceOvertime")) $("attendanceOvertime").value = record?.overtime || "";
    if ($("attendanceAdvance")) $("attendanceAdvance").value = record?.advance || "";

    selectedAttendanceDate = date;
    showModal("attendanceModal");
};

function initAttendanceEvents() {
    const select = $("attendanceEmployeeSelect");
    if (select) select.addEventListener("change", renderAttendanceCalendar);

    const form = $("attendanceForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const employeeId = safeValue("attendanceEmployeeId");
        const date = safeValue("attendanceDate");
        const status = safeValue("attendanceStatus");
        const pipeType = safeValue("attendancePipeType");
        const machine = safeValue("attendanceMachine");
        const overtime = Number(safeValue("attendanceOvertime") || 0);
        const advance = Number(safeValue("attendanceAdvance") || 0);

        const data = {
            employeeId,
            date,
            status,
            pipeType,
            machine,
            overtime,
            advance,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            const existing = attendanceData.find(a => a.employeeId === employeeId && a.date === date);

            if (existing) {
                await db.collection("attendance").doc(existing.firestoreId).update(data);
            } else {
                await db.collection("attendance").add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }

            hideModal("attendanceModal");
        } catch (error) {
            alert("Attendance Save Error: " + error.message);
        }
    });
}

/* ================= CALENDAR BUTTONS & ACTIONS ================= */
function initCalendarButtons() {
    if ($("previousMonth")) {
        $("previousMonth").addEventListener("click", () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderAttendanceCalendar();
        });
    }

    if ($("nextMonth")) {
        $("nextMonth").addEventListener("click", () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderAttendanceCalendar();
        });
    }
}

function initMarkAllPresent() {
    const button = $("markAllPresentBtn");
    if (!button) return;

    button.addEventListener("click", async () => {
        const employeeId = safeValue("attendanceEmployeeSelect");
        if (!employeeId) {
            alert("Please select an employee first!");
            return;
        }

        if (!confirm("Are you sure you want to mark all working days as Full Day?")) return;

        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth();
        const days = new Date(year, month + 1, 0).getDate();

        try {
            for (let day = 1; day <= days; day++) {
                const date = year + "-" + String(month + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
                const dayOfWeek = new Date(year, month, day).getDay();

                if (Number(settings.weeklyOff) === dayOfWeek) continue;

                const existing = attendanceData.find(a => a.employeeId === employeeId && a.date === date);
                const data = {
                    employeeId,
                    date,
                    status: "Full Day",
                    pipeType: "None",
                    machine: "None",
                    overtime: existing?.overtime || 0,
                    advance: existing?.advance || 0,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (existing) {
                    await db.collection("attendance").doc(existing.firestoreId).update(data);
                } else {
                    await db.collection("attendance").add({
                        ...data,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            alert("Working Days marked as Full Day.");
        } catch (error) {
            alert("Error: " + error.message);
        }
    });
}

/* ================= LEAVE ================= */
function initLeaveEvents() {
    if ($("addLeaveBtn")) {
        $("addLeaveBtn").addEventListener("click", () => {
            if ($("leaveForm")) $("leaveForm").reset();
            showModal("leaveModal");
        });
    }

    const form = $("leaveForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const employeeId = safeValue("leaveEmployee");
        const from = safeValue("leaveFrom");
        const to = safeValue("leaveTo");

        if (!employeeId || !from || !to) {
            alert("Please fill required fields!");
            return;
        }

        try {
            await db.collection("leaves").add({
                employeeId,
                leaveType: safeValue("leaveType"),
                from,
                to,
                days: calculateLeaveDays(from, to),
                reason: safeValue("leaveReason"),
                status: "Approved",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            hideModal("leaveModal");
        } catch (error) {
            alert("Leave Save Error: " + error.message);
        }
    });
}

function calculateLeaveDays(from, to) {
    const start = new Date(from + "T00:00:00");
    const end = new Date(to + "T00:00:00");
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function renderLeave() {
    const tbody = $("leaveTable");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (leaveData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;">No Leave Records</td></tr>`;
        return;
    }

    leaveData.forEach(leave => {
        const employee = employees.find(e => e.employeeId === leave.employeeId);
        tbody.innerHTML += `
            <tr>
                <td>${escapeHTML(employee?.name || leave.employeeId)}</td>
                <td>${escapeHTML(leave.leaveType)}</td>
                <td>${escapeHTML(leave.from)}</td>
                <td>${escapeHTML(leave.to)}</td>
                <td>${leave.days || 0}</td>
                <td>${escapeHTML(leave.reason || "-")}</td>
                <td>${escapeHTML(leave.status || "Approved")}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteLeave('${escapeHTML(leave.firestoreId)}')">Delete</button>
                </td>
            </tr>`;
    });
}

window.deleteLeave = async function(id) {
    if (!confirm("Delete this leave?")) return;
    try {
        await db.collection("leaves").doc(id).delete();
    } catch (error) {
        alert(error.message);
    }
};

/* ================= PAYROLL (UPDATED FOR FULL/NIGHT SHIFT) ================= */
function calculateEmployeePayroll(employee, month) {
    const records = attendanceData.filter(a => a.employeeId === employee.employeeId && String(a.date || "").startsWith(month));

    const fullDay = records.filter(a => a.status === "Full Day").length;
    const nightShift = records.filter(a => a.status === "Night Shift" || a.status === "Night Duty").length;
    const fullDayNightShift = records.filter(a => a.status === "Full Day/Night Shift").length;
    const halfDay = records.filter(a => a.status === "Half Day").length;
    const paidLeave = records.filter(a => a.status === "Paid Leave").length;
    const absent = records.filter(a => a.status === "Absent").length;

    const advanceTaken = records.reduce((sum, r) => sum + Number(r.advance || 0), 0);

    const basicSalary = Number(employee.salary || 0);
    const initialLoan = Number(employee.companyLoan || 0);

    const parts = month.split("-");
    const daysInMonth = new Date(Number(parts[0]), Number(parts[1]), 0).getDate();

    const perDaySalary = basicSalary / daysInMonth;

    // Full Day/Night Shift কে ২ দিনের সমান হিসেবে ধরা হয়েছে
    const totalWorkingDays = fullDay + nightShift + (fullDayNightShift * 2) + paidLeave + (halfDay * 0.5);
    const earnedSalary = Math.round(totalWorkingDays * perDaySalary);

    const existing = payrollData.find(p => p.employeeId === employee.employeeId && p.month === month);
    const bonus = Number(existing?.bonus || 0);
    const deduction = Number(existing?.deduction || 0);

    const totalCalculated = earnedSalary + bonus - deduction;

    const netSalary = Math.max(0, Math.round(totalCalculated - advanceTaken));
    const remainingLoan = Math.max(0, Math.round(initialLoan + advanceTaken - earnedSalary));

    return {
        employeeId: employee.employeeId,
        month, basicSalary, fullDay, nightShift, fullDayNightShift, halfDay, paidLeave, absent,
        bonus, advance: advanceTaken, deduction, earnedSalary, netSalary, remainingLoan
    };
}

async function calculatePayroll() {
    const month = safeValue("payrollMonth");
    if (!month) {
        alert("Please select payroll month!");
        return;
    }

    const table = $("payrollTable");
    if (!table) return;
    table.innerHTML = "";

    let totalPayroll = 0;

    const payrollRows = employees.map(employee => calculateEmployeePayroll(employee, month));

    payrollRows.forEach(row => {
        totalPayroll += Number(row.netSalary);

        table.innerHTML += `
            <tr>
                <td>${escapeHTML(employees.find(e => e.employeeId === row.employeeId)?.name || "-")}<br><small>${escapeHTML(row.employeeId)}</small></td>
                <td>${money(row.basicSalary)}</td>
                <td>${row.fullDay}</td>
                <td>${row.nightShift}</td>
                <td>${row.fullDayNightShift || 0}</td>
                <td>${row.halfDay}</td>
                <td>${row.paidLeave}</td>
                <td>${row.absent}</td>
                <td>${money(row.bonus)}</td>
                <td>${money(row.advance)}</td>
                <td>${money(row.deduction)}</td>
                <td><strong>${money(row.netSalary)}</strong></td>
                <td>
                    <button class="action-btn edit-btn" onclick="savePayroll('${escapeHTML(row.employeeId)}', '${escapeHTML(row.month)}', ${row.basicSalary}, ${row.fullDay}, ${row.nightShift}, ${row.fullDayNightShift || 0}, ${row.halfDay}, ${row.paidLeave}, ${row.absent}, ${row.netSalary})">Save</button>
                </td>
            </tr>`;
    });

    setText("totalPayroll", money(totalPayroll));
    setText("payrollEmployees", employees.length);
}

window.savePayroll = async function(employeeId, month, basicSalary, fullDay, nightShift, fullDayNightShift, halfDay, paidLeave, absent, calculatedNetSalary) {
    try {
        const existing = payrollData.find(p => p.employeeId === employeeId && p.month === month);

        const data = {
            employeeId, month, basicSalary, fullDay, nightShift, fullDayNightShift, halfDay, paidLeave, absent,
            bonus: Number(existing?.bonus || 0),
            advance: Number(existing?.advance || 0),
            deduction: Number(existing?.deduction || 0),
            netSalary: calculatedNetSalary,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (existing) {
            await db.collection("payroll").doc(existing.firestoreId).update(data);
        } else {
            await db.collection("payroll").add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        alert("Payroll Saved Successfully!");
    } catch (error) {
        alert("Payroll Save Error: " + error.message);
    }
};

/* ================= SALARY SLIP ================= */
function initSalarySlip() {
    const button = $("generateSalarySlipBtn");
    if (!button) return;

    button.addEventListener("click", () => {
        const employeeId = safeValue("salaryEmployeeSelect");
        const month = safeValue("salarySlipMonth");

        if (!employeeId || !month) {
            alert("Please select Employee and Month!");
            return;
        }

        const employee = employees.find(e => e.employeeId === employeeId);
        if (!employee) return;

        let payroll = payrollData.find(p => p.employeeId === employeeId && p.month === month) || calculateEmployeePayroll(employee, month);

        setText("slipMonth", month);
        setText("slipEmployeeName", employee.name);
        setText("slipEmployeeId", employeeId);
        setText("slipDepartment", employee.department || "-");
        setText("slipFullDay", payroll.fullDay || 0);
        setText("slipNightShift", payroll.nightShift || 0);
        setText("slipFullDayNight", payroll.fullDayNightShift || 0);
        setText("slipHalfDay", payroll.halfDay || 0);
        setText("slipPaidLeave", payroll.paidLeave || 0);
        setText("slipAbsent", payroll.absent || 0);
        
        setText("slipBasicSalary", money(payroll.earnedSalary ?? payroll.netSalary));
        setText("slipBonus", money(payroll.bonus || 0));
        setText("slipAdvance", money(payroll.advance || 0));
        setText("slipDeduction", money(payroll.deduction || 0));
        setText("slipNetSalary", money(payroll.netSalary || 0));

        const container = $("salarySlipContainer");
        if (container) container.classList.remove("hidden");
    });
}

/* ================= REPORTS ================= */
function initReports() {
    if ($("generateReportBtn")) $("generateReportBtn").addEventListener("click", generateReport);
    if ($("exportReportBtn")) $("exportReportBtn").addEventListener("click", exportReportCSV);
}

function generateReport() {
    const type = safeValue("reportType");
    const month = safeValue("reportMonth");
    if (!month) {
        alert("Please select month!");
        return;
    }

    const head = $("reportHead");
    const body = $("reportBody");
    if (!head || !body) return;

    head.innerHTML = "";
    body.innerHTML = "";

    if (type === "salary") {
        head.innerHTML = `<tr><th>Employee ID</th><th>Employee</th><th>Month</th><th>Salary</th></tr>`;
        currentReportData = payrollData.filter(p => p.month === month);

        currentReportData.forEach(p => {
            const employee = employees.find(e => e.employeeId === p.employeeId);
            body.innerHTML += `<tr><td>${escapeHTML(p.employeeId)}</td><td>${escapeHTML(employee?.name || "-")}</td><td>${escapeHTML(month)}</td><td>${money(p.netSalary)}</td></tr>`;
        });
        return;
    }

    head.innerHTML = `<tr><th>Employee ID</th><th>Employee</th><th>Date</th><th>Status</th><th>Pipe Type</th><th>Running Machine</th><th>Overtime</th><th>Advance</th></tr>`;
    currentReportData = attendanceData.filter(a => String(a.date || "").startsWith(month));

    currentReportData.forEach(a => {
        const employee = employees.find(e => e.employeeId === a.employeeId);
        body.innerHTML += `<tr><td>${escapeHTML(a.employeeId)}</td><td>${escapeHTML(employee?.name || "-")}</td><td>${escapeHTML(a.date)}</td><td>${escapeHTML(a.status)}</td><td>${escapeHTML(a.pipeType || "None")}</td><td>${escapeHTML(a.machine || "None")}</td><td>${a.overtime || 0} hrs</td><td>${money(a.advance || 0)}</td></tr>`;
    });
}

function exportReportCSV() {
    if (currentReportData.length === 0) {
        alert("Generate report first!");
        return;
    }

    const headers = Object.keys(currentReportData[0]);
    const rows = currentReportData.map(item => headers.map(key => '"' + String(item[key] ?? "").replace(/"/g, '""') + '"'));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-" + todayString() + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

/* ================= SETTINGS ================= */
function loadSettingsForm() {
    if ($("weeklyOff")) $("weeklyOff").value = settings.weeklyOff;
}

function initSettings() {
    const form = $("settingsForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        settings = {
            weeklyOff: Number(safeValue("weeklyOff") || 0)
        };

        try {
            await db.collection("settings").doc("office").set(settings);
            alert("Settings Saved Successfully!");
        } catch (error) {
            alert("Settings Error: " + error.message);
        }
    });
}

/* ================= MODAL CLOSE ================= */
function initModalButtons() {
    const buttons = {
        closeEmployeeModal: "employeeModal", cancelEmployeeBtn: "employeeModal",
        closeAttendanceModal: "attendanceModal", cancelAttendanceBtn: "attendanceModal",
        closeLeaveModal: "leaveModal", cancelLeaveBtn: "leaveModal"
    };

    Object.entries(buttons).forEach(([btnId, modalId]) => {
        const btn = $(btnId);
        if (btn) btn.onclick = () => hideModal(modalId);
    });
}

/* ================= DEFAULT MONTH ================= */
function setDefaultMonths() {
    const month = monthString(new Date());
    ["payrollMonth", "salarySlipMonth", "reportMonth"].forEach(id => {
        const el = $(id);
        if (el && !el.value) el.value = month;
    });
}

/* ================= INIT APP ================= */
document.addEventListener("DOMContentLoaded", () => {
    console.log("Employee Pro App Starting...");

    initLiveBackground();
    initializeFirebase();
    initNavigation();
    initEmployeeEvents();
    initAttendanceEvents();
    initCalendarButtons();
    initMarkAllPresent();
    initLeaveEvents();
    initSalarySlip();
    initReports();
    initSettings();
    initModalButtons();
    setDefaultMonths();

    if ($("calculatePayrollBtn")) $("calculatePayrollBtn").addEventListener("click", calculatePayroll);
    if ($("employeeSearch")) $("employeeSearch").addEventListener("input", renderEmployees);
    if ($("employeeDepartmentFilter")) $("employeeDepartmentFilter").addEventListener("change", renderEmployees);
    if ($("printSalarySlipBtn")) $("printSalarySlipBtn").addEventListener("click", () => window.print());

    updateDate();
    setupRealtimeListeners();
});
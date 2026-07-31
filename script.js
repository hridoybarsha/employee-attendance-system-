/* =========================================
   EMPLOYEE PRO - SCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     VARIABLES
  ========================================= */

  const sidebar = document.getElementById("sidebar");
  const menuBtn = document.getElementById("menuBtn");

  const calendarDays = document.getElementById("calendarDays");
  const calendarTitle = document.getElementById("calendarTitle");

  const prevMonth = document.getElementById("prevMonth");
  const nextMonth = document.getElementById("nextMonth");

  const statusModal = document.getElementById("statusModal");

  const closeModal = document.getElementById("closeModal");
  const cancelModal = document.getElementById("cancelModal");

  const markAllPresent =
    document.getElementById("markAllPresent");

  let currentDate = new Date(2026, 6, 1);

  let selectedDate = null;

  let attendanceData =
    JSON.parse(localStorage.getItem("employeeAttendance")) || {};


  /* =========================================
     SIDEBAR
  ========================================= */

  menuBtn.addEventListener("click", function () {

    sidebar.classList.toggle("open");

  });


  /* =========================================
     PAGE NAVIGATION
  ========================================= */

  const navigationButtons =
    document.querySelectorAll("[data-page]");

  navigationButtons.forEach(function (button) {

    button.addEventListener("click", function () {

      const pageName =
        this.getAttribute("data-page");

      showPage(pageName);

      // Close mobile sidebar
      sidebar.classList.remove("open");

    });

  });


  function showPage(pageName) {

    // Hide all pages
    document.querySelectorAll(".page")
      .forEach(function (page) {

        page.classList.remove("active-page");

      });


    // Show selected page
    const selectedPage =
      document.getElementById(pageName + "Page");

    if (selectedPage) {

      selectedPage.classList.add("active-page");

    }


    // Update active navigation
    document.querySelectorAll("[data-page]")
      .forEach(function (button) {

        button.classList.remove("active");

        if (
          button.getAttribute("data-page")
          === pageName
        ) {

          button.classList.add("active");

        }

      });

  }


  /* =========================================
     DATE
  ========================================= */

  function updateTodayDate() {

    const todayDate =
      document.getElementById("todayDate");

    const today = new Date(2026, 6, 31);

    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    };

    todayDate.textContent =
      today.toLocaleDateString("en-GB", options);

  }

  updateTodayDate();


  /* =========================================
     CALENDAR
  ========================================= */

  function renderCalendar() {

    calendarDays.innerHTML = "";

    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();


    // Month title
    const monthName =
      currentDate.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric"
        }
      );

    calendarTitle.textContent =
      monthName;


    document.getElementById(
      "summaryMonth"
    ).textContent = monthName;


    // First day
    const firstDay =
      new Date(year, month, 1).getDay();


    // Number of days
    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();


    // Previous month empty cells
    for (
      let i = 0;
      i < firstDay;
      i++
    ) {

      const emptyDay =
        document.createElement("div");

      emptyDay.className =
        "calendar-day empty";

      calendarDays.appendChild(
        emptyDay
      );

    }


    // Days
    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      const dayElement =
        document.createElement("div");

      dayElement.className =
        "calendar-day";


      // Today highlight
      if (
        year === 2026 &&
        month === 6 &&
        day === 31
      ) {

        dayElement.classList.add(
          "today"
        );

      }


      const dayNumber =
        document.createElement("span");

      dayNumber.className =
        "day-number";

      dayNumber.textContent =
        String(day).padStart(2, "0");


      const status =
        getAttendanceStatus(
          year,
          month,
          day
        );


      const statusElement =
        document.createElement("div");

      statusElement.className =
        "day-status";


      if (status !== "Not Set") {

        statusElement.classList.add(
          getStatusClass(status)
        );

      }


      const dot =
        document.createElement("span");

      dot.className =
        "day-status-dot";


      const statusText =
        document.createElement("span");

      statusText.textContent =
        status;


      statusElement.appendChild(dot);

      statusElement.appendChild(
        statusText
      );


      dayElement.appendChild(
        dayNumber
      );

      dayElement.appendChild(
        statusElement
      );


      // Click date
      dayElement.addEventListener(
        "click",
        function () {

          selectedDate =
            createDateKey(
              year,
              month,
              day
            );

          openStatusModal();

        }
      );


      calendarDays.appendChild(
        dayElement
      );

    }


    updateSummary();

  }


  /* =========================================
     DATE KEY
  ========================================= */

  function createDateKey(
    year,
    month,
    day
  ) {

    return (
      year +
      "-" +
      String(month + 1).padStart(2, "0") +
      "-" +
      String(day).padStart(2, "0")
    );

  }


  /* =========================================
     GET STATUS
  ========================================= */

  function getAttendanceStatus(
    year,
    month,
    day
  ) {

    const key =
      createDateKey(
        year,
        month,
        day
      );


    return (
      attendanceData[key] ||
      "Not Set"
    );

  }


  /* =========================================
     STATUS CLASS
  ========================================= */

  function getStatusClass(
    status
  ) {

    return status
      .toLowerCase()
      .replaceAll(
        " ",
        "-"
      );

  }


  /* =========================================
     OPEN MODAL
  ========================================= */

  function openStatusModal() {

    if (!selectedDate) {

      return;

    }

    statusModal.classList.add(
      "show"
    );

  }


  /* =========================================
     CLOSE MODAL
  ========================================= */

  function closeStatusModal() {

    statusModal.classList.remove(
      "show"
    );

    selectedDate = null;

  }


  closeModal.addEventListener(
    "click",
    closeStatusModal
  );


  cancelModal.addEventListener(
    "click",
    closeStatusModal
  );


  /* =========================================
     SELECT STATUS
  ========================================= */

  document
    .querySelectorAll(".status-btn")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          if (!selectedDate) {

            return;

          }


          const status =
            this.getAttribute(
              "data-status"
            );


          attendanceData[
            selectedDate
          ] = status;


          localStorage.setItem(
            "employeeAttendance",
            JSON.stringify(
              attendanceData
            )
          );


          closeStatusModal();

          renderCalendar();

        }
      );

    });


  /* =========================================
     PREVIOUS MONTH
  ========================================= */

  prevMonth.addEventListener(
    "click",
    function () {

      currentDate.setMonth(
        currentDate.getMonth() - 1
      );

      renderCalendar();

    }
  );


  /* =========================================
     NEXT MONTH
  ========================================= */

  nextMonth.addEventListener(
    "click",
    function () {

      currentDate.setMonth(
        currentDate.getMonth() + 1
      );

      renderCalendar();

    }
  );


  /* =========================================
     MARK ALL PRESENT
  ========================================= */

  markAllPresent.addEventListener(
    "click",
    function () {

      const year =
        currentDate.getFullYear();

      const month =
        currentDate.getMonth();

      const daysInMonth =
        new Date(
          year,
          month + 1,
          0
        ).getDate();


      for (
        let day = 1;
        day <= daysInMonth;
        day++
      ) {

        const key =
          createDateKey(
            year,
            month,
            day
          );


        attendanceData[key] =
          "Full Day";

      }


      localStorage.setItem(
        "employeeAttendance",
        JSON.stringify(
          attendanceData
        )
      );


      renderCalendar();

      alert(
        "All days marked as Full Day."
      );

    }
  );


  /* =========================================
     UPDATE SUMMARY
  ========================================= */

  function updateSummary() {

    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();


    const counts = {

      "Full Day": 0,
      "Half Day": 0,
      "Absent": 0,
      "Paid Leave": 0,
      "Unpaid Leave": 0,
      "Holiday": 0,
      "Weekly Off": 0,
      "Not Set": 0

    };


    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      const status =
        getAttendanceStatus(
          year,
          month,
          day
        );


      counts[status]++;

    }


    document.getElementById(
      "fullDayCount"
    ).textContent =
      counts["Full Day"];


    document.getElementById(
      "halfDayCount"
    ).textContent =
      counts["Half Day"];


    document.getElementById(
      "absentCount"
    ).textContent =
      counts["Absent"];


    document.getElementById(
      "paidLeaveCount"
    ).textContent =
      counts["Paid Leave"];


    document.getElementById(
      "unpaidLeaveCount"
    ).textContent =
      counts["Unpaid Leave"];


    document.getElementById(
      "holidayCount"
    ).textContent =
      counts["Holiday"];


    document.getElementById(
      "weeklyOffCount"
    ).textContent =
      counts["Weekly Off"];


    document.getElementById(
      "notSetCount"
    ).textContent =
      counts["Not Set"];

  }


  /* =========================================
     MORE BUTTON
  ========================================= */

  const moreBtn =
    document.getElementById(
      "moreBtn"
    );


  moreBtn.addEventListener(
    "click",
    function () {

      alert(
        "More Options\n\nSalary Slip\nReports\nSettings"
      );

    }
  );


  /* =========================================
     BOTTOM NAV
  ========================================= */

  document
    .querySelectorAll(
      ".bottom-nav [data-page]"
    )
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          showPage(
            this.getAttribute(
              "data-page"
            )
          );

        }
      );

    });


  /* =========================================
     OTHER BUTTONS
  ========================================= */

  document
    .getElementById("searchBtn")
    .addEventListener(
      "click",
      function () {

        alert(
          "Search Employee"
        );

      }
    );


  document
    .getElementById("addBtn")
    .addEventListener(
      "click",
      function () {

        alert(
          "Add New Employee"
        );

      }
    );


  document
    .getElementById("notificationBtn")
    .addEventListener(
      "click",
      function () {

        alert(
          "No new notifications."
        );

      }
    );


  document
    .getElementById("profileBtn")
    .addEventListener(
      "click",
      function () {

        alert(
          "Administrator Profile"
        );

      }
    );


  /* =========================================
     INITIAL LOAD
  ========================================= */

  renderCalendar();

});
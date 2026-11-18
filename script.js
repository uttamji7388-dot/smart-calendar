
// ==========================================
// SMART CALENDAR - JAVASCRIPT
// ==========================================


// 1. GET HTML ELEMENTS

const monthYear = document.getElementById("monthYear");
const calendarDays = document.getElementById("calendarDays");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const todayBtn = document.getElementById("todayBtn");

const addEventBtn = document.getElementById("addEventBtn");
const selectedAddBtn = document.getElementById("selectedAddBtn");

const eventModal = document.getElementById("eventModal");
const eventForm = document.getElementById("eventForm");

const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const deleteEventBtn = document.getElementById("deleteEventBtn");

const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");
const notificationBtn = document.getElementById("notificationBtn");

const selectedDateTitle = document.getElementById("selectedDateTitle");
const selectedDateText = document.getElementById("selectedDateText");

const selectedEvents = document.getElementById("selectedEvents");
const upcomingEvents = document.getElementById("upcomingEvents");
const holidayList = document.getElementById("holidayList");


// 2. DATE VARIABLES

const today = new Date();

today.setHours(0, 0, 0, 0);

let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

let selectedDate = new Date(today);

let events = JSON.parse(
    localStorage.getItem("calendarEvents") || "[]"
);


// 3. HOLIDAYS DATABASE
// Selected fixed-date Indian holidays and observances.
// Add more dates or regional holidays as required.


function getHolidays(year) {

    const holidays = [
        // January
        { title: "New Year's Day", date: `${year}-01-01` },
        { title: "Lohri", date: `${year}-01-13` },
        { title: "Makar Sankranti", date: `${year}-01-14` },
        { title: "Republic Day", date: `${year}-01-26` },

        // February
        { title: "Vasant Panchami", date: `${year}-02-01` },

        // March
        { title: "Holi", date: `${year}-03-04` },
        { title: "Maha Shivratri", date: `${year}-02-15` },

        // April
        { title: "Ram Navami", date: `${year}-04-06` },
        { title: "Mahavir Jayanti", date: `${year}-04-10` },
        { title: "Ambedkar Jayanti", date: `${year}-04-14` },
        { title: "Hanuman Jayanti", date: `${year}-04-02` },

        // May
        { title: "Buddha Purnima", date: `${year}-05-01` },

        // June
        { title: "International Yoga Day", date: `${year}-06-21` },

        // July
        { title: "Rath Yatra", date: `${year}-07-16` },

        // August
        { title: "Independence Day", date: `${year}-08-15` },
        { title: "Raksha Bandhan", date: `${year}-08-28` },
        { title: "Janmashtami", date: `${year}-08-15` },

        // September
        { title: "Ganesh Chaturthi", date: `${year}-09-14` },

        // October
        { title: "Gandhi Jayanti", date: `${year}-10-02` },
        { title: "Dussehra", date: `${year}-10-20` },
        { title: "Karwa Chauth", date: `${year}-10-29` },

        // November
        { title: "Diwali", date: `${year}-11-08` },
        { title: "Govardhan Puja", date: `${year}-11-09` },
        { title: "Bhai Dooj", date: `${year}-11-10` },
        { title: "Chhath Puja", date: `${year}-11-15` },
        { title: "Guru Nanak Jayanti", date: `${year}-11-24` },

        // December
        { title: "Christmas", date: `${year}-12-25` }
    ];

    return holidays;
}


// 4. LOCAL STORAGE

function saveEvents() {

    localStorage.setItem(
        "calendarEvents",
        JSON.stringify(events)
    );

}

function loadEvents() {

    const savedEvents = localStorage.getItem("calendarEvents");

    if (!savedEvents) return;

    try {
        const parsed = JSON.parse(savedEvents);

        if (Array.isArray(parsed)) {
            events = parsed;
        }
    } catch (error) {
        console.error("Unable to load saved events:", error);
        events = [];
    }

}


// 5. DATE UTILITIES

function formatDate(date) {

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function parseLocalDate(value) {

    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);

}

function isSameDate(date1, date2) {

    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );

}

function formatReadableDate(value) {

    return parseLocalDate(value).toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}

function escapeHTML(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );

}

function getEventDateTime(event) {

    return new Date(
        `${event.date}T${event.time || "00:00"}`
    );

}


// 6. CATEGORY FILTERING AND SEARCH

function getFilteredEvents() {

    const search = searchInput.value.toLowerCase().trim();

    const selectedCategories = Array.from(
        document.querySelectorAll(".category-filter:checked")
    ).map(input => input.value);

    return events.filter(event => {

        const matchesSearch =
            event.title.toLowerCase().includes(search) ||
            (event.description || "").toLowerCase().includes(search);

        const matchesCategory =
            selectedCategories.includes(event.category);

        return matchesSearch && matchesCategory;

    });

}


// 7. GENERATE CALENDAR

function generateCalendar() {

    calendarDays.innerHTML = "";

    monthYear.textContent = new Date(
        currentYear,
        currentMonth
    ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });


    const firstDay = new Date(
        currentYear,
        currentMonth,
        1
    ).getDay();

    const startingDay = (firstDay + 6) % 7;

    const totalDays = new Date(
        currentYear,
        currentMonth + 1,
        0
    ).getDate();

    const previousMonthDays = new Date(
        currentYear,
        currentMonth,
        0
    ).getDate();


    const holidays = getHolidays(currentYear);
    const visibleEvents = getFilteredEvents();


    for (let i = 0; i < 42; i++) {

        let cellDate;

        if (i < startingDay) {

            const date = previousMonthDays - startingDay + i + 1;

            cellDate = new Date(
                currentYear,
                currentMonth - 1,
                date
            );

        } else if (i >= startingDay + totalDays) {

            const date = i - startingDay - totalDays + 1;

            cellDate = new Date(
                currentYear,
                currentMonth + 1,
                date
            );

        } else {

            const date = i - startingDay + 1;

            cellDate = new Date(
                currentYear,
                currentMonth,
                date
            );

        }


        const dateString = formatDate(cellDate);

        const dayElement = document.createElement("div");

        dayElement.className = "day";


        // Other month

        if (cellDate.getMonth() !== currentMonth) {
            dayElement.classList.add("other-month");
        }


        // Today

        if (isSameDate(cellDate, today)) {
            dayElement.classList.add("today");
        }


        // Selected date

        if (isSameDate(cellDate, selectedDate)) {
            dayElement.classList.add("selected");
        }


        // Date number

        const number = document.createElement("span");

        number.className = "day-number";
        number.textContent = cellDate.getDate();

        dayElement.appendChild(number);


        // Holiday marker

        const holiday = holidays.find(
            item => item.date === dateString
        );

        if (holiday) {

            const holidayElement = document.createElement("span");

            holidayElement.className = "day-event holiday";
            holidayElement.textContent = "🎉 " + holiday.title;

            dayElement.appendChild(holidayElement);

        }


        // Event markers

        const dateEvents = visibleEvents.filter(
            event => event.date === dateString
        );

        dateEvents.slice(0, 2).forEach(event => {

            const eventElement = document.createElement("span");

            eventElement.className =
                `day-event ${event.category}`;

            eventElement.textContent = event.title;

            dayElement.appendChild(eventElement);

        });


        if (dateEvents.length > 2) {

            const more = document.createElement("span");

            more.className = "day-event";
            more.textContent = `+${dateEvents.length - 2} more`;

            dayElement.appendChild(more);

        }


        // Date click

        dayElement.addEventListener("click", () => {

            selectedDate = new Date(cellDate);

            currentMonth = cellDate.getMonth();
            currentYear = cellDate.getFullYear();

            updateSelectedDate();
            renderAll();

        });


        calendarDays.appendChild(dayElement);

    }

}


// 8. SELECTED DATE DETAILS

function updateSelectedDate() {

    selectedDateTitle.textContent =
        formatReadableDate(formatDate(selectedDate));

    selectedDateText.textContent =
        "Your schedule for this day";

    const dateString = formatDate(selectedDate);

    const dateEvents = getFilteredEvents().filter(
        event => event.date === dateString
    );

    const holiday = getHolidays(selectedDate.getFullYear()).find(
        item => item.date === dateString
    );

    selectedEvents.innerHTML = "";


    if (holiday) {

        selectedEvents.innerHTML += `
            <div class="event-card">
                <div class="event-info">
                    <h4>🎉 ${escapeHTML(holiday.title)}</h4>
                    <p>Indian holiday / observance</p>
                </div>
            </div>
        `;

    }


    if (dateEvents.length === 0 && !holiday) {

        selectedEvents.innerHTML =
            `<p class="empty-message">No events for this date.</p>`;

        return;

    }

    dateEvents.forEach(event => {

        selectedEvents.innerHTML += createEventCard(event);

    });

}


// 9. EVENT CARD

function createEventCard(event) {

    const time = event.time || "Time not set";

    return `
        <div class="event-card">
            <div class="event-info">
                <h4>${escapeHTML(event.title)}</h4>

                <p>
                    ${escapeHTML(time)} ·
                    ${escapeHTML(event.category)}
                </p>

                ${event.description
                    ? `<p>${escapeHTML(event.description)}</p>`
                    : ""}
            </div>

            <div class="event-actions">

                <button data-action="edit"
                    data-id="${escapeHTML(event.id)}">
                    ✏️
                </button>

                <button data-action="delete"
                    data-id="${escapeHTML(event.id)}">
                    🗑️
                </button>

            </div>
        </div>
    `;

}


// 10. UPCOMING EVENTS

function renderUpcomingEvents() {

    const now = new Date();

    const upcoming = getFilteredEvents()
        .filter(event => getEventDateTime(event) >= now)
        .sort((a, b) =>
            getEventDateTime(a) - getEventDateTime(b)
        )
        .slice(0, 8);


    if (upcoming.length === 0) {

        upcomingEvents.innerHTML =
            `<p class="empty-message">No upcoming events found.</p>`;

        return;

    }


    upcomingEvents.innerHTML = upcoming.map(event => {

        return `
            <div class="event-card">
                <div class="event-info">
                    <h4>${escapeHTML(event.title)}</h4>
                    <p>
                        ${formatReadableDate(event.date)}
                        · ${escapeHTML(event.time || "No time")}
                        · ${escapeHTML(event.category)}
                    </p>
                </div>

                <div class="event-actions">
                    <button data-action="edit"
                        data-id="${escapeHTML(event.id)}">✏️</button>
                    <button data-action="delete"
                        data-id="${escapeHTML(event.id)}">🗑️</button>
                </div>
            </div>
        `;

    }).join("");

}


// 11. HOLIDAY LIST

function renderHolidays() {

    const holidays = getHolidays(currentYear)
        .sort((a, b) => a.date.localeCompare(b.date));

    holidayList.innerHTML = holidays.map(holiday => {

        return `
            <div class="event-card">
                <div class="event-info">
                    <h4>🎉 ${escapeHTML(holiday.title)}</h4>
                    <p>${formatReadableDate(holiday.date)}</p>
                </div>
            </div>
        `;

    }).join("");

}


// 12. RENDER EVERYTHING

function renderAll() {

    generateCalendar();
    updateSelectedDate();
    renderUpcomingEvents();
    renderHolidays();

}


// 13. OPEN EVENT MODAL

function openModal(date = formatDate(selectedDate)) {

    eventForm.reset();

    document.getElementById("eventId").value = "";

    document.getElementById("eventDate").value = date;

    document.getElementById("modalTitle").textContent =
        "Create Event";

    deleteEventBtn.classList.add("hidden");

    eventModal.classList.add("show");

    document.getElementById("eventTitle").focus();

}


// 14. CLOSE MODAL

function closeEventModal() {

    eventModal.classList.remove("show");

}

addEventBtn.addEventListener("click", () => {
    openModal();
});

selectedAddBtn.addEventListener("click", () => {
    openModal(formatDate(selectedDate));
});

closeModal.addEventListener("click", closeEventModal);
cancelBtn.addEventListener("click", closeEventModal);

eventModal.addEventListener("click", event => {

    if (event.target === eventModal) {
        closeEventModal();
    }

});


// 15. SAVE EVENT

eventForm.addEventListener("submit", event => {

    event.preventDefault();

    const id = document.getElementById("eventId").value;

    const eventData = {

        id: id || (
            crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(36) +
                  Math.random().toString(36).slice(2)
        ),

        title: document.getElementById("eventTitle").value.trim(),

        date: document.getElementById("eventDate").value,

        time: document.getElementById("eventTime").value,

        category: document.getElementById("eventCategory").value,

        description:
            document.getElementById("eventDescription").value.trim(),

        reminder: Number(
            document.getElementById("reminderTime").value
        )

    };


    if (!eventData.title || !eventData.date) {
        alert("Please enter an event title and date.");
        return;
    }


    if (id) {

        const index = events.findIndex(item => item.id === id);

        if (index !== -1) {
            events[index] = eventData;
        }

    } else {

        events.push(eventData);

    }


    saveEvents();

    selectedDate = parseLocalDate(eventData.date);

    currentMonth = selectedDate.getMonth();
    currentYear = selectedDate.getFullYear();

    closeEventModal();

    renderAll();

});


// 16. EDIT EVENT

function editEvent(id) {

    const event = events.find(item => item.id === id);

    if (!event) return;


    document.getElementById("eventId").value = event.id;
    document.getElementById("eventTitle").value = event.title;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventTime").value = event.time || "";
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventDescription").value =
        event.description || "";

    document.getElementById("reminderTime").value =
        String(event.reminder ?? -1);


    document.getElementById("modalTitle").textContent =
        "Edit Event";

    deleteEventBtn.classList.remove("hidden");

    eventModal.classList.add("show");

}


// 17. DELETE EVENT

function deleteEvent(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this event?"
    );

    if (!confirmed) return;

    events = events.filter(event => event.id !== id);

    saveEvents();

    closeEventModal();

    renderAll();

}


// Handle edit and delete buttons

document.addEventListener("click", event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = button.dataset.id;

    if (button.dataset.action === "edit") {
        editEvent(id);
    }

    if (button.dataset.action === "delete") {
        deleteEvent(id);
    }

});

deleteEventBtn.addEventListener("click", () => {

    const id = document.getElementById("eventId").value;

    if (id) {
        deleteEvent(id);
    }

});


// 18. PREVIOUS AND NEXT MONTH

prevBtn.addEventListener("click", () => {

    currentMonth--;

    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }

    renderAll();

});


nextBtn.addEventListener("click", () => {

    currentMonth++;

    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }

    renderAll();

});


// 19. GO TO TODAY

todayBtn.addEventListener("click", () => {

    selectedDate = new Date(today);

    currentMonth = today.getMonth();
    currentYear = today.getFullYear();

    renderAll();

});


// 20. SEARCH EVENTS

searchInput.addEventListener("input", renderAll);


// 21. CATEGORY FILTER

document.querySelectorAll(".category-filter").forEach(input => {

    input.addEventListener("change", renderAll);

});


// 22. DARK MODE

function applyTheme(theme) {

    document.body.classList.toggle("dark", theme === "dark");

    themeBtn.textContent =
        theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("calendarTheme", theme);

}

const savedTheme = localStorage.getItem("calendarTheme") || "light";

applyTheme(savedTheme);


themeBtn.addEventListener("click", () => {

    const isDark = document.body.classList.contains("dark");

    applyTheme(isDark ? "light" : "dark");

});


// 23. BROWSER NOTIFICATIONS

function updateNotificationButton() {

    if (!("Notification" in window)) {

        notificationBtn.textContent =
            "🔔 Notifications unavailable";

        return;

    }

    notificationBtn.textContent =
        Notification.permission === "granted"
            ? "🔔 Notifications Enabled"
            : "🔔 Enable Notifications";

}


notificationBtn.addEventListener("click", async () => {

    if (!("Notification" in window)) {

        alert("This browser does not support notifications.");
        return;

    }

    const permission = await Notification.requestPermission();

    updateNotificationButton();

    if (permission === "granted") {

        new Notification("Smart Calendar", {
            body: "Notifications are now enabled!"
        });

    } else {

        alert("Notification permission was not granted.");

    }

});


// 24. REMINDER SYSTEM

function checkReminders() {

    if (!("Notification" in window)) return;

    if (Notification.permission !== "granted") return;

    const now = Date.now();

    const notified = JSON.parse(
        localStorage.getItem("notifiedReminders") || "[]"
    );

    let changed = false;


    events.forEach(event => {

        if (event.reminder < 0 || !event.time) return;

        const eventTime = getEventDateTime(event).getTime();

        const reminderTime =
            eventTime - event.reminder * 60 * 1000;

        const reminderKey = `${event.id}_${eventTime}`;

        if (
            now >= reminderTime &&
            now <= eventTime &&
            !notified.includes(reminderKey)
        ) {

            new Notification("Calendar Reminder: " + event.title, {
                body: `Your event starts at ${event.time}.`
            });

            notified.push(reminderKey);

            changed = true;

        }

    });


    if (changed) {

        localStorage.setItem(
            "notifiedReminders",
            JSON.stringify(notified)
        );

    }

}


// 25. INITIALIZE APPLICATION

loadEvents();

updateNotificationButton();

renderAll();

checkReminders();


// Check reminders every 15 seconds while the page is open.

setInterval(checkReminders, 15000);


// Refresh calendar date when returning to the page.

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        checkReminders();

        renderAll();

    }

});

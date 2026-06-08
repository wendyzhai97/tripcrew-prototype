const travelers = [
  {
    name: "Wendy",
    initial: "W",
    color: "",
    summary: "Food-first, flexible pace, selective spender.",
    tags: ["Worth-it meals", "Shopping", "Moderate budget", "Can cook"],
  },
  {
    name: "Maya",
    initial: "M",
    color: "blue",
    summary: "Needs a slower backup today and stomach-safe food.",
    tags: ["Gentle food", "Low walking", "Flexible", "Rest buffer"],
  },
  {
    name: "Diego",
    initial: "D",
    color: "green",
    summary: "Wants museums, neighborhoods, and fewer missed moments.",
    tags: ["Explorer", "Museums", "Moderate pace", "Transit OK"],
  },
  {
    name: "Alex",
    initial: "A",
    color: "violet",
    summary: "Easygoing, but has not added a must-do yet.",
    tags: ["Down for anything", "Budget aware", "Needs nudge"],
  },
];

const tabs = document.querySelectorAll(".tab");
const views = document.querySelectorAll(".view");
const toast = document.querySelector(".toast");
const sheet = document.querySelector(".sheet");
const sheetContent = document.querySelector(".sheet-content");
let toastTimer;

function activateView(id) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === id));
  views.forEach((view) => view.classList.toggle("active", view.id === id));
  document.querySelector(".phone-frame").scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("visible");
  toastTimer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2400);
}

function openSheet(markup) {
  sheetContent.innerHTML = markup;
  if (typeof sheet.showModal === "function") {
    sheet.showModal();
  } else {
    showToast("This browser does not support modal sheets yet.");
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => activateView(tab.dataset.view));
});

document.querySelectorAll("[data-jump]").forEach((button) => {
  button.addEventListener("click", () => activateView(button.dataset.jump));
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((item) => item.classList.remove("active-chip"));
    chip.classList.add("active-chip");
  });
});

document.querySelectorAll(".plan-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".plan-card").forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

document.querySelectorAll(".reaction").forEach((reaction) => {
  reaction.addEventListener("click", () => {
    document.querySelectorAll(".reaction").forEach((item) => item.classList.remove("active"));
    reaction.classList.add("active");
  });
});

document.querySelectorAll(".choice").forEach((choice) => {
  choice.addEventListener("click", () => {
    document.querySelectorAll(".choice").forEach((item) => item.classList.remove("active"));
    choice.classList.add("active");
    showToast(`${choice.querySelector("strong").textContent} selected for tonight.`);
  });
});

const timelineList = document.querySelector(".timeline-list");
let draggedItem = null;

function getTimelineInsertTarget(y) {
  const items = [...timelineList.querySelectorAll("[data-itinerary-item]:not(.dragging)")];
  return items.reduce(
    (closest, item) => {
      const box = item.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, item };
      }
      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, item: null },
  ).item;
}

function renumberTimeline() {
  const existingTimes = [...timelineList.querySelectorAll("[data-itinerary-item] time")].map((time) =>
    time.textContent.trim(),
  );
  const sortedTimes = existingTimes.sort((a, b) => a.localeCompare(b));
  timelineList.querySelectorAll("[data-itinerary-item]").forEach((item, index) => {
    item.querySelector("time").textContent = sortedTimes[index] || "";
  });
}

function attachTimelineDrag(item) {
  const handle = item.querySelector(".drag-handle");
  if (!handle || handle.dataset.dragReady === "true") return;
  handle.dataset.dragReady = "true";

  handle.addEventListener("pointerdown", (event) => {
    draggedItem = item;
    draggedItem.classList.add("dragging");
    handle.setPointerCapture(event.pointerId);
    showToast("Drag the itinerary item into a new spot.");
  });

  handle.addEventListener("pointermove", (event) => {
    if (!draggedItem) return;
    const target = getTimelineInsertTarget(event.clientY);
    if (target) {
      timelineList.insertBefore(draggedItem, target);
    } else {
      timelineList.appendChild(draggedItem);
    }
  });

  handle.addEventListener("pointerup", () => {
    if (!draggedItem) return;
    const movedTitle = draggedItem.querySelector("h3").textContent;
    draggedItem.classList.remove("dragging");
    draggedItem = null;
    renumberTimeline();
    showToast(`${movedTitle} moved. Times adjusted for the prototype.`);
  });

  handle.addEventListener("pointercancel", () => {
    if (!draggedItem) return;
    draggedItem.classList.remove("dragging");
    draggedItem = null;
  });
}

function createTimelineItem({ time, title, detail, cost, tone = "normal" }) {
  const item = document.createElement("article");
  item.className = `timeline-item${tone === "maybe" ? " dimmed" : ""}`;
  item.dataset.itineraryItem = "";
  item.innerHTML = `
    <button class="drag-handle" type="button" aria-label="Drag ${title}">↕</button>
    <time>${time}</time>
    <div>
      <h3>${title}</h3>
      <p>${detail}</p>
    </div>
    <span class="${tone === "maybe" ? "risk" : "cost"}">${cost}</span>
  `;
  attachTimelineDrag(item);
  return item;
}

timelineList.querySelectorAll("[data-itinerary-item]").forEach(attachTimelineDrag);

function addItineraryItemFromForm(form) {
  const data = new FormData(form);
  const title = data.get("title")?.toString().trim() || "New stop";
  const time = data.get("time")?.toString().trim() || "15:30";
  const category = data.get("category")?.toString() || "activity";
  const cost = data.get("cost")?.toString().trim() || "$0";
  const pace = data.get("pace")?.toString() || "balanced";
  const who = data.get("who")?.toString() || "everyone";
  const place = data.get("place")?.toString().trim() || "Map search needed";
  const detail = `${place} · ${category} · ${pace} pace · ${who}`;
  const item = createTimelineItem({ time, title, detail, cost });
  timelineList.appendChild(item);
  const items = [...timelineList.querySelectorAll("[data-itinerary-item]")];
  items
    .sort((a, b) => a.querySelector("time").textContent.localeCompare(b.querySelector("time").textContent))
    .forEach((sortedItem) => timelineList.appendChild(sortedItem));
  sheet.close();
  activateView("home");
  showToast(`${title} added to today’s plan.`);
}

const profileList = document.querySelector(".profile-list");

travelers.forEach((traveler) => {
  const card = document.createElement("article");
  card.className = "profile-card";
  card.innerHTML = `
    <div class="avatar ${traveler.color}">${traveler.initial}</div>
    <div>
      <h3>${traveler.name}</h3>
      <p>${traveler.summary}</p>
      <div class="tag-row">
        ${traveler.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
      </div>
    </div>
  `;
  profileList.appendChild(card);
});

document.querySelector("#lowPowerToggle").addEventListener("change", (event) => {
  const card = event.target.closest(".safety-card");
  const copy = card.querySelector("p");
  copy.textContent = event.target.checked
    ? "Use periodic location pings instead of always-on tracking while everyone is split."
    : "Always-on location is more precise, but it may drain battery faster during a long travel day.";
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "back-home") {
      activateView("home");
      showToast("Back to today’s trip board.");
    }

    if (action === "show-more") {
      openSheet(`
        <h2>Trip options</h2>
        <p>Prototype menu for the group trip workspace.</p>
        <div class="sheet-list">
          <div class="sheet-row"><div><strong>Share trip link</strong><span>Invite friends to react to plans.</span></div><em>Ready</em></div>
          <div class="sheet-row"><div><strong>Add itinerary item</strong><span>Manual entry first; map search/import later.</span></div><em>V1 flow</em></div>
          <div class="sheet-row"><div><strong>Export summary</strong><span>Send itinerary and money snapshot.</span></div><em>Mock</em></div>
        </div>
      `);
    }

    if (action === "add-stop") {
      openSheet(`
        <h2>Add itinerary item</h2>
        <p>This is how the plan starts: someone adds a stop, then the group can react, reorder, adapt, or split up around it.</p>
        <form class="sheet-form" data-itinerary-form>
          <label>
            Activity
            <input name="title" value="Churros at El Moro" />
          </label>
          <label>
            Place or neighborhood
            <input name="place" value="El Moro · Centro Historico" />
          </label>
          <div class="field-grid">
            <label>
              Time
              <input name="time" value="16:00" />
            </label>
            <label>
              Est. cost
              <input name="cost" value="$120 MXN" />
            </label>
          </div>
          <div class="field-grid">
            <label>
              Category
              <select name="category">
                <option>food</option>
                <option>activity</option>
                <option>shopping</option>
                <option>transit</option>
              </select>
            </label>
            <label>
              Pace
              <select name="pace">
                <option>slow</option>
                <option selected>balanced</option>
                <option>packed</option>
              </select>
            </label>
          </div>
          <label>
            Who wants to go?
            <select name="who">
              <option selected>everyone</option>
              <option>Wendy + Diego</option>
              <option>Maya optional</option>
              <option>solo / split-up</option>
            </select>
          </label>
          <button class="primary wide" type="submit">Add to today</button>
        </form>
      `);
    }

    if (action === "invite") {
      openSheet(`
        <h2>Invite travelers</h2>
        <p>Pull people into this trip so the itinerary adapts around their profiles.</p>
        <div class="sheet-list">
          <div class="sheet-row"><div><strong>Invite link copied</strong><span>Friends can add pace, food, budget, and must-do inputs.</span></div><em>Copied</em></div>
          <div class="sheet-row"><div><strong>Alex</strong><span>Still missing must-do activity.</span></div><em>Nudge</em></div>
        </div>
      `);
    }

    if (action === "nudge") {
      showToast("Nudge sent: Alex, add one must-do for CDMX.");
    }

    if (action === "choose-plan") {
      showToast("Slower plan chosen. Museum moved into tomorrow’s backup list.");
    }

    if (action === "set-meetup") {
      showToast("Meetup set: Parque Mexico at 4:10 PM.");
    }

    if (action === "check-in") {
      showToast("Check-in sent. Everyone gets a low-power location ping.");
    }

    if (action === "settlement") {
      openSheet(`
        <h2>Settlement draft</h2>
        <p>Mock end-of-day settlement across card, cash, and the USD → MXN exchange pool.</p>
        <div class="sheet-list">
          <div class="sheet-row"><div><strong>Diego owes Wendy</strong><span>Cash pool + shared food split.</span></div><em>$24.50</em></div>
          <div class="sheet-row"><div><strong>Alex owes Wendy</strong><span>Groceries, museum tickets, cash tacos.</span></div><em>$31.20</em></div>
          <div class="sheet-row"><div><strong>Maya owes Diego</strong><span>Transit and pharmacy run.</span></div><em>$8.75</em></div>
          <div class="sheet-row"><div><strong>Cash remaining</strong><span>$2,150 MXN held by Wendy.</span></div><em>Tracked</em></div>
        </div>
        <button class="primary wide" type="button" onclick="document.querySelector('.sheet').close()">Looks right</button>
      `);
    }

    if (action === "close-sheet") {
      sheet.close();
    }
  });
});

sheet.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-itinerary-form]");
  if (!form) return;
  event.preventDefault();
  addItineraryItemFromForm(form);
});

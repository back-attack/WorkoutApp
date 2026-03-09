/* =========================================================
   Workouts page logic only
   - Assumes app.js is only included on workouts.html
   - Safe even if it accidentally loads elsewhere (guards)
   ========================================================= */

/***********************
 * Storage helpers (JSON)
 * localStorage stores strings; JSON stringify/parse lets us store objects. [2](https://developer.mozilla.org/en-US/docs/Web/API/Storage/setItem)
 ***********************/

// simple client-side authentication (static password)
const APP_PASSWORD = "letmein"; // change this as needed

function isLoggedIn() {
  return localStorage.getItem("loggedIn") === "1";
}
function requireLogin() {
  if (!isLoggedIn()) {
    const overlay = document.getElementById("loginOverlay");
    if (overlay) overlay.style.display = "flex";
  }
}
function setupAuth() {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const pass = document.getElementById("loginPass").value;
      if (pass === APP_PASSWORD) {
        localStorage.setItem("loggedIn", "1");
        document.getElementById("loginOverlay").style.display = "none";
        // show logout now that we're in
        const lb = document.getElementById("logoutBtn");
        if (lb) lb.style.display = "inline-flex";
      } else {
        document.getElementById("loginError").textContent = "Incorrect password";
      }
    });
  }
  const loginInput = document.getElementById("loginPass");
  if (loginInput) {
    loginInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        loginBtn.click();
      }
    });
  }
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    // hide initially if not logged
    if (!isLoggedIn()) logoutBtn.style.display = "none";
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      location.reload();
    });
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getJSON(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

/***********************
 * Date helpers
 ***********************/
function toISODate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function startOfWeekSunday(d) {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dow = copy.getDay(); // 0=Sun
  copy.setDate(copy.getDate() - dow);
  return copy;
}

/***********************
 * Random helpers
 ***********************/
function pickOne(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickManyUnique(arr, n) {
  const copy = [...arr];
  const out = [];
  while (copy.length && out.length < n) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

/***********************
 * Workout menus
 ***********************/
const pelotonCardio = { name: "Peloton Bike", meta: "20 min ride" };

const coreA = [
  { name: "Front Plank", meta: "3×20–45 sec" },
  { name: "Dead Bug", meta: "3×6–10 / side" },
  { name: "Cable Crunch (kneeling)", meta: "3×10–15" },
  { name: "Stability Ball Crunch", meta: "3×10–15" },
  { name: "Ab Wheel Rollout (later)", meta: "3×6–10" },
  { name: "TRX Fallout", meta: "3×8–12" },
  { name: "Hollow Body Hold", meta: "3×15–40 sec" }
];
const coreB = [
  { name: "Pallof Press", meta: "3×8–12 / side" },
  { name: "Side Plank", meta: "2–3×20–40 sec / side" },
  { name: "Cable Chop (high→low)", meta: "3×8–12 / side" },
  { name: "Cable Lift (low→high)", meta: "3×8–12 / side" },
  { name: "Russian Twist (light)", meta: "3×10–16 total" },
  { name: "Landmine Rotation", meta: "3×8–12 / side" },
  { name: "Suitcase Carry", meta: "3×20–40 sec / side" }
];
const coreC = [
  { name: "Reverse Crunch", meta: "3×10–15" },
  { name: "Hanging Knee Raise", meta: "3×6–12" },
  { name: "Captain’s Chair Raise", meta: "3×8–12" },
  { name: "Lying Leg Raise (bent knees)", meta: "3×8–12" },
  { name: "Dead Bug (arms + legs)", meta: "3×6–8 / side" },
  { name: "Back Extension (bodyweight)", meta: "3×10–15" },
  { name: "Bird Dog", meta: "3×6–10 / side" }
];

const chestPrimary = [
  { name: "Flat DB Bench Press", meta: "3×6–10" },
  { name: "Machine Chest Press", meta: "3×8–12" },
  { name: "Smith Machine Bench", meta: "3×6–10" },
  { name: "Push-Ups (tempo)", meta: "3×10–20" },
  { name: "Flat Barbell Bench Press", meta: "3×5–8" }
];
const chestAngle = [
  { name: "Incline DB Press", meta: "3×6–10" },
  { name: "Incline Barbell Press", meta: "3×6–8" },
  { name: "Decline DB Press", meta: "3×8–12" },
  { name: "Hammer Strength Incline", meta: "3×8–12" },
  { name: "Close-Grip Push-Ups", meta: "3×12–20" }
];
const chestFly = [
  { name: "Cable Fly (mid-chest)", meta: "2–3×10–15" },
  { name: "Low-to-High Cable Fly", meta: "2–3×10–15" },
  { name: "Pec Deck / Fly Machine", meta: "2–3×10–15" },
  { name: "DB Fly (light)", meta: "2–3×8–12" },
  { name: "Single-Arm Cable Fly", meta: "2–3×10–12 / side" }
];

const bicepsMenu = [
  { name: "Dumbbell Curl", meta: "3×8–12" },
  { name: "EZ-Bar Curl", meta: "3×8–12" },
  { name: "Incline DB Curl", meta: "3×8–10" },
  { name: "Cable Curl", meta: "3×10–15" },
  { name: "Hammer Curl", meta: "3×8–12" },
  { name: "Preacher Curl", meta: "3×8–12" },
  { name: "Spider Curl", meta: "3×10–12" }
];
const tricepsMenu = [
  { name: "Rope Pushdown", meta: "3×10–15" },
  { name: "Straight-Bar Pushdown", meta: "3×8–12" },
  { name: "Overhead Rope Extension", meta: "3×10–12" },
  { name: "Single-Arm Cable Extension", meta: "3×10–12 / side" },
  { name: "EZ-Bar Skull Crushers", meta: "3×8–10" },
  { name: "DB Skull Crushers", meta: "3×8–12" },
  { name: "Bench Dips (assisted)", meta: "3×8–15" }
];

/***********************
 * Plan generation (20–20–20)
 ***********************/
function coreTypeForToday(today) {
  const start = new Date(today.getFullYear(), 0, 0);
  const diff = today - start;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const idx = dayOfYear % 3;
  return idx === 0 ? "A" : idx === 1 ? "B" : "C";
}

function generatePlan(todayISO) {
  const today = new Date();
  const coreType = coreTypeForToday(today);

  let corePool = coreA;
  if (coreType === "B") corePool = coreB;
  if (coreType === "C") corePool = coreC;

  const core = pickManyUnique(corePool, 3);

  const lastUpper = localStorage.getItem("lastUpperType"); // "chest" or "arms"
  const upperType = lastUpper === "chest" ? "arms" : "chest";

  let upper = [];
  if (upperType === "chest") {
    upper = [pickOne(chestPrimary), pickOne(chestAngle), pickOne(chestFly)];
  } else {
    upper = [pickOne(bicepsMenu), pickOne(tricepsMenu)];
  }

  return {
    date: todayISO,
    blocks: {
      cardio: { minutes: 20, items: [pelotonCardio] },
      core: { minutes: 20, coreType, items: core },
      upper: { minutes: 20, upperType, items: upper }
    }
  };
}

/***********************
 * Rendering helpers
 ***********************/
function renderWeek(today) {
  const weekEl = document.getElementById("week");
  if (!weekEl) return;

  const isNutrition = !!document.getElementById("startPrep") || !!document.getElementById("enterMeal");

  weekEl.innerHTML = "";
  const start = startOfWeekSunday(today);
  const labels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const todayISO = toISODate(today);

  for (let i = 0; i < 7; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const iso = toISODate(d);

    const div = document.createElement("div");
    div.className = "day" + (iso === todayISO ? " today" : "");
    div.setAttribute("data-date", iso);
    div.textContent = labels[i];

    if (!isNutrition) {
      // workout page behaviour
      const doneKey = `done:${iso}`;
      const done = localStorage.getItem(doneKey) === "1";
      if (done) {
        div.classList.add("done");
        const check = document.createElement("div");
        check.className = "check";
        check.textContent = "✓";
        div.appendChild(check);
      }
    } else {
      // nutrition behaviour: separate breakfast/dinner flags
      const bFlag = localStorage.getItem(`mealBreakfast:${iso}`) === "1";
      const dFlag = localStorage.getItem(`mealDinner:${iso}`) === "1";
      const any = bFlag || dFlag;
      if (any) {
        div.classList.add("done");
      }
      if (bFlag) {
        div.classList.add("breakfast");
        const check = document.createElement("div");
        check.className = "check breakfast";
        check.textContent = "✓";
        div.appendChild(check);
      }
      if (dFlag) {
        div.classList.add("dinner");
        const check = document.createElement("div");
        check.className = "check dinner";
        check.textContent = "✓";
        div.appendChild(check);
      }
    }

    weekEl.appendChild(div);
  }
}

function renderBlock(title, minutes, items) {
  const block = document.createElement("section");
  block.className = "block";

  const top = document.createElement("div");
  top.className = "blockTop";

  const t = document.createElement("div");
  t.className = "blockTitle";
  t.textContent = title;

  const time = document.createElement("div");
  time.className = "blockTime";
  time.textContent = `${minutes} min`;

  top.appendChild(t);
  top.appendChild(time);

  const list = document.createElement("div");
  list.className = "list";

  items.forEach(it => {
    const row = document.createElement("div");
    row.className = "item";

    const name = document.createElement("div");
    name.className = "itemName";
    name.textContent = it.name;

    const meta = document.createElement("div");
    meta.className = "itemMeta";
    meta.textContent = it.meta || "";

    row.appendChild(name);
    row.appendChild(meta);
    list.appendChild(row);
  });

  block.appendChild(top);
  block.appendChild(list);
  return block;
}

function renderPlan(plan) {
  const blocksEl = document.getElementById("blocks");
  const panelMetaEl = document.getElementById("panelMeta");
  const upperPillEl = document.getElementById("upperPill");
  if (!blocksEl) return;

  blocksEl.innerHTML = "";

  const { cardio, core, upper } = plan.blocks;

  if (panelMetaEl) {
    panelMetaEl.textContent = `Peloton 20 • Core ${core.coreType} • Upper ${upper.upperType.toUpperCase()}`;
  }
  if (upperPillEl) {
    upperPillEl.textContent = upper.upperType === "chest" ? "Chest Day" : "Arms Day";
  }

  blocksEl.appendChild(renderBlock("CARDIO (Peloton)", cardio.minutes, cardio.items));
  blocksEl.appendChild(renderBlock(`CORE (Day ${core.coreType})`, core.minutes, core.items));
  blocksEl.appendChild(renderBlock(upper.upperType === "chest" ? "UPPER (Chest)" : "UPPER (Arms)", upper.minutes, upper.items));
}

function renderEmpty() {
  const blocksEl = document.getElementById("blocks");
  const panelMetaEl = document.getElementById("panelMeta");
  const upperPillEl = document.getElementById("upperPill");

  if (blocksEl) {
    blocksEl.innerHTML = `<div class="empty">Tap <strong>Generate Workout</strong> to build your 20–20–20 plan.</div>`;
  }
  if (panelMetaEl) panelMetaEl.textContent = "Not generated yet";
  if (upperPillEl) upperPillEl.textContent = "—";
}

/***********************
 * Feedback (UI only)
 ***********************/
function hideFeedback() {
  const postWorkoutEl = document.getElementById("postWorkout");
  if (postWorkoutEl) postWorkoutEl.classList.add("hidden"); // uses classList API [1](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
}
function showFeedback() {
  const postWorkoutEl = document.getElementById("postWorkout");
  if (postWorkoutEl) postWorkoutEl.classList.remove("hidden"); // uses classList API [1](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList)
}

function wireDifficultyDots() {
  const dots = document.querySelectorAll(".dot");
  if (!dots.length) return;

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      dots.forEach(d => d.classList.remove("active"));
      dot.classList.add("active");
      let prev = dot.previousElementSibling;
      while (prev) {
        prev.classList.add("active");
        prev = prev.previousElementSibling;
      }
      // UI-only for now (no persistence)
    });
  });
}

function renderWeightInputs(plan) {
  const weightInputsEl = document.getElementById("weightInputs");
  if (!weightInputsEl) return;

  weightInputsEl.innerHTML = "";

  const weightedExercises = [];
  plan.blocks.upper.items.forEach(ex => {
    const n = ex.name.toLowerCase();
    if (n.includes("press") || n.includes("curl") || n.includes("skull") || n.includes("row")) {
      weightedExercises.push(ex.name);
    }
  });

  weightedExercises.forEach(name => {
    const row = document.createElement("div");
    row.className = "weightRow";
    row.innerHTML = `
      <label>${name}</label>
      <input type="number" placeholder="lbs">
    `;
    weightInputsEl.appendChild(row);
  });
}

/***********************
 * State machine
 ***********************/
function syncUI() {
  const actionButton = document.getElementById("actionButton");
  if (!actionButton) return; // Not on workouts page

  const today = new Date();
  const todayISO = toISODate(today);

  renderWeek(today);

  const planKey = `plan:${todayISO}`;
  const startedKey = `started:${todayISO}`;
  const doneKey = `done:${todayISO}`;
  const feedbackKey = `feedbackOpen:${todayISO}`;

  const done = localStorage.getItem(doneKey) === "1";
  const started = localStorage.getItem(startedKey) === "1";
  const plan = getJSON(planKey, null);
  const feedbackOpen = localStorage.getItem(feedbackKey) === "1";

  // Feedback should be hidden by default; only show if explicitly opened after completion
  hideFeedback();

  if (plan) renderPlan(plan);
  else renderEmpty();

  if (done) {
    actionButton.textContent = "Workout Completed";
    actionButton.disabled = true;

    // Only show the feedback panel if we opened it right after completion
    if (feedbackOpen && plan) {
      showFeedback();
      renderWeightInputs(plan);
      wireDifficultyDots();
    }
    return;
  }

  actionButton.disabled = false;

  if (!plan) actionButton.textContent = "Generate Workout";
  else if (!started) actionButton.textContent = "Start Workout";
  else actionButton.textContent = "Workout Completed";
}

function onActionButtonClick() {
  const actionButton = document.getElementById("actionButton");
  if (!actionButton) return;

  const todayISO = toISODate(new Date());

  const planKey = `plan:${todayISO}`;
  const startedKey = `started:${todayISO}`;
  const doneKey = `done:${todayISO}`;
  const feedbackKey = `feedbackOpen:${todayISO}`;

  const done = localStorage.getItem(doneKey) === "1";
  if (done) return;

  const plan = getJSON(planKey, null);
  const started = localStorage.getItem(startedKey) === "1";

  if (!plan) {
    const newPlan = generatePlan(todayISO);
    setJSON(planKey, newPlan);
    localStorage.removeItem(startedKey);
    localStorage.removeItem(feedbackKey);
    syncUI();
    return;
  }

  if (!started) {
    localStorage.setItem(startedKey, "1");
    localStorage.removeItem(feedbackKey);
    syncUI();
    return;
  }

  // Completed
  localStorage.setItem(doneKey, "1");
  localStorage.removeItem(startedKey);

  const completedPlan = getJSON(planKey, null);
  if (completedPlan?.blocks?.upper?.upperType) {
    localStorage.setItem("lastUpperType", completedPlan.blocks.upper.upperType);
  }

  // Open feedback UI right after completion (UI-only, no DB)
  localStorage.setItem(feedbackKey, "1");

  syncUI();
}

/***********************
 * Debug reset (optional)
 ***********************/
function setupDebugReset() {
  const resetButton = document.getElementById("resetButton");
  if (!resetButton) return;

  // always enabled
  resetButton.onclick = () => {
    // wipe any app-specific key prefixes to guarantee a full reset
    const prefixes = ["plan:", "started:", "done:", "aiTrainer_", "mealBreakfast", "mealDinner", "mealBreakfastName", "mealDinnerName", "selectedBreakfast", "selectedDinner"];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (prefixes.some(p => key && key.startsWith(p))) {
        localStorage.removeItem(key);
      }
    }
    // navigate to home so you can see notifications immediately
    window.location.href = "index.html";
  };
}

/***********************
 * Init
 ***********************/
function init() {
  // authentication
  setupAuth();
  requireLogin();

  // Always wire debug reset (it will early-return if button doesn't exist)
  setupDebugReset();

  // render the weekly circles on any page that has #week
  renderWeek(new Date());

  // Only continue with workouts logic if we're on that page
  const actionButton = document.getElementById("actionButton");
  if (!actionButton) return;

  // Ensure feedback starts hidden
  hideFeedback();

  // Wire button
  actionButton.addEventListener("click", onActionButtonClick);

  // Wire feedback UI
  wireDifficultyDots();

  // Initial render
  syncUI();
}


// meal data is declared in nutrition-data.js and loaded before app.js
// this file no longer contains the raw breakfast/dinner arrays

// the state for the meal prep flow (separate indices)
let mealPrepState = {
  breakfastIndex: 0,
  dinnerIndex: 0,
  lockedBreakfast: null,   // index that has been locked, or null
  lockedDinner: null      // same for dinner
};

// arrays selected for the current session
let selectedMeals = {
  breakfast: [],
  dinner: []
};

function setupMealPrep() {
  const start = document.getElementById("startPrep");
  const enter = document.getElementById("enterMeal");
  const panelB = document.getElementById("mealPrepBreakfast");
  const panelD = document.getElementById("mealPrepDinner");
  if (!start || !panelB || !panelD) return;

  const bTitle = document.getElementById("breakfastTitle");
  const bName = document.getElementById("breakfastName");
  const bExplore = document.getElementById("breakfastExplore");
  const bDetails = document.getElementById("breakfastDetails");
  const bNext = document.getElementById("breakfastNext");
  const bPrev = document.getElementById("breakfastPrev");
  const bConfirm = document.getElementById("breakfastConfirm");

  const dTitle = document.getElementById("dinnerTitle");
  const dName = document.getElementById("dinnerName");
  const dExplore = document.getElementById("dinnerExplore");
  const dDetails = document.getElementById("dinnerDetails");
  const dNext = document.getElementById("dinnerNext");
  const dPrev = document.getElementById("dinnerPrev");
  const dConfirm = document.getElementById("dinnerConfirm");

  function render(type) {
    const idx = type === "breakfast" ? mealPrepState.breakfastIndex : mealPrepState.dinnerIndex;
    const arr = selectedMeals[type];
    const item = arr[idx] || { name: "(no meals defined)" };
    const titleEl = type === "breakfast" ? bTitle : dTitle;
    const nameEl = type === "breakfast" ? bName : dName;
    const exploreBtn = type === "breakfast" ? bExplore : dExplore;
    const detailsEl = type === "breakfast" ? bDetails : dDetails;
    const confirmBtn = type === "breakfast" ? bConfirm : dConfirm;
    const prevBtn = type === "breakfast" ? bPrev : dPrev;
    const nextBtn = type === "breakfast" ? bNext : dNext;
    titleEl.textContent = `${type[0].toUpperCase() + type.slice(1)} ${idx + 1} of ${arr.length}`;
    nameEl.textContent = item.name;
    // if this index is locked, mark accordingly
    const lockedIdx = type === "breakfast" ? mealPrepState.lockedBreakfast : mealPrepState.lockedDinner;
    const isLocked = lockedIdx === idx;
    if (isLocked) {
      confirmBtn.textContent = "Locked In";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      exploreBtn.disabled = true;
    } else {
      confirmBtn.textContent = "Confirm";
      prevBtn.disabled = false;
      nextBtn.disabled = false;
      exploreBtn.disabled = false;
    }
    // prepare details html
    let html = "";
    if (item.ingredients) {
      const lines = item.ingredients.split("\n").filter(l=>l.trim());
      html += lines.map(l => `<div>• ${l}</div>`).join("");
    }
    if (item.link) {
      html += `<div style=\"margin-top:4px;\"><em>${item.link}</em></div>`;
    }
    detailsEl.innerHTML = html;
    // show/hide explore button
    if (html) {
      exploreBtn.style.display = "inline";
      // ensure details hidden initially
      detailsEl.classList.add("hidden");
    } else {
      exploreBtn.style.display = "none";
    }
  }

  function randSample(arr, count) {
    const copy = arr.slice();
    const res = [];
    while (res.length < count && copy.length) {
      const i = Math.floor(Math.random() * copy.length);
      res.push(copy.splice(i, 1)[0]);
    }
    return res;
  }

  start.addEventListener("click", () => {
    selectedMeals.breakfast = randSample(nutritionMeals.breakfast, 6);
    selectedMeals.dinner = randSample(nutritionMeals.dinner, 6);
    mealPrepState.breakfastIndex = 0;
    mealPrepState.dinnerIndex = 0;
    panelB.classList.remove("hidden");
    panelD.classList.remove("hidden");
    render("breakfast");
    render("dinner");
    // hide shopping list button when beginning a new session
    updateShoppingVisibility();
    // also clear any existing list and reset buttons
    if (shoppingListDiv) shoppingListDiv.innerHTML = "";
    if (finalizeBtn) finalizeBtn.classList.add("hidden");
    if (shopBtn) shopBtn.classList.remove("hidden");
  });
  // handle manual meal entry via in-app overlay
  if (enter) {
    enter.addEventListener("click", () => {
      const overlay = document.getElementById("mealEntryOverlay");
      if (overlay) {
        // update button labels from stored selected names or current session
        const todayISO = toISODate(new Date());
        const bName = localStorage.getItem(`selectedBreakfast:${todayISO}`) ||
                      (selectedMeals.breakfast[mealPrepState.lockedBreakfast] || {}).name ||
                      "Breakfast";
        const dName = localStorage.getItem(`selectedDinner:${todayISO}`) ||
                      (selectedMeals.dinner[mealPrepState.lockedDinner] || {}).name ||
                      "Dinner";
        const bBtn = document.getElementById("mealBreakfastBtn");
        const dBtn = document.getElementById("mealDinnerBtn");
        if (bBtn) {
          bBtn.textContent = bName;
          bBtn.disabled = false;
        }
        if (dBtn) {
          dBtn.textContent = dName;
          dBtn.disabled = false;
        }
        overlay.classList.remove("hidden");
      }
    });
  }

  // helper to persist meal using provided name
  function saveMealEntry(type, value) {
    const todayISO = toISODate(new Date());
    if (type === "breakfast") {
      localStorage.setItem(`mealBreakfast:${todayISO}`, "1");
      localStorage.setItem(`mealBreakfastName:${todayISO}`, value);
    } else if (type === "dinner") {
      localStorage.setItem(`mealDinner:${todayISO}`, "1");
      localStorage.setItem(`mealDinnerName:${todayISO}`, value);
    }
    renderWeek(new Date());
  }

  // overlay controls
  const breakfastBtn = document.getElementById("mealBreakfastBtn");
  const dinnerBtn = document.getElementById("mealDinnerBtn");
  const closeMealEntry = document.getElementById("closeMealEntry");

  if (breakfastBtn) breakfastBtn.addEventListener("click", () => {
    const name = breakfastBtn.textContent || "Breakfast";
    saveMealEntry("breakfast", name);
    breakfastBtn.disabled = true;
    // close overlay after entry
    const overlay = document.getElementById("mealEntryOverlay");
    if (overlay) overlay.classList.add("hidden");
  });
  if (dinnerBtn) dinnerBtn.addEventListener("click", () => {
    const name = dinnerBtn.textContent || "Dinner";
    saveMealEntry("dinner", name);
    dinnerBtn.disabled = true;
    const overlay = document.getElementById("mealEntryOverlay");
    if (overlay) overlay.classList.add("hidden");
  });
  if (closeMealEntry) closeMealEntry.addEventListener("click", () => {
    const overlay = document.getElementById("mealEntryOverlay");
    if (overlay) overlay.classList.add("hidden");
  });
  bNext.addEventListener("click", () => {
    if (mealPrepState.breakfastIndex < selectedMeals.breakfast.length - 1) {
      mealPrepState.breakfastIndex++;
      render("breakfast");
    }
  });
  bPrev.addEventListener("click", () => {
    if (mealPrepState.breakfastIndex > 0) {
      mealPrepState.breakfastIndex--;
      render("breakfast");
    }
  });
  bExplore.addEventListener("click", () => {
    bDetails.classList.toggle("hidden");
  });

  dNext.addEventListener("click", () => {
    if (mealPrepState.dinnerIndex < selectedMeals.dinner.length - 1) {
      mealPrepState.dinnerIndex++;
      render("dinner");
    }
  });
  dPrev.addEventListener("click", () => {
    if (mealPrepState.dinnerIndex > 0) {
      mealPrepState.dinnerIndex--;
      render("dinner");
    }
  });
  dExplore.addEventListener("click", () => {
    dDetails.classList.toggle("hidden");
  });

  // shopping list button logic
  const shopContainer = document.getElementById("shoppingContainer");
  const shopBtn = document.getElementById("generateList");
  const shoppingListDiv = document.getElementById("shoppingList");
  const finalizeBtn = document.getElementById("finalizeList");

  function updateShoppingVisibility() {
    if (mealPrepState.lockedBreakfast !== null && mealPrepState.lockedDinner !== null) {
      shopContainer.classList.remove("hidden");
    } else {
      shopContainer.classList.add("hidden");
    }
  }

  // build a deduplicated array of ingredients from the two locked meals
  function generateShoppingList() {
    const items = [];
    const addLines = (text) => {
      if (!text) return;
      text.split("\n").forEach(line => {
        const clean = line.trim();
        if (!clean) return;
        // drop leading bullet/dash chars
        const norm = clean.replace(/^[-•\s]+/, "");
        if (!items.includes(norm)) items.push(norm);
      });
    };
    const bIdx = mealPrepState.lockedBreakfast;
    const dIdx = mealPrepState.lockedDinner;
    if (bIdx !== null) addLines(selectedMeals.breakfast[bIdx].ingredients);
    if (dIdx !== null) addLines(selectedMeals.dinner[dIdx].ingredients);
    return items;
  }

  function renderShoppingUI(listItems) {
    // clear any previous list
    shoppingListDiv.innerHTML = "";
    listItems.forEach((item, i) => {
      const row = document.createElement("div");
      row.className = "shop-row";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `shopItem${i}`;
      cb.value = item;
      const label = document.createElement("label");
      label.htmlFor = cb.id;
      label.textContent = item;
      // label first, checkbox on right
      row.appendChild(label);
      row.appendChild(cb);
      shoppingListDiv.appendChild(row);
    });
    finalizeBtn.classList.remove("hidden");
    shopBtn.classList.add("hidden");
  }

  function finalizeShopping() {
    // remove checked items and leave the rest visible
    const checkboxes = shoppingListDiv.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(cb => {
      if (cb.checked) {
        const row = cb.closest(".shop-row");
        if (row) row.remove();
      }
    });
    // if no items remain, reset UI
    if (!shoppingListDiv.hasChildNodes()) {
      shopBtn.classList.remove("hidden");
      finalizeBtn.classList.add("hidden");
    }
  }

  // call after lock/unlock events
  bConfirm.addEventListener("click", () => {
    const todayISO = toISODate(new Date());
    const idx = mealPrepState.breakfastIndex;
    if (mealPrepState.lockedBreakfast === idx) {
      // unlock
      mealPrepState.lockedBreakfast = null;
      localStorage.removeItem(`selectedBreakfast:${todayISO}`);
      render("breakfast");
    } else {
      mealPrepState.lockedBreakfast = idx;
      render("breakfast");
      // persist selected name
      const item = selectedMeals.breakfast[idx];
      if (item && item.name) {
        localStorage.setItem(`selectedBreakfast:${todayISO}`, item.name);
      }
    }
    updateShoppingVisibility();
  });

  dConfirm.addEventListener("click", () => {
    const todayISO = toISODate(new Date());
    const idx = mealPrepState.dinnerIndex;
    if (mealPrepState.lockedDinner === idx) {
      mealPrepState.lockedDinner = null;
      localStorage.removeItem(`selectedDinner:${todayISO}`);
      render("dinner");
    } else {
      mealPrepState.lockedDinner = idx;
      render("dinner");
      const item = selectedMeals.dinner[idx];
      if (item && item.name) {
        localStorage.setItem(`selectedDinner:${todayISO}`, item.name);
      }
    }
    updateShoppingVisibility();
  });

  if (shopBtn) {
    shopBtn.addEventListener("click", () => {
      const items = generateShoppingList();
      renderShoppingUI(items);
    });
  }
  if (finalizeBtn) {
    finalizeBtn.addEventListener("click", finalizeShopping);
  }
}

// Auto-run init on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    init();
    setupMealPrep();
  });
} else {
  init();
  setupMealPrep();
}




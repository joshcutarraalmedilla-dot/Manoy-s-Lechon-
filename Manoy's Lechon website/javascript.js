/* ============================================================
   MANOY'S LECHON BOHOL — app.js
   All pricing data and UI logic lives here.
   ============================================================ */

/* ============================================================
   ✏️  PRICING CONFIGURATION
   ─────────────────────────────────────────────────────────────
   To ADD a new whole lechon size:
     1. Add a new line to WHOLE_LECHON_PRICES:
        e.g.  22: 9500,   ← means 22 kg = ₱9,500
     2. Optionally add availability info in WHOLE_LECHON_AVAILABILITY
        using the same kg as the key.
     3. Save the file — the button appears automatically. Done!

   To ADD a new lechon belly size:
     1. Add a new line to BELLY_PRICES:
        e.g.  9: 4050,    ← means 9 kg = ₱4,050
     2. Optionally add availability info in BELLY_AVAILABILITY.
     3. Save the file — the button appears automatically. Done!

   To CHANGE minimum kg for belly:
     Update BELLY_MIN_KG below.
   ============================================================ */

// ── Whole Lechon Price Table ──────────────────────────────────
// Format:  <weight in kg> : <price in PHP>
// The 18–20 kg base price is ₱8,500 (as per owner requirement).
// Add more entries as needed; they will auto-sort on screen.
const WHOLE_LECHON_PRICES = {
  18: 8499,   // base price (18 kg = ₱8,500)
  19: 8899,   // same slab for 18–20 kg
  20: 9199,  // same slab for 18–20 kg
  21: 9499,   // ← ADD or CHANGE prices freely below this line
  22: 9899,
  23: 10499,
  24: 11999,
  25: 11699,
};

// ── Lechon Belly Price Table ──────────────────────────────────
// Format:  <weight in kg> : <price in PHP>
const BELLY_PRICES = {
  2:  1899,    // minimum order (2 kg)
  3:  2999,
  4:  3299,
  5:  3999,
  6:  4799,
  7:  5599,
  8:  6399,
  9:  7199,    // ← ADD or CHANGE prices freely below this line
};

// ── Minimum kg for lechon belly ───────────────────────────────
// Change this number to enforce a different minimum order.
const BELLY_MIN_KG = 2;

// ── Availability Labels ────────────────────────────────────────
// Optional: display availability status per kg.
// If a kg is not listed here, no badge is shown.
// Values: 'available' | 'limited' | 'soldout'
const WHOLE_LECHON_AVAILABILITY = {
  18: 'available',
  19: 'available',
  20: 'limited',
  21: 'available',
  22: 'available',
  23: 'limited',
  24: 'available',
  25: 'available',
};

const BELLY_AVAILABILITY = {
  2:  'available',
  3:  'available',
  4:  'available',
  5:  'limited',
  6:  'available',
  7:  'available',
  8:  'limited',
  9:  'available',
};

// ── Availability display config ───────────────────────────────
const AVAIL_LABELS = {
  available: { text: '✅ Available',       color: '#22c55e' },
  limited:   { text: '⚠️ Limited Slots',  color: '#f59e0b' },
  soldout:   { text: '❌ Sold Out',        color: '#ef4444' },
};

/* ============================================================
   GENERATE BUTTONS FROM PRICE TABLES
   No need to touch HTML — add prices above and buttons appear.
============================================================ */

function buildButtons(priceTable, containerId, category) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  // Sort entries by kg ascending
  const sortedEntries = Object.entries(priceTable).sort((a, b) => Number(a[0]) - Number(b[0]));

  sortedEntries.forEach(([kg, price]) => {
    const btn = document.createElement('button');
    btn.className = 'kg-btn';
    btn.dataset.kg = kg;
    btn.dataset.price = price;
    btn.dataset.category = category;
    btn.innerHTML = `<span>${kg} kg</span>`;
    btn.setAttribute('aria-label', `Select ${kg} kg for ${category}`);
    btn.addEventListener('click', () => onKgSelect(btn, category));
    container.appendChild(btn);
  });
}

/* ============================================================
   HANDLE KG BUTTON SELECTION
============================================================ */

function onKgSelect(clickedBtn, category) {
  const kg    = Number(clickedBtn.dataset.kg);
  const price = Number(clickedBtn.dataset.price);

  // Deselect all buttons in same category
  document.querySelectorAll(`[data-category="${category}"]`).forEach(b => b.classList.remove('selected'));
  clickedBtn.classList.add('selected');

  // Update display
  if (category === 'whole') {
    updatePriceDisplay('whole', kg, price);
  } else {
    updatePriceDisplay('belly', kg, price);
  }
}

/* ============================================================
   UPDATE PRICE DISPLAY BOX
============================================================ */

function updatePriceDisplay(type, kg, price) {
  const priceEl   = document.getElementById(`${type}-price`);
  const subEl     = document.getElementById(`${type}-price-sub`);
  const availEl   = document.getElementById(`${type}-avail`);
  const selectedEl = document.getElementById(`${type}-selected-kg`);

  // Format price as Philippine peso
  const formatted = '₱ ' + price.toLocaleString('en-PH');

  // Animate the price number popping
  priceEl.classList.remove('pop');
  void priceEl.offsetWidth; // reflow to restart animation
  priceEl.textContent = formatted;
  priceEl.classList.add('pop');
  setTimeout(() => priceEl.classList.remove('pop'), 350);

  // Update sub text
  subEl.textContent = `For ${kg} kg`;

  // Update selected kg display
  selectedEl.textContent = `${kg} kg`;

  // Availability badge
  const availTable = type === 'whole' ? WHOLE_LECHON_AVAILABILITY : BELLY_AVAILABILITY;
  const status = availTable[kg];
  if (status && AVAIL_LABELS[status]) {
    const { text, color } = AVAIL_LABELS[status];
    availEl.innerHTML = `<span style="color:${color};font-weight:800;">${text}</span>`;
  } else {
    availEl.innerHTML = '';
  }
}

/* ============================================================
   TAB SWITCHING
============================================================ */

function switchTab(tabId, clickedBtn) {
  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  // Show selected
  document.getElementById(`panel-${tabId}`).classList.add('active');
  clickedBtn.classList.add('active');
}

/* ============================================================
   SCROLL REVEAL — Intersection Observer
============================================================ */

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ============================================================
   NAVBAR SCROLL EFFECT
============================================================ */

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ============================================================
   UPDATE MENU "STARTS AT" PRICES
   Reads the lowest price from each table and displays it.
   This auto-updates if you add lower-priced sizes!
============================================================ */

function updateMenuStartPrices() {
  // Whole lechon — minimum price
  const wholeMin = Math.min(...Object.values(WHOLE_LECHON_PRICES));
  const wholeEl  = document.getElementById('whole-start-price');
  if (wholeEl) wholeEl.textContent = '₱' + wholeMin.toLocaleString('en-PH');

  // Belly — minimum price
  const bellyMin = Math.min(...Object.values(BELLY_PRICES));
  const bellyEl  = document.getElementById('belly-start-price');
  if (bellyEl) bellyEl.textContent = '₱' + bellyMin.toLocaleString('en-PH');
}

/* ============================================================
   INIT — runs once the page loads
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Build kg buttons from price tables
  buildButtons(WHOLE_LECHON_PRICES, 'whole-kg-buttons', 'whole');
  buildButtons(BELLY_PRICES,         'belly-kg-buttons', 'belly');

  // Update menu "starts at" prices
  updateMenuStartPrices();

  // Scroll reveal
  initScrollReveal();

  // Navbar
  initNavbar();

  // Hero reveal on load
  document.querySelector('.hero-content')?.classList.add('visible');
});
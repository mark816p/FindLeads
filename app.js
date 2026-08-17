/**
 * FindLeads — app.js
 * Zero-cost, browser-based lead generation using OpenStreetMap.
 * No API keys, no backend, no build tools.
 */

// ============================================================
//  Category Mapping Table (plain-English → OSM tag arrays)
//  Each entry: { key: 'osm_key', value: 'osm_value' }
//  Multiple entries = OR condition in Overpass query
// ============================================================
const CATEGORY_MAP = {
  // --- Hair & Beauty ---
  'barbershop':        [{ k:'shop',   v:'hairdresser' }, { k:'amenity', v:'barber' }],
  'barbershops':       [{ k:'shop',   v:'hairdresser' }, { k:'amenity', v:'barber' }],
  'barber':            [{ k:'shop',   v:'hairdresser' }, { k:'amenity', v:'barber' }],
  'barbers':           [{ k:'shop',   v:'hairdresser' }, { k:'amenity', v:'barber' }],
  'hair salon':        [{ k:'shop',   v:'hairdresser' }],
  'hair salons':       [{ k:'shop',   v:'hairdresser' }],
  'beauty salon':      [{ k:'shop',   v:'beauty' }],
  'beauty salons':     [{ k:'shop',   v:'beauty' }],
  'nail salon':        [{ k:'shop',   v:'nail_salon' }],
  'nail salons':       [{ k:'shop',   v:'nail_salon' }],
  'nails':             [{ k:'shop',   v:'nail_salon' }],
  'tanning salon':     [{ k:'shop',   v:'tanning' }],
  'tattoo':            [{ k:'shop',   v:'tattoo' }],
  'tattoo parlor':     [{ k:'shop',   v:'tattoo' }],
  'spa':               [{ k:'leisure',v:'spa' }],
  'spas':              [{ k:'leisure',v:'spa' }],
  'massage':           [{ k:'shop',   v:'massage' }],

  // --- Fitness & Wellness ---
  'gym':               [{ k:'leisure',v:'fitness_centre' }, { k:'amenity', v:'gym' }],
  'gyms':              [{ k:'leisure',v:'fitness_centre' }, { k:'amenity', v:'gym' }],
  'fitness center':    [{ k:'leisure',v:'fitness_centre' }],
  'fitness':           [{ k:'leisure',v:'fitness_centre' }],
  'yoga studio':       [{ k:'sport',  v:'yoga' }, { k:'leisure',v:'fitness_centre' }],
  'yoga':              [{ k:'sport',  v:'yoga' }],
  'yoga studios':      [{ k:'sport',  v:'yoga' }],
  'pilates':           [{ k:'sport',  v:'pilates' }],
  'crossfit':          [{ k:'sport',  v:'crossfit' }],
  'martial arts':      [{ k:'sport',  v:'martial_arts' }],
  'boxing gym':        [{ k:'sport',  v:'boxing' }],
  'swimming pool':     [{ k:'leisure',v:'swimming_pool' }],

  // --- Medical & Health ---
  'dentist':           [{ k:'amenity',v:'dentist' }],
  'dentists':          [{ k:'amenity',v:'dentist' }],
  'dental':            [{ k:'amenity',v:'dentist' }],
  'doctor':            [{ k:'amenity',v:'doctors' }],
  'doctors':           [{ k:'amenity',v:'doctors' }],
  'clinic':            [{ k:'amenity',v:'clinic' }],
  'clinics':           [{ k:'amenity',v:'clinic' }],
  'optometrist':       [{ k:'amenity',v:'optician' }, { k:'shop', v:'optician' }],
  'optometrists':      [{ k:'amenity',v:'optician' }, { k:'shop', v:'optician' }],
  'optician':          [{ k:'shop',   v:'optician' }],
  'pharmacy':          [{ k:'amenity',v:'pharmacy' }],
  'pharmacies':        [{ k:'amenity',v:'pharmacy' }],
  'chiropractor':      [{ k:'amenity',v:'chiropractor' }],
  'physical therapy':  [{ k:'amenity',v:'physiotherapist' }],
  'physiotherapy':     [{ k:'amenity',v:'physiotherapist' }],
  'veterinarian':      [{ k:'amenity',v:'veterinary' }],
  'vet':               [{ k:'amenity',v:'veterinary' }],
  'veterinary':        [{ k:'amenity',v:'veterinary' }],

  // --- Food & Drink ---
  'restaurant':        [{ k:'amenity',v:'restaurant' }],
  'restaurants':       [{ k:'amenity',v:'restaurant' }],
  'cafe':              [{ k:'amenity',v:'cafe' }],
  'cafes':             [{ k:'amenity',v:'cafe' }],
  'coffee shop':       [{ k:'amenity',v:'cafe' }],
  'coffee':            [{ k:'amenity',v:'cafe' }],
  'fast food':         [{ k:'amenity',v:'fast_food' }],
  'takeaway':          [{ k:'amenity',v:'fast_food' }],
  'bar':               [{ k:'amenity',v:'bar' }],
  'bars':              [{ k:'amenity',v:'bar' }],
  'pub':               [{ k:'amenity',v:'pub' }],
  'pubs':              [{ k:'amenity',v:'pub' }],
  'bakery':            [{ k:'shop',   v:'bakery' }],
  'bakeries':          [{ k:'shop',   v:'bakery' }],
  'pizza':             [{ k:'amenity',v:'restaurant' }, { k:'amenity',v:'fast_food' }],
  'ice cream':         [{ k:'amenity',v:'ice_cream' }, { k:'shop', v:'ice_cream' }],

  // --- Automotive ---
  'auto repair':       [{ k:'shop',   v:'car_repair' }],
  'car repair':        [{ k:'shop',   v:'car_repair' }],
  'mechanic':          [{ k:'shop',   v:'car_repair' }],
  'mechanics':         [{ k:'shop',   v:'car_repair' }],
  'auto shop':         [{ k:'shop',   v:'car_repair' }],
  'car wash':          [{ k:'amenity',v:'car_wash' }],
  'car dealer':        [{ k:'shop',   v:'car' }],
  'tire shop':         [{ k:'shop',   v:'tyres' }],
  'tires':             [{ k:'shop',   v:'tyres' }],
  'gas station':       [{ k:'amenity',v:'fuel' }],
  'fuel':              [{ k:'amenity',v:'fuel' }],

  // --- Pet Services ---
  'pet groomer':       [{ k:'shop',   v:'pet_grooming' }],
  'pet groomers':      [{ k:'shop',   v:'pet_grooming' }],
  'grooming':          [{ k:'shop',   v:'pet_grooming' }],
  'pet shop':          [{ k:'shop',   v:'pet' }],
  'pet store':         [{ k:'shop',   v:'pet' }],

  // --- Home Services ---
  'plumber':           [{ k:'shop',   v:'plumber' }],
  'plumbers':          [{ k:'shop',   v:'plumber' }],
  'plumbing':          [{ k:'shop',   v:'plumber' }],
  'electrician':       [{ k:'shop',   v:'electrician' }],
  'electricians':      [{ k:'shop',   v:'electrician' }],
  'locksmith':         [{ k:'shop',   v:'locksmith' }],
  'locksmiths':        [{ k:'shop',   v:'locksmith' }],
  'cleaning':          [{ k:'shop',   v:'cleaning' }],
  'cleaning service':  [{ k:'shop',   v:'cleaning' }],
  'laundromat':        [{ k:'shop',   v:'laundry' }],
  'laundry':           [{ k:'shop',   v:'laundry' }],
  'dry cleaner':       [{ k:'shop',   v:'dry_cleaning' }],
  'hardware store':    [{ k:'shop',   v:'hardware' }],
  'hardware':          [{ k:'shop',   v:'hardware' }],

  // --- Retail ---
  'clothing store':    [{ k:'shop',   v:'clothes' }],
  'clothing':          [{ k:'shop',   v:'clothes' }],
  'boutique':          [{ k:'shop',   v:'clothes' }],
  'bookstore':         [{ k:'shop',   v:'books' }],
  'book store':        [{ k:'shop',   v:'books' }],
  'flower shop':       [{ k:'shop',   v:'florist' }],
  'florist':           [{ k:'shop',   v:'florist' }],
  'florists':          [{ k:'shop',   v:'florist' }],
  'jewelry':           [{ k:'shop',   v:'jewelry' }],
  'jeweler':           [{ k:'shop',   v:'jewelry' }],
  'electronics':       [{ k:'shop',   v:'electronics' }],
  'furniture':         [{ k:'shop',   v:'furniture' }],
  'antique':           [{ k:'shop',   v:'antiques' }],
  'gift shop':         [{ k:'shop',   v:'gift' }],
  'toy store':         [{ k:'shop',   v:'toys' }],

  // --- Professional Services ---
  'real estate':       [{ k:'office', v:'estate_agent' }],
  'accountant':        [{ k:'office', v:'accountant' }],
  'accountants':       [{ k:'office', v:'accountant' }],
  'lawyer':            [{ k:'office', v:'lawyer' }],
  'lawyers':           [{ k:'office', v:'lawyer' }],
  'attorney':          [{ k:'office', v:'lawyer' }],
  'financial advisor': [{ k:'office', v:'financial' }],
  'insurance':         [{ k:'office', v:'insurance' }],
  'travel agency':     [{ k:'shop',   v:'travel_agency' }],
  'hotel':             [{ k:'tourism',v:'hotel' }],
  'hotels':            [{ k:'tourism',v:'hotel' }],
  'motel':             [{ k:'tourism',v:'motel' }],

  // --- Education ---
  'school':            [{ k:'amenity',v:'school' }],
  'daycare':           [{ k:'amenity',v:'childcare' }],
  'tutoring':          [{ k:'amenity',v:'tutoring_centre' }],

  // --- Entertainment ---
  'cinema':            [{ k:'amenity',v:'cinema' }],
  'movie theater':     [{ k:'amenity',v:'cinema' }],
  'photography':       [{ k:'shop',   v:'photo' }],
  'photographer':      [{ k:'shop',   v:'photo' }],
  'music school':      [{ k:'amenity',v:'music_school' }],
  'art gallery':       [{ k:'tourism',v:'gallery' }],
  'museum':            [{ k:'tourism',v:'museum' }],
};

// Unique list for autocomplete display
const CATEGORY_LIST = [...new Set(Object.keys(CATEGORY_MAP))].sort();

// Popular category pills
const POPULAR_CATEGORIES = [
  { emoji: '✂️', label: 'Barbershops' },
  { emoji: '💪', label: 'Gyms' },
  { emoji: '🦷', label: 'Dentists' },
  { emoji: '🍕', label: 'Restaurants' },
  { emoji: '🔧', label: 'Auto Repair' },
  { emoji: '🧘', label: 'Yoga Studios' },
  { emoji: '🐾', label: 'Pet Groomers' },
  { emoji: '☕', label: 'Coffee Shops' },
  { emoji: '💅', label: 'Nail Salons' },
  { emoji: '🔩', label: 'Plumbers' },
];

// Pre-built starter searches
const STARTER_SEARCHES = [
  { emoji: '✂️', category: 'Barbershops',  city: 'Austin, TX' },
  { emoji: '🦷', category: 'Dentists',     city: 'Brooklyn, NY' },
  { emoji: '💅', category: 'Nail Salons',  city: 'Los Angeles, CA' },
  { emoji: '🔧', category: 'Auto Repair',  city: 'Chicago, IL' },
  { emoji: '🐾', category: 'Pet Groomers', city: 'Miami, FL' },
  { emoji: '☕', category: 'Coffee Shops', city: 'Seattle, WA' },
];

// Pro tips (rotated)
const PRO_TIPS = [
  'Targeting smaller towns means fewer competitors pitching the same business.',
  'Restaurants, salons, and auto shops are the easiest cold pitches — they benefit obviously from an online presence.',
  'If a business has 20+ reviews but no website, they have customers to lose — that\'s your pitch.',
  'A personal cold email referencing the business by name converts 3× better than a generic template.',
  'Start your pitch with: "I found your listing on Google Maps — here\'s what a simple site could do for you."',
  'Businesses with a phone number in the data are easier to call; those without rely on walk-in traffic.',
];

// ============================================================
//  State
// ============================================================
let allResults       = [];   // full unfiltered results from last search
let displayedCount   = 0;    // how many cards are shown (pagination)
let lastSearchQuery  = null; // { category, city }
let isLoading        = false;
let pendingLead      = null; // lead awaiting list assignment in modal
const PAGE_SIZE      = 20;

// ============================================================
//  Utility helpers
// ============================================================
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function formatPhone(phone) {
  if (!phone) return null;
  return phone.trim().replace(/\s+/g, ' ');
}

function formatAddress(tags) {
  const parts = [];
  if (tags['addr:housenumber'] && tags['addr:street']) {
    parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
  } else if (tags['addr:street']) {
    parts.push(tags['addr:street']);
  }
  if (tags['addr:city']) parts.push(tags['addr:city']);
  if (tags['addr:state']) parts.push(tags['addr:state']);
  if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
  return parts.join(', ') || null;
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ============================================================
//  Website detection
// ============================================================
function hasWebsite(tags) {
  const keys = ['website','contact:website','url','contact:url'];
  return keys.some(k => tags[k] && tags[k].trim().length > 0);
}

// ============================================================
//  Google Maps deeplink
// ============================================================
function buildMapsUrl(name, address) {
  const query = [name, address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// ============================================================
//  Nominatim geocoding
// ============================================================
async function geocodeLocation(cityName) {
  const url = `https://nominatim.openstreetmap.org/search?` +
    new URLSearchParams({
      q: cityName,
      format: 'json',
      limit: '1',
      addressdetails: '1',
    });

  const resp = await fetch(url, {
    headers: { 'User-Agent': 'FindLeads/1.0 (github.com/FindLeads)' }
  });

  if (!resp.ok) throw new Error(`Nominatim error: ${resp.status}`);
  const data = await resp.json();
  if (!data.length) throw new Error(`Location not found: "${cityName}"`);

  const { boundingbox, display_name } = data[0];
  // boundingbox = [south, north, west, east]
  return {
    south: parseFloat(boundingbox[0]),
    north: parseFloat(boundingbox[1]),
    west:  parseFloat(boundingbox[2]),
    east:  parseFloat(boundingbox[3]),
    displayName: display_name,
  };
}

// ============================================================
//  Overpass query builder
// ============================================================
function buildOverpassQuery(osmTags, bbox) {
  const { south, west, north, east } = bbox;
  const bboxStr = `${south},${west},${north},${east}`;

  const nodeLines = osmTags
    .map(t => `  node["${t.k}"="${t.v}"](${bboxStr});`)
    .join('\n');
  const wayLines = osmTags
    .map(t => `  way["${t.k}"="${t.v}"](${bboxStr});`)
    .join('\n');
  const relLines = osmTags
    .map(t => `  relation["${t.k}"="${t.v}"](${bboxStr});`)
    .join('\n');

  return `[out:json][timeout:30];
(
${nodeLines}
${wayLines}
${relLines}
);
out body;
>;
out skel qt;`;
}

// ============================================================
//  Fetch from Overpass
// ============================================================
async function fetchFromOverpass(query) {
  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (resp.status === 429 || resp.status === 504) {
    throw new Error('overpass_busy');
  }
  if (!resp.ok) throw new Error(`Overpass error: ${resp.status}`);

  const data = await resp.json();
  return data.elements || [];
}

// ============================================================
//  Parse OSM elements into lead objects
// ============================================================
function parseElements(elements, categoryLabel) {
  const seen = new Set();
  const leads = [];

  for (const el of elements) {
    if (!el.tags || !el.tags.name) continue;

    const name = el.tags.name.trim();
    const addr = formatAddress(el.tags);
    const key  = `${name}|${addr || el.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const phone = formatPhone(
      el.tags.phone ||
      el.tags['contact:phone'] ||
      el.tags['phone:mobile'] ||
      null
    );

    leads.push({
      id:          el.id,
      name,
      address:     addr,
      phone,
      website:     el.tags.website || el.tags['contact:website'] || null,
      hasWebsite:  hasWebsite(el.tags),
      category:    categoryLabel,
      mapsUrl:     buildMapsUrl(name, addr),
      tags:        el.tags,
      lat:         el.lat || (el.center && el.center.lat),
      lon:         el.lon || (el.center && el.center.lon),
      dateSaved:   null,
    });
  }

  return leads;
}

// ============================================================
//  Filter & Sort
// ============================================================
function applyFilters(leads, { leadsOnly, sort }) {
  let filtered = leadsOnly ? leads.filter(l => !l.hasWebsite) : [...leads];

  switch (sort) {
    case 'leads-first':
      filtered.sort((a, b) => a.hasWebsite - b.hasWebsite);
      break;
    case 'name-az':
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      filtered.sort((a, b) => a.hasWebsite - b.hasWebsite);
  }

  return filtered;
}

// ============================================================
//  Rendering
// ============================================================
function renderSkeleton(count = 6) {
  const grid = $('#results-grid');
  grid.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton-card" aria-hidden="true">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line badge"></div>
      </div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-actions">
        <div class="skeleton-btn"></div>
        <div class="skeleton-btn"></div>
      </div>
    </div>
  `).join('');
}

function renderCard(lead) {
  const badgeHtml = lead.hasWebsite
    ? `<span class="badge badge-has-website">🌐 Has Website</span>`
    : `<span class="badge badge-lead"><span class="badge-dot"></span>No Website — Lead!</span>`;

  const addressHtml = lead.address
    ? `<div class="detail-row">
         <span class="detail-icon">📍</span>
         <span class="detail-value">${esc(lead.address)}</span>
       </div>`
    : '';

  const phoneHtml = lead.phone
    ? `<div class="phone-row">
         <span class="detail-icon">📞</span>
         <span class="detail-value">${esc(lead.phone)}</span>
         <button class="btn-copy" data-phone="${esc(lead.phone)}" aria-label="Copy phone number">Copy</button>
       </div>`
    : '';

  const websiteHtml = lead.hasWebsite && lead.website
    ? `<div class="detail-row">
         <span class="detail-icon">🔗</span>
         <a href="${esc(lead.website)}" target="_blank" rel="noopener" class="detail-value" style="color:var(--web-color);font-size:var(--fs-xs);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(lead.website)}</a>
       </div>`
    : '';

  return `
    <article class="biz-card ${lead.hasWebsite ? '' : 'is-lead'}" data-id="${lead.id}" aria-label="${esc(lead.name)}">
      <div class="card-header">
        <h3 class="biz-name">${esc(lead.name)}</h3>
        ${badgeHtml}
      </div>
      <span class="category-chip">${esc(lead.category)}</span>
      <div class="card-details">
        ${addressHtml}
        ${phoneHtml}
        ${websiteHtml}
      </div>
      <div class="card-actions">
        <a href="${lead.mapsUrl}" target="_blank" rel="noopener"
           class="btn-action btn-maps"
           id="maps-${lead.id}"
           aria-label="Open ${esc(lead.name)} in Google Maps">
          🗺️ Open in Maps
        </a>
        <button class="btn-action btn-save"
                data-lead-id="${lead.id}"
                id="save-${lead.id}"
                aria-label="Save ${esc(lead.name)} as lead">
          ⭐ Save Lead
        </button>
      </div>
    </article>
  `;
}

function renderResults(filtered, append = false) {
  const grid = $('#results-grid');
  if (!append) grid.innerHTML = '';

  const slice = filtered.slice(displayedCount, displayedCount + PAGE_SIZE);
  if (slice.length === 0 && !append) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No leads found</div>
        <div class="empty-sub">Try a different category or location, or turn off the "No Website Only" filter.</div>
      </div>`;
    $('#load-more-wrap').classList.add('hidden');
    return;
  }

  grid.insertAdjacentHTML('beforeend', slice.map(renderCard).join(''));
  displayedCount += slice.length;

  const remaining = filtered.length - displayedCount;
  const lmw = $('#load-more-wrap');
  if (remaining > 0) {
    lmw.classList.remove('hidden');
    $('#load-more-btn').textContent = `Load ${Math.min(remaining, PAGE_SIZE)} More`;
  } else {
    lmw.classList.add('hidden');
  }
}

function updateToolbar(filtered) {
  const total  = allResults.length;
  const leads  = allResults.filter(l => !l.hasWebsite).length;
  const shown  = filtered.length;
  const lOnly  = $('#filter-leads-only').checked;

  const countEl = $('#results-count');
  if (total > 0) {
    countEl.innerHTML = lOnly
      ? `Showing <strong>${shown}</strong> leads (out of <strong>${total}</strong> businesses found)`
      : `<strong>${shown}</strong> businesses found — <span class="lead-count">${leads} have no website</span>`;
  }
}

// ============================================================
//  Loading stage UI
// ============================================================
function setLoadingStage(stage, sub = '') {
  const stageEl = $('#loading-stage');
  const subEl   = $('#loading-sub');
  if (stageEl) stageEl.textContent = stage;
  if (subEl)   subEl.textContent   = sub;
}

function showLoading() {
  $('#results-section').classList.remove('hidden');
  $('#loading-status').classList.remove('hidden');
  $('#results-toolbar').classList.add('hidden');
  $('#results-grid').innerHTML = '';
  $('#load-more-wrap').classList.add('hidden');
  renderSkeleton(6);
}

function hideLoading() {
  $('#loading-status').classList.add('hidden');
  $('#results-toolbar').classList.remove('hidden');
}

// ============================================================
//  Main search orchestration
// ============================================================
async function runSearch(category, city) {
  if (isLoading) return;
  isLoading = true;
  lastSearchQuery = { category, city };
  allResults = [];
  displayedCount = 0;

  const searchBtn = $('#search-btn');
  searchBtn.disabled = true;

  showLoading();
  setLoadingStage('🌐 Locating city boundaries...', `Finding "${city}" on the map`);

  try {
    // Step 1: Geocode
    const bbox = await geocodeLocation(city);

    // Step 2: Resolve OSM tags
    const normalised = category.toLowerCase().trim();
    const osmTags = CATEGORY_MAP[normalised];
    if (!osmTags) {
      throw new Error(`Category not recognised: "${category}". Try something like "barbershops" or "dentists".`);
    }

    setLoadingStage('🗺️ Querying OpenStreetMap...', `Searching for ${category} in ${bbox.displayName.split(',')[0]}`);

    // Step 3: Build + fire Overpass query
    const query    = buildOverpassQuery(osmTags, bbox);
    const elements = await fetchFromOverpass(query);

    setLoadingStage('✨ Analysing results...', `Processing ${elements.length} records`);

    // Small artificial delay so the animation feels polished
    await new Promise(r => setTimeout(r, 600));

    // Step 4: Parse
    allResults = parseElements(elements, category);

    // Step 5: Add to history
    addToHistory({ category, city, total: allResults.length, leads: allResults.filter(l => !l.hasWebsite).length });

    // Step 6: Render
    hideLoading();

    const filters = getCurrentFilters();
    const filtered = applyFilters(allResults, filters);
    displayedCount = 0;
    renderResults(filtered);
    updateToolbar(filtered);

    if (allResults.length === 0) {
      showToast('info', 'ℹ️ No businesses found. Try a broader location or different category.');
    }

  } catch (err) {
    hideLoading();
    $('#results-grid').innerHTML = '';
    if (err.message === 'overpass_busy') {
      $('#results-grid').innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">⏳</div>
          <div class="empty-title">Overpass API is busy</div>
          <div class="empty-sub">The OpenStreetMap server is under load. Please wait a moment and try again.</div>
          <button class="btn-retry" id="retry-btn" style="margin:20px auto 0;">↺ Retry Search</button>
        </div>`;
      $('#retry-btn')?.addEventListener('click', () => runSearch(category, city));
    } else {
      $('#results-grid').innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">⚠️</div>
          <div class="empty-title">Something went wrong</div>
          <div class="empty-sub">${esc(err.message)}</div>
        </div>`;
      showToast('error', `Error: ${err.message}`);
    }
  } finally {
    isLoading = false;
    searchBtn.disabled = false;
  }
}

function getCurrentFilters() {
  return {
    leadsOnly: $('#filter-leads-only').checked,
    sort:      $('#sort-select').value,
  };
}

function refilter() {
  if (!allResults.length) return;
  const filters  = getCurrentFilters();
  const filtered = applyFilters(allResults, filters);
  displayedCount = 0;
  $('#results-grid').innerHTML = '';
  renderResults(filtered);
  updateToolbar(filtered);
}

// ============================================================
//  localStorage — Search History
// ============================================================
const HISTORY_KEY = 'findleads_history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

function addToHistory(entry) {
  let hist = getHistory();
  // Remove duplicate
  hist = hist.filter(h => !(h.category === entry.category && h.city === entry.city));
  hist.unshift({ ...entry, ts: Date.now() });
  if (hist.length > 10) hist = hist.slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  renderHistoryPanel();
}

function deleteHistoryItem(idx) {
  const hist = getHistory();
  hist.splice(idx, 1);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
  renderHistoryPanel();
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistoryPanel();
}

function renderHistoryPanel() {
  const body = $('#history-panel-body');
  if (!body) return;
  const hist = getHistory();

  if (!hist.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon" style="font-size:32px">🕐</div><div class="empty-sub">No recent searches yet.</div></div>`;
    return;
  }

  body.innerHTML = hist.map((h, i) => `
    <div class="history-item" data-idx="${i}">
      <span class="history-icon">🔍</span>
      <div class="history-info">
        <div class="history-query">${esc(h.category)} in ${esc(h.city)}</div>
        <div class="history-meta">${timeAgo(h.ts)} · ${h.total ?? '?'} found · ${h.leads ?? '?'} leads</div>
      </div>
      <button class="history-delete" data-del-idx="${i}" aria-label="Delete history item">✕</button>
    </div>
  `).join('') + `<button class="panel-clear-btn" id="clear-history-btn">Clear All History</button>`;

  // Wire clicks
  $$('.history-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.history-delete')) return;
      const idx = parseInt(el.dataset.idx);
      const h   = getHistory()[idx];
      if (h) {
        closeAllPanels();
        $('#category-input').value = h.category;
        $('#city-input').value     = h.city;
        runSearch(h.category, h.city);
      }
    });
  });

  $$('.history-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteHistoryItem(parseInt(btn.dataset.delIdx));
    });
  });

  $('#clear-history-btn')?.addEventListener('click', clearHistory);
}

// ============================================================
//  localStorage — Saved Lists
// ============================================================
const LISTS_KEY = 'findleads_saved_lists';

function getSavedLists() {
  try { return JSON.parse(localStorage.getItem(LISTS_KEY) || '{}'); }
  catch { return {}; }
}

function saveLeadToList(lead, listName) {
  const lists = getSavedLists();
  if (!lists[listName]) lists[listName] = [];
  // Avoid duplicates
  if (!lists[listName].find(l => l.id === lead.id)) {
    lists[listName].push({ ...lead, dateSaved: new Date().toISOString() });
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    renderSavedListsPanel();
    return true;
  }
  return false;
}

function deleteList(listName) {
  const lists = getSavedLists();
  delete lists[listName];
  localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
  renderSavedListsPanel();
}

function renderSavedListsPanel() {
  const body = $('#saved-panel-body');
  if (!body) return;
  const lists = getSavedLists();
  const names = Object.keys(lists);

  if (!names.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon" style="font-size:32px">⭐</div><div class="empty-sub">No saved leads yet. Click "Save Lead" on any result card.</div></div>`;
    return;
  }

  body.innerHTML = names.map(name => {
    const leads = lists[name];
    return `
      <div class="saved-list-group">
        <div class="saved-list-header">
          <div class="saved-list-name">📋 ${esc(name)} <span class="saved-list-count">(${leads.length})</span></div>
          <div class="saved-list-actions">
            <button class="btn-export" data-list="${esc(name)}" aria-label="Export ${esc(name)} as CSV">⬇ CSV</button>
            <button class="btn-delete-list" data-list="${esc(name)}" aria-label="Delete list ${esc(name)}">🗑</button>
          </div>
        </div>
        <div class="saved-list-leads">
          ${leads.slice(0, 5).map(l => `
            <div class="saved-lead-item">
              <div class="saved-lead-name">${esc(l.name)}</div>
              <div class="saved-lead-address">${l.address ? esc(l.address) : 'No address'}</div>
            </div>
          `).join('')}
          ${leads.length > 5 ? `<div class="saved-lead-item" style="color:var(--text-muted);font-size:var(--fs-xs)">+ ${leads.length - 5} more</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  $$('.btn-export').forEach(btn => {
    btn.addEventListener('click', () => exportListAsCsv(btn.dataset.list));
  });

  $$('.btn-delete-list').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm(`Delete list "${btn.dataset.list}"?`)) deleteList(btn.dataset.list);
    });
  });
}

// ============================================================
//  CSV Export
// ============================================================
function exportListAsCsv(listName) {
  const lists = getSavedLists();
  const leads = lists[listName];
  if (!leads || !leads.length) return;

  const headers = ['Business Name','Phone','Address','Google Maps URL','Has Website','Date Saved'];
  const rows = leads.map(l => [
    l.name,
    l.phone || '',
    l.address || '',
    l.mapsUrl || '',
    l.hasWebsite ? 'Yes' : 'No',
    l.dateSaved ? new Date(l.dateSaved).toLocaleDateString() : '',
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  const blob   = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url    = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href  = url;
  anchor.download = `${listName.replace(/[^a-z0-9]/gi,'_')}_leads.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  showToast('success', `✅ Exported "${listName}" as CSV`);
}

// ============================================================
//  Save Lead Modal
// ============================================================
function openSaveModal(lead) {
  pendingLead = lead;
  const modal   = $('#save-modal');
  const overlay = $('#save-modal-overlay');
  const bizName = $('#save-modal-biz-name');
  const bizAddr = $('#save-modal-biz-address');

  bizName.textContent = lead.name;
  bizAddr.textContent = lead.address || 'No address on record';

  renderSaveModalLists();

  overlay.classList.add('active');
  modal.setAttribute('aria-hidden','false');
}

function closeSaveModal() {
  $('#save-modal-overlay').classList.remove('active');
  $('#save-modal').setAttribute('aria-hidden','true');
  pendingLead = null;
}

function renderSaveModalLists() {
  const container = $('#existing-lists-container');
  const lists     = getSavedLists();
  const names     = Object.keys(lists);

  if (!names.length) {
    container.innerHTML = `<p style="color:var(--text-muted);font-size:var(--fs-sm);margin-bottom:8px">No existing lists. Create one below.</p>`;
    return;
  }

  container.innerHTML = `<div class="existing-lists-label">Add to existing list</div>` +
    names.map(name => `
      <div class="existing-list-option" data-list="${esc(name)}" tabindex="0" role="button"
           aria-label="Add to list ${esc(name)}">
        📋 ${esc(name)} <span style="color:var(--text-muted);margin-left:auto;font-size:var(--fs-xs)">${lists[name].length} leads</span>
      </div>
    `).join('');

  $$('.existing-list-option', container).forEach(el => {
    const handleSave = () => {
      if (!pendingLead) return;
      const added = saveLeadToList(pendingLead, el.dataset.list);
      closeSaveModal();
      if (added) {
        showToast('success', `✅ Saved to "${el.dataset.list}"`);
        markCardSaved(pendingLead.id);
      } else {
        showToast('info', 'Already in that list');
      }
    };
    el.addEventListener('click', handleSave);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') handleSave(); });
  });
}

function markCardSaved(leadId) {
  const btn = $(`#save-${leadId}`);
  if (btn) {
    btn.classList.add('saved');
    btn.textContent = '✅ Saved';
  }
}

// ============================================================
//  Toast notifications
// ============================================================
function showToast(type, message, duration = 3000) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon"></span><span>${esc(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ============================================================
//  Panel helpers
// ============================================================
function openPanel(panelId) {
  $('#panel-overlay').classList.add('active');
  $(`#${panelId}`).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAllPanels() {
  $('#panel-overlay').classList.remove('active');
  $$('.side-panel').forEach(p => p.classList.remove('active'));
  document.body.style.overflow = '';
}

function openModal(overlayId) {
  $(`#${overlayId}`).classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(overlayId) {
  $(`#${overlayId}`).classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================================
//  Autocomplete
// ============================================================
function buildAutocomplete() {
  const input    = $('#category-input');
  const dropdown = $('#autocomplete-dropdown');
  let activeIdx  = -1;
  let matches    = [];

  input.addEventListener('input', () => {
    const val = input.value.toLowerCase().trim();
    dropdown.innerHTML = '';
    activeIdx = -1;

    if (!val) { dropdown.classList.add('hidden'); return; }

    matches = CATEGORY_LIST.filter(c => c.startsWith(val)).slice(0, 8);
    if (!matches.length) { dropdown.classList.add('hidden'); return; }

    dropdown.innerHTML = matches.map((m, i) => `
      <div class="autocomplete-item" data-idx="${i}" role="option" aria-selected="false">
        <span class="ac-icon">🔍</span> ${esc(m)}
      </div>
    `).join('');

    dropdown.classList.remove('hidden');

    $$('.autocomplete-item', dropdown).forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        input.value = matches[parseInt(item.dataset.idx)];
        dropdown.classList.add('hidden');
        $('#city-input').focus();
      });
    });
  });

  input.addEventListener('keydown', (e) => {
    const items = $$('.autocomplete-item', dropdown);
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIdx = Math.min(activeIdx + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIdx = Math.max(activeIdx - 1, -1);
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      input.value = matches[activeIdx];
      dropdown.classList.add('hidden');
      $('#city-input').focus();
      return;
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden');
      return;
    }

    items.forEach((item, i) => item.classList.toggle('active', i === activeIdx));
  });

  input.addEventListener('blur', () => {
    setTimeout(() => dropdown.classList.add('hidden'), 150);
  });
}

// ============================================================
//  Pro Tips banner
// ============================================================
function initTipsBanner() {
  const dismissed = localStorage.getItem('findleads_tips_dismissed') === 'true';
  const banner    = $('#tips-banner');
  if (!banner) return;

  if (dismissed) {
    banner.classList.add('hidden');
    return;
  }

  // Pick random tip
  const tip = PRO_TIPS[Math.floor(Math.random() * PRO_TIPS.length)];
  $('#tips-text').textContent = tip;

  $('#tips-dismiss').addEventListener('click', () => {
    banner.classList.add('hidden');
    localStorage.setItem('findleads_tips_dismissed', 'true');
  });
}

// ============================================================
//  Event wiring
// ============================================================
function initEventListeners() {

  // Search form submit
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = $('#category-input').value.trim();
    const city     = $('#city-input').value.trim();
    if (!category || !city) {
      showToast('error', 'Please fill in both fields.');
      return;
    }
    runSearch(category, city);
  });

  // Popular pills
  $$('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const cat = pill.dataset.category;
      $('#category-input').value = cat;
      $('#city-input').focus();
    });
  });

  // Starter cards
  $$('.starter-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat  = card.dataset.category;
      const city = card.dataset.city;
      $('#category-input').value = cat;
      $('#city-input').value     = city;
      runSearch(cat, city);
      window.scrollTo({ top: $('#results-section').offsetTop - 80, behavior: 'smooth' });
    });
  });

  // Filter toggle
  $('#filter-leads-only').addEventListener('change', refilter);

  // Sort select
  $('#sort-select').addEventListener('change', refilter);

  // Load more
  $('#load-more-btn').addEventListener('click', () => {
    const filters  = getCurrentFilters();
    const filtered = applyFilters(allResults, filters);
    renderResults(filtered, true);
  });

  // Results grid — delegated events
  $('#results-grid').addEventListener('click', (e) => {
    // Copy phone
    const copyBtn = e.target.closest('.btn-copy');
    if (copyBtn) {
      const phone = copyBtn.dataset.phone;
      navigator.clipboard?.writeText(phone).then(() => {
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');
        setTimeout(() => {
          copyBtn.textContent = 'Copy';
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(() => showToast('error', 'Could not copy — check clipboard permissions'));
      return;
    }

    // Save lead
    const saveBtn = e.target.closest('.btn-save');
    if (saveBtn) {
      const leadId = parseInt(saveBtn.dataset.leadId);
      const lead   = allResults.find(l => l.id === leadId);
      if (lead) openSaveModal(lead);
      return;
    }
  });

  // Panel overlay close
  $('#panel-overlay').addEventListener('click', closeAllPanels);

  // History panel
  $('#open-history-btn').addEventListener('click', () => {
    renderHistoryPanel();
    openPanel('history-panel');
  });
  $('#history-panel-close').addEventListener('click', closeAllPanels);

  // Saved lists panel
  $('#open-saved-btn').addEventListener('click', () => {
    renderSavedListsPanel();
    openPanel('saved-panel');
  });
  $('#saved-panel-close').addEventListener('click', closeAllPanels);

  // How It Works modal
  $('#open-hiw-btn').addEventListener('click', () => openModal('hiw-modal-overlay'));
  $('#hiw-modal-close').addEventListener('click', () => closeModal('hiw-modal-overlay'));
  $('#hiw-modal-overlay').addEventListener('click', (e) => {
    if (e.target === $('#hiw-modal-overlay')) closeModal('hiw-modal-overlay');
  });

  // Save Lead modal
  $('#save-modal-overlay').addEventListener('click', (e) => {
    if (e.target === $('#save-modal-overlay')) closeSaveModal();
  });
  $('#save-modal-close').addEventListener('click', closeSaveModal);

  // Create new list in modal
  $('#create-list-btn').addEventListener('click', () => {
    const name = $('#new-list-input').value.trim();
    if (!name) { showToast('error', 'Enter a list name.'); return; }
    if (!pendingLead) return;
    const added = saveLeadToList(pendingLead, name);
    closeSaveModal();
    if (added) {
      showToast('success', `✅ Saved to new list "${name}"`);
      markCardSaved(pendingLead?.id);
    } else {
      showToast('info', 'Already in that list');
    }
    $('#new-list-input').value = '';
  });

  $('#new-list-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#create-list-btn').click();
  });

  // Keyboard accessibility: close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
      closeModal('hiw-modal-overlay');
      closeSaveModal();
    }
  });
}

// ============================================================
//  Boot
// ============================================================
function init() {
  buildAutocomplete();
  initTipsBanner();
  initEventListeners();

  // Initial panel render
  renderHistoryPanel();
  renderSavedListsPanel();
}

document.addEventListener('DOMContentLoaded', init);

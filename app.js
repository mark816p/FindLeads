/**
 * FindLeads — app.js (Tailwind & Dropdown Edition)
 * Zero-cost, browser-based lead generation using OpenStreetMap.
 */

// ============================================================
//  Category Mapping Table (Grouped for Select Dropdown)
// ============================================================
const CATEGORY_MAP = {
  // ---- Broad ----
  'All Businesses (Broad Search)': [
    { k:'shop', v:'*' }, { k:'amenity', v:'*' }, { k:'leisure', v:'*' }, { k:'office', v:'*' }
  ],

  // ---- Hair & Beauty ----
  'Barbers & Hair Salons': [
    { k:'shop', v:'hairdresser' },
    { k:'amenity', v:'barber' },
    { k:'craft', v:'hairdresser' },
  ],
  'Nail & Beauty Salons': [
    { k:'shop', v:'nail_salon' },
    { k:'shop', v:'beauty' },
    { k:'shop', v:'cosmetics' },
    { k:'shop', v:'tanning' },
    { k:'leisure', v:'spa' },
    { k:'shop', v:'massage' },
  ],
  'Tattoo & Piercing Studios': [
    { k:'shop', v:'tattoo' },
    { k:'shop', v:'piercing' },
  ],

  // ---- Fitness ----
  'Gyms & Fitness Centers': [
    { k:'leisure', v:'fitness_centre' },
    { k:'amenity', v:'gym' },
    { k:'leisure', v:'sports_centre' },
    { k:'sport', v:'yoga' },
    { k:'sport', v:'crossfit' },
    { k:'sport', v:'pilates' },
    { k:'sport', v:'martial_arts' },
    { k:'sport', v:'boxing' },
  ],

  // ---- Food & Drink ----
  'Restaurants & Cafes': [
    { k:'amenity', v:'restaurant' },
    { k:'amenity', v:'cafe' },
    { k:'amenity', v:'fast_food' },
    { k:'amenity', v:'food_court' },
    { k:'amenity', v:'ice_cream' },
    { k:'shop', v:'bakery' },
    { k:'shop', v:'deli' },
    { k:'shop', v:'confectionery' },
  ],
  'Bars & Pubs': [
    { k:'amenity', v:'bar' },
    { k:'amenity', v:'pub' },
    { k:'amenity', v:'biergarten' },
    { k:'amenity', v:'nightclub' },
  ],

  // ---- Health ----
  'Dentists & Orthodontists': [
    { k:'amenity', v:'dentist' },
    { k:'healthcare', v:'dentist' },
    { k:'healthcare', v:'orthodontist' },
  ],
  'Doctors & Clinics': [
    { k:'amenity', v:'doctors' },
    { k:'amenity', v:'clinic' },
    { k:'healthcare', v:'doctor' },
    { k:'healthcare', v:'clinic' },
    { k:'healthcare', v:'general_practitioner' },
    { k:'healthcare', v:'physiotherapist' },
    { k:'healthcare', v:'chiropractor' },
    { k:'amenity', v:'optician' },
    { k:'shop', v:'optician' },
  ],
  'Pharmacies': [
    { k:'amenity', v:'pharmacy' },
    { k:'healthcare', v:'pharmacy' },
  ],
  'Veterinarians': [
    { k:'amenity', v:'veterinary' },
    { k:'healthcare', v:'veterinary' },
  ],

  // ---- Automotive ----
  'Auto Repair & Mechanics': [
    { k:'shop', v:'car_repair' },
    { k:'shop', v:'tyres' },
    { k:'shop', v:'car_parts' },
    { k:'amenity', v:'car_repair' },
    { k:'craft', v:'car_repair' },
  ],
  'Car Washes & Detailers': [
    { k:'amenity', v:'car_wash' },
    { k:'shop', v:'car_wash' },
  ],
  'Car Dealers': [
    { k:'shop', v:'car' },
    { k:'amenity', v:'car_rental' },
  ],

  // ---- Pets ----
  'Pet Groomers & Pet Stores': [
    { k:'shop', v:'pet_grooming' },
    { k:'shop', v:'pet' },
    { k:'craft', v:'pet_grooming' },
  ],

  // ---- Home Services ----
  'Plumbers & Electricians': [
    { k:'shop', v:'plumber' },
    { k:'shop', v:'electrician' },
    { k:'craft', v:'plumber' },
    { k:'craft', v:'electrician' },
    { k:'craft', v:'hvac' },
    { k:'shop', v:'heating' },
  ],
  'Cleaning & Laundry': [
    { k:'shop', v:'laundry' },
    { k:'shop', v:'dry_cleaning' },
    { k:'shop', v:'cleaning' },
    { k:'amenity', v:'laundry' },
  ],

  // ---- Retail ----
  'Retail Shops': [
    { k:'shop', v:'clothes' },
    { k:'shop', v:'shoes' },
    { k:'shop', v:'jewelry' },
    { k:'shop', v:'gift' },
    { k:'shop', v:'florist' },
    { k:'shop', v:'books' },
    { k:'shop', v:'toys' },
    { k:'shop', v:'electronics' },
    { k:'shop', v:'mobile_phone' },
    { k:'shop', v:'hardware' },
    { k:'shop', v:'furniture' },
  ],

  // ---- Professional Services ----
  'Real Estate Agencies': [
    { k:'office', v:'estate_agent' },
    { k:'amenity', v:'real_estate_agent' },
  ],
  'Accountants & Lawyers': [
    { k:'office', v:'accountant' },
    { k:'office', v:'lawyer' },
    { k:'office', v:'tax_advisor' },
    { k:'office', v:'financial' },
  ],
  'Hotels & Motels': [
    { k:'tourism', v:'hotel' },
    { k:'tourism', v:'motel' },
    { k:'tourism', v:'guest_house' },
    { k:'tourism', v:'hostel' },
  ],
};

const PRO_TIPS = [
  'Targeting smaller towns means fewer competitors pitching the same business.',
  'Restaurants, salons, and auto shops are the easiest cold pitches — they benefit obviously from an online presence.',
  'If a business has 20+ reviews but no website, they have customers to lose — that\'s your pitch.',
];

// ============================================================
//  State
// ============================================================
let allResults       = [];   // full unfiltered results
let displayedCount   = 0;    // pagination
let lastSearchQuery  = null;
let isLoading        = false;
let pendingLead      = null;
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
  if (tags['addr:housenumber'] && tags['addr:street']) parts.push(`${tags['addr:housenumber']} ${tags['addr:street']}`);
  else if (tags['addr:street']) parts.push(tags['addr:street']);
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

function hasWebsite(tags) {
  // All OSM tags that indicate ANY online/web presence
  const EXPLICIT_KEYS = [
    'website', 'url', 'contact:website', 'contact:url',
    // Social media (a social page IS a web presence)
    'facebook', 'contact:facebook', 'contact:facebook_page',
    'instagram', 'contact:instagram',
    'twitter', 'contact:twitter',
    'youtube', 'contact:youtube',
    'linkedin', 'contact:linkedin',
    'tiktok', 'contact:tiktok',
    'yelp',
    // Online ordering / booking
    'seamless', 'doordash', 'ubereats', 'grubhub',
    'booking', 'contact:booking', 'reservation',
    // E-commerce
    'online_shop', 'shop_url',
  ];

  if (EXPLICIT_KEYS.some(k => tags[k] && tags[k].trim().length > 0)) return true;

  // Also scan every key dynamically — catch any key containing 'website', 'url',
  // or 'facebook', 'instagram', etc. that OSM contributors may have spelled differently
  const WEB_SIGNALS = ['website', 'url', 'facebook', 'instagram', 'twitter', 'linkedin', 'yelp', 'youtube'];
  return Object.keys(tags).some(k =>
    WEB_SIGNALS.some(sig => k.toLowerCase().includes(sig)) &&
    tags[k] && tags[k].trim().length > 0
  );
}

function buildMapsUrl(name, address) {
  const query = [name, address].filter(Boolean).join(' ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// ============================================================
//  Nominatim Autocomplete & Geocoding
// ============================================================
let debounceTimer;
async function fetchLocationSuggestions(query) {
  if (!query) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&featuretype=settlement`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'FindLeads/1.0' } });
  if (!resp.ok) return [];
  return await resp.json();
}

async function geocodeLocation(cityName) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`;
  const resp = await fetch(url, { headers: { 'User-Agent': 'FindLeads/1.0' } });
  if (!resp.ok) throw new Error(`Nominatim error: ${resp.status}`);
  const data = await resp.json();
  if (!data.length) throw new Error(`Location not found: "${cityName}"`);
  const r = data[0];
  const b = r.boundingbox;

  // Compute Overpass area ID from the OSM relation/way ID.
  // Relations → add 3,600,000,000. Ways → add 2,400,000,000.
  // This lets us query WITHIN the real administrative boundary instead of a rectangle.
  let areaId = null;
  if (r.osm_type === 'relation') areaId = 3600000000 + parseInt(r.osm_id, 10);
  else if (r.osm_type === 'way')      areaId = 2400000000 + parseInt(r.osm_id, 10);

  return {
    south: b[0], north: b[1], west: b[2], east: b[3],
    displayName: r.display_name,
    areaId,   // null for node results (rare); bbox used as fallback
  };
}

// ============================================================
//  Overpass query builder & Fetch
// ============================================================
function buildOverpassQuery(osmTags, location) {
  const { south, west, north, east, areaId } = location;

  // Prefer area-based query (exact admin boundary) to prevent
  // results bleeding into neighbouring cities.
  // Fall back to bbox for node-type geocoding results (rare).
  const useArea = !!areaId;

  const getLine = (type, k, v) => {
    if (useArea) {
      return v === '*'
        ? `  ${type}["${k}"](area.searchArea);`
        : `  ${type}["${k}"="${v}"](area.searchArea);`;
    }
    const bboxStr = `${south},${west},${north},${east}`;
    return v === '*'
      ? `  ${type}["${k}"](${bboxStr});`
      : `  ${type}["${k}"="${v}"](${bboxStr});`;
  };

  const types = ['node', 'way', 'relation'];
  const lines = osmTags.flatMap(t => types.map(type => getLine(type, t.k, t.v))).join('\n');

  const areaClause = useArea ? `area(${areaId})->.searchArea;\n` : '';
  return `[out:json][timeout:60];\n${areaClause}(\n${lines}\n);\nout body;\n>;\nout skel qt;`;
}

async function fetchFromOverpass(query) {
  const resp = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (resp.status === 429 || resp.status === 504) throw new Error('overpass_busy');
  if (!resp.ok) throw new Error(`Overpass error: ${resp.status}`);
  const data = await resp.json();
  return data.elements || [];
}

// ============================================================
//  Parse OSM elements
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

    leads.push({
      id: el.id,
      name,
      address: addr,
      phone: formatPhone(el.tags.phone || el.tags['contact:phone'] || el.tags['phone:mobile']),
      website: el.tags.website || el.tags['contact:website'] || null,
      hasWebsite: hasWebsite(el.tags),
      category: categoryLabel,
      mapsUrl: buildMapsUrl(name, addr),
      tags: el.tags,
      dateSaved: null,
    });
  }
  return leads;
}

// ============================================================
//  Filter & Rendering
// ============================================================
function applyFilters(leads, { leadsOnly, sort }) {
  let filtered = leadsOnly ? leads.filter(l => !l.hasWebsite) : [...leads];
  if (sort === 'leads') filtered.sort((a, b) => a.hasWebsite - b.hasWebsite);
  else filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

function renderSkeleton(count = 6) {
  const grid = $('#results-grid');
  grid.innerHTML = '';
  const tpl = $('#tpl-skeleton-card');
  for (let i = 0; i < count; i++) {
    grid.appendChild(tpl.content.cloneNode(true));
  }
}

function renderCard(lead) {
  const tpl = $('#tpl-business-card').content.cloneNode(true);
  const card = $('.business-card', tpl);
  
  card.dataset.id = lead.id;
  $('.name', card).textContent = lead.name;
  
  const badge = $('.badge', card);
  if (lead.hasWebsite) {
    badge.classList.add('bg-slate-800', 'text-slate-300', 'border', 'border-slate-700');
    badge.innerHTML = `🌐 Has Website`;
  } else {
    badge.classList.add('bg-amber-500/20', 'text-amber-400', 'border', 'border-amber-500/30');
    badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot"></span> No Website — Lead!`;
  }

  if (lead.address) {
    $('.address', card).textContent = lead.address;
  } else {
    $('.address', card).parentElement.classList.add('hidden');
  }

  if (lead.phone) {
    $('.phone', card).textContent = lead.phone;
    $('.btn-copy', card).dataset.phone = lead.phone;
  } else {
    $('.phone-container', card).classList.add('hidden');
  }

  $('.link-maps', card).href = lead.mapsUrl;
  $('.btn-save', card).dataset.leadId = lead.id;
  $('.btn-save', card).id = `save-${lead.id}`;

  return card;
}

function renderResults(filtered, append = false) {
  const grid = $('#results-grid');
  if (!append) grid.innerHTML = '';

  const slice = filtered.slice(displayedCount, displayedCount + PAGE_SIZE);
  if (slice.length === 0 && !append) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No leads found. Try a different search.</div>`;
    $('#btn-load-more').parentElement.classList.add('hidden');
    return;
  }

  slice.forEach(lead => grid.appendChild(renderCard(lead)));
  displayedCount += slice.length;

  const remaining = filtered.length - displayedCount;
  if (remaining > 0) {
    $('#btn-load-more').parentElement.classList.remove('hidden');
    $('#btn-load-more').classList.remove('hidden');
    $('#btn-load-more').textContent = `Load ${Math.min(remaining, PAGE_SIZE)} More`;
  } else {
    $('#btn-load-more').parentElement.classList.add('hidden');
  }
}

function updateToolbar(filtered) {
  const total = allResults.length;
  const leads = allResults.filter(l => !l.hasWebsite).length;
  const shown = filtered.length;
  const lOnly = $('#toggle-no-website').checked;
  const countEl = $('#results-count');
  
  if (total > 0) {
    countEl.innerHTML = lOnly
      ? `Showing <span class="text-white">${shown}</span> leads out of <span class="text-white">${total}</span> businesses`
      : `<span class="text-white">${shown}</span> businesses found — <span class="text-amber-400 font-bold">${leads} leads</span>`;
  }
}

// ============================================================
//  Search Orchestration
// ============================================================
function setLoading(active, message = '') {
  isLoading = active;
  $('#btn-search').disabled = active;
  if (active) {
    $('#results-section').classList.add('hidden');
    $('#status-container').classList.remove('hidden');
    $('#status-container').classList.add('flex');
    $('#status-message').textContent = message;
    $('#error-banner').classList.add('hidden');
  } else {
    $('#status-container').classList.add('hidden');
    $('#status-container').classList.remove('flex');
    $('#results-section').classList.remove('hidden');
  }
}

function showError(msg, isOverpassBusy = false) {
  $('#results-section').classList.add('hidden');
  $('#status-container').classList.add('hidden');
  $('#error-banner').classList.remove('hidden');
  
  if (isOverpassBusy) {
    $('#error-message').textContent = "The OpenStreetMap server is currently under heavy load and timed out. Please try a more specific area or wait a moment.";
  } else {
    $('#error-message').textContent = msg;
  }
}

async function runSearch(category, city) {
  if (isLoading) return;
  lastSearchQuery = { category, city };
  allResults = [];
  displayedCount = 0;

  setLoading(true, `Finding boundaries for ${city}...`);
  try {
    const bbox = await geocodeLocation(city);
    const osmTags = CATEGORY_MAP[category];
    
    setLoading(true, `Querying OpenStreetMap for ${category}... (this may take a few seconds)`);
    const query = buildOverpassQuery(osmTags, bbox);
    const elements = await fetchFromOverpass(query);

    setLoading(true, `Analyzing ${elements.length} records...`);
    allResults = parseElements(elements, category);
    addToHistory({ category, city, total: allResults.length, leads: allResults.filter(l => !l.hasWebsite).length });

    setLoading(false);
    
    const filters = { leadsOnly: $('#toggle-no-website').checked, sort: $('#sort-select').value };
    const filtered = applyFilters(allResults, filters);
    renderResults(filtered);
    updateToolbar(filtered);

  } catch (err) {
    setLoading(false);
    showError(err.message, err.message === 'overpass_busy');
  }
}

function refilter() {
  if (!allResults.length) return;
  const filters = { leadsOnly: $('#toggle-no-website').checked, sort: $('#sort-select').value };
  const filtered = applyFilters(allResults, filters);
  displayedCount = 0;
  renderResults(filtered);
  updateToolbar(filtered);
}

// ============================================================
//  History & Saved Lists
// ============================================================
const HISTORY_KEY = 'findleads_history';
const LISTS_KEY = 'findleads_saved_lists';

function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } }
function getSavedLists() { try { return JSON.parse(localStorage.getItem(LISTS_KEY) || '{}'); } catch { return {}; } }

function addToHistory(entry) {
  let hist = getHistory().filter(h => !(h.category === entry.category && h.city === entry.city));
  hist.unshift({ ...entry, ts: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(0, 15)));
  renderHistoryPanel();
}

function renderHistoryPanel() {
  const content = $('#panel-content');
  const hist = getHistory();
  if (!hist.length) {
    content.innerHTML = `<div class="text-center mt-10 text-slate-500">No recent searches.</div>`;
    return;
  }
  content.innerHTML = hist.map((h, i) => `
    <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 cursor-pointer hover:border-slate-500 transition-colors history-item" data-idx="${i}">
      <div class="font-medium text-slate-200">${h.category}</div>
      <div class="text-sm text-slate-400 mb-2">${h.city}</div>
      <div class="text-xs text-slate-500 flex justify-between">
        <span>${h.leads} leads found</span>
        <span>${timeAgo(h.ts)}</span>
      </div>
    </div>
  `).join('');
}

function renderSavedListsPanel() {
  const content = $('#panel-content');
  const lists = getSavedLists();
  const names = Object.keys(lists);
  if (!names.length) {
    content.innerHTML = `<div class="text-center mt-10 text-slate-500">No saved lists yet.</div>`;
    return;
  }
  content.innerHTML = names.map(name => `
    <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-4">
      <div class="flex justify-between items-center mb-3">
        <h4 class="font-medium text-slate-200">${name}</h4>
        <div class="flex gap-2">
          <button class="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-400/10 rounded" onclick="exportListAsCsv('${esc(name)}')">CSV</button>
          <button class="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-400/10 rounded" onclick="if(confirm('Delete list?')) { const l=JSON.parse(localStorage.getItem('${LISTS_KEY}')); delete l['${name}']; localStorage.setItem('${LISTS_KEY}', JSON.stringify(l)); document.getElementById('btn-saved').click(); }">Del</button>
        </div>
      </div>
      <div class="text-xs text-slate-400">${lists[name].length} saved leads</div>
    </div>
  `).join('');
}

window.exportListAsCsv = function(listName) {
  const lists = getSavedLists();
  const leads = lists[listName];
  if (!leads || !leads.length) return;
  const headers = ['Business Name','Phone','Address','Google Maps URL','Has Website'];
  const rows = leads.map(l => [l.name, l.phone||'', l.address||'', l.mapsUrl||'', l.hasWebsite?'Yes':'No']);
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${listName}_leads.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================================
//  Modals & Panels
// ============================================================
function showToast(message) {
  const container = $('#toast-container');
  const toast = document.createElement('div');
  toast.className = 'bg-slate-800 border border-slate-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 transform transition-all translate-y-full opacity-0';
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-full', 'opacity-0');
    setTimeout(() => {
      toast.classList.add('translate-y-full', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  });
}

function openPanel(title, renderFn) {
  $('#panel-title').textContent = title;
  renderFn();
  $('#side-panel-overlay').classList.remove('hidden');
  $('#side-panel-overlay').classList.remove('opacity-0');
  $('#side-panel').classList.remove('translate-x-full');
}

function closePanelsAndModals() {
  $('#side-panel').classList.add('translate-x-full');
  $('#side-panel-overlay').classList.add('opacity-0');
  setTimeout(() => $('#side-panel-overlay').classList.add('hidden'), 300);
  
  $('#modal-overlay').classList.add('opacity-0');
  $('#modal-content').classList.add('scale-95');
  setTimeout(() => $('#modal-overlay').classList.add('hidden'), 300);
}

// ============================================================
//  Init & Listeners
// ============================================================
function init() {
  // Populate categories
  const catInput = $('#category-input');
  Object.keys(CATEGORY_MAP).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    catInput.appendChild(opt);
  });

  // Location autocomplete logic
  const locInput = $('#location-input');
  const suggBox = $('#location-suggestions');
  const suggList = $('#location-suggestions-list');

  locInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const val = e.target.value.trim();
    if (!val) { suggBox.classList.add('hidden'); return; }
    
    debounceTimer = setTimeout(async () => {
      const results = await fetchLocationSuggestions(val);
      if (!results.length) { suggBox.classList.add('hidden'); return; }
      suggList.innerHTML = results.map(r => `
        <li class="px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-300" onclick="document.getElementById('location-input').value='${esc(r.display_name.split(',')[0])}'; document.getElementById('location-suggestions').classList.add('hidden');">
          ${esc(r.display_name)}
        </li>
      `).join('');
      suggBox.classList.remove('hidden');
    }, 400);
  });
  
  document.addEventListener('click', (e) => {
    if(!e.target.closest('#location-suggestions') && !e.target.closest('#location-input')) {
      suggBox.classList.add('hidden');
    }
  });

  // Form submit
  $('#search-form').addEventListener('submit', (e) => {
    e.preventDefault();
    suggBox.classList.add('hidden');
    runSearch(catInput.value, locInput.value.trim());
  });

  $('#btn-retry').addEventListener('click', () => runSearch(lastSearchQuery.category, lastSearchQuery.city));
  $('#toggle-no-website').addEventListener('change', refilter);
  $('#sort-select').addEventListener('change', refilter);
  $('#btn-load-more').addEventListener('click', () => renderResults(applyFilters(allResults, { leadsOnly: $('#toggle-no-website').checked, sort: $('#sort-select').value }), true));

  // CSV Export All
  $('#btn-export-csv').addEventListener('click', () => {
    const filters = { leadsOnly: $('#toggle-no-website').checked, sort: $('#sort-select').value };
    const filtered = applyFilters(allResults, filters);
    if (!filtered.length) return;
    const headers = ['Business Name','Phone','Address','Google Maps URL','Has Website'];
    const rows = filtered.map(l => [l.name, l.phone||'', l.address||'', l.mapsUrl||'', l.hasWebsite?'Yes':'No']);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `FindLeads_${catInput.value.replace(/\s/g,'_')}.csv`;
    a.click(); URL.revokeObjectURL(url);
  });

  // Panel toggles
  $('#btn-history').addEventListener('click', () => openPanel('Search History', renderHistoryPanel));
  $('#btn-saved').addEventListener('click', () => openPanel('Saved Lists', renderSavedListsPanel));
  $('#btn-close-panel').addEventListener('click', closePanelsAndModals);
  $('#side-panel-overlay').addEventListener('click', closePanelsAndModals);

  // How it works modal
  $('#btn-how-it-works').addEventListener('click', () => {
    $('#modal-title').textContent = 'How FindLeads Works';
    $('#modal-body').innerHTML = `<ul class="space-y-2 list-disc pl-5">
      <li>FindLeads queries OpenStreetMap, a free crowdsourced map of the world.</li>
      <li>It looks for businesses that <strong>do not have a website tag</strong>.</li>
      <li>Since this data is maintained by humans, always verify the business before pitching!</li>
      <li>Pro Tip: ${PRO_TIPS[Math.floor(Math.random() * PRO_TIPS.length)]}</li>
    </ul>`;
    $('#modal-overlay').classList.remove('hidden');
    requestAnimationFrame(() => {
      $('#modal-overlay').classList.remove('opacity-0');
      $('#modal-content').classList.remove('scale-95');
    });
  });
  $('#btn-close-modal').addEventListener('click', closePanelsAndModals);

  // Results Grid Actions (Copy / Save)
  $('#results-grid').addEventListener('click', (e) => {
    if (e.target.closest('.btn-copy')) {
      const btn = e.target.closest('.btn-copy');
      navigator.clipboard.writeText(btn.dataset.phone).then(() => {
        const orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = orig, 1500);
      });
    }
    if (e.target.closest('.btn-save')) {
      const btn = e.target.closest('.btn-save');
      const lead = allResults.find(l => l.id == btn.dataset.leadId);
      if (lead) {
        $('#modal-title').textContent = 'Save Lead';
        const lists = Object.keys(getSavedLists());
        $('#modal-body').innerHTML = `
          <div class="mb-4">
            <p class="font-medium text-white">${lead.name}</p>
            <p class="text-xs text-slate-400">${lead.address || ''}</p>
          </div>
          <div class="space-y-2">
            <input type="text" id="new-list-name" placeholder="New list name (e.g. Dallas Plumbers)" class="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
            <button id="btn-create-list" class="w-full bg-blue-600 hover:bg-blue-500 text-white rounded p-2 text-sm font-medium transition-colors">Create & Save</button>
          </div>
          ${lists.length ? `<div class="mt-4 pt-4 border-t border-slate-700"><p class="text-xs text-slate-400 mb-2 uppercase font-medium">Or add to existing list:</p><div class="flex flex-col gap-2">${lists.map(list => `<button class="text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded text-sm text-slate-200 transition-colors" onclick="
            const ls = JSON.parse(localStorage.getItem('${LISTS_KEY}'));
            if (!ls['${list}'].find(l => l.id === ${lead.id})) { ls['${list}'].push(${JSON.stringify(lead).replace(/'/g, "\\'")}); localStorage.setItem('${LISTS_KEY}', JSON.stringify(ls)); }
            document.getElementById('btn-close-modal').click();
            const sb = document.getElementById('save-${lead.id}'); if(sb){sb.textContent='✅ Saved'; sb.classList.add('bg-amber-600', 'text-white', 'border-amber-500');}
          ">📋 ${esc(list)}</button>`).join('')}</div></div>` : ''}
        `;
        $('#modal-overlay').classList.remove('hidden');
        requestAnimationFrame(() => {
          $('#modal-overlay').classList.remove('opacity-0');
          $('#modal-content').classList.remove('scale-95');
        });
        
        // Wait for DOM
        setTimeout(() => {
          const createBtn = $('#btn-create-list');
          if (createBtn) createBtn.addEventListener('click', () => {
            const listName = $('#new-list-name').value.trim();
            if(!listName) return;
            const ls = getSavedLists();
            if(!ls[listName]) ls[listName] = [];
            if(!ls[listName].find(l => l.id === lead.id)) {
              ls[listName].push(lead);
              localStorage.setItem(LISTS_KEY, JSON.stringify(ls));
            }
            closePanelsAndModals();
            btn.textContent = '✅ Saved';
            btn.classList.add('bg-amber-600', 'text-white', 'border-amber-500');
          });
        }, 100);
      }
    }
  });

  // Delegated clicks for history items
  $('#panel-content').addEventListener('click', (e) => {
    if (e.target.closest('.history-item')) {
      const idx = e.target.closest('.history-item').dataset.idx;
      const h = getHistory()[idx];
      $('#category-input').value = h.category;
      $('#location-input').value = h.city;
      closePanelsAndModals();
      runSearch(h.category, h.city);
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

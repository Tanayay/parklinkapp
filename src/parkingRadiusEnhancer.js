const STORAGE_KEY = 'parklink-parking-radius-minutes';
const ADDRESS_KEY = 'parklink-search-address';
const SEARCH_CACHE_KEY = 'parklink-v10e-search-cache';
const DEFAULT_MINUTES = 10;
const VALID_MINUTES = [5, 10, 15, 20, 30];

function getRadiusMinutes() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return VALID_MINUTES.includes(saved) ? saved : DEFAULT_MINUTES;
}
function setRadiusMinutes(value) { localStorage.setItem(STORAGE_KEY, String(value)); }
function getAddressContext() {
  try { return JSON.parse(localStorage.getItem(ADDRESS_KEY) || 'null'); } catch { return null; }
}
function setAddressContext(value) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(value));
  sessionStorage.removeItem(SEARCH_CACHE_KEY);
  window.dispatchEvent(new CustomEvent('parklink-address-updated'));
}
function addressLabel(ctx) {
  if (!ctx) return 'Set your search area';
  return ctx.label || [ctx.address, ctx.city, ctx.state].filter(Boolean).join(', ') || 'Saved search area';
}
function cacheKey(url) { return `${url.pathname}?${url.searchParams.toString()}`; }
function getCache() { try { return JSON.parse(sessionStorage.getItem(SEARCH_CACHE_KEY) || '{}'); } catch { return {}; } }
function setCache(key, value) {
  const cache = getCache();
  cache[key] = { value, time: Date.now() };
  sessionStorage.setItem(SEARCH_CACHE_KEY, JSON.stringify(Object.fromEntries(Object.entries(cache).slice(-30))));
}

const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  try {
    const raw = typeof input === 'string' ? input : input?.url;
    if (raw && raw.includes('/api/parking-search')) {
      const url = new URL(raw, window.location.origin);
      const isPlaceSearch = url.searchParams.get('mode') === 'places';
      url.pathname = '/api/parking-search-v10';
      url.searchParams.set('clientVersion', 'v10e-local-first');

      const ctx = getAddressContext();
      if (ctx) {
        if (ctx.lat && ctx.lng) {
          url.searchParams.set('homeLat', String(ctx.lat));
          url.searchParams.set('homeLng', String(ctx.lng));
        }
        if (ctx.label) url.searchParams.set('homeText', ctx.label);
        if (ctx.address) url.searchParams.set('homeAddress', ctx.address);
        if (ctx.city) url.searchParams.set('homeCity', ctx.city);
        if (ctx.state) url.searchParams.set('homeState', ctx.state);
      }
      if (!isPlaceSearch) url.searchParams.set('radiusMinutes', String(getRadiusMinutes()));

      const next = url.origin === window.location.origin ? `${url.pathname}${url.search}` : url.toString();
      if (isPlaceSearch) {
        const key = cacheKey(url);
        const cached = getCache()[key];
        if (cached && Date.now() - cached.time < 5 * 60 * 1000) {
          return new Response(JSON.stringify(cached.value), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
        const response = await originalFetch(next, init);
        const clone = response.clone();
        clone.json().then(data => setCache(key, data)).catch(() => {});
        return response;
      }
      return originalFetch(next, init);
    }
  } catch {
    // Fall through to the original request.
  }
  return originalFetch(input, init);
};

function createRadiusControl() {
  const wrap = document.createElement('label');
  wrap.className = 'parking-radius-control compact-radius-control';
  wrap.dataset.parklinkRadius = 'true';
  const text = document.createElement('span');
  text.textContent = 'Walking distance';
  wrap.appendChild(text);
  const select = document.createElement('select');
  select.className = 'parklink-compact-select';
  VALID_MINUTES.forEach(minutes => {
    const option = document.createElement('option');
    option.value = String(minutes);
    option.textContent = `${minutes} min`;
    option.selected = minutes === getRadiusMinutes();
    select.appendChild(option);
  });
  select.addEventListener('change', () => setRadiusMinutes(Number(select.value)));
  wrap.appendChild(select);
  return wrap;
}

function openAddressModal() {
  if (document.querySelector('.parklink-address-modal')) return;
  const current = getAddressContext() || {};
  const overlay = document.createElement('div');
  overlay.className = 'parklink-address-modal';
  overlay.innerHTML = `
    <div class="parklink-address-card">
      <div class="parklink-address-head">
        <span>Search area</span>
        <strong>Set your address</strong>
        <p>ParkLink uses this as your search anchor. Searches like “taco” or “toys” stay near this area. Searches like “Disney Anaheim” can still go outside it.</p>
      </div>
      <label>Street / place / address<input class="pl-address" placeholder="22420 Ocean Ave" value="${current.address || ''}"></label>
      <div class="pl-address-grid">
        <label>City<input class="pl-city" placeholder="Torrance" value="${current.city || ''}"></label>
        <label>State<input class="pl-state" placeholder="CA" value="${current.state || ''}"></label>
      </div>
      <p class="pl-address-error"></p>
      <div class="pl-address-actions">
        <button type="button" class="pl-current">Use current location</button>
        <button type="button" class="pl-cancel">Cancel</button>
        <button type="button" class="pl-save">Save area</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const error = overlay.querySelector('.pl-address-error');
  function close(){ overlay.remove(); }
  overlay.querySelector('.pl-cancel').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  overlay.querySelector('.pl-current').addEventListener('click', () => {
    if (!navigator.geolocation) { error.textContent = 'Location is not available in this browser.'; return; }
    error.textContent = 'Getting your location...';
    navigator.geolocation.getCurrentPosition(pos => {
      setAddressContext({ label: 'Current location', lat: pos.coords.latitude, lng: pos.coords.longitude, address: '', city: '', state: '' });
      close();
    }, () => { error.textContent = 'Location permission was denied.'; }, { enableHighAccuracy: true, timeout: 10000 });
  });
  overlay.querySelector('.pl-save').addEventListener('click', () => {
    const address = overlay.querySelector('.pl-address').value.trim();
    const city = overlay.querySelector('.pl-city').value.trim();
    const state = overlay.querySelector('.pl-state').value.trim();
    const label = [address, city, state].filter(Boolean).join(', ');
    if (!city && !address) { error.textContent = 'Add at least a city, or use current location.'; return; }
    setAddressContext({ label, address, city, state });
    close();
  });
}

function createAddressControl() {
  const wrap = document.createElement('section');
  wrap.className = 'parklink-location-card glass-card';
  wrap.dataset.parklinkAddress = 'true';
  const render = () => {
    const ctx = getAddressContext();
    wrap.innerHTML = `<div><span>Search area</span><strong>${addressLabel(ctx)}</strong></div><button type="button">${ctx ? 'Change' : 'Set address'}</button>`;
    wrap.querySelector('button').addEventListener('click', openAddressModal);
  };
  render();
  window.addEventListener('parklink-address-updated', render);
  return wrap;
}

function getSearchInput() { return document.querySelector('.ai-phone-safe .ai-search-card input[placeholder*="Search"]'); }
function getSearchButton() { return [...document.querySelectorAll('.ai-phone-safe .ai-search-card button')].find(button => button.textContent.includes('Find matching places')); }

let searchTimer;
function attachLiveSearch() {
  const input = getSearchInput();
  if (!input || input.dataset.liveSearchAttached === 'true') return;
  input.dataset.liveSearchAttached = 'true';
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('placeholder', 'Search any place, restaurant, school, mall...');
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const value = input.value.trim();
    if (value.length < 3) return;
    searchTimer = setTimeout(() => {
      const button = getSearchButton();
      if (button && !button.disabled) button.click();
    }, 700);
  });
}

function clearSearchForLocation(event) {
  const button = event.target.closest('button');
  if (!button || !button.textContent.includes('Use my location')) return;
  const input = getSearchInput();
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(input, ''); else input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}
document.addEventListener('click', clearSearchForLocation, true);

function mountEnhancements() {
  const aiCard = document.querySelector('.ai-phone-safe .ai-search-card');
  if (!aiCard) return;
  if (!document.querySelector('[data-parklink-address="true"]')) aiCard.insertBefore(createAddressControl(), aiCard.firstChild);
  if (!document.querySelector('[data-parklink-radius="true"]')) {
    const timeGrid = aiCard.querySelector('.time-grid');
    const control = createRadiusControl();
    if (timeGrid) aiCard.insertBefore(control, timeGrid); else aiCard.appendChild(control);
  }
  attachLiveSearch();
  if (!getAddressContext() && !sessionStorage.getItem('parklink-address-prompted')) {
    sessionStorage.setItem('parklink-address-prompted', 'true');
    setTimeout(openAddressModal, 500);
  }
}
const observer = new MutationObserver(mountEnhancements);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', mountEnhancements);

const STORAGE_KEY = 'parklink-parking-radius-minutes';
const DEFAULT_MINUTES = 10;
const VALID_MINUTES = [5, 10, 15, 20, 30];

function getRadiusMinutes() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return VALID_MINUTES.includes(saved) ? saved : DEFAULT_MINUTES;
}

function setRadiusMinutes(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

const originalFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  try {
    const raw = typeof input === 'string' ? input : input?.url;
    if (raw && raw.includes('/api/parking-search')) {
      const url = new URL(raw, window.location.origin);
      url.pathname = '/api/parking-search-v3';
      if (!url.searchParams.has('mode') || url.searchParams.get('mode') !== 'places') {
        url.searchParams.set('radiusMinutes', String(getRadiusMinutes()));
      }
      const next = url.origin === window.location.origin ? `${url.pathname}${url.search}` : url.toString();
      return originalFetch(next, init);
    }
  } catch {
    // Fall through to original request.
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
  VALID_MINUTES.forEach((minutes) => {
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

function getSearchInput() {
  return document.querySelector('.ai-phone-safe .ai-search-card input[placeholder*="Search"]');
}

function getSearchButton() {
  return [...document.querySelectorAll('.ai-phone-safe .ai-search-card button')]
    .find((button) => button.textContent.includes('Find matching places'));
}

let searchTimer;
function attachLiveSearch() {
  const input = getSearchInput();
  if (!input || input.dataset.liveSearchAttached === 'true') return;
  input.dataset.liveSearchAttached = 'true';
  input.setAttribute('autocomplete', 'off');
  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const value = input.value.trim();
    if (value.length < 2) return;
    searchTimer = setTimeout(() => {
      const button = getSearchButton();
      if (button && !button.disabled) button.click();
    }, 450);
  });
}

function clearSearchForLocation(event) {
  const button = event.target.closest('button');
  if (!button || !button.textContent.includes('Use my location')) return;
  const input = getSearchInput();
  if (!input) return;
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  if (setter) setter.call(input, '');
  else input.value = '';
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

document.addEventListener('click', clearSearchForLocation, true);

function mountEnhancements() {
  const aiCard = document.querySelector('.ai-phone-safe .ai-search-card');
  if (!aiCard) return;
  if (!document.querySelector('[data-parklink-radius="true"]')) {
    const timeGrid = aiCard.querySelector('.time-grid');
    const control = createRadiusControl();
    if (timeGrid) aiCard.insertBefore(control, timeGrid);
    else aiCard.appendChild(control);
  }
  attachLiveSearch();
}

const observer = new MutationObserver(mountEnhancements);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', mountEnhancements);

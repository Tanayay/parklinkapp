const STORAGE_KEY = 'parklink-parking-radius-minutes';
const DEFAULT_MINUTES = 10;

function getRadiusMinutes() {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return [5, 10, 15, 20, 30].includes(saved) ? saved : DEFAULT_MINUTES;
}

function setRadiusMinutes(value) {
  localStorage.setItem(STORAGE_KEY, String(value));
}

const originalFetch = window.fetch.bind(window);
window.fetch = (input, init) => {
  try {
    const raw = typeof input === 'string' ? input : input?.url;
    if (raw && raw.includes('/api/parking-search') && !raw.includes('mode=places')) {
      const url = new URL(raw, window.location.origin);
      url.searchParams.set('radiusMinutes', String(getRadiusMinutes()));
      const next = url.origin === window.location.origin ? `${url.pathname}${url.search}` : url.toString();
      return originalFetch(next, init);
    }
  } catch {
    // Fall through to the original request.
  }
  return originalFetch(input, init);
};

function createRadiusControl() {
  const wrap = document.createElement('section');
  wrap.className = 'parking-radius-control glass-card';
  wrap.dataset.parklinkRadius = 'true';

  const title = document.createElement('div');
  title.className = 'parking-radius-title';
  title.innerHTML = '<span>Search distance</span><strong>How far are you willing to walk?</strong>';
  wrap.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'parking-radius-grid';
  const current = getRadiusMinutes();

  [5, 10, 15, 20, 30].forEach((minutes) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${minutes} min`;
    button.className = minutes === current ? 'active' : '';
    button.addEventListener('click', () => {
      setRadiusMinutes(minutes);
      grid.querySelectorAll('button').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
    });
    grid.appendChild(button);
  });

  wrap.appendChild(grid);
  return wrap;
}

function mountRadiusControl() {
  if (document.querySelector('[data-parklink-radius="true"]')) return;
  const aiCard = document.querySelector('.ai-phone-safe .ai-search-card');
  if (!aiCard) return;
  const timeGrid = aiCard.querySelector('.time-grid');
  const control = createRadiusControl();
  if (timeGrid) aiCard.insertBefore(control, timeGrid);
  else aiCard.appendChild(control);
}

const observer = new MutationObserver(mountRadiusControl);
observer.observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener('DOMContentLoaded', mountRadiusControl);

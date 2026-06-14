/**
 * Rise - Browser Extension New Tab Script
 * Core Features:
 * - Fliqlo-style horizontal flip clock
 * - Daily cached quote and wallpaper fetched from GitHub
 * - Automated fallback to static assets in case of network issues
 * - Local developer compatibility (runs directly in browser via localStorage)
 */

// --- GitHub Data Repository Configurations ---
// IMPORTANT: Replace '[YOUR-GITHUB-USERNAME]' with your actual GitHub username
// once your 'rise-data' repository is public.
const GITHUB_USERNAME = 'YOUR-GITHUB-USERNAME'; 
const QUOTES_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/rise-data/main/quotes.json`;
const WALLPAPERS_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/rise-data/main/wallpapers.json`;

// --- Curated Fallbacks (For Offline Use or Prior to Repository Setup) ---
const FALLBACK_QUOTES = [
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    quote: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    quote: "Act as if what you do makes a difference. It does.",
    author: "William James"
  },
  {
    quote: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein"
  },
  {
    quote: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  }
];

const FALLBACK_WALLPAPERS = [
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80",
    photographer: "Sean Oulashin",
    location: "Hawaii, USA"
  },
  {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80",
    photographer: "v2osm",
    location: "Valle de Elqui, Chile"
  },
  {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80",
    photographer: "Bailey Zindel",
    location: "Yosemite Valley, USA"
  },
  {
    url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1920&q=80",
    photographer: "Lukasz Szmigiel",
    location: "Green Forest, Poland"
  }
];

// --- Cross-Browser Storage Wrapper (Supports chrome.storage.local & localStorage) ---
const storage = {
  get: (keys, callback) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, callback);
    } else {
      const result = {};
      keys.forEach(key => {
        const val = localStorage.getItem(key);
        result[key] = val ? JSON.parse(val) : null;
      });
      callback(result);
    }
  },
  set: (items, callback) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(items, callback);
    } else {
      for (const key in items) {
        localStorage.setItem(key, JSON.stringify(items[key]));
      }
      if (callback) callback();
    }
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initContent();
  initControls();
});

// --- Fliqlo Clock Engine ---
function initClock() {
  const hoursCard = document.getElementById('hours-card');
  const minutesCard = document.getElementById('minutes-card');
  
  let currentHours = '';
  let currentMinutes = '';
  
  function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    if (hours !== currentHours) {
      flipCard(hoursCard, currentHours || '00', hours);
      currentHours = hours;
    }
    
    if (minutes !== currentMinutes) {
      flipCard(minutesCard, currentMinutes || '00', minutes);
      currentMinutes = minutes;
    }
  }
  
  // Set initial static states immediately
  const now = new Date();
  currentHours = String(now.getHours()).padStart(2, '0');
  currentMinutes = String(now.getMinutes()).padStart(2, '0');
  setCardElements(hoursCard, currentHours);
  setCardElements(minutesCard, currentMinutes);
  
  // Tick every second
  setInterval(updateClock, 1000);
}

function setCardElements(card, value) {
  card.querySelector('.card-top span').textContent = value;
  card.querySelector('.card-bottom span').textContent = value;
  card.querySelector('.card-top-flip span').textContent = value;
  card.querySelector('.card-bottom-flip span').textContent = value;
}

function flipCard(card, oldValue, newValue) {
  // 1. Position old value on cards that start visible or fold down
  card.querySelector('.card-top span').textContent = newValue;
  card.querySelector('.card-bottom span').textContent = oldValue;
  card.querySelector('.card-top-flip span').textContent = oldValue;
  card.querySelector('.card-bottom-flip span').textContent = newValue;
  
  // Force browser layout reflow to register class updates
  card.offsetWidth;
  
  // 2. Add flipping animation classes
  card.classList.add('flip');
  
  // 3. Once transition concludes (matched with CSS transition: 0.4s), stabilize DOM
  setTimeout(() => {
    setCardElements(card, newValue);
    card.classList.remove('flip');
  }, 410);
}

// --- Quote and Wallpaper Loader ---
function initContent() {
  loadDailyContent(false);
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadDailyContent(bypassCache = false) {
  const todayStr = getTodayString();
  
  // Reset transitions
  document.getElementById('wallpaper').classList.remove('loaded');
  document.getElementById('quote-box').classList.remove('loaded');
  document.getElementById('attribution').classList.remove('loaded');
  
  storage.get(['cachedDate', 'cachedQuote', 'cachedWallpaper'], (res) => {
    if (!bypassCache && res.cachedDate === todayStr && res.cachedQuote && res.cachedWallpaper) {
      console.log("Rise: Loaded content from daily cache.");
      displayContent(res.cachedQuote, res.cachedWallpaper);
    } else {
      console.log("Rise: Fetching fresh quotes and wallpapers...");
      fetchRemoteContent(todayStr);
    }
  });
}

async function fetchRemoteContent(todayStr) {
  let quotes = FALLBACK_QUOTES;
  let wallpapers = FALLBACK_WALLPAPERS;
  
  try {
    // Attempt parallel fetch of public repos
    const quotesPromise = fetch(QUOTES_URL).then(async (res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    });
    
    const wallpapersPromise = fetch(WALLPAPERS_URL).then(async (res) => {
      if (!res.ok) throw new Error(`Status ${res.status}`);
      return res.json();
    });
    
    const [remoteQuotes, remoteWallpapers] = await Promise.all([quotesPromise, wallpapersPromise]);
    
    if (Array.isArray(remoteQuotes) && remoteQuotes.length > 0) {
      quotes = remoteQuotes;
      console.log("Rise: Successfully fetched remote quotes.");
    }
    
    if (Array.isArray(remoteWallpapers) && remoteWallpapers.length > 0) {
      wallpapers = remoteWallpapers;
      console.log("Rise: Successfully fetched remote wallpapers.");
    }
  } catch (err) {
    console.warn("Rise: Remote fetch failed or repos not setup. Using default assets. Error:", err.message);
  }
  
  // Select random elements
  const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const selectedWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
  
  // Cache the new selections
  storage.set({
    cachedDate: todayStr,
    cachedQuote: selectedQuote,
    cachedWallpaper: selectedWallpaper
  }, () => {
    displayContent(selectedQuote, selectedWallpaper);
  });
}

function displayContent(quote, wallpaper) {
  // Populate UI
  document.getElementById('quote-text').textContent = `“${quote.quote}”`;
  document.getElementById('quote-author').textContent = quote.author || "Unknown";
  
  const attributionElement = document.getElementById('wallpaper-credit');
  if (wallpaper.location && wallpaper.photographer) {
    attributionElement.textContent = `${wallpaper.location} · By ${wallpaper.photographer}`;
  } else if (wallpaper.photographer) {
    attributionElement.textContent = `Photo by ${wallpaper.photographer}`;
  } else {
    attributionElement.textContent = wallpaper.location || "Earth";
  }
  
  // Pre-load background image to guarantee seamless fade-in
  const wallpaperContainer = document.getElementById('wallpaper');
  const img = new Image();
  img.onload = () => {
    wallpaperContainer.style.backgroundImage = `url('${wallpaper.url}')`;
    wallpaperContainer.classList.add('loaded');
    document.getElementById('quote-box').classList.add('loaded');
    document.getElementById('attribution').classList.add('loaded');
  };
  
  img.onerror = () => {
    console.error("Rise: Failed to load wallpaper image URL:", wallpaper.url);
    // Dark geometric slate fallback
    wallpaperContainer.style.backgroundImage = "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)";
    wallpaperContainer.classList.add('loaded');
    document.getElementById('quote-box').classList.add('loaded');
    document.getElementById('attribution').classList.add('loaded');
  };
  
  img.src = wallpaper.url;
}

// --- Interactive Buttons & Controls ---
function initControls() {
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.addEventListener('click', () => {
    loadDailyContent(true); // Bypass cache and fetch fresh
  });
}

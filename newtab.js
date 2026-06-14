/**
 * Rise - Browser Extension New Tab Script
 * Core Features:
 * - Fliqlo-style horizontal flip clock
 * - Daily cached quote and wallpaper fetched from GitHub
 * - Standardized schema (text and author)
 * - Fetch hardening with 2.5s AbortController timeout
 * - Adaptive layout: text-length checks for long quotes
 * - Smooth visual loading: safety-timer controlled fade-in (no unstyled flash)
 */

// --- GitHub Data Repository Configurations ---
// IMPORTANT: Replace 'YOUR-GITHUB-USERNAME' with your actual GitHub username
// once your 'rise-data' repository is public.
const GITHUB_USERNAME = 'YOUR-GITHUB-USERNAME'; 
const QUOTES_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/rise-data/main/quotes.json`;
const WALLPAPERS_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/rise-data/main/wallpapers.json`;

// --- Curated Fallbacks (For Offline Use or Prior to Repository Setup) ---
const FALLBACK_QUOTES = [
  {
    "text": "Focus is a matter of deciding what things you're not going to do.",
    "author": "John Carmack"
  },
  {
    "text": "Discipline is choosing between what you want now and what you want most.",
    "author": "Abraham Lincoln"
  },
  {
    "text": "Deep work is the superpower of the 21st century.",
    "author": "Cal Newport"
  },
  {
    "text": "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.",
    "author": "Stephen King"
  },
  {
    "text": "You do not rise to the level of your goals. You fall to the level of your systems.",
    "author": "James Clear"
  },
  {
    "text": "The successful warrior is the average man, with laser-like focus.",
    "author": "Bruce Lee"
  },
  {
    "text": "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until focused.",
    "author": "Alexander Graham Bell"
  },
  {
    "text": "It is not that I am so smart, it is just that I stay with problems longer.",
    "author": "Albert Einstein"
  },
  {
    "text": "It is not enough to be busy. So are the ants. The question is: what are we busy about?",
    "author": "Henry David Thoreau"
  },
  {
    "text": "If you commit to nothing, you'll be distracted by everything.",
    "author": "James Clear"
  },
  {
    "text": "He who has a why to live can bear almost any how.",
    "author": "Friedrich Nietzsche"
  },
  {
    "text": "Energy is the essence of life. Every day you decide how you're going to use it.",
    "author": "Oprah Winfrey"
  },
  {
    "text": "Focus on being productive instead of busy.",
    "author": "Tim Ferriss"
  },
  {
    "text": "Simplicity is the ultimate sophistication.",
    "author": "Leonardo da Vinci"
  },
  {
    "text": "You can do anything, but you can't do everything.",
    "author": "David Allen"
  },
  {
    "text": "Your mind is for having ideas, not holding them.",
    "author": "David Allen"
  },
  {
    "text": "The secret of getting ahead is getting started.",
    "author": "Mark Twain"
  },
  {
    "text": "Don't wish it were easier. Wish you were better.",
    "author": "Jim Rohn"
  },
  {
    "text": "Either you run the day or the day runs you.",
    "author": "Jim Rohn"
  },
  {
    "text": "Discipline is the bridge between goals and accomplishment.",
    "author": "Jim Rohn"
  },
  {
    "text": "The best way to predict the future is to create it.",
    "author": "Peter Drucker"
  },
  {
    "text": "What gets measured gets managed.",
    "author": "Peter Drucker"
  },
  {
    "text": "There is nothing quite so useless as doing with great efficiency something that should not be done at all.",
    "author": "Peter Drucker"
  },
  {
    "text": "Action is the foundational key to all success.",
    "author": "Pablo Picasso"
  },
  {
    "text": "To be disciplined is to follow your own internal compass rather than external noise.",
    "author": "Unknown"
  },
  {
    "text": "The only limit to our realization of tomorrow will be our doubts of today.",
    "author": "Franklin D. Roosevelt"
  },
  {
    "text": "Success is the sum of small efforts, repeated day in and day out.",
    "author": "Robert Collier"
  },
  {
    "text": "Quality is not an act, it is a habit.",
    "author": "Aristotle"
  },
  {
    "text": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    "author": "Aristotle"
  },
  {
    "text": "Start where you are. Use what you have. Do what you can.",
    "author": "Arthur Ashe"
  },
  {
    "text": "If you don't pay appropriate attention to what has your attention, it will take more than it deserves.",
    "author": "David Allen"
  },
  {
    "text": "It always seems impossible until it's done.",
    "author": "Nelson Mandela"
  },
  {
    "text": "Resilience is when you address uncertainty with flexibility.",
    "author": "Unknown"
  },
  {
    "text": "Do first things first, and second things not at all.",
    "author": "Peter Drucker"
  },
  {
    "text": "Small daily improvements over time lead to stunning results.",
    "author": "Robin Sharma"
  },
  {
    "text": "Distraction is the enemy of direction.",
    "author": "Unknown"
  },
  {
    "text": "Continuous improvement is better than delayed perfection.",
    "author": "Mark Twain"
  },
  {
    "text": "Great things are done by a series of small things brought together.",
    "author": "Vincent Van Gogh"
  },
  {
    "text": "I fear not the man who has practiced 10,000 kicks once, but the man who has practiced one kick 10,000 times.",
    "author": "Bruce Lee"
  },
  {
    "text": "You must expect great things of yourself before you can do them.",
    "author": "Michael Jordan"
  },
  {
    "text": "Step by step. I can't think of any other way of accomplishing things.",
    "author": "Michael Jordan"
  },
  {
    "text": "Obstacles are those frightful things you see when you take your eyes off your goal.",
    "author": "Henry Ford"
  },
  {
    "text": "Whether you think you can, or you think you can't—you're right.",
    "author": "Henry Ford"
  },
  {
    "text": "It's not that we have a short time to live, but that we waste a lot of it.",
    "author": "Seneca"
  },
  {
    "text": "Luck is what happens when preparation meets opportunity.",
    "author": "Seneca"
  },
  {
    "text": "Associate with people who are likely to improve you.",
    "author": "Seneca"
  },
  {
    "text": "No man is more unhappy than he who never faces adversity, for he is not permitted to prove himself.",
    "author": "Seneca"
  },
  {
    "text": "Diligence is the mother of good fortune.",
    "author": "Miguel de Cervantes"
  },
  {
    "text": "Productivity is being able to do things that you were never able to do before.",
    "author": "Franz Kafka"
  },
  {
    "text": "The double-edged sword of focus is that it requires saying no to a thousand good ideas.",
    "author": "Steve Jobs"
  },
  {
    "text": "If you want to be happy, set a goal that commands your thoughts and inspires your hopes.",
    "author": "Andrew Carnegie"
  },
  {
    "text": "He that can have patience can have what he will.",
    "author": "Benjamin Franklin"
  },
  {
    "text": "Well done is better than well said.",
    "author": "Benjamin Franklin"
  },
  {
    "text": "Never leave that till tomorrow which you can do today.",
    "author": "Benjamin Franklin"
  },
  {
    "text": "Lost time is never found again.",
    "author": "Benjamin Franklin"
  },
  {
    "text": "Motivation is what gets you started. Habit is what keeps you going.",
    "author": "Jim Ryun"
  },
  {
    "text": "Work expands so as to fill the time available for its completion.",
    "author": "C. Northcote Parkinson"
  },
  {
    "text": "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    "author": "Stephen Covey"
  },
  {
    "text": "I am not a product of my circumstances. I am a product of my decisions.",
    "author": "Stephen Covey"
  },
  {
    "text": "Most of us spend too much time on what is urgent and not enough on what is important.",
    "author": "Stephen Covey"
  },
  {
    "text": "Be not afraid of going slowly, be afraid only of standing still.",
    "author": "Chinese Proverb"
  },
  {
    "text": "The best time to plant a tree was 20 years ago. The second best time is now.",
    "author": "Chinese Proverb"
  },
  {
    "text": "A journey of a thousand miles begins with a single step.",
    "author": "Lao Tzu"
  },
  {
    "text": "Nature does not hurry, yet everything is accomplished.",
    "author": "Lao Tzu"
  },
  {
    "text": "To write is to think, not to compile.",
    "author": "Unknown"
  },
  {
    "text": "Be miserable. Or motivate yourself. Whatever has to be done, it's always your choice.",
    "author": "Wayne Dyer"
  },
  {
    "text": "It is during our darkest moments that we must focus to see the light.",
    "author": "Aristotle Onassis"
  },
  {
    "text": "Perseverance is not a long race; it is many short races one after the other.",
    "author": "Walter Elliot"
  },
  {
    "text": "Discipline is the soul of an army. It makes small numbers formidable.",
    "author": "George Washington"
  },
  {
    "text": "You may delay, but time will not.",
    "author": "Benjamin Franklin"
  },
  {
    "text": "Hard work beats talent when talent doesn't work hard.",
    "author": "Tim Notke"
  },
  {
    "text": "Genius is one percent inspiration and ninety-nine percent perspiration.",
    "author": "Thomas Edison"
  },
  {
    "text": "I have not failed. I've just found 10,000 ways that won't work.",
    "author": "Thomas Edison"
  },
  {
    "text": "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.",
    "author": "Thomas Edison"
  },
  {
    "text": "A year from now you may wish you had started today.",
    "author": "Karen Lamb"
  },
  {
    "text": "Growth begins at the end of your comfort zone.",
    "author": "Neale Donald Walsch"
  },
  {
    "text": "The path to success is to take massive, focused action.",
    "author": "Tony Robbins"
  },
  {
    "text": "If you do what you've always done, you'll get what you've always gotten.",
    "author": "Tony Robbins"
  },
  {
    "text": "If you want to make an easy job seem mighty hard, just keep putting off doing it.",
    "author": "Olin Miller"
  },
  {
    "text": "Focus is a muscle, and you build it through daily training.",
    "author": "Unknown"
  },
  {
    "text": "Discipline is the ability to do what you need to do, even when you don't feel like doing it.",
    "author": "Unknown"
  },
  {
    "text": "The threshold of adversity is the gateway to resilience.",
    "author": "Unknown"
  },
  {
    "text": "The modern distraction economy is designed to deplete your focus. Protect it.",
    "author": "Unknown"
  },
  {
    "text": "Yesterday is gone. Tomorrow has not yet come. We have only today. Let us begin.",
    "author": "Mother Teresa"
  },
  {
    "text": "Productivity is never an accident. It is always the result of a commitment to excellence.",
    "author": "Paul J. Meyer"
  },
  {
    "text": "Take care of the minutes and the hours will take care of themselves.",
    "author": "Lord Chesterfield"
  },
  {
    "text": "Resilience is knowing that you are the only one who has the power to pick yourself up.",
    "author": "Mary Holloway"
  },
  {
    "text": "The energy you expend trying to avoid a task is often greater than the energy required to complete it.",
    "author": "Unknown"
  },
  {
    "text": "You will never find time for anything. If you want time you must make it.",
    "author": "Charles Buxton"
  },
  {
    "text": "One can choose to go back toward safety or forward toward growth.",
    "author": "Abraham Maslow"
  },
  {
    "text": "What we stay focused on will expand.",
    "author": "Unknown"
  },
  {
    "text": "Focus on the process, not the outcome.",
    "author": "Unknown"
  },
  {
    "text": "Small efforts, day after day, will build an empire of habits.",
    "author": "Unknown"
  },
  {
    "text": "Greatness is not in where we stand, but in what direction we are moving.",
    "author": "Oliver Wendell Holmes"
  },
  {
    "text": "It does not matter how slowly you go as long as you do not stop.",
    "author": "Confucius"
  },
  {
    "text": "The man who moves a mountain begins by carrying away small stones.",
    "author": "Confucius"
  },
  {
    "text": "To be yourself in a world trying to make you something else is the greatest accomplishment.",
    "author": "Ralph Waldo Emerson"
  },
  {
    "text": "Without focus, there is no depth. Without depth, there is no mastery.",
    "author": "Unknown"
  },
  {
    "text": "The best revenge is massive success.",
    "author": "Frank Sinatra"
  },
  {
    "text": "There are no shortcuts to any place worth going.",
    "author": "Beverly Sills"
  }
];

const FALLBACK_WALLPAPERS = [
  {
    "url": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80",
    "photographer": "v2osm",
    "location": "Valle de Elqui, Chile"
  },
  {
    "url": "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Vincentiu Solomon",
    "location": "Rome, Italy"
  },
  {
    "url": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Kalen Emsley",
    "location": "Rocky Mountains, Canada"
  },
  {
    "url": "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Jerry Zhang",
    "location": "Golden Desert, USA"
  },
  {
    "url": "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Fabian Quintero",
    "location": "St. Gallen, Switzerland"
  },
  {
    "url": "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Ishak Kacel",
    "location": "Algiers, Algeria"
  },
  {
    "url": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Jay Mantri",
    "location": "Redwood National Park, USA"
  },
  {
    "url": "https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Sven Scheuermeier",
    "location": "Zürich, Switzerland"
  },
  {
    "url": "https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Ales Krivec",
    "location": "Lake Bohinj, Slovenia"
  },
  {
    "url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Massimiliano Morosinotto",
    "location": "Dolomites, Italy"
  },
  {
    "url": "https://images.unsplash.com/photo-1532798369041-b33eb576ef16?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Benjamin Voros",
    "location": "Stelvio Pass, Italy"
  },
  {
    "url": "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Galina N",
    "location": "Siberia, Russia"
  },
  {
    "url": "https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Joel Filipe",
    "location": "Vik, Iceland"
  },
  {
    "url": "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Caleb Jones",
    "location": "Georgia, USA"
  },
  {
    "url": "https://images.unsplash.com/photo-1472214222541-d510753a8707?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Mike Enerio",
    "location": "Maui, Hawaii"
  },
  {
    "url": "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Rui Silvestre",
    "location": "Algarve, Portugal"
  },
  {
    "url": "https://images.unsplash.com/photo-1536746803623-cef87080bfc8?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Sasa cvetkovic",
    "location": "Belgrade, Serbia"
  },
  {
    "url": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80",
    "photographer": "Christopher Gower",
    "location": "San Francisco, USA"
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
  
  // 3. Once transition concludes (matched with CSS transition: 0.2s + 0.2s), stabilize DOM
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
  
  // Reset elements to hidden states to trigger fade-in animations
  document.getElementById('wallpaper').classList.remove('loaded');
  document.getElementById('quote-box').classList.remove('loaded');
  document.getElementById('attribution').classList.remove('loaded');
  document.querySelector('.container').classList.remove('loaded');
  
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

// Helper to fetch JSON with an abortable timeout (2.5 seconds)
async function fetchWithTimeout(url, timeoutMs = 2500) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchRemoteContent(todayStr) {
  let quotes = FALLBACK_QUOTES;
  let wallpapers = FALLBACK_WALLPAPERS;
  let isFetchSuccess = false;
  
  try {
    // Attempt parallel fetches with 2.5s timeout each
    const quotesPromise = fetchWithTimeout(QUOTES_URL, 2500);
    const wallpapersPromise = fetchWithTimeout(WALLPAPERS_URL, 2500);
    
    const [remoteQuotes, remoteWallpapers] = await Promise.all([quotesPromise, wallpapersPromise]);
    
    if (Array.isArray(remoteQuotes) && remoteQuotes.length > 0) {
      quotes = remoteQuotes;
    }
    
    if (Array.isArray(remoteWallpapers) && remoteWallpapers.length > 0) {
      wallpapers = remoteWallpapers;
    }
    
    isFetchSuccess = true;
    console.log("Rise: Successfully loaded remote assets.");
  } catch (err) {
    console.warn("Rise: Remote fetch timed out or failed. Using fallback assets. Error:", err.message);
  }
  
  // Select random elements
  const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];
  const selectedWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
  
  // Cache the selection for the remainder of the day
  storage.set({
    cachedDate: todayStr,
    cachedQuote: selectedQuote,
    cachedWallpaper: selectedWallpaper
  }, () => {
    displayContent(selectedQuote, selectedWallpaper);
  });
}

function displayContent(quote, wallpaper) {
  // Populate quote text and check character size for responsive scaling
  const quoteTextElement = document.getElementById('quote-text');
  const quoteAuthorElement = document.getElementById('quote-author');
  const quoteBox = document.getElementById('quote-box');
  
  quoteTextElement.textContent = `“${quote.text}”`;
  quoteAuthorElement.textContent = quote.author || "Unknown";
  
  // Long quote handling (> 120 characters)
  if (quote.text.length > 120) {
    quoteBox.classList.add('long-quote');
  } else {
    quoteBox.classList.remove('long-quote');
  }
  
  // Populate photo attribution details
  const attributionElement = document.getElementById('wallpaper-credit');
  if (wallpaper.location && wallpaper.photographer) {
    attributionElement.textContent = `${wallpaper.location} · By ${wallpaper.photographer}`;
  } else if (wallpaper.photographer) {
    attributionElement.textContent = `Photo by ${wallpaper.photographer}`;
  } else {
    attributionElement.textContent = wallpaper.location || "Stunning Landscape";
  }
  
  const wallpaperContainer = document.getElementById('wallpaper');
  const container = document.querySelector('.container');
  const attribution = document.getElementById('attribution');
  
  let animationTriggered = false;
  
  function triggerPageFadeIn() {
    if (animationTriggered) return;
    animationTriggered = true;
    
    // Add loaded classes to trigger smooth CSS opacity transitions
    wallpaperContainer.classList.add('loaded');
    container.classList.add('loaded');
    quoteBox.classList.add('loaded');
    attribution.classList.add('loaded');
  }
  
  // Safety Timer: If wallpaper image is very slow/uncached and takes > 1.5s, fade-in with fallback black/slate gradient
  const safetyTimeout = setTimeout(() => {
    console.warn("Rise: Image loading exceeded safety threshold. Displaying layout with dark fallback background.");
    if (!wallpaperContainer.style.backgroundImage) {
      wallpaperContainer.style.backgroundImage = "linear-gradient(135deg, #050a14 0%, #121c2f 100%)";
    }
    triggerPageFadeIn();
  }, 1500);
  
  // Pre-load wallpaper image
  const img = new Image();
  img.onload = () => {
    clearTimeout(safetyTimeout);
    wallpaperContainer.style.backgroundImage = `url('${wallpaper.url}')`;
    triggerPageFadeIn();
  };
  
  img.onerror = () => {
    clearTimeout(safetyTimeout);
    console.error("Rise: Failed to load background image:", wallpaper.url);
    wallpaperContainer.style.backgroundImage = "linear-gradient(135deg, #050a14 0%, #121c2f 100%)";
    triggerPageFadeIn();
  };
  
  img.src = wallpaper.url;
}

// --- Interactive Buttons & Controls ---
function initControls() {
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.addEventListener('click', () => {
    loadDailyContent(true); // Bypass cache and fetch fresh remote items
  });
}

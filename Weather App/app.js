// AuraWeather Core Application Logic

let currentWeatherData = null;
let currentUnit = 'C'; // 'C' or 'F'

// WMO Weather Code Mappings to Description, Theme, and SVG Group
const weatherCodeMap = {
  0: { desc: 'Clear Sky', theme: 'clear', icon: 'clear' },
  1: { desc: 'Mainly Clear', theme: 'clear', icon: 'partly-cloudy' },
  2: { desc: 'Partly Cloudy', theme: 'cloudy', icon: 'partly-cloudy' },
  3: { desc: 'Overcast', theme: 'cloudy', icon: 'cloudy' },
  45: { desc: 'Foggy', theme: 'cloudy', icon: 'cloudy' },
  48: { desc: 'Depositing Rime Fog', theme: 'cloudy', icon: 'cloudy' },
  51: { desc: 'Light Drizzle', theme: 'rainy', icon: 'drizzle' },
  53: { desc: 'Moderate Drizzle', theme: 'rainy', icon: 'drizzle' },
  55: { desc: 'Dense Drizzle', theme: 'rainy', icon: 'drizzle' },
  56: { desc: 'Light Freezing Drizzle', theme: 'rainy', icon: 'drizzle' },
  57: { desc: 'Dense Freezing Drizzle', theme: 'rainy', icon: 'drizzle' },
  61: { desc: 'Slight Rain', theme: 'rainy', icon: 'rainy' },
  63: { desc: 'Moderate Rain', theme: 'rainy', icon: 'rainy' },
  65: { desc: 'Heavy Rain', theme: 'rainy', icon: 'rainy' },
  66: { desc: 'Light Freezing Rain', theme: 'rainy', icon: 'rainy' },
  67: { desc: 'Heavy Freezing Rain', theme: 'rainy', icon: 'rainy' },
  71: { desc: 'Slight Snowfall', theme: 'snowy', icon: 'snowy' },
  73: { desc: 'Moderate Snowfall', theme: 'snowy', icon: 'snowy' },
  75: { desc: 'Heavy Snowfall', theme: 'snowy', icon: 'snowy' },
  77: { desc: 'Snow Grains', theme: 'snowy', icon: 'snowy' },
  80: { desc: 'Slight Rain Showers', theme: 'rainy', icon: 'rainy' },
  81: { desc: 'Moderate Rain Showers', theme: 'rainy', icon: 'rainy' },
  82: { desc: 'Violent Rain Showers', theme: 'rainy', icon: 'rainy' },
  85: { desc: 'Slight Snow Showers', theme: 'snowy', icon: 'snowy' },
  86: { desc: 'Heavy Snow Showers', theme: 'snowy', icon: 'snowy' },
  95: { desc: 'Thunderstorm', theme: 'stormy', icon: 'stormy' },
  96: { desc: 'Thunderstorm with Hail', theme: 'stormy', icon: 'stormy' },
  99: { desc: 'Heavy Thunderstorm', theme: 'stormy', icon: 'stormy' }
};

// Generate SVG Weather Icons dynamically
function getWeatherIconSVG(iconKey, isDay = 1) {
  const isNight = isDay === 0;
  
  switch (iconKey) {
    case 'clear':
      if (isNight) {
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 8px var(--accent-glow))">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor"/>
          </svg>
        `;
      }
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 12px var(--accent-glow))">
          <circle cx="12" cy="12" r="4" fill="currentColor"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      `;
      
    case 'partly-cloudy':
      if (isNight) {
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" fill="currentColor"/>
            <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.1)"/>
          </svg>
        `;
      }
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M19.07 4.93l-1.41 1.41"/>
          <path d="M22 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.1)"/>
        </svg>
      `;
      
    case 'cloudy':
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.15)"/>
        </svg>
      `;
      
    case 'drizzle':
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.1)"/>
          <path d="M8 16l-1 2M12 17l-1 2M16 16l-1 2"/>
        </svg>
      `;
      
    case 'rainy':
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.1)"/>
          <path d="M8 16l-2 4M12 18l-2 4M16 16l-2 4"/>
        </svg>
      `;
      
    case 'snowy':
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.1)"/>
          <path d="M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01" stroke-width="3"/>
        </svg>
      `;
      
    case 'stormy':
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 15.25" fill="rgba(255, 255, 255, 0.1)"/>
          <path d="m13 11-4 6h3v4l4-6h-3v-4z" fill="currentColor"/>
        </svg>
      `;
      
    default:
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
        </svg>
      `;
  }
}

// Convert temperature values
function convertTemp(celsius, unit) {
  if (unit === 'F') {
    return Math.round((celsius * 9) / 5 + 32);
  }
  return Math.round(celsius);
}

// Format the date/time string
function formatLocalTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const options = { weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true };
  return date.toLocaleDateString('en-US', options);
}

// Display error toasts to the user
function showError(message) {
  const toast = document.getElementById('error-message');
  toast.textContent = message;
  toast.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 5000);
}

// Load Weather Data from API
async function fetchWeather(city) {
  const loader = document.getElementById('loader');
  loader.classList.remove('hidden');
  
  try {
    const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to retrieve weather details.');
    }
    
    currentWeatherData = data;
    renderWeather();
    
    // Switch screens
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('weather-content').classList.remove('hidden');
    
  } catch (error) {
    showError(error.message);
  } finally {
    loader.classList.add('hidden');
  }
}

// Render Weather UI components
function renderWeather() {
  if (!currentWeatherData) return;

  const { location, current, hourly, daily } = currentWeatherData;
  const codeInfo = weatherCodeMap[current.weather_code] || { desc: 'Unknown', theme: 'clear', icon: 'clear' };

  // 1. Update background theme dynamically
  document.body.className = '';
  if (codeInfo.theme === 'clear' && current.is_day === 0) {
    document.body.classList.add('theme-clear-night');
  } else {
    document.body.classList.add(`theme-${codeInfo.theme}`);
  }

  // 2. Set Current Location details
  document.getElementById('display-city').textContent = location.city;
  const regionString = [location.state, location.country].filter(Boolean).join(', ');
  document.getElementById('display-region').textContent = regionString;
  document.getElementById('display-time').textContent = formatLocalTime(current.time);

  // 3. Render weather icon
  const iconContainer = document.getElementById('current-icon-container');
  iconContainer.innerHTML = getWeatherIconSVG(codeInfo.icon, current.is_day);

  // 4. Update temperature reading
  const tempVal = convertTemp(current.temperature_2m, currentUnit);
  document.getElementById('current-temp').textContent = tempVal;
  document.querySelector('.temp-unit').textContent = `°${currentUnit}`;

  // 5. Update descriptions
  document.getElementById('weather-description').textContent = codeInfo.desc;
  const feelsLikeVal = convertTemp(current.apparent_temperature, currentUnit);
  document.getElementById('feels-like-text').textContent = `Feels like ${feelsLikeVal}°${currentUnit}`;

  // 6. Update Secondary Stats
  document.getElementById('wind-val').textContent = `${current.wind_speed_10m} km/h`;
  document.getElementById('humidity-val').textContent = `${current.relative_humidity_2m}%`;
  
  // Find UV index for today
  const uvMax = daily.uv_index_max && daily.uv_index_max[0] ? daily.uv_index_max[0] : 0;
  let uvLabel = 'Low';
  if (uvMax >= 3 && uvMax < 6) uvLabel = 'Mod';
  else if (uvMax >= 6 && uvMax < 8) uvLabel = 'High';
  else if (uvMax >= 8) uvLabel = 'Very High';
  document.getElementById('uv-val').textContent = `${uvMax} (${uvLabel})`;
  
  document.getElementById('precip-val').textContent = `${current.precipitation} mm`;

  // 7. Render Hourly Timeline (Next 24 Hours)
  const hourlyContainer = document.getElementById('hourly-container');
  hourlyContainer.innerHTML = '';
  
  // Find index corresponding to current time or start index
  const currentHourStr = current.time.slice(0, 13) + ':00';
  let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourStr));
  if (startIndex === -1) startIndex = 0;
  
  // Slice next 24 entries
  for (let i = startIndex; i < Math.min(startIndex + 24, hourly.time.length); i++) {
    const timeVal = new Date(hourly.time[i]);
    const formattedHour = timeVal.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    
    const hCode = hourly.weather_code[i];
    const hInfo = weatherCodeMap[hCode] || { desc: 'Clear', theme: 'clear', icon: 'clear' };
    
    // Determine day/night icon for hourly forecast
    const hHour = timeVal.getHours();
    const hIsDay = hHour >= 6 && hHour < 18 ? 1 : 0;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'hourly-item';
    itemDiv.innerHTML = `
      <span class="hourly-time">${formattedHour}</span>
      <div class="hourly-icon">${getWeatherIconSVG(hInfo.icon, hIsDay)}</div>
      <span class="hourly-temp">${convertTemp(hourly.temperature_2m[i], currentUnit)}°</span>
    `;
    hourlyContainer.appendChild(itemDiv);
  }

  // 8. Render 7-Day Forecast
  const dailyContainer = document.getElementById('daily-container');
  dailyContainer.innerHTML = '';

  for (let i = 0; i < daily.time.length; i++) {
    const dateVal = new Date(daily.time[i] + 'T00:00:00');
    
    // Get day name
    let dayName = dateVal.toLocaleDateString('en-US', { weekday: 'long' });
    // Check if it is today
    const today = new Date();
    if (dateVal.toDateString() === today.toDateString()) {
      dayName = 'Today';
    }
    
    const dCode = daily.weather_code[i];
    const dInfo = weatherCodeMap[dCode] || { desc: 'Clear', theme: 'clear', icon: 'clear' };
    
    const maxTemp = convertTemp(daily.temperature_2m_max[i], currentUnit);
    const minTemp = convertTemp(daily.temperature_2m_min[i], currentUnit);
    
    const rowDiv = document.createElement('div');
    rowDiv.className = 'daily-row';
    rowDiv.innerHTML = `
      <span class="daily-day">${dayName}</span>
      <div class="daily-icon-box">
        <div class="daily-icon">${getWeatherIconSVG(dInfo.icon, 1)}</div>
        <span class="daily-desc">${dInfo.desc}</span>
      </div>
      <span></span> <!-- spacer -->
      <div class="daily-temp-range">
        <span class="daily-max-temp">${maxTemp}°</span>
        <span class="daily-min-temp">${minTemp}°</span>
      </div>
    `;
    dailyContainer.appendChild(rowDiv);
  }
}

// Event Listeners setup
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const cityInput = document.getElementById('city-input');
  const unitToggleBtn = document.getElementById('unit-toggle');
  const defaultSearchBtn = document.getElementById('search-default-btn');

  // Search Submit
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    }
  });

  // Get Started / Default button
  defaultSearchBtn.addEventListener('click', () => {
    fetchWeather('New York');
  });

  // Unit Toggle
  unitToggleBtn.addEventListener('click', () => {
    const cSpan = unitToggleBtn.querySelector('.unit-c');
    const fSpan = unitToggleBtn.querySelector('.unit-f');
    
    if (currentUnit === 'C') {
      currentUnit = 'F';
      cSpan.classList.remove('active');
      fSpan.classList.add('active');
    } else {
      currentUnit = 'C';
      fSpan.classList.remove('active');
      cSpan.classList.add('active');
    }
    
    renderWeather();
  });
  
  // Accessibility for unit toggle
  unitToggleBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      unitToggleBtn.click();
    }
  });
});

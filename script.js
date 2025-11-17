// script.js
// Shared interactivity for Shymir Floyd's Portfolio

// Utility: set status messages with color coding
function setStatus(el, message, type = "info") {
  if (!el) return;
  el.textContent = message;
  el.style.color =
    type === "error" ? "var(--danger)" :
    type === "success" ? "var(--success)" :
    "var(--muted)";
}

// -------------------- Random Facts --------------------
function initFacts() {
  const factEl = document.getElementById("fact");
  const statusEl = document.getElementById("status");
  const btn = document.getElementById("refresh");
  if (!factEl || !statusEl || !btn) return; // only run on facts page

  async function getFact() {
    setStatus(statusEl, "Loading…");
    factEl.textContent = "";
    try {
      const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      factEl.textContent = data.text || "No fact returned.";
      setStatus(statusEl, "Done", "success");
    } catch (err) {
      // Fallback: Cat Fact
      try {
        const res2 = await fetch("https://catfact.ninja/fact");
        if (!res2.ok) throw new Error("Network error");
        const data2 = await res2.json();
        factEl.textContent = data2.fact || "No fallback fact returned.";
        setStatus(statusEl, "Fallback used", "success");
      } catch (err2) {
        factEl.textContent = "Sorry, both APIs are unavailable right now.";
        setStatus(statusEl, "Failed to load facts.", "error");
      }
    }
  }

  btn.addEventListener("click", getFact);
  getFact(); // auto-load on page open
}

// -------------------- Weather --------------------
async function geocodeCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.results || data.results.length === 0) throw new Error("City not found");
  const r = data.results[0];
  return { name: `${r.name}, ${r.country_code}`, lat: r.latitude, lon: r.longitude };
}

async function getWeather(lat, lon, unit = "fahrenheit") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=${unit}&windspeed_unit=mph`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  return data.current_weather;
}

const weatherCodes = {
  0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog", 51: "Light drizzle",
  53: "Moderate drizzle", 55: "Dense drizzle", 61: "Slight rain",
  63: "Moderate rain", 65: "Heavy rain", 71: "Slight snow",
  73: "Moderate snow", 75: "Heavy snow", 80: "Rain showers",
  81: "Rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
  96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

function initWeather() {
  const form = document.getElementById("weatherForm");
  if (!form) return; // only run on weather page

  const statusEl = document.getElementById("status");
  const result = document.getElementById("result");
  const cityNameEl = document.getElementById("cityName");
  const condEl = document.getElementById("conditions");
  const tempEl = document.getElementById("temp");
  const windEl = document.getElementById("wind");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = new FormData(form).get("city");
    setStatus(statusEl, "Looking up city…");
    result.hidden = true;

    try {
      const place = await geocodeCity(city);
      setStatus(statusEl, "Fetching weather…");
      const wx = await getWeather(place.lat, place.lon, "fahrenheit");

      cityNameEl.textContent = place.name;
      condEl.textContent = weatherCodes[wx.weathercode] ?? `Code ${wx.weathercode}`;
      tempEl.textContent = `${wx.temperature} °F`;
      windEl.textContent = `${wx.windspeed} mph from ${wx.winddirection}°`;

      result.hidden = false;
      setStatus(statusEl, "Done", "success");
    } catch (err) {
      setStatus(statusEl, err.message || "Something went wrong.", "error");
      result.hidden = true;
    }
  });
}

// -------------------- Theme Toggle --------------------
function initThemeToggle() {
  const toggleBtn = document.getElementById("themeToggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    if (document.body.classList.contains("dark")) {
      toggleBtn.textContent = "Light Mode";
    } else {
      toggleBtn.textContent = "Dark Mode";
    }
  });
}

// -------------------- Initialize --------------------
document.addEventListener("DOMContentLoaded", () => {
  initFacts();
  initWeather();
  initThemeToggle();
});

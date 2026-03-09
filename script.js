/**
 * World Clock - Modern Minimalist Multi-Timezone Display
 * Features: User timezone detection, search, time comparison
 */

(function () {
  "use strict";

  // Major timezone configuration with city details
  const timezones = [
    // Americas
    {
      timezone: "America/New_York",
      city: "New York",
      country: "USA",
      region: "EST",
    },
    {
      timezone: "America/Los_Angeles",
      city: "Los Angeles",
      country: "USA",
      region: "PST",
    },
    {
      timezone: "America/Chicago",
      city: "Chicago",
      country: "USA",
      region: "CST",
    },
    {
      timezone: "America/Denver",
      city: "Denver",
      country: "USA",
      region: "MST",
    },
    {
      timezone: "America/Toronto",
      city: "Toronto",
      country: "Canada",
      region: "EST",
    },
    {
      timezone: "America/Vancouver",
      city: "Vancouver",
      country: "Canada",
      region: "PST",
    },
    {
      timezone: "America/Mexico_City",
      city: "Mexico City",
      country: "Mexico",
      region: "CST",
    },
    {
      timezone: "America/Sao_Paulo",
      city: "São Paulo",
      country: "Brazil",
      region: "BRT",
    },
    {
      timezone: "America/Buenos_Aires",
      city: "Buenos Aires",
      country: "Argentina",
      region: "ART",
    },

    // Europe
    { timezone: "Europe/London", city: "London", country: "UK", region: "GMT" },
    {
      timezone: "Europe/Paris",
      city: "Paris",
      country: "France",
      region: "CET",
    },
    {
      timezone: "Europe/Berlin",
      city: "Berlin",
      country: "Germany",
      region: "CET",
    },
    {
      timezone: "Europe/Madrid",
      city: "Madrid",
      country: "Spain",
      region: "CET",
    },
    { timezone: "Europe/Rome", city: "Rome", country: "Italy", region: "CET" },
    {
      timezone: "Europe/Amsterdam",
      city: "Amsterdam",
      country: "Netherlands",
      region: "CET",
    },
    {
      timezone: "Europe/Moscow",
      city: "Moscow",
      country: "Russia",
      region: "MSK",
    },
    {
      timezone: "Europe/Istanbul",
      city: "Istanbul",
      country: "Turkey",
      region: "TRT",
    },

    // Asia
    { timezone: "Asia/Dubai", city: "Dubai", country: "UAE", region: "GST" },
    {
      timezone: "Asia/Kolkata",
      city: "Mumbai",
      country: "India",
      region: "IST",
    },
    {
      timezone: "Asia/Singapore",
      city: "Singapore",
      country: "Singapore",
      region: "SGT",
    },
    {
      timezone: "Asia/Hong_Kong",
      city: "Hong Kong",
      country: "China",
      region: "HKT",
    },
    {
      timezone: "Asia/Shanghai",
      city: "Shanghai",
      country: "China",
      region: "CST",
    },
    { timezone: "Asia/Tokyo", city: "Tokyo", country: "Japan", region: "JST" },
    {
      timezone: "Asia/Seoul",
      city: "Seoul",
      country: "South Korea",
      region: "KST",
    },
    {
      timezone: "Asia/Bangkok",
      city: "Bangkok",
      country: "Thailand",
      region: "ICT",
    },
    {
      timezone: "Asia/Jakarta",
      city: "Jakarta",
      country: "Indonesia",
      region: "WIB",
    },

    // Oceania
    {
      timezone: "Australia/Sydney",
      city: "Sydney",
      country: "Australia",
      region: "AEDT",
    },
    {
      timezone: "Australia/Melbourne",
      city: "Melbourne",
      country: "Australia",
      region: "AEDT",
    },
    {
      timezone: "Australia/Perth",
      city: "Perth",
      country: "Australia",
      region: "AWST",
    },
    {
      timezone: "Pacific/Auckland",
      city: "Auckland",
      country: "New Zealand",
      region: "NZDT",
    },

    // Africa
    {
      timezone: "Africa/Cairo",
      city: "Cairo",
      country: "Egypt",
      region: "EET",
    },
    {
      timezone: "Africa/Johannesburg",
      city: "Johannesburg",
      country: "South Africa",
      region: "SAST",
    },
    {
      timezone: "Africa/Lagos",
      city: "Lagos",
      country: "Nigeria",
      region: "WAT",
    },
  ];

  // State
  let homeTimezone = null;
  let searchDebounceTimer = null;

  /**
   * Detect user's timezone
   */
  function detectUserTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      console.warn("Could not detect timezone:", e);
      return "America/New_York"; // Default fallback
    }
  }

  /**
   * Get stored timezone from localStorage
   */
  function getStoredTimezone() {
    return localStorage.getItem("worldClockHomeTimezone");
  }

  /**
   * Store timezone in localStorage
   */
  function setStoredTimezone(timezone) {
    localStorage.setItem("worldClockHomeTimezone", timezone);
  }

  /**
   * Find timezone config by timezone string
   */
  function findTimezoneConfig(tz) {
    return timezones.find((t) => t.timezone === tz);
  }

  /**
   * Get timezone info not in our list
   */
  function getTimezoneInfo(tz) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(now);
    const tzName = parts.find((p) => p.type === "timeZoneName")?.value || tz;

    // Extract city from timezone (e.g., "America/New_York" -> "New York")
    const city = tz.split("/").pop().replace(/_/g, " ");

    return {
      timezone: tz,
      city: city,
      country: tzName,
      region: tzName,
    };
  }

  /**
   * Populate timezone selector
   */
  function populateTimezoneSelector() {
    const select = document.getElementById("homeTimezone");
    if (!select) return;

    // Clear existing options
    select.innerHTML = "";

    // Add all timezones as options
    timezones.forEach((tz) => {
      const option = document.createElement("option");
      option.value = tz.timezone;
      option.textContent = `${tz.city}, ${tz.country}`;
      select.appendChild(option);
    });

    // Set initial value
    const stored = getStoredTimezone();
    if (stored && timezones.find((t) => t.timezone === stored)) {
      select.value = stored;
      homeTimezone = stored;
    } else {
      const detected = detectUserTimezone();
      // Check if detected timezone is in our list
      if (timezones.find((t) => t.timezone === detected)) {
        select.value = detected;
        homeTimezone = detected;
      } else {
        // Default to New York
        select.value = "America/New_York";
        homeTimezone = "America/New_York";
      }
    }
  }

  /**
   * Create home clock card (prominent)
   */
  function createHomeClock(config) {
    const card = document.getElementById("homeClock");
    if (!card) return;

    card.innerHTML = `
      <div class="clock-badge">
         Your Time
      </div>
      <div class="clock-location">
        <div>
          <div class="city">${config.city}</div>
          <div class="country">${config.country}</div>
        </div>
        <div class="region">${config.region}</div>
      </div>
      <div class="clock-time">
        <span class="time-part hours">00</span><span class="separator">:</span><span class="time-part minutes">00</span><span class="separator">:</span><span class="time-part seconds">00</span>
      </div>
      <div class="clock-date">
        <span class="day">--</span>
        <span class="date">--</span>
      </div>
    `;

    card.setAttribute("data-timezone", config.timezone);
  }

  /**
   * Create a clock card element
   */
  function createClockCard(config, homeTz) {
    const card = document.createElement("div");
    card.className = "clock-card";
    card.setAttribute("data-timezone", config.timezone);
    card.setAttribute("data-city", config.city.toLowerCase());
    card.setAttribute("data-country", config.country.toLowerCase());
    card.setAttribute("data-region", config.region.toLowerCase());

    // Calculate time difference
    const diff = calculateTimeDifference(config.timezone, homeTz);
    const diffClass = diff > 0 ? "ahead" : diff < 0 ? "behind" : "same";
    const diffText = formatTimeDifference(diff);

    card.innerHTML = `
      <div class="clock-location">
        <div>
          <div class="city">${config.city}</div>
          <div class="country">${config.country}</div>
        </div>
        <div class="region">${config.region}</div>
      </div>
      <div class="clock-time">
        <span class="time-part hours">00</span><span class="separator">:</span><span class="time-part minutes">00</span><span class="separator">:</span><span class="time-part seconds">00</span>
      </div>
      <div class="clock-date">
        <span class="day">--</span>
        <span class="date">--</span>
      </div>
      <div class="clock-time-diff ${diffClass}">
        <span class="diff-arrow">${diff > 0 ? "↑" : diff < 0 ? "↓" : "="}</span>
        <span class="diff-text">${diffText}</span>
      </div>
    `;

    return card;
  }

  /**
   * Calculate time difference between two timezones
   */
  function calculateTimeDifference(targetTz, homeTz) {
    const now = new Date();

    // Get hours for both timezones
    const targetHours = parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: targetTz,
        hour: "numeric",
        hour12: false,
      }).format(now),
    );

    const homeHours = parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: homeTz,
        hour: "numeric",
        hour12: false,
      }).format(now),
    );

    let diff = targetHours - homeHours;

    // Handle day wrap
    if (diff > 12) diff -= 24;
    if (diff < -12) diff += 24;

    return diff;
  }

  /**
   * Format time difference for display
   */
  function formatTimeDifference(diff) {
    if (diff === 0) return "Same time";
    const absDiff = Math.abs(diff);
    const hourText = absDiff === 1 ? "hour" : "hours";
    return `${absDiff} ${hourText} ${diff > 0 ? "ahead" : "behind"}`;
  }

  /**
   * Format time with leading zeros
   */
  function padZero(num) {
    return num.toString().padStart(2, "0");
  }

  /**
   * Update home clock
   */
  function updateHomeClock() {
    const card = document.getElementById("homeClock");
    if (!card) return;

    updateClockTime(card);
  }

  /**
   * Update a single clock's time and date
   */
  function updateClockTime(card) {
    const timezone = card.getAttribute("data-timezone");
    const now = new Date();

    // Format time
    const timeFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const timeParts = timeFormatter.formatToParts(now);

    const hours = timeParts.find((p) => p.type === "hour")?.value || "00";
    const minutes = timeParts.find((p) => p.type === "minute")?.value || "00";
    const seconds = timeParts.find((p) => p.type === "second")?.value || "00";

    // Update time display
    const hoursEl = card.querySelector(".hours");
    const minutesEl = card.querySelector(".minutes");
    const secondsEl = card.querySelector(".seconds");

    if (hoursEl) hoursEl.textContent = padZero(hours);
    if (minutesEl) minutesEl.textContent = padZero(minutes);
    if (secondsEl) secondsEl.textContent = padZero(seconds);

    // Format date
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
    });

    const dateParts = dateFormatter.formatToParts(now);

    const day = dateParts.find((p) => p.type === "weekday")?.value || "--";
    const month = dateParts.find((p) => p.type === "month")?.value || "--";
    const date = dateParts.find((p) => p.type === "day")?.value || "--";

    // Update date display
    const dayEl = card.querySelector(".day");
    const dateEl = card.querySelector(".date");

    if (dayEl) dayEl.textContent = day;
    if (dateEl) dateEl.textContent = `${month} ${date}`;
  }

  /**
   * Update all clocks
   */
  function updateAllClocks() {
    updateHomeClock();
    const cards = document.querySelectorAll(".clock-card:not(.hidden)");
    cards.forEach(updateClockTime);
  }

  /**
   * Filter clocks based on search term
   */
  function filterClocks(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    const cards = document.querySelectorAll(".clock-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const city = card.getAttribute("data-city") || "";
      const country = card.getAttribute("data-country") || "";
      const region = card.getAttribute("data-region") || "";
      const timezone = card.getAttribute("data-timezone")?.toLowerCase() || "";

      const matches =
        !term ||
        city.includes(term) ||
        country.includes(term) ||
        region.includes(term) ||
        timezone.includes(term);

      if (matches) {
        card.classList.remove("hidden");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
    });

    // Show/hide "no results" message
    const noResults = document.getElementById("noResults");
    const clocksTitle = document.getElementById("clocksTitle");

    if (visibleCount === 0 && term !== "") {
      if (noResults) noResults.style.display = "block";
      if (clocksTitle) clocksTitle.style.display = "none";
    } else {
      if (noResults) noResults.style.display = "none";
      if (clocksTitle) clocksTitle.style.display = "block";
    }
  }

  /**
   * Handle search input with debounce
   */
  function handleSearch(e) {
    const value = e.target.value;

    // Show/hide clear button
    const clearBtn = document.getElementById("clearSearch");
    if (clearBtn) {
      clearBtn.classList.toggle("visible", value.length > 0);
    }

    // Debounce filtering
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      filterClocks(value);
    }, 200);
  }

  /**
   * Clear search input
   */
  function clearSearch() {
    const searchInput = document.getElementById("clockSearch");
    const clearBtn = document.getElementById("clearSearch");

    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }

    if (clearBtn) {
      clearBtn.classList.remove("visible");
    }

    filterClocks("");
  }

  /**
   * Handle timezone selector change
   */
  function handleTimezoneChange(e) {
    homeTimezone = e.target.value;
    setStoredTimezone(homeTimezone);

    // Update home clock display
    const config = findTimezoneConfig(homeTimezone);
    if (config) {
      createHomeClock(config);
      updateHomeClock();
    }

    // Re-render all clock cards to update time differences
    renderAllClocks();
  }

  /**
   * Render all clock cards
   */
  function renderAllClocks() {
    const container = document.getElementById("clocksContainer");
    if (!container) return;

    // Clear existing clocks
    container.innerHTML = "";

    // Get current search term
    const searchInput = document.getElementById("clockSearch");
    const searchTerm = searchInput ? searchInput.value : "";

    // Filter out home timezone from the grid
    const filteredTimezones = timezones.filter(
      (tz) => tz.timezone !== homeTimezone,
    );

    // Create clock cards
    filteredTimezones.forEach((config) => {
      const card = createClockCard(config, homeTimezone);
      container.appendChild(card);
    });

    // Apply current filter
    filterClocks(searchTerm);

    // Update all clocks
    updateAllClocks();
  }

  /**
   * Initialize search functionality
   */
  function initSearch() {
    const searchInput = document.getElementById("clockSearch");
    const clearBtn = document.getElementById("clearSearch");

    if (searchInput) {
      searchInput.addEventListener("input", handleSearch);

      // Also handle 'search' event (browser's native clear button)
      searchInput.addEventListener("search", () => {
        if (searchInput.value === "") {
          clearSearch();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", clearSearch);
    }

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Focus search with "/" key
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        if (searchInput) searchInput.focus();
      }

      // Clear and blur search with Escape
      if (e.key === "Escape" && searchInput) {
        clearSearch();
        searchInput.blur();
      }
    });
  }

  /**
   * Initialize timezone selector
   */
  function initTimezoneSelector() {
    const select = document.getElementById("homeTimezone");

    if (select) {
      select.addEventListener("change", handleTimezoneChange);
    }
  }

  /**
   * Initialize the application
   */
  function init() {
    // Populate timezone selector
    populateTimezoneSelector();

    // Create home clock
    const homeConfig =
      findTimezoneConfig(homeTimezone) || getTimezoneInfo(homeTimezone);
    createHomeClock(homeConfig);

    // Initialize search functionality
    initSearch();

    // Initialize timezone selector
    initTimezoneSelector();

    // Render all clock cards
    renderAllClocks();

    // Start clock updates
    setInterval(updateAllClocks, 1000);
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

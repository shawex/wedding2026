const WEDDING_CONFIG = {
  eventDate: "2026-03-21T16:00:00+09:00",
  rsvpEndpoint: "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"
};

const countdownParts = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

initRevealAnimation();
initCountdown();
initMusicToggle();
initRsvpForm();

function initRevealAnimation() {
  const blocks = document.querySelectorAll(".reveal");
  if (!blocks.length) {
    return;
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    blocks.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  blocks.forEach((el) => observer.observe(el));
}

function initCountdown() {
  const targetMs = new Date(WEDDING_CONFIG.eventDate).getTime();
  if (Number.isNaN(targetMs)) {
    return;
  }

  const update = () => {
    const diff = targetMs - Date.now();
    if (diff <= 0) {
      writeCountdown(0, 0, 0, 0);
      return;
    }

    const day = 1000 * 60 * 60 * 24;
    const hour = 1000 * 60 * 60;
    const minute = 1000 * 60;

    const days = Math.floor(diff / day);
    const hours = Math.floor((diff % day) / hour);
    const minutes = Math.floor((diff % hour) / minute);
    const seconds = Math.floor((diff % minute) / 1000);

    writeCountdown(days, hours, minutes, seconds);
  };

  update();
  window.setInterval(update, 1000);
}

function writeCountdown(days, hours, minutes, seconds) {
  countdownParts.days.textContent = String(days).padStart(2, "0");
  countdownParts.hours.textContent = String(hours).padStart(2, "0");
  countdownParts.minutes.textContent = String(minutes).padStart(2, "0");
  countdownParts.seconds.textContent = String(seconds).padStart(2, "0");
}

function initMusicToggle() {
  const button = document.getElementById("musicToggle");
  const audio = document.getElementById("weddingMusic");
  const label = button?.querySelector(".music-toggle__label");
  if (!button || !audio || !label) {
    return;
  }

  audio.volume = 0.35;

  button.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        button.setAttribute("aria-pressed", "true");
        label.textContent = "ÐÑÐºÐ»ÑÑÐ¸ÑÑ Ð¼ÑÐ·ÑÐºÑ";
      } catch (error) {
        label.textContent = "ÐÑÐ·ÑÐºÐ° Ð½ÐµÐ´Ð¾ÑÑÑÐ¿Ð½Ð°";
      }
      return;
    }

    audio.pause();
    button.setAttribute("aria-pressed", "false");
    label.textContent = "ÐÐºÐ»ÑÑÐ¸ÑÑ Ð°ÑÐ¼Ð¾ÑÑÐµÑÑ";
  });
}

function initRsvpForm() {
  const form = document.getElementById("rsvpForm");
  const statusNode = document.getElementById("formStatus");
  const submitBtn = form?.querySelector(".submit-btn");
  if (!form || !statusNode || !submitBtn) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const payload = {
      submittedAt: new Date().toISOString(),
      fullName: String(data.get("fullName") || "").trim(),
      attendance: String(data.get("attendance") || ""),
      drink: String(data.get("drink") || ""),
      comment: String(data.get("comment") || "").trim(),
      page: window.location.href
    };

    submitBtn.disabled = true;
    setFormStatus(statusNode, "ÐÑÐ¿ÑÐ°Ð²Ð»ÑÐµÐ¼ Ð¾ÑÐ²ÐµÑ...");

    try {
      await sendRsvp(payload);
      form.reset();
      setFormStatus(statusNode, "Ð¡Ð¿Ð°ÑÐ¸Ð±Ð¾! ÐÑÐ²ÐµÑ ÑÑÐ¿ÐµÑÐ½Ð¾ Ð¾ÑÐ¿ÑÐ°Ð²Ð»ÐµÐ½.");
    } catch (error) {
      setFormStatus(
        statusNode,
        "ÐÐµ ÑÐ´Ð°Ð»Ð¾ÑÑ Ð¾ÑÐ¿ÑÐ°Ð²Ð¸ÑÑ. ÐÑÐ¾Ð²ÐµÑÑÑÐµ URL endpoint Ð´Ð»Ñ Google Sheets.",
        true
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function sendRsvp(payload) {
  const endpoint = (WEDDING_CONFIG.rsvpEndpoint || "").trim();
  if (!endpoint || endpoint.includes("PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
    throw new Error("RSVP endpoint not configured.");
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`RSVP send failed: ${response.status}`);
  }
}

function setFormStatus(node, message, isError = false) {
  node.textContent = message;
  node.style.color = isError ? "#a74728" : "#83563a";
}


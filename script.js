const WEDDING_CONFIG = {
  eventDate: "2026-03-21T16:00:00+09:00",
  rsvpEndpoint: "https://script.google.com/macros/s/AKfycbx--igPMqd9N9PZfJdTu-Egi76KTj0cP-1z6oKMrO7BYulcpBRnokptAvZ7Zedka28e/exec"
};

initRevealAnimation();
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

function initMusicToggle() {
  const button = document.getElementById("musicToggle");
  const audio = document.getElementById("weddingMusic");
  const label = button?.querySelector(".music-toggle__label");
  if (!button || !audio || !label) {
    return;
  }

  audio.volume = 0.35;

  audio.addEventListener("error", () => {
    label.textContent = "Музыка недоступна";
  });

  button.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        if (audio.readyState === 0) {
          audio.load();
        }
        await audio.play();
        button.setAttribute("aria-pressed", "true");
        label.textContent = "Выключить музыку";
      } catch (error) {
        label.textContent = "Музыка недоступна";
      }
      return;
    }

    audio.pause();
    button.setAttribute("aria-pressed", "false");
    label.textContent = "Включить свадебную музыку";
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
    setFormStatus(statusNode, "Отправляем ответ...");

    try {
      await sendRsvp(payload);
      form.reset();
      setFormStatus(statusNode, "Спасибо! Ответ успешно отправлен.");
    } catch (error) {
      setFormStatus(
        statusNode,
        "Не удалось отправить. Проверьте URL endpoint для Google Sheets.",
        true
      );
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function sendRsvp(payload) {
  const endpoint = (WEDDING_CONFIG.rsvpEndpoint || "").trim();
  if (!endpoint || endpoint.includes("PASTE_DEPLOYMENT_ID")) {
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

  let result = null;
  try {
    result = await response.json();
  } catch (error) {
    throw new Error("RSVP backend returned invalid JSON.");
  }

  if (!result || result.ok !== true) {
    throw new Error(result && result.error ? result.error : "RSVP backend returned an error.");
  }
}

function setFormStatus(node, message, isError = false) {
  node.textContent = message;
  node.style.color = isError ? "#a74728" : "#83563a";
}


"use strict";

// CONFIGURACIÓN: el MP4 tiene que existir en esta ruta del REPOSITORIO
// que está publicado en GitHub Pages. Mayúsculas y minúsculas importan.
// Ejemplo: PS2-PORTATIL/img/ps2-intro.mp4
const VIDEO_PATH = "img/ps2-intro.mp4";

// Este número es un CONTACTO para consultar aportes; no se ha confirmado
// que esté registrado en una plataforma de pago concreta.
const SUPPORT_PHONE = "3015656700";
const FUNDING_URL = ""; // Opcional: enlace de pago verificado con HTTPS.

const intro = document.getElementById("intro");
const introContent = document.getElementById("intro-content");
const introPlayer = document.getElementById("intro-player");
const introVideo = document.getElementById("intro-video");
const startBtn = document.getElementById("start-btn");
const retryBtn = document.getElementById("retry-btn");
const skipBtn = document.getElementById("skip-btn");
const audioBtn = document.getElementById("audio-btn");
const videoStatus = document.getElementById("video-status");
const site = document.getElementById("site");

let introFinished = false;
let loadingWatchdog = null;

function videoFileUrl() {
  // Usa la URL del documento actual para funcionar también en GitHub Pages
  // dentro de /PS2-PORTATIL/, en lugar de buscar el archivo en /img/.
  return new URL(VIDEO_PATH, document.baseURI).href;
}

function setVideoMessage(message, isError = false) {
  videoStatus.hidden = !message;
  videoStatus.textContent = message;
  videoStatus.classList.toggle("is-error", isError);
  retryBtn.hidden = !isError;
}

function clearWatchdog() {
  if (loadingWatchdog !== null) {
    window.clearTimeout(loadingWatchdog);
    loadingWatchdog = null;
  }
}

function videoFailed(reason) {
  if (introFinished) return;
  clearWatchdog();
  console.warn("PS2 Swing: error al cargar vídeo", videoFileUrl(), reason);
  setVideoMessage(
    "No se pudo reproducir la intro. Comprueba que exista '" +
    VIDEO_PATH +
    "' en este repositorio y que sea un MP4 H.264/AAC. Puedes pulsar REINTENTAR o SALTAR INTRO.",
    true
  );
}

function enterSite() {
  if (introFinished) return;
  introFinished = true;
  clearWatchdog();
  introVideo.pause();
  intro.classList.add("is-leaving");
  site.hidden = false;
  document.body.classList.remove("intro-open");
  window.scrollTo({ top: 0, behavior: "instant" });
  const finish = () => { intro.hidden = true; };
  intro.addEventListener("transitionend", finish, { once: true });
  window.setTimeout(finish, 850);
}

function startVideo() {
  if (introFinished) return;
  startBtn.disabled = true;
  introContent.classList.add("has-started");
  introPlayer.hidden = false;
  setVideoMessage("Cargando introducción…");
  clearWatchdog();

  // La ruta se aplica al pulsar START. La reproducción se solicita dentro
  // del clic real, como requieren los navegadores móviles.
  if (introVideo.src !== videoFileUrl()) {
    introVideo.src = videoFileUrl();
  }
  introVideo.muted = true;
  audioBtn.textContent = "ACTIVAR SONIDO";
  introVideo.load();

  loadingWatchdog = window.setTimeout(() => {
    if (!introFinished && introVideo.paused) {
      videoFailed("Tiempo de carga agotado");
    }
  }, 12000);

  const playback = introVideo.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch((err) => videoFailed(err?.message || "Reproducción rechazada"));
  }
}

startBtn.addEventListener("click", startVideo);
retryBtn.addEventListener("click", startVideo);
skipBtn.addEventListener("click", enterSite);
introVideo.addEventListener("playing", () => {
  clearWatchdog();
  setVideoMessage("");
});
introVideo.addEventListener("waiting", () => {
  if (!introFinished) setVideoMessage("Cargando vídeo…");
});
introVideo.addEventListener("error", () => {
  videoFailed("Error del archivo multimedia: " + (introVideo.error?.code || "desconocido"));
});
introVideo.addEventListener("ended", enterSite);
audioBtn.addEventListener("click", () => {
  introVideo.muted = !introVideo.muted;
  audioBtn.textContent = introVideo.muted ? "ACTIVAR SONIDO" : "SILENCIAR";
  audioBtn.setAttribute("aria-label", audioBtn.textContent.toLowerCase());
});

// TARJETAS: se revela una por clic, junto a las anteriores.
const cards = Array.from(document.querySelectorAll(".feature-card"));
const viewport = document.getElementById("feature-viewport");
const revealBtn = document.getElementById("reveal-btn");
const count = document.getElementById("feature-counter");
const revealHint = document.getElementById("reveal-hint");
let revealedCount = 1;

revealBtn.addEventListener("click", () => {
  if (revealedCount >= cards.length) return;
  const card = cards[revealedCount];
  card.hidden = false;
  requestAnimationFrame(() => {
    card.classList.add("is-revealed");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto" : "smooth";
    viewport.scrollTo({
      left: card.offsetLeft - cards[0].offsetLeft,
      behavior: motion
    });
  });
  revealedCount += 1;
  count.innerHTML = String(revealedCount).padStart(2, "0") +
    ' <span>/ ' + String(cards.length).padStart(2, "0") + "</span>";
  if (revealedCount === cards.length) {
    revealBtn.disabled = true;
    revealBtn.innerHTML = 'TODAS LAS CARACTERÍSTICAS REVELADAS <span aria-hidden="true">✓</span>';
    revealHint.textContent = "DESLIZA LAS TARJETAS PARA EXPLORARLAS";
  }
});

// APORTES VOLUNTARIOS: se muestra el número y se puede copiar.
const supportModal = document.getElementById("support-modal");
const supportBtn = document.getElementById("support-btn");
const closeModal = document.getElementById("close-modal");
const dismissModal = document.getElementById("modal-dismiss");
const donateLink = document.getElementById("donate-link");
const fundingNotice = document.getElementById("funding-notice");
const copyPhoneBtn = document.getElementById("copy-phone-btn");
const copyPhoneStatus = document.getElementById("copy-phone-status");

if (/^https:\/\/[^\s]+$/i.test(FUNDING_URL)) {
  donateLink.href = FUNDING_URL;
  donateLink.hidden = false;
  fundingNotice.hidden = true;
}

copyPhoneBtn.addEventListener("click", async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(SUPPORT_PHONE);
    } else {
      const temporary = document.createElement("textarea");
      temporary.value = SUPPORT_PHONE;
      temporary.setAttribute("readonly", "");
      temporary.style.position = "fixed";
      temporary.style.opacity = "0";
      document.body.appendChild(temporary);
      temporary.select();
      const copied = document.execCommand("copy");
      temporary.remove();
      if (!copied) throw new Error("No se pudo copiar");
    }
    copyPhoneStatus.textContent = "¡Número copiado!";
  } catch (err) {
    copyPhoneStatus.textContent = "Cópialo manualmente: 301 565 6700";
  }
});

supportBtn.addEventListener("click", () => supportModal.showModal());
closeModal.addEventListener("click", () => supportModal.close());
dismissModal.addEventListener("click", () => supportModal.close());
supportModal.addEventListener("click", (event) => {
  if (event.target === supportModal) supportModal.close();
});

document.getElementById("year").textContent = new Date().getFullYear();

const heroImage = document.querySelector(".hero-console");
function showHeroFallback() {
  heroImage.style.display = "none";
  heroImage.parentElement.classList.add("missing-photo");
}
heroImage.addEventListener("error", showHeroFallback);
if (heroImage.complete && heroImage.naturalWidth === 0) showHeroFallback();

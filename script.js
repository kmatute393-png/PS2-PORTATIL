
'use strict';

// CONFIGURACIÓN: coloca aquí el enlace oficial de tu plataforma
// de aportes. Si está vacío, se mostrará que los aportes
// todavía no están disponibles.
const FUNDING_URL = '';

const intro = document.getElementById('intro');
const introContent = document.getElementById('intro-content');
const introPlayer = document.getElementById('intro-player');
const introVideo = document.getElementById('intro-video');
const startBtn = document.getElementById('start-btn');
const skipBtn = document.getElementById('skip-btn');
const audioBtn = document.getElementById('audio-btn');
const site = document.getElementById('site');

let introFinished = false;

function enterSite() {
  if (introFinished) return;

  introFinished = true;
  introVideo.pause();
  intro.classList.add('is-leaving');
  site.hidden = false;
  document.body.classList.remove('intro-open');

  window.scrollTo({ top: 0, behavior: 'instant' });

  const finish = () => {
    intro.hidden = true;
  };

  intro.addEventListener('transitionend', finish, {
    once: true
  });

  window.setTimeout(finish, 850);
}

// Botón START: reproduce el vídeo antes de mostrar la web.
startBtn.addEventListener('click', async () => {
  if (introFinished || startBtn.disabled) return;

  startBtn.disabled = true;
  introContent.classList.add('has-started');
  introPlayer.hidden = false;
  introVideo.muted = true;

  introVideo.addEventListener('ended', enterSite, {
    once: true
  });

  introVideo.addEventListener('error', enterSite, {
    once: true
  });

  try {
    await introVideo.play();
    introPlayer.classList.add('is-playing');
  } catch (error) {
    console.info('Vídeo no disponible; se abre el contenido.', error);
    enterSite();
  }
});

// Botón para saltar la introducción.
skipBtn.addEventListener('click', enterSite);

// Activar o desactivar sonido del vídeo.
audioBtn.addEventListener('click', () => {
  introVideo.muted = !introVideo.muted;

  audioBtn.textContent = introVideo.muted
    ? 'ACTIVAR SONIDO'
    : 'SILENCIAR';

  audioBtn.setAttribute(
    'aria-label',
    audioBtn.textContent.toLowerCase()
  );
});

// TARJETAS INTERACTIVAS
// Aparece una tarjeta inicialmente.
// Cada clic revela otra dentro del carril horizontal.

const cards = Array.from(
  document.querySelectorAll('.feature-card')
);

const viewport = document.getElementById('feature-viewport');
const revealBtn = document.getElementById('reveal-btn');
const count = document.getElementById('feature-counter');
const revealHint = document.getElementById('reveal-hint');

let revealedCount = 1;

revealBtn.addEventListener('click', () => {
  if (revealedCount >= cards.length) return;

  const card = cards[revealedCount];
  card.hidden = false;

  requestAnimationFrame(() => {
    card.classList.add('is-revealed');

    const motion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches ? 'auto' : 'smooth';

    viewport.scrollTo({
      left: card.offsetLeft - viewport.offsetLeft - 12,
      behavior: motion
    });
  });

  revealedCount += 1;

  count.innerHTML =
    String(revealedCount).padStart(2, '0') +
    ' <span>/ ' +
    String(cards.length).padStart(2, '0') +
    '</span>';

  if (revealedCount === cards.length) {
    revealBtn.disabled = true;

    revealBtn.innerHTML =
      'TODAS LAS CARACTERÍSTICAS REVELADAS ' +
      '<span aria-hidden="true">✓</span>';

    revealHint.textContent =
      'DESLIZA LAS TARJETAS PARA EXPLORARLAS';
  }
});

// PANEL DE APORTES VOLUNTARIOS

const supportModal = document.getElementById('support-modal');
const supportBtn = document.getElementById('support-btn');
const closeModal = document.getElementById('close-modal');
const dismissModal = document.getElementById('modal-dismiss');
const donateLink = document.getElementById('donate-link');
const fundingNotice = document.getElementById('funding-notice');

if (/^https:\/\/[^\s]+$/i.test(FUNDING_URL)) {
  donateLink.href = FUNDING_URL;
  donateLink.hidden = false;
  fundingNotice.hidden = true;

  document.querySelector(
    '#support-modal .modal-inner>p'
  ).textContent =
    'Puedes apoyar el desarrollo con un aporte voluntario. ' +
    'El monto lo eliges directamente en la plataforma de pagos segura. ' +
    'No es una compra ni reserva.';
}

supportBtn.addEventListener('click', () => {
  supportModal.showModal();
});

closeModal.addEventListener('click', () => {
  supportModal.close();
});

dismissModal.addEventListener('click', () => {
  supportModal.close();
});

supportModal.addEventListener('click', (event) => {
  if (event.target === supportModal) {
    supportModal.close();
  }
});

// Año automático en el pie de página.
document.getElementById('year').textContent =
  new Date().getFullYear();

// Imagen de respaldo si falta la fotografía de la consola.
const heroImage = document.querySelector('.hero-console');

function showHeroFallback() {
  heroImage.style.display = 'none';
  heroImage.parentElement.classList.add('missing-photo');
}

heroImage.addEventListener('error', showHeroFallback);

if (heroImage.complete && heroImage.naturalWidth === 0) {
  showHeroFallback();
}

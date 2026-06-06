/**
 * transitions.js — Système de transition de page T & F
 * Portes navy qui se ferment/ouvrent entre chaque navigation.
 * Le titre de la page de destination s'affiche sur les portes fermées.
 */
(function () {
  'use strict';

  const KEY = 'cgm_t'; // sessionStorage: nom du fichier de destination

  const PAGES = {
    'index.html':    { eyebrow: 'Accueil',             title: 'T & F' },
    'roles.html':    { eyebrow: 'Les 30 missions',      title: "Rôles d'Honneur" },
    'quiz.html':     { eyebrow: 'Votre profil',          title: 'Questionnaire' },
    'resultat.html': { eyebrow: 'Vos correspondances',   title: 'Mes Résultats' },
    '':              { eyebrow: 'Accueil',               title: 'T & F' },
  };

  function filename(href) {
    const p = href.replace(/[?#].*/, '').replace(/.*\//, '');
    return p || 'index.html';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const ov    = document.getElementById('t-overlay');
    if (!ov) return;

    const doorL  = ov.querySelector('.t-door-l');
    const doorR  = ov.querySelector('.t-door-r');
    const eyeEl  = document.getElementById('t-eyebrow');
    const ttlEl  = document.getElementById('t-title');

    /* ── Helpers ── */
    function setMeta(fname) {
      const m = PAGES[fname] || PAGES['index.html'];
      if (eyeEl) eyeEl.textContent = m.eyebrow;
      if (ttlEl) ttlEl.textContent = m.title;
    }

    function openDoors(delay) {
      setTimeout(function () {
        ov.dataset.state = 'opening';
        /* Après la fin d'animation, cacher l'overlay */
        function onEnd(e) {
          if (e.propertyName !== 'transform') return;
          doorR.removeEventListener('transitionend', onEnd);
          delete ov.dataset.state;
          ov.style.pointerEvents = 'none';
        }
        doorR.addEventListener('transitionend', onEnd);
      }, delay || 0);
    }

    function closeDoors(onClosed) {
      ov.style.pointerEvents = 'all';
      ov.dataset.state = 'closing';
      setTimeout(onClosed, 780);
    }

    /* ── Arrivée sur la page via transition ── */
    const from = sessionStorage.getItem(KEY);
    if (from) {
      sessionStorage.removeItem(KEY);
      setMeta(from);
      /* L'attribut data-trans-in (posé par l'inline script en tête de page)
         a déjà forcé les portes en position fermée sans transition.
         On retire l'attribut puis on ouvre. */
      ov.dataset.state = 'closed';
      document.documentElement.removeAttribute('data-trans-in');
      openDoors(420); /* petite pause pour laisser le titre se lire */
    } else {
      /* Pas de transition entrante — s'assurer que l'overlay est invisible */
      ov.style.pointerEvents = 'none';
    }

    /* ── Interception des liens internes ── */
    document.addEventListener('click', function (e) {
      /* Ne pas intercepter si modifier key */
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const a = e.target.closest('a[href]');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href) return;
      if (/^(#|https?:|mailto:|tel:|javascript)/i.test(href)) return;

      e.preventDefault();
      e.stopPropagation();

      const fname = filename(href);
      setMeta(fname);

      sessionStorage.setItem(KEY, fname);

      closeDoors(function () {
        window.location.href = href;
      });
    }, true /* capture = intercepte avant les autres handlers */);
  });
}());

/**
 * Prototype 1 v3: Scrollverhaal als kapotte feed
 *
 * v2: dissolution while in viewport, glitch.css wired, permanent failures,
 *     segment 6 softer scramble, progressive darkening, reduced-motion support
 * v3 (design jury): DM Sans + IBM Plex Mono, Volgend tab corruption,
 *     ghost data in HTTP/DevTools register, final segment plain-language ending,
 *     nav stays white (only Volgend text corrupts), ghost border 1px
 */

(function () {
  'use strict';

  // ---- GHOST DATA: HTTP/DevTools register ----
  // Reference: what platforms look like from behind. Not a hacker terminal.
  // DevTools Network panel, server access logs, platform API responses.
  // The clinical precision of bureaucratic logging is more unsettling than red text.
  const ghostData = [
    `GET /segment/0 HTTP/1.1
x-session: anon-4e7f2a
x-viewport-duration: 4.2s
x-scroll: continue
x-retained: false
// inhoud verwerkt. geen kopie aangemaakt.`,

    `POST /transcript HTTP/1.1 → 206 Partial Content
{"duration_s": 31.4, "words": 47, "confidence": 0.91}
DROPPED: {"silence": "2.1s", "breath": "0.4s", "restart": 1}
// alleen woorden bewaard. aarzeling valt buiten het schema.`,

    `POST /moderation/classify HTTP/1.1 → 200 OK
{"segment": 2, "format_check": "FAIL"}
violations: ["stilte_count: 3 > max: 0", "pacing: below_threshold"]
action: deprioritize
// het formaat heeft geen ruimte voor stilte.`,

    `GET /recommend?segment=3 HTTP/1.1 → 200 OK
{"hook_window_ms": 3000, "complexity": 0.81}
{"rewatch_probability": 0.04, "action": "suppress"}
// het algoritme wil herkenning. dit bood iets anders.`,

    `console.log("segment_4") → processed
  hapering: true          // intentional
  weigering: true         // intentional
  verdwijning: true       // intentional
// dit is geen bug. dit is het punt.`,

    `GET /content/segment_5 HTTP/1.1 → 410 Gone
Cache-Control: no-store
viewer_memory: 0B | platform_cache: 2.4kB
// je hebt het gezien. het systeem herinnert het zich. jij niet.`,

    // Segment 6: mother / Arabic — different register. A failed transcription job,
    // not a content moderation pipeline. More broken. The Arabic line stays.
    `transcription_job_id: voice_note_47
status: COMPLETE_WITH_ERRORS
detected_language: ar-MA → nl-NL

LOST: intonatie (niet transcribeerbaar)
LOST: stilte voor "opa" (1.8s, geen schema-equivalent)
LOST: de pauze daarna

سؤال: كيف تترجم صوت أمك؟
// geen antwoord beschikbaar.`,

    `console.warn("narrative_integrity") → undefined
console.log("frictie is geen stijl")
console.log("frictie is wat overblijft na filtering")
  stilte: verwijderd
  aarzeling: verwijderd
  breuk: verwijderd
// ook dit wordt gewist.`,

    `GET /session/current HTTP/1.1 → 200 OK
{"segments_read": 9, "segments_retained": 0}
{"shareable": false, "stored": "nowhere"}
// het was er alleen toen jij keek.`,

    // Final segment 9: the system drops its technical register entirely.
    // No brackets, no status codes. Plain language. Long silence before it arrives.
    `segmenten gelezen: 10
segmenten bewaard: 0

scroll terug als je wilt.
het verhaal is er niet meer.

er zijn alleen sporen.
tijdcodes. foutmeldingen.
bewijs dat er iets was.`,
  ];

  // ---- REDUCED MOTION ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- TEKST SCRAMBLE ----
  const scrambleChars = '█▓▒░╔╗╚╝║═╬╣╠╦╩▄▀■□▪▫●○◆◇';
  const scrambleCharsSoft = '░▒▓ ─ ╌ ╎ · ∙ • ◦ ○ ◌ ∘';

  function scrambleText(element, opts, callback) {
    const isSoft = opts && opts.soft;
    const chars = isSoft ? scrambleCharsSoft : scrambleChars;
    const maxIterations = isSoft ? 20 : 12;
    const intervalMs = isSoft ? 80 : 50;

    const original = element.textContent;
    const length = original.length;
    let iteration = 0;

    element.setAttribute('data-text', original);
    element.classList.add('glitch-text');

    const interval = setInterval(() => {
      element.textContent = original
        .split('')
        .map((char, i) => {
          if (char === ' ') return ' ';
          const threshold = (iteration / maxIterations) * length;
          if (i < threshold) {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        })
        .join('');

      iteration++;

      if (iteration > maxIterations) {
        clearInterval(interval);
        element.classList.remove('glitch-text');
        element.removeAttribute('data-text');
        if (callback) callback();
      }
    }, intervalMs);
  }

  // ---- STATE ----
  const segments = document.querySelectorAll('.segment');
  const dissolvedSet = new Set();
  const scramblingSet = new Set();
  let totalWordsLost = 0;
  let totalSegmentsGone = 0;

  const wordCounts = [];
  segments.forEach(seg => {
    const p = seg.querySelector('.segment-content p');
    wordCounts.push(p ? p.textContent.split(/\s+/).length : 0);
  });

  // ---- UI ELEMENTS ----
  const progressBar = document.getElementById('progressBar');
  const progressLabel = document.getElementById('progressLabel');
  const wordsLostEl = document.getElementById('wordsLost');
  const segmentsGoneEl = document.getElementById('segmentsGone');
  const footerSystem = document.getElementById('footerSystem');
  const nav = document.querySelector('.platform-nav');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const tabVolgend = document.getElementById('tabVolgend');

  // ---- PROGRESS BAR ----
  function updateProgress() {
    const remaining = Math.max(0, 100 - (totalSegmentsGone / segments.length) * 100);
    const rounded = Math.round(remaining);
    progressBar.style.width = remaining + '%';
    progressLabel.textContent = rounded + '% beschikbaar';

    if (rounded < 30) {
      progressLabel.style.color = '#b5a07a';
    }
    if (totalSegmentsGone > segments.length / 2) {
      progressBar.classList.add('bar-fading');
    }
  }

  // ---- STATS ----
  function updateStats() {
    wordsLostEl.textContent = totalWordsLost;
    segmentsGoneEl.textContent = totalSegmentsGone;
  }

  // ---- PROGRESSIVE DARKENING ----
  let navHasGlitched = false;

  function updateDarkening() {
    const gone = totalSegmentsGone;
    if (gone >= 2 && !document.body.classList.contains('darkening')) {
      document.body.classList.add('darkening');
    }
    document.body.setAttribute('data-dark', Math.min(gone, segments.length));

    // At 4 segments gone: nav chrome gets glitching class.
    // The nav background stays white (CSS only targets the Volgend tab).
    // Platform infrastructure is immune — only what you said is at risk.
    if (gone >= 4 && !navHasGlitched) {
      navHasGlitched = true;
      nav.classList.add('glitching');
      if (tabVolgend) {
        tabVolgend.textContent = 'ERR_NEXT';
      }
    }
  }

  // ---- GLITCH FLASH ----
  function triggerGlitchFlash() {
    if (prefersReducedMotion) return;
    const flash = document.createElement('div');
    flash.className = 'glitch-flash';
    document.body.appendChild(flash);
    flash.addEventListener('animationend', () => flash.remove());
  }

  // ---- GHOST VULLEN ----
  function populateGhost(segment, index) {
    const ghost = segment.querySelector('.segment-ghost');
    if (!ghost || ghost.textContent.trim() !== '') return;
    ghost.textContent = ghostData[index] || ghostData[ghostData.length - 1];
  }

  // ---- DISSOLVE ----
  function dissolveSegment(segment, index) {
    if (dissolvedSet.has(index) || scramblingSet.has(index)) return;
    scramblingSet.add(index);

    const p = segment.querySelector('.segment-content p');
    segment.classList.add('scrambling');
    segment.classList.remove('dissolving');

    if (prefersReducedMotion) {
      dissolvedSet.add(index);
      scramblingSet.delete(index);
      segment.classList.remove('scrambling');
      segment.classList.add('dissolved');
      populateGhost(segment, index);
      totalWordsLost += wordCounts[index];
      totalSegmentsGone++;
      updateProgress();
      updateStats();
      updateDarkening();
      return;
    }

    const isSoftSegment = index === 6;
    scrambleText(p, { soft: isSoftSegment }, () => {
      dissolvedSet.add(index);
      scramblingSet.delete(index);
      segment.classList.remove('scrambling');
      segment.classList.add('dissolved');
      populateGhost(segment, index);
      triggerGlitchFlash();

      totalWordsLost += wordCounts[index];
      totalSegmentsGone++;
      updateProgress();
      updateStats();
      updateDarkening();
      track({ type: 'segment_dissolved', segment: index, wordsLost: wordCounts[index] });
      if (totalSegmentsGone === segments.length) {
        track({ type: 'session_complete', segmentsRead: totalSegmentsGone });
      }
    });
  }

  // ---- SCROLL CHECK ----
  // v2+: dissolution fires while segment is still readable.
  // The reader's act of scrolling causes the erasure — not a delayed consequence.
  function checkSegments() {
    const vh = window.innerHeight;

    segments.forEach((segment, index) => {
      const rect = segment.getBoundingClientRect();

      if (rect.bottom < vh * 0.55 && rect.bottom > 0
          && !dissolvedSet.has(index) && !scramblingSet.has(index)) {
        segment.classList.add('dissolving');
      }

      if (rect.bottom < vh * 0.3 && rect.bottom > -50
          && !dissolvedSet.has(index) && !scramblingSet.has(index)) {
        dissolveSegment(segment, index);
      }

      if (rect.bottom < -20 && !dissolvedSet.has(index) && !scramblingSet.has(index)) {
        dissolveSegment(segment, index);
      }
    });
  }

  // ---- SCROLL HANDLER ----
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        checkSegments();
        ticking = false;
      });
      ticking = true;
    }

    if (scrollIndicator && window.scrollY > 100) {
      scrollIndicator.style.opacity = '0';
      scrollIndicator.style.transition = 'opacity 0.5s';
    }
  }, { passive: true });

  // ---- ENGAGEMENT BUTTONS ----
  document.querySelectorAll('.ui-heart').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('liked');
      const count = btn.querySelector('.heart-count');
      count.textContent = btn.classList.contains('liked')
        ? (totalWordsLost || 1)
        : 0;
      const seg = btn.closest('.segment');
      track({ type: 'engagement', action: 'heart', segment: seg ? Number(seg.dataset.segment) : -1 });
    });
  });

  document.querySelectorAll('.ui-comment').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('comment-done')) return;

      const segment = btn.closest('.segment');
      const segmentUI = btn.closest('.segment-ui');
      let inputWrap = segment.querySelector('.comment-input-wrap');

      if (!inputWrap) {
        inputWrap = document.createElement('div');
        inputWrap.className = 'comment-input-wrap';

        const field = document.createElement('input');
        field.type = 'text';
        field.className = 'comment-field';
        field.placeholder = 'Schrijf een reactie...';
        field.autocomplete = 'off';

        const sendBtn = document.createElement('button');
        sendBtn.className = 'comment-send';
        sendBtn.setAttribute('aria-label', 'Verzenden');

        const sendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sendSvg.setAttribute('width', '16');
        sendSvg.setAttribute('height', '16');
        sendSvg.setAttribute('viewBox', '0 0 24 24');
        sendSvg.setAttribute('fill', 'none');
        sendSvg.setAttribute('stroke', 'currentColor');
        sendSvg.setAttribute('stroke-width', '2');
        sendSvg.setAttribute('stroke-linecap', 'round');
        sendSvg.setAttribute('stroke-linejoin', 'round');
        sendSvg.setAttribute('aria-hidden', 'true');
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', '22'); line.setAttribute('y1', '2');
        line.setAttribute('x2', '11'); line.setAttribute('y2', '13');
        const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        poly.setAttribute('points', '22 2 15 22 11 13 2 9 22 2');
        sendSvg.appendChild(line);
        sendSvg.appendChild(poly);
        sendBtn.appendChild(sendSvg);

        inputWrap.appendChild(field);
        inputWrap.appendChild(sendBtn);
        segmentUI.insertAdjacentElement('afterend', inputWrap);

        function submitComment() {
          const text = field.value.trim();
          if (!text) return;

          inputWrap.style.display = 'none';
          btn.classList.add('comment-done');

          const bubble = document.createElement('p');
          bubble.className = 'comment-bubble';
          bubble.textContent = text;
          inputWrap.after(bubble);

          const segEl = btn.closest('.segment');
          track({ type: 'comment', text, segment: segEl ? Number(segEl.dataset.segment) : -1 });

          function afterScramble() {
            bubble.remove();
            const ghost = document.createElement('p');
            ghost.className = 'comment-ghost';
            ghost.textContent = '// reactie verwerkt. niet bewaard voor jou.';
            inputWrap.after(ghost);
            setTimeout(() => {
              ghost.style.transition = 'opacity 1.5s ease';
              ghost.style.opacity = '0';
              setTimeout(() => ghost.remove(), 1500);
            }, 3000);
          }

          setTimeout(() => {
            if (prefersReducedMotion) { afterScramble(); return; }
            scrambleText(bubble, {}, () => { bubble.remove(); afterScramble(); });
          }, 2500);
        }

        sendBtn.addEventListener('click', submitComment);
        field.addEventListener('keydown', e => { if (e.key === 'Enter') submitComment(); });
      }

      const isShown = inputWrap.style.display === 'flex';
      inputWrap.style.display = isShown ? 'none' : 'flex';
      if (!isShown) inputWrap.querySelector('.comment-field').focus();
    });
  });

  document.querySelectorAll('.ui-share').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('share-failed')) return;
      btn.classList.add('share-failed');
    });
  });

  document.querySelectorAll('.ui-save').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('save-failed')) return;
      btn.classList.add('save-failed');
    });
  });

  // ---- ANALYTICS ----
  const ANALYTICS = 'https://ops.wedowe.org/frictie/event';

  function track(payload) {
    fetch(ANALYTICS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }

  // ---- FOOTER ----
  function setFooterSystem() {
    footerSystem.textContent =
      `[SYS] ${new Date().toISOString()} | prototype: scrollverhaal_v3 | ` +
      `format: feed_die_zichzelf_wist | status: actief | ` +
      `Stimuleringsfonds Creatieve Industrie, Startregeling 2025`;
  }
  setFooterSystem();

  // ---- INIT ----
  updateProgress();
  updateStats();
  checkSegments();

})();

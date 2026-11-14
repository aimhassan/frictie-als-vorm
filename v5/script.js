/*
 * Frictie als Vorm, scrollverhaal versie 5
 *
 * Een post per scherm, zoals in een feed. De regel, voor iedereen dezelfde en op elk scherm:
 *   een post vervaagt zodra de onderkant van de tekst de helft van het scherm passeert,
 *   en wordt gewist zodra die het bovenste derde bereikt. Alleen wat op je scherm stond,
 *   kan verdwijnen.
 *
 * Wat overblijft is een spoor in twee delen:
 *   simulatie  het platformlog uit versie 2, woord voor woord, nu gelabeld als simulatie;
 *   gemeten    wat er bij deze lezing echt gebeurde, uitgerekend in deze browser.
 * Zo staat naast de fout de correctie.
 *
 * Dit bestand bevat geen netwerkcode. Er wordt niets verstuurd en niets opgeslagen
 * buiten het geheugen van dit tabblad. Wie het tabblad sluit, wist ook de sporen.
 */

(function () {
  'use strict';

  // ---- SIMULATIE: het platformlog uit versie 2, ongewijzigd ----
  // Verzonnen platformtaal, geen meting. Daarom staat het in versie 3 altijd
  // onder het label "simulatie", met de echte meting ernaast.
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
{"segment": 2, "genre_verwacht": "liefdesfilm", "genre_gevonden": "onbekend"}
violations: ["camera_richting: maker", "plot: afgeweken"]
action: deprioritize
// verwacht: liefdesfilm. gevonden: iets anders.`,

    `GET /analytics/video?segment=3 HTTP/1.1 → 200 OK
{"avg_watch_time_s": 2.4, "drop_off_3s": 0.71}
{"suggestion": "hook earlier", "action": "suppress"}
// te traag voor het venster. niet aanbevolen.`,

    `console.log("segment_4") → processed
  hapering: true          // intentional
  weigering: true         // intentional
  verdwijning: true       // intentional
// geen fout gevonden. zo bedoeld.`,

    `GET /content/segment_5 HTTP/1.1 → 410 Gone
Cache-Control: no-store
viewer_memory: 0B | platform_cache: 2.4kB
// kopie bij platform: ja. kopie bij lezer: nee.`,

    // Segment 6 (de zevende alinea, de moeder): een mislukte transcriptie, zachter en trager gewist.
    // Fictie, zoals het hele log, en daarom gelabeld als simulatie. Aiman, 14 nov 2026: "I dont mind
    // any fiction elements if they are to strengthen the story." Na de review van p22-worker was dit
    // log kort ingekort; op zijn besluit staat het weer woord voor woord zoals in versie 2.
    `transcription_job_id: voice_note_47
status: COMPLETE_WITH_ERRORS
detected_language: ar-MA, nl-NL (wisselt binnen een zin)

LOST: intonatie (niet transcribeerbaar)
LOST: stilte voor "opa" (1.8s, geen schema-equivalent)
LOST: de pauze daarna

سؤال: كيف تترجم صوت أمك؟
// geen antwoord beschikbaar.`,

    `console.warn("narrative_integrity") → undefined
console.log("camera: aan")
console.log("schuren: gedetecteerd")
  stilte: verwijderd
  aarzeling: verwijderd
  breuk: verwijderd
// ook dit wordt gewist.`,

    `GET /session/current HTTP/1.1 → 200 OK
{"segments_read": 9, "segments_retained": 0}
{"shareable": false, "stored": "nowhere"}
// geen back-up.`,

    // Final segment 9: the system drops its technical register entirely.
    // No brackets, no status codes. Plain language. Long silence before it arrives.
    `segmenten gelezen: 10
segmenten bewaard: 0

wat overblijft:
tijdcodes. foutmeldingen.`,
  ];

  // ghostData[9] is het slotspoor uit versie 2. In versie 3 verschijnt het onder de feed,
  // zodat het op elk scherm in beeld komt. Het getal "gelezen" wordt gemeten.
  const FAREWELL = 9;

  // De regel
  const FADE_AT = 1 / 2;
  const ERASE_AT = 1 / 3;

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motionQuery.matches;

  // Elke lezing begint bovenaan: sporen overleven geen herlading.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // ---- HULPJES ----
  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const pad = (n) => String(n).padStart(2, '0');

  // 7,9 s  of  1 min 12 s
  function fmtDur(ms) {
    const sec = ms / 1000;
    if (sec < 59.95) return sec.toFixed(1).replace('.', ',') + ' s';
    const total = Math.round(sec);
    return Math.floor(total / 60) + ' min ' + (total % 60) + ' s';
  }

  // Tijdcode vanaf het openen van de pagina: 00:01:42
  function fmtTC(ms) {
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
  }

  const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const $ = (id) => document.getElementById(id);

  // ---- ELEMENTEN ----
  const progressBar = $('progressBar');
  const progressLabel = $('progressLabel');
  const wordsLostEl = $('wordsLost');
  const segmentsGoneEl = $('segmentsGone');
  const footerSystem = $('footerSystem');
  const announcer = $('announcer');
  const farewell = $('farewell');
  const farewellCorrection = $('farewellCorrection');
  const archiveBox = $('archiveBox');
  const archiveList = $('archiveList');
  const manifestNet = $('manifestNet');
  const tabVolgend = $('tabVolgend');
  const nav = document.querySelector('.platform-nav');
  const scrollIndicator = $('scrollIndicator');
  const openedISO = new Date().toISOString();

  // ---- TOESTAND, PER ALINEA ----
  const segs = Array.from(document.querySelectorAll('.segment')).map((node, i) => {
    const p = node.querySelector('.segment-content p');
    const text = p.textContent.trim();
    return {
      node,
      i,
      p,
      text,
      ghost: node.querySelector('.segment-ghost'),
      ui: null,
      words: countWords(text),
      state: 'live', // live | fading | erasing | gone
      armed: false, // heeft boven de wislijn op je scherm gestaan
      visible: false,
      since: null, // sinds wanneer de alinea op het scherm staat
      ms: 0, // tijd op het scherm
      erasedAt: null, // moment van wissen, vanaf het openen van de pagina
      comment: null, // { chars } als de lezer reageerde
      archTrace: null,
    };
  });
  let gone = 0;
  let wordsLost = 0;

  // ---- KNOPPEN ONDER ELKE ALINEA ----
  const tpl = $('tplUI');
  segs.forEach((s) => {
    if (s.node.classList.contains('segment-final')) return;
    s.ui = tpl.content.firstElementChild.cloneNode(true);
    s.node.querySelector('.post-frame').append(s.ui);
  });

  // ---- METEN: hoe lang staat een alinea op je scherm ----
  // Zichtbaar betekent: minstens een pixel onder de platformbalk, terwijl dit tabblad
  // op de voorgrond staat. Of je echt las, meet niemand.
  function startClock(s, now) {
    if (s.since === null && s.visible && !document.hidden) s.since = now;
  }
  function stopClock(s, now) {
    if (s.since !== null) {
      s.ms += now - s.since;
      s.since = null;
    }
  }

  // Op het scherm: minstens een pixel zichtbaar tussen de platformbalk en de onderrand.
  // Een alinea die de onderrand alleen raakt, telt niet.
  const CHROME_H = 51;
  function measure(s, rect, vh, now) {
    const visible = rect.bottom > CHROME_H && rect.top < vh;
    if (visible === s.visible) return;
    s.visible = visible;
    if (visible) startClock(s, now);
    else stopClock(s, now);
  }

  document.addEventListener('visibilitychange', () => {
    const now = performance.now();
    segs.forEach((s) => {
      if (s.state === 'gone') return;
      if (document.hidden) stopClock(s, now);
      else startClock(s, now);
    });
  });

  // ---- NETWERK: tellen wat er na het laden nog over de lijn gaat ----
  function loadMoment() {
    const navEntry = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
    if (navEntry && navEntry.loadEventStart > 0) return navEntry.loadEventStart;
    const t = performance.timing;
    if (t && t.loadEventStart > 0) return t.loadEventStart - t.navigationStart;
    return null;
  }
  function requestsAfterLoad() {
    if (!performance.getEntriesByType) return null;
    const moment = loadMoment();
    if (moment === null) return 0;
    return performance.getEntriesByType('resource').filter((e) => e.startTime >= moment).length;
  }

  function renderSystem() {
    const n = requestsAfterLoad();
    const net = n === null ? 'niet meetbaar in deze browser' : n === 1 ? '1 verzoek' : n + ' verzoeken';
    footerSystem.textContent =
      '[SYS] ' + openedISO + ' | prototype: scrollverhaal | versie: 5 | ' +
      'format: feed_die_zichzelf_wist | status: actief | netwerk na laden: ' + net + ' | ' +
      'Stimuleringsfonds Creatieve Industrie, Startregeling 2025';
    manifestNet.textContent =
      n === null
        ? 'niets door dit stuk. het laden van de pagina gaat via GitHub Pages; tellen na het laden kan deze browser niet.'
        : 'niets door dit stuk. het laden van de pagina gaat via GitHub Pages; daarna geteld door deze pagina: ' + n + (n === 1 ? ' netwerkverzoek.' : ' netwerkverzoeken.');
  }

  // ---- TEKENVERVANGING ----
  // Het systeem schrijft over de tekst heen, van links naar rechts.
  // Segment 6 (de zevende alinea, de moeder) gaat zachter en trager.
  const CHARS = '█▓▒░╔╗╚╝║═╬╣╠╦╩▄▀■□▪▫●○◆◇';
  const CHARS_SOFT = '░▒▓ ─ ╌ ╎ · ∙ • ◦ ○ ◌ ∘';

  function scramble(node, soft, done) {
    const chars = soft ? CHARS_SOFT : CHARS;
    const steps = soft ? 20 : 12;
    const every = soft ? 80 : 50;
    const original = node.textContent;
    const len = original.length;
    let step = 0;
    const timer = window.setInterval(() => {
      const edge = (step / steps) * len;
      let out = '';
      for (let i = 0; i < len; i++) {
        const c = original[i];
        out += c === ' ' || i >= edge ? c : chars[Math.floor(Math.random() * chars.length)];
      }
      node.textContent = out;
      step += 1;
      if (step > steps) {
        window.clearInterval(timer);
        done();
      }
    }, every);
  }

  // ---- WISSEN ----
  function erase(s) {
    if (s.state === 'erasing' || s.state === 'gone') return;
    s.state = 'erasing';
    // Het gat houdt de maat van wat er stond: de tekst onder je verspringt niet.
    const h = s.node.offsetHeight;
    s.node.dataset.h = String(h);
    s.node.style.height = h + 'px';
    s.node.classList.remove('dissolving');
    s.node.classList.add('scrambling');
    if (reduced()) finish(s);
    else scramble(s.p, s.i === 6, () => finish(s));
  }

  function finish(s) {
    const now = performance.now();
    stopClock(s, now);
    s.state = 'gone';
    s.erasedAt = now;

    const hadFocus = s.node.contains(document.activeElement);
    const bottomBefore = s.node.getBoundingClientRect().bottom;
    s.node.style.height = '';
    s.node.style.minHeight = s.node.dataset.h + 'px';
    s.node.classList.remove('scrambling');
    s.node.classList.add('dissolved');
    renderGhost(s);
    // Is het spoor langer dan de tekst was, dan groeit de band naar boven:
    // wat jij nu leest, blijft staan. Werkt ook waar de browser dat niet zelf doet.
    const grew = s.node.getBoundingClientRect().bottom - bottomBefore;
    if (grew > 0.5) window.scrollBy({ top: grew, left: 0, behavior: 'instant' });
    // Focus blijft op dezelfde plek: op het spoor dat de tekst verving.
    if (hadFocus) {
      s.ghost.tabIndex = -1;
      s.ghost.focus({ preventScroll: true });
    }

    gone += 1;
    wordsLost += s.words;
    if (!reduced()) flash();
    updateProgress();
    updateStats();
    updateDarkening();
    updateArchive(s);
    renderSystem();
    announce(s.i);
    if (gone === segs.length) theEnd();
  }

  // ---- HET SPOOR: simulatie, met de meting ernaast ----
  function tagLine(name, note) {
    const p = el('p', 'trace-tag');
    p.append(el('span', 'tag-name', name), el('span', 'sr-only', ': '), ' ', el('span', 'tag-note', note));
    return p;
  }
  function row(dl, term, value) {
    const wrap = el('div');
    wrap.append(el('dt', null, term), el('dd', null, value));
    dl.append(wrap);
  }

  function renderGhost(s) {
    const g = s.ghost;
    g.textContent = '';
    g.append(el('p', 'sr-only', 'Alinea ' + (s.i + 1) + ' is gewist. Wat overblijft:'));

    if (s.i !== FAREWELL && ghostData[s.i]) {
      const sim = el('div', 'trace trace-sim');
      sim.append(tagLine('simulatie', 'geen echt platformlog'));
      const pre = el('pre', 'trace-log');
      const lines = ghostData[s.i].split('\n');
      lines.forEach((line, n) => {
        const span = el('span', 'log-line', line);
        if (/^\s*\/\//.test(line)) span.classList.add('log-comment');
        if (/[؀-ۿ]/.test(line)) {
          span.lang = 'ar';
          span.dir = 'rtl';
        }
        pre.append(span);
        if (n < lines.length - 1) pre.append('\n');
      });
      sim.append(pre);
      g.append(sim);
    }

    const real = el('div', 'trace trace-real');
    real.append(tagLine('gemeten', 'op dit toestel, niets verstuurd'));
    const dl = el('dl', 'trace-data');
    row(dl, 'op je scherm', fmtDur(s.ms));
    row(dl, 'gewist op', fmtTC(s.erasedAt));
    row(dl, 'woorden', String(s.words));
    if (s.comment) row(dl, 'reactie', s.comment.chars + ' tekens, niet verstuurd');
    real.append(dl);
    g.append(real);
    g.hidden = false;
  }

  // ---- VOORTGANG, TELLERS, DONKER ----
  function updateProgress() {
    const left = Math.max(0, 100 - (gone / segs.length) * 100);
    progressBar.style.width = left + '%';
    progressLabel.textContent = Math.round(left) + '% beschikbaar';
    document.body.classList.toggle('low', left < 30);
    progressBar.classList.toggle('bar-fading', gone > segs.length / 2);
  }

  function updateStats() {
    wordsLostEl.textContent = String(wordsLost);
    segmentsGoneEl.textContent = String(gone);
  }

  let navGlitched = false;
  function updateDarkening() {
    if (gone >= 2) document.body.classList.add('darkening');
    document.body.dataset.dark = String(Math.min(gone, segs.length));
    document.body.classList.toggle('is-dark', gone >= 4);
    // Bij vier gewiste alinea's breekt alleen de tab "Volgend". Het chroom zelf blijft wit.
    if (gone >= 4 && !navGlitched) {
      navGlitched = true;
      if (nav) nav.classList.add('glitching');
      if (tabVolgend) tabVolgend.textContent = 'ERR_NEXT';
    }
  }

  function flash() {
    const f = el('div', 'glitch-flash');
    f.setAttribute('aria-hidden', 'true');
    document.body.append(f);
    f.addEventListener('animationend', () => f.remove());
    window.setTimeout(() => f.remove(), 600);
  }

  // ---- MELDINGEN VOOR SCHERMLEZERS ----
  let queued = [];
  let queueTimer = null;
  function say(text) {
    announcer.textContent = '';
    window.setTimeout(() => {
      announcer.textContent = text;
    }, 60);
  }
  function announce(i) {
    queued.push(i + 1);
    window.clearTimeout(queueTimer);
    queueTimer = window.setTimeout(() => {
      const left = Math.round(Math.max(0, 100 - (gone / segs.length) * 100));
      const what = queued.length === 1 ? 'Alinea ' + queued[0] + ' gewist.' : queued.length + " alinea's gewist.";
      say(what + ' Nog ' + left + '% beschikbaar.');
      queued = [];
    }, 700);
  }

  // ---- HET EINDE ----
  function theEnd() {
    // Het slotspoor uit versie 2 blijft woord voor woord. "Gelezen" meet niemand,
    // dus staat de meting ernaast: hoeveel alinea's echt op je scherm stonden.
    const seen = segs.filter((s) => s.ms > 0).length;
    farewell.textContent = ghostData[FAREWELL];
    farewellCorrection.textContent =
      'gemeten: ' + seen + ' van ' + segs.length + " alinea's op je scherm. gelezen: niet te meten.";
    farewell.classList.add('shown');
    farewellCorrection.classList.add('shown');
    farewell.removeAttribute('aria-hidden');
    farewellCorrection.removeAttribute('aria-hidden');
    document.body.classList.add('ended');
  }

  // ---- HET ARCHIEF: de hele tekst, met jouw sporen ----
  function buildArchive() {
    segs.forEach((s) => {
      const li = el('li', 'arch-item');
      const text = el('p', 'arch-text', s.text);
      if (s.node.classList.contains('segment-final')) text.classList.add('arch-final');
      s.archTrace = el('p', 'arch-trace');
      li.append(text, s.archTrace);
      archiveList.append(li);
      updateArchive(s);
    });
  }

  function updateArchive(s) {
    const parts = [];
    if (s.state === 'gone') parts.push('gemeten: op je scherm ' + fmtDur(s.ms), 'gewist op ' + fmtTC(s.erasedAt));
    else parts.push('nog in de feed');
    parts.push(s.words + ' woorden');
    if (s.comment) parts.push('reactie: ' + s.comment.chars + ' tekens, niet verstuurd');
    s.archTrace.textContent = parts.join(' · ');
  }

  function openArchive(moveFocus) {
    // Wie naar de hele tekst springt, slaat de feed over: daardoor wordt niets gewist,
    // ook post 01 niet, al stond die bij het openen in beeld.
    segs.forEach((s) => {
      if (s.state === 'live' || s.state === 'fading') {
        s.armed = false;
        s.state = 'live';
        s.node.classList.remove('dissolving');
      }
    });
    archiveBox.open = true;
    // Direct, zonder animatie: wie springt, slaat de feed over en ziet hem niet voorbij vliegen.
    $('archief').scrollIntoView({ behavior: 'auto', block: 'start' });
    if (moveFocus) $('archiefTitel').focus({ preventScroll: true });
  }

  $('routeLink').addEventListener('click', (event) => {
    event.preventDefault();
    openArchive(true);
  });
  archiveBox.addEventListener('toggle', () => {
    if (!archiveBox.open) return;
    segs.forEach(updateArchive);
    renderSystem();
  });

  // ---- KNOPPEN ----
  function setupButtons(s) {
    const heart = s.ui.querySelector('.ui-heart');
    const count = heart.querySelector('.heart-count');
    heart.addEventListener('click', () => {
      const on = heart.getAttribute('aria-pressed') !== 'true';
      heart.setAttribute('aria-pressed', String(on));
      heart.classList.toggle('liked', on);
      count.textContent = on ? String(wordsLost || 1) : '0';
    });

    [
      ['.ui-share', 'share-failed', 'Delen: niet deelbaar'],
      ['.ui-save', 'save-failed', 'Opslaan: niet op te slaan'],
    ].forEach(([selector, failed, label]) => {
      const b = s.ui.querySelector(selector);
      b.addEventListener('click', () => {
        if (b.classList.contains(failed)) return;
        b.classList.add(failed);
        b.setAttribute('aria-disabled', 'true');
        b.setAttribute('aria-label', label);
      });
    });

    setupComment(s);
  }

  // ---- REACTIE: verschijnt even, wordt overschreven, gaat nergens heen ----
  function setupComment(s) {
    const btn = s.ui.querySelector('.ui-comment');
    let wrap = null;
    let field = null;

    btn.addEventListener('click', () => {
      if (btn.classList.contains('comment-done')) return;
      if (!wrap) {
        wrap = el('div', 'comment-input-wrap');
        wrap.id = 'reactie-' + s.i;
        wrap.hidden = true;
        field = el('input', 'comment-field');
        field.type = 'text';
        field.placeholder = 'Schrijf een reactie...';
        field.autocomplete = 'off';
        field.setAttribute('aria-label', 'Reactie');
        field.setAttribute('enterkeyhint', 'send');
        const send = el('button', 'comment-send');
        send.type = 'button';
        send.setAttribute('aria-label', 'Verzenden');
        send.innerHTML =
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><use href="#i-share"/></svg>';
        wrap.append(field, send);
        s.ui.after(wrap);
        btn.setAttribute('aria-controls', wrap.id);

        const submit = () => submitComment(s, btn, wrap, field);
        send.addEventListener('click', submit);
        field.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            submit();
          }
        });
      }
      const show = wrap.hidden;
      wrap.hidden = !show;
      btn.setAttribute('aria-expanded', String(show));
      if (show) field.focus();
    });
  }

  function submitComment(s, btn, wrap, field) {
    const text = field.value.trim();
    if (!text || s.state === 'gone') return;
    // Alleen het aantal tekens blijft over, als spoor. De tekst zelf nergens.
    s.comment = { chars: Array.from(text).length };
    field.value = '';
    wrap.hidden = true;
    btn.classList.add('comment-done');
    btn.setAttribute('aria-expanded', 'false');

    const bubble = el('p', 'comment-bubble', text);
    bubble.tabIndex = -1;
    wrap.after(bubble);
    bubble.focus({ preventScroll: true });
    updateArchive(s);

    window.setTimeout(() => {
      const replace = () => {
        const hadFocus = document.activeElement === bubble;
        const line = el('p', 'comment-ghost', '// reactie verwerkt. niet bewaard voor jou.');
        const correction = el('p', 'comment-correction', 'correctie: niet verstuurd. nergens opgeslagen.');
        line.tabIndex = -1;
        bubble.replaceWith(line);
        line.after(correction);
        if (hadFocus) line.focus({ preventScroll: true });
        if (s.state !== 'gone') say('Je reactie is gewist. Niets verstuurd.');
      };
      if (reduced() || s.state === 'gone') replace();
      else scramble(bubble, false, replace);
    }, 2500);
  }

  // ---- SCROLLEN ----
  function check() {
    const vh = window.innerHeight;
    const now = performance.now();
    for (const s of segs) {
      if (s.state === 'gone') continue;
      // In een post van een heel scherm telt de tekst zelf, niet de lege ruimte eromheen.
      const rect = s.p.getBoundingClientRect();
      measure(s, rect, vh, now);
      if (s.state === 'erasing') continue;
      const bottom = rect.bottom;
      // Alleen wat op je scherm heeft gestaan, kan verdwijnen. Wie overslaat of springt, wist niets.
      if (s.visible && bottom >= vh * ERASE_AT) s.armed = true;
      if (!s.armed) continue;
      if (bottom < vh * ERASE_AT) {
        erase(s);
      } else if (bottom < vh * FADE_AT) {
        if (s.state === 'live') {
          s.state = 'fading';
          s.node.classList.add('dissolving');
        }
      } else if (s.state === 'fading') {
        // Terugscrollen houdt hem nog even vast. Pas voorbij de lijn is hij weg.
        s.state = 'live';
        s.node.classList.remove('dissolving');
      }
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(() => {
        ticking = false;
        check();
      });
    }
    if (scrollIndicator && window.scrollY > 100) scrollIndicator.classList.add('gone');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // ---- START ----
  segs.forEach((s) => {
    if (s.ui) setupButtons(s);
  });
  buildArchive();
  farewell.textContent = ghostData[FAREWELL]; // houdt de plek vrij, onzichtbaar tot het einde
  farewellCorrection.textContent = "gemeten: 10 van 10 alinea's op je scherm. gelezen: niet te meten.";
  updateProgress();
  updateStats();
  renderSystem();
  window.addEventListener('load', () => {
    renderSystem();
    check();
  });
  if (location.hash === '#archief') window.requestAnimationFrame(() => openArchive(false));
  window.requestAnimationFrame(check);
})();

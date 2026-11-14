#!/usr/bin/env python3
"""Full check of a Frictie als vorm scroll version.

Usage (needs Python with Playwright and Chrome):
    python3 _tests/test_scroll_versions.py <outdir> [path=/v3/] [base_url]
Without base_url it serves this repository locally.
Live: python3 _tests/test_scroll_versions.py out /v3/ https://aimhassan.github.io/frictie-als-vorm

Per screen size (320 to 2560 px wide) and once with reduced motion it reports: paragraphs
erased, the progress label, whether the farewell is in view at the end, layout shift,
network requests after load, requests to other sites and console errors. For /v3 it also
checks the comment, keyboard focus and the reading route. Screenshots and results.json go
to <outdir>.
"""
import json
import os
import socket
import subprocess
import sys
import time
import urllib.request

from playwright.sync_api import sync_playwright

REPO = os.environ.get('FRICTIE_REPO', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = sys.argv[1]
PATH = sys.argv[2] if len(sys.argv) > 2 else '/v3/'
REMOTE = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(OUT, exist_ok=True)

INIT = """
window.__cls = 0;
try {
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; })
    .observe({ type: 'layout-shift', buffered: true });
} catch (e) {}
"""

STATE = """() => {
  const segs = [...document.querySelectorAll('.segment')];
  const fw = document.getElementById('farewell');
  const shown = fw && !fw.hidden && (!fw.classList.contains('farewell') || fw.classList.contains('shown')); const r = shown ? fw.getBoundingClientRect() : null;
  const fin = document.querySelector('.segment-final');
  return {
    gone: segs.filter(s => s.classList.contains('dissolved')).length,
    live: segs.map((s, i) => s.classList.contains('dissolved') ? null : i).filter(x => x !== null),
    label: (document.getElementById('progressLabel') || {}).textContent,
    farewellShown: fw ? shown : null,
    farewellTop: r ? Math.round(r.top) : null,
    farewellBottom: r ? Math.round(r.bottom) : null,
    finalBusy: fin.classList.contains('scrambling') || fin.classList.contains('dissolved'),
    vh: innerHeight,
    y: Math.round(scrollY),
    max: document.documentElement.scrollHeight - innerHeight,
    cls: Math.round((window.__cls || 0) * 1000) / 1000,
  };
}"""


def free_port(start=8840):
    for port in range(start, start + 40):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    raise RuntimeError('no free port')


def serve():
    port = free_port()
    proc = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'],
                            cwd=REPO, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = f'http://127.0.0.1:{port}'
    for _ in range(80):
        try:
            urllib.request.urlopen(base + PATH, timeout=1)
            return proc, base
        except Exception:
            time.sleep(0.1)
    proc.terminate()
    raise RuntimeError('server did not start')


def context(browser, w, h, mobile=False, reduced=False):
    ctx = browser.new_context(viewport={'width': w, 'height': h},
                              device_scale_factor=2 if mobile else 1,
                              is_mobile=mobile, has_touch=mobile,
                              reduced_motion='reduce' if reduced else 'no-preference')
    page = ctx.new_page()
    page.add_init_script(INIT)
    log = {'requests': [], 'errors': []}
    page.on('request', lambda r: log['requests'].append((time.time(), r.url)))
    page.on('console', lambda m: log['errors'].append(m.text) if m.type == 'error' else None)
    page.on('pageerror', lambda e: log['errors'].append(str(e)))
    return ctx, page, log


def full_run(browser, base, name, w, h, mobile=False, reduced=False, shots=False):
    ctx, page, log = context(browser, w, h, mobile, reduced)
    page.goto(base + PATH, wait_until='load')
    t_load = time.time()
    page.wait_for_timeout(500)
    prefix = os.path.join(OUT, name)
    if shots:
        page.screenshot(path=prefix + '_01_load.png')
    step = int(h * 0.3)
    y = 0
    shot_first = shot_mid = False
    while True:
        y += step
        page.evaluate(f'window.scrollTo(0, {y})')
        page.wait_for_timeout(150)
        st = page.evaluate(STATE)
        if shots and not shot_first and st['gone'] >= 1:
            page.wait_for_timeout(600)
            page.screenshot(path=prefix + '_02_first_gone.png')
            shot_first = True
        if shots and not shot_mid and st['gone'] >= 5:
            page.wait_for_timeout(600)
            page.screenshot(path=prefix + '_03_mid.png')
            shot_mid = True
        if st['finalBusy'] or y > st['max'] + h:
            break
    # A reader who reaches the last paragraph stops and looks.
    page.wait_for_timeout(3200)
    at_end = page.evaluate(STATE)
    if shots:
        page.screenshot(path=prefix + '_04_end.png')
    page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)')
    page.wait_for_timeout(800)
    at_bottom = page.evaluate(STATE)
    page.click('#archiefTitel')
    page.wait_for_timeout(500)
    arch = page.evaluate("() => [...document.querySelectorAll('.arch-trace')].map(e => e.textContent)")
    if shots:
        page.evaluate("document.getElementById('archief').scrollIntoView({block: 'start'})")
        page.wait_for_timeout(300)
        page.screenshot(path=prefix + '_05_archive.png')
    sys_line = page.text_content('#footerSystem')
    manifest = page.text_content('#manifestNet')
    farewell = page.text_content('#farewell')
    seg0 = page.evaluate("() => [...document.querySelectorAll('.segment[data-segment=\"0\"] .trace-data > div')].map(d => d.textContent)")
    if shots:
        page.evaluate("window.scrollTo(0, document.querySelector('.segment[data-segment=\"5\"]').getBoundingClientRect().top + scrollY - 70)")
        page.wait_for_timeout(500)
        page.screenshot(path=prefix + '_06_scrollback.png')
        page.screenshot(path=prefix + '_07_full.png', full_page=True)
    after_load = [u for (t, u) in log['requests'] if t > t_load + 0.05]
    offsite = sorted({u for (_, u) in log['requests'] if not u.startswith(base)})
    ctx.close()
    return {
        'name': name, 'viewport': f'{w}x{h}', 'reduced': reduced,
        'at_end': at_end, 'at_bottom': at_bottom,
        'farewell_in_view_at_end': bool(at_end['farewellShown'] and at_end['farewellTop'] is not None
                                        and at_end['farewellTop'] >= 0 and at_end['farewellBottom'] <= at_end['vh']),
        'farewell': farewell, 'seg0_trace': seg0, 'archive_first3': arch[:3], 'archive_last': arch[-1:],
        'sys': sys_line, 'manifest_net': manifest,
        'requests_total': len(log['requests']), 'requests_after_load': after_load, 'offsite': offsite,
        'errors': log['errors'],
    }


def comment_and_focus(browser, base):
    ctx, page, log = context(browser, 390, 844, mobile=True)
    page.goto(base + PATH, wait_until='load')
    page.wait_for_timeout(400)
    page.evaluate("window.scrollTo(0, document.querySelector('.segment[data-segment=\"0\"]').getBoundingClientRect().top + scrollY - 120)")
    page.wait_for_timeout(300)
    page.click('.segment[data-segment="0"] .ui-comment')
    page.fill('.segment[data-segment="0"] .comment-field', 'dit is een test')
    page.keyboard.press('Enter')
    page.wait_for_timeout(600)
    bubble = page.text_content('.segment[data-segment="0"] .comment-bubble')
    page.wait_for_timeout(3200)
    ghost = page.text_content('.segment[data-segment="0"] .comment-ghost')
    corr = page.text_content('.segment[data-segment="0"] .comment-correction')
    focus_after_comment = page.evaluate('document.activeElement.className')
    page.screenshot(path=os.path.join(OUT, 'phone_08_comment.png'))
    # keyboard focus on the heart of segment 1, then let segment 1 be erased
    page.focus('.segment[data-segment="1"] .ui-heart')
    page.keyboard.press('Enter')
    pressed = page.get_attribute('.segment[data-segment="1"] .ui-heart', 'aria-pressed')
    # Scroll on with the keyboard, the way a keyboard user does, until segment 1 is erased.
    for _ in range(40):
        if page.evaluate("() => document.querySelector('.segment[data-segment=\"1\"]').classList.contains('dissolved')"):
            break
        page.keyboard.press('ArrowDown')
        page.wait_for_timeout(250)
    page.wait_for_timeout(800)
    focus_after_erase = page.evaluate("() => ({cls: document.activeElement.className, seg: document.activeElement.closest('.segment') ? document.activeElement.closest('.segment').dataset.segment : null})")
    seg0_trace = page.evaluate("() => [...document.querySelectorAll('.segment[data-segment=\"0\"] .trace-data > div')].map(d => d.textContent)")
    aria_seg1 = page.locator('.segment[data-segment="1"]').aria_snapshot()
    ctx.close()
    return {
        'bubble': bubble, 'ghost': ghost, 'correction': corr, 'focus_after_comment': focus_after_comment,
        'heart_pressed': pressed, 'focus_after_erase': focus_after_erase, 'seg0_trace_with_comment': seg0_trace,
        'aria_seg1': aria_seg1, 'requests': [u for (_, u) in log['requests']], 'errors': log['errors'],
    }


def route(browser, base):
    ctx, page, log = context(browser, 390, 844, mobile=True)
    page.goto(base + PATH, wait_until='load')
    page.wait_for_timeout(400)
    # The route to the full text is for keyboard and screen reader only: invisible until Tab.
    box = "() => { const r = document.getElementById('routeLink').getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom)}; }"
    before_tab = page.evaluate(box)
    page.keyboard.press('Tab')
    first_focus = page.evaluate('document.activeElement.id')
    on_tab = page.evaluate(box)
    page.screenshot(path=os.path.join(OUT, 'phone_09a_skiplink.png'))
    page.keyboard.press('Enter')
    page.wait_for_timeout(2600)
    st = page.evaluate(STATE)
    res = page.evaluate("""() => ({
      open: document.getElementById('archiveBox').open,
      focus: document.activeElement.id,
      farewell: document.getElementById('farewell').textContent.split('\\n')[0],
      firstTrace: document.querySelector('.arch-trace').textContent,
      archiveItems: document.querySelectorAll('.arch-item').length,
    })""")
    page.screenshot(path=os.path.join(OUT, 'phone_09_route.png'))
    aria_archive = page.locator('#archief').aria_snapshot()
    caption = None
    page.goto(base + PATH, wait_until='load')
    page.wait_for_timeout(300)
    if page.query_selector('#moreBtn') is not None:
        page.click('#moreBtn')
        caption = page.text_content('#caption')
    ctx.close()
    return {'link_hidden_before_tab': before_tab['bottom'] <= 0, 'first_tab_focus': first_focus,
            'link_visible_on_tab': on_tab['top'] >= 0, 'caption_expanded': caption, 'state': st, **res,
            'aria_archive_head': aria_archive[:900], 'errors': log['errors']}


def main():
    proc = None
    if REMOTE:
        base = REMOTE.rstrip('/')
    else:
        proc, base = serve()
    results = {'base': base, 'path': PATH}
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(channel='chrome', headless=True)
            sizes = [
                ('phone', 390, 844, True, True),
                ('small', 320, 568, True, False),
                ('se', 375, 667, True, False),
                ('android', 360, 800, True, False),
                ('tablet', 768, 1024, True, False),
                ('laptop720', 1280, 720, False, False),
                ('desk', 1440, 900, False, True),
                ('hd', 1920, 1080, False, False),
                ('qhd', 2560, 1440, False, False),
            ]
            results['runs'] = [full_run(browser, base, n, w, h, m, False, s) for (n, w, h, m, s) in sizes]
            results['reduced_phone'] = full_run(browser, base, 'reduced_phone', 390, 844, True, True, True)
            if PATH.startswith('/v') or PATH == '/':
                results['comment_focus'] = comment_and_focus(browser, base)
                results['route'] = route(browser, base)
            browser.close()
    finally:
        if proc:
            proc.terminate()
    with open(os.path.join(OUT, 'results.json'), 'w') as fh:
        json.dump(results, fh, indent=2, ensure_ascii=False)
    print('viewport    gone label            live  fw_in_view  cls    req_after_load offsite errors')
    for r in results['runs'] + [results['reduced_phone']]:
        e = r['at_end']
        print(f"{r['viewport']:<11} {e['gone']:>4} {e['label']!s:<16} {str(e['live']):<5} "
              f"{str(r['farewell_in_view_at_end']):<11} {r['at_bottom']['cls']:<6} {len(r['requests_after_load']):<14} "
              f"{len(r['offsite']):<7} {len(r['errors'])}{'  (reduced)' if r['reduced'] else ''}")


if __name__ == '__main__':
    main()

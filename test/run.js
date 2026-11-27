// Browser tests for Deck Space: `test/run.sh` (Docker) or, with playwright installed, `npm test`.
//
// Serves the repo on a local port, loads test/index.html in headless Chromium with the deck API
// stubbed by test/fixtures/, and checks:
//   - panFor (src/pan.js): what the map centres on at each zoom level;
//   - the loading freeze: while a deck's neighbourhood loads, an aria-busy overlay covers the map
//     and swallows clicks and the wheel, and each deck is requested exactly once.
// The page's packages come from jsdelivr (see the import map), so this needs network access.
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const FIXTURE = fs.readFileSync(path.join(__dirname, 'fixtures', 'count-your-days-defender.json'));
const SLUG = 'count-your-days-defender';
const OTHER = 'build-your-own-monsters-1'; // a neighbour in the fixture
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/blank') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html>'); }
  const file = path.join(ROOT, url === '/' ? 'test/index.html' : path.normalize(url));
  if (!file.startsWith(ROOT)) { res.writeHead(404); return res.end(); }
  fs.readFile(file, (err, body) => {
    if (err) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  });
});

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// ---- panFor --------------------------------------------------------------------------------
// A plain linear scale over [0, 10] -> [0, 100] (y flipped, as in svg.js), so the numbers are easy.
const panCase = async (page, args) => {
  if (page.url() === 'about:blank') await page.goto(`http://localhost:${server.address().port}/blank`);
  return page.evaluate(async (args) => {
  const { panFor } = await import('/src/pan.js');
  const xScale = (v) => v * 10;
  const yScale = (v) => 100 - v * 10;
  return panFor({ xScale, yScale, width: 200, height: 100, ...args });
  }, args);
};

test('panFor: nothing focused shows the whole space', async (page) => {
  assert.deepStrictEqual(await panCase(page, { focusedDeck: null, zoomLevel: 3, xValues: [1], yValues: [1] }), [0, 0, 1]);
});

test('panFor: zoomed all the way out, centres on the whole neighbourhood, not the deck', async (page) => {
  // The deck sits at the edge (0, 0) of a neighbourhood spanning x 0..8, y 0..4: centre (4, 2).
  const [tx, ty, k] = await panCase(page, { focusedDeck: { x: 0, y: 0 }, zoomLevel: 1, xValues: [0, 8, 5], yValues: [0, 4, 1] });
  assert.strictEqual(k, 100); // min(width, height)
  assert.strictEqual(tx, 200 / 2 - 40 * k); // xScale(4) = 40
  assert.strictEqual(ty, 100 / 2 - 80 * k); // yScale(2) = 80
});

test('panFor: from zoom 2 in, centres on the deck itself', async (page) => {
  for (const zoomLevel of [2, 3, 5]) {
    const [tx, ty, k] = await panCase(page, { focusedDeck: { x: 0, y: 0 }, zoomLevel, xValues: [0, 8], yValues: [0, 4] });
    assert.deepStrictEqual([tx, ty, k], [100 - 0 * k, 50 - 100 * k, 100], 'zoom ' + zoomLevel);
  }
});

test('panFor: no neighbours yet, centres on the deck even at zoom 1', async (page) => {
  const [tx, ty] = await panCase(page, { focusedDeck: { x: 3, y: 1 }, zoomLevel: 1, xValues: [], yValues: [] });
  assert.deepStrictEqual([tx, ty], [100 - 30 * 100, 50 - 90 * 100]);
});

// ---- zoomScaleFor / deckRadiusFor ----------------------------------------------------------------
// Same easy scales as panFor's cases: map units x10 -> px, viewport 200x100, panFor's k = min(w, h) = 100.
const zoomCase = async (page, fn, args) => {
  if (page.url() === 'about:blank') await page.goto(`http://localhost:${server.address().port}/blank`);
  return page.evaluate(async ([fn, args]) => {
    const mod = await import('/src/pan.js');
    const xScale = (v) => v * 10;
    const yScale = (v) => 100 - v * 10;
    return mod[fn]({ xScale, yScale, width: 200, height: 100, k: 100, ...args });
  }, [fn, args]);
};

test('zoomScaleFor: a tight neighbourhood keeps the old range (0.15 at zoom 1, 1 at zoom 5)', async (page) => {
  const tight = { xValues: [5, 5.01], yValues: [5, 5.01] };
  assert.strictEqual(await zoomCase(page, 'zoomScaleFor', { zoomLevel: 5, ...tight }), 1);
  assert.ok(Math.abs(await zoomCase(page, 'zoomScaleFor', { zoomLevel: 1, ...tight }) - 0.15) < 1e-9);
});

test('zoomScaleFor: zoom 1 fits a widely spread neighbourhood, and the levels step evenly', async (page) => {
  // Span 4 units = 40 px across, 60 px tall; with the 1.2 margin it fits at min(200/48, 100/72)/100.
  const wide = { xValues: [1, 5], yValues: [1, 7] };
  const z1 = await zoomCase(page, 'zoomScaleFor', { zoomLevel: 1, ...wide });
  assert.ok(Math.abs(z1 - (100 / 72) / 100) < 1e-9, `zoom 1 was ${z1}`);
  const zs = [];
  for (const zoomLevel of [1, 2, 3, 4, 5]) zs.push(await zoomCase(page, 'zoomScaleFor', { zoomLevel, ...wide }));
  const ratios = zs.slice(1).map((z, i) => z / zs[i]);
  ratios.forEach((r) => assert.ok(Math.abs(r - ratios[0]) < 1e-9, `uneven steps ${ratios}`));
});

test('deckRadiusFor: normal radius at usual zooms, larger only when decks would be under 5 px', async (page) => {
  assert.strictEqual(await zoomCase(page, 'deckRadiusFor', { k: 800, zoom: 0.15 }), 0.1);
  const r = await zoomCase(page, 'deckRadiusFor', { k: 800, zoom: 0.001 });
  assert.ok(Math.abs(r * 800 * 0.001 * 2 - 5) < 1e-9, `drawn ${r * 800 * 0.001 * 2} px`);
});

// ---- the loading freeze ----------------------------------------------------------------------
test('loading: an overlay covers the map and swallows clicks and the wheel; one request per deck', async (page) => {
  const requested = [];
  let release;
  await page.route('**/api/decks/**', async (route) => {
    requested.push(new URL(route.request().url()).pathname);
    await new Promise((resolve) => { release = resolve; });
    await route.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE });
  });
  await page.goto(`http://localhost:${server.address().port}/#${SLUG}?zoom=3`, { waitUntil: 'domcontentloaded' });

  // First load: no map yet, the overlay says so.
  await page.waitForSelector('[aria-busy=true]', { timeout: 15000 });
  assert.match(await page.innerText('[aria-busy=true]'), /Charting this deck's neighbourhood/);
  release();
  await page.waitForSelector('[aria-busy=true]', { state: 'detached', timeout: 15000 });
  await page.waitForSelector('.deck', { timeout: 15000 });
  assert.deepStrictEqual(requested, [`/api/decks/${SLUG}/space/`]);

  // Moving to another deck: the map stays, the overlay covers it.
  await page.evaluate((slug) => { location.hash = slug + '?zoom=3'; }, OTHER);
  await page.waitForSelector('[aria-busy=true]', { timeout: 15000 });
  assert.match(await page.innerText('[aria-busy=true]'), /Moving to that deck/);
  const covered = await page.evaluate(() => {
    const overlay = document.querySelector('[aria-busy=true]');
    const points = [[10, 10], [550, 320], [1090, 630], [1058, 446]];
    return points.every(([x, y]) => overlay.contains(document.elementFromPoint(x, y)));
  });
  assert.ok(covered, 'the overlay is on top of the whole map');

  // Clicks, double clicks and the wheel while it loads change nothing (no zoom, no new deck).
  const before = await page.evaluate(() => location.hash);
  await page.mouse.move(550, 320);
  await page.mouse.wheel(0, 400);
  await page.mouse.click(550, 320);
  await page.mouse.dblclick(300, 200);
  await page.waitForTimeout(300);
  assert.strictEqual(await page.evaluate(() => location.hash), before);

  release();
  await page.waitForSelector('[aria-busy=true]', { state: 'detached', timeout: 15000 });
  assert.ok(await page.locator('.deck').count() > 0, 'the map is back');
  assert.deepStrictEqual(requested, [`/api/decks/${SLUG}/space/`, `/api/decks/${OTHER}/space/`]);

  // Changing only the zoom of a deck already loaded asks for nothing.
  await page.evaluate((slug) => { location.hash = slug + '?zoom=1'; }, OTHER);
  await page.waitForTimeout(500);
  assert.strictEqual(requested.length, 2);
});

// ---- runner ----------------------------------------------------------------------------------
(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  const browser = await chromium.launch();
  let failed = 0;
  for (const { name, fn } of tests) {
    const page = await browser.newPage({ viewport: { width: 1100, height: 640 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    try {
      await fn(page);
      assert.deepStrictEqual(errors, [], 'page errors');
      console.log('ok   ' + name);
    } catch (e) {
      failed++;
      console.log('FAIL ' + name + '\n     ' + String(e.stack || e).split('\n').slice(0, 6).join('\n     '));
    }
    await page.close();
  }
  await browser.close();
  server.close();
  console.log(`${tests.length - failed}/${tests.length} passed`);
  process.exit(failed ? 1 : 0);
})();

/* Run with NODE_PATH pointing to a Playwright installation; Chromium is local. */
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const target = file === root ? path.join(root, 'index.html') : file;
  fs.readFile(target, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(target)];
    res.writeHead(200, { 'Content-Type': type || 'application/octet-stream' }).end(data);
  });
});

async function main() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.locator('[data-act="openShop"]').click();
    await page.locator('[data-m="ok"]').click();
    assert.equal(await page.evaluate(() => CST.S.copies.length), 2, 'new shop receives starter cards');

    const values = await page.evaluate(() => {
      S.cash = 100000000;
      S.copies = [];
      const cid = allCards()[0].cid;
      const worn = addCopy(cid, { condition: 5, misprint: '' });
      const mint = addCopy(cid, { condition: 10, misprint: '' });
      const holo = addCopy(cid, { condition: 10, misprint: '', holo: true });
      const error = addCopy(cid, { condition: 10, misprint: 'Double strike' });
      const gradedWorn = addCopy(cid, { grade: 5, condition: 5, misprint: '' });
      const gradedMint = addCopy(cid, { grade: 10, condition: 10, misprint: '' });
      const result = { worn: copyValue(worn), mint: copyValue(mint), holo: copyValue(holo),
        misprint: copyValue(error), gradedWorn: copyValue(gradedWorn), gradedMint: copyValue(gradedMint),
        groups: groups('vault').filter(g => g.cid === cid).length, ids: { worn: worn.id, mint: mint.id, holo: holo.id } };
      UI.tab = 'vault'; render(); return result;
    });
    assert(values.mint > values.worn, 'raw pristine cards cost more than worn cards');
    assert(values.holo > values.mint, 'holo carries a value premium');
    assert(values.misprint > values.mint, 'legitimate misprint carries a value premium');
    assert(values.gradedMint > values.gradedWorn, 'higher certified mint grade is more valuable');
    assert.equal(values.groups, 6, 'condition, finish, print error and certification remain separate groups');

    async function dropCard(id, destination) {
      const transfer = await page.evaluateHandle(() => new DataTransfer());
      await page.locator(`[data-copy-id="${id}"]`).first().dispatchEvent('dragstart', { dataTransfer: transfer });
      const target = page.locator(`[data-drop="${destination}"]`).first();
      await target.dispatchEvent('dragover', { dataTransfer: transfer });
      await target.dispatchEvent('drop', { dataTransfer: transfer });
      await transfer.dispose();
    }
    await dropCard(values.ids.mint, 'safe');
    assert.equal(await page.evaluate(id => copyById(id).place, values.ids.mint), 'safe', 'drop stores exact copy in safe');
    const protectedCopy = await page.evaluate(id => {
      const cp = copyById(id); return { owned: ownsCard(cp.cid), value: holdingsValue(),
        inTradingGroups: groups('vault').some(g => g.copies.some(c => c.id === id)) };
    }, values.ids.mint);
    assert(protectedCopy.owned && protectedCopy.value > 0 && !protectedCopy.inTradingGroups, 'safe protects stock and keeps its value');
    await page.evaluate(id => { fromSafe(id); render(); }, values.ids.mint);
    await dropCard(values.ids.worn, 'lab');
    assert.equal(await page.evaluate(id => copyById(id).place, values.ids.worn), 'lab', 'drop submits raw card to grading');
    const certification = await page.evaluate(id => {
      const cp = copyById(id); S.day = cp.until; processReturns(); render();
      return { grade: cp.grade, condition: physicalCondition(cp), place: cp.place };
    }, values.ids.worn);
    assert.deepEqual(certification, { grade: 5, condition: 5, place: 'vault' }, 'grading verifies existing visible wear');

    const guardChecks = await page.evaluate(() => {
      const saved = JSON.parse(JSON.stringify(S));
      const rejects = action => { try { action(); return false; } catch (_) { return true; } };
      try {
        S.copies = []; S.up.lab = 0; S.cash = 1000000;
        const cid = allCards()[0].cid;
        const certified = addCopy(cid, { grade: 9, misprint: '' });
        const certifiedBlocked = rejects(() => sendToLab(certified.id)) && certified.place === 'vault';
        const raw = addCopy(cid, { condition: 8, misprint: '' });
        S.cash = 0;
        const cashBlocked = rejects(() => sendToLab(raw.id)) && raw.place === 'vault' && S.cash === 0;
        S.cash = 1000000; sendToLab(raw.id);
        const second = addCopy(cid, { condition: 7, misprint: '' }); sendToLab(second.id);
        const third = addCopy(cid, { condition: 10, misprint: '' });
        const balance = S.cash;
        const fullBlocked = rejects(() => sendToLab(third.id)) && third.place === 'vault' && S.cash === balance;
        moveToSafe(third.id);
        const safeBlocked = rejects(() => sendToLab(third.id)) && rejects(() => consign(third.id))
          && rejects(() => toAlbum(third.id)) && third.place === 'safe';
        try { sellAdvised(); } catch (_) { /* No advised stock also leaves safe cards untouched. */ }
        return { certifiedBlocked, cashBlocked, fullBlocked, safeBlocked,
          safeSurvivesBulkSale: !!copyById(third.id) && third.place === 'safe' };
      } finally { loadState(saved); render(); }
    });
    assert.deepEqual(guardChecks, { certifiedBlocked: true, cashBlocked: true, fullBlocked: true,
      safeBlocked: true, safeSurvivesBulkSale: true }, 'invalid grading and protected-card operations leave state intact');

    const migration = await page.evaluate(() => {
      const saved = JSON.parse(JSON.stringify(S));
      try {
        const legacy = JSON.parse(JSON.stringify(S));
        const newIds = ['astral', 'eldermural', 'coral', 'eclipse'];
        for (const cp of legacy.copies) { delete cp.condition; delete cp.misprint; }
        legacy.launched = legacy.launched.filter(fid => !newIds.includes(fid));
        legacy.queue = legacy.queue.filter(fid => !newIds.includes(fid));
        for (const [cid, c] of Object.entries(legacy.cards)) if (newIds.includes(c.fid)) delete legacy.cards[cid];
        loadState(legacy);
        const certificate = S.copies.find(cp => cp.grade === 5);
        const raw = S.copies.find(cp => !cp.grade);
        loadState(S);
        return { certificate: certificate.grade === 5 && certificate.condition === 5,
          raw: raw.condition === 8 && raw.grade === 0, noInventedError: S.copies.every(cp => cp.misprint === ''),
          startsOnce: ['astral', 'eldermural'].every(fid => S.launched.filter(id => id === fid).length === 1),
          queuedOnce: ['coral', 'eclipse'].every(fid => S.queue.filter(id => id === fid).length === 1),
          startCards: ['astral', 'eldermural'].every(fid => cidsOf(fid).every(cid => S.cards[cid])) };
      } finally { loadState(saved); render(); }
    });
    assert.deepEqual(migration, { certificate: true, raw: true, noInventedError: true,
      startsOnce: true, queuedOnce: true, startCards: true }, 'legacy v3 shops migrate without replacing cards or duplicating new sets');

    const acquisitions = await page.evaluate(() => {
      const saved = JSON.parse(JSON.stringify(S));
      const expected = { holo: true, grade: 0, condition: 6, misprint: 'Offset foil', serial: 1 };
      const traits = cp => Object.fromEntries(Object.keys(expected).map(key => [key, cp[key]]));
      try {
        const cid = allCards()[0].cid;
        S.cash = 1000000;
        deal({ id: S.nextCust++, cid, side: 'sell', state: 'open', price: 100, flagged: false,
          name: 'QA seller', ...expected });
        const seller = traits(S.copies.at(-1));
        S.lot = { kind: 'card', cid, state: 'open', value: 1000, ...expected };
        winLot(200);
        return { expected, seller, auction: traits(S.copies.at(-1)) };
      } finally { loadState(saved); render(); }
    });
    assert.deepEqual(acquisitions.seller, acquisitions.expected, 'seller purchase preserves inspected finish, condition, printing error and serial');
    assert.deepEqual(acquisitions.auction, acquisitions.expected, 'auction win preserves inspected physical traits');

    const panorama = await page.evaluate(() => {
      const f = FRANCHISES.find(f => f.panorama);
      if (!S.launched.includes(f.id)) launch(f.id, true);
      const before = setStatus(f.id);
      cidsOf(f.id).forEach(cid => toAlbum(addCopy(cid, { condition: 9, misprint: '' }).id));
      UI.tab = 'collection'; render();
      const completed = setStatus(f.id);
      return { fid: f.id, count: FRANCHISES.filter(f => f.panorama).length, complete: completed.complete,
        raw: completed.raw, value: completed.value, multiplier: completed.mult, previous: before.complete };
    });
    assert(panorama.count >= 2, 'multiple picture collections are available');
    assert(!panorama.previous && panorama.complete && panorama.value > panorama.raw, 'completed picture set earns a bonus');
    await page.waitForFunction(fid => {
      const canvas = document.querySelector(`canvas[data-panorama="${fid}"]`);
      return canvas && canvas.width > 0 && canvas.height > 0;
    }, panorama.fid);

    const visualDifference = await page.evaluate(() => {
      const c = allCards()[0];
      const image = options => paintFront(c, { px: 200, serial: 1, condition: 10, ...options }).color.toDataURL();
      return { wear: image({ condition: 5 }) !== image({ condition: 10 }),
        holo: image({ holo: true }) !== image({ holo: false }),
        error: image({ misprint: 'Double strike' }) !== image({ misprint: '' }) };
    });
    assert.deepEqual(visualDifference, { wear: true, holo: true, error: true }, 'wear, holo and printing errors visibly change card art');

    await page.evaluate(id => {
      const cp = copyById(id); inspect({ ...cp });
    }, values.ids.holo);
    await page.waitForTimeout(1000); // Let the entrance animation finish before testing card control.
    assert.equal(await page.evaluate(() => CST.Inspector.isGL()), true, 'WebGL inspector initializes');
    const surface = page.locator('#inspector canvas.gl');
    await surface.dispatchEvent('pointerdown', { pointerId: 1, pointerType: 'mouse', button: 0, clientX: 500, clientY: 200 });
    await surface.dispatchEvent('pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 600, clientY: 900 });
    await surface.dispatchEvent('pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 600, clientY: 900 });
    await page.waitForTimeout(100);
    const pose = await page.evaluate(() => ({ yaw: Inspector.state.yaw, pitch: Inspector.state.pitch }));
    await page.waitForTimeout(450);
    assert.deepEqual(await page.evaluate(() => ({ yaw: Inspector.state.yaw, pitch: Inspector.state.pitch })), pose,
      'steep viewing angle stays still after pointer release');
    assert(Math.abs(pose.pitch) <= 1.35, 'pitch stays inside viewing limit');
    await surface.dispatchEvent('pointerdown', { pointerId: 2, pointerType: 'touch', clientX: 300, clientY: 300 });
    await surface.dispatchEvent('pointercancel', { pointerId: 2, pointerType: 'touch', clientX: 300, clientY: 300 });
    assert.equal(await page.evaluate(() => Inspector.state.drag), false, 'cancelled pointer releases card');
    await page.locator('[data-act="insFlip"]').click();
    await page.waitForTimeout(900);
    assert(Number.isFinite(await page.evaluate(() => Inspector.state.yaw)), 'flip stays finite');
    await page.locator('[data-act="insClose"]').click();

    await page.evaluate(async id => { moveToSafe(id); persist(); await flushSave(); }, values.ids.mint);
    await page.reload();
    await page.locator('[data-act="continue"]').click();
    assert.equal(await page.evaluate(id => copyById(id).place, values.ids.mint), 'safe', 'safe storage survives reload');
    assert.equal(await page.evaluate(id => copyById(id).condition, values.ids.worn), 5, 'physical condition survives reload');
    assert(await page.evaluate(() => S.copies.some(cp => cp.misprint === 'Double strike')), 'print errors survive reload');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { UI.tab = 'vault'; UI.sel = null; render(); });
    await page.waitForTimeout(250);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'vault fits phone viewport');
    assert(await page.locator('[data-drop="lab"]').isVisible(), 'phone users can reach grading');

    const handle = page.locator(`[data-copy-id="${values.ids.holo}"] .drag-handle`).first();
    await handle.scrollIntoViewIfNeeded();
    const handleRect = await handle.boundingBox();
    const touch = await page.context().newCDPSession(page);
    const touchPoint = (x, y) => [{ x, y, id: 1, radiusX: 2, radiusY: 2, force: 1 }];
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart',
      touchPoints: touchPoint(handleRect.x + handleRect.width / 2, handleRect.y + handleRect.height / 2) });
    // Move toward the top edge until the station scrolls back into reach.
    for (let i = 0; i < 90; i++) {
      const rect = await page.locator('[data-drop="safe"]').boundingBox();
      const headerBottom = await page.locator('header.top').evaluate(el => el.getBoundingClientRect().bottom);
      if (rect.y + rect.height > headerBottom + 70 && rect.y + 45 < 740) break;
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touchPoint(180, 65 + i % 2) });
    }
    const safeRect = await page.locator('[data-drop="safe"]').boundingBox();
    const headerBottom = await page.locator('header.top').evaluate(el => el.getBoundingClientRect().bottom);
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove',
      touchPoints: touchPoint(safeRect.x + safeRect.width / 2, Math.max(headerBottom + 30, safeRect.y + 45)) });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await touch.detach();
    assert.equal(await page.evaluate(id => copyById(id).place, values.ids.holo), 'safe', 'touch handle can drag a card into safe storage');
    assert.deepEqual(errors, [], 'no uncaught browser exceptions');
    console.log('PASS: startup, values, copy grouping, safe protection, drag/drop grading, rejection guards, physical grading, legacy migration, seller/auction traits, panorama bonus, visual finishes, stable WebGL controls, persistence, mobile layout and touch drag.');
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; server.close(); });

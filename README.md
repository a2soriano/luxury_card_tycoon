# Luxury Card Tycoon

A browser card shop game with canvas artwork and a WebGL inspector, based on the supplied Card Shop Tycoon 3 game. There is no backend or build step. Shop progress saves in this browser's local storage; use **Menu → Save code** to move a shop between devices. Existing version 3 saves are migrated on load.

## Run

For a single-file copy, download **luxury-card-tycoon.html** from this repository and open it in your browser. Use GitHub’s **Download raw file** button to download the HTML rather than saving the GitHub page. Rebuild that file after source changes with `npm run build`.

Requires Python 3. From this directory:

```sh
npm start
```

This serves the game on port 8000. Alternatively, run `python3 -m http.server 8000 --bind 0.0.0.0` directly; gameplay requires no npm dependencies. Fonts from Google Fonts are optional; system fonts work offline. The original host's cloud-save integration is optional and is not needed here.

## Collect, inspect and store

- Rarity rises from **Legendary → Mythic → Royal Mythic → Cosmic Mythic → Ultra Mythic**. Every rarity tag shows its rank out of five; expand **Rarity & value guide** for print runs and value multipliers.
- Ultra Mythics have full artwork, a diamond-engraved frame and a sovereign crest. Holo copies show iridescent foil, with a **2.5×** premium.
- Legitimate **Double strike (4×)** and **Offset foil (3×)** print errors can appear in crates, boosters, seller offers and auction lots. They are separate from counterfeits and stack with holo and condition premiums.
- Condition belongs to each individual copy. Wear is visible on both faces before grading: torn and creased cards through pristine copies. The lab certifies that existing condition; it does not reroll or repair it. Higher mint grades command higher prices.
- Showroom stock is standard near-mint, uncertified stock. Other conditions and variants appear in packs, the Salon and auctions. Inspecting a seller or auction card shows the same physical traits you receive if you buy it.
- In **Vault**, drag a card to **Grading vault**, or use its **Grade** button. Grading costs 3% of its value (minimum $75), takes two game days (one with the Grading Bench), and has limited slots. Advance with **Next day** to receive the result.
- Drag to **Safe box** or choose **Lock in safe**. Locked cards retain their value but cannot be sold, lent, consigned, graded or consumed by commissions. Open the safe and **Unlock**, or drag a stored card back to **Trading cards**.
- On touch screens, drag using the **⠿ Move card** handle; scrolling near an edge moves through a long vault. Buttons provide the same actions without dragging.
- Four new collections add 16 cards. Astral Convergence and The Elder Dragon Mural are available immediately; Coral Kingdom and Eclipse Cathedral premiere later. The Astral, Elder Dragon and Eclipse sets form joined 2×2 artwork. Put all four cards in **Collection** for the full picture and the normal set multiplier plus another **0.5×**.
- In the inspector, drag to rotate, double-click or press **F** to flip, scroll/pinch to zoom, use arrow keys to turn and **R** to reset. The view holds still when released, including steep viewing angles.

## Validate

Requires Node.js 22+ and Chromium (available in the cloud environment). Playwright is pinned in `package-lock.json`; it uses the installed browser instead of downloading one.

```sh
npm ci --cache /workspace/.cache/npm
npm run check
npm test
```

Set `CHROMIUM_PATH` if Chromium is somewhere other than `/usr/bin/chromium`. Tests create an isolated local server and disposable browser profile; they do not overwrite your saved shop. They cover valuation and copy grouping, grading and rejected submissions, safe protection, mouse/touch drops, panorama completion, visual variants, inspector stability, save migration/persistence, and phone layout.

`game.js` contains the game engine and renderer, `game.css` the styles, and `index.html` the page. No secrets or additional services are required.

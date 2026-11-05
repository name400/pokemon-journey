# Reviewed source artwork

Run from the repository root:

```sh
npx vite --config tests/browser/reviewed-assets/vite.config.mjs --host 127.0.0.1 --port 5227 --strictPort
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/check.mjs
```

This isolated React page uses the actual PokemonImage, frame loaders, fusion worker
and BattlePanel. No account, API, saved game or production service is used. All new
Mega/trainer source bytes are local public assets. Four exact pinned Mew front/back
PNG/JSON files are cached for the mixed Mega/base fusion boundary; external requests
otherwise abort. It does not replace images with synthetic stubs.

At1280px/375px it checks72 form/shiny/variant images,38 fusion images (including
both Mega/base roles),14 trainer PNGs and2 actual BattlePanel sprites. It checks
shared Meowstic gender artwork, unavailable Magearna extra variants, pixel output
changes between source palettes, and atlas/trainer404 fallback. Results and full
screenshots are under `.sites-runtime/tests/reviewed-assets/`. This is component
asset validation; it does not claim physical-device or complete game-flow QA.

The expanded pinned set can be checked independently:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/all-megas.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/transformations.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/partners.mjs
node --test tests/rogue-reviewed-artwork.test.mjs tests/rogue-additional-artwork.test.mjs tests/rogue-transformation-artwork.test.mjs
node scripts/audit-rogue-form-artwork.mjs --check
node scripts/generate-trainer-portrait-pairs.mjs --check
node scripts/build-rogue-trainer-appearance.mjs --verify
```

`all-megas` checks96 Mega source forms/97 native identities:1,552 actual
front/back/color outputs across1280px and375px plus88 representative fusion
outputs. `transformations` checks37 Gmax/Primal/Ultra/Eternamax forms (592 outputs).
`partners` checks named pairs, male/female pairs, composite Twins, skip and a
partner-only404 fallback. The harness includes the actual classic CSS/rc-shell;
its introDialoguePending prop holds the portrait long enough for deterministic
screenshot and manual skip checks without changing the product timer.

Outputs are in `.sites-runtime/tests/{all-mega-artwork,transformation-artwork,partner-artwork}`.
Original source hashes and per-file notices are in `data/rogue-*-asset-provenance.json`.
See `docs/COMPLETE_MEGA_AND_PARTNER_ARTWORK_QA_20261105.md` for precise limits,
including unsupported fusion samples and assets prepared for the next unit.

Ordinary source forms and their additional boundaries:

```sh
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/ordinary-forms.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/ordinary-boundaries.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/ordinary-fusion.mjs
node --test tests/rogue-ordinary-artwork.test.mjs
```

The ordinary catalog checks272 currently supported native source forms plus7
gender branches,4,464 actual front/back/color outputs in46 batches. The separate
boundary page exercises source hash-atlas parsing,direction/sex/color changes,
reduced motion,lazy img display after scrolling and404/remount recovery. The
fusion page checks224 outputs for already-permitted male/female form donors.
Eleven additional source-art sets are recorded but remain blocked by native or
source obtainability/lifetime policy. See `docs/ORDINARY_FORM_ARTWORK_QA_20261105.md`.

Existing game-permitted ordinary primaries and packed-atlas regressions:

```sh
node scripts/generate-fusion-primary-artwork.mjs --check
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/primary-fusion.mjs
python tests/browser/reviewed-assets/repack-offset-atlases.py
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/reviewed-assets/offset-fusion.mjs
node --test tests/rogue-fusion-primary-artwork.test.mjs
```

Repacking requires Python/Pillow and writes only `/tmp/repacked-reviewed-mega-atlases`
(override with `REPACKED_ATLAS_ROOT`). It moves actual source pixels into a canonical
atlas for an independent crop-equivalence comparison; product assets stay unchanged.
`PRIMARY_KEYS=648:1,1017:1,1017:2,1017:3` selects only those cases in the primary test
and writes a separate `primary-fusion-delta` result so earlier full results remain.
See `docs/FUSION_PRIMARY_AND_ATLAS_OFFSET_QA_20261105.md` for exact counts and limits.

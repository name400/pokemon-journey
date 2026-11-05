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

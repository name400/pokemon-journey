# PC hatch results, move info and trainer presentation

From the repository root:

```sh
npx vite --config tests/browser/ui-readability/vite.config.mjs --host 127.0.0.1 --port 5222 --strictPort
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/check.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/beast-and-rewards.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/touch-move-info.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/double-layout.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/types-and-motion.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/pp-and-trainers.mjs
```

`CHROMIUM_PATH` defaults to `/usr/bin/chromium`; `UI_TEST_URL` defaults to localhost5222.
The real Page, RogueClassic, BattlePanel and CSS run against a synthetic local API.
POSTs use the real game controller and save codec. External images are stubbed;
these screenshots verify dimensions and controls, not real sprite availability.
No production APIs, accounts or Sites state are used.

Eight viewport sizes cover 18 hatch results, page2/3, previous/next boundaries,
single-result toggle, acknowledge-all, source data preservation, and all four
move-info targets' containment, PP separation, glyphs and keyboard operation.
Two viewports hold the real wave5 trainer's intro for6.5seconds, then verify one
entry per Pokémon after acknowledgement. A synthetic final enemy with1HP tests
that victory dialogue follows all damage/faint presentation and acknowledgement
leads to rewards. The default catalog request and starter-selection reload also
run through the UI.

Screenshots and JSON are ignored outputs under `.sites-runtime/tests/ui-readability/`.
Local Chromium tests do not replace physical-device, real-artwork or production QA.

The second script uses long descriptions at five mobile sizes and one PC size.
It checks free reward text/tier and paid-service price containment, real revive
purchase, Beast Ball reward acquisition, ball selection/capture and reload.

The touch script starts each of four move cards from a fresh page, twice, at
375/390/430px, mobile landscape and desktop. It uses real touch taps rather
than keyboard-only activation, checks the description stays open and toggles,
and verifies no move POST, PP or save changes. Desktop keyboard and mouse
hover/leave behavior are also checked.

Run the scripts sequentially: the local fixture server owns one in-memory save.
Changing server-imported code while a script runs restarts Vite and resets that save.

The doubles script downloads actual PokeAPI sprite bytes through `curl`, caches
them under `SPRITE_CACHE` (default `/tmp/double-sprite-cache`), and records their
URLs and SHA-256 hashes. Showdown URLs are served the corresponding actual
PokeAPI Showdown GIF copies; they are not geometric placeholder sprites. It
checks alpha bounds with `object-fit: contain`, slot separation, floor/ring
alignment, responsive resizing, reversed slots and single/double transitions.
Animated first-frame measurements are approximate for other animation frames.
`layout.html` renders the actual BattlePanel on one retained React instance with
real controller-generated DTOs, avoiding a page reload between those transitions.

The types/motion script covers both teams' single and double HUDs, Primarina's
Water/Fairy types, normal Tera, Stellar's defensive types, changed current types,
evolution selection/result/skip/acknowledgement, and mystery choose/confirm/cancel.
It checks reduced motion and that local presentation controls do not write saves.
Its external Pokémon artwork is stubbed; this script verifies presentation and
controls, not real Pokémon asset availability.

The PP/trainer script checks a fourth-slot Extreme Speed at 0 PP, all four moves
at 0 PP plus selectable Struggle, restored PP, disabled hotkeys and usable info
buttons. Trainer header/intro/dialogue use the real local Finn/Ivy PNGs and check
their full portrait containment; generic trainer and failed-image fallbacks are
also covered. Pokémon artwork in this script is stubbed. Its legacy rival fixture
uses the existing trainer battle/controller with old fallback metadata, testing
the presentation repair without altering the saved trainer record.

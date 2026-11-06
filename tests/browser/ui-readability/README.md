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
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/active-alias-repair.mjs
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

## Local performance investigation

`node tests/browser/ui-readability/server-profile.mjs` measures 20 synthetic
single/double controller turns, encode/decode, view projection and JSON stages.
It does not call a database, account, Worker or production service.

To measure the actual browser UI with cacheable, real GIF bytes:

```sh
node tests/browser/ui-readability/profile-artwork.mjs
PROFILE_ART_ROOT=/tmp/pokerogue-profile-art npx vite --config tests/browser/ui-readability/vite.config.mjs --host 127.0.0.1 --port 5223 --strictPort
UI_TEST_URL=http://127.0.0.1:5223 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/profile-browser.mjs
```

The setup downloads eight PokeAPI Showdown GIFs once and writes their source URLs,
sizes and SHA-256 hashes beside the cache. The isolated server replaces only those
fixture image URLs and serves identical bytes with normal HTTP caching. This
avoids Playwright routing disabling the browser cache. Asset network latency is
therefore controlled localhost latency, not production CDN availability/latency.
Without `PROFILE_ART_ROOT` the ordinary fixture behavior is unchanged.

For an optimized bundle comparison, build and then preview the same harness:

```sh
PROFILE_ART_ROOT=/tmp/pokerogue-profile-art npx vite build --config tests/browser/ui-readability/vite.config.mjs --outDir "$PWD/.sites-runtime/tests/ui-readability/perf-dist" --emptyOutDir
PROFILE_ART_ROOT=/tmp/pokerogue-profile-art npx vite preview --config tests/browser/ui-readability/vite.config.mjs --outDir "$PWD/.sites-runtime/tests/ui-readability/perf-dist" --host 127.0.0.1 --port 5225 --strictPort
PROFILE_VARIANT=production UI_TEST_URL=http://127.0.0.1:5225 PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/profile-browser.mjs
```

The script separates cold opening, first turn, warm turn, immediate next turn,
reconnect and an artificial 150ms request latency at normal and 4× CPU settings.
It records click/request/body/JSON/ready timestamps, event counts, long tasks,
rAF gaps, React development Profiler durations, CDP script/layout/style totals,
and actual image-cache resource entries. Production React disables Profiler
callbacks; zero callback counts there do not mean zero rendering cost. Each
browser context has a fresh cache; reconnect verifies cache hits. The initial
Vite transform warm-up is outside the measured contexts.

`PROFILE_RATES=4 PROFILE_MODES=double PROFILE_LIGHT=1` runs a control without the
document MutationObserver. `PROFILE_CPU_TRACE=1` samples one warmed turn's CPU
call stacks; build first with `PROFILE_SOURCE_MAP=1` to map stack locations to
source. CPU tracing adds overhead and is for attribution, not baseline timings.
`PROFILE_LIGHT` and `PROFILE_CPU_TRACE` should be run separately. Output is under
the ignored `performance*` directories; no request bodies, saved game payloads,
cookies or raw response headers are retained.

Do not run other tests/builds concurrently with timing measurements. The 4× CPU
setting is a synthetic stress condition, not a model of a particular user's PC.
The optimized harness uses the same React UI and local real controller, but does
not replace deployed Worker/database/network or physical-device profiling.

Error correlation and failed recovery can be checked separately on localhost5224:

```sh
npx vite --config tests/browser/ui-readability/vite.config.mjs --host 127.0.0.1 --port 5224 --strictPort
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/error-recovery.mjs
```

This uses the real Page/RogueClassic with synthetic POST409 and recovery GET200/500
responses at375px and1280px. It checks that the first POST error/UUID remains visible,
no POST is retried, saves are unchanged, and the UUID causes no horizontal overflow.
Results/screenshots go to `.sites-runtime/tests/error-recovery/`. Keep its browser/CPU
work separate from performance profiling runs.

Long-wave record and playback-lifecycle probes:

```sh
# Use the optimized preview above, with real PROFILE_ART_ROOT GIFs.
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/profile-long-session.mjs
node tests/browser/ui-readability/profile-playback-lifecycle.mjs
```

The menu probe seeds 0/300/1500 synthetic wave-log lines and runs 12 direct DOM
click/Escape cycles at 4× CPU. It excludes Playwright actionability from the measured
section; it is not a replay of hundreds of actual game turns. `PROFILE_LOG_COUNTS`,
`PROFILE_WIDTH` and `PROFILE_SUFFIX` select cases/output. The lifecycle probe checks
200 supersede/duplicate/cancel cycles and counts pending timers and retained keys.
See `docs/PC_REAL_ARTWORK_PERFORMANCE_QA_20261105.md` for the measured limits and the
memo candidate that was rejected and reverted because it did not improve the long log.

The active alias script checks the conditional battle button, cancellation, wild and trainer normal and Sketch plus non-random and ability-random challenge confirmation, saved reserve and return to the same turn in synthetic desktop and mobile layouts.

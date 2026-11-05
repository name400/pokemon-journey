# PC hatch results, move info and trainer presentation

From the repository root:

```sh
npx vite --config tests/browser/ui-readability/vite.config.mjs --host 127.0.0.1 --port 5222 --strictPort
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/check.mjs
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/ui-readability/beast-and-rewards.mjs
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

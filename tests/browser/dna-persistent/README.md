# Persistent forms in DNA fusions

Run from the repository root:

```sh
node node_modules/vite/bin/vite.js tests/browser/dna-persistent --config tests/browser/dna-persistent/vite.config.mjs --host 127.0.0.1 --port 5217 --strictPort
node tests/browser/dna-persistent/check.mjs
```

`PLAYWRIGHT_MODULE` may point to an installed Playwright module. `CHROMIUM_PATH`
defaults to `/usr/bin/chromium`; `DNA_FORM_TEST_URL` defaults to port 5217.

The actual Page, Classic game and party screen use real controller/view functions
against isolated synthetic account APIs. Each POST round trips through the save
codec. No user account, production data or Sites are accessed. External images
are stubbed, so this is not a sprite asset availability test.

Four viewports (390×844, 375×667, 844×390, 1280×850) exercise Mega, Primal, Ultra
and Rapid Strike G-Max forward changes, reload, generated reverse controls and
confirmed unsplice. Both participants already have a verified fusion, including
a Mega Alakazam donor. It verifies owned form item visibility/preservation,
other slots and Adventure data, browser errors and horizontal overflow. Controls
are scrolled to the center before hit testing and real taps/keyboard Enter,
allowing ordinary party scrolling clear of the mobile bottom navigation. No
forced clicks or direct DOM invocation of game actions are used. Screenshots
are stored under ignored `.sites-runtime/tests/dna-persistent/`.

# Safari reward recovery

Run from the repository root:

```sh
node node_modules/vite/bin/vite.js tests/browser/safari-recovery --config tests/browser/safari-recovery/vite.config.mjs --host 127.0.0.1 --port 5216 --strictPort
node tests/browser/safari-recovery/check.mjs
```

Set `PLAYWRIGHT_MODULE` to an installed Playwright module if needed;
`CHROMIUM_PATH` defaults to `/usr/bin/chromium`, and `SAFARI_TEST_URL` defaults
to `http://127.0.0.1:5216`.

The actual page, game, rewards and CSS use a local synthetic account API and real
game actions/views. Each POST round trips the document through the save codec.
No real account, Sites or production APIs are used. Only external images are
stubbed. Four viewport sizes cover an already persisted empty-reward save and
full-party release/replacement, automatic join and no-capture endings. Checks
include reload at capture and reward decisions, button hit testing, touch or
keyboard, wave 44 and preservation of other slots and Adventure data.

Screenshots are generated in ignored `.sites-runtime/tests/safari-recovery/`.
For the known affected pre-fix game component, `EXPECT_SAFARI_BLOCKED=1` checks
that no Next button appears before or after reload. A local pre-fix component
can be selected with `SAFARI_BASELINE_COMPONENT`; its relative CSS imports must
still resolve to the app directory. Do not use blocked mode with fixed code.

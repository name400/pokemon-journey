# NPC dialogue and game menu regression

Run from the repository root. The fixture renders the actual page, classic game,
NPC dialogue and CSS against local mock account/game APIs. It creates a synthetic
wave 14 double trainer battle and uses the real game action/view functions for
advancing and restoring dialogue. It never reads account saves or calls Sites.
External images are replaced with an SVG during the browser check.

Start the fixture:

```sh
node node_modules/.bin/vite tests/browser/dialogue-overlay --config tests/browser/dialogue-overlay/vite.config.mjs --host 127.0.0.1 --port 5209
```

Then, with Playwright and Chromium available:

```sh
node tests/browser/dialogue-overlay/check.mjs
```

`PLAYWRIGHT_MODULE` can point to an installed Playwright module, `CHROMIUM_PATH`
overrides `/usr/bin/chromium`, and `DIALOGUE_TEST_URL` overrides the fixture URL.
The check covers 390×844, 375×667, 844×390 and 1280×850 viewports: button hit testing,
actual taps, keyboard focus/Enter/Space/Escape, reload with saved dialogue progress,
resize with dialogue open, and game menu navigation after the dialogue closes.
Screenshots are written under ignored `.sites-runtime/tests/dialogue-overlay/artifacts/`.
It checks the browser's actual CSS viewport when mobile landscape auto-zoom occurs.

To reproduce the pre-fix interception, export the previous component to an ignored
file, start a second fixture with `DIALOGUE_BASELINE_COMPONENT` set to its absolute
path, and run the check with `EXPECT_DIALOGUE_COVERED=1` and that fixture URL. That
mode asserts the next button tap is intercepted by the administrator menu link.
Only use this mode with the known affected baseline.

Server rendering safety is covered separately by `tests/rogue-dialogue-portal.test.mjs`
in `npm test`. These are isolated Chromium checks, not a natural wave 14 playthrough,
a production deployment check, or physical Safari/iOS/Android device testing.

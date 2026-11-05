# Challenge selection and start

This fixture renders the real page and starter component with the real Classic
controller behind a local, memory-only API. It starts with one synthetic unlocked
Bulbasaur. It never loads real accounts, saves, Sites, or production endpoints.

From the repository root, start:

```sh
node node_modules/.bin/vite tests/browser/challenge-start --config tests/browser/challenge-start/vite.config.mjs --host 127.0.0.1 --port 5214
```

Then run `node tests/browser/challenge-start/check.mjs`. Set `PLAYWRIGHT_MODULE`
to an installed Playwright module, `CHROMIUM_PATH` to Chromium if needed, or
`CHALLENGE_TEST_URL` to a different local fixture port.

The check discovers currently supported extra challenges from their server
registry, selects their maximum values, operates each control with the keyboard,
adds a starter, starts through the real UI/API, verifies saved conditions, and
reloads. It checks 390×844, 375×667, 844×390 and 1280×850 with intercepted external
images, no page errors and no horizontal page overflow. Screenshots go to ignored
`.sites-runtime/tests/challenge-start/artifacts/`.

On mobile, the starter detail deliberately fills the screen. The test returns
through its visible **목록** button before interacting with the main screen.
This is isolated Chromium emulation, not natural playthrough, a physical device
check or production deployment verification. Battle interactions and save codec
coverage live in the Node integration tests.

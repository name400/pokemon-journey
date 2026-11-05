Isolated real API form item lifecycle fixture (no account / production access).

Run Vite from the repository root:

```sh
npx vite tests/browser/active-form-items --config tests/browser/active-form-items/vite.config.mjs --host 127.0.0.1 --port 5224 --strictPort
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/active-form-items/check.mjs
```

Checks foreign held stone, Mega, and Ultra off/on with codec-backed POSTs and a page reload at 375px and 1280px. Writes results and screenshots to `.sites-runtime/tests/active-form-items`. Network artwork is stubbed; this test verifies controls, saved state, and layout, not artwork pixel accuracy.

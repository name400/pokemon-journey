# Royale bonus card browser check

Start the existing browser fixture with Vite:

```sh
node_modules/.bin/vite --config tests/browser/cloud-multi-reconnect/vite.config.mjs --host 127.0.0.1 --port 5235 tests/browser/cloud-multi-reconnect
```

Then run `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-royale-bonus/check.mjs`. The check uses a mocked API and verifies pickup and reload at desktop and mobile viewport sizes.

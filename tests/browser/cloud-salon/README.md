# Salon browser check

Start the existing local browser harness:

```sh
node_modules/.bin/vite --config tests/browser/cloud-multi-reconnect/vite.config.mjs --host 127.0.0.1 --port 5227 tests/browser/cloud-multi-reconnect
```

Then run `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-salon/check.mjs`. The check uses an in-memory mocked API, verifies selection, preview, a single purchase and persistence after reload at mobile and desktop sizes, and does not access production data. Set `SALON_PREVIEW_DIR` to write screenshots locally.

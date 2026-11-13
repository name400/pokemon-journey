Run the Vite fixture from the repository root, then run the browser check:

```sh
node_modules/.bin/vite --config tests/browser/cloud-multi-reconnect/vite.config.mjs --host 127.0.0.1 --port 5229 tests/browser/cloud-multi-reconnect
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-side80-pending/check.mjs
```

`TEST_URL` overrides the fixture address. The API and external images are mocked; this verifies the bag UI at mobile and desktop sizes, not D1 or production.

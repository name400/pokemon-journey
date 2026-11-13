Run the existing Vite fixture from the repository root:

```sh
node_modules/.bin/vite --config tests/browser/cloud-multi-reconnect/vite.config.mjs --host 127.0.0.1 --port 5227 tests/browser/cloud-multi-reconnect
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-medicine-shop/check.mjs
```

`TEST_URL` overrides the fixture URL. The route is mocked and images replaced; this checks the shop UI and reload at mobile and desktop sizes, not D1 or production accounts.

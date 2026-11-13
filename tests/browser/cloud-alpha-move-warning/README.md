Run the existing isolated Vite fixture from the repository root:

```sh
node_modules/.bin/vite --config tests/browser/cloud-multi-reconnect/vite.config.mjs --host 127.0.0.1 --port 5227 tests/browser/cloud-multi-reconnect
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-alpha-move-warning/check.mjs
```

The PC/mobile test mocks the world API and images. It verifies cancellation sends no request, confirmation sends a learn request, and level-up choice also warns; it does not access operational data.

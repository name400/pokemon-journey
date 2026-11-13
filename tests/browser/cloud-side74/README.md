Start the `cloud-multi-reconnect` Vite fixture on port 5227, then run:

```
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-side74/check.mjs
```

This uses a mocked API and substitute external images. It checks PC/mobile dialogue and the battle request; real rewards and save transactions are tested separately by the isolated API tests.

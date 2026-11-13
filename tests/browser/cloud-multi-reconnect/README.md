# Cloud multi-battle reconnect browser check

Run the Vite fixture from the repository root:

```sh
node_modules/.bin/vite --config tests/browser/cloud-multi-reconnect/vite.config.mjs --host 127.0.0.1 --port 5218 tests/browser/cloud-multi-reconnect
PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-multi-reconnect/check.mjs
```

The browser uses an in-memory mocked `/api/world`; it does not access player accounts or a database. A real multi-battle engine generates the saved turn. At mobile and desktop sizes, the check submits one turn, reloads while that turn's events remain in the saved response, and checks final HP, the next command and action count. Remote Pokémon images are replaced by empty test responses. This does not verify production D1 or real-device performance.

Run `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-multi-reconnect/continuation.mjs` against the same fixture to check a saved long companion-only battle, reload and continuation. The mock transport does not replace the route-level SQLite/revision test.

Run `PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/browser/cloud-multi-reconnect/mission37-triple.mjs` against the same fixture to check a real three-active engine turn and reconnect at mobile and desktop sizes. The transport is mocked and images are replaced, so this is not a D1, production artwork or physical-device test.

For the isolated local-D1 Worker route and browser path, run `node --test tests/cloud-adventure-mission37-d1.test.mjs` and `UI_TEST_URL=http://127.0.0.1:5218/ PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node tests/cloud-adventure-mission37-browser-d1.mjs`. The latter uses the Vite fixture above for the UI and an in-memory Miniflare D1 Worker for the real game route, replacing authentication and seeding deterministic enemy HP. Neither command accesses production data.

# Chunk failure recovery

Synthetic account and real Page; no production requests or saves.

```sh
node node_modules/vite/bin/vite.js --config tests/browser/chunk-recovery/vite.config.mjs --host 127.0.0.1 --port 5227 --strictPort
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/browser/chunk-recovery/check.mjs
```

Checks direct lazy load and focus-prefetch failure at 375/1280px, retained navigation, no horizontal overflow, no automatic navigation or POST, and explicit keyboard-triggered document reload. Recovery substitutes a simple successful module to isolate loading from game logic. Generated results are ignored under `.sites-runtime/tests/chunk-recovery`.

# Imprison side overlap

The pinned PokéRogue source defines Imprison as an opposing-side arena tag with `failOnOverlap` enabled, and its Imprison tag has a maximum of one layer and retains the original source:

- https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L6413
- https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/arena-tag.ts#L1018

In the native simulator, both active allies could apply Imprison, incorrectly restricting the union of their moves. New runs use `imprisonSideRule: source-v1` so a second active user on the same side fails while the first is active. Existing runs keep their old behavior; the flag is carried into battle snapshots.

The isolated engine tests cover both sides of doubles, PP, switching the first user out, a later successful use, snapshot and game-data encode/decode, and an old run. They do not establish full equivalence for all source edge cases, including same-turn faint/replacement, special called moves, or triple battles. No browser, real device, live server, or production data was tested.

Follow-up: although the move definition lists 100 accuracy, source `isFieldTargeted` includes the enemy side and its hit check bypasses accuracy and Protect. An isolated doubles test with -6 accuracy, +6 evasion and Protect confirms the local engine also applies Imprison in that case. No accuracy change was made. Source: https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/phases/move-effect-phase.ts#L325 and https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move-utils.ts#L21.

# Active challenge expansion, 2026-11-05

Reference: `/workspace/pokerogue-reference`, pinned `7c0881255af5cd51992e513ff93c2f71adbe40e0`. Work is on `cloud/pokerogue-continue-20261105`; Sites is outside this task.

## Batch 1: inverse, flip stats, limited support

- IDs 5, 6 and 8 use their original values; IDs 2/3 remain rejected.
- Inverse uses private Battle **and** BattleActions Dex chart views. Each defensive type is inverted independently; status immunities remain unchanged. Ground attack immunity bypasses Flying typing only, preserving Levitate, Magnet Rise, Telekinesis and Air Balloon. Thousand Arrows retains inverse effectiveness and its separate airborne bypass.
- Flip reverses `[hp, atk, def, spa, spd, spe]` base stats before juice/gateau, fusion averaging and vitamins. IVs/natures are not reversed. The saved per-Pokémon flag persists through stat recalculation, forms, evolution, capture and continued wild battles. Shared Adventure stat calculations remain unchanged without this explicit flag.
- Limited support 1 blocks biome-transition healing, 2 blocks paid post-wave supplies, 3 blocks both. Free reward availability is evaluated separately and is preserved. Existing source behavior for other event rewards is retained.
- Challenge ribbons use optional `other` string keys beside existing `generations`/`types`; support 3 awards no-heal, no-shop and no-support. Existing records are preserved and randomizer challenges do not invent source ribbons.
- UI additions stay in the existing collapsed challenge section, using existing controls/styles and plain descriptions.

Validation performed: new integration tests cover all native chart pairs in both Dex consumers; Ground actual damage/immunities; fusion/stat/IV/nature persistence through a real victory and continued wild restore; all support values through paid service, free reward and real `next` action; separate ribbon persistence. Challenge tests: 24 pass. Existing revive and battle/reward subset: 12 pass. Typecheck passes. Full suite/build and browser check are tracked below when completed.

Known scope: the adapter retains the existing engine's supported moves, abilities, forms and mystery event gates. This work does not activate source-disabled content or claim those unrelated systems have complete upstream parity.

Batch 1 results: full suite **689/689** passed (`/tmp/challenge-full-tests.log`); production build and typecheck passed. Changed-file lint has 0 errors and 7 pre-existing unused-variable warnings in the game/reward/starter files. After that run, a small follow-up ensures Flip is present in prepared starters and newly created Shedinja before the next battle; the new 6-test expanded file and evolution/start subset passed. Browser results are being collected independently by the parent.

First-batch browser verification (parent, isolated actual app/page + controller/API fixture): 390×844, 375×667, 844×390 and 1280×850 all passed starter choice/add → return to catalog → select the three challenges → start → verify saved challenges/Flip flag → reload. Zero page errors and page horizontal overflow. This is simulated local browser coverage, not physical device, real-account or deployed-site testing. The full-screen mobile detail panel must be exited with its existing back button before accessing the catalog's challenge controls.

## Batch 2: limited catch, permanent faint, passives

- ID7 preserves caught registration, candy, capture EXP and ball consumption while preventing party insertion outside wave `%10===1`. The teleport event's `pay`/`interface` routes permit joining; `inspect` does not. Full-party acceptance/reconciliation and event gift paths enforce the same condition.
- ID9 excludes revive/max revive/Sacred Ash from services and reward eligibility, rejects stale reward attempts, blocks player Revival Blessing and fainted fusion, and leaves fainted Pokémon unchanged during biome and event full-party healing. The source `PokemonInstantReviveModifier` (Reviver Seed) resolves before committed fainting and is intentionally still allowed. The source fusion holder is a **selection-invalid** flag, so its faint check prohibits fainted fusion.
- ID10 value1 grants passives to trainer opponents and the final boss; value2 grants them to every Pokémon. Existing passives remain present. All source passive IDs in the existing species/form adapter have native mappings. The final boss preserves its passive through its real phase change and JSON restore.
- New cases exercise actual capture actions, registration/candy, other-slot/Adventure preservation, paid/free revival rejection, switch/move availability, biome healing, seed pre-faint behavior, passive target classes and the actual final transformation. Expanded suite: **11/11**. Focused legacy capture/revive/seed/final subset also passes. This does not claim exhaustive interactions for every native ability.

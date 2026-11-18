# Defog cleanup success — 2026-11-18

The pinned source applies Defog's target-screen and terrain cleanup separately from its evasion effect: [move definition](https://github.com/pagefaultgames/pokerogue/blob/7c0881255af5cd51992e513ff93c2f71adbe40e0/src/data/moves/move.ts#L10167). In an isolated native battle with target evasion at -6, the engine removed Reflect or Electric Terrain but still emitted a move-failure event; this was reproduced before the fix.

New runs enable `defogCleanupSuccessRule: source-v1`. When the actual move callback removes one of the target's five source screens or an existing terrain, its result is considered successful. No pre-emptive cleanup is performed; protection still blocks the move. The existing fog wrapper remains active, and old runs without the new flag retain prior behavior.

Isolated tests cover each target screen, terrain, no effect, protection, Substitute, double-battle target and ally-side screens, PP, actual turn and encoded save/restore, new-run flag and another stored value. The related seven-file suite passed 61 tests. Browser UI, all terrain types, all ability interactions, reflected and called moves, real devices and live data were not tested.

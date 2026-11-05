# Source automatic forms R3 — implemented scope and Sol handoff

Pinned reference: `7c0881255af5cd51992e513ff93c2f71adbe40e0`. This is the continuation after the separately frozen R2 snapshot. No production/Sites operations, commit, or remote write was performed by this implementation agent. Per the user's usage-saving instruction, new Astra implementation stops after the confirmed Ogerpon state/ability defects; the following backlog is for Sol.

## Completed runtime paths

- Morpeko Hunger Switch toggles once per turn, preserves its current form across fresh battles, and respects Tera, suppression, Transform and source NoFusion restrictions. Aura Wheel obtains Electric/Dark from primary or donor Morpeko and remains usable by another legitimate learner, as in the source.
- Cramorant uses the source `HP >= 50%` gulping boundary, successful Surf and Dive paths, loaded-form persistence between continuous wild encounters, and base-form reset on withdrawal/new battle. Incoming move damage triggers payload before a lethal hit: quarter of attacker's current maximum HP and Defense reduction or paralysis. Dive, Substitute, protection/immunity and Magic Guard boundaries are tested.
- Battle Bond transforms the unfused source species 2658 into Ash form on a real move KO, synchronizes source/passive data, and resets on faint/new battle. Other species or fused holders get the source one-per-summon Attack/Sp. Atk/Speed boost, including a final wild KO; native Simple/other stage events remain active. Ash-primary Water Shuriken uses 20 power and three hits regardless of donor ability. A donor Ash does not confer that move condition. Actual Transform → copied attack → KO → underlying Ash/passive → save → switch-out/back is covered.
- Meloetta Relic Song changes the primary source form on a successful hit, supports primary fusion, and honors Single Type and main/passive Sheer Force. Donor Meloetta stays unchanged. Actual transformed primary-fusion Meloetta changes its underlying species and passive while retaining copied battle species, non-HP stats and ability until withdrawal.
- Xerneas uses exact native `xerneas` for source active and `xerneasneutral` for neutral. Entry, withdrawal, faint and fresh-battle reserve reset synchronize source identity. Both fusion roles, codec and unsplice are covered. This alias does not unlock any unavailable source form.
- Ogerpon all four Tera aliases and source Tera/lapse lifetime are connected. Native permanent `formeChange` previously risked replacing a primary fusion's donor ability. The local adapter now changes source metadata, effective stats, base ability and passive binding together, preserving the donor ability of a valid fusion. Source `getTeraType` uses the primary or donor mask (Grass/Water/Fire/Rock); only a primary Ogerpon receives the source Tera form trigger. Existing Orb/charge restrictions remain authoritative. Tera survives withdrawal and continuous wild encounters, lapses on fresh battle and faint, and never heals a fainted owner. Embody Aspect uses source post-summon behavior for other/fused holders too, with NoTransform, suppression and one native state per summon. Saving/restoring does not restart the boost.

The source-form helper sets its new metadata before native stat recalculation; this fixes repeated form changes in the same native battle using the previous form's base stats. The R2-only same-instance roundtrip tests cover Aegislash, weather Castform and Flip Schooling; parent integrated that narrow ordering fix separately into R2.

## Files owned by this unit

- `lib/rogue-automatic-forms.mjs`: source callbacks, trigger forms, scoped native Tera and Dive adapters.
- `lib/rogue-native-form.mjs`: Xerneas active and four Ogerpon Tera aliases, guarded by exact source base stats.
- `lib/rogue-dna-fusion.mjs`: reviewed identities for the newly connected forms.
- `lib/rogue-battle-engine.mjs`: approved create-combat reset calls now pass `{freshBattle:true}`; no other R3 engine edits by this agent.
- `tests/rogue-automatic-forms-second.test.mjs` (17), `tests/rogue-source-trigger-forms.test.mjs` (7), `tests/rogue-ogerpon-tera-forms.test.mjs` (6).
- Existing `tests/rogue-dna-reviewed-donor-flow.test.mjs`: reviewed count 213 → 232 and the source Ogerpon Tera-to-mask fresh-battle expectation.
- `scripts/audit-rogue-form-support.mjs`, generated `data/rogue-form-support-inventory.json`, generated fusion-palette form metadata.

Other agents own item-active state, transformations, DNA-stage, reward/growth paths, artwork and broader engine changes. This unit uses the separately implemented ordinary target-ID correction in `applyClassicSourceForm`; parent must integrate that correction with the R3 tests.

## Focused evidence

- Standard source automatic/passive/roundtrip/R3 trigger/Ogerpon plus existing Orb access regression: **63/63 pass**, `/tmp/forms-r3-final-focus.log`.
- Earlier R3 automatic-only standard 42 and Worker+palette 51 passed; these are historical subsets, not extra coverage counts.
- Changed-file ESLint: zero errors/warnings, `/tmp/forms-r3-final-lint.log`.
- Final Worker adapter using the same focused boundary tests plus palette: **72/72 pass**, `/tmp/forms-r3-final-worker.log`. Existing reviewed-fusion reward/save/unsplice/mixed-party regression: **12/12 pass**, `/tmp/forms-r3-donor-final.log`, including every one of 232 donor identities and 232 primary identities through real battle/codec paths. Initial failures were outdated count and Xerneas lifecycle expectations; the final run includes the corrected expectations. No full-project test/build/typecheck is claimed by this R3 agent; parent owns integrated checks.
- Codec tests preserve unrelated slots and Adventure data. These are local deterministic engine tests; no live account, deployed service, browser UX or physical device claims.

## Current inventory: permission versus behavior

The reproducible generator reports **416 non-base forms**, **354 permitted fusion forms**, **62 not connected for general fusion**, **95 static-family forms**, **28 ability-hook forms**, **9 explicit-trigger forms**, and **6 unresolved native identities**. The existing reward-flow test enumerates 232 reviewed donor identities, including 16 base identities; remaining permitted forms include separately supported persistent transformations. A permission count is not proof of every source acquisition route or every move/ability interaction.

All 544 exported evolution edges have their mechanical condition/target permission mapped. This is not 544 executed evolution transactions, and the generator does not infer source records absent from the export. All 320 ability enum entries are audited by name: 317 native identities match, three are placeholders/no native entry, zero name-mapping mismatches.

The six unresolved identities remain protected: Marshadow Zenith is source-unobtainable; five Revavroom Starmobiles are source-unobtainable/enemy-only. Do not enable ordinary acquisition or fusion. Eternamax also remains a separately implemented final-boss path rather than general player fusion.

## Remaining work for Sol (not started here)

1. **Keldeo Resolute**: connect source learned/forgotten Secret Sword triggers, not just native form permission. `lib/rogue-classic-growth.mjs` `queueClassicMoves` and `learnClassicPendingMove` are confirmed hooks; parent owns/coordinates starter initialization in `rogue-classic-state.mjs`. Actual TM/Memory learning in `rogue-classic-rewards.mjs` needs item-agent coordination. Generated foe initialization must also evaluate learned-form state. Keep primary-only source trigger dispatch; add actual learning/forgetting, save and fusion/unsplice tests.
2. **General item forms (52 currently unconnected forms)**: Deoxys 3; Dialga/Palkia/Giratina origins; Shaymin Sky; Arceus 17; Tornadus/Thundurus/Landorus/Enamorus Therian; Genesect 4; Hoopa Unbound; Silvally 17; Zacian/Zamazenta Crowned. Standalone item options may already exist; inventory marks general fusion integration absent, not universally absent gameplay. Extend the active-item agent's reviewed policy only after actual transition/ability/type/transfer behavior is tested.
3. **Arceus/Silvally require an actual native type adapter**: native species conditions inspect held Plate/Memory and otherwise return Normal, while source form modifiers are separate from the held slot. Source Multitype/RKS NoFusion rules also need their source interpretation. Judgment/Multi-Attack inspect primary or donor source species/form, not a generic native held item. Genesect Techno Blast similarly reads primary/donor source form. A whitelist-only change is insufficient.
4. **Terapagos Terastal/Stellar (2)**: source Tera Shift is NoFusion/NoTransform; Tera Shell and Teraform Zero need actual source form/lifetime, passive and stat recalculation integration. Native aliases exist; permission alone is not runtime support.
5. **52 + 1 + 2 + 6 protected + 1 final-boss-only = 62 inventory rows.** The six protected forms and boss-only row are not ordinary player-feature backlog. Native alias null count is now six, not the earlier eleven.
6. Additional interaction coverage remains possible even for implemented forms: arbitrary randomized main/passive combinations, all doubles targeting and every suppression/Transform ordering. Representative tests above define the verified boundary; do not report full original-engine equivalence.

Ogerpon non-Tera mask acquisition and active mask-item transfer are separate from the implemented Tera-state correction. This unit permits validated existing source mask identities; it does not claim to have completed the broader active-item acquisition workflow.

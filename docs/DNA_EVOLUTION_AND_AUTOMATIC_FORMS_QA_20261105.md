# DNA evolution, automatic forms and static-form closure — 2026-11-05

Reference: `/workspace/pokerogue-reference`, pinned `7c0881255af5cd51992e513ff93c2f71adbe40e0`. This continues the Nincada/Shedinja unit recorded separately in `DNA_NINCADA_EVOLUTION_QA_20261105.md` and does not change Adventure, production, Sites, source-disabled content, or other save slots. This document describes local implementation and tests; it is not a deployment report.

## Completed in this unit

- Secondary fusion evolution conditions 5 (party type), 10 (owned treasure tracker), 11 (stable holder identity rarity), and 15 (shared holder Deep Sea item) now use the existing source condition evaluator. A successful secondary Gimmighoul evolution removes only that holder's evolution tracker. Wrong threshold, owner, item or form remains rejected.
- Added exact permanent evolution identities: Spiky Pichu/Partner and Cosplay Pikachu, female Basculegion/Oinkologne, rare Maushold/Dudunsparce, roaming Gimmighoul, artisan Poltchageist/masterpiece Sinistcha, Rapid Strike Urshifu. Tests execute evolution, actual battle turn, storage codec, restore and unsplice.
- Corrected eight source/native numeric ability collisions (IDs 299–306) using the pinned enum names. All 317 named native abilities now resolve by name; NONE and placeholders 314/317 remain unresolved. New reference Pokémon have `rogueAbilitySourceRule: enum-name-v1`. Existing unversioned explicit saved abilities are not rewritten; exactly the eight former numeric aliases are accepted by fusion validation for those legacy records. Versioned records do not accept the wrong aliases.
- Added source form persistence hooks for Forecast, Flower Gift, Stance Change, both Zen Mode species, Schooling, all seven Shields Down colors, Zero to Hero, Disguise and Ice Face. These update source index/key, species/base stats/types, native stats, HP and appearance together, including trainer foes. They run through a per-battle Dex wrapper; the global native Dex is unchanged.
- Source battle-init resets, living/fainted boundaries, switch behavior, level/HP thresholds and NoFusion/NoTransform guards apply. Flip stat/HP changes use source increase-difference and decrease-clamp behavior; repeated restore does not repeatedly add HP. Temporary Dynamax maintains its multiplier. Disguise recoil uses source direct damage (including Magic Guard and HP-zero cases).
- Added 95 static forms from 18 species families: partner Eevee; Burmy/Wormadam; Shellos/Gastrodon; Rotom appliances; blue Basculin; Scatterbug/Spewpa/Vivillon patterns; Furfrou trims; Pumpkaboo/Gourgeist sizes; Oricorio styles; female Indeedee; Dada Zarude; Squawkabilly colors; Paldean Tauros breeds. Every one of these 95 forms runs both fusion roles, a real turn, codec/reload and unsplice (190 combinations). Spewpa patterns and west Gastrodon use narrow source-stat-checked native aliases. Persistent transformations remain subject to their separate flag validation.
- Regenerated fusion palette form metadata. No new encounter, starter unlock, reward or disabled source content was enabled merely by granting fusion validation.

## Source details that matter

- `src/data/abilities/init-abilities.ts` and `ab-attrs.ts` define the automatic conditions. Zen/Schooling/Shields Down/Zero to Hero/Disguise/Ice Face battle-init resets differ from ordinary switch-out resets. Zen is not reset merely by switching out; Palafin switches to Hero only while alive. Disguise returns to its intact form on faint; Ice Face does not gain that extra faint reset.
- Forecast and Flower Gift return to base when weather or ability/weather suppression no longer qualifies. In the pinned source Flower Gift's stat condition is written as `WeatherType.SUNNY || WeatherType.HARSH_SUN`, evaluating to SUNNY. The local stat multiplier follows that pinned condition, while both sun kinds can select its sunshine form. This is not a claim of standard-series parity.
- Source Disguise/Ice Face are damage-block abilities with NoFusion and NoTransform guards. Their intact form cannot grant immunity to fused Pokémon. Shield/core Minior source color indexes are preserved even when several colors share native species behavior.
- Source `battle-scene.ts:triggerPokemonFormChange` dispatches species triggers from the primary species. Remaining move/active triggers need primary-fusion transitions rather than assuming every automatic form has NoFusion. They have not been silently activated.

## Inventory and remaining scope

Run `node scripts/audit-rogue-form-support.mjs` to regenerate `data/rogue-form-support-inventory.json`. It inventories the existing exported metadata and explicitly separates permission from behavioral coverage:

| Inventory | Count |
|---|---:|
| Exported non-base forms | 416 |
| Fusion-permitted forms | 341 |
| Still outside fusion permission | 75 |
| Of those, no resolved native identity | 11 |
| Newly tested static-family forms | 95 |
| Automatic source-hook non-base forms | 24 |
| Evolution edges with condition/target-form permission | 544 |
| Evolution edges missing such permission | 0 |
| Source ability enum entries | 320 |
| Native-name mismatches | 0 |
| No native name (NONE/314/317) | 3 |

The 544-edge figure is a mechanical condition/target reachability inventory, **not 544 executed evolution transactions**. Existing exporter omissions are not inferred. The 341-form figure combines older persistent/item support, previous static families, and this unit; it does not mean every item/ability interaction was executed.

Remaining 75 rows identify native-alias gaps, non-reviewed static/battle families, and item/ability/move/tera trigger fusion gaps. Some already work standalone through existing item or native behavior. Notable remaining automatic source persistence work: Meloetta Relic Song (Single Type and Sheer Force exceptions), Xerneas active/inactive, Keldeo move learned/forgotten, Battle Bond Greninja, Gulp Missile Cramorant, Hunger Switch Morpeko, Ogerpon/Terapagos tera transitions. Morpeko's pinned implementation has two successive PostTurn attributes and requires explicit ordering review. Item-active lifetime and transfer are another agent's coordinated unit. Starmobile and other source-disabled/unknown forms remain rejected.

## Verification

- `node --test tests/rogue-automatic-forms.test.mjs tests/rogue-dna-static-forms.test.mjs tests/rogue-dna-evolution-remaining.test.mjs tests/rogue-dna-evolution.test.mjs tests/rogue-dna-nincada-evolution.test.mjs`: 49/49 pass (`/tmp/forms-final-standard.log`).
- Same set plus `tests/rogue-fusion-palette.test.mjs` under `--import ./tests/support/register-battle-runtime-loader.mjs`: 58/58 pass (`/tmp/forms-final-worker.log`). Palette generator drift check passes.
- Changed module/script/test ESLint: 0 errors, 0 warnings after removing one unused import (`/tmp/forms-lint.log`).
- Automatic test coverage includes actual attacks, King's Shield, weather changes/suppression, poison immunity, physical/special damage distinction, switch and faint, both fusion roles, trainer foes, wild-wave continuation, codec preservation and repeat restore. The static test asserts exactly 190 role combinations.
- Final aggregate tests/typecheck/build belong to the parent integration checkpoint. No live account, deployed site, physical device, or production save was used in these local tests.

## Pre-checkpoint correction: passive-changing forms

The additional enabled-passive review reproduced a real restore failure: Blade Aegislash stored `roguePassiveAbility: sharpness` while its native snapshot still contained `roguepassive:battlearmor`, so restore threw `Bind a fresh battle before initial entry`. Zen Darmanitan and core Minior reproduced the same mismatch. This was found and fixed before the parent checkpoint commit.

`rogue-ability-components.mjs` now has an explicit `replaceAbilityPassive` API used only by the reviewed form helper. It ends the previous passive, disables its pending callbacks, updates the current descriptor and serialized volatile, and starts the new passive immediately with independent Gas/Gastro Acid suppression. A stale entry callback cannot start an old component after replacement. The new component's lifecycle event target is its owner; this matters when Psychic Surge resumes after Gas leaves. That context rule is opt-in on replacement state, preserving existing bindings that never call this API. The ordinary component save/restore utility also serializes the updated descriptor.

`tests/rogue-form-passive-transition.test.mjs` adds nine regressions: all differing automatic source passives; entry Psychic Surge and non-refreshing restore; Gas suppression and same-turn departure in doubles; loss of passive Gas restarting opposing Intimidate; Gastro Acid; zero-HP and NoFusion; explicit descriptor save/restore and unchanged legacy binding; the actual form-triggering Slash receiving Sharpness immediately; and core Minior faint/codec restoration. The codec fixtures retain another slot and Adventure data.

After this correction, the new test plus automatic-form, Gas-component and passive-entry suites pass **31/31 standard tests** (`/tmp/form-passive-final.log`); changed-file ESLint and diff checks report no findings. The same **31/31 Worker tests** pass (`/tmp/form-passive-worker.log`), and the parent runs the final aggregate checkpoint checks against the corrected files. The earlier 49/58 results above are the preceding focused-stage evidence, not a claim that those aggregates were rerun after this correction.

# Primary Mega fusion, compatible stones and Weird Dream

Base: 6faf860; source: pinned 7c0881255af5cd51992e513ff93c2f71adbe40e0.

## Implemented scope

- Primary Mega Venusaur, Mega Charizard X/Y and Mega Blastoise can fuse after
  transformation, or transform an existing valid DNA fusion through the real
  form action. The four exact source/native form identities, base stats,
  intrinsic types, ability slot and flags are checked. A donor's ordinary ability
  remains active while the primary's updated ability is saved for unsplice.
  Primary base stats/types/passive follow the new primary form. Existing HP
  difference/clamp and challenge calculations are retained.
- Their form stones can move during fusion from a same-species donor to the
  compatible primary. Every stone must be a supported current Mega option.
  Duplicate, malformed, unknown or incompatible inventories reject the entire
  copied transaction. Ownership is saved on the primary, survives reload and
  unsplice, and allows a subsequent actual Mega form action. This is a bounded
  compatible-stone path, not general arbitrary form-item transfer.
- Unsupported fused form changes are filtered from available options and refused
  before assigning a changed party member. Previously the generic form function
  could replace the donor ability/types with the primary form's standalone
  values, producing an invalid fusion. The supported path now reconstructs and
  validates the fusion before committing it.
- New runs have `weirdDreamFusionRule: validated-v1`. Validated fused parties can
  naturally encounter Weird Dream. Transform replaces them with newly created,
  **unfused** Pokémon; donor Pokémon are not restored. Source
  `getTeamTransformations`/`doNewTeamPostProcess` generate fresh PlayerPokemon,
  copy held modifiers except FormChangeItem modifiers, and never copy fusion
  fields. Held effects, higher IV inheritance, moves and existing dex/candy rules
  remain handled by the existing adapter. The UI explicitly explains fusion/donor
  loss and form-item exclusion before selecting transform.
- The alternate battle uses the unfused generated enemy party while preserving
  the player's current fusion. Refusal lowers levels while retaining fusion and
  owned form items. All three choices work with the four reviewed primary Mega
  fusions. Old runs keep the earlier gate; malformed fused saves are not repaired
  by inventing missing information.

Source evidence: `PlayerPokemon.fuse` in field/pokemon.ts stores primary and donor
form/ability fields independently and transfers held modifiers;
`calculateBaseStats` calculates current primary and donor forms separately.
Weird Dream's functions in src/data/mystery-encounters/encounters/
weird-dream-encounter.ts create fresh species, then copy/filter held items.

## Verification and limits

`rogue-dna-primary-mega.test.mjs`: 4 cases × before/after fusion, actual form UI DTO
and action, generation eligibility, native battle victory, real encode/decode,
confirmed unsplice and retained form stone; corrupt identities and unsupported
transforms reject atomically. Same-species stone transfer uses the transaction,
reload, form action and unsplice; duplicates/incompatibility reject without loss.

`rogue-weird-dream-fusion.test.mjs`: natural encounter with fused party, cancel,
selection/codec/confirmation for all three branches, no alternate-battle dex
progress, inherited held items, actual alternate battle victory and once-only
rewards. Corrupt/legacy state rejection; all 4 Mega fusions × 3 Dream choices,
including retained/removal of form items and Mega bracelet preservation.

These are synthetic integration and seeded natural-encounter-generation tests,
not real-account natural play, physical-device or production verification.
Existing source RNG/UUID identity/trainer heuristic/move-effect limitations
continue to apply. Mega donor forms, other Mega primaries, Primal/Ultra/Max,
reverse/toggle variations, arbitrary form items and other complex event/held-item
combinations remain separate work. Mega fusion recoloring/asset availability has
not been exhaustively checked. Sites was not changed.

Final validation: **728/728 tests**, no failed/skipped
(`/tmp/mega-dream-final-full.log`, 134.8s); focused integration **8/8**.
Typecheck and production build exit0 (`/tmp/mega-dream-final-type.log`,
`/tmp/mega-dream-final-build.log`), repeated after clarifying the static UI warning
about excluded form items. Backend/test changed-file ESLint: 0 errors/warnings
(`/tmp/mega-dream-final-lint.log`). The touched app file has the same pre-existing
98 errors / 18 warnings as the base version; both versions were checked with the
same stdin filename/config (`/tmp/mega-app-baseline-lint.json`,
`/tmp/mega-app-current-lint.json`). This does not claim repository-wide lint is
clean. Diff whitespace check passes. No new deployment or real-account action.

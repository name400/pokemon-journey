# Cosmetic fusion forms and special held-effect transfer

Base c1f6226; pinned source 7c0881255af5cd51992e513ff93c2f71adbe40e0.

## Completed

The existing exact 15 form identities are extended with 45 permanent cosmetic
forms: Unown's other 27 glyphs, Deerling and Sawsbuck's three other seasons each,
and Flabébé/Floette/Florges' four other flower colors each. The pinned form
metadata must match species/index/key/resolved Pokémon ID and preserve intrinsic
base stats and types. These families cannot authorize unrelated or battle-triggered
forms. Existing native identity, ability and source-seed checks still apply.
Both primary and donor reward paths, primary reviewed evolution, challenge
validation and confirmed unsplice use the same predicate. Source
`PlayerPokemon.fuse` copies the component form index independently; no type/stat
change is introduced for these cosmetic families.

Fusion now transfers recorded Old Gateau and Shuckle Juice, including normal
manual-transfer-disabled records, as source fuse does through
`tryTransferHeldItemModifier`. Metadata and derived caches must agree. Gateau's
cap is 1; each juice flavor (10 or -15) has cap 2. Exact legacy separate rows can
be normalized while preserving every stack. Unknown fields, invalid values,
cache mismatches and overflow reject the entire copied transaction. Source can
lose capped overflow; the adapter keeps its existing no-loss refusal policy.

Important source details (modifier.ts and battle-scene.ts):
- `PokemonBaseStatTotalModifier.apply` uses statModifier once per modifier record,
  not once per stack. Both stacks remain owned; a flavor's stat effect is applied
  once. Existing unmarked saves retain their old local calculation; the new
  `rogueFusionSpecialHeldRule: source-v1` selects this rule after special transfer.
- A merged modifier is removed and re-added at the tail. Flavor order matters
  at the lower-stat clamp, so the transaction preserves that order.
- Old Gateau chooses the smaller stat in each original species-form pair before
  Flip's reversal; its +20 then participates in fusion averaging. The new rule
  implements this order without rewriting existing unmarked Pokémon.

The rule persists through actual unsplice and is copied into Weird Dream's
replacement party and alternate enemy preview. This supports the effects on a
previously unspliced Pokémon; it does **not** remove the active-fusion party guard
in Weird Dream. No source-disabled event is enabled.

## Evidence and remaining scope

The expanded integration file enumerates all 60 identities in both reward roles,
real battle actions, victories for primary cases, actual save codec and confirmed
unsplice, with other-slot/Adventure/coin preservation. Sea/fire mixed-party tests
also cover all 60 under the existing opt-in rule. New special-effect cases cover
retained positive/negative stacks, original-form Gateau selection with Flip,
cap/metadata/cache rejection, legacy separate rows, clamp-sensitive ordering,
unsplice and Weird Dream transform/alternate enemy effects. Tests use synthetic
state and representative battle actions, not natural production play or all
cross-products of forms/effects/challenges.

Remaining implementation: non-reviewed/battle-triggered fusion forms,
Mega/Primal/Ultra/Max, form-item transfers and unknown held effects, active fused
Weird Dream parties, complex event/passive/ability combinations and broader battle
parity. Remaining validation: real-account 1–200 play, physical mobile devices,
asset availability and every move/ability/form/effect combination. Sites unchanged.

The generated fusion palette form metadata was regenerated with the expanded
allowlist; its nine existing regeneration/target/palette tests pass. Atlas
availability and physical-device appearance are not claimed verified here.

Final frozen-code validation: **720/720 tests**, 0 failed/skipped
(`/tmp/held-final-all-tests.log`, 131.5s); typecheck/build exit0
(`/tmp/held-final-type.log`, `/tmp/held-final-build.log`); changed-code ESLint
0 errors/warnings (`/tmp/held-lint.log`); diff whitespace check passes.
Expanded form/effect integration: 12/12; existing palette checks: 9/9.
The earlier exploratory full run identified stale generated palette metadata;
that metadata was regenerated before this final complete run. No application
changes followed final validation.

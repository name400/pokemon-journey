# Reviewed donor forms in the actual DNA reward flow

Base: 718bc7d; pinned source: 7c0881255af5cd51992e513ff93c2f71adbe40e0.
Source `PlayerPokemon.fuse` (`src/field/pokemon.ts:6477`) copies the donor's
species, form index, ability, shiny variant and gender. Source fusion is not
limited to the two forms previously permitted by the local reward transaction.

The local preview/validation code already reviewed 15 exact donor identities,
but `stageClassicDnaFusion` permitted only Own Tempo Rockruff and antique
Sinistea. The reward's pair list uses that transaction, so the other reviewed
forms could not actually be selected. It now uses the existing exact identity
predicate, also permitting female Meowstic, midnight/dusk Lycanroc, low-key
Toxtricity, antique Polteageist and eight non-vanilla Alcremie cream forms.
The source form/species/ID, base stats, native identity and ability checks still
run; randomized abilities still need the existing seed proof. The primary
species restriction and the checks for opaque/untransferred items are preserved.
No new species/form identities are declared reviewed by this change.

`tests/rogue-dna-reviewed-donor-flow.test.mjs` exercises all 15 identities through
actual reward pair listing and selection, donor consumption, modifier transfer,
real encode/decode, a native battle action and confirmed game-action unsplice.
It checks donor form/ability/shiny/gender data, reserve party, other slot,
Adventure state and coins. Seven corrupt identity/stat/ability/flag variants and
an untransferred form item are rejected atomically. These are isolated synthetic
integration checks, not a real-account playthrough, browser/device validation,
asset availability verification, or exhaustive source-engine equivalence.

Remaining: primary special forms and Mega/Primal/Ultra/Max donors, form-item
transfer and unsupported held-effect combinations still need separate support.
The existing nature-preview rounding correction remains a separate small task.
Sites is managed separately by the user and was not changed.

Final validation: full suite **707/707**, no failed/skipped tests
(`/tmp/dna-reviewed-full.log`, 124.2s); typecheck and build exit0
(`/tmp/dna-reviewed-typecheck.log`, `/tmp/dna-reviewed-build.log`);
changed-code ESLint has zero errors/warnings; `git diff --check` passes.

## Follow-up: primary forms and held effects

The 15 exact form identities are now also accepted on the primary side, and
validation reconstructs each component's intrinsic form types. Reviewed primary
form evolution records its target form key. Existing Mega/Primal/Ultra/Max,
unknown-form, override and malformed-data restrictions are retained.

The source `PlayerPokemon.fuse` transfers all held modifiers via
`tryTransferHeldItemModifier`, even items whose normal manual transfer is off.
The local transaction now combines recorded Macho Brace stacks (1–50), recomputes
stats and preserves them after unsplice. Duplicate/opaque/inconsistent records
and cap overflow reject the transaction atomically. Source transfer can cap and
lose excess stacks; the adapter retains its explicit no-loss refusal policy.

Additional integration covers all 15 primary forms through reward listing,
selection, a real victory, codec, and confirmed unsplice; female Espurr's primary
form evolution; and Macho Brace merges including the 50-stack bonus boundary.
The new-run `mysteryReviewedFormsRule` also admits these 15 non-fused forms in
sea/fire mixed-party selection and confirmation. Both event types are exercised
for all 15 with save/reload and other-mode/slot preservation. Old runs keep
their narrower checks. Fusion/passive/unknown ability event combinations remain
outside this extension. The current remaining list supersedes the earlier
primary-form and preview-rounding entries above: `REMAINING_IMPLEMENTATION_CURRENT.md`.

Independent QA's confusion text error was reproduced in the latest formatter:
volatile `confusion` collided with the move name Confusion (염동력). The formatter
now distinguishes start/ongoing/end effects while retaining the move's name;
actual seeded Supersonic and battle restore are tested without changing its
battle rule. Nature preview boosts now use the source adapter's ceil, checked
against calculated stats for all natures in normal/Flip/Fresh Start modes.

Final follow-up validation: **715/715 tests**, 0 failed/skipped
(`/tmp/primary-dna-all-tests.log`, 126.4s). Focused suite 25/25, typecheck/build
exit0; changed-code ESLint 0 errors / 1 pre-existing unused-import warning in
rogue-mystery.mjs. `git diff --check` passes. No new real-account, physical-device,
production or asset availability check is claimed. Sites was not changed.

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

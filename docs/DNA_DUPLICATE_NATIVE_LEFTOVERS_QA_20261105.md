# DNA duplicate native Leftovers preservation

Base: b0d661a. Pinned reference: 7c0881255af5cd51992e513ff93c2f71adbe40e0.

## Implemented unit

A primary and donor both carrying native `item: 'leftovers'` previously failed
DNA reward staging because the primary native slot was occupied. The real DNA
reward candidate, confirmation and action now support that exact conflict.
The primary keeps its native Leftovers. The donor's one copy is represented by
the existing `leftovers` held modifier on the primary. Existing Leftovers
modifier rows from both participants are consolidated, with the combined two
native copies plus modifier counts limited to four. No item is silently dropped.

This retains the primary's native item-presence behavior instead of clearing
both native slots. It reuses existing battle modifier behavior; it does not
introduce new item effects or claim parity for every item-sensitive move.

Source `PlayerPokemon.fuse` transfers all held modifiers through
`tryTransferHeldItemModifier`. `TurnHealModifier` has a four-copy cap.
The reference can fail or truncate transfers before removing the donor. This
adapter retains its documented no-loss transaction policy: a total above four,
invalid counts, unknown metadata, non-null typeBoost or explicit native
nontransferability rejects the copied stage. An error later in staging also
leaves the original party, modifiers and reward intact.

The staging change uses `lib/rogue-dna-native-items.mjs` and the call in
`lib/rogue-dna-fusion-stage.mjs`. `lib/rogue-classic-rewards.mjs` also counts
native Leftovers in reward eligibility, direct additions, both native/modifier
manual transfers and Trash to Treasure's automatic allocation. A holder already
above the cap is preserved: additions are refused, automatic allocation selects
another eligible holder, and moving existing copies away remains allowed.
No shared game/engine/transformation edits or new save schema/active-state map
were required. A donor's original item remains
in the existing historical fusion snapshot; this is not another owned item, and
unsplice does not recreate the donor.

## Evidence

New `tests/rogue-dna-native-items.test.mjs`: **8/8**, including:

- Totals two, three and four; both participants' modifiers, original run and
  unrelated party/items preserved.
- Real DNA reward candidates and explicit confirmation, next battle, actual
  gzip save codec, two owned inventory entries and duplicate reward refusal.
- Restored battle performs two real Splash turns with both native and modifier
  healing; subsequent confirmed unsplice and codec retain both items without
  restoring the donor.
- Overflow, zero count, opaque active metadata, nontransferable modifier/native
  flags, incompatible typeBoost and an unrelated unsupported donor modifier
  reject without consuming the selected reward, party or items.
- Existing native-to-empty-slot transfer and other native conflict refusal
  continue unchanged.
- Subsequent rewards/direct grants and both manual-transfer representations
  include the native copy in their cap. Automatic grants skip full holders.
  Legacy native1 + modifier4 records survive codec without deletion, and one
  existing copy can be moved away normally.

Standard focused regression: **35/35** across the new file and existing fusion
stage, reward flow, unsplice and manual transfer tests
(`/tmp/astra-native-leftovers-final.log`). Existing Trash flow/natural tests:
**2/2** (`/tmp/astra-native-leftovers-trash.log`). Worker new/manual-transfer
coverage **9/9**, plus existing Trash coverage **2/2**
(`/tmp/astra-native-leftovers-worker-final.log`,
`/tmp/astra-native-leftovers-trash-worker.log`). Changed code ESLint: **0 errors**;
rewards.mjs retains the same two unused-variable warnings as HEAD, while the new
helper/stage/test have none (`/tmp/astra-native-leftovers-lint-final.log`,
`/tmp/astra-native-leftovers-lint-baseline.log`). Whole-suite/type/build outcomes
belong to the parent's integrated validation; they are not claimed here.

The action dispatcher updates its run timestamp before rejecting a repeated
reward action; the no-duplication assertion allows only that existing timestamp
change, while asserting identical remaining document state. API failures do not
persist the rejected working copy.

## Remaining scope

This is one supported native collision, not complete item transfer parity.
Other conflicting native items, unknown effect metadata, form modifiers'
independent active states and all automatic reactivation sequences remain
unsupported/unverified. Battle theft/Pickup have separate item-selection and cap paths and are not
comprehensively audited in this change. Existing healing rounding/order and
item-dependent move behavior are not comprehensively changed here.

No source-disabled content was enabled. No production/Sites, remote Git or
commit writes were performed. The earlier operational 409/PC causes remain
unconfirmed even though the user reports the symptoms are currently resolved.

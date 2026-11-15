# Mega research history protection

The common reward path records Mega Stone research even when an ordinary item
is obtained. Previously, recording rebuilt the saved list from known IDs and
discarded unknown IDs or replaced an unrecognized container. That could erase
future-format research history during an otherwise unrelated reward.

Mixed lists now retain their original entries and append recognized missing
stones, including proven Emporium purchases. Lists containing only known IDs
keep their existing canonical sorted behavior. Unknown non-array containers are
left intact; the item or reward still proceeds, but its research registration is
deferred until a compatible reader exists. No inventory or owned Pokémon are
migrated. Research points still count only known stones.

The targeted unit suite and the isolated API sync/exchange test passed, including
unknown history, re-entry, the exchange, currency and held-item preservation.
The exact Sites merge, deployed D1 and real player data were not tested.

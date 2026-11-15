# Research counter save protection

Battle wins, evolution and activity recording previously treated malformed or
future counters as zero and then overwrote them with the current format. The
recorders now leave unrecognized values intact, while still updating other
independently valid counters and allowing the underlying game action. Missing
legacy counters retain their existing zero-based behavior. An activity container
with an unknown version, an array, or a non-object is preserved as a whole.
No migration or retroactive credit is attempted; unrecognized counters still
need a future compatible reader before their progress can be recorded.

Zone 13 remains an approximate layout, not a completed original map. Attempts
to inspect the detailed Gamer Guides and Nintendo Life/WikiDex source images
were denied (HTTP 403); text descriptions alone do not establish the missing
ground-level geometry. The failure record in testfailed.md remains unchanged.
Representative research unit tests and isolated mission/bench API tests passed;
the deployed Sites merge and live data were not tested.

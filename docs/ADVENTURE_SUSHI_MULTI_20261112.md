# Sushi High Roller: multi-opponent courses

[Original course reference](https://www.serebii.net/legendsz-a/sidemissions/fullcourseofbattles%3Ahighrolling.shtml) describes three opponents at once. The existing turn-based simulator supports two simultaneous enemy slots and a reserve, so new five-course runs use two active foes and the third enters later. This is an approximation, not the original three-active battle. The existing opponent data and reward conditions remain in place.

A `multiV1` flag is set only when starting a new run. An old saved run without it keeps the sequential format, including any already saved battle. Battle results preserve the existing course progression, experience, research count, reward claim and loss recovery. No migration rewrites existing Pokémon or completion flags.

The API tests cover two targets, reload and forfeiture, a legacy course, and both five-course reward paths. For repeatable progression/reward testing, the enemies are set to 1 HP and asleep; that does not establish normal-play difficulty or balance. A separate test exercises an unmodified opening turn.

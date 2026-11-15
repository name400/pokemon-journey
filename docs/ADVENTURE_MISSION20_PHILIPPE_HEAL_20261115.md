# Mission 20: Philippe's post-battle recovery

[StrategyWiki](https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Request_from_the_Rust_Syndicate)
and the [Pokémon Wiki walkthrough](https://pokemon.fandom.com/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Walkthrough/Main_Mission_19_%E2%80%94_23)
both report that Philippe heals the player's Pokémon after their battle at the
Rust Syndicate headquarters. These are secondary sources; the original game was
not independently tested here.

Newly started Mission 20 Philippe battles now restore all owned party members'
HP, status and PP after victory, after the usual experience is awarded. The
existing stage and 3,008-coin reward remain unchanged. A battle created before
this change keeps its old completion behavior, and no completed save is
retroactively changed. The normal loss and forfeit handling remains in place.

An isolated API test covers a new victory, fainted reserve, progress, reward,
re-entry, ownership details and an already-running legacy battle. The existing
Mission 26 opponent and optional-recovery API test also passes. The exact Sites
merge, production D1 and original hardware were not tested; testfailed.md is
unchanged.

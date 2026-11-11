# Magenta Street lower bank and sewer

[Mission 20 walkthrough](https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate) describes descending to the canal near Magenta Pokémon Center to enter the sewer and clear 27 crystals. [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/The_Sewers) identifies this as the smaller Magenta Street sewer, separate from the Bleu sewer. [PowerPyx](https://www.powerpyx.com/pokemon-legends-z-a-moon-stone-location/) notes that the area remains accessible after the cleanup.

A separate lower bank is connected to the existing center approach by a ramp, and its door leads to the existing cleanup map. Mission 20's start, return and report work there; after cleanup the player can re-enter without resetting progress. The former canal and Vernal draft accesses remain for existing saves. Ramp coordinates, bank geometry and sewer interior are provisional. This does not reproduce the original sewer's wild Pokémon or exact floor plan; unrestricted pre-mission access is not implemented. Existing Zone 14 substation connections and unlock checks are unchanged.

## Exploration and Pokémon

The door now allows exploration before the mission without starting it; an omitted legacy mission stage is normalized to zero. The exact original earliest unlock is unconfirmed, so this early access is provisional. During stages 8–9 the existing mission start/continue actions take precedence; the 27 crystals appear only during stage 9. Older standalone map calls without a stage retain their original crystal layout.

[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/The_Sewers) identifies Ariados, Inkay, Skrelp and Noibat in the Magenta section. [Dexerto](https://www.dexerto.com/wikis/pokemon-legends-z-a/pokemon-legends-z-a-lumiose-sewer-guide/) lists Noibat at night. [RankedBoost](https://rankedboost.com/pokemon/location/legends-z-a/sewers/) supplies overall sewer level ranges, not Magenta-specific placements. Eight marked floor tiles use the existing turn-based random encounter and capture system; spawn points, 25% encounter rate, equal weights and applying the listed generic levels to this section are approximations, not observed Z-A values. The original wandering creatures, individual respawns and exact sewer geometry remain unimplemented.

## Visible field Pokémon

Ariados, Inkay, Skrelp and nighttime Noibat now appear as field sprites using the existing field encounter model. Each moves in a small bounded area after every four player steps; contact starts a turn-based battle, and a nearby player can target and throw a standard ball. The server stores positions and spent state across reconnects and respawns the individuals on leaving the sewer, without resetting the crystal mission. Movement prediction waits for authority near these creatures. The previous marked-floor random encounters remain available.

These are four provisional individuals, not a reconstruction of original spawn coordinates, water/air behaviours, free-running movement, population or respawn timing. Noibat's night visibility follows the cited sewer guide; levels and roaming bounds are estimates. Visual appearance and responsiveness were not measured on the production device.

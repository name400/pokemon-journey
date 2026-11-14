# Bleu Sector 1 ground connection

The [location reference](https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/bleu-sector-1.html) places Bleu Plaza southwest of Bleu Sector 1, Bleu Sector 3 south of it, and most of the sector in Wild Zone 5. It also places officer Rancun near Bleu Plaza; [Side Mission 66](https://www.serebii.net/legendsz-a/sidemissions/investigatingwithshuppet.shtml) involves that officer and Shuppet.

The new compressed 2D street links the existing plaza and Sector 3 screens in both directions and provides another location to interact with the existing mission 66 officer. The older officer location and the existing direct Zone 5 entrances are retained for save and route compatibility. No quest progress or inventory migration is required.

The street, green edge, building frontage, coordinates and collision are provisional; the source does not establish their exact layout or elevation. The green edge is visual and does not add wild encounters. The screen connects directly to the existing Zone 5 ground map through a continuous pavement seam, not a separate gate: [Poképédia](https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_5) describes the zone as including Sector 1 and lists four external entrances. The compressed maps retain older exits for save compatibility, so their total is not an exact representation of those four entrances. The screen also connects west to Bleu Street, east to Vernal Avenue and north to Centrico through provisional transitions. Original in-game heights and collisions have not been independently verified here.

Representative checks cover the transitions, existing Zone 5 exits, walking to the officer, quest acceptance, tracked objective, saved position and restoration. PC and mobile screenshots use a mocked API; actual Sites and original hardware were not tested.

## Encounter lifetime across the shared zone

Crossing the Sector 1 / Zone 5 seam previously cleared Zone 5's consumed-encounter ledger as if the player had left the zone. The seam now retains that ledger, while leaving Sector 1 for an external district or using map travel applies the existing zone-exit cleanup. Unknown future ledger formats are preserved on the new Sector 1 cleanup paths. Existing shiny records and claimed items are not reset by this change. Zone-wide encounter renewal and timing remain this game's existing approximation and have not been verified against original hardware.

An isolated SQLite API test captures the Zone 5 alpha, crosses the seam in both directions with reloads, then exits to Bleu Plaza; it checks the consumed state, another encounter's shiny record, the party and wallet. A separate check covers known and unknown ledger formats during map travel. These checks do not validate the deployed Sites merge.

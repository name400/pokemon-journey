# Wild Zone 6 southern bridge connection

[Nintendo Life's Zone 6 guide](https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-6-guide-all-pokemon-and-alphas) describes southern approaches over and under the bridge. The existing Saison canal screen already had two links to the lower Zone 6 canal layer; the ground-level Zone 6 bridge did not link directly to the canal screen's bridge.

The new bidirectional transition joins those upper walking surfaces. The two lower transitions and existing Zone 6 exits remain available, with the saved layer explicitly set to ground when entering from the bridge. No saved positions, items, encounters, or unlock conditions are migrated. Gate positions, bridge alignment, and height are compressed 2D approximations; the exact original collision and gate coordinates are not established by the guide. A direct request for the Nintendo Life Zone 5 map image returned HTTP 403, so that image was not examined or used.

Representative tests cover upper and lower transition layers, actual walking to the existing promenade bridge, reload, inventory progress, party and wallet preservation. They use an isolated SQLite API, not the live Sites deployment or original hardware.

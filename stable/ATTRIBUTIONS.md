# Data, art and engine sources

Verified on 2026-11-02. The game uses the following distinct sources; a software license does not grant ownership of Pokémon characters or original game artwork.

| Content | Source / version | Use and conditions |
| --- | --- | --- |
| Species, forms, Korean names, growth, evolution conditions and raw learnsets | [PokéAPI CSV](https://github.com/PokeAPI/pokeapi/tree/6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce/data/v2/csv), pinned commit `6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce` | Imported by `scripts/import-pokedex.mjs`. PokéAPI's BSD-style notice is retained at `public/licenses/pokeapi.txt`; retain copyright, conditions and disclaimer and do not imply endorsement. Pokémon names/trademarks remain with their owners. |
| Battle rules, current level learnsets and compatible move pools | [`@pkmn/sim` 0.10.12](https://github.com/pkmn/ps/tree/main/sim) | MIT; license retained at `public/licenses/pkmn-sim.txt`. Generated catalogs in `data/rules.json`, `learnsets-modern.json` and `move-pools.json`. Modern custom singles, not every historical cartridge ruleset. |
| Pokémon art and sprites, including shiny variants | [PokéAPI sprites](https://github.com/PokeAPI/sprites), [repository documentation](https://github.com/PokeAPI/sprites/blob/master/README.md) | Remote official-artwork/default sprite paths. Repository documents distribution/use of sprites; original character/artwork rights remain separate. Some cosmetic form records share art, and missing assets use fallback. No blanket commercial art license or rights-holder endorsement is claimed. |
| Trainer portraits | [Pokémon Showdown trainer directory](https://play.pokemonshowdown.com/sprites/trainers/) | Original Gen III trainer sprite paths. Character and image rights remain with Nintendo, Game Freak, The Pokémon Company and relevant original rights holders. The Showdown client source (AGPL) was not copied. |
| Gym/Elite Four/Champion party references | [Pokémon Database FRLG](https://pokemondb.net/firered-leafgreen/gymleaders-elitefour), [Serebii Elite Four](https://www.serebii.net/fireredleafgreen/elitefour.shtml) | Species/level factual reference; parties use modern move/rule data and custom progression. Descriptive articles and page artwork were not copied. |
| Roguelike inspiration | [PokéRogue](https://github.com/pagefaultgames/pokerogue) | Conceptual reference only; no code/assets copied. This implementation has independent progression, accounts and storage. |
| Ranked PvP inspiration | [Pokémon Champions gameplay](https://champions.pokemon.com/en-us/gameplay/) | Conceptual reference only. This game's monthly Elo tiers and matchmaking are its own rules, not the official ranking formula. |
| UI icons | [Lucide](https://lucide.dev/license), dependency in lockfile | ISC license, distributed dependency notice retained by package. |

Runtime images currently depend on the remote repositories above. `components/pokemon-image.tsx` handles loading failures with sprite and local fallbacks. The app does not sell Pokémon assets or use real-money gacha.

## UI revision assets (2026-11-02)
- New battle backgrounds public/game/battle/*.svg are original code-native vector artwork created for this project.
- Kenney [Tiny Town](https://kenney.nl/assets/tiny-town) and [Tiny Battle](https://kenney.nl/assets/tiny-battle) are CC0, retained under public/game/town/ with original license notices. They are available for the later exploration revision.
- NeoDunggeunmo font from the [official webfont kit](https://github.com/neodgm/neodgm-webfont), SIL OFL 1.1. Font and full license retained in public/fonts/.
- Battle sprites use the same PokeAPI sprite repository credited above (Showdown GIF/front/back with PNG fallback). Reduced-motion uses static PNG.
- UI research: [PokéRogue controls](https://wiki.pokerogue.net/gameplay:controls), [settings](https://wiki.pokerogue.net/gameplay:settings), [official Pokémon Champions overview](https://www.youtube.com/watch?v=pOfW-qdsvpU). No PokéRogue code or art was copied.

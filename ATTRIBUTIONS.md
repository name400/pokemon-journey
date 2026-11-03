# Data, art and engine sources

Verified on 2026-11-02. The game uses the following distinct sources; a software license does not grant ownership of Pokémon characters or original game artwork.

| Content | Source / version | Use and conditions |
| --- | --- | --- |
| Species, forms, Korean names, growth, evolution conditions and raw learnsets | [PokéAPI CSV](https://github.com/PokeAPI/pokeapi/tree/6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce/data/v2/csv), pinned commit `6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce` | Imported by `scripts/import-pokedex.mjs`. PokéAPI's BSD-style notice is retained at `public/licenses/pokeapi.txt`; retain copyright, conditions and disclaimer and do not imply endorsement. Pokémon names/trademarks remain with their owners. |
| Battle rules, current level learnsets and compatible move pools | [`@pkmn/sim` 0.10.12](https://github.com/pkmn/ps/tree/main/sim) | MIT; license retained at `public/licenses/pkmn-sim.txt`. Generated catalogs in `data/rules.json`, `learnsets-modern.json` and `move-pools.json`. Modern custom singles, not every historical cartridge ruleset. |
| Pokémon art and sprites, including shiny variants | [PokéAPI sprites](https://github.com/PokeAPI/sprites), [repository documentation](https://github.com/PokeAPI/sprites/blob/master/README.md) | Remote official-artwork/default sprite paths. Repository documents distribution/use of sprites; original character/artwork rights remain separate. Some cosmetic form records share art, and missing assets use fallback. No blanket commercial art license or rights-holder endorsement is claimed. |
| Trainer portraits | [Pokémon Showdown trainer directory](https://play.pokemonshowdown.com/sprites/trainers/) | Local copies and remote trainer sprite paths; many sprites are fan-made. Artist credits are recorded per asset in `data/rogue-trainer-appearance.json`; the source requests artist credit and permission before editing. Missing artist information does not imply permission. Character and image rights remain with the respective rights holders. A complete user-facing artist credit list and permissions review remain outstanding. |
| Gym/Elite Four/Champion party references | [Pokémon Database FRLG](https://pokemondb.net/firered-leafgreen/gymleaders-elitefour), [Serebii Elite Four](https://www.serebii.net/fireredleafgreen/elitefour.shtml) | Species/level factual reference; parties use modern move/rule data and custom progression. Descriptive articles and page artwork were not copied. |
| Roguelike inspiration | [PokéRogue](https://github.com/pagefaultgames/pokerogue) | Rules and metadata are derived from source commit `29441f7aa7482d9e816b253d324293788936dc3e`, including normalized trainer rules; see metadata in `data/rogue-*.json`. The local ball atlas includes unchanged upstream assets: `pb.json` is marked AGPL-3.0-only and `pb.png` LicenseRef-FAIR-USE by upstream; see `public/game/balls/README.md` and its notices. That label is the upstream authors’ claim, not a grant of rights. A complete dependency, data and artwork license review remains necessary before release. |
| Ranked PvP inspiration | [Pokémon Champions gameplay](https://champions.pokemon.com/en-us/gameplay/) | Conceptual reference only. This game's monthly Elo tiers and matchmaking are its own rules, not the official ranking formula. |
| UI icons | [Lucide](https://lucide.dev/license), dependency in lockfile | ISC license, distributed dependency notice retained by package. |

Runtime images currently depend on the remote repositories above. `components/pokemon-image.tsx` handles loading failures with sprite and local fallbacks. The app does not sell Pokémon assets or use real-money gacha.

## UI revision assets (2026-11-02)
- New battle backgrounds public/game/battle/*.svg are original code-native vector artwork created for this project.
- Kenney [Tiny Town](https://kenney.nl/assets/tiny-town) and [Tiny Battle](https://kenney.nl/assets/tiny-battle) are CC0, retained under public/game/town/ with original license notices. They are available for the later exploration revision.
- NeoDunggeunmo font from the [official webfont kit](https://github.com/neodgm/neodgm-webfont), SIL OFL 1.1. Font and full license retained in public/fonts/.
- Battle sprites use the same PokeAPI sprite repository credited above (Showdown GIF/front/back with PNG fallback). Reduced-motion uses static PNG.
- UI research: [PokéRogue controls](https://wiki.pokerogue.net/gameplay:controls), [settings](https://wiki.pokerogue.net/gameplay:settings), [official Pokémon Champions overview](https://www.youtube.com/watch?v=pOfW-qdsvpU). This UI research note does not describe the later imported PokéRogue-derived data and ball assets; see the table above.

### Team Star vehicle images

The five 966 `*-starmobile.png` front images are linked unchanged from [PokéRogue assets](https://github.com/pagefaultgames/pokerogue-assets/tree/fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba/images/pokemon), commit `fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba`; the five atlas JSON files each describe one 94 × 94 frame. The upstream [README](https://github.com/pagefaultgames/pokerogue-assets/blob/fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba/README.md) states its assets are licensed to the extent possible under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) unless otherwise noted: attribution, noncommercial use and share-alike requirements apply. Upstream credits are listed in [PokéRogue credits](https://github.com/pagefaultgames/pokerogue/blob/beta/CREDITS.md); the individual sprite artists and Pokémon IP rights have not been independently established. This notice is not permission from the Pokémon rights holders. Verify per-asset attribution and all rights before release or commercial use; the URL is remote and may fail offline.

### Arceus and Silvally type-form sprites

The front/back animated models and static dex images for the 17 type forms of each species are linked unchanged from [Smogon / Pokémon Showdown sprites](https://github.com/smogon/sprites/tree/d98f9e5b35e23500bdffdd1237d5482bdee9be49/src), commit `d98f9e5b35e23500bdffdd1237d5482bdee9be49`. The repository identifies the sprite collection but does not establish a blanket license or permission from Pokémon rights holders for these assets. Individual rights and attribution remain to be verified before release. The static dex image is front-facing even when motion is reduced for the player's side; remote links require network access.

The three Castform weather models and static dex images are also linked from the same pinned Smogon sprite repository and have the same unresolved rights and attribution status. Reduced-motion rendering uses the front-facing static image.

Wishiwashi's solo and school models and static dex images likewise use the same pinned Smogon sprite repository, with the same unresolved rights and attribution status.

Morpeko's full-belly and hangry animated models and Gen 5-style static sprites also use the same pinned Smogon sprite repository, with the same unresolved rights and attribution status.

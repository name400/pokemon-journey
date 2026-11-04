# Data, art and engine sources

Verified on 2026-11-02. The game uses the following distinct sources; a software license does not grant ownership of Pokémon characters or original game artwork.

| Content | Source / version | Use and conditions |
| --- | --- | --- |
| Species, forms, Korean names, growth, evolution conditions and raw learnsets | [PokéAPI CSV](https://github.com/PokeAPI/pokeapi/tree/6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce/data/v2/csv), pinned commit `6b8db7f3cb31cfaa37cb74e5c3edff124bcba5ce` | Imported by `scripts/import-pokedex.mjs`. PokéAPI's BSD-style notice is retained at `public/licenses/pokeapi.txt`; retain copyright, conditions and disclaimer and do not imply endorsement. Pokémon names/trademarks remain with their owners. |
| Battle rules, current level learnsets and compatible move pools | [`@pkmn/sim` 0.10.12](https://github.com/pkmn/ps/tree/main/sim) | MIT; license retained at `public/licenses/pkmn-sim.txt`. Generated catalogs in `data/rules.json`, `learnsets-modern.json` and `move-pools.json`. Modern custom singles, not every historical cartridge ruleset. |
| Pokémon art and sprites, including shiny variants | [PokéAPI sprites](https://github.com/PokeAPI/sprites), [repository documentation](https://github.com/PokeAPI/sprites/blob/master/README.md) | Remote official-artwork/default sprite paths. Repository documents distribution/use of sprites; original character/artwork rights remain separate. Some cosmetic form records share art, and missing assets use fallback. No blanket commercial art license or rights-holder endorsement is claimed. |
| Trainer portraits | [Pokémon Showdown trainer directory](https://play.pokemonshowdown.com/sprites/trainers/) | Selected trainer sprites are tracked in `data/rogue-trainer-appearance.json`; identified artist details and unresolved variants are recorded there. Character and image rights remain with the relevant rights holders; a blanket commercial art license is not asserted. The Showdown client source (AGPL) was not copied. |
| Gym/Elite Four/Champion party references | [Pokémon Database FRLG](https://pokemondb.net/firered-leafgreen/gymleaders-elitefour), [Serebii Elite Four](https://www.serebii.net/fireredleafgreen/elitefour.shtml) | Species/level factual reference; parties use modern move/rule data and custom progression. Descriptive articles and page artwork were not copied. |
| Roguelike rules and selected asset | [PokéRogue, pinned commit `29441f7aa7482d9e816b253d324293788936dc3e`](https://github.com/pagefaultgames/pokerogue/tree/29441f7aa7482d9e816b253d324293788936dc3e) | Static rule, starter, biome, trainer and TM facts are extracted into `data/rogue-*.json`; source files are marked AGPL-3.0-only. The Poké Ball atlas under `public/game/balls/` is an upstream asset with separate character/artwork rights and is not asserted to have a blanket commercial license. Independent code does not import or execute upstream functions. See each data file's metadata and the asset notice for provenance and limitations. |
| Ranked PvP inspiration | [Pokémon Champions gameplay](https://champions.pokemon.com/en-us/gameplay/) | Conceptual reference only. This game's monthly Elo tiers and matchmaking are its own rules, not the official ranking formula. |
| UI icons | [Lucide](https://lucide.dev/license), dependency in lockfile | ISC license, distributed dependency notice retained by package. |

Runtime images currently depend on the remote repositories above. `components/pokemon-image.tsx` handles loading failures with sprite and local fallbacks. The app does not sell Pokémon assets or use real-money gacha.

## UI revision assets (2026-11-02)
- New battle backgrounds public/game/battle/*.svg are original code-native vector artwork created for this project.
- Kenney [Tiny Town](https://kenney.nl/assets/tiny-town) and [Tiny Battle](https://kenney.nl/assets/tiny-battle) are CC0, retained under public/game/town/ with original license notices. They are available for the later exploration revision.
- NeoDunggeunmo font from the [official webfont kit](https://github.com/neodgm/neodgm-webfont), SIL OFL 1.1. Font and full license retained in public/fonts/.
- Battle sprites use the same PokeAPI sprite repository credited above (Showdown GIF/front/back with PNG fallback). Reduced-motion uses static PNG.
- UI research: [PokéRogue controls](https://wiki.pokerogue.net/gameplay:controls), [settings](https://wiki.pokerogue.net/gameplay:settings), [official Pokémon Champions overview](https://www.youtube.com/watch?v=pOfW-qdsvpU). Later roguelike work uses the pinned static data and Ball atlas identified above; it must not be described as asset-free.

## Additional reference and local UI assets (2026-11-03)
- The user supplied `pokerogue-beta.zip` (SHA-256 `96051486E0198CDC6F7C63436D87531D4802AE1C147715EDEED77734303B76A9`). Its package reports version 1.12.2.3 and declares Phaser 4.2.1; it does not include its assets or locales submodules. Selected source and license files are kept locally in the ignored reference directory `work/pokerogue-user-beta-20261103`; the archive has no verified commit identifier. It was consulted for rules and animation design, not executed or copied wholesale into the application. See the source archive's LICENSE and REUSE.toml for its file-specific conditions.
- The voucher SVGs in `public/game/vouchers/`, egg SVGs in `public/game/eggs/`, and item fallback SVGs in `public/game/items/` are project-created code-native graphics. Hatch rays, cracks, condition effects and terrain tints are implemented in project CSS. These assets are not original PokéRogue sprites.
- The original PokéRogue [asset repository](https://github.com/pagefaultgames/pokerogue-assets) supplies a separate REUSE manifest and identifies noncommercial/share-alike terms and exceptions for its assets; the exact license and rights for any individual asset must be checked before using it. No asset from the uploaded ZIP's absent asset submodule was imported in this step.
- Additional Korean move descriptions in `lib/move-description.mjs` are independently written summaries of the installed `@pkmn/sim` move metadata (MIT notice above). They describe that engine's rules and do not establish that every named move is available or fully equivalent to PokéRogue in this game.
- Battle type symbols are loaded from the [PokéAPI sprites Scarlet/Violet type-symbol directory](https://github.com/PokeAPI/sprites/tree/master/sprites/types/generation-ix/scarlet-violet/small). These represent game artwork, with underlying rights retained by their respective owners; the repository does not itself establish a blanket commercial license.

- `public/game/battle/biomes/*.svg`: 프로젝트에서 직접 생성한 35종 바이옴 배경. 생성 코드: `scripts/build-rogue-biome-backgrounds.mjs`; 원작 게임 이미지가 아닙니다.

- 전투 크기 보정: 설치된 @pkmn/sim 종 데이터의 키(heightm)를 `scripts/build-battle-heights.mjs`로 추출. 실제 키 그대로 비례하지 않고 화면 가독성을 위해 범위를 제한해 표시한다.

- public/game/town/rock.svg: 프로젝트 제작 바위 타일. 잘못 참조한 Tiny Town 소품 좌표를 대체한다.

- public/game/trainers/rival-local.svg: 프로젝트 제작 임시 라이벌 초상화이며 원작 이미지는 아닙니다.
- public/game/trainers/bug-superfan.png: © 2025 Chani von Karpa, CC-BY-NC-SA-4.0. PokéRogue assets fb8ccb6의 trainer/bug_type_superfan.png를 변경 없이 사용(파일 이름만 변경). Git blob 64f644b4f5719530df40771b6c927962fb11a39d. 원본 images/REUSE.toml의 개별 항목을 확인했다. 공개 출처 화면은 public/game/trainers/pokerogue-credits.html, 전체 라이선스는 public/licenses/pokerogue-bug-superfan-CC-BY-NC-SA-4.0.txt에 보관한다.

## UI and simulator references (2026-11-04)
- Additional female trainer portraits are unchanged PNGs from the same official Showdown trainer directory. Their exact source URLs, content hashes, verification details and available artist captions are recorded in data/rogue-trainer-appearance.json. Public artist credits are regenerated from that manifest by scripts/write-trainer-credits.mjs. Absence of an artist caption is not a public-domain or blanket commercial-license assertion. Portraits not matched to the explicit source identity remain generic fallbacks.
- public/game/tm-icons/: project-drawn disc silhouettes and type-specific colors, incorporating the existing credited Scarlet/Violet type-symbol PNGs as embedded images. Embedding does not change their underlying artwork rights; no commercial artwork license is asserted.
- lib/simulator-reference-codec.mjs: project-written compatibility adapter for the installed MIT @pkmn/sim reference serializer. Fixed reference tags prevent production class-name mangling from corrupting reloads. The dependency's license remains in public/licenses/pkmn-sim.txt.


- data/starter-option-descriptions.json의 특성 한국어 설명은 설치된 MIT @pkmn/sim 0.10.12의 설명을 바탕으로 프로젝트에서 요약·번역했다. scripts/localize-starter-abilities.mjs로 재생성하며, 포켓로그 전용 볼줍기/꿀모으기/도주 효과 설명은 해당 프로젝트 구현을 따른다. 효과 동등성 전수 확인을 뜻하지 않는다.


- `data/rogue-mysterious-challengers-dialogue-ko-pinned.json` is the Korean Mysterious Challengers dialogue from [PokéRogue locales, commit 616cf3eb6b1b15e48784ff138ca7748ea63ed258](https://github.com/pagefaultgames/pokerogue-locales/blob/616cf3eb6b1b15e48784ff138ca7748ea63ed258/ko/mystery-encounters/mysterious-challengers-dialogue.json). The locale repository is distributed under AGPL-3.0; see the existing locale attribution and license discussion above.
- `data/rogue-weird-dream-dialogue-ko-pinned.json` is the [Korean Weird Dream dialogue at PokéRogue locales commit 616cf3eb6b1b15e48784ff138ca7748ea63ed258](https://github.com/pagefaultgames/pokerogue-locales/blob/616cf3eb6b1b15e48784ff138ca7748ea63ed258/ko/mystery-encounters/weird-dream-dialogue.json). The locale repository is distributed under AGPL-3.0; see the existing locale attribution above.

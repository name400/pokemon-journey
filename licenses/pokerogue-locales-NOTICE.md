# PokéRogue Korean dialogue attribution

`data/rogue-dialogue-ko-pinned.json` and `data/rogue-stat-trainer-dialogue-ko-pinned.json` contain selected Korean strings from [PokéRogue Locales](https://github.com/pagefaultgames/pokerogue-locales), commit `616cf3eb6b1b15e48784ff138ca7748ea63ed258`. That commit is the `locales` submodule recorded in PokéRogue commit `7c0881255af5cd51992e513ff93c2f71adbe40e0`.

The source repository declares the GNU Affero General Public License, version 3, reproduced in [pokerogue-locales-AGPL-3.0.txt](pokerogue-locales-AGPL-3.0.txt). The JSON files here are modified extracts: unsupported trainers, languages, and gender variants were omitted; selected strings themselves are unchanged. Application code strips source presentation directives before rendering, so source expression sprites and timing are not reproduced.

`data/rogue-bug-superfan-dialogue-ko-pinned.json` contains the Korean Bug-Type Superfan dialogue file from the same commit, unchanged.

`data/rogue-dancing-lessons-dialogue-ko-pinned.json` contains the Korean Dancing Lessons dialogue file from the same commit, unchanged; the game substitutes names and Korean particles and omits sound directives when displaying it.

`data/rogue-safari-dialogue-ko-pinned.json` contains the Korean Safari Zone dialogue file from the same commit, unchanged; selected strings are displayed by the game.

`data/rogue-salesman-dialogue-ko-pinned.json` contains the Korean Pokémon Salesman dialogue file from the same commit, unchanged; selected strings are displayed by the game.

The root project has no project-wide license file and `package.json` declares no license. Compatibility and the obligations of distributing or offering the combined application over a network have not been determined. AGPL section 13 describes source availability for covered modified versions used over a network. Do not treat this notice as a license-compatibility determination.

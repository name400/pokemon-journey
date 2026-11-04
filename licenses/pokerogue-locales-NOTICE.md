# PokéRogue Korean dialogue attribution

`data/rogue-dialogue-ko-pinned.json` and `data/rogue-stat-trainer-dialogue-ko-pinned.json` contain selected Korean strings from [PokéRogue Locales](https://github.com/pagefaultgames/pokerogue-locales), commit `616cf3eb6b1b15e48784ff138ca7748ea63ed258`. That commit is the `locales` submodule recorded in PokéRogue commit `7c0881255af5cd51992e513ff93c2f71adbe40e0`.

The source repository declares the GNU Affero General Public License, version 3, reproduced in [pokerogue-locales-AGPL-3.0.txt](pokerogue-locales-AGPL-3.0.txt). The JSON files here are modified extracts: unsupported trainers, languages, and gender variants were omitted; selected strings themselves are unchanged. Application code strips source presentation directives before rendering, so source expression sprites and timing are not reproduced.

`data/rogue-bug-superfan-dialogue-ko-pinned.json` contains the Korean Bug-Type Superfan dialogue file from the same commit, unchanged.

`data/rogue-dancing-lessons-dialogue-ko-pinned.json` contains the Korean Dancing Lessons dialogue file from the same commit, unchanged; the game substitutes names and Korean particles and omits sound directives when displaying it.

`data/rogue-safari-dialogue-ko-pinned.json` contains the Korean Safari Zone dialogue file from the same commit, unchanged; selected strings are displayed by the game.

`data/rogue-salesman-dialogue-ko-pinned.json` contains the Korean Pokémon Salesman dialogue file from the same commit, unchanged; selected strings are displayed by the game.

`data/rogue-dark-deal-dialogue-ko-pinned.json` contains the Korean Dark Deal dialogue file from the same commit, unchanged; the game substitutes names and Korean particles when displaying it.

The root project has no project-wide license file and `package.json` declares no license. Compatibility and the obligations of distributing or offering the combined application over a network have not been determined. AGPL section 13 describes source availability for covered modified versions used over a network. Do not treat this notice as a license-compatibility determination.

`data/rogue-winstrate-dialogue-ko-pinned.json` contains the Korean Winstrate encounter dialogue from the same pinned locale commit, unchanged.

`data/rogue-winstrate-trainer-dialogue-ko-pinned.json` contains the five Winstrate trainer dialogue entries from the same pinned Korean `ko/dialogue.json`; their Korean names are from `ko/trainer-names.json` at the same commit.

`data/rogue-training-dialogue-ko-pinned.json` contains the Korean Training Session encounter dialogue from the same pinned locale commit, unchanged.

`data/rogue-dialogue-ko-full-pinned.json` and `data/rogue-double-dialogue-ko-pinned.json` preserve the complete `ko/dialogue.json` and `ko/dialogue-double-battle.json` JSON contents from the same pinned locales commit, with local filenames changed. They expand the earlier selected extract; they do not replace the underlying license. `data/rogue-trainer-dialogue-index.json` is a generated reference index derived from the user-provided PokéRogue source `src/data/dialogue.ts` and `src/data/double-battle-dialogue.ts`. The source ZIP SHA-256 is recorded in that file. These referenced source files declare AGPL-3.0; the existing AGPL license text is retained. The project-written importer parses literal TypeScript AST nodes without executing the upstream code.

Regenerate the index with `node scripts/import-rogue-trainer-dialogues.mjs <extracted-source>/src/data/dialogue.ts <extracted-source>/src/data/double-battle-dialogue.ts`. Runtime resolves source references to pinned Korean strings, preserves `$` page boundaries, and omits the original portrait-expression and delay directives when rendering text. Source expression sprites, all trainer gender generation, and all associated animations have not been reproduced merely by importing these strings.

`data/rogue-trash-dialogue-ko-pinned.json` contains the Korean Trash to Treasure encounter dialogue from the same pinned locale commit, unchanged.

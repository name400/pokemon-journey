# Kenney Tiny environment tiles

Official, unmodified pixel art used for the new Canvas field renderer.

- **Tiny Town 1.1** — https://kenney.nl/assets/tiny-town
- **Tiny Battle 1.0** — https://kenney.nl/assets/tiny-battle (only environment/water rectangles are mapped)
- Author: **Kenney** (https://kenney.nl)
- Both official asset pages explicitly list **Creative Commons CC0**. Original archive notices are retained in `LICENSE.txt` and `TERRAIN-LICENSE.txt`.
- CC0 terms: https://creativecommons.org/publicdomain/zero/1.0/
- Verified/downloaded 2026-11-02. No Nintendo/Pokémon/PokéRogue game files were copied into this directory.

## Files

| File | Dimensions | Notes |
| --- | --- | --- |
| `tilemap.png` | 192×176 | Original Tiny Town `Tilemap/tilemap_packed.png`, 12 columns × 11 rows |
| `terrain.png` | 288×176 | Original Tiny Battle `Tilemap/tilemap_packed.png`, 18 columns × 11 rows |
| `sample.png` | 918×516 | Original Tiny Town sample; composition reference only |
| `tiles.json` | — | 89 named source rectangles, palette, sheet metadata, 3 house layouts, source hashes |

## Renderer contract

`tiles.json` uses **source pixel coordinates**, not tile indices. Every rectangle has `x`, `y`, `w`, `h`; default image is `/game/town/tilemap.png`. Rectangles from the supplementary water sheet override `image` with `/game/town/terrain.png`. Packed sheets have 16-pixel tiles and **zero spacing**. Set `context.imageSmoothingEnabled = false` and draw at integer pixel multiples for crisp rendering.

```js
const tile = manifest.tiles.grass;
const sheet = loadedImages[tile.image || manifest.image];
ctx.drawImage(sheet, tile.x, tile.y, tile.w, tile.h,
  destX, destY, tile.w * scale, tile.h * scale);
```

The `buildings` layouts are arrays of named 16×16 tiles. `anchor` is the door's tile position inside that layout. For an interaction tile at `(mapX,mapY)`, a centered building starts at `(mapX-anchor.x,mapY-anchor.y)`. A four-row house needs sufficient map margin; `compactHouse` fits in three rows. Visual collision/door interaction must remain consistent with server map rules.

- `tree`: 16×32 (two tiles high); bottom tile is trunk/base.
- `forest`: 48×48 tree-canopy group (three columns/rows), useful for blocked woodland boundaries.
- `water` is interior water. `waterNorth/West/...` provide shoreline corners/edges; `waterSingle` is a bounded pond tile.
- Tiny Town grass/path colors were read from actual tile pixels: grass `#84c669`, path `#eaa56c`; supplementary water `#75e3ff`.

The original PNGs have not been recolored, cropped, or otherwise edited. Temporary enlarged/labeled atlas and building inspection PNGs were generated only under ignored `.sites-runtime/` for QA; they are not runtime assets.

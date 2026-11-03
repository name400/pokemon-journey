import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async name => JSON.parse(await fs.readFile(path.join(root, 'data', name), 'utf8'));
const [pokedex, rules, localization, mapping, names] = await Promise.all([
  read('pokedex.json'), read('rules.json'), read('localization.json'),
  read('pokemon-appearance.json'), read('item-names.json'),
]);
const oldAppearanceIds = Object.fromEntries(Object.entries(rules.species)
  .map(([id, record]) => [record.key, Number(id)]).reverse());
const expectedNames = Object.fromEntries(Object.entries(localization.items)
  .map(([id, name]) => [id.replaceAll('-', ''), name]));
Object.assign(expectedNames, { gimmighoulcoin: '모으령 코인', meltancandy: '멜탄 사탕' });
assert.deepEqual(names, expectedNames, 'Every prior item label must remain available');
for (const mon of pokedex) assert.equal(mapping.artById[mon.id], mon.artId || mon.id);
for (const [key, id] of Object.entries(oldAppearanceIds)) {
  assert.equal(mapping.artByBattleKey[key], pokedex.find(mon => mon.id === id)?.artId || id, key);
}

const testDirectory = path.join(root, '.sites-runtime/tests');
await fs.mkdir(testDirectory, { recursive: true });
const output = path.join(testDirectory, 'pokemon-image.mjs');
const result = await build({
  absWorkingDir: root,
  entryPoints: ['components/pokemon-image.tsx'],
  outfile: output,
  bundle: true, format: 'esm', platform: 'node', metafile: true,
  external: ['react', 'react/jsx-runtime'],
});
const forbidden = /(?:lib\/(?:game|pokemon-config)\.mjs|data\/(?:pokedex|rules|learnsets[^/]*|localization)\.json)$/;
assert.ok(!Object.keys(result.metafile.inputs).some(file => forbidden.test(file)), 'Image component must not pull in battle catalogs');
const { default: PokemonImage, pokemonArtId, pokemonImageSources } = await import(pathToFileURL(output).href);
for (const mon of pokedex) assert.equal(pokemonArtId(mon), mon.artId || mon.id);
for (const [key, id] of Object.entries(oldAppearanceIds)) {
  const expected = pokedex.find(mon => mon.id === id)?.artId || id;
  assert.equal(pokemonArtId({ id: 25, battleAppearance: key }), expected);
}
assert.equal(pokemonArtId({ id: 999999, artId: 25 }), 25);
assert.equal(pokemonArtId({ id: 25, battleAppearance: 'unknown-appearance' }), 0, 'Unknown transformations must not masquerade as the base form');
assert.ok(pokemonImageSources(25, true, 'battle', 'back', false)[0].endsWith('/other/showdown/back/shiny/25.gif'));
assert.ok(pokemonImageSources(25, true, 'battle', 'back', true)[0].endsWith('/back/shiny/25.png'));
assert.ok(pokemonImageSources(25, false, 'battle', 'front', true).every(url => !url.endsWith('.gif')));
assert.deepEqual(pokemonImageSources(25, false, 'sprite', 'front', false).length, 2, 'Do not retry the identical failed sprite');
const html = renderToStaticMarkup(React.createElement(PokemonImage, {
  mon: { id: 25, name: '피카츄', shiny: true }, variant: 'battle', facing: 'back', eager: true,
}));
assert.ok(html.includes('/back/shiny/25.png'), 'SSR should start with a static, motion-safe image');
assert.ok(html.includes('색이 다른 모습'));

const itemBuild = await build({
  absWorkingDir: root, entryPoints: ['lib/item-display.mjs'], write: false,
  bundle: true, format: 'esm', platform: 'browser', metafile: true,
});
assert.ok(!Object.keys(itemBuild.metafile.inputs).some(file => file.endsWith('localization.json')));
console.log(JSON.stringify({
  formRecords: pokedex.length,
  battleAppearances: Object.keys(oldAppearanceIds).length,
  itemNames: Object.keys(names).length,
  imageModuleBytes: result.metafile.outputs[Object.keys(result.metafile.outputs)[0]].bytes,
  itemModuleBytes: itemBuild.outputFiles[0].contents.length,
  result: 'all display, shiny/back-facing and lightweight-import checks passed',
}));

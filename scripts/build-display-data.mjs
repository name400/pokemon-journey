import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = async name => JSON.parse(await fs.readFile(path.join(root, 'data', name), 'utf8'));
const [pokedex, rules, localization] = await Promise.all([
  read('pokedex.json'), read('rules.json'), read('localization.json'),
]);

// Preserve the old renderer's lookup precedence, including the lowest numeric ID when
// several cosmetic records resolve to the same simulator appearance key.
const artById = Object.fromEntries(pokedex.map(mon => [mon.id, mon.artId || mon.id]));
const artByBattleKey = Object.fromEntries(Object.entries(rules.species)
  .map(([id, record]) => [record.key, artById[id] || Number(id)])
  .reverse());
const itemNames = Object.fromEntries(Object.entries(localization.items)
  .map(([id, name]) => [id.replaceAll('-', ''), name]));
Object.assign(itemNames, { gimmighoulcoin: '모으령 코인', meltancandy: '멜탄 사탕' });

await Promise.all([
  fs.writeFile(path.join(root, 'data', 'pokemon-appearance.json'), JSON.stringify({ artById, artByBattleKey }) + '\n'),
  fs.writeFile(path.join(root, 'data', 'item-names.json'), JSON.stringify(itemNames) + '\n'),
]);
console.log(JSON.stringify({
  appearanceRecords: Object.keys(artById).length,
  battleAppearances: Object.keys(artByBattleKey).length,
  itemNames: Object.keys(itemNames).length,
}));

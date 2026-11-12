// Generate from PokeAPI pokemon_stats.csv at the pinned revision documented in
// data/pokedex-source.json. Pass the CSV path as the first argument.
import {readFile,writeFile} from 'node:fs/promises';
const path=process.argv[2];if(!path)throw Error('pokemon_stats.csv 경로가 필요합니다.');
const rows=(await readFile(path,'utf8')).trim().split(/\r?\n/);if(rows.shift()!=='pokemon_id,stat_id,base_stat,effort')throw Error('CSV 열을 확인하세요.');
const out={};for(const row of rows){const [id,stat,,effort]=row.split(',').map(Number);if(!Number.isSafeInteger(id)||id<=0||!Number.isInteger(stat)||stat<1||stat>6||!Number.isInteger(effort)||effort<0||effort>3)throw Error('CSV의 노력치 값을 확인하세요.');(out[id]??=[0,0,0,0,0,0])[stat-1]=effort;}
await writeFile(new URL('../data/adventure-ev-yields.json',import.meta.url),JSON.stringify(out)+'\n');

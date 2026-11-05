import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {rogueReferenceData,sourceMove} from '../lib/rogue-reference.mjs';
import {Dex} from '@pkmn/sim';
const root=process.argv[2];if(!root)throw Error('Usage: node scripts/audit-source-egg-moves.mjs <pinned-source-directory>');
const commit=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(commit!=='7c0881255af5cd51992e513ff93c2f71adbe40e0')throw Error('Unexpected source revision');
const source=fs.readFileSync(root+'/src/data/balance/moves/egg-moves.ts','utf8');
const rows=[...source.matchAll(/\[SpeciesId\.(\w+)\]:\s*\[([^\]]*)\]/g)];
const byName=new Map(Object.values(rogueReferenceData.species).map(s=>[s.enumName,s]));
const byId=new Map(Object.entries(rogueReferenceData.enums.MoveId).map(([name,id])=>[id,name]));
const seen=new Set(),ids=new Set();let differences=0;
for(const [,name,body] of rows){if(seen.has(name))throw Error('Duplicate source species '+name);seen.add(name);const sourceNames=[...body.matchAll(/MoveId\.(\w+)/g)].map(m=>m[1]);const record=byName.get(name);if(!record)throw Error('Missing species '+name);const local=record.eggMoves||[];if(JSON.stringify(local.map(id=>byId.get(id)))!==JSON.stringify(sourceNames)){console.error('Mismatch:',name);differences++;}for(const id of local)ids.add(id);}
for(const row of Object.values(rogueReferenceData.species))if(row.eggMoves?.length&&!seen.has(row.enumName)){console.error('Extra local species:',row.enumName);differences++;}
let numericDifferences=0;for(const id of ids){const expected=Dex.moves.get(byId.get(id)?.toLowerCase().replaceAll('_',''));const numeric=Dex.moves.all().find(m=>m.num===id);if(!expected.exists||!numeric||expected.id!==numeric.id||!sourceMove(id)){console.error('Move mapping mismatch:',id,byId.get(id));numericDifferences++;}}
console.log(JSON.stringify({sourceCommit:commit,species:rows.length,uniqueMoves:ids.size,differences,numericDifferences}));if(differences||numericDifferences)process.exitCode=1;

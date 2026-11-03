// Exercise the production team loader with isolated in-memory ownership rows.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import {makeMon} from '../lib/game.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const rows=new Map([['own',{user:'player-a',data:JSON.stringify(makeMon(1,5))}],['other',{user:'player-b',data:JSON.stringify(makeMon(4,5))}]]);
globalThis.__pvpTestEnv={DB:{prepare(sql){assert.match(sql,/WHERE id=\? AND user_id=\?/);return {bind(id,user){return {async first(){const row=rows.get(id);return row?.user===user?{data:row.data}:null;}};}};}}};
let source=await fs.readFile(new URL('../lib/match.ts',import.meta.url),'utf8');
source=source.replace("import {env} from 'cloudflare:workers';",'const env=globalThis.__pvpTestEnv;').replace("import {settleRating} from './rating';",'const settleRating=async()=>{};');
source=source.replace(/from\s*(['"])(\.\.?\/[^'"]+)\1/g,(_,quote,specifier)=>`from '${new URL(specifier,pathToFileURL(root+'lib/match.ts')).href}'`);
const code=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {ownedTeam}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const own=await ownedTeam('player-a',['own']);assert.equal(own.length,1);assert.equal(own[0].boxId,'own');assert.equal(own[0].id,1);assert.equal(own[0].level,50);
await assert.rejects(()=>ownedTeam('player-a',['other']),/본인 소유/);await assert.rejects(()=>ownedTeam('player-a',['own','other']),/본인 소유/);await assert.rejects(()=>ownedTeam('player-a',['own','own']),/1–6/);await assert.rejects(()=>ownedTeam('player-a',[{id:'own',level:100}]),/1–6/);await assert.rejects(()=>ownedTeam('player-a',['missing']),/본인 소유/);
console.log('PvP team loader accepts only unique IDs belonging to the current player and builds from saved data.');

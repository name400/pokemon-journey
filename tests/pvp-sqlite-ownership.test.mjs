// In-memory ownership rows; no live player data or match service is used.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import {makeMon} from '../lib/game.mjs';

const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE pokemon_box(id TEXT PRIMARY KEY,user_id TEXT,data TEXT); CREATE TABLE saves(user_id TEXT PRIMARY KEY,data TEXT)');
const insert=sqlite.prepare('INSERT INTO pokemon_box VALUES (?,?,?)');insert.run('owned','alice',JSON.stringify(makeMon(1,12)));insert.run('other','bob',JSON.stringify(makeMon(4,20)));
sqlite.prepare('INSERT INTO saves VALUES (?,?)').run('alice',JSON.stringify({classic:{adminCollection:[{...makeMon(7,5),boxId:'rogue-only'}]}}));
globalThis.__pokemonPvpTestEnv={DB:{prepare(sql){return {bind(...args){return {async first(){return sqlite.prepare(sql).get(...args)??null;}};}};}}};
await fs.mkdir('.sites-runtime/tests',{recursive:true});await build({entryPoints:['lib/match.ts'],outfile:'.sites-runtime/tests/pvp-match-sqlite.mjs',bundle:true,format:'esm',platform:'node',external:['@pkmn/sim'],plugins:[{name:'isolated-workers',setup(builder){builder.onResolve({filter:/^cloudflare:workers$/},()=>({path:'workers',namespace:'test-workers'}));builder.onLoad({filter:/.*/,namespace:'test-workers'},()=>({contents:'export const env = globalThis.__pokemonPvpTestEnv;',loader:'js'}));}}]});const {ownedTeam}=await import('../.sites-runtime/tests/pvp-match-sqlite.mjs');
const team=await ownedTeam('alice',['owned']);assert.equal(team.length,1);assert.equal(team[0].boxId,'owned');assert.equal(team[0].id,1);assert.equal(team[0].level,50);
await assert.rejects(ownedTeam('alice',['other']),/본인 소유/);await assert.rejects(ownedTeam('alice',['owned','other']),/본인 소유/);await assert.rejects(ownedTeam('alice',['owned','owned']),/1–6/);await assert.rejects(ownedTeam('alice',[{id:'owned',level:100}]),/1–6/);await assert.rejects(ownedTeam('alice',['missing']),/본인 소유/);await assert.rejects(ownedTeam('alice',['rogue-only']),/본인 소유/);
delete globalThis.__pokemonPvpTestEnv;sqlite.close();console.log('Isolated SQLite: PvP team loader accepts only unique Pokémon owned by the current player.');

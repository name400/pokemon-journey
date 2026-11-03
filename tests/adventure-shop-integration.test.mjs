// Real route and real SQLite transactions, with only D1 transport/auth/entropy adapted
// in memory. No preview, credentials, existing DB or production state is touched.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {DatabaseSync} from 'node:sqlite';
import {fileURLToPath,pathToFileURL} from 'node:url';
import ts from 'typescript';
import {makeMon,moves,effectiveness} from '../lib/game.mjs';
import {configure} from '../lib/pokemon-config.mjs';
import {createCombat} from '../lib/party-battle.mjs';
import {fieldPath,findTile,interactionAt} from '../lib/adventure-world.mjs';
import {personTile} from '../lib/adventure-field-core.mjs';
import {visibleWildTile} from '../lib/adventure-visible-wild.mjs';
import {gymPuzzle} from '../lib/adventure-gym.mjs';
import {arenaTrainer} from '../lib/adventure-arena.mjs';
import {gainExperience,victoryExperience} from '../lib/growth.mjs';
import {adventureClockTime} from '../lib/adventure-clock.mjs';
import {TRAINERS,encounterPool} from '../lib/campaign.mjs';

const root=fileURLToPath(new URL('../',import.meta.url)),sql=new DatabaseSync(':memory:');
for(const name of (await fs.readdir(new URL('../drizzle/',import.meta.url))).filter(n=>/^\d.*\.sql$/.test(n)).sort())sql.exec(await fs.readFile(new URL('../drizzle/'+name,import.meta.url),'utf8'));
function prepare(query,args=[]){return {bind(...values){return prepare(query,values);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}};}};}
globalThis.__adventureEnv={DB:{prepare,async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}}};
globalThis.__adventureUser={userId:'adventure-qa',displayName:'탐험테스트'};globalThis.__adventureRandom=()=>.999;
async function loadTS(relative){
 let source=await fs.readFile(new URL('../'+relative,import.meta.url),'utf8');
 source=source.replace(/import\s*\{\s*env\s*\}\s*from\s*['"]cloudflare:workers['"];?/g,'const env=globalThis.__adventureEnv;');
 source=source.replace(/import\s*\{\s*getChatGPTUser\s*\}\s*from\s*['"]@\/app\/chatgpt-auth['"];?/g,'const getChatGPTUser=async()=>globalThis.__adventureUser;');
 source=source.replace("const random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296;","const random=()=>globalThis.__adventureRandom();");
 const inventoryURL=relative!=='lib/inventory.ts'?await loadTS('lib/inventory.ts'):null;
 source=source.replace(/from\s*(['"])(@\/[^'"]+|\.\.?\/[^'"]+)\1/g,(_,quote,specifier)=>{
  if(specifier==='@/lib/inventory')return `from '${inventoryURL}'`;
  const url=specifier.startsWith('@/')?pathToFileURL(root+specifier.slice(2)):new URL(specifier,new URL('../'+relative,import.meta.url));return `from '${url.href}'`;
 });
 const emitted=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
 return 'data:text/javascript;base64,'+Buffer.from(emitted).toString('base64');
}
const route=await import(await loadTS('app/api/shop/route.ts'));

const version='adventure-2026-11-04-v1';
async function post(body){const response=await route.POST(new Request('http://adventure.test/api/shop',{method:'POST',headers:{origin:'http://adventure.test','Content-Type':'application/json'},body:JSON.stringify(body)}));return {status:response.status,data:await response.json()};}
test('latest adventure shop validates prices and commits purchases and capsule rewards atomically',async()=>{
 const get=await route.GET();assert.equal(get.status,200);const initial=await get.json();assert.equal(initial.priceVersion,version);sql.prepare('UPDATE wallets SET coins=20000 WHERE user_id=?').run('adventure-qa');
 const stale=await post({action:'buy',item:'ball',priceVersion:'old',expectedUnitPrice:150});assert.equal(stale.status,409);assert.equal(sql.prepare('SELECT coins FROM wallets WHERE user_id=?').get('adventure-qa').coins,20000);
 const bought=await post({action:'buy',item:'ball',priceVersion:version,expectedUnitPrice:150});assert.equal(bought.status,200);assert.equal(bought.data.coins,19850);assert.equal(bought.data.balls,initial.balls+1);
 const held=initial.catalog[0],before=19850;const priceFailure=await post({action:'buyHeld',item:held.id,quantity:2,priceVersion:version,expectedUnitPrice:1});assert.equal(priceFailure.status,409);assert.equal(sql.prepare('SELECT coins FROM wallets WHERE user_id=?').get('adventure-qa').coins,before);
 const purchased=await post({action:'buyHeld',item:held.id,quantity:2,priceVersion:version,expectedUnitPrice:held.price});assert.equal(purchased.status,200);assert.equal(purchased.data.inventory[held.id],2);
 const priorCount=sql.prepare('SELECT COUNT(*) n FROM pokemon_box').get().n,priorCoins=purchased.data.coins;const hatch=await post({action:'gacha',item:'meadow',priceVersion:version,expectedUnitPrice:1200});assert.equal(hatch.status,200);assert.equal(hatch.data.coins,priorCoins-1200);assert.equal(sql.prepare('SELECT COUNT(*) n FROM pokemon_box').get().n,priorCount+1);assert.ok(hatch.data.received.id);
});

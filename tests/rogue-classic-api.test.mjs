import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import * as errors from '../lib/rogue-api-errors.mjs';
import * as storage from '../lib/game-storage.mjs';
import * as origin from '../lib/request-origin.mjs';
import * as game from '../lib/rogue-classic-game.mjs';
import {createFixture} from './browser/ui-readability/fixture.mjs';

// Execute the actual TypeScript route with local SQLite and injected platform
// bindings. No live credentials, production saves or network calls are used.
function compile(path){return ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;}
const routeSource=compile('../app/api/rogue-classic/route.ts'),rankingSource=compile('../lib/rogue-ranking.ts');
function harness(options={}){
 const sqlite=new DatabaseSync(':memory:'),logs=[];let beforeWrite=options.beforeWrite;
 sqlite.exec('CREATE TABLE saves(user_id TEXT PRIMARY KEY,data TEXT,updated_at INTEGER,revision INTEGER); CREATE TABLE admin_audit(id INTEGER PRIMARY KEY,action TEXT,detail TEXT)');
 if(options.exists!==false)sqlite.prepare('INSERT INTO saves VALUES(?,?,0,0)').run('private-account',JSON.stringify(options.document||{counter:0,adventure:{untouched:true}}));
 const db={prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){if(options.readError)throw options.readError;return sqlite.prepare(sql).get(...args);},async run(){
  if(sql.startsWith('UPDATE saves')){if(beforeWrite){const callback=beforeWrite;beforeWrite=null;callback(sqlite);}if(options.writeError)throw options.writeError;}
  const result=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(result.changes)}};
 }};},async batch(statements){sqlite.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sqlite.exec('COMMIT');return result;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
 const ranking={};new Function('require','exports',rankingSource)(()=>({env:{DB:db}}),ranking);
 const modules={
  'cloudflare:workers':{env:{DB:db}},'@/app/chatgpt-auth':{getChatGPTUser:async()=>({userId:'private-account'})},
  '@/lib/request-origin.mjs':origin,'@/lib/game-storage.mjs':{...storage,...options.storage},
  '@/lib/rogue-classic-game.mjs':{applyClassicAction:options.apply||((doc)=>{doc.counter++;return {};}),classicGameView:options.view||((doc)=>({counter:doc.counter}))},
  '@/lib/rogue-pickup-config':{getRoguePickup:async()=>({sourceId:null,version:0})},'@/lib/rogue-ranking':ranking,'@/lib/rogue-api-errors.mjs':errors,
 },route={};
 new Function('require','exports','console',routeSource)(name=>{assert.ok(modules[name],name);return modules[name];},route,{error:line=>logs.push(JSON.parse(line))});
 return {sqlite,logs,row:()=>sqlite.prepare('SELECT data,revision FROM saves').get(),post:(body={action:'turn',revision:0})=>route.POST(new Request('http://localhost/api/rogue-classic',{method:'POST',headers:{origin:'http://localhost','content-type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)}))};
}
async function failure(h,body,status,code){const response=await h.post(body),data=await response.json();assert.equal(response.status,status);assert.equal(data.code,code);assert.match(data.requestId,/^[0-9a-f-]{36}$/);assert.equal(response.headers.get('x-request-id'),data.requestId);assert.equal(h.logs.at(-1).requestId,data.requestId);return data;}

test('POST rejects malformed bodies before reading or writing saves',async()=>{
 for(const body of ['{',null,[],{action:'turn'},{action:'turn',revision:-1},{action:'turn',revision:0.5}]){const h=harness();await failure(h,body,400,'INVALID_REQUEST');assert.equal(h.row().revision,0);assert.equal(h.logs[0].stage,'parse');h.sqlite.close();}
});
test('POST distinguishes stale revision and CAS conflict without applying twice',async()=>{
 const h=harness();await failure(h,{action:'turn',revision:3},409,'REVISION_CONFLICT');assert.equal(h.row().revision,0);
 const responses=await Promise.all([h.post(),h.post()]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 const conflict=await responses.find(r=>r.status===409).json();assert.equal(conflict.code,'REVISION_CONFLICT');assert.equal(h.row().revision,1);assert.equal(JSON.parse(h.row().data).counter,1);assert.equal(h.logs.at(-1).saveOutcome,'rejected');h.sqlite.close();
});
test('POST keeps ambiguous game Error separate from confirmed save conflicts and internal runtime exceptions',async()=>{
 for(const [error,status,code] of [[Error('먼저 이벤트 선택을 마치세요.'),409,'ACTION_FAILED'],[new TypeError('private-account token=secret'),500,'INTERNAL_ERROR']]){
  const h=harness({apply(doc){doc.counter++;throw error;}}),before=h.row().data;
  const data=await failure(h,{action:'turn',command:{type:'move',move:'private-name'},revision:0},status,code);
  assert.equal(h.row().data,before);assert.equal(h.logs[0].stage,'action');assert.equal(h.logs[0].commandType,'move');
  const serialized=JSON.stringify(h.logs);for(const value of ['private-account','secret','private-name','이벤트'])assert.ok(!serialized.includes(value));
  if(status===500)assert.ok(!data.error.includes('secret'));h.sqlite.close();
 }
});
test('POST read, encode and write failures return 500 instead of a false 409',async()=>{
 for(const [stage,options] of [['read',{readError:Error('private database detail')}],['encode',{storage:{encodeGameData:async()=>{throw Error('private codec detail');}}}],['write',{writeError:Error('private database detail')}]]){
  const h=harness(options),before=h.row();await failure(h,undefined,500,'INTERNAL_ERROR');assert.deepEqual(h.row(),before);assert.equal(h.logs[0].stage,stage);assert.equal(h.logs[0].saveOutcome,stage==='write'?'unknown':'not_attempted');assert.ok(!JSON.stringify(h.logs).includes('private'));h.sqlite.close();
 }
});
test('POST constructs and serializes response before any persistent save mutation',async()=>{
 for(const view of [()=>{throw Error('DTO failed');},()=>({bad:1n})])for(const exists of [true,false]){
  const h=harness({view,exists}),before=h.row();await failure(h,undefined,500,'INTERNAL_ERROR');assert.deepEqual(h.row(),before);assert.equal(h.logs[0].stage,'view');assert.equal(h.logs[0].saveOutcome,'not_attempted');h.sqlite.close();
 }
});
test('pickup CAS failure cannot consume eggs or claim a revision-only conflict',async()=>{
 const h=harness({beforeWrite(db){db.prepare('INSERT INTO admin_audit VALUES(1,?,?)').run('setRoguePickup','{}');}}),before=h.row();
 await failure(h,{action:'drawEggs',revision:0},409,'SAVE_OR_PICKUP_CONFLICT');assert.deepEqual(h.row(),before);h.sqlite.close();
});
test('ranking SQL guard follows actual save CAS success in the SQLite batch',async()=>{
 for(const conflict of [false,true]){
  const h=harness({document:{classic:{slots:[{coinRewards:[5]}]}},apply(){return {};},beforeWrite:conflict?db=>db.prepare('UPDATE saves SET revision=1').run():undefined});
  const response=await h.post();assert.equal(response.status,conflict?409:200);
  const ranking=h.sqlite.prepare('SELECT best_wave FROM rogue_rankings').get();assert.equal(ranking?.best_wave,conflict?undefined:5);h.sqlite.close();
 }
});
test('actual battle action survives API encode/view/commit and retains unrelated progress',async()=>{
 const document=createFixture('battle'),h=harness({document,apply:game.applyClassicAction,view:game.classicGameView});
 const before=JSON.parse(h.row().data),response=await h.post({action:'turn',command:{type:'move',move:'disable'},revision:0});
 assert.equal(response.status,200);const result=await response.json(),after=await storage.decodeGameData(h.row().data);
 assert.equal(result.revision,1);assert.equal(h.row().revision,1);assert.deepEqual(after.adventure,before.adventure);assert.deepEqual(after.classic.slots[1],before.classic.slots[1]);assert.equal(after.coins,before.coins);assert.equal(h.logs.length,0);h.sqlite.close();
});
test('unknown request fields and error metadata never enter diagnostics',async()=>{
 const h=harness({apply(){throw {name:'private-name',message:'secret'};}});
 await failure(h,{action:'sensitiveAccountName',command:{type:'secret',token:'secret'},revision:0},500,'INTERNAL_ERROR');
 assert.equal(h.logs[0].action,'other');assert.equal(h.logs[0].errorType,'unknown');assert.ok(!JSON.stringify(h.logs).includes('secret'));h.sqlite.close();
});

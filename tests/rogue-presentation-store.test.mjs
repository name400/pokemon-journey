import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import * as store from '../lib/rogue-presentation-store.mjs';
import * as origin from '../lib/request-origin.mjs';
import {createPresentationBatch} from '../lib/rogue-presentation-ledger.mjs';

const viewer='33333333-3333-4333-8333-333333333333',second='44444444-4444-4444-8444-444444444444',batchId='11111111-1111-4111-8111-111111111111';
function fixture(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE saves(user_id TEXT PRIMARY KEY,data TEXT NOT NULL,revision INTEGER NOT NULL)');
 let beforeInsert=null,userId='one';
 const db={prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return sqlite.prepare(sql).get(...args);},async run(){if(sql.includes('INSERT OR IGNORE INTO rogue_presentation_ack')&&beforeInsert){const hook=beforeInsert;beforeInsert=null;hook();}const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}};}};
 const events=[{kind:'switch',boxId:'a'},{kind:'attack',boxId:'b'}],batch=createPresentationBatch(events,()=>batchId),document={classic:{activeSlot:0,slots:[{combat:{events,presentationBatch:batch}},{untouched:true}]},adventure:{keep:true}};
 sqlite.prepare('INSERT INTO saves VALUES(?,?,?)').run('one',JSON.stringify(document),7);
 const route={},modules={'cloudflare:workers':{env:{DB:db}},'@/app/chatgpt-auth':{getChatGPTUser:async()=>userId?{userId}:null},'@/lib/request-origin.mjs':origin,'@/lib/rogue-presentation-store.mjs':store};
 const code=ts.transpileModule(readFileSync(new URL('../app/api/rogue-presentation/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','exports',code)(name=>modules[name],route);
 const payload={revision:7,batchId,viewerId:viewer,eventIds:[batch.events[0].id],confirmed:true};
 const post=(body,headers={'content-type':'application/json',origin:'https://game.example'})=>route.POST(new Request('https://game.example/api/rogue-presentation',{method:'POST',headers,body:JSON.stringify(body)}));
 return {sqlite,db,document,batch,payload,post,setUser:value=>userId=value,beforeInsert:fn=>beforeInsert=fn};
}

test('independent API stores explicit confirmations idempotently without changing the game save',async()=>{
 const h=fixture();try{const before=h.sqlite.prepare('SELECT * FROM saves').get();assert.equal((await h.post(h.payload)).status,200);assert.equal((await h.post(h.payload)).status,200);assert.equal((await h.post({...h.payload,viewerId:second})).status,200);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM rogue_presentation_ack').get().n,2);assert.deepEqual(h.sqlite.prepare('SELECT * FROM saves').get(),before);assert.deepEqual(JSON.parse(before.data).adventure,{keep:true});
 }finally{h.sqlite.close();}
});
test('missing, stale, changed and unauthorized batches cannot create confirmation records',async()=>{
 const h=fixture();try{for(const body of [{...h.payload,confirmed:false},{...h.payload,eventIds:['bad']},{...h.payload,revision:6},{...h.payload,batchId:'22222222-2222-4222-8222-222222222222'}])assert.equal((await h.post(body)).status,409);
  assert.equal((await h.post(h.payload,{'content-type':'application/json',origin:'https://other.example'})).status,403);h.setUser(null);assert.equal((await h.post(h.payload)).status,401);h.setUser('other');assert.equal((await h.post(h.payload)).status,409);h.setUser('one');
  const changed=structuredClone(h.document);changed.classic.slots[0].combat.events[0].kind='different';h.sqlite.prepare('UPDATE saves SET data=? WHERE user_id=?').run(JSON.stringify(changed),'one');assert.equal((await h.post(h.payload)).status,409);
  delete changed.classic.slots[0].combat.presentationBatch;h.sqlite.prepare('UPDATE saves SET data=? WHERE user_id=?').run(JSON.stringify(changed),'one');assert.equal((await h.post(h.payload)).status,409);
 }finally{h.sqlite.close();}
});
test('a revision change between reading and writing records no acknowledgment',async()=>{
 const h=fixture();try{h.beforeInsert(()=>h.sqlite.prepare('UPDATE saves SET revision=8 WHERE user_id=?').run('one'));assert.equal((await h.post(h.payload)).status,409);assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM rogue_presentation_ack').get().n,0);assert.equal(h.sqlite.prepare('SELECT revision FROM saves').get().revision,8);
 }finally{h.sqlite.close();}
});
test('storage limit rejects a multi-event request atomically while allowing a retry',async()=>{
 const h=fixture();try{
  assert.equal((await h.post(h.payload)).status,200);
  h.sqlite.exec("WITH RECURSIVE n(x) AS (VALUES(1) UNION ALL SELECT x+1 FROM n WHERE x<2046) INSERT INTO rogue_presentation_ack SELECT 'one','historic','old-'||x FROM n");
  const both=h.batch.events.map(e=>e.id);
  assert.equal((await h.post({...h.payload,viewerId:second,eventIds:both})).status,409);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM rogue_presentation_ack').get().n,2047);
  assert.equal((await h.post({...h.payload,eventIds:both})).status,200);
  assert.equal((await h.post({...h.payload,eventIds:both})).status,200);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM rogue_presentation_ack').get().n,2048);
 }finally{h.sqlite.close();}
});
test('concurrent viewer confirmations remain separate and leave the save revision unchanged',async()=>{
 const h=fixture();try{
  const responses=await Promise.all([h.post(h.payload),h.post({...h.payload,viewerId:second})]);
  assert.deepEqual(responses.map(r=>r.status),[200,200]);
  assert.equal(h.sqlite.prepare('SELECT COUNT(*) AS n FROM rogue_presentation_ack').get().n,2);
  assert.equal(h.sqlite.prepare('SELECT revision FROM saves WHERE user_id=?').get('one').revision,7);
 }finally{h.sqlite.close();}
});

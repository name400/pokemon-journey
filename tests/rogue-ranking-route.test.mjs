import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import * as storage from '../lib/game-storage.mjs';

function compile(path){return ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;}
function fixture(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec('CREATE TABLE saves(user_id TEXT PRIMARY KEY,data TEXT NOT NULL,revision INTEGER NOT NULL); CREATE TABLE profiles(user_id TEXT PRIMARY KEY,nickname TEXT)');
 const db={prepare(sql){let args=[];return {bind(...v){args=v;return this},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}}},async first(){return sqlite.prepare(sql).get(...args)},async all(){return {results:sqlite.prepare(sql).all(...args)}}}}};
 const ranking={};new Function('require','exports',compile('../lib/rogue-ranking.ts'))(()=>({env:{DB:db}}),ranking);let userId='self';const route={},modules={'cloudflare:workers':{env:{DB:db}},'@/app/chatgpt-auth':{getChatGPTUser:async()=>({userId})},'@/lib/rogue-ranking':ranking,'@/lib/game-storage.mjs':storage};new Function('require','exports',compile('../app/api/rogue-ranking/route.ts'))(name=>{assert.ok(modules[name],name);return modules[name]},route);
 return {sqlite,db,ranking,route,setUser:id=>{userId=id}};
}

test('ranking GET syncs saved best, orders ties and does not move equal scores on reconnect',async()=>{
 const h=fixture();try{
  await h.ranking.ensureRogueRanking(h.db);const {sqlite}=h;
  for(const [id,nick] of [['self','나'],['early','먼저'],['later','나중'],['higher','높음']])sqlite.prepare('INSERT INTO profiles VALUES(?,?)').run(id,nick);
  sqlite.prepare('INSERT INTO saves VALUES(?,?,?)').run('self',JSON.stringify({classic:{slots:[{coinRewards:[5,10],mysteryState:{completedWaves:[12]}}]},adventure:{safe:true}}),4);
  sqlite.prepare('INSERT INTO rogue_rankings VALUES(?,?,?)').run('early',12,1);sqlite.prepare('INSERT INTO rogue_rankings VALUES(?,?,?)').run('later',12,2);sqlite.prepare('INSERT INTO rogue_rankings VALUES(?,?,?)').run('higher',15,3);
  const response=await h.route.GET();assert.equal(response.status,200);const view=await response.json();assert.equal(view.own.bestWave,12);assert.equal(view.own.rank,4);assert.deepEqual(view.leaders.map(x=>x.nickname),['높음','먼저','나중','나']);assert.equal(view.leaders[3].is_self,1);
  const before=sqlite.prepare('SELECT * FROM rogue_rankings WHERE user_id=?').get('self'),save=sqlite.prepare('SELECT * FROM saves WHERE user_id=?').get('self');const again=await(await h.route.GET()).json();assert.equal(again.own.rank,4);assert.deepEqual(sqlite.prepare('SELECT * FROM rogue_rankings WHERE user_id=?').get('self'),before);assert.deepEqual(sqlite.prepare('SELECT * FROM saves WHERE user_id=?').get('self'),save);
  assert.equal(h.ranking.bestClearedWave({classic:{history:[{result:'victory',wave:200}],slots:[]}}),200);assert.equal(h.ranking.bestClearedWave({classic:{history:[{result:'defeat',wave:200}],slots:[]}}),0);
 }finally{h.sqlite.close();}
});
test('guarded ranking writes ignore failed saves and do not lower or retime records',async()=>{
 const h=fixture();try{await h.ranking.ensureRogueRanking(h.db);h.sqlite.prepare('INSERT INTO saves VALUES(?,?,?)').run('self','{}',0);
  await h.db.prepare('UPDATE saves SET revision=revision+1 WHERE user_id=? AND revision=?').bind('self',0).run();await h.ranking.rankingUpdate(h.db,'self',30,100).run();assert.deepEqual({...h.sqlite.prepare('SELECT best_wave,achieved_at FROM rogue_rankings WHERE user_id=?').get('self')},{best_wave:30,achieved_at:100});
  await h.db.prepare('UPDATE saves SET revision=revision+1 WHERE user_id=? AND revision=?').bind('self',0).run();await h.ranking.rankingUpdate(h.db,'self',99,200).run();assert.equal(h.sqlite.prepare('SELECT best_wave FROM rogue_rankings WHERE user_id=?').get('self').best_wave,30);
  for(const score of [20,30]){await h.db.prepare('UPDATE saves SET revision=revision+1 WHERE user_id=?').bind('self').run();await h.ranking.rankingUpdate(h.db,'self',score,300).run();assert.deepEqual({...h.sqlite.prepare('SELECT best_wave,achieved_at FROM rogue_rankings WHERE user_id=?').get('self')},{best_wave:30,achieved_at:100});}
  await h.db.prepare('UPDATE saves SET revision=revision+1 WHERE user_id=?').bind('self').run();await h.ranking.rankingUpdate(h.db,'self',31,400).run();assert.deepEqual({...h.sqlite.prepare('SELECT best_wave,achieved_at FROM rogue_rankings WHERE user_id=?').get('self')},{best_wave:31,achieved_at:400});
 }finally{h.sqlite.close();}
});
test('top 50 and personal rank exclude accounts without a profile',async()=>{
 const h=fixture();try{await h.ranking.ensureRogueRanking(h.db);for(let i=0;i<51;i++){const id=`ranked-${String(i).padStart(2,'0')}`;h.sqlite.prepare('INSERT INTO profiles VALUES(?,?)').run(id,`선수${i}`);h.sqlite.prepare('INSERT INTO rogue_rankings VALUES(?,?,?)').run(id,100,i+1);}h.sqlite.prepare('INSERT INTO rogue_rankings VALUES(?,?,?)').run('hidden',200,0);h.setUser('ranked-50');let view=await(await h.route.GET()).json();assert.equal(view.leaders.length,50);assert.equal(view.own.bestWave,100);assert.equal(view.own.rank,51);assert.ok(view.leaders.every(row=>!row.is_self));assert.equal(view.leaders[0].nickname,'선수0');assert.equal(view.leaders[49].nickname,'선수49');
  h.setUser('hidden');view=await(await h.route.GET()).json();assert.equal(view.own.bestWave,200);assert.equal(view.own.rank,null);assert.equal(view.own.needsNickname,true);assert.equal(view.leaders.length,50);assert.ok(view.leaders.every(row=>row.best_wave===100));
 }finally{h.sqlite.close();}
});

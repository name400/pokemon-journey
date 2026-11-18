import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import ts from 'typescript';
import {sameOriginRequest} from '../lib/request-origin.mjs';

const compile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function fixture({realProfile=false,deferProfileUpsert=false}={}){
 const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE players(user_id TEXT PRIMARY KEY,email TEXT NOT NULL DEFAULT \'\',name TEXT NOT NULL DEFAULT \'\',last_seen INTEGER NOT NULL); CREATE TABLE profiles(user_id TEXT PRIMARY KEY,nickname TEXT,nickname_key TEXT,friend_code TEXT,updated_at INTEGER); CREATE TABLE friendships(pair_key TEXT PRIMARY KEY,requester TEXT,recipient TEXT,status TEXT,created_at INTEGER)');
 for(const id of ['self','friend','pending','outsider']){sql.prepare('INSERT INTO players(user_id,last_seen) VALUES(?,?)').run(id,0);sql.prepare('INSERT INTO profiles(user_id,nickname,friend_code) VALUES(?,?,?)').run(id,id,id+'-code');}sql.prepare('INSERT INTO friendships VALUES(?,?,?,?,?)').run('accepted','self','friend','accepted',1);sql.prepare('INSERT INTO friendships VALUES(?,?,?,?,?)').run('pending','self','pending','pending',2);
 let releaseUpsert,markBlocked,blockedOnce=false;const upsertBlocked=new Promise(resolve=>{markBlocked=resolve}),upsertGate=new Promise(resolve=>{releaseUpsert=resolve});
 const db={prepare(query){let args=[];return {bind(...v){args=v;return this},async run(){if(deferProfileUpsert&&!blockedOnce&&query.startsWith('INSERT INTO players(')){blockedOnce=true;markBlocked();await upsertGate;}const r=sql.prepare(query).run(...args);return {meta:{changes:Number(r.changes)}}},async first(){return sql.prepare(query).get(...args)},async all(){return {results:sql.prepare(query).all(...args)}}}}};let user='self',now=1000000;class Clock extends Date{static now(){return now;}}
 const modules={'cloudflare:workers':{env:{DB:db}},'@/app/chatgpt-auth':{getChatGPTUser:async()=>user?{userId:user,email:user+'@example.test',displayName:user}:null},'@/lib/request-origin.mjs':{sameOriginRequest},'@/lib/profile':{ensureProfile:async u=>sql.prepare('SELECT * FROM profiles WHERE user_id=?').get(u.userId)}},load=path=>{const out={};new Function('require','exports','Date',compile(path))(name=>{assert.ok(modules[name],name);return modules[name]},out,Clock);return out;};
 if(realProfile)modules['@/lib/profile']=load('../lib/profile.ts');
 return {sql,friends:load('../app/api/friends/route.ts'),presence:load('../app/api/presence/route.ts'),setUser:v=>{user=v},setTime:v=>{now=v},upsertBlocked,releaseUpsert};
}
const request=origin=>new Request('https://game.test/api/presence',{method:'POST',headers:{origin}});
test('an older profile update cannot undo a newer heartbeat',async()=>{
 const h=fixture({realProfile:true});try{h.setUser('friend');h.setTime(1120000);assert.equal((await h.presence.POST(request('https://game.test'))).status,204);h.setTime(1100000);assert.equal((await h.friends.GET()).status,200);assert.equal(h.sql.prepare('SELECT last_seen FROM players WHERE user_id=?').get('friend').last_seen,1120000);h.setUser('self');h.setTime(1200000);const view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,true);}finally{h.sql.close();}
});
test('a delayed profile upsert cannot overwrite a heartbeat that commits first',async()=>{
 const h=fixture({realProfile:true,deferProfileUpsert:true});try{h.setUser('friend');h.setTime(1100000);const profileRequest=h.friends.GET();await h.upsertBlocked;h.setTime(1120000);assert.equal((await h.presence.POST(request('https://game.test'))).status,204);h.releaseUpsert();assert.equal((await profileRequest).status,200);assert.equal(h.sql.prepare('SELECT last_seen FROM players WHERE user_id=?').get('friend').last_seen,1120000);h.setUser('self');h.setTime(1200000);assert.equal((await(await h.friends.GET()).json()).items.find(x=>x.id==='accepted').online,true);}finally{h.releaseUpsert();h.sql.close();}
});
test('real profile and presence routes expire at 90 seconds and reconnect privately',async()=>{
 const h=fixture({realProfile:true});try{
  h.setUser('friend');h.setTime(1000000);assert.equal((await h.presence.POST(request('https://game.test'))).status,204);
  h.setUser('self');h.setTime(1089999);let view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,true);assert.equal('online' in view.items.find(x=>x.id==='pending'),false);
  h.setTime(1090000);view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,false);
  h.setUser('outsider');assert.deepEqual((await(await h.friends.GET()).json()).items,[]);h.setUser('friend');assert.equal((await h.presence.POST(request('https://game.test'))).status,204);h.setUser('self');view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,true);assert.equal('last_seen' in view.items.find(x=>x.id==='accepted'),false);
 }finally{h.sql.close();}
});
test('accepted friends see recent activity expire and resume without a tab closing other sessions',async()=>{
 const h=fixture();try{let view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,false);assert.equal('online' in view.items.find(x=>x.id==='pending'),false);
  h.setUser('friend');assert.equal((await h.presence.POST(request('https://game.test'))).status,204);h.setUser('self');view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,true);assert.equal('last_seen' in view.items.find(x=>x.id==='accepted'),false);
  h.setTime(1090000);view=await(await h.friends.GET()).json();assert.equal(view.items.find(x=>x.id==='accepted').online,false);h.setUser('friend');assert.equal((await h.presence.POST(request('https://game.test'))).status,204);h.setUser('self');assert.equal((await(await h.friends.GET()).json()).items.find(x=>x.id==='accepted').online,true);
  h.setTime(1120000);h.setUser('friend');await h.presence.POST(request('https://game.test'));h.setTime(1100000);await h.presence.POST(request('https://game.test'));assert.equal(h.sql.prepare('SELECT last_seen FROM players WHERE user_id=?').get('friend').last_seen,1120000,'an older heartbeat must not overwrite a newer one');h.setUser('self');h.setTime(1180000);assert.equal((await(await h.friends.GET()).json()).items.find(x=>x.id==='accepted').online,true,'another active tab can renew the same account');
  assert.equal(h.sql.prepare('SELECT last_seen FROM players WHERE user_id=?').get('outsider').last_seen,0);
 }finally{h.sql.close();}
});
test('heartbeat requires same-origin authentication and updates only its user',async()=>{
 const h=fixture();try{h.setUser('friend');assert.equal((await h.presence.POST(request('https://other.test'))).status,403);h.setUser(null);assert.equal((await h.presence.POST(request('https://game.test'))).status,401);assert.equal(h.sql.prepare('SELECT last_seen FROM players WHERE user_id=?').get('friend').last_seen,0);
 }finally{h.sql.close();}
});
test('friend request, acceptance and removal preserve presence privacy',async()=>{
 const h=fixture(),post=payload=>h.friends.POST(new Request('https://game.test/api/friends',{method:'POST',headers:{origin:'https://game.test','content-type':'application/json'},body:JSON.stringify(payload)}));try{
  h.sql.prepare('UPDATE profiles SET friend_code=? WHERE user_id=?').run('ABCDEF1234','outsider');let response=await post({action:'request',code:'ABCDEF1234'});assert.equal(response.status,200);let view=await response.json(),pending=view.items.find(x=>x.nickname==='outsider');assert.equal(pending.status,'pending');assert.equal('online' in pending,false);
  h.setUser('outsider');response=await post({action:'accept',id:pending.id});assert.equal(response.status,200);view=await response.json();assert.equal(view.items.find(x=>x.nickname==='self').status,'accepted');assert.equal(typeof view.items.find(x=>x.nickname==='self').online,'boolean');
  h.setUser('self');response=await post({action:'remove',id:pending.id});assert.equal(response.status,200);assert.equal((await response.json()).items.some(x=>x.nickname==='outsider'),false);assert.equal(h.sql.prepare('SELECT last_seen FROM players WHERE user_id=?').get('outsider').last_seen,0);
 }finally{h.sql.close();}
});

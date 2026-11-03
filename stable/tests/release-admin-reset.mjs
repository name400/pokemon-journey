// Explicitly disposable, local-only fixture identities. Never production URLs.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const base='http://localhost:5173',config=Object.fromEntries(fs.readFileSync('.dev.vars','utf8').trim().split(/\r?\n/).map(line=>{const i=line.indexOf('=');return [line.slice(0,i),line.slice(i+1)];}));
const response=await fetch(base+'/api/admin',{method:'POST',headers:{Cookie:'__sites_local_auth=2',Origin:base,'Content-Type':'application/json'},body:JSON.stringify({action:'login',password:config.ADMIN_PASSWORD})});assert.equal(response.status,200);const session=response.headers.get('set-cookie').split(';')[0],headers={Cookie:'__sites_local_auth=2; '+session,Origin:base,'Content-Type':'application/json'};
async function admin(action=null,payload={},query=''){const response=await fetch(base+'/api/admin'+query,{headers,...(action?{method:'POST',body:JSON.stringify({action,...payload})}:{})});return {status:response.status,data:await response.json()};}
const playerCookie={Cookie:'__sites_local_auth=3',Origin:base,'Content-Type':'application/json'};
const profileBefore=await fetch(base+'/api/account',{headers:playerCookie}).then(r=>r.json());
for(const mode of ['rogue','adventure']){
 const query='?mode='+mode+'&target=local_fresh&destination=starter',preview=await admin(null,{},query);assert.equal(preview.status,200);assert.ok(preview.data.reset?.expectedHash);const info=preview.data.reset;
 const wrong=await admin('resetPlayer',{mode,target:'local_fresh',confirmName:'wrong-nickname',expectedHash:info.expectedHash});assert.equal(wrong.status,409);
 const stale=await admin('resetPlayer',{mode,target:'local_fresh',confirmName:info.name,expectedHash:'stale'});assert.equal(stale.status,409);
 const untouched=await admin(null,{},query);assert.equal(untouched.data.reset.expectedHash,info.expectedHash);
 const reset=await admin('resetPlayer',{mode,target:'local_fresh',confirmName:info.name,expectedHash:info.expectedHash});assert.equal(reset.status,200,reset.data.error);assert.ok(reset.data.backupId);
 const resetView=await admin(null,{},query);assert.equal(resetView.data.reset.counts.pokemon,0);assert.ok(resetView.data.reset.backups.find(b=>b.id===reset.data.backupId).canRestore);
 if(mode==='rogue'){const game=await fetch(base+'/api/rogue-classic?starters=1',{headers:playerCookie}).then(r=>r.json());assert.equal(game.slots.filter(s=>s.id).length,0);assert.equal(game.starters.filter(s=>s.unlocked).length,27);assert.equal(game.eggShop.wallet,0);}
 const restored=await admin('restorePlayer',{mode,target:'local_fresh',confirmName:info.name,backupId:reset.data.backupId});assert.equal(restored.status,200,restored.data.error);
 const after=await admin(null,{},query);assert.deepEqual(after.data.reset.counts,info.counts);assert.ok(after.data.audit.some(a=>a.action==='resetPlayer'));assert.ok(after.data.audit.some(a=>a.action==='restorePlayer'));
 const replay=await admin('restorePlayer',{mode,target:'local_fresh',confirmName:info.name,backupId:reset.data.backupId});assert.equal(replay.status,409);
}
const profileAfter=await fetch(base+'/api/account',{headers:playerCookie}).then(r=>r.json());assert.equal(profileAfter.nickname,profileBefore.nickname);assert.equal(profileAfter.friendCode,profileBefore.friendCode);
console.log(JSON.stringify({result:'passed',identity:'local_fresh only',checks:['typed target+game scope','wrong name/stale preview rejected','atomic backup+reset','Rogue 5 slots/wallet/registrations reset','Adventure scope reset','undo+audit','repeat undo rejected','profile identity preserved'],productionTouched:false}));

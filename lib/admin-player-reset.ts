import {encodeGameData,decodeGameData} from './game-storage.mjs';
import {ensureClassicState} from './rogue-classic-state.mjs';
import {requireGameMode} from './admin-scope.mjs';

const saveSql="SELECT COALESCE((SELECT json_object('user_id',user_id,'data',data,'updated_at',updated_at,'revision',revision) FROM saves WHERE user_id=?),'null') AS encoded";
const adventureSql=`SELECT json_object(
 'world',json((SELECT json_object('user_id',user_id,'state',state,'revision',revision,'updated_at',updated_at) FROM worlds WHERE user_id=?)),
 'wallet',json((SELECT json_object('user_id',user_id,'coins',coins,'potions',potions,'super_potions',super_potions,'antidotes',antidotes,'balls',balls,'hyper_potions',hyper_potions,'max_potions',max_potions,'full_restores',full_restores,'last_claim',last_claim) FROM wallets WHERE user_id=?)),
 'box',json((SELECT json_group_array(json_object('id',id,'user_id',user_id,'species_id',species_id,'data',data,'origin',origin,'created_at',created_at)) FROM (SELECT * FROM pokemon_box WHERE user_id=? ORDER BY id))),
 'inventory',json((SELECT json_group_array(json_object('key',key,'user_id',user_id,'item',item,'quantity',quantity)) FROM (SELECT * FROM inventory WHERE user_id=? ORDER BY key)))
 ) AS encoded`;
const onlineSql="NOT EXISTS(SELECT 1 FROM matches WHERE (player1=? OR player2=?) AND json_extract(state,'$.phase') IN ('waiting','battle') AND COALESCE(json_extract(state,'$.deadlineAt'),0)>?) AND NOT EXISTS(SELECT 1 FROM battle_queue WHERE user_id=? AND status='waiting' AND created_at>?) AND NOT EXISTS(SELECT 1 FROM trades WHERE (requester=? OR recipient=?) AND status='pending' AND expires_at>?)";
const onlineArgs=(target:string,now:number)=>[target,target,now,target,now-600000,target,target,now];
const snapshotSql=(mode:string)=>mode==='rogue'?saveSql:adventureSql;
const snapshotArgs=(target:string,mode:string)=>Array(mode==='rogue'?1:4).fill(target);
async function snapshot(db:D1Database,target:string,mode:string){const row=await db.prepare(snapshotSql(mode)).bind(...snapshotArgs(target,mode)).first<{encoded:string}>();return row?.encoded||'null';}
async function digest(text:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
async function player(db:D1Database,target:string){if(typeof target!=='string'||!target||target.length>100)throw Error('플레이어를 선택하세요.');const row=await db.prepare('SELECT p.user_id,p.name,pr.nickname FROM players p LEFT JOIN profiles pr ON pr.user_id=p.user_id WHERE p.user_id=?').bind(target).first<any>();if(!row)throw Error('플레이어를 찾을 수 없습니다.');return {...row,label:row.nickname||row.name||row.user_id};}
function counts(data:any,mode:string){if(mode==='adventure')return {pokemon:data?.box?.length||0,coins:data?.wallet?.coins||0,items:data?.inventory?.reduce((n:number,r:any)=>n+r.quantity,0)||0,slots:0};return {pokemon:(data?.collection||[]).length+(data?.classic?.slots||[]).reduce((n:number,r:any)=>n+(r?.party?.length||0),0),coins:data?.coins||0,items:(data?.classic?.system?.eggs||[]).length,slots:(data?.classic?.slots||[]).filter(Boolean).length};}
export async function adminResetInfo(db:D1Database,target:string,mode:string){requireGameMode(mode);const person=await player(db,target),encoded=await snapshot(db,target,mode),raw=JSON.parse(encoded),data=mode==='rogue'?(raw?await decodeGameData(raw.data):{}):raw;
 const backups=await db.prepare('SELECT id,mode,created_at,restored_at,reset_revision FROM admin_player_backups WHERE target=? AND mode=? ORDER BY created_at DESC LIMIT 10').bind(target,mode).all<any>();const latest=await db.prepare('SELECT id,data FROM admin_player_backups WHERE target=? AND mode=? AND restored_at IS NULL ORDER BY created_at DESC LIMIT 1').bind(target,mode).first<any>();
 return {target,name:person.label,mode,expectedHash:await digest(encoded),counts:counts(data,mode),backups:backups.results.map((row:any)=>({...row,canRestore:!!latest&&row.id===latest.id&&JSON.parse(latest.data).afterSnapshot===encoded}))};
}
function guardReset(db:D1Database,id:string){return {sql:'EXISTS(SELECT 1 FROM admin_player_backups WHERE id=? AND restored_at IS NULL)',args:[id]};}
function guardRestore(id:string,nonce:string){return {sql:"EXISTS(SELECT 1 FROM admin_player_backups WHERE id=? AND json_extract(data,'$.restoreNonce')=?)",args:[id,nonce]};}
const prepared=(db:D1Database,sql:string,args:any[],guard:{sql:string;args:any[]})=>db.prepare(sql.replace('$GUARD',guard.sql)).bind(...args,...guard.args);
function clearAdventure(db:D1Database,target:string,guard:{sql:string;args:any[]}){return ['pokemon_box','inventory','worlds','wallets'].map(table=>prepared(db,`DELETE FROM ${table} WHERE user_id=? AND $GUARD`,[target],guard));}
export async function resetAdminPlayer(db:D1Database,actor:string,payload:any){const mode=requireGameMode(payload.mode),target=String(payload.target||''),person=await player(db,target);if(payload.confirmName!==person.label)throw Error('선택한 플레이어의 닉네임을 정확히 입력하세요.');
 const before=await snapshot(db,target,mode);if(payload.expectedHash!==await digest(before))throw Error('플레이어 데이터가 변경됐습니다. 다시 확인한 뒤 초기화하세요.');const original=JSON.parse(before),now=Date.now(),id=crypto.randomUUID(),revision=(mode==='rogue'?original?.revision:original?.world?.revision)??0,resetRevision=revision+1;
 let resetData:any,after:string;
 if(mode==='rogue'){const fresh={__classicOwnerSeed:target+'#'+id,version:2,screen:'home',dex:[],wins:0,coins:0,balls:5,potions:3,superPotions:0,hyperPotions:0,maxPotions:0,fullRestores:0,antidotes:0,inventory:{},collection:[],run:null,choiceIds:[],log:[],events:[]};ensureClassicState(fresh);resetData=await encodeGameData(fresh);after=JSON.stringify({user_id:target,data:resetData,updated_at:now,revision:resetRevision});}
 else after=JSON.stringify({world:null,wallet:{user_id:target,coins:300,potions:0,super_potions:0,antidotes:0,balls:5,hyper_potions:0,max_potions:0,full_restores:0,last_claim:''},box:[],inventory:[]});
 const backup=JSON.stringify({version:1,before:await encodeGameData(original),afterSnapshot:after,restoreNonce:null});
 const first=db.prepare(`INSERT INTO admin_player_backups(id,actor,target,mode,data,reset_revision,created_at) SELECT ?,?,?,?,?,?,? WHERE (${snapshotSql(mode)})=?${mode==='adventure'?' AND '+onlineSql:''}`).bind(id,actor,target,mode,backup,resetRevision,now,...snapshotArgs(target,mode),before,...(mode==='adventure'?onlineArgs(target,now):[]));
 const guard=guardReset(db,id),statements:D1PreparedStatement[]=[first];
 if(mode==='rogue'){statements.push(prepared(db,'UPDATE saves SET data=?,updated_at=?,revision=? WHERE user_id=? AND $GUARD',[resetData,now,resetRevision,target],guard));if(!original)statements.push(prepared(db,'INSERT INTO saves(user_id,data,updated_at,revision) SELECT ?,?,?,? WHERE $GUARD',[target,resetData,now,resetRevision],guard));}
 else{statements.push(...clearAdventure(db,target,guard),prepared(db,'INSERT INTO wallets(user_id) SELECT ? WHERE $GUARD',[target],guard));}
 statements.push(prepared(db,"INSERT INTO admin_audit(actor,target,action,detail,created_at) SELECT ?,?,'resetPlayer',?,? WHERE $GUARD",[actor,target,JSON.stringify({mode,backupId:id,counts:mode==='rogue'?counts(original?await decodeGameData(original.data):{},mode):counts(original,mode)}),now],guard));
 const result=await db.batch(statements);if(!result[0].meta.changes)throw Error('데이터가 변경됐거나 온라인 대전·교환 중입니다. 새로 확인하세요.');return {ok:true,mode,target,backupId:id};
}
export async function restoreAdminPlayer(db:D1Database,actor:string,payload:any){const mode=requireGameMode(payload.mode),target=String(payload.target||''),person=await player(db,target);if(payload.confirmName!==person.label)throw Error('선택한 플레이어의 닉네임을 정확히 입력하세요.');const row=await db.prepare('SELECT * FROM admin_player_backups WHERE id=? AND target=? AND mode=? AND restored_at IS NULL').bind(String(payload.backupId||''),target,mode).first<any>();if(!row)throw Error('복구할 백업을 찾을 수 없습니다.');
 const backup=JSON.parse(row.data),before=await decodeGameData(backup.before),nonce=crypto.randomUUID(),now=Date.now(),first=db.prepare(`UPDATE admin_player_backups SET restored_at=?,data=json_set(data,'$.restoreNonce',?) WHERE id=? AND restored_at IS NULL AND (${snapshotSql(mode)})=?${mode==='adventure'?' AND '+onlineSql:''}`).bind(now,nonce,row.id,...snapshotArgs(target,mode),backup.afterSnapshot,...(mode==='adventure'?onlineArgs(target,now):[])),guard=guardRestore(row.id,nonce),statements:D1PreparedStatement[]=[first];
 if(mode==='rogue')statements.push(prepared(db,'UPDATE saves SET data=?,updated_at=?,revision=? WHERE user_id=? AND $GUARD',[before?.data||'{}',now,row.reset_revision+1,target],guard));
 else{
  statements.push(...clearAdventure(db,target,guard));
  if(before.world)statements.push(prepared(db,'INSERT INTO worlds(user_id,state,revision,updated_at) SELECT ?,?,?,? WHERE $GUARD',[target,before.world.state,row.reset_revision+1,now],guard));
  if(before.wallet){const w=before.wallet;statements.push(prepared(db,'INSERT INTO wallets(user_id,coins,potions,super_potions,antidotes,balls,hyper_potions,max_potions,full_restores,last_claim) SELECT ?,?,?,?,?,?,?,?,?,? WHERE $GUARD',[target,w.coins,w.potions,w.super_potions,w.antidotes,w.balls,w.hyper_potions,w.max_potions,w.full_restores,w.last_claim],guard));}
  for(const p of before.box||[])statements.push(prepared(db,'INSERT INTO pokemon_box(id,user_id,species_id,data,origin,created_at) SELECT ?,?,?,?,?,? WHERE $GUARD',[p.id,target,p.species_id,p.data,p.origin,p.created_at],guard));
  for(const i of before.inventory||[])statements.push(prepared(db,'INSERT INTO inventory(key,user_id,item,quantity) SELECT ?,?,?,? WHERE $GUARD',[i.key,target,i.item,i.quantity],guard));
 }
 statements.push(prepared(db,"INSERT INTO admin_audit(actor,target,action,detail,created_at) SELECT ?,?,'restorePlayer',?,? WHERE $GUARD",[actor,target,JSON.stringify({mode,backupId:row.id}),now],guard));const result=await db.batch(statements);if(!result[0].meta.changes)throw Error('초기화 이후 진행이 바뀌었거나 이미 복구했습니다. 현재 진행을 덮어쓰지 않았습니다.');return {ok:true,mode,target,backupId:row.id};
}

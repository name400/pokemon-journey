import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {sewerInspected,SEWER_SOUTH_ITEMS} from '../lib/cloud-adventure/adventure-mission19.mjs';
import {lumioseSewerMap,findTile,fieldPath,storeAdventurePosition,restoreAdventurePosition,fieldDialogue,stepField} from '../lib/cloud-adventure/adventure-world.mjs';
import {predictCloudStep} from '../lib/cloud-adventure/adventure-prediction.mjs';

test('the investigated illusory wall can be crossed on foot without changing old encounters',()=>{
 const base={area:3,district:'lumiose-sewer',interior:null,x:11,y:3,facing:'up',zaMission19Stage:12,zaMission19Inspected:['a','b','e','d'],teamIds:['owned']};
 const next=stepField(base,'up');assert.deepEqual([next.x,next.y,next.zaMission19Stage,next.zaMission19Inner,next.zaMission19InnerEnabled],[11,14,13,true,true]);assert.ok(fieldPath(lumioseSewerMap({...base,...next}),next,{x:18,y:4}).length);
 assert.equal(predictCloudStep(base,'up'),null);assert.equal(predictCloudStep(base,'up',{allowTransition:true})?.zaMission19Inner,true);
 const saved=restoreAdventurePosition(storeAdventurePosition({...base,...next},123),123);assert.deepEqual([saved.x,saved.y,saved.zaMission19Inner,saved.teamIds],[11,14,true,['owned']]);
 assert.notEqual(stepField({...base,zaMission19Inspected:['a','b','e']},'up').transitioned,true);assert.notEqual(stepField({...base,zaMission19Stage:13,zaMission19InnerEnabled:undefined},'up').transitioned,true);assert.equal(stepField({...base,zaSewerIceBranch:true},'up').zaMission19Inner,undefined);
});

test('sewer markers are reachable and saved locations restore safely',()=>{
 const map=lumioseSewerMap();for(const marker of ['t','q','a','b','e','d','i','u']){const target=findTile(map,marker);assert.ok(target);assert.ok(fieldPath(map,{x:11,y:14},target).length,marker);}
 const before={area:3,district:'lumiose-sewer',interior:null,x:11,y:10,facing:'up',regionId:6,districtReturnRegion:1,zaMission19Stage:10,activeId:'owned',teamIds:['owned']};const restored=restoreAdventurePosition(storeAdventurePosition(before,7),7);assert.equal(restored.district,'lumiose-sewer');assert.equal(restored.zaMission19Stage,10);assert.deepEqual(restored.teamIds,['owned']);
 assert.deepEqual(sewerInspected({zaMission19Inspected:['a','a','unknown','e']}),['a','e']);
});
test('Gwynn and Ivor can use their Mega Evolutions',()=>{
 for(const [id,item,appearance] of [[609,'chandelurite','chandeluremega'],[870,'falinksite','falinksmega']]){let battle=createCombat([makeMon(150,40)],[{...makeMon(id,47),item}],{strategy:'balanced'});battle=playCpu(battle,{type:'move',move:battle.requests[0].moves[0].id});assert.equal(battle.teams[1][0].battleAppearance,appearance);assert.equal(battle.teams[1][0].mega,true);}
});

test('legacy sewer positions blocked by the new layout migrate only for the matching revision',()=>{
 const base={area:3,district:'lumiose-sewer',interior:null,x:20,y:14,facing:'up',regionId:6,districtReturnRegion:1,zaMission19Stage:10,zaSewerReturn:'bleu3',teamIds:['owned']};
 const saved=storeAdventurePosition(base,7);delete saved.districtPosition.sewerLayout;
 const restored=restoreAdventurePosition(structuredClone(saved),7);
 assert.equal(restored.district,'lumiose-sewer');assert.notEqual(lumioseSewerMap()[restored.y][restored.x],'#');assert.notEqual(lumioseSewerMap()[restored.y][restored.x],'~');
 assert.equal(restored.zaMission19Stage,10);assert.equal(restored.zaSewerReturn,'bleu3');assert.deepEqual(restored.teamIds,['owned']);
 assert.equal(restoreAdventurePosition(structuredClone(saved),8).district,null);
 const updated=storeAdventurePosition(restored,8);assert.equal(updated.districtPosition.sewerLayout,1);
 assert.deepEqual([restoreAdventurePosition(updated,8).x,restoreAdventurePosition(updated,8).y],[restored.x,restored.y]);
});


test('southern sewer supplies keep old positions and main mission routes accessible',()=>{
 const base={area:3,district:'lumiose-sewer',interior:null,x:11,y:14,facing:'up',zaMission19Stage:9,teamIds:['owned']},map=lumioseSewerMap(base);
 for(const item of SEWER_SOUTH_ITEMS){
  assert.equal(map[item.y][item.x],'o');assert.ok(fieldPath(map,base,item).length,item.id);
  const old=storeAdventurePosition({...base,x:item.x,y:item.y},21);delete old.districtPosition.sewerLayout;const restored=restoreAdventurePosition(old,21);
  assert.deepEqual([restored.x,restored.y,restored.teamIds],[item.x,item.y,['owned']]);
  assert.equal(fieldDialogue(restored).action,`sewerSouthItem-${item.id}`);
  assert.notEqual(lumioseSewerMap({...base,zaSewerSouthItems:[item.id]})[item.y][item.x],'o');
 }
 assert.ok(fieldPath(map,base,{x:11,y:11}).length);assert.ok(fieldPath(map,base,{x:16,y:10}).length);
});

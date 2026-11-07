import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {createCombat,playCpu} from '../lib/party-battle.mjs';
import {sewerInspected} from '../lib/cloud-adventure/adventure-mission19.mjs';
import {lumioseSewerMap,findTile,fieldPath,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

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

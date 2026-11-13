import {test} from 'node:test';
import assert from 'node:assert/strict';
import {refreshOrdinaryWildSpawns} from '../lib/cloud-adventure/adventure-wild-refresh.mjs';

test('ordinary zones refresh after time changes without disturbing old saves or other progress',()=>{
 for(const zone of [5,6,7,8,9,10,11,12,13,14,15,16,17,18]){
  const s={district:`lumiose-zone${zone}`,[`zaZone${zone}Spent`]:{wild:true},zaWildShinyRolls:{[`zone${zone}:wild:1`]:true,'zone19:other:2':true},zaMission40Complete:true,party:[{id:'owned',shiny:true}]};
  assert.equal(refreshOrdinaryWildSpawns(s,'day',4),true);assert.equal(s[`zaZone${zone}Spent`].wild,true);
  assert.equal(refreshOrdinaryWildSpawns(s,'day',4),false);
  assert.equal(refreshOrdinaryWildSpawns(s,'day',6),true);
  assert.equal(s[`zaZone${zone}Spent`],undefined);assert.equal(s.zaWildShinyRolls[`zone${zone}:wild:1`],undefined);
  assert.equal(s.zaWildShinyRolls['zone19:other:2'],true);assert.equal(s.zaMission40Complete,true);assert.equal(s.party[0].shiny,true);
 }
});

test('refresh waits for active encounters and ignores special zones',()=>{
 for(const blocked of ['interior','combat','encounter','adventureCatchWindow']){
  const s={district:'lumiose-zone5',zaZone5Spent:{abra:true},zaWildSpawnCycles:{5:{period:'day',interval:1}},[blocked]:{}};
  assert.equal(refreshOrdinaryWildSpawns(s,'night',2),false);assert.equal(s.zaZone5Spent.abra,true);
  delete s[blocked];assert.equal(refreshOrdinaryWildSpawns(s,'night',2),true);
 }
 for(const district of ['lumiose-zone1','lumiose-zone2','lumiose-zone3','lumiose-zone19','lumiose-zone20','lumiose-zone5-unknown'])assert.equal(refreshOrdinaryWildSpawns({district},'day',1),false);
 const s={district:'lumiose-zone11-sw-top',zaZone11Spent:{wild:true}};
 assert.equal(refreshOrdinaryWildSpawns(s,'day',1),true);s.district='lumiose-zone11';assert.equal(refreshOrdinaryWildSpawns(s,'night',2),true);assert.equal(s.zaZone11Spent,undefined);
});

test('time changes retain unspent shiny individuals while resetting ordinary ones',()=>{
 for(const zone of [5,6,7,8,9,10,11,12,13,14,15,16,17,18]){
  const s={district:`lumiose-zone${zone}`,zaWildSpawnCycles:{[zone]:{period:'day',interval:1}},[`zaZone${zone}Spent`]:{caught:true},zaWildShinyRolls:{[`zone${zone}:alive:1`]:true,[`zone${zone}:normal:2`]:false,[`zone${zone}:caught:3`]:true,'zone19:other:4':true}};
  assert.equal(refreshOrdinaryWildSpawns(s,'night',2),true);assert.equal(s.zaWildShinyRolls[`zone${zone}:alive:1`],true);assert.equal(s.zaWildShinyRolls[`zone${zone}:normal:2`],undefined);assert.equal(s.zaWildShinyRolls[`zone${zone}:caught:3`],undefined);assert.equal(s.zaWildShinyRolls['zone19:other:4'],true);
 }
});
test('blocked respawns retain their previous cycle and retry after movement',()=>{
 const s={district:'lumiose-zone8',zaWildSpawnCycles:{8:{period:'day',interval:0}},zaZone8Spent:{gible:true}};
 assert.equal(refreshOrdinaryWildSpawns(s,'day',2,()=>false),false);assert.equal(s.zaZone8Spent.gible,true);assert.equal(s.zaWildSpawnCycles[8].interval,0);
 assert.equal(refreshOrdinaryWildSpawns(s,'day',2,()=>true),true);assert.equal(s.zaZone8Spent,undefined);assert.equal(s.zaWildSpawnCycles[8].interval,2);
});

test('zone refresh preserves the alpha identity only with the retained unspent shiny',()=>{
 const s={district:'lumiose-zone14',zaWildSpawnCycles:{14:{period:'day',interval:4}},zaWildShinyRolls:{'zone14:aron:304':true,'zone14:drilbur:529':false,'zone14:onix:95':true,'zone5:a:16':false},zaWildVisibleAlphaLevels:{'zone14:aron:304':38,'zone14:drilbur:529':38,'zone14:onix:95':47,'zone5:a:16':23},zaZone14Spent:{onix:true}};
 assert.equal(refreshOrdinaryWildSpawns(s,'night',5),true);assert.equal(s.zaWildVisibleAlphaLevels['zone14:aron:304'],38);assert.equal(s.zaWildVisibleAlphaLevels['zone14:drilbur:529'],undefined);assert.equal(s.zaWildVisibleAlphaLevels['zone14:onix:95'],undefined);assert.equal(s.zaWildVisibleAlphaLevels['zone5:a:16'],23);
});

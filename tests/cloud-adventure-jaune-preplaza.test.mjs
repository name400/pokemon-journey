import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {jaunePrePlazaAvailable} from '../lib/cloud-adventure/adventure-jaune-preplaza.mjs';

test('Jaune pre-zone market has safe early access, five stocks, and a saved exit',()=>{
 const street={area:3,district:'lumiose-jaune-street',interior:null,x:11,y:1,facing:'up',zaRoyaleRank:'V',zaMysteryTrail:4,teamIds:['kept']};
 const entered=stepField(street,'up');assert.equal(entered.district,'lumiose-jaune-preplaza');const s={...street,...entered},map=fieldMap(s);assert.equal(map.join('').includes('g'),false);
 for(const [x,y,action] of [[7,6,'zone8BuyBerry-kasibberry'],[11,6,'zone8BuyBerry-kebiaberry'],[15,6,'zone8BuyBerry-occaberry'],[8,10,'buyAdventureMint-adamantmint'],[14,10,'buyAdventureMint-modestmint']]){
  assert.ok(fieldPath(map,s,{x,y}).length);const at={...s,x,y,facing:'up'};assert.ok(fieldDialogue(at).actions.some(a=>a.action===action));assert.equal(stepField(at,'up').blocked,true);
 }
 const old=restoreAdventurePosition(storeAdventurePosition({...s,x:8,y:10},9),9);assert.deepEqual([old.district,old.x,old.y,old.teamIds],['lumiose-jaune-preplaza',8,10,['kept']]);assert.equal(stepField(s,'down').district,'lumiose-jaune-street');
 assert.equal(jaunePrePlazaAvailable({...street,zaMission10Stage:1}),false);assert.equal(fieldMap({...s,zaRoyaleRank:'F'}).join('').includes('^'),false);assert.equal(jaunePrePlazaAvailable({...street,zaMysteryTrail:{version:2}}),false);assert.equal(stepField({...street,zaRoyaleRank:'F'},'up').district,'lumiose-zone8');assert.equal(stepField({...street,zaMysteryTrail:{version:2}},'up').blocked,true);
});

test('early plaza connects existing surrounding routes and retains late wild-zone gates',()=>{
 const entrances=[
  ['lumiose-jaune-street',1,11,'left',1,11,'left'],
  ['lumiose-jaune-street-north',21,5,'right',21,5,'right'],
  ['lumiose-jaune-sector9',1,10,'left',21,10,'right'],
  ['lumiose-centrico-route',19,1,'up',9,15,'down'],
  ['lumiose-jaune-street-north',11,15,'down',11,1,'up'],
  ['lumiose-jaune-garden-route',4,15,'down',19,1,'up'],
  ['lumiose-jaune-street',11,1,'up',11,15,'down'],
 ];
 for(const [district,x,y,direction,px,py,back] of entrances){
  const old={area:3,district,interior:null,x,y,facing:direction,zaRoyaleRank:'V',zaMysteryTrail:4,teamIds:['kept'],zaZone8Spent:{version:2}};
  const step=stepField(old,direction);assert.deepEqual([step.district,step.x,step.y],['lumiose-jaune-preplaza',px,py]);const plaza={...old,...step};
  const saved=restoreAdventurePosition(storeAdventurePosition(plaza,31),31);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaZone8Spent],['lumiose-jaune-preplaza',px,py,['kept'],{version:2}]);assert.equal(stepField(saved,back).district,district);
  assert.equal(stepField({...old,zaRoyaleRank:'F'},direction).district,'lumiose-zone8');assert.equal(stepField({...old,zaMysteryTrail:{version:2}},direction).blocked,true);
 }
});

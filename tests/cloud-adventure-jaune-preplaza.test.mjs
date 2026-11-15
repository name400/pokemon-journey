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

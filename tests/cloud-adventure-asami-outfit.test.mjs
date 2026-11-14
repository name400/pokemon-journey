import test from 'node:test';
import assert from 'node:assert/strict';
import {ASAMI_OUTFIT,ownedVernalTops,equippedVernalTop} from '../lib/cloud-adventure/adventure-clothing.mjs';
import {adventureAvatarRows} from '../lib/cloud-adventure/adventure-avatar.mjs';

test('story clothing is available after Asami without altering a legacy wardrobe',()=>{
 const old={zaClothingOwned:['unknown-future','bravely-vest-blue'],zaClothingTop:'bravely-vest-blue',zaMission26Stage:0};const before=structuredClone(old);
 assert.ok(!ownedVernalTops(old).includes(ASAMI_OUTFIT.id));assert.equal(equippedVernalTop({...old,zaClothingTop:ASAMI_OUTFIT.id}),null);
 for(const flags of [{zaMission26Stage:1},{zaMission26Stage:4},{zaMission26Complete:true}]){const saved={...old,...flags};assert.ok(ownedVernalTops(saved).includes(ASAMI_OUTFIT.id));assert.equal(equippedVernalTop(saved).id,'bravely-vest-blue');assert.equal(equippedVernalTop({...saved,zaClothingTop:ASAMI_OUTFIT.id}).id,ASAMI_OUTFIT.id);}
 assert.deepEqual(old,before);
});

test('formal field silhouette preserves head and distinguishes the vest in all directions',()=>{
 for(const facing of ['down','up','left','right'])for(const hair of ['classic','short','bob','long']){
  const base=adventureAvatarRows(facing,hair),formal=adventureAvatarRows(facing,hair,'formal'),vest=adventureAvatarRows(facing,hair,'vest');
  assert.deepEqual(formal.slice(0,6),base.slice(0,6));assert.deepEqual(formal.slice(10),base.slice(10));assert.notDeepEqual(formal.slice(6,10),base.slice(6,10));if(facing!=='up')assert.notDeepEqual(formal.slice(6,10),vest.slice(6,10));
 }
});

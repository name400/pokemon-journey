import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Vernal promenade places boutiques on both sides and preserves mission locations',()=>{
 const street={area:3,district:'lumiose-vernal',interior:null,x:11,y:8,facing:'up',teamIds:['kept'],zaMission25Complete:true};
 const map=fieldMap(street);
 for(const [x,y,name] of [[7,3,'Fresh Fits'],[7,5,'BRAVELY'],[7,7,'Dessert du Moment'],[16,3,'Changing Gears'],[16,7,'미용실']]){
  assert.ok(fieldPath(map,street,{x,y}).length);assert.equal(fieldDialogue({...street,x,y}).name,name);if(name==='미용실')assert.equal(fieldDialogue({...street,x,y}).hairSalon,true);
 }
 assert.equal(fieldDialogue({...street,x:16,y:6,facing:'up'}).action,'mission26Asami');
 assert.equal(fieldDialogue({...street,x:12,y:6,facing:'up'}).action,'mission26Asami');
 assert.notEqual(fieldDialogue({...street,x:16,y:6,facing:'up',zaMission26Stage:1}).action,'mission26Asami');
 const saved=restoreAdventurePosition(storeAdventurePosition({...street,x:7,y:5},72),72);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaMission25Complete,saved.teamIds],['lumiose-vernal',7,5,true,['kept']]);
});

test('Vernal façades preserve shop approaches, cafe, stairs and old saves',async()=>{
 const {VERNAL_SHOP_BUILDINGS}=await import('../lib/cloud-adventure/adventure-promenade-vent.mjs');
 const base={area:3,district:'lumiose-vernal',interior:null,zaRoyaleRank:'E',teamIds:['kept'],money:731,zaCafeWoofBrambleCleared:true},map=fieldMap(base);
 for(const [x,y] of VERNAL_SHOP_BUILDINGS){
  assert.equal(map[y][x],'%');
  const old=storeAdventurePosition({...base,x,y},211);delete old.districtPosition.vernalShopsLayout;const restored=restoreAdventurePosition(old,211);
  assert.notDeepEqual([restored.x,restored.y],[x,y]);assert.deepEqual([restored.district,restored.teamIds,restored.money,restored.zaCafeWoofBrambleCleared],['lumiose-vernal',['kept'],731,true]);
  assert.ok(fieldPath(map,restored,{x:12,y:6}).length);assert.equal(restoreAdventurePosition(old,212).district,null);
 }
 for(const start of [{x:1,y:5},{x:21,y:4},{x:11,y:14}])for(const target of [{x:7,y:3},{x:7,y:5},{x:7,y:7},{x:16,y:3},{x:16,y:5},{x:16,y:7},{x:12,y:6},{x:12,y:3},{x:20,y:10}])assert.ok(fieldPath(map,start,target).length);
 assert.equal(fieldDialogue({...base,x:8,y:5,facing:'left'}).name,'BRAVELY');assert.ok(fieldDialogue({...base,x:12,y:6,facing:'up'}).actions.some(a=>a.action==='woofNatural'));
 const roof={...base,zaVernalEastRoof:true,x:5,y:5};const saved=restoreAdventurePosition(storeAdventurePosition(roof,213),213);assert.deepEqual([saved.x,saved.y,saved.zaVernalEastRoof],[5,5,true]);
});

test('BRAVELY unlock and wardrobe validate verified stock and legacy values',async()=>{
 const {VERNAL_TOPS,clothingShopUnlocked,ownedVernalTops,equippedVernalTop}=await import('../lib/cloud-adventure/adventure-clothing.mjs');
 const base={area:3,district:'lumiose-vernal',interior:null,x:8,y:5,facing:'left',zaRoyaleRank:'Z'};
 assert.equal(clothingShopUnlocked(base),false);assert.match(fieldDialogue(base).text,/탐정사무소/);
 const open={...base,zaEmmaMet:true};assert.equal(VERNAL_TOPS.length,5);assert.ok(VERNAL_TOPS.every(top=>top.price===8000));assert.equal(fieldDialogue(open).actions.length,5);
 const owned={...open,zaClothingOwned:['unknown-future','bravely-vest-blue'],zaClothingTop:'bravely-vest-blue'};
 assert.deepEqual(ownedVernalTops(owned),['bravely-vest-blue']);assert.equal(equippedVernalTop(owned).id,'bravely-vest-blue');assert.equal(fieldDialogue(owned).actions.length,4);
 assert.equal(equippedVernalTop({...open,zaClothingTop:'bravely-vest-blue'}),null);assert.equal(clothingShopUnlocked({...base,zaRoyaleRank:'X'}),true);
});

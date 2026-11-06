import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {LUNE_SHOPS} from '../lib/cloud-adventure/adventure-galerie-lune.mjs';

test('Galerie hall links Rouge Street, Hibernal Avenue and Centrico with safe saves',()=>{
 const center={area:3,district:'lumiose-centrico-route',interior:null,x:11,y:1,teamIds:['kept'],zaEmmaMet:true};
 const gallery={...center,...stepField(center,'up')};assert.deepEqual([gallery.district,gallery.x,gallery.y],['lumiose-galerie-lune',11,15]);
 const map=fieldMap(gallery);assert.ok(fieldPath(map,gallery,{x:1,y:7}).length);assert.ok(fieldPath(map,gallery,{x:21,y:7}).length);
 for(const [x,dir,district,back] of [[1,'left','lumiose-rouge-north','right'],[21,'right','lumiose-hibernal-approach','left']]){
  const out=stepField({...gallery,x,y:7},dir);assert.equal(out.district,district);assert.equal(stepField({...gallery,...out},back).district,'lumiose-galerie-lune');
 }
 assert.equal(stepField(gallery,'down').district,'lumiose-centrico-route');
 assert.equal(fieldDialogue({...gallery,x:7,y:4,facing:'left'}).name,'SUBATOMIC 4');
 assert.equal(fieldDialogue({...gallery,x:11,y:4,facing:'up'}).name,'미용실');
 const tiles=map.join('');for(const key of Object.keys(LUNE_SHOPS))assert.ok(tiles.includes(key));
 const saved=restoreAdventurePosition(storeAdventurePosition({...gallery,x:11,y:8},71),71);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds,saved.zaEmmaMet],['lumiose-galerie-lune',11,8,['kept'],true]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Rouge Sector 2 links the academy, streets and gallery without replacing existing entrances',()=>{
 const school={area:3,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,interior:null,x:11,y:15,teamIds:['kept']};
 const entry=stepField(school,'down');assert.equal(entry.district,'lumiose-rouge-sector2');assert.equal(entry.zaAcademyCourtyard,false);
 const sector={...school,...entry};const map=fieldMap(sector);
 for(const goal of [{x:1,y:8},{x:21,y:8},{x:11,y:15}])assert.ok(fieldPath(map,sector,goal).length);
 const back=stepField(sector,'up');assert.equal(back.district,school.district);assert.equal(back.zaAcademyCourtyard,true);
 const west=stepField({...sector,x:1,y:8},'left');assert.equal(west.district,'lumiose-rouge-north');assert.equal(west.zaRougeStreetSouth,true);assert.equal(stepField({...sector,...west},'right').district,sector.district);
 const east=stepField({...sector,x:21,y:8},'right');assert.equal(east.district,'lumiose-hibernal-approach');assert.equal(stepField({...sector,...east},'left').district,sector.district);
 const gallery=stepField({...sector,x:11,y:15},'down');assert.equal(gallery.district,'lumiose-galerie-lune');assert.equal(stepField({...sector,...gallery},'up').district,sector.district);
 const saved=restoreAdventurePosition(storeAdventurePosition({...sector,x:11,y:9},24),24);assert.deepEqual([saved.district,saved.x,saved.y,saved.teamIds],[sector.district,11,9,['kept']]);
 const oldRoad={...sector,district:'lumiose-rouge-north',zaRougeStreetSouth:true,x:21,y:8};assert.equal(stepField(oldRoad,'right').district,'lumiose-galerie-lune');
});

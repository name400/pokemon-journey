import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,restoreAdventurePosition,storeAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {OMBRAGE_SHOPS} from '../lib/cloud-adventure/adventure-rouge-sector4.mjs';

test('glazed arcade connects Sector 3 north entrance to Sector 1 south entrance',()=>{
 const north={area:3,district:'lumiose-rouge-sector3',interior:null,x:6,y:15,facing:'down',teamIds:['kept'],zaEmmaMet:true};
 const start=stepField(north,'down');assert.deepEqual([start.district,start.x,start.y],['lumiose-ombrage-arcade',11,1]);
 const inside={...north,...start};assert.ok(fieldPath(fieldMap(inside),inside,{x:11,y:15}).length);
 assert.equal(stepField(inside,'up').district,'lumiose-rouge-sector3');
 const south=stepField({...inside,x:11,y:15},'down');assert.deepEqual([south.district,south.x,south.y],['lumiose-rouge-sector1',11,1]);
 assert.equal(stepField({...inside,...south},'up').district,'lumiose-ombrage-arcade');
 const saved=restoreAdventurePosition(storeAdventurePosition({...inside,x:15,y:8},69),69);
 assert.deepEqual([saved.district,saved.x,saved.y,saved.zaEmmaMet,saved.teamIds],['lumiose-ombrage-arcade',15,8,true,['kept']]);
 assert.equal(fieldDialogue({...saved,facing:'right'}).name,'미용실');
 assert.equal(fieldDialogue({...inside,x:7,y:2,facing:'left'}).name,'Glammor Pretti');
 const tiles=fieldMap(inside).join('');for(const key of Object.keys(OMBRAGE_SHOPS))assert.ok(tiles.includes(key),`missing ${key}`);
 assert.equal(Object.keys(OMBRAGE_SHOPS).length,15);
});

test('north entrance item is present until collected and does not disturb shop signs',()=>{
 const s={area:3,district:'lumiose-ombrage-arcade',interior:null,x:14,y:4,facing:'up',zaEmmaMet:true,adventureBalls:{duskball:4}};
 assert.equal(fieldDialogue(s).action,'ombrageDuskBall');
 const saved=restoreAdventurePosition(storeAdventurePosition({...s,zaOmbrageDuskBall:true,adventureBalls:{duskball:5}},70),70);
 assert.equal(saved.adventureBalls.duskball,5);assert.equal(saved.zaOmbrageDuskBall,true);
 assert.notEqual(fieldMap(saved)[3][14],'u');
 assert.equal(fieldDialogue({...saved,x:7,y:2,facing:'left'}).name,'Glammor Pretti');
});

test('both entrances reach every existing boutique and salon without moving saved positions',()=>{
 const s={area:3,district:'lumiose-ombrage-arcade',interior:null,x:11,y:1,teamIds:['kept'],zaEmmaMet:true},map=fieldMap(s),seen=[];
 for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){
  const tile=map[y][x];if(!Object.hasOwn(OMBRAGE_SHOPS,tile))continue;
  const approach={x:x===6?7:15,y},facing=x===6?'left':'right';
  assert.ok(fieldPath(map,{x:11,y:1},approach).length,`${tile} from north`);
  assert.ok(fieldPath(map,{x:11,y:15},approach).length,`${tile} from south`);
  assert.equal(fieldDialogue({...s,...approach,facing}).name,OMBRAGE_SHOPS[tile]);
  const restored=restoreAdventurePosition(storeAdventurePosition({...s,...approach,facing},88),88);
  assert.deepEqual([restored.x,restored.y,restored.facing,restored.teamIds],[approach.x,approach.y,facing,['kept']]);seen.push(tile);
 }
 assert.deepEqual(seen.sort(),Object.keys(OMBRAGE_SHOPS).sort());
});

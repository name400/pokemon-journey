import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,cloudNpcTile,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureQuestVisuals} from '../lib/cloud-adventure/adventure-quest-visuals.mjs';

test('quest Pokémon use species visuals without replacing people or changing interactions',()=>{
 for(const [district,key,entries,species] of [
  ['lumiose-magenta-sector9','zaSide85Stage',[[1,4,3],[2,7,4],[3,15,10]],607],
  ['lumiose-rouge7-roof','zaSide65Stage',[[1,3,3],[2,9,3],[3,19,2],[4,19,2]],702],
 ])for(const [stage,x,y] of entries){
  const s={area:3,district,interior:null,[key]:stage},map=fieldMap(s),visuals=adventureQuestVisuals({...s,map});
  assert.equal(map[y][x],'#');assert.equal(cloudNpcTile('#',s,x,y),false);assert.ok(visuals.some(p=>p.kind==='pokemon'&&p.species===species&&p.x===x&&p.y===y));
  const candidates=[['down',x,y-1],['up',x,y+1],['right',x-1,y],['left',x+1,y]];assert.ok(candidates.some(([facing,px,py])=>walkable(map[py]?.[px])&&['side85Follow','side65Chase','side65Battle'].includes(fieldDialogue({...s,x:px,y:py,facing},map)?.action)));
 }
 const consei={area:3,district:'lumiose-magenta-sector9',zaSide85Stage:1};assert.equal(cloudNpcTile('#',consei,7,3),true);
 const sister={area:3,district:'lumiose-sewer',zaSide85Stage:4};assert.equal(cloudNpcTile('#',sister,14,2),true);
 const ante={area:3,district:'lumiose-rouge-sector7',zaSide65Stage:1};assert.equal(cloudNpcTile('#',ante,15,11),true);
 for(const invalid of [{area:3,district:'lumiose-magenta-sector9'}, {area:3,district:'lumiose-magenta-sector9',zaSide85Stage:4},{area:3,district:'lumiose-rouge7-roof',zaSide65Stage:5},{area:3,district:'lumiose-rouge7-roof',zaSide65Stage:1,interior:'other'}])assert.ok(!adventureQuestVisuals({...invalid,map:fieldMap(invalid)}).some(p=>p.kind==='pokemon'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldDialogue,interactionAt,fieldDirectWildTarget,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
test('ordinary fixed wild encounters expose adjacent throws across representative zones',()=>{
 for(const zone of [5,6,8,9,10,11,12,13,14,15,16,17,18,19,20]){
  const base={area:3,district:`lumiose-zone${zone}`,interior:null,zaRoyaleRank:'A',zaMission19Complete:true,zaZone5Upper:zone===5,zaZone6Period:'day',zaZone13Period:'day',zaZone14Period:'day',zaZone15Period:'day',zaZone17Period:'day',zaZone18Period:'day',zaZone19Period:'day',weather:''},map=fieldMap(base);let checked=0;
  for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){if(!walkable(map[y][x]))continue;for(const facing of ['up','down','left','right']){const s={...base,x,y,facing},dialogue=fieldDialogue(s,map),target=fieldDirectWildTarget(s,interactionAt(s,map),dialogue);if(target){assert.equal(target.zone,zone);assert.ok(!target.p.burrow);assert.ok(dialogue.actions.some(a=>a.action==='throwZoneVisible'));checked++;}}}
  assert.ok(checked>0,`zone ${zone} should offer at least one reachable ordinary target`);
 }
});

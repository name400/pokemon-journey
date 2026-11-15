import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 12 links Sector 9 and Saison while retaining existing wild-zone gates',()=>{
 const s={area:3,district:'lumiose-jaune-sector9',interior:null,x:21,y:12,teamIds:['kept'],steps:42,zaRoyaleRank:'W'};
 const next=stepField(s,'right');assert.deepEqual([next.district,next.x,next.y],['lumiose-jaune-sector12',1,12]);
 const sector12={...s,...next};assert.equal(stepField(sector12,'left').district,s.district);
 assert.ok(fieldPath(fieldMap(sector12),sector12,{x:11,y:15}).length);
 const dock=stepField({...sector12,x:11,y:15},'down');assert.deepEqual([dock.district,dock.x,dock.y],['lumiose-saison-canalside',2,1]);
 const canal={...sector12,...dock};assert.equal(stepField(canal,'up').district,sector12.district);
 assert.ok(fieldPath(fieldMap(canal),canal,{x:5,y:1}).length);
 assert.equal(stepField({...sector12,x:1,y:4},'left').district,'lumiose-jaune-sector10');
 assert.equal(stepField({...sector12,x:1,y:8},'left').blocked,true,'Zone 11 remains locked');
 assert.equal(stepField({...sector12,x:15,y:1},'up').district,'lumiose-zone6');
 for(const world of [s,sector12,canal]){const r=restoreAdventurePosition(storeAdventurePosition(world,55),55);assert.deepEqual([r.district,r.x,r.y,r.teamIds,r.steps],[world.district,world.x,world.y,['kept'],42]);}
});

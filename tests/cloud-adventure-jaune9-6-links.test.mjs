import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';

test('Jaune 9 and 6 connect while preserving mission state and wild-zone gates',()=>{
 const s={area:3,district:'lumiose-jaune-sector9',interior:null,x:1,y:12,teamIds:['kept'],steps:42,zaRoyaleRank:'W',zaMission15Stage:2,zaMission18ApproachRequired:true};
 const map=fieldMap(s);assert.ok(fieldPath(map,s,{x:11,y:15}).length);assert.equal(map[8][12],'n');
 const next=stepField(s,'left');assert.deepEqual([next.district,next.x,next.y],['lumiose-jaune-sector6',21,12]);
 const sector6={...s,...next};assert.equal(stepField(sector6,'right').district,s.district);
 assert.ok(fieldPath(fieldMap(sector6),sector6,{x:21,y:8}).length);
 assert.equal(stepField({...sector6,x:21,y:8},'right').district,'lumiose-jaune-sector10');
 assert.equal(stepField({...s,x:1,y:10,zaMission15Stage:0,zaMission18ApproachRequired:false},'left').district,'lumiose-jaune-preplaza','early plaza remains accessible');
 assert.equal(stepField({...s,x:11,y:15},'down').district,'lumiose-jaune-sector10');
 for(const world of [s,sector6]){const r=restoreAdventurePosition(storeAdventurePosition(world,54),54);assert.deepEqual([r.district,r.x,r.y,r.teamIds,r.steps,r.zaMission18ApproachRequired],[world.district,world.x,world.y,['kept'],42,true]);}
});

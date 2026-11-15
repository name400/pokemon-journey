import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mission20GhostsCaught,recordMission20Ghost} from '../lib/cloud-adventure/adventure-mission20.mjs';

test('old building ghost completion retains unknown saved slots',()=>{
 const extra={version:2,slot:'future'},s={zaMission20Stage:7,zaMission20GhostCaught:['future',extra,93]};
 recordMission20Ghost(s,{adventureMissionId:'mission20-ghost-92'});
 assert.deepEqual(s.zaMission20GhostCaught,['future',extra,93,92]);assert.deepEqual(mission20GhostsCaught(s),[93,92]);
 recordMission20Ghost(s,{adventureMissionId:'mission20-ghost-92'});assert.equal(s.zaMission20GhostCaught.length,4);
 const legacy={zaMission20Stage:7};recordMission20Ghost(legacy,{adventureMissionId:'mission20-ghost-94'});assert.deepEqual(legacy.zaMission20GhostCaught,[94]);
 for(const value of [null,{},'unknown']){const unknown={zaMission20Stage:7,zaMission20GhostCaught:value};assert.throws(()=>recordMission20Ghost(unknown,{adventureMissionId:'mission20-ghost-92'}),/진행 기록/);assert.deepEqual(unknown.zaMission20GhostCaught,value);}
});

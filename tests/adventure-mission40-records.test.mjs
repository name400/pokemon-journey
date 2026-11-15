import test from 'node:test';
import assert from 'node:assert/strict';
import {recordMission40Anomaly,anomalyIds} from '../lib/cloud-adventure/adventure-mission40.mjs';

test('Mission 40 records known targets without rewriting legacy or future entries',()=>{
 const s={zaMission40Stage:1,zaMission40Anomalies:['future',{version:2},'steelix','steelix']};
 recordMission40Anomaly(s,{adventureMissionId:'mission40-gallade'});
 assert.deepEqual(s.zaMission40Anomalies,['future',{version:2},'steelix','steelix','gallade']);
 recordMission40Anomaly(s,{adventureMissionId:'mission40-gallade'});
 assert.deepEqual(anomalyIds(s),['steelix','gallade']);
 assert.equal(s.zaMission40Anomalies.length,5);
 const legacy={zaMission40Stage:1};recordMission40Anomaly(legacy,{adventureMissionId:'mission40-pangoro'});assert.deepEqual(legacy.zaMission40Anomalies,['pangoro']);
 const future={zaMission40Stage:1,zaMission40Anomalies:{version:2}};
 recordMission40Anomaly(future,{adventureMissionId:'other'});
 assert.throws(()=>recordMission40Anomaly(future,{adventureMissionId:'mission40-steelix'}),/조사 기록/);
 assert.deepEqual(future.zaMission40Anomalies,{version:2});
});

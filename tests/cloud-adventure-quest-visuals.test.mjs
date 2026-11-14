import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';
import {adventureQuestVisuals} from '../lib/cloud-adventure/adventure-quest-visuals.mjs';
import {trackedAdventureLocalTarget} from '../lib/cloud-adventure/adventure-pending-quests.mjs';

const cases=[
 ['lumiose-magenta-street','zaSide37Stage','37',[7,5]],
 ['lumiose-magenta-street','zaSide38Stage','38',[15,5]],
 ['lumiose-bleu-sector7','zaSide45Stage','45',[14,14]],
 ['lumiose-saison-canalside','zaSide46Stage','46',[13,11]],
 ['lumiose-jaune-sector6','zaSide47Stage','47',[16,11]],
 ['lumiose-rouge-sector5','zaSide48Stage','48',[15,10]],
];
function world(district,extra={}){const s={area:3,district,...extra};return {...s,map:fieldMap(s)};}
test('quest figures and tracked targets use existing active interaction tiles',()=>{
 for(const [district,stage,id,[x,y]] of cases){
  const s=world(district,{[stage]:1,zaTrackedQuestId:id}),before=JSON.stringify(s);
  assert.ok(adventureQuestVisuals(s).some(p=>p.x===x&&p.y===y),id);
  assert.deepEqual(trackedAdventureLocalTarget(s),{x,y},id);
  assert.equal(JSON.stringify(s),before,'visuals and tracking must not mutate saves');
  assert.deepEqual(trackedAdventureLocalTarget({...s,interior:'other'}),null);
 }
 for(const district of new Set(cases.map(c=>c[0])))assert.deepEqual(adventureQuestVisuals(world(district)),[]);
});
test('targets follow progress and respect the roof and stale markers',()=>{
 let s=world('lumiose-magenta-street',{zaSide38Stage:2,zaTrackedQuestId:'38'});assert.deepEqual(trackedAdventureLocalTarget(s),{x:17,y:5});
 s=world('lumiose-jaune-sector6',{zaSide47Stage:2,zaTrackedQuestId:'47-reward'});assert.deepEqual(trackedAdventureLocalTarget(s),{x:15,y:11});assert.equal(adventureQuestVisuals(s).some(p=>p.kind==='dummy'),false);
 s=world('lumiose-rouge-sector5',{zaSide48Stage:1});assert.equal(adventureQuestVisuals(s)[0].kind,'webbed');s=world('lumiose-rouge-sector5',{zaSide48Stage:2});assert.equal(adventureQuestVisuals(s)[0].kind,'person');
 s=world('lumiose-bleu-sector7',{zaSide45Stage:1,zaTrackedQuestId:'45',zaBleu7Upper:true});assert.deepEqual(adventureQuestVisuals(s),[]);assert.equal(trackedAdventureLocalTarget(s),null);
 s=world('lumiose-jaune-sector6',{zaSide47Stage:1,zaTrackedQuestId:'47'});s.map=[...s.map];s.map[11]=s.map[11].slice(0,16)+'.'+s.map[11].slice(17);assert.equal(trackedAdventureLocalTarget(s),null);
});

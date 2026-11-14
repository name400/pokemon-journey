import test from 'node:test';
import assert from 'node:assert/strict';
import {pendingAdventureQuests,trackedAdventureLocalTarget,trackedAdventureObjective} from '../lib/cloud-adventure/adventure-pending-quests.mjs';
import {fieldMap} from '../lib/cloud-adventure/adventure-world.mjs';
test('quest journal derives active objectives and only explicit unclaimed rewards',()=>{
 assert.deepEqual(pendingAdventureQuests({}),[]);assert.deepEqual(pendingAdventureQuests({zaEmmaMet:true}),[]);assert.deepEqual(pendingAdventureQuests({zaEmmaMet:true,zaEmmaMegaSeen:true,zaMission05Stage:7}),[]);assert.deepEqual(pendingAdventureQuests({zaEmmaMet:true,zaMission05Stage:7}).map(q=>q.id),['1','2','3']);
 const save={zaEmmaMet:true,zaBunnelbyQuest:1,zaTradeQuest:1,zaSableyeQuest:2,zaSide14Started:true,zaSide21Started:true,zaSide21Found:['museum1-1','museum1-1','museum2-1'],zaSide27Started:true,zaSide72Stage:1,zaSide74Stage:2,zaSide88Stage:1,zaSide42Won:true,zaSide42RewardPending:true,zaSide119Started:true,zaSide119Wins:2};const before=structuredClone(save),quests=pendingAdventureQuests(save),ids=quests.map(q=>q.id);assert.deepEqual(ids,['1','2','3','14','21','27','72','74','88','119','42-reward']);assert.match(quests.find(q=>q.id==='21').goal,/2\/12/);assert.match(quests.find(q=>q.id==='74').goal,/보상/);assert.match(quests.find(q=>q.id==='119').goal,/2\/4/);assert.deepEqual(save,before);
 const completed={zaEmmaMet:true,zaEmmaBattleComplete:true,zaBunnelbyQuest:3,zaTradeQuest:2,zaSableyeQuest:3,zaSide14Started:true,zaSide14Complete:true,zaSide21Started:true,zaSide21Complete:true,zaSide27Started:true,zaSide27Complete:true,zaSide72Stage:1,zaSide72Complete:true,zaSide74Stage:2,zaSide74Complete:true,zaSide88Stage:2,zaSide88Complete:true,zaSide119Started:true,zaSide119Complete:true};assert.deepEqual(pendingAdventureQuests(completed),[]);
 completed.zaTradePotionPending=true;completed.zaSableyeRevivePending=true;completed.zaSide119LuxuryPending=2;assert.deepEqual(pendingAdventureQuests(JSON.parse(JSON.stringify(completed))).map(q=>q.id),['2-reward','3-reward','119-reward']);
 const twelve={zaSide21Started:true,zaSide21Found:Array.from({length:12},(_,i)=>`museum1-${i}`)};assert.match(pendingAdventureQuests(twelve)[0].goal,/보고/);
});

test('late side quests show their saved stage and stop tracking after completion',()=>{
 for(const [stage,goal] of [[1,/부란다/],[2,/보상/]]){const s={zaSide117Stage:stage,zaTrackedQuestId:'117',objective:'메인 목표'};assert.match(trackedAdventureObjective(s),goal);assert.equal(trackedAdventureObjective({...s,zaSide117Complete:true}),'메인 목표');}
 for(const [stage,goal] of [[1,/도장/],[2,/호텔/],[3,/수로/],[4,/찾으세요/],[5,/보상/]]){const s={zaSide118Stage:stage,zaTrackedQuestId:'118',objective:'메인 목표'};assert.match(trackedAdventureObjective(s),goal);assert.equal(trackedAdventureObjective({...s,zaSide118Complete:true}),'메인 목표');}
 assert.deepEqual(pendingAdventureQuests({zaSide117Stage:0,zaSide118Stage:6}),[]);
});

test('Mareep, dojo and Gengar objectives point to the current playable interaction',()=>{
 const cases=[
  [{district:'lumiose-zone1-high-roof',zaTrackedQuestId:'17',zaSide17Stage:1},{x:8,y:5}],
  [{district:'lumiose-vert-sector9',zaTrackedQuestId:'17',zaSide17Stage:2,zaSide17RewardPending:true},{x:14,y:14}],
  [{district:'lumiose-jaune-sector2',zaTrackedQuestId:'117',zaSide117Stage:1},{x:5,y:10}],
  [{district:'lumiose-jaune-sector2',interior:'justiceDojo',zaTrackedQuestId:'117',zaSide117Stage:2},{x:7,y:4}],
  [{district:'lumiose-jaune-sector2',interior:'justiceDojo',zaTrackedQuestId:'118',zaSide118Stage:1},{x:7,y:4}],
  [{district:'lumiose-centrico-route',zaTrackedQuestId:'118',zaSide118Stage:2},{x:15,y:5}],
  [{district:'lumiose-vert-sector9',zaTrackedQuestId:'118',zaSide118Stage:3},{x:12,y:10}],
  [{district:'lumiose-galerie-lune',zaTrackedQuestId:'118',zaSide118Stage:4},{x:11,y:7}],
  [{district:'lumiose-galerie-lune',zaTrackedQuestId:'118',zaSide118Stage:5},{x:11,y:7}],
 ];
 for(const [input,expected] of cases){const s={area:3,interior:null,...input},copy=structuredClone(s);s.map=fieldMap(s);assert.deepEqual(trackedAdventureLocalTarget(s),expected);assert.equal(trackedAdventureLocalTarget({...s,map:[]}),null);delete s.map;assert.deepEqual(s,copy);}
 const dojo={area:3,district:'lumiose-jaune-sector2',interior:'justiceDojo',zaTrackedQuestId:'117',zaSide117Stage:1,zaSide118Stage:1};assert.equal(trackedAdventureLocalTarget({...dojo,map:fieldMap(dojo)}),null);
 assert.equal(trackedAdventureLocalTarget({...dojo,zaSide118Stage:0,zaMission19Stage:1,zaRoyaleEPoints:35000,map:fieldMap(dojo)}),null);
 assert.deepEqual(trackedAdventureLocalTarget({...dojo,zaSide118Stage:0,zaMission19Stage:1,zaRoyaleEPoints:34999,map:fieldMap(dojo)}),{x:7,y:4});
 assert.equal(trackedAdventureLocalTarget({...dojo,zaSide118Stage:0,zaSide117Complete:true,map:fieldMap(dojo)}),null);
 assert.equal(trackedAdventureLocalTarget({zaSide17Stage:2,zaTrackedQuestId:'17',district:'lumiose-zone1-high-roof',map:fieldMap({area:3,district:'lumiose-zone1-high-roof'})}),null);
});

test('tracked local markers follow real interaction tiles and disappear for other floors or completed quests',()=>{
 const cases=[
  [{district:'lumiose-south-boulevard',zaTrackedQuestId:'14',zaSide14Started:true}, {x:17,y:5},'zaSide14Complete'],
  [{district:'lumiose-zone11',zaTrackedQuestId:'72',zaSide72Stage:1}, {x:3,y:10},'zaSide72Complete'],
  [{district:'lumiose-vert-sector9',zaTrackedQuestId:'74',zaSide74Stage:2,zaMission26Started:true}, {x:5,y:6},'zaSide74Complete'],
  [{district:'lumiose-magenta-sector8-route',zaTrackedQuestId:'88',zaSide88Stage:1}, {x:13,y:14},'zaSide88Complete'],
 ];
 for(const [save,point,completed] of cases){
  const world={...save,map:fieldMap(save)},before=structuredClone(world);
  assert.deepEqual(trackedAdventureLocalTarget(world),point);
  assert.equal(trackedAdventureLocalTarget({...world,[completed]:true}),null);
  assert.equal(trackedAdventureLocalTarget({...world,interior:'hotel'}),null);
  assert.equal(trackedAdventureLocalTarget({...world,district:'elsewhere'}),null);
  assert.equal(trackedAdventureLocalTarget({...world,map:[]}),null);
  assert.deepEqual(world,before);
 }
 const shore={district:'lumiose-zone11',zaTrackedQuestId:'72',zaSide72Stage:1,zaZone11Upper:true};
 assert.equal(trackedAdventureLocalTarget({...shore,map:fieldMap(shore)}),null);
 assert.equal(trackedAdventureLocalTarget({}),null);
});

test('tracked objective follows an active quest and falls back after completion',async()=>{
 const {trackedAdventureObjective}=await import('../lib/cloud-adventure/adventure-pending-quests.mjs');const old={objective:'메인 목표'};assert.equal(trackedAdventureObjective(old),'메인 목표');const active={...old,zaSide14Started:true,zaTrackedQuestId:'14'};assert.match(trackedAdventureObjective(active),/Soleil/);assert.equal(trackedAdventureObjective({...active,zaSide14Complete:true}),'메인 목표');assert.equal(trackedAdventureObjective({...active,zaTrackedQuestId:'invalid'}),'메인 목표');const progress={...old,zaEmmaMet:true,zaBunnelbyQuest:1,zaTrackedQuestId:'1'};assert.match(trackedAdventureObjective(progress),/파르빗/);assert.match(trackedAdventureObjective({...progress,zaBunnelbyQuest:2}),/보고/);
});

test('Emma investigation markers follow quest stage and both existing quest locations',()=>{
 const base={area:3,zaEmmaMet:true,zaMission05Stage:7};
 const cases=[
  [{...base,district:'lumiose-rouge-sector6',zaTrackedQuestId:'1'},[7,4]],
  [{...base,district:'lumiose-rouge-sector6',zaTrackedQuestId:'1',zaBunnelbyQuest:1},[5,5]],
  [{...base,district:'lumiose-zone3',zaTrackedQuestId:'1',zaBunnelbyQuest:2},[19,10]],
  [{...base,district:'lumiose-zone3',zaTrackedQuestId:'1',zaBunnelbyQuest:1},[20,11]],
  [{...base,district:'lumiose-passage-palais',zaTrackedQuestId:'2',zaTradeQuest:1},[6,8]],
  [{...base,district:'lumiose-zone3',zaTrackedQuestId:'2',zaTradeQuest:1},[3,12]],
  [{...base,district:'lumiose-passage-palais',zaTrackedQuestId:'2-reward',zaTradeQuest:2,zaTradePotionPending:true},[6,8]],
  [{...base,district:'lumiose-rouge-north',zaTrackedQuestId:'3'},[22,13]],
  [{...base,district:'lumiose-zone4',zaTrackedQuestId:'3',zaSableyeQuest:1},[18,6]],
  [{...base,district:'lumiose-rouge-north',zaTrackedQuestId:'3-reward',zaSableyeQuest:3,zaSableyeRevivePending:true},[22,13]],
 ];
 for(const [save,[x,y]] of cases){const world={...save,map:fieldMap(save)},before=structuredClone(world);assert.deepEqual(trackedAdventureLocalTarget(world),{x,y});assert.deepEqual(world,before);assert.deepEqual(trackedAdventureLocalTarget(JSON.parse(JSON.stringify(world))),{x,y});}
 for(const save of [
  {...base,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,zaTrackedQuestId:'1'},
  {...base,district:'lumiose-zone3',zaZone3TowerUpper:true,zaTrackedQuestId:'2',zaTradeQuest:1},
  {...base,district:'lumiose-rouge-north',zaRougeStreetSouth:true,zaTrackedQuestId:'3'},
  {...base,district:'lumiose-rouge-north',zaTrackedQuestId:'3',zaSableyeQuest:1},
  {...base,district:'lumiose-zone4',zaTrackedQuestId:'3',zaSableyeQuest:3},
 ])assert.equal(trackedAdventureLocalTarget({...save,map:fieldMap(save)}),null);
});

test('unclaimed restaurant rewards remain trackable across locations and reloads',()=>{
 const cases=[
  {id:'60-reward',flag:'zaLeYeahRewardPending',district:'lumiose-rouge-sector3',interior:'leYeah',door:[16,11],host:[11,5]},
  {id:'29-reward',flag:'zaLeNahRewardPending',district:'lumiose-vert-sector6',interior:'leNah',door:[15,12],host:[11,5]},
  {id:'94-reward',flag:'zaLeWowRewardPending',district:'lumiose-rouge-sector2',interior:'leWow',door:[5,5],host:[11,5]},
  {id:'sushi-reward',flag:'zaSushiRewardPending',district:'lumiose-rouge-north',interior:'sushi',door:[19,4],host:[16,5]},
 ];
 for(const c of cases){
  for(const mode of ['mission','repeat']){
   const save={area:3,district:c.district,[c.flag]:mode,zaTrackedQuestId:c.id,objective:'메인 목표'},copy=structuredClone(save);
   assert.equal(pendingAdventureQuests(save).some(q=>q.id===c.id),true);
   assert.deepEqual(trackedAdventureLocalTarget({...save,map:fieldMap(save)}),{x:c.door[0],y:c.door[1]});
   const indoor={...save,interior:c.interior};assert.deepEqual(trackedAdventureLocalTarget({...indoor,map:fieldMap(indoor)}),{x:c.host[0],y:c.host[1]});
   assert.equal(trackedAdventureLocalTarget({...save,interior:'hotel',map:fieldMap({...save,interior:'hotel'})}),null);
   assert.equal(trackedAdventureLocalTarget({...save,district:'elsewhere',map:fieldMap(save)}),null);
   assert.deepEqual(save,copy);
  }
  assert.equal(pendingAdventureQuests({[c.flag]:'invalid'}).some(q=>q.id===c.id),false);
  assert.equal(pendingAdventureQuests({[c.flag]:true}).some(q=>q.id===c.id),false);
 }
 assert.equal(trackedAdventureLocalTarget({area:3,district:'lumiose-rouge-north',zaRougeStreetSouth:true,zaTrackedQuestId:'sushi-reward',zaSushiRewardPending:'mission',map:[]}),null);
});

test('holovator quest marker tracks only its ground-level active stages',()=>{
 const save={area:3,district:'lumiose-vernal',zaMission10Stage:3,zaSide23Stage:1,zaTrackedQuestId:'23',objective:'메인 목표'},world={...save,map:fieldMap(save)};
 assert.equal(pendingAdventureQuests(world).find(q=>q.id==='23').goal.includes('흙더미'),true);assert.deepEqual(trackedAdventureLocalTarget(world),{x:3,y:0});
 assert.match(pendingAdventureQuests({...save,zaSide23Stage:2})[0].goal,/보상/);assert.deepEqual(trackedAdventureLocalTarget({...world,zaSide23Stage:2}),{x:3,y:0});assert.equal(trackedAdventureLocalTarget({...world,zaSide23Stage:3}),null);assert.equal(trackedAdventureLocalTarget({...world,zaVernalEastRoof:true}),null);assert.equal(trackedAdventureLocalTarget({...world,zaVernalSlowbroBank:true}),null);
});

test('Sylveon quest tracker follows unfinished conversations, bank stairs and reward',()=>{
 const base={area:3,district:'lumiose-coulant-route',zaTrackedQuestId:'67',zaSide67Started:true,x:4,y:4};
 const target=s=>trackedAdventureLocalTarget({...s,map:fieldMap(s)});
 assert.deepEqual(target(base),{x:4,y:0});
 assert.deepEqual(target({...base,zaSide67Found:['fans']}),{x:15,y:0});
 const onlyLower={...base,zaSide67Found:['fans','couple','syndicate']};
 assert.deepEqual(target(onlyLower),{x:3,y:5});
 assert.deepEqual(target({...onlyLower,zaCoulantLower:true,y:6}),{x:7,y:4});
 assert.deepEqual(target({...onlyLower,zaCoulantLower:true,y:6,zaSide67Found:[...onlyLower.zaSide67Found,'family']}),{x:3,y:5});
 assert.deepEqual(target({...onlyLower,zaCoulantLower:true,y:11,zaSide67Found:[...onlyLower.zaSide67Found,'family']}),{x:9,y:12});
 const done={...base,zaCoulantLower:true,x:14,y:11,zaSide67Found:['fans','couple','family','syndicate','trainers']};
 assert.deepEqual(target(done),{x:14,y:12});assert.equal(target({...done,zaSide67Complete:true}),null);
 assert.equal(target({...done,interior:'other'}),null);assert.equal(target({...done,district:'elsewhere'}),null);
 assert.equal(trackedAdventureLocalTarget({...done,map:[]}),null);
});

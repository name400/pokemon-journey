import test from 'node:test';
import assert from 'node:assert/strict';
import {validBenchHang,benchHangMatches,BENCH_HANG_MS} from '../lib/cloud-adventure/adventure-bench-hang.mjs';
import {fieldMap,fieldPath,interactionAt,isAdventureBench,fieldDialogue,walkable} from '../lib/cloud-adventure/adventure-world.mjs';
test('bench sessions validate identity, location, party and unknown formats',()=>{
 const session={version:1,startedAt:100,district:'lumiose',x:2,y:6,facing:'up',benchX:2,benchY:5,teamIds:['p1','p2']},world={district:'lumiose',interior:null,x:2,y:6,facing:'up',teamIds:['p1','p2'],zaBenchHangV1:session};assert.equal(BENCH_HANG_MS,10000);assert.equal(validBenchHang(session),true);assert.equal(benchHangMatches(world,{x:2,y:5}),true);assert.equal(benchHangMatches({...world,teamIds:['p2','p1']},{x:2,y:5}),false);assert.equal(benchHangMatches({...world,x:3},{x:2,y:5}),false);assert.equal(validBenchHang({...session,version:2}),false);assert.equal(validBenchHang({...session,teamIds:['p1','p1']}),false);assert.equal(validBenchHang({...session,unknown:true}),false);
});

test('Bleu and Magenta center benches reuse blocked cells and remain reachable from each center',()=>{
 for(const v of [{district:'lumiose-bleu-sector7',bench:[8,12],player:[9,12,'left'],center:[11,13]}, {district:'lumiose-magenta-sector8-route',bench:[15,12],player:[14,12,'right'],center:[12,14]}]){
  const s={area:3,district:v.district,interior:null,x:v.player[0],y:v.player[1],facing:v.player[2],zaEmmaMegaSeen:true,zaSide88Stage:1},map=fieldMap(s),spot=interactionAt(s,map);assert.equal(map[v.bench[1]][v.bench[0]],'^');assert.equal(walkable(map[v.bench[1]][v.bench[0]]),false);assert.deepEqual([spot.x,spot.y],v.bench);assert.equal(isAdventureBench(s,spot),true);assert.ok(fieldDialogue(s,map).actions.some(a=>a.action==='benchNight'));assert.ok(fieldPath(map,s,{x:v.center[0],y:v.center[1]}).length);assert.equal(map[v.center[1]][v.center[0]],'H');
 }
 const roof={area:3,district:'lumiose-bleu-sector7',zaBleu7Upper:true,interior:null};assert.equal(isAdventureBench(roof,{tile:'^',x:8,y:12}),false);
});

test('Vert center shop and bench are reachable without blocking existing paths',()=>{
 const s={area:3,district:'lumiose-vert-street-route',interior:null,x:11,y:12,facing:'right',zaEmmaMegaSeen:true},map=fieldMap(s),spot=interactionAt(s,map);
 assert.equal(map[12][12],'^');assert.equal(map[13][12],'M');assert.equal(walkable(map[12][12]),false);assert.equal(isAdventureBench(s,spot),true);assert.ok(fieldDialogue(s,map).actions.some(a=>a.action==='benchNight'));
 const shop={...s,y:13};assert.equal(interactionAt(shop,map).tile,'M');assert.equal(fieldDialogue(shop,map).action,'shop');assert.ok(fieldPath(map,shop,{x:10,y:13}).length);
});

test('Rouge center services reuse the former building and remain accessible',()=>{
 const base={area:3,district:'lumiose-rouge-sector8',interior:null,zaEmmaMegaSeen:true},map=fieldMap(base);
 assert.equal(map[13][15],'H');assert.equal(map[12][15],'M');assert.equal(map[11][15],'^');
 for(const [x,y,action] of [[14,13,'heal'],[14,12,'shop']]){const s={...base,x,y,facing:'right'};assert.equal(fieldDialogue(s,map).action,action);}
 const bench={...base,x:14,y:11,facing:'right'};assert.equal(isAdventureBench(bench,interactionAt(bench,map)),true);assert.ok(fieldDialogue(bench,map).actions.some(a=>a.action==='benchNight'));assert.ok(fieldPath(map,{...base,x:11,y:15},{x:15,y:13}).length);
});

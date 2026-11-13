import test from 'node:test';
import assert from 'node:assert/strict';
import {fieldMap,fieldPath,fieldDialogue,stepField,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {ADVENTURE_MINTS,useAdventureMint} from '../lib/cloud-adventure/adventure-mints.mjs';
import {makeMon} from '../lib/game.mjs';

test('mint stalls retain blocked frontage and accessible routes in Rouge 6',()=>{
 const s={area:3,district:'lumiose-rouge-sector6',interior:null,x:3,y:6,facing:'up',teamIds:['kept']},map=fieldMap(s);
 for(const x of [3,7]){const at={...s,x};assert.equal(map[5][x],'^');assert.equal(stepField(at,'up').blocked,true);assert.ok(fieldPath(map,{x:1,y:8},{x,y:6}).length);assert.match(fieldDialogue(at).name,/민트/);const restored=restoreAdventurePosition(storeAdventurePosition(at,31),31);assert.deepEqual([restored.x,restored.y,restored.teamIds],[x,6,['kept']]);}
 assert.notEqual(fieldMap({...s,zaAcademyCourtyard:true})[5][3],'^');
});
test('mint replaces stat nature without modifying original personality or health',()=>{
 const base={...makeMon(1,40),nature:'hardy',hp:1},a=useAdventureMint(base,'adamantmint'),b=useAdventureMint(a,'modestmint');assert.equal(a.nature,'hardy');assert.equal(a.rogueNatureOverride,'adamant');assert.equal(a.hp,1);assert.ok(a.stats.atk>b.stats.atk);assert.ok(a.stats.spa<b.stats.spa);assert.equal(b.rogueNatureOverride,'modest');assert.equal(base.rogueNatureOverride,undefined);assert.equal(useAdventureMint({...base,hp:0},'seriousmint').hp,0);assert.equal(ADVENTURE_MINTS.length,21);assert.throws(()=>useAdventureMint(base,'invalidmint'));
});

test('remaining mint stalls use blocked frontage and survive ground saves',()=>{
 for(const [district,x,y,facing,item] of [['lumiose-rouge-sector1',3,6,'up','boldmint'],['lumiose-rouge-sector1',7,6,'up','calmmint'],['lumiose-vert-sector6',14,9,'right','jollymint']]){
  const s={area:3,district,interior:null,x,y,facing,teamIds:['kept']},map=fieldMap(s);assert.ok(fieldDialogue(s).actions.some(a=>a.action===`buyAdventureMint-${item}`));assert.equal(stepField(s,facing).blocked,true);assert.ok(fieldPath(map,{x:11,y:15},{x,y}).length);const restored=restoreAdventurePosition(storeAdventurePosition(s,44),44);assert.deepEqual([restored.district,restored.x,restored.y,restored.teamIds],[district,x,y,['kept']]);
 }
});

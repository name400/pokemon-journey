import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {classicRivalPortrait,classicRivalTrainerPresentation} from '../lib/rogue-rival-portrait.mjs';
import {classicEncounter} from '../lib/rogue-classic-world.mjs';
import {classicGameView} from '../lib/rogue-classic-game.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import provenance from '../data/rogue-rival-asset-provenance.json' with {type:'json'};

test('original rival sprites match their pinned source bytes',()=>{
 for(const asset of provenance.assets){
  const bytes=readFileSync(new URL('../'+asset.localPath,import.meta.url));
  assert.equal(createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex'),asset.gitBlobSha);
  assert.deepEqual([bytes.readUInt32BE(16),bytes.readUInt32BE(20)],asset.dimensions);
 }
});
test('legacy rival placeholders resolve by saved identity without mutating the trainer',()=>{
 for(const trainer of [{},{gender:'F'},{variant:1},{variant:'female'}]){
  const encounter={kind:'rival',trainer:{sprite:'/game/trainers/fallback.svg',...trainer}},before=structuredClone(encounter);
  assert.equal(classicRivalTrainerPresentation(encounter).sprite,classicRivalPortrait(trainer));
  assert.deepEqual(encounter,before);
 }
 const other={kind:'trainer',trainer:{sprite:'/game/trainers/youngster.png'}};
 assert.equal(classicRivalTrainerPresentation(other),other.trainer);
 const custom={kind:'rival',trainer:{sprite:'/game/trainers/custom.png'}};
 assert.equal(classicRivalTrainerPresentation(custom),custom.trainer);
});
test('all six rival encounters use an actual portrait and legacy view/dialogue preserve saves',()=>{
 for(const wave of [8,25,55,95,145,195]){
  const run={id:'rival-image',seed:'portrait',rng:42,wave,biome:0,screen:'reward',party:[makeReferenceMon(1,5,{boxId:'hero'})],modifiers:[],tools:{},rewards:[],rerolls:0};
  run.encounter=classicEncounter(run);
  assert.equal(run.encounter.kind,'rival');assert.equal(run.encounter.trainer.sprite,'/game/trainers/rival-m.png');
 }
 const document={},state=ensureClassicState(document);
 const run={id:'legacy-rival',seed:'portrait',rng:42,wave:55,biome:0,screen:'battleIntro',party:[makeReferenceMon(1,5,{boxId:'hero'})],modifiers:[],tools:{},encounter:{kind:'rival',trainer:{id:377,gender:'F',sprite:'/game/trainers/fallback.svg'}},npcDialogueQueue:[{speaker:'라이벌',phase:'intro',pages:['안녕'],portrait:'/game/trainers/rival-local.svg'}]};
 state.slots[0]=run;state.activeSlot=0;
 const before=JSON.stringify(run.encounter),rng=run.rng,view=classicGameView(document);
 assert.equal(view.run.encounter.trainer.sprite,'/game/trainers/rival-f.png');
 assert.equal(view.run.npcDialogueQueue[0].portrait,'/game/trainers/rival-f.png');
 assert.equal(JSON.stringify(run.encounter),before);assert.equal(run.rng,rng);
});

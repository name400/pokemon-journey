import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import records from '../data/rogue-reviewed-mega-atlases.json' with {type:'json'};
import provenance from '../data/rogue-reviewed-asset-provenance.json' with {type:'json'};
import trainers from '../data/rogue-trainer-appearance.json' with {type:'json'};
import {reviewedMegaAtlas,sourceAtlasFrames} from '../components/rogue-reviewed-mega-atlases.mjs';
import {classicSourceFormAtlas} from '../components/rogue-source-form-images.mjs';
import {classicFusionPaletteTarget} from '../components/rogue-fusion-palette-targets.mjs';
import {classicTrainerPresentation} from '../lib/rogue-trainer-variants.mjs';
import world from '../data/rogue-world-reference.json' with {type:'json'};
import {mergePinnedTrainerAppearance} from '../scripts/merge-pinned-trainer-appearance.mjs';
const mon=(record,native=record.native[0])=>({id:record.sourceId,rogueSourceId:record.sourceId,rogueFormIndex:record.formIndex,rogueFormKey:record.formKey,rogueBattleSpecies:native,battleAppearance:native,mega:true,gender:native==='meowsticfmega'?'F':'M'});
test('all pinned new Mega and trainer asset bytes match provenance',()=>{
 assert.equal(provenance.assets.length,92);
 for(const row of provenance.assets){const b=fs.readFileSync(row.localPath);assert.equal(b.length,row.bytes,row.path);assert.equal(createHash('sha256').update(b).digest('hex'),row.sha256,row.path);if(row.path.endsWith('.png'))assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');}
 for(const record of records.slice(0,8))for(const direction of ['','back/'])for(const color of ['','shiny/']){const base=`public/game/pokerogue/pokemon/${direction}${color}${record.atlas}`,atlas=JSON.parse(fs.readFileSync(base+'.json')),frames=sourceAtlasFrames(atlas),png=fs.readFileSync(base+'.png');assert.equal(frames.length,1);assert.equal(frames[0].rotated,false);assert.equal(frames[0].frame.x,0);assert.equal(frames[0].frame.y,0);assert.equal(frames[0].frame.w,png.readUInt32BE(16));assert.equal(frames[0].frame.h,png.readUInt32BE(20));}
});
test('all96 source Mega forms and97 native/gender identities select exact front/back shiny atlases',()=>{
 let identities=0;for(const record of records)for(const native of record.native){identities++;for(const facing of ['front','back'])for(const shiny of [false,true]){const value={...mon(record,native),shiny};assert.equal(reviewedMegaAtlas(value)?.atlas,record.atlas);assert.deepEqual(classicSourceFormAtlas(value,facing),{key:record.atlas,shiny,facing});}}
 assert.equal(identities,97);
 const value=mon(records[0]);for(const patch of [{rogueFormKey:'mega'},{rogueFormIndex:1},{rogueSourceId:25},{battleAppearance:'pikachu'},{sourceAppearanceMissing:true},{gigantamax:true}])assert.equal(reviewedMegaAtlas({...value,...patch}),null);
 const female=mon(records[3],'meowsticfmega');assert.equal(reviewedMegaAtlas({...female,gender:'M'}),null);assert.equal(reviewedMegaAtlas({...female,battleAppearance:undefined,rogueBattleSpecies:'meowsticmmega'}),null);
});
test('reviewed Mega fusion palettes support either role while unrelated transformations remain rejected',()=>{
 const base={id:151,rogueSourceId:151,gender:'N',rogueFormIndex:0};
 for(const record of records)for(const native of record.native)for(const facing of ['front','back']){
  const mega=mon(record,native),primary={...mega,rogueFusionRule:'preview-v1',fusionSpecies:151,rogueFusion:{donor:base}};
  assert.deepEqual(classicFusionPaletteTarget(primary,facing),{primary:record.atlas,donor:'151',facing});
  const donor={...base,rogueFusionRule:'preview-v1',fusionSpecies:record.sourceId,rogueFusion:{donor:mega}};
  assert.deepEqual(classicFusionPaletteTarget(donor,facing),{primary:'151',donor:record.atlas,facing});
  assert.equal(classicFusionPaletteTarget({...primary,dynamaxed:true},facing),null);assert.equal(classicFusionPaletteTarget({...primary,battleAppearance:'pikachu'},facing),null);
 }
});
test('source-specific trainer identities and female variants use verified originals and regenerate without drift',()=>{
 const names=['MYSTERIOUS_SISTERS','ALIANA','CELOSIA','MACRO_GRUNT','VICTOR','VICTORIA','VIVI','VICKY','VITO','EXPERT_POKEMON_BREEDER','PLAYER_M_ALTERNATE','PLAYER_F_ALTERNATE'];
 for(const name of names){const a=trainers.byEnumName[name];assert.equal(a.status,'matched');assert.match(a.src,/^\/game\/trainers\/pokerogue-/);assert.equal(a.matchRule,'pinned-source-getSpriteKey');}
 for(const name of ['MACRO_GRUNT','BIRD_KEEPER']){const a=trainers.byEnumName[name],config=world.trainerConfigs[a.sourceType];assert.equal(classicTrainerPresentation(config,{variant:1,appearance:a}).portrait.src,a.variants.female.src);}
 assert.deepEqual(mergePinnedTrainerAppearance(structuredClone(trainers)),trainers);
 assert.equal(trainers.byEnumName.UNKNOWN.status,'unmatched');
});

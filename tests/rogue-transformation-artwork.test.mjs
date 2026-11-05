import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import records from '../data/rogue-reviewed-transformation-atlases.json' with {type:'json'};
import provenance from '../data/rogue-transformation-asset-provenance.json' with {type:'json'};
import {reviewedTransformationAtlas} from '../components/rogue-reviewed-transformation-atlases.mjs';
import {reviewedAtlasRoot,sourceAtlasFrames} from '../components/rogue-reviewed-mega-atlases.mjs';
import {classicSourceFormAtlas} from '../components/rogue-source-form-images.mjs';
const mon=record=>({rogueSourceId:record.sourceId,rogueFormIndex:record.formIndex,rogueFormKey:record.formKey,rogueBattleSpecies:record.native[0],battleAppearance:record.native[0]});
test('all37 transformation form assets match pinned bytes and valid source frame bounds',()=>{
 assert.equal(records.length,37);assert.equal(provenance.assets.length,374);
 for(const row of provenance.assets){const b=fs.readFileSync(row.localPath);assert.equal(b.length,row.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),row.sha256,row.path);if(row.path.endsWith('.png'))assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');else{const frames=sourceAtlasFrames(JSON.parse(b));if(!frames.length)continue;const png=fs.readFileSync(row.localPath.replace(/\.json$/,'.png'));for(const f of frames){assert.ok(f.frame.x>=0&&f.frame.y>=0);assert.ok(f.frame.x+f.frame.w<=png.readUInt32BE(16));assert.ok(f.frame.y+f.frame.h<=png.readUInt32BE(20));}}}
});
test('exact source identity and active battle transformation select both faces without mutating state',()=>{
 for(const record of records){const value=mon(record),before=structuredClone(value),flag=record.formKey.startsWith('gigantamax')?'gigantamax':record.formKey;
  for(const facing of ['front','back'])for(const shiny of [false,true])assert.deepEqual(classicSourceFormAtlas({...value,shiny},facing),{key:record.atlas,shiny,facing});
  assert.equal(reviewedAtlasRoot(record.atlas),'/game/pokerogue/pokemon');assert.equal(reviewedTransformationAtlas({...value,rogueFormIndex:0,rogueFormKey:'',rogueBattleSpecies:'base',[flag]:true})?.atlas,record.atlas);assert.deepEqual(value,before);
  for(const patch of [{battleAppearance:'pikachu'},{rogueSourceId:999999},{sourceAppearanceMissing:true},{mega:true},{rogueFormIndex:999}])assert.equal(reviewedTransformationAtlas({...value,...patch}),null);
  assert.equal(classicSourceFormAtlas({...value,fusionSpecies:151}),null);
 }
 const charizard=records.find(r=>r.sourceId===6);assert.equal(reviewedTransformationAtlas({rogueSourceId:6,dynamaxed:true,battleAppearance:'charizard'}),null);assert.equal(reviewedTransformationAtlas({...mon(charizard),primal:true}),null);
});

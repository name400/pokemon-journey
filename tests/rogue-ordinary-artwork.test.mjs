import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
import records from '../data/rogue-reviewed-form-atlases.json' with {type:'json'};
import provenance from '../data/rogue-form-asset-provenance.json' with {type:'json'};
import {rogueSpecies,makeReferenceMon} from '../lib/rogue-reference.mjs';
import {applyClassicSourceForm} from '../lib/rogue-transformations.mjs';
import {reviewedOrdinaryFormAtlas} from '../components/rogue-reviewed-form-atlases.mjs';
import {sourceAtlasFrames,reviewedAtlasRoot} from '../components/rogue-reviewed-mega-atlases.mjs';
import {classicSourceFormAtlas} from '../components/rogue-source-form-images.mjs';
import {classicFusionPaletteTarget} from '../components/rogue-fusion-palette-targets.mjs';
import donorForms from '../data/rogue-fusion-palette-forms.json' with {type:'json'};
const mon=r=>({rogueSourceId:r.sourceId,rogueFormIndex:r.formIndex,rogueFormKey:r.formKey,rogueBattleSpecies:r.native[0],battleAppearance:r.native[0],gender:'M'});
test('ordinary form assets retain pinned bytes and all three actual atlas formats',()=>{
 assert.equal(records.length,283);assert.equal(provenance.assets.length,2415);let hashAtlases=0;
 for(const row of provenance.assets){const bytes=fs.readFileSync(row.localPath);assert.equal(bytes.length,row.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),row.sha256,row.path);if(row.path.endsWith('.png')){assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');continue;}
  const atlas=JSON.parse(bytes),frames=sourceAtlasFrames(atlas);if(!frames.length)continue;if(atlas.frames&&!Array.isArray(atlas.frames))hashAtlases++;
  const png=fs.readFileSync(row.localPath.replace(/\.json$/,'.png'));for(const f of frames){assert.match(f.filename,/^\d{4}\.png$/);assert.equal(f.rotated,false);assert.ok(f.frame.x>=0&&f.frame.y>=0);assert.ok(f.frame.x+f.frame.w<=png.readUInt32BE(16));assert.ok(f.frame.y+f.frame.h<=png.readUInt32BE(20));assert.ok(f.spriteSourceSize.x+f.spriteSourceSize.w<=f.sourceSize.w);assert.ok(f.spriteSourceSize.y+f.spriteSourceSize.h<=f.sourceSize.h);}
 }
 assert.equal(hashAtlases,1);const school=JSON.parse(fs.readFileSync('public/game/pokerogue/pokemon/back/746-school.json'));assert.equal(sourceAtlasFrames(school)[0].filename,'0001.png');assert.deepEqual(sourceAtlasFrames(school).map(f=>f.filename),Object.keys(school.frames));
});
test('previously allowed fusion donors preserve exact source form sex and reject contradictory identities',()=>{
 for(const r of records.filter(r=>r.genderDiffs)){const form=donorForms[r.sourceId][r.formIndex],donor={...mon(r),id:form.id,gender:'F'},primary={id:151,rogueSourceId:151,rogueFormIndex:0,gender:'N',rogueFusionRule:'preview-v1',fusionSpecies:r.sourceId,rogueFusion:{donor}};assert.equal(classicFusionPaletteTarget(primary)?.donor,r.femaleAtlas);assert.equal(classicFusionPaletteTarget({...primary,rogueFusion:{donor:{...donor,gender:'M'}}})?.donor,r.atlas);assert.equal(classicFusionPaletteTarget({...primary,rogueFusion:{donor:{...donor,gender:'N'}}}),null);assert.equal(classicFusionPaletteTarget({...primary,rogueFusion:{donor:{...donor,battleAppearance:'pikachu'}}}),null);}
});
test('form atlas keys preserve original shared and gender-specific sprite rules',()=>{
 for(const r of records){const f=rogueSpecies.get(r.sourceId).formList[r.formIndex],key=f.formSpriteKey??f.formKey;assert.equal(r.atlas,`${r.sourceId}${key?'-'+key:''}`);assert.equal(r.genderDiffs,!!f.genderDiffs);assert.equal(reviewedAtlasRoot(r.atlas),'/game/pokerogue/pokemon');}
 for(const id of [664,665])assert.equal(new Set(records.filter(r=>r.sourceId===id).map(r=>r.atlas)).size,1);
 for(const r of records.filter(r=>r.genderDiffs)){assert.equal(reviewedOrdinaryFormAtlas({...mon(r),gender:'F'}).atlas,r.femaleAtlas);assert.equal(reviewedOrdinaryFormAtlas({...mon(r),gender:'N'}),null);assert.equal(reviewedAtlasRoot(r.femaleAtlas),'/game/pokerogue/pokemon');}
});
test('supported ordinary source DTOs select exact artwork without granting unsupported forms',()=>{
 let supported=0,blocked=0;
 for(const r of records){const value=mon(r);if(!r.native.length){assert.equal(reviewedOrdinaryFormAtlas(value),null);blocked++;continue;}supported++;
  const actual=applyClassicSourceForm(makeReferenceMon(r.sourceId,50,{boxId:'image-'+r.atlas,gender:r.genderDiffs?'M':undefined}),{tools:{},challenges:[]},r.formKey),before=structuredClone(actual);assert.ok(reviewedOrdinaryFormAtlas(actual),r.atlas);assert.deepEqual(actual,before);
  for(const facing of ['front','back'])for(const shiny of [false,true])assert.deepEqual(classicSourceFormAtlas({...value,shiny},facing),{key:r.atlas,shiny,facing});
  for(const patch of [{battleAppearance:'missing-form'},{rogueBattleSpecies:'missing-form'},{rogueFormKey:'wrong'},{sourceAppearanceMissing:true},{gigantamax:true},{mega:true}])assert.equal(reviewedOrdinaryFormAtlas({...value,...patch}),null,r.atlas);
 }
 assert.equal(supported,277);assert.equal(blocked,6);
});

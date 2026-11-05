import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {execFileSync} from 'node:child_process';
import cases from './browser/reviewed-assets/primary-fusion-cases.json' with {type:'json'};
import permissions from '../data/rogue-fusion-primary-artwork.json' with {type:'json'};
import {classicFusionPaletteTarget} from '../components/rogue-fusion-palette-targets.mjs';
import {checkedAtlasFrame} from '../components/rogue-atlas-frame.mjs';
import {sourceAtlasFrames} from '../components/rogue-reviewed-mega-atlases.mjs';
test('source artwork permissions are reproducible from actual existing game fusion permission',()=>{execFileSync(process.execPath,['scripts/generate-fusion-primary-artwork.mjs','--check']);assert.equal(cases.length,240);assert.equal(permissions.blocked.length,37);});
test('every allowed ordinary primary has an exact palette target without accepting a corrupt identity',()=>{
 for(const row of cases)for(const facing of ['front','back']){assert.deepEqual(classicFusionPaletteTarget(row.mon,facing),{primary:row.atlas,donor:'151',facing});for(const patch of [{id:999999},{rogueFormKey:'wrong'},{battleAppearance:'wrong'},{rogueBattleSpecies:'wrong'},{dynamaxed:true},{rogueFusionRule:'wrong'}])assert.equal(classicFusionPaletteTarget({...row.mon,...patch},facing),null,row.key);}
});
test('packed nonzero first frames are validated against the actual image and retain exact crop coordinates',()=>{
 for(const key of ['15-mega','248-mega','445-mega']){const base=`public/game/pokerogue/pokemon/${key}`,frame=sourceAtlasFrames(JSON.parse(fs.readFileSync(base+'.json')))[0],before=structuredClone(frame),png=fs.readFileSync(base+'.png'),width=png.readUInt32BE(16),height=png.readUInt32BE(20),rect=checkedAtlasFrame(frame,width,height);assert.ok(rect);assert.ok(rect.x||rect.y);assert.equal(rect.x,frame.frame.x);assert.equal(rect.y,frame.frame.y);assert.deepEqual(frame,before);
  for(const patch of [{rotated:true},{frame:{...frame.frame,x:-1}},{frame:{...frame.frame,x:width}},{frame:{...frame.frame,w:0}},{frame:{...frame.frame,y:.5}},{sourceSize:{w:0,h:0}},{spriteSourceSize:{...frame.spriteSourceSize,x:-1}}])assert.equal(checkedAtlasFrame({...frame,...patch},width,height),null);
 }
});

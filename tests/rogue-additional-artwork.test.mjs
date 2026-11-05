import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';
import evidence from '../data/rogue-additional-mega-asset-provenance.json' with {type:'json'};
import records from '../data/rogue-reviewed-mega-atlases.json' with {type:'json'};
import {sourceAtlasFrames,reviewedAtlasVariant} from '../components/rogue-reviewed-mega-atlases.mjs';
import {classicTrainerPortraits} from '../components/rogue-trainer-portraits.mjs';
import trainers from '../data/rogue-trainer-appearance.json' with {type:'json'};
test('all88 additional Mega forms use exact pinned PNG/JSON assets and bounded source frame rectangles',()=>{
 assert.equal(records.length,96);assert.equal(evidence.assets.length,879);
 for(const asset of evidence.assets){const bytes=fs.readFileSync(asset.localPath);assert.equal(bytes.length,asset.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256,asset.path);if(asset.path.endsWith('.png'))assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');else{const atlas=JSON.parse(bytes),frames=sourceAtlasFrames(atlas);if(!Array.isArray(frames)||!frames.length)continue;const png=fs.readFileSync(asset.localPath.replace(/\.json$/,'.png')),w=png.readUInt32BE(16),h=png.readUInt32BE(20);for(const f of frames){assert.ok(f.frame.x>=0&&f.frame.y>=0);assert.ok(f.frame.x+f.frame.w<=w&&f.frame.y+f.frame.h<=h);assert.ok(f.sourceSize.w>0&&f.sourceSize.h>0);}}}
});
test('independent atlas front and palette back variants preserve source per-facing kinds',()=>{
 for(const key of ['334-mega','373-mega','384-mega']){assert.equal(reviewedAtlasVariant(key,1,'front'),2);assert.equal(reviewedAtlasVariant(key,1,'back'),1);}
 assert.equal(reviewedAtlasVariant('373-mega',2,'front'),2);assert.equal(reviewedAtlasVariant('373-mega',2,'back'),1);
});
test('named partners, mixed-gender class pairs and composite pairs preserve source identity and saved state',()=>{
 const red={id:351,variant:2,partnerId:350,name:'레드 & 그린',sprite:trainers.byEnumName.RED.src},before=structuredClone(red);assert.deepEqual(classicTrainerPortraits(red,true).map(r=>r.src),[red.sprite,trainers.byEnumName.BLUE.src]);assert.deepEqual(red,before);
 const ace={id:1,variant:2,name:'엘리트 트레이너',sprite:trainers.byEnumName.ACE_TRAINER.src};assert.deepEqual(classicTrainerPortraits(ace,true).map(r=>r.src),[ace.sprite,trainers.byEnumName.ACE_TRAINER.variants.female.src]);
 assert.equal(classicTrainerPortraits({...red,partnerId:999},true).length,1);assert.equal(classicTrainerPortraits(red,false).length,1);assert.equal(classicTrainerPortraits({...red,variant:0},true).length,1);assert.equal(classicTrainerPortraits({id:58,variant:2,sprite:trainers.byEnumName.TWINS.src},true).length,1);assert.equal(classicTrainerPortraits({id:375,variant:2,sprite:'/game/trainers/rival-m.png'},true).length,1);
});
test('compact partner metadata remains reproducible from the pinned source and verified assets',()=>{execFileSync(process.execPath,['scripts/generate-trainer-portrait-pairs.mjs','--check']);});

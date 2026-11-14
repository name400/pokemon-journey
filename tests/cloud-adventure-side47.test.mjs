import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {side47Available} from '../lib/cloud-adventure/adventure-side47.mjs';
import {adventureFurfrouAtlas,validAdventureFurfrou} from '../lib/cloud-adventure/adventure-furfrou.mjs';
import {reviewedAtlasRoot,sourceAtlasFrames} from '../components/rogue-reviewed-mega-atlases.mjs';
import {fieldMap,fieldDialogue,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';
test('Mirte and her practice dummy preserve prior paths and old roof records',()=>{
 const s={area:3,district:'lumiose-jaune-sector6',interior:null,x:14,y:11,facing:'right'},old=fieldMap(s),ready={...s,zaMission19Stage:1},map=fieldMap(ready);assert.equal(side47Available(s),false);assert.equal(old[11][15],'#');assert.equal(map[11][15],'^');assert.ok(fieldPath(map,{x:11,y:9},{x:14,y:11}).length);assert.equal(fieldDialogue(ready,map).action,'side47Start');const ongoing={...ready,zaSide47Stage:1,x:16,y:10,facing:'down'},next=fieldMap(ongoing);assert.equal(next[11][16],'^');assert.equal(fieldDialogue(ongoing,next).action,'side47Demonstrate');const service={...ready,zaSide47Stage:2};assert.ok(fieldDialogue(service,fieldMap(service)).actions.some(a=>a.action==='side47Trim-heart'));assert.equal(side47Available({zaSide47Stage:2}),true);
});
test('trim sprite uses reviewed local assets while shared forms and unknown fields remain untouched',()=>{
 const base={id:676,speciesId:676};assert.equal(adventureFurfrouAtlas(base),null);for(const trim of ['heart','star','diamond'])for(const shiny of [false,true])for(const facing of ['front','back']){const atlas=adventureFurfrouAtlas({...base,adventureFurfrouTrim:trim,shiny},facing);assert.equal(atlas.key,`676-${trim}`);const root=reviewedAtlasRoot(atlas.key);assert.equal(root,'/game/pokerogue/pokemon');const prefix=`public${root}/${facing==='back'?'back/':''}${shiny?'shiny/':''}${atlas.key}`;assert.ok(fs.existsSync(`${prefix}.png`));assert.ok(sourceAtlasFrames(JSON.parse(fs.readFileSync(`${prefix}.json`,'utf8'))).length>0);}
 assert.equal(validAdventureFurfrou({...base,adventureFurfrouTrim:{version:2}}),false);assert.equal(validAdventureFurfrou({...base,rogueSourceId:676}),false);assert.equal(adventureFurfrouAtlas({...base,adventureFurfrouTrim:'heart',battleAppearance:'other'}),null);
});

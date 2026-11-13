import test from 'node:test';
import assert from 'node:assert/strict';
import {rougeSector6Map,bunnelbyQuestSpot} from '../lib/cloud-adventure/adventure-rouge-sector8.mjs';
import {fieldDialogue,fieldPath} from '../lib/cloud-adventure/adventure-world.mjs';

test('Rouge Sector 6 adds two blocked-frontage quest interactions without replacing street routes',()=>{
 const s={area:3,district:'lumiose-rouge-sector6',interior:null,x:8,y:4,facing:'left',zaEmmaMet:true},map=rougeSector6Map(s);
 assert.equal(map[4][7],'t');assert.equal(map[5][5],'q');assert.equal(map[0][11],'X');assert.equal(map[8][0],'X');assert.equal(map[16][11],'X');
 assert.equal(fieldDialogue(s).action,'startBunnelby');assert.equal(fieldDialogue({...s,x:5,y:6,facing:'up',zaBunnelbyQuest:1}).action,'battleBunnelby');assert.ok(fieldPath(map,{...s,x:1,y:8},{x:8,y:4}).length);
 assert.equal(bunnelbyQuestSpot(s,{x:7,y:4,tile:'t'},'t'),true);assert.equal(bunnelbyQuestSpot(s,{x:8,y:4,tile:'t'},'t'),false);assert.equal(bunnelbyQuestSpot({...s,interior:'other'},{x:7,y:4,tile:'t'},'t'),false);
 assert.equal(bunnelbyQuestSpot({...s,district:'lumiose-zone3'},{x:11,y:6,tile:'t'},'t'),true);assert.equal(bunnelbyQuestSpot({...s,zaAcademyCourtyard:true},{x:7,y:4,tile:'t'},'t'),false);
});

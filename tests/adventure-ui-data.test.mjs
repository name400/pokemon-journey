import test from 'node:test';import assert from 'node:assert/strict';
import {AREAS as sourceAreas,TRAINERS as sourceTrainers} from '../lib/campaign.mjs';import {species} from '../lib/game.mjs';
import {AREAS,TRAINERS,STARTER_CHOICES} from '../lib/adventure-ui-data.mjs';
test('small client metadata remains in sync with authoritative campaign and starters',()=>{
 assert.deepEqual(AREAS,sourceAreas.map(({id,name,biome,min,max})=>({id,name,biome,min,max})));
 assert.deepEqual(TRAINERS,sourceTrainers.map(({id,name,title,type,badge})=>({id,name,title,type,...(badge?{badge}:{})})));
 assert.deepEqual(STARTER_CHOICES,[1,4,7].map(id=>{const {name,types,artId}=species.find(p=>p.id===id);return {id,name,types,artId};}));
});

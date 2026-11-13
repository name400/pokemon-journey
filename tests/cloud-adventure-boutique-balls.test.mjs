import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {adventureCaptureAttempt,adventureBall,ADVENTURE_BOUTIQUE_BALLS} from '../lib/cloud-adventure/adventure-balls.mjs';

test('ZA boutique ball multipliers respect levels, water and existing dex records',()=>{
 const base=makeMon(25,10),calc=(id,mon,context={})=>adventureCaptureAttempt(mon,id,context,()=>.99).multiplier;
 for(const [level,mult] of [[1,4],[10,3.1],[29,1.2],[30,1],[100,1]])assert.equal(calc('nestball',{...base,level}),mult);
 assert.equal(calc('diveball',base,{inWater:true}),3.5);assert.equal(calc('diveball',base,{}),1);
 assert.equal(calc('repeatball',base,{registered:true}),3.5);assert.equal(calc('repeatball',base,{}),1);
 assert.equal(calc('premierball',base),1);for(const [id,price] of [['nestball',1000],['diveball',1000],['repeatball',1000],['premierball',200]]){assert.equal(adventureBall(id).price,price);assert.ok(ADVENTURE_BOUTIQUE_BALLS.some(b=>b.id===id));}
});

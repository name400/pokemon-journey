import test from 'node:test';
import assert from 'node:assert/strict';
import {asamiMegaFinalHit} from '../lib/cloud-adventure/adventure-mission26-asami.mjs';
const damage={kind:'damage',side:1,targetBoxId:'foe',actorBoxId:'mega',hp:0,hit:true},faint={kind:'faint',side:1,targetBoxId:'foe'};
test('Asami recognizes direct Mega finishing attacks in event order',()=>{
 const c={ended:true,winner:0,before:[[{boxId:'mega',mega:false},{boxId:'other',mega:false}]],events:[{kind:'form',side:0,boxId:'mega',pokemon:{mega:true}},damage,faint]};
 assert.equal(asamiMegaFinalHit(c),true);
 assert.equal(asamiMegaFinalHit({...c,events:[c.events[0],{...damage,actorBoxId:'other'},faint]}),false);
 assert.equal(asamiMegaFinalHit({...c,events:[damage,faint,c.events[0]]}),false);
 assert.equal(asamiMegaFinalHit({...c,events:[{...damage,hit:false},faint]}),null);
 assert.equal(asamiMegaFinalHit({...c,events:[{...damage,actorBoxId:'unknown'},faint]}),null);
 assert.equal(asamiMegaFinalHit({...c,winner:1}),null);
});

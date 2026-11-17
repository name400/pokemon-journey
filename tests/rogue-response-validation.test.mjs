import test from 'node:test';
import assert from 'node:assert/strict';
import {isClassicGameResponse} from '../lib/rogue-response-validation.mjs';
import {classicGameView,applyClassicAction} from '../lib/rogue-classic-game.mjs';
import {createFixture} from './browser/ui-readability/fixture.mjs';

const view=()=>({revision:4,activeSlot:0,slots:[{party:[]}],selecting:false,run:null,battle:null,eggShop:{machines:[],eggs:[],vouchers:{},voucherTypes:{}},meta:{}});
test('only complete views with the expected or newer revision are accepted',()=>{
 assert.equal(isClassicGameResponse(view(),{expectedRevision:4}),true);assert.equal(isClassicGameResponse(view(),{minimumRevision:4}),true);
 for(const change of [v=>delete v.revision,v=>v.revision=3,v=>v.revision=4.5,v=>delete v.slots,v=>v.slots=[],v=>v.slots=[{}],v=>v.activeSlot=1,v=>delete v.selecting,v=>delete v.run,v=>v.run={},v=>v.battle=[],v=>delete v.eggShop,v=>delete v.eggShop.machines,v=>v.meta=null]){const value=view();change(value);assert.equal(isClassicGameResponse(value,{expectedRevision:4}),false,JSON.stringify(value));}
 assert.equal(isClassicGameResponse(view(),{minimumRevision:5}),false);
});

test('real empty, starter-selection, battle and reward views satisfy the response contract',()=>{
 const empty={};assert.equal(isClassicGameResponse({...classicGameView(empty),revision:0}),true);
 applyClassicAction(empty,{action:'prepare',slot:0});assert.equal(isClassicGameResponse({...classicGameView(empty),revision:1},{expectedRevision:1}),true);
 for(const scenario of ['battle','rewards','field-playback-rain'])assert.equal(isClassicGameResponse({...classicGameView(createFixture(scenario)),revision:4}),true,scenario);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {makeAdventureAlpha} from '../lib/cloud-adventure/adventure-alpha.mjs';
import {alphaMoveReplacementWarning as warning} from '../lib/cloud-adventure/adventure-alpha-move-warning.mjs';

test('warning checks the selected slot, actual reusable TMs and the tutor without altering the saved Pokémon',()=>{
 const mon=makeAdventureAlpha(makeMon(16,24)),before=JSON.stringify(mon),bag={},world={};
 assert.equal(warning(mon,1,world,bag),null);assert.equal(warning({...mon,adventureAlphaMove:undefined},0,world,bag),null);
 assert.match(warning(mon,0,world,bag),/기술머신을 보유하고 있지 않습니다/);assert.match(warning(mon,0,world,bag),/기술 교습소/);
 assert.match(warning(mon,0,{zaResearchRewards:[19]},bag),/기술머신 보유: 082/);assert.match(warning(mon,0,{zaResearchRewards:[19]},bag),/보유 기술머신 082/);assert.equal(JSON.stringify(mon),before);
 const slowbro=makeAdventureAlpha(makeMon(80,44));assert.match(warning(slowbro,0,{}, {'za-tm013':1}),/보유 기술머신 013/);assert.match(warning(slowbro,0,{}, {'za-tm013':0}),/보유하고 있지 않습니다/);
 const pikachu=makeAdventureAlpha(makeMon(25,50));assert.match(warning(pikachu,0,{},{}),/레벨 기술 다시 배우기/);
});

test('unconfirmed forms and unavailable moves never promise a relearning path',()=>{
 const female={...makeMon(10025,30),adventureAlphaMove:'10만볼트',moves:['10만볼트']},msg=warning(female,0,{zaResearchRewards:[24]},{});
 assert.match(msg,/기술머신 보유: 067/);assert.match(msg,/이 폼의 학습 가능 여부는 확인되지 않았습니다/);assert.doesNotMatch(msg,/보유 기술머신 067/);
 const unknown={...makeMon(25,5),adventureAlphaMove:'절대영도',moves:['절대영도']};assert.match(warning(unknown,0,{},{}),/다시 배울 수 있는 경로가 확인되지 않았습니다/);
});

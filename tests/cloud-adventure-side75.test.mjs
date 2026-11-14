import test from 'node:test';
import assert from 'node:assert/strict';
import {makeMon} from '../lib/game.mjs';
import {evolutionOptions} from '../lib/evolution.mjs';
import {fieldMap,fieldDialogue,walkable,storeAdventurePosition,restoreAdventurePosition} from '../lib/cloud-adventure/adventure-world.mjs';
import {side75Available} from '../lib/cloud-adventure/adventure-side75.mjs';

test('Touri preserves old paths and Galarian evolution choices',()=>{
 const old={area:3,district:'lumiose-vert-sector9',x:7,y:6,facing:'up',teamIds:['saved']},before=fieldMap(old),s={...old,zaMission26Started:true},after=fieldMap(s);
 assert.equal(side75Available(old),false);assert.equal(side75Available(s),true);assert.equal(side75Available({zaSide75Won:true}),true);assert.equal(before[5][7],'#');assert.equal(after[5][7],'^');assert.equal(walkable(before[5][7]),walkable(after[5][7]));assert.equal(fieldDialogue(s).action,'side75Battle');assert.equal(fieldDialogue({...s,zaSide75Won:true,zaSide75RewardPending:true}).action,'side75Reward');
 const restored=restoreAdventurePosition(storeAdventurePosition(s,7),7);assert.deepEqual([restored.x,restored.y,restored.teamIds],[7,6,['saved']]);
 const mon=makeMon(10164,30),options=evolutionOptions(mon,{adventureEngine:'cloud'},[],{galaricacuff:1,galaricawreath:1});for(const id of [10165,10172])assert.equal(options.find(o=>o.id===id).ready,true);
 assert.equal(evolutionOptions(makeMon(79,30),{adventureEngine:'cloud'},[],{galaricacuff:1,galaricawreath:1}).some(o=>[10165,10172].includes(o.id)&&o.ready),false);
});

test('legacy explicit reward remains available without inventing rewards',()=>{
 const base={area:3,district:'lumiose-vert-sector9',x:7,y:6,facing:'up',zaSide75Won:true,zaSide75RewardPending:true};
 assert.equal(fieldDialogue(base).action,'side75Reward');assert.equal(fieldDialogue({...base,zaSide75RewardPending:false}).action,undefined);
 assert.equal(side75Available({zaMission25Started:true}),false);
});

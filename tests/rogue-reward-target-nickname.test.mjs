import test from 'node:test';
import assert from 'node:assert/strict';
import {makeReferenceMon} from '../lib/rogue-reference.mjs';
import {CLASSIC_REWARD_REGISTRY,classicRewardView,chooseClassicReward} from '../lib/rogue-classic-rewards.mjs';
import {classicServices,buyClassicService} from '../lib/rogue-classic-services.mjs';
import {classicDisplayPokemonName} from '../lib/rogue-display-name.mjs';
import {encodeGameData,decodeGameData} from '../lib/game-storage.mjs';

function fixture(){const a=makeReferenceMon(54,20,{boxId:'one',moves:['Tackle']}),b=makeReferenceMon(54,20,{boxId:'two',moves:['Tackle']});Object.assign(a,{name:'별명 · Normal',baseName:'고라파덕',formName:'Normal'});b.nickname='별명 · Blue';a.hp=1;b.hp=1;const reward={...CLASSIC_REWARD_REGISTRY.find(r=>r.id==='rarecandy'),rewardId:'rare-test'},run={id:'nickname-target',seed:'nickname-target',rng:42,wave:21,biome:1,screen:'reward',party:[a,b],money:10000,modifiers:[],tools:{},balls:{pokeball:5},rewards:[reward],pendingMoves:[],pendingGrowth:[],rerolls:0};return {run,other:{keep:true}};}

test('reward and service targets retain distinct nicknames and affect only the selected Pokemon',async()=>{
 let doc=await decodeGameData(await encodeGameData(fixture())),{run}=doc;const names=targets=>targets.map(classicDisplayPokemonName),expected=['별명 · Normal','별명 · Blue'];
 assert.deepEqual(names(classicRewardView(run,{})[0].targets),expected);assert.deepEqual(names(classicServices(run).find(s=>s.id==='potion').targets),expected);
 const service=classicServices(run).find(s=>s.id==='potion');buyClassicService(run,{itemId:'potion',boxId:'two',expectedPrice:service.price});assert.equal(run.party[0].hp,1);assert.ok(run.party[1].hp>1);assert.equal(run.party[1].nickname,'별명 · Blue');
 const before=run.party[0].level;chooseClassicReward(run,{rewardId:'rare-test',boxId:'one'},{});assert.equal(run.party[0].level,before+1);assert.equal(run.party[1].level,before);doc=await decodeGameData(await encodeGameData(doc));assert.equal(doc.run.party[0].name,'별명 · Normal');assert.equal(doc.run.party[1].nickname,'별명 · Blue');assert.deepEqual(doc.other,{keep:true});
});

import assert from 'node:assert/strict';
import {rogueSpecies,makeReferenceMon,sourceMove} from '../lib/rogue-reference.mjs';
import {ensureStarterSystem,starterProgress,classicEggMoveData,starterDexEntry,starterCatalog} from '../lib/rogue-starter-system.mjs';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {hatchClassicEgg} from '../lib/rogue-egg-shop.mjs';
import {classicRelearnMoves} from '../lib/rogue-classic-services.mjs';
const fresh=ensureStarterSystem({},[],{seed:'new-player'}),pikachu=rogueSpecies.get(25),pichu=rogueSpecies.get(172);assert.equal(fresh.eggMovePolicy,'pikachu-form-v1');starterProgress(fresh,172).eggMask=1;starterProgress(fresh,25).eggMask=2;
for(const formIndex of [0,1,8]){const egg=classicEggMoveData(pikachu,fresh,{formIndex});assert.deepEqual(egg.moves,pichu.eggMoves);assert.equal(egg.mask,1);}
assert.deepEqual(classicEggMoveData(pikachu,fresh,{formIndex:2}),{moves:[],mask:0});
const ordinary=makeReferenceMon(25,10,{boxId:'normal',rogueFormIndex:0,rogueMetBiome:-1,moves:['Tackle']}),costume={...ordinary,rogueFormIndex:2};assert.ok(classicRelearnMoves(ordinary,fresh).includes(sourceMove(pichu.eggMoves[0])));assert.ok(!classicRelearnMoves(costume,fresh).includes(sourceMove(pichu.eggMoves[0])));
const legacy=structuredClone(fresh);delete legacy.eggMovePolicy;const before=JSON.stringify(legacy.starterData);assert.equal(classicEggMoveData(pikachu,legacy,{formIndex:2}).mask,3);assert.equal(JSON.stringify(legacy.starterData),before);
const doc={coins:0,collection:[]},state=ensureClassicState(doc);state.system.eggs=[{id:'egg',productId:'common',paidPrice:12000,pokemon:makeReferenceMon(25,5,{boxId:'hatch'}),eggMoveIndex:2}];hatchClassicEgg(doc,'egg');assert.equal(starterProgress(state.system,172).eggMask&4,4);assert.equal(starterProgress(state.system,25).eggMask&4,0);

const dex=starterDexEntry(fresh,25);dex.registered=true;dex.caught=true;dex.forms=[0,2];dex.natures=['hardy'];dex.abilitySlots=['primary'];dex.genders=['M'];const rows=starterCatalog(fresh).filter(x=>x.sourceId===25);assert.ok(rows.find(x=>x.formIndex===0).moves.includes(sourceMove(pichu.eggMoves[0])));assert.ok(!rows.find(x=>x.formIndex===2).moves.includes(sourceMove(pichu.eggMoves[0])));

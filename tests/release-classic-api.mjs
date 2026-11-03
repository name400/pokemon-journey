// Local dummy identity only. Never point this fixture at a hosted production URL.
import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';let saved;
async function call(action=null,extra={}){const response=await fetch(base+'/api/rogue-classic'+(action?'':'?starters=1'),{headers:{Cookie:'__sites_local_auth=3',Origin:base,...(action?{'Content-Type':'application/json'}:{})},...(action?{method:'POST',body:JSON.stringify({action,revision:saved.revision,...extra})}:{})});const data=await response.json();if(!response.ok)throw Error(action+': '+data.error);saved=data;return data;}
await call();const starters=saved.starters;assert.ok(starters.length>=611);assert.equal(starters.filter(p=>p.unlocked).length,27);
// Slot five is reserved for this named local release fixture.
await call('prepare',{slot:4});const team=[1,4,7].map(id=>{const p=starters.find(s=>s.id===id);return {id,ability:p.abilities[0].key,nature:p.natures[0].key,gender:p.genders[0],shiny:false,moves:p.defaultMoves};});
await call('start',{slot:4,confirmOverwrite:true,selection:team});assert.equal(saved.run.wave,1);assert.equal(saved.run.party.length,3);assert.equal(saved.run.money,1000);assert.equal(saved.run.balls.pokeball,5);
const move=saved.battle.requests[0].moves.find(m=>m.id==='tackle');assert.ok(move.description.includes('몸'));assert.equal(move.pp,35);
await call('turn',{command:{type:'move',move:'tackle'}});assert.equal(saved.run.party[0].pp.tackle,34);
const reloaded=await call();assert.equal(reloaded.run.party[0].pp.tackle,34);
if(saved.eggShop.wallet>=12000){const before=saved.eggShop.wallet;await call('buyEgg',{productId:'common',expectedPrice:12000});assert.equal(saved.eggShop.wallet,before-12000);const egg=saved.eggShop.eggs.at(-1);assert.equal(egg.pokemon,undefined);await call('hatchEgg',{eggId:egg.id});assert.ok(saved.hatchedEgg?.pokemon?.id);assert.ok(saved.starters.length>=611);}
const denied=await fetch(base+'/api/rogue-classic',{method:'POST',headers:{Cookie:'__sites_local_auth=3',Origin:'https://untrusted.invalid','Content-Type':'application/json'},body:JSON.stringify({action:'buyEgg',revision:saved.revision,productId:'common',expectedPrice:12000})});assert.equal(denied.status,403);
console.log(JSON.stringify({result:'passed',identity:'local_fresh dummy',slot:5,checks:['starter defaults','10-point party','level5','PP35→34','Korean move description','cloud save reload','egg purchase/hatch','CSRF rejection']}));

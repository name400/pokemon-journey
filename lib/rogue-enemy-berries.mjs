import {calculateStats} from './pokemon-config.mjs';
import {boosterTypePool} from './rogue-classic-rewards.mjs';
const RARE=['berryenigma','berryliechi','berryganlon','berrypetaya','berryapicot','berrysalac','berrylansat','berrystarf'];
const STATS=['hp','atk','def','spa','spd','spe'];
const maxBerry=id=>['berrysitrus','berrylum','berryleppa','berryenigma'].includes(id)?2:3;
const LIMITS={focusband:5,quickclaw:3,kingsrock:3,leftovers:4,shellbell:4,scopelens:1,widelens:3,gripclaw:5,luckyegg:99,goldenegg:99,typebooster:99};
function add(mon,id,{stat=null,typeBoost=null}={}){
 mon.rogueFixedModifiers||=[];const entry=mon.rogueFixedModifiers.find(m=>m.id===id&&(m.stat||null)===stat&&(m.typeBoost||null)===typeBoost);
 const limit=id==='basestatbooster'?Math.max(1,mon.ivs?.[stat]??31):id.startsWith('berry')?maxBerry(id):LIMITS[id]||1;
 if(entry){if(entry.count>=limit)return;entry.count++;}else mon.rogueFixedModifiers.push({id,count:1,typeBoost,...(stat?{stat,transferable:false}:{})});
 if(id==='basestatbooster'){const before=mon.maxHp,alive=mon.hp>0;mon.rogueBaseBoosts||={};mon.rogueBaseBoosts[stat]=(mon.rogueBaseBoosts[stat]||0)+1;mon.stats=calculateStats(mon);mon.maxHp=mon.stats.hp;if(alive)mon.hp=Math.min(mon.maxHp,mon.hp+Math.max(0,mon.maxHp-before));}
}
// Pinned beta classic enemy count/tier pools. Unsupported trainer-only items
// remain empty outcomes; old Berry-only rules preserve their original draws.
export function applyClassicEnemyBerries(encounter,run,rng){
 if(run.enemyBerryRule!=='source-v1'||encounter.kind==='final'||!Array.isArray(encounter.team))return encounter;
 const full=['source-v1','source-v2'].includes(run.enemyItemRule),trainer=!!encounter.trainer,chances=Math.ceil(run.wave/10),draw=n=>n<=1?0:Math.floor(rng()*n);
 for(const mon of encounter.team){const boss=!!mon.rogueBoss||!!encounter.rogueTrainerBoss,denominator=boss?6:18;let amount=0;for(let i=0;i<chances;i++)if(draw(denominator)===0)amount++;if(boss)amount=Math.max(amount,Math.floor(chances/2));
  for(let i=0;i<amount;i++){
   const upgraded=draw(boss?16:32)===0,tierRoll=draw(1024);
   if(!full){if(tierRoll<=255||upgraded)continue;if(trainer&&draw(11)>=8)continue;const roll=draw(12),id=roll<2?'berrysitrus':roll<4?'berrylum':roll<6?'berryleppa':RARE[draw(RARE.length)];add(mon,id);continue;}
   let tier=tierRoll>255?0:tierRoll>60?1:tierRoll>12?2:tierRoll?3:4;tier=Math.min(4,tier+Number(upgraded));
   if(tier===0){if(trainer&&draw(11)>=8){add(mon,'basestatbooster',{stat:STATS[draw(6)]});continue;}const roll=draw(12),id=roll<2?'berrysitrus':roll<4?'berrylum':roll<6?'berryleppa':RARE[draw(RARE.length)];add(mon,id);}
   else if(tier===1){if(trainer)draw(3);add(mon,'basestatbooster',{stat:STATS[draw(6)]});}
   else if(tier===2){draw(10);const options=boosterTypePool({...run,party:[mon],modifiers:(mon.rogueFixedModifiers||[]).map(m=>({...m,boxId:mon.boxId}))});if(options.length)add(mon,'typebooster',{typeBoost:options[draw(options.length)]});}
   else if(tier===3){if(!trainer){draw(4);add(mon,'luckyegg');}else{const roll=draw(9);if(roll<2)add(mon,'focusband');else if(roll<6)add(mon,'luckyegg');else if(roll===6)add(mon,'quickclaw');else if(roll===8)add(mon,'widelens');else if(roll===7&&run.enemyItemRule==='source-v2')add(mon,'gripclaw');}}
   else if(!trainer)add(mon,'goldenegg');else{const roll=draw(4);if(roll===0)add(mon,'kingsrock');else if(roll===1)add(mon,'leftovers');else if(roll===2)add(mon,'shellbell');else add(mon,'scopelens');}
  }
 }
 return encounter;
}

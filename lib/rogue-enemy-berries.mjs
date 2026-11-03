// Pinned source: battle-scene.generateEnemyModifiers, classic enemy chance and
// the common wild/trainer berry pools. Non-berry tiers remain unsupported.
const RARE=['berryenigma','berryliechi','berryganlon','berrypetaya','berryapicot','berrysalac','berrylansat','berrystarf'];
const max=id=>['berrysitrus','berrylum','berryleppa','berryenigma'].includes(id)?2:3;
export function applyClassicEnemyBerries(encounter,run,rng){
 if(run.enemyBerryRule!=='source-v1'||encounter.kind==='final'||!Array.isArray(encounter.team))return encounter;
 const trainer=!!encounter.trainer,chances=Math.ceil(run.wave/10),draw=n=>n<=1?0:Math.floor(rng()*n);
 for(const mon of encounter.team){const boss=!!mon.rogueBoss||!!encounter.rogueTrainerBoss,denominator=boss?6:18;let amount=0;for(let i=0;i<chances;i++)if(draw(denominator)===0)amount++;if(boss)amount=Math.max(amount,Math.floor(chances/2));
  for(let i=0;i<amount;i++){
   const upgraded=draw(boss?16:32)===0,tier=draw(1024);if(tier<=255||upgraded)continue;
   // Other common trainer items are intentionally not synthesized here.
   if(trainer&&draw(11)>=8)continue;
   const roll=draw(12),id=roll<2?'berrysitrus':roll<4?'berrylum':roll<6?'berryleppa':RARE[draw(RARE.length)];
   mon.rogueFixedModifiers||=[];const existing=mon.rogueFixedModifiers.find(m=>m.id===id);if(existing){if(existing.count<max(id))existing.count++;}else mon.rogueFixedModifiers.push({id,count:1,typeBoost:null});
  }
 }
 return encounter;
}

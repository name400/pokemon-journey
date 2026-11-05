import {stageExpertBreederSolo} from './rogue-expert-breeder.mjs';
import {classicExpertBreederTeam} from './rogue-classic-world.mjs';
import {createClassicCombat} from './rogue-battle-engine.mjs';

// Prepare the complete battle on a clone; caller can commit it atomically once
// the event and its win/loss restoration paths are connected.
export function stageExpertBreederBattle(run,boxId,system,arenaOptions={}){
 const next=stageExpertBreederSolo(run,boxId),team=classicExpertBreederTeam(next);
 next.encounter={kind:'mystery',key:'expert-breeder',trainer:{name:'포켓몬 브리더',title:'트레이너',hasVoucher:false},noFlee:true,noCapture:true,team};
 next.participants=[];next.awardedFoes=[];next.expNotices=[];next.combat=createClassicCombat(next,team,{system,trainer:true,...arenaOptions});next.party=next.combat.teams[0];next.initialSwitchSlots=[];next.screen='battle';next.waveLog=[...(next.combat.log||[])];next.waveLogTurnStart=0;
 return next;
}

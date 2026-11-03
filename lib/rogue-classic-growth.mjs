import experience from '../data/experience.json' with {type:'json'};
import {configure} from './pokemon-config.mjs';
import {sourceSpeciesFor,sourceMove} from './rogue-reference.mjs';
import {starterProgress} from './rogue-starter-system.mjs';
import {classicLevelCap,classicExperienceShares,classicExperienceValue} from './rogue-classic-rules.mjs';
import {Dex} from '@pkmn/sim';
import {moves} from './game.mjs';

// Source growth curves blend 32.5% of the species curve with 67.5% cubic.
// This differs from cartridge EXP; the two game modes must not share growth.
const growthKeys=[5,3,2,4,1,6];
const friendshipCaps=[25,50,75,100,150,200,300,450,450,600];
export function classicTotalExperience(mon,level=mon.level){
 const source=sourceSpeciesFor(mon),key=growthKeys[source?.growthRate??2],table=experience[key],cubic=experience[2];
 let speciesTotal=table[level]||0;
 if(level===100&&source?.growthRate===0)speciesTotal=(level**4+level**3*2000)/3500;
 if(level===100&&source?.growthRate===5)speciesTotal=level**3*(level/2+8)*4/(100+level);
 return Math.floor(speciesTotal*.325+(cubic[level]||0)*.675);
}
export function classicExpToNext(mon){return mon.level>=100?0:Math.max(1,classicTotalExperience(mon,mon.level+1)-classicTotalExperience(mon));}
export function gainClassicExperience(mon,amount,wave,{capOverride=null}={}){
 let next={...mon,experience:Math.max(0,mon.experience||0)+Math.max(0,Math.floor(amount))};const learned=[],levels=[];
 const cap=capOverride===null?classicLevelCap(wave):Math.min(100,capOverride),source=sourceSpeciesFor(mon),form=source?.formList.find(f=>f.formIndex===(mon.rogueFormIndex||0));
 const rows=[...(source?.levelMoves||[]),...(source?.formLevelMoves?.[form?.formKey||'']||[])];
 while(next.level<cap&&next.experience>=classicExpToNext(next)){
  next.experience-=classicExpToNext(next);const hp=next.hp,max=next.maxHp;
  next=configure(next,{level:next.level+1,hp});next.hp=hp>0?Math.min(next.maxHp,hp+Math.max(0,next.maxHp-max)):0;levels.push(next.level);
  for(const [at,id]of rows)if(at===next.level){const move=sourceMove(id);if(move&&!next.moves.includes(move)&&!learned.includes(move))learned.push(move);}
 }
 // No banked EXP at a temporary cap. Raising the cap never grants hidden levels.
 if(next.level>=cap)next.experience=0;
 return {mon:next,learned,levels};
}
export function addClassicFriendship(mon,amount,system,{sootheBells=0,capped=false}={}){
 if(amount<=0){mon.friendship=Math.max(0,(mon.friendship??50)+amount);return;}
 const gained=Math.floor(amount*(1+.5*Math.min(3,sootheBells))),old=mon.friendship??50;
 mon.friendship=Math.min(255,capped?Math.max(old,Math.min(200,old+gained)):old+gained);
 const source=sourceSpeciesFor(mon);if(!source||!system)return;
 const family=source.starterId||source.sourceId,progress=starterProgress(system,family),cost=source.familyStarterCost||source.starterCost||3,threshold=friendshipCaps[cost-1];
 progress.friendshipPoints=(progress.friendshipPoints||0)+gained*3;
 const earned=Math.floor(progress.friendshipPoints/threshold);progress.candies=Math.min(9999,progress.candies+earned);progress.friendshipPoints%=threshold;
}
const modifierCount=(run,id,owner=null)=>run.modifiers.filter(m=>m.id===id&&(!owner||m.boxId===owner)).reduce((sum,m)=>sum+m.count,0);
export function queueClassicMoves(run,mon,learned){run.pendingMoves||=[];mon.moves=Array.isArray(mon.moves)?mon.moves.filter(Boolean):[];for(const move of learned){if(mon.moves.includes(move))continue;if(mon.moves.length<4){mon.moves.push(move);const native=Dex.moves.get(moves[move]?.key||move);mon.pp||={};mon.pp[native.id]=native.pp;if(Array.isArray(mon.rogueSketchPP))mon.rogueSketchPP[mon.moves.length-1]=native.pp;if(mon.roguePPUps)delete mon.roguePPUps[native.id];run.autoLearned=[...(run.autoLearned||[]),{boxId:mon.boxId,move}];}else if(!run.pendingMoves.some(p=>p.boxId===mon.boxId&&p.move===move))run.pendingMoves.push({boxId:mon.boxId,move,level:mon.level});}}
export function repairClassicLearning(run){if(!run?.pendingMoves?.length)return;const queued=[...run.pendingMoves];run.pendingMoves=[];for(const entry of queued){const mon=run.party.find(p=>p.boxId===entry.boxId);if(mon)queueClassicMoves(run,mon,[entry.move]);}if(run.screen==='learn'&&!run.pendingMoves.length)run.screen=run.afterLearn||'reward';}
export function awardClassicExperience(run,foes,{system=null,participants=run.participants||[],trainer=!!run.encounter?.trainer}={}){
 const notices=[],pending=[];
 const globalCharms=run.modifiers.filter(m=>['expcharm','superexpcharm','goldenexpcharm'].includes(m.id)).map(m=>({count:m.count,boost:{expcharm:.25,superexpcharm:.6,goldenexpcharm:1}[m.id]}));
 for(const foe of foes){
  const shares=classicExperienceShares(run.party,participants,classicExperienceValue(foe,{trainer}),run.wave,{
   expShare:modifierCount(run,'expshare'),multiParticipant:modifierCount(run,'expparticipant'),expBalance:modifierCount(run,'expbalance'),globalCharms,
   personalCharms:p=>run.modifiers.filter(m=>m.boxId===p.boxId&&['luckyegg','goldenegg'].includes(m.id)).map(m=>({count:m.count,boost:m.id==='luckyegg'?.4:1})),
  });
  run.party=run.party.map((p,i)=>{
   if(p.hp>0&&participants.includes(p.boxId))addClassicFriendship(p,3,system,{sootheBells:modifierCount(run,'soothebell',p.boxId)});
   if(!shares[i])return p;const result=gainClassicExperience(p,shares[i],run.wave);
   notices.push({boxId:p.boxId,name:p.name,experience:shares[i],levels:result.levels});
   queueClassicMoves(run,result.mon,result.learned);return result.mon;
  });
 }
 run.pendingMoves=[...(run.pendingMoves||[]),...pending];return notices;
}
export function learnClassicPendingMove(run,{boxId,move,slot=null}){
 const index=(run.pendingMoves||[]).findIndex(p=>p.boxId===boxId&&p.move===move);if(index<0)throw Error('지금 배우려는 기술을 확인하세요.');
 const mon=run.party.find(p=>p.boxId===boxId);if(!mon)throw Error('포켓몬이 파티에 없습니다.');
 if(slot!==null){if(!Number.isInteger(slot)||slot<0||slot>Math.min(3,mon.moves.length))throw Error('교체할 기술 자리를 선택하세요.');mon.rogueMoveHistory=[...new Set([...(mon.rogueMoveHistory||[]),...mon.moves])];mon.pp||={};if(mon.moves[slot]){const oldKey=Dex.moves.get(moves[mon.moves[slot]]?.key||mon.moves[slot]).id;delete mon.pp[oldKey];if(mon.roguePPUps)delete mon.roguePPUps[oldKey];}mon.moves[slot]=move;const native=Dex.moves.get(moves[move]?.key||move);mon.pp[native.id]=native.pp;if(Array.isArray(mon.rogueSketchPP))mon.rogueSketchPP[slot]=native.pp;if(mon.roguePPUps)delete mon.roguePPUps[native.id];}
 run.pendingMoves.splice(index,1);return mon;
}

import '../simulator-reference-codec.mjs';
import {Battle} from '@pkmn/sim';
import {nativeTeamSet,syncNativeTeams} from '../party-battle.mjs';

// An isolated simulator snapshot: allied Pokémon are tagged separately and are
// never player box entries. This is not yet wired into saved adventure combat.
const FORMAT='gen9multirandombattle@@@!Sleep Clause Mod,!Species Clause,!Obtainable,!HP Percentage Mod,!Illusion Level Mod';
const STATUS={독:'psn',맹독:'tox',화상:'brn',마비:'par',잠듦:'slp',얼음:'frz'};
export function createMission10DoubleSnapshot(player,ally,foes){
 if(!Array.isArray(player)||!player.length||player.length>6||!player.some(m=>m.hp>0)||!Array.isArray(ally)||ally.length!==3||!ally.some(m=>m.hp>0)||!Array.isArray(foes)||foes.length!==2||!foes.every(m=>m.hp>0))throw Error('더블 배틀 파티를 확인하세요.');
 const ids=[...player,...ally,...foes].map(m=>m.boxId);if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length)throw Error('배틀 참가자를 확인하세요.');
 const aliveFirst=team=>[...team.filter(m=>m.hp>0),...team.filter(m=>m.hp<=0)];
 const teams=[aliveFirst(player),[foes[0]],aliveFirst(ally),[foes[1]]];
 const b=new Battle({formatid:FORMAT,seed:[...crypto.getRandomValues(new Uint16Array(4))],...Object.fromEntries(teams.map((team,i)=>[`p${i+1}`,{name:['플레이어','경비 1','동료','경비 2'][i],team:team.map(nativeTeamSet)}]))});
 for(const [side,team] of teams.entries())for(const [i,m] of team.entries()){
  const p=b.sides[side].pokemon.find(p=>p.set.trainerToken===m.boxId);if(!p)throw Error('배틀 참가자를 찾지 못했습니다.');
  p.hp=Math.max(0,Math.min(p.maxhp,Math.round(m.hp/m.maxHp*p.maxhp)));
  if(p.hp===0){p.fainted=true;p.faintQueued=false;p.status='fnt';b.sides[side].pokemonLeft--;}
  if(m.status&&p.hp>0){const code=STATUS[m.status]||(['psn','tox','brn','par','slp','frz'].includes(m.status)?m.status:'');if(code){p.status=code;p.statusState=b.initEffectState({id:code,target:p,source:p});if(code==='slp'){const time=b.random(2,5);p.statusState.time=time;p.statusState.startTime=time;}if(code==='tox')p.statusState.stage=0;}}
  if(m.pp)for(const slot of p.baseMoveSlots)if(Number.isInteger(m.pp[slot.id]))slot.pp=Math.min(slot.maxpp,Math.max(0,m.pp[slot.id]));
 }
 b.eachEvent('Update');b.makeRequest(b.requestState);
 const snapshot=b.toJSON();snapshot.formatid=FORMAT; // Preserve custom rules through Battle.fromJSON.
 return {format:'mission10-multi-v1',snapshot,teams,owners:{player:player.map(m=>m.boxId),ally:ally.map(m=>m.boxId)}};
}

// Advance the isolated multi battle. Player choices are validated against p1's
// own roster; p3 (the companion) and the two guards are controlled separately.
export function playMission10MultiTurn(combat,command){
 if(combat?.format!=='mission10-multi-v1')throw Error('미션 10 배틀을 확인하세요.');
 const b=Battle.fromJSON(structuredClone(combat.snapshot));if(b.ended)throw Error('이미 끝난 배틀입니다.');
 const input=(side,cmd)=>{
  const req=side.activeRequest;if(!req||req.wait)return;
  let choice;
  if(req.forceSwitch?.[0]){
   const slot=Number(cmd?.slot),p=side.pokemon[slot-1];if(cmd?.type!=='switch'||!Number.isInteger(slot)||!p||p.isActive||p.hp<=0)throw Error('교체할 포켓몬을 확인하세요.');choice=`switch ${slot}`;
  }else if(cmd?.type==='switch'){
   const slot=Number(cmd.slot),p=side.pokemon[slot-1];if(!Number.isInteger(slot)||!p||p.isActive||p.hp<=0||req.active?.[0]?.trapped)throw Error('교체할 포켓몬을 확인하세요.');choice=`switch ${slot}`;
  }else{
   const available=(req.active?.[0]?.moves||[]).filter(m=>!m.disabled&&(m.pp===undefined||m.pp>0));
   const m=available.find(m=>m.id===cmd?.move);if(cmd?.type!=='move'||!m)throw Error('사용할 기술을 확인하세요.');
   const targeted=['normal','adjacentFoe','any'].includes(m.target);let target='';
   if(targeted){const n=Number(cmd.target);if(![1,2].includes(n))throw Error('대상을 선택하세요.');const enemy=b.sides[(side.n%2===0?1:0)+(n===2?2:0)];if(!enemy?.active[0]||enemy.active[0].hp<=0)throw Error('대상을 다시 선택하세요.');target=` ${n}`;}
   choice=`move ${m.id}${target}`;
  }
  if(!b.choose(side.id,choice))throw Error(side.choice.error||'행동을 선택하지 못했습니다.');
 };
 const player=b.p1.activeRequest;if(player&&!player.wait)input(b.p1,command);
 for(let round=0;round<12&&!b.ended;round++){
  let did=false;
  for(const index of [1,2,3]){const side=b.sides[index],req=side.activeRequest;if(!req||req.wait||side.choice?.actions?.length)continue;
   if(req.forceSwitch?.[0]){const n=side.pokemon.findIndex(p=>!p.isActive&&p.hp>0);if(n<0)continue;input(side,{type:'switch',slot:n+1});did=true;continue;}
   const move=(req.active?.[0]?.moves||[]).find(m=>!m.disabled&&(m.pp===undefined||m.pp>0)&&!['adjacentAlly','adjacentAllyOrSelf'].includes(m.target));if(!move)continue;
   const first=b.sides[side.n%2===0?1:0]?.active[0];input(side,{type:'move',move:move.id,target:first?.hp>0?1:2});did=true;
  }
  if(!did||b.p1.activeRequest&&!b.p1.activeRequest.wait&&!b.p1.choice?.actions?.length)break;
 }
 const snapshot=b.toJSON();snapshot.formatid=FORMAT;return {...combat,snapshot,teams:syncNativeTeams(b,combat.teams)};
}

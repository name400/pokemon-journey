import '../simulator-reference-codec.mjs';
import {Battle} from '@pkmn/sim';
import {nativeTeamSet} from '../party-battle.mjs';

// An isolated simulator snapshot: allied Pokémon are tagged separately and are
// never player box entries. This is not yet wired into saved adventure combat.
const STATUS={독:'psn',맹독:'tox',화상:'brn',마비:'par',잠듦:'slp',얼음:'frz'};
export function createMission10DoubleSnapshot(player,ally,foes){
 if(!Array.isArray(player)||!player.length||player.length>6||!player.some(m=>m.hp>0)||!Array.isArray(ally)||ally.length!==3||!ally.some(m=>m.hp>0)||!Array.isArray(foes)||foes.length!==2||!foes.every(m=>m.hp>0))throw Error('더블 배틀 파티를 확인하세요.');
 const ids=[...player,...ally,...foes].map(m=>m.boxId);if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length)throw Error('배틀 참가자를 확인하세요.');
 const aliveFirst=team=>[...team.filter(m=>m.hp>0),...team.filter(m=>m.hp<=0)];
 const own=aliveFirst(player),partners=aliveFirst(ally),teams=[[own[0],partners[0],...own.slice(1),...partners.slice(1)],foes];
 const b=new Battle({formatid:'gen9doublescustomgame',seed:[...crypto.getRandomValues(new Uint16Array(4))],p1:{name:'플레이어',team:teams[0].map(nativeTeamSet)},p2:{name:'상대',team:teams[1].map(nativeTeamSet)}});
 if(b.requestState==='teampreview')b.makeChoices('team '+teams[0].map((_,i)=>i+1).join(''),'team 12');
 for(const [side,team] of teams.entries())for(const [i,m] of team.entries()){
  const p=b.sides[side].pokemon.find(p=>p.set.trainerToken===m.boxId);if(!p)throw Error('배틀 참가자를 찾지 못했습니다.');
  p.hp=Math.max(0,Math.min(p.maxhp,Math.round(m.hp/m.maxHp*p.maxhp)));
  if(p.hp===0){p.fainted=true;p.faintQueued=false;p.status='fnt';b.sides[side].pokemonLeft--;}
  if(m.status&&p.hp>0){const code=STATUS[m.status]||(['psn','tox','brn','par','slp','frz'].includes(m.status)?m.status:'');if(code){p.status=code;p.statusState=b.initEffectState({id:code,target:p,source:p});if(code==='slp'){const time=b.random(2,5);p.statusState.time=time;p.statusState.startTime=time;}if(code==='tox')p.statusState.stage=0;}}
  if(m.pp)for(const slot of p.baseMoveSlots)if(Number.isInteger(m.pp[slot.id]))slot.pp=Math.min(slot.maxpp,Math.max(0,m.pp[slot.id]));
 }
 b.eachEvent('Update');b.makeRequest(b.requestState);
 return {format:'mission10-double-v1',snapshot:b.toJSON(),teams,owners:{player:player.map(m=>m.boxId),ally:ally.map(m=>m.boxId)}};
}

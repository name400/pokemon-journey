import '../simulator-reference-codec.mjs';
import {Battle,Dex} from '@pkmn/sim';
import {nativeTeamSet} from '../party-battle.mjs';

// Experimental, not connected to the game route. A triples battle uses two
// simulator sides, so trainer ownership must be enforced outside the simulator.
const FORMAT='gen9customgame@@@!Team Preview';
const STATUS={독:'psn',맹독:'tox',화상:'brn',마비:'par',잠듦:'slp',얼음:'frz'};

export function createMission37TripleSnapshot(player,first,second,foes){
 const groups=[player,first,second];
 if(groups.some(team=>!Array.isArray(team)||team.length<1||team.length>6||!team.some(mon=>mon.hp>0))||!Array.isArray(foes)||foes.length!==3||foes.some(mon=>!mon||mon.hp<=0))throw Error('세 아군과 세 상대의 파티를 확인하세요.');
 const all=[...groups.flat(),...foes],ids=all.map(mon=>mon?.boxId);if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length)throw Error('배틀 참가자 식별자를 확인하세요.');
 const ordered=groups.map(team=>[...team.filter(mon=>mon.hp>0),...team.filter(mon=>mon.hp<=0)]);
 const playerTeam=[...ordered.map(team=>team[0]),...ordered.flatMap(team=>team.slice(1))];
 const teams=[playerTeam,foes],format={...Dex.formats.get(FORMAT),gameType:'triples'};
 const battle=new Battle({format,seed:[...crypto.getRandomValues(new Uint16Array(4))],p1:{name:'플레이어',team:playerTeam.map(nativeTeamSet)},p2:{name:'상대',team:foes.map(nativeTeamSet)}});
 for(const [side,team] of teams.entries())for(const mon of team){
  const p=battle.sides[side].pokemon.find(candidate=>candidate.set.trainerToken===mon.boxId);if(!p)throw Error('배틀 참가자를 찾지 못했습니다.');
  p.hp=Math.max(0,Math.min(p.maxhp,Math.round(mon.hp/mon.maxHp*p.maxhp)));if(p.hp===0){p.fainted=true;p.faintQueued=false;p.status='fnt';p.side.pokemonLeft--;}
  const status=STATUS[mon.status]||(['psn','tox','brn','par','slp','frz'].includes(mon.status)?mon.status:'');if(status&&p.hp>0){p.status=status;p.statusState=battle.initEffectState({id:status,target:p,source:p});if(status==='slp')p.statusState.time=battle.random(2,5);if(status==='tox')p.statusState.stage=1;}
  if(mon.pp)for(const slot of p.baseMoveSlots)if(Number.isInteger(mon.pp[slot.id]))slot.pp=Math.min(slot.maxpp,Math.max(0,mon.pp[slot.id]));
 }
 battle.eachEvent('Update');battle.makeRequest(battle.requestState);
 const snapshot=battle.toJSON();snapshot.formatid=FORMAT;
 return {format:'mission37-triples-prototype-v1',snapshot,teams,owners:{player:player.map(mon=>mon.boxId),first:first.map(mon=>mon.boxId),second:second.map(mon=>mon.boxId)}};
}

export function restoreMission37TripleSnapshot(combat){
 if(combat?.format!=='mission37-triples-prototype-v1')throw Error('미션 37 실험 배틀을 확인하세요.');
 const battle=Battle.fromJSON(structuredClone(combat.snapshot));if(battle.gameType!=='triples'||battle.p1.active.length!==3||battle.p2.active.length!==3)throw Error('세 자리 배틀 저장을 확인하세요.');
 // Restore the custom game type as well as Battle.gameType; do not mutate the
 // global Dex format shared by existing singles and multi battles.
 battle.format={...battle.format,gameType:'triples'};
 return battle;
}

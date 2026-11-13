import '../simulator-reference-codec.mjs';
import {Battle,Dex} from '@pkmn/sim';
import {nativeTeamSet,syncNativeTeams} from '../party-battle.mjs';
import {moveNameByKey} from '../pokemon-config.mjs';
import {moveDetails} from '../move-description.mjs';
import {battleLines,battleVisuals,privateBattleLog} from '../full-battle.mjs';
import {adventureMoveMastered} from './adventure-plus-mastery.mjs';

// The three-ally story battle uses two simulator sides, so trainer ownership
// must be enforced outside the simulator.
const FORMAT='gen9customgame@@@!Team Preview';
const STATUS={독:'psn',맹독:'tox',화상:'brn',마비:'par',잠듦:'slp',얼음:'frz'};

export function createMission37TripleSnapshot(player,first,second,foes){
 const groups=[player,first,second];
 if(groups.some(team=>!Array.isArray(team)||team.length<1||team.length>6||!team.some(mon=>mon.hp>0))||!Array.isArray(foes)||(foes.length<2||foes.length>3)||foes.some(mon=>!mon||mon.hp<=0))throw Error('세 아군과 세 상대의 파티를 확인하세요.');
 // Showdown requires three initial opponents for triples. A fainted internal
 // slot permits a two-opponent story battle without adding an active opponent.
 if(foes.length===2)foes=[...foes,{...foes[0],boxId:`empty-foe-${crypto.randomUUID()}`,hp:0,adventureEmptySlot:true}];
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
 // Story partners are independent trainers in a turn-based adaptation of a
 // real-time encounter. Allow single-target attacks across all opposing slots;
 // otherwise an edge trainer can become unable to reach the last opponent.
 const validTargetLoc=battle.validTargetLoc.bind(battle);battle.validTargetLoc=(loc,source,type)=>loc>0&&loc<=3&&['normal','adjacentFoe'].includes(type)?true:validTargetLoc(loc,source,type);
 return battle;
}

// The simulator puts all three owners on one side. Never persist that side as
// the player's box: only the explicitly recorded player IDs belong there.
export function mission37PlayerTeam(combat){
 const ids=combat?.owners?.player,team=combat?.teams?.[0];
 if(combat?.format!=='mission37-triples-prototype-v1'||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||!Array.isArray(team))throw Error('플레이어 배틀 소유권을 확인하세요.');
 return ids.map(id=>{const matches=team.filter(mon=>mon?.boxId===id);if(matches.length!==1)throw Error('플레이어 배틀 포켓몬을 확인하세요.');return matches[0];});
}

// The view is deliberately not wired into the current two-slot client yet.
export function mission37TripleView(combat){
 const battle=restoreMission37TripleSnapshot(combat),native=syncNativeTeams(battle,combat.teams),owners=[combat.owners?.player,combat.owners?.first,combat.owners?.second];
 mission37PlayerTeam({...combat,teams:native});
 if(owners.some(ids=>!Array.isArray(ids)||!ids.length)||new Set(owners.flat()).size!==owners.flat().length)throw Error('배틀 소유권을 확인하세요.');
 const labelOwner=mon=>{const owner=owners.findIndex(ids=>ids.includes(mon.boxId));if(owner<0)throw Error('배틀 소유권을 확인하세요.');return owner?{...mon,battleOwner:owner===1?'ally':'ally2'}:mon;};
 const realFoes=team=>team.filter(mon=>mon.adventureEmptySlot!==true);
 const teams=[native[0].map(labelOwner),realFoes(native[1])],before=Array.isArray(combat.before)?[combat.before[0].map(labelOwner),realFoes(combat.before[1])]:undefined;
 const activeBySide=battle.sides.map((side,logical)=>side.active.map(p=>teams[logical].findIndex(mon=>mon.boxId===p?.set.trainerToken)));
 const request=battle.p1.activeRequest,actor=battle.p1.active[0],active=activeBySide[0][0],forced=!!request?.forceSwitch?.[0];
 const switches=battle.p1.pokemon.map((p,i)=>({slot:i+1,index:teams[0].findIndex(mon=>mon.boxId===p.set.trainerToken),name:p.name,hp:p.hp,maxHp:p.maxhp})).filter(p=>p.hp>0&&p.index!==active&&owners[0].includes(teams[0][p.index]?.boxId)&&(!request?.active?.[0]?.trapped||forced));
 const moves=(request?.active?.[0]?.moves||[]).filter(m=>!m.disabled&&(m.pp===undefined||m.pp>0)).map(m=>{const move=Dex.moves.get(m.id),targeted=['normal','adjacentFoe','any','adjacentAlly','adjacentAllyOrSelf'].includes(m.target);return {id:m.id,name:moveNameByKey[m.id]||m.move,pp:m.pp??1,maxPp:m.maxpp??1,type:move.type,typeKey:move.type.toLowerCase(),power:move.basePower,...moveDetails(move),accuracy:move.accuracy===true?100:move.accuracy,category:move.category,target:m.target,targets:targeted?battle.sides.flatMap((side,logical)=>side.active.flatMap((p,slot)=>{const index=activeBySide[logical][slot];return p&&p.hp>0&&actor&&battle.validTarget(p,actor,m.target)&&index>=0?[{side:logical,index,slot,name:teams[logical][index].name,target:actor.getLocOf(p)}]:[];})):[]};});
 const auto=!!(!battle.ended&&request&&!request.wait&&(request.forceSwitch&&!forced||actor?.fainted&&!switches.length));
 const specials=request?.active?.[0]?.canMegaEvo&&!combat.megaUsed?.[0]?[{key:'mega',label:'메가진화'}]:[];
 const gauge=combat.adventurePlusGaugeV1,member=teams[0][active];if(gauge){for(const move of moves)move.plusReady=gauge.charge>0&&!member?.mega&&move.category!=='Status'&&move.power>0&&adventureMoveMastered(member,move.id);if(gauge.charge<3)specials.length=0;}
 const choice={slot:0,kind:battle.ended||!request||request.wait||auto?'wait':forced?'switch':actor?.fainted?'wait':'move',active:Math.max(0,active),moves,switches,specials};
 return {side:0,teams,activeBySide,active:[Math.max(0,active),Math.max(0,activeBySide[1][0])],before,beforeActive:combat.beforeActive,beforeActiveBySide:combat.beforeActiveBySide,requests:[{...choice,actors:[choice]}],turn:battle.turn,ended:battle.ended,winner:battle.ended?(battle.winner==='플레이어'?0:1):null,log:combat.log||[],events:combat.events||[],adventureMultiEventsV1:true,adventureMultiContinueV1:auto,adventureTripleV1:true,...(gauge?{adventurePlusGauge:gauge}:{}),adventureMegaPlusDamageV1:combat.adventureMegaPlusDamageV1===true,weather:battle.field.weather||'',terrain:battle.field.terrain||''};
}

// Experimental turn runner. Ownership is checked before sending any choice to
// the shared simulator side; it is not connected to a production route.
export function playMission37TriplePrototype(combat,command){
 const battle=restoreMission37TripleSnapshot(combat);if(battle.ended)throw Error('이미 끝난 배틀입니다.');
 const gauge=combat.adventurePlusGaugeV1?{...combat.adventurePlusGaugeV1}:null,actor=battle.p1.active[0],req=battle.p1.activeRequest?.active?.[0],available=req?.moves||[],chosen=available.find(m=>m.id===command?.move),moveData=chosen?Dex.moves.get(chosen.id):null,member=combat.teams[0].find(m=>m.boxId===actor?.set.trainerToken),mega=command?.special==='mega';
 if(command?.plus===true&&(!gauge||actor?.species?.isMega||command?.type!=='move'||command.special||gauge.charge<1||!chosen||chosen.disabled||chosen.pp===0||moveData?.category==='Status'||!(moveData?.basePower>0)||!adventureMoveMastered(member,chosen.id)))throw Error('숙달된 공격 기술과 기술플러스 게이지를 확인하세요.');
 if(gauge&&mega&&gauge.charge<3)throw Error('메가진화에는 게이지 3칸이 필요합니다.');
 if(combat.adventureMegaPlusDamageV1===true||gauge){const token=actor?.set.trainerToken,plusId=command?.plus===true?chosen.id:null;battle.onEvent('ModifyDamage',battle.format,{priority:0},function(damage,source,target,move){if(!target||!move||move.category==='Status')return;const selected=source?.side===this.p1&&source.set.trainerToken===token&&move.id===plusId,automatic=(combat.adventureMegaPlusDamageV1===true||!!gauge)&&source?.species?.isMega;if(!selected&&!automatic)return;const superEffective=this.dex.getImmunity(move.type,target)&&this.dex.getEffectiveness(move.type,target)>0;this.chainModify(superEffective?[5325,4096]:[4915,4096]);});}
 const ownership=[combat.owners?.player,combat.owners?.first,combat.owners?.second];
 if(ownership.some(group=>!Array.isArray(group)||!group.length)||new Set(ownership.flat()).size!==ownership.flat().length)throw Error('배틀 소유권을 확인하세요.');
 const owned=new Set(ownership.flat()),actual=battle.p1.pokemon.map(p=>p.set.trainerToken);if(actual.length!==owned.size||actual.some(token=>!owned.has(token)))throw Error('저장된 배틀 소유권을 확인하세요.');
 for(let i=0;i<3;i++)if(!ownership[i].includes(battle.p1.active[i]?.set.trainerToken))throw Error('배틀 자리의 소유권을 확인하세요.');
 // Simulator triples share one side. Limit mega evolution per owner instead
 // of allowing one trainer to consume the other two trainers' opportunity.
 const megaUsed=Array.isArray(combat.megaUsed)?[0,1,2].map(i=>combat.megaUsed[i]===true):[false,false,false];
 const chooseMove=battle.p1.chooseMove.bind(battle.p1);battle.p1.chooseMove=(...args)=>{battle.p1.choice.mega=false;return chooseMove(...args);};
 const runMega=battle.actions.runMegaEvo.bind(battle.actions);battle.actions.runMegaEvo=pokemon=>{if(pokemon.side!==battle.p1)return runMega(pokemon);const owner=ownership.findIndex(ids=>ids.includes(pokemon.set.trainerToken));if(owner<0||megaUsed[owner])return false;const other=battle.p1.pokemon.filter(p=>!ownership[owner].includes(p.set.trainerToken)).map(p=>[p,p.canMegaEvo]);const result=runMega(pokemon);if(result){megaUsed[owner]=true;for(const [p,canMega] of other)p.canMegaEvo=canMega;}return result;};
 // The simulator otherwise tries to fill every fainted slot from the entire
 // shared bench. Leave an exhausted owner's slot empty instead. This policy is
 // reapplied after restore and is not written into the simulator snapshot.
 const checkFainted=battle.checkFainted.bind(battle);battle.checkFainted=()=>{checkFainted();for(let i=0;i<3;i++){const p=battle.p1.active[i];if(p?.fainted&&!battle.p1.pokemon.some(q=>!q.isActive&&!q.fainted&&q.hp>0&&ownership[i].includes(q.set.trainerToken)))p.switchFlag=false;}};
 const start=battle.log.length,before=syncNativeTeams(battle,combat.teams),beforeActiveBySide=battle.sides.map((side,i)=>side.active.map(p=>before[i].findIndex(mon=>mon.boxId===p?.set.trainerToken)));
 if(command?.type==='item'){
  const actor=battle.p1.active[0],req=battle.p1.activeRequest;if(!actor||actor.fainted||!req?.active?.[0]||req.forceSwitch)throw Error('행동할 수 있을 때 도구를 사용하세요.');
  if(['adventure-revive','adventure-max-revive'].includes(command.item)){const target=battle.p1.pokemon.find(p=>p.set.trainerToken===command.boxId);if(!target||!ownership[0].includes(command.boxId)||!target.fainted||target.hp!==0||target.isActive)throw Error('기절한 플레이어 파티 포켓몬을 확인하세요.');target.side.pokemonLeft++;target.fainted=false;target.faintQueued=false;target.subFainted=false;target.status='';target.hp=1;target.sethp(command.item==='adventure-max-revive'?target.maxhp:Math.max(1,Math.floor(target.maxhp/2)));battle.add('-heal',target,target.getHealth,'[from] item: '+(command.item==='adventure-max-revive'?'Max Revive':'Revive'));}
  else if(['potion','super','hyper','max','fullrestore','freshwater','antidote','fullheal','lumiosegalette'].includes(command.item)){const target=command.boxId?battle.p1.pokemon.find(p=>p.set.trainerToken===command.boxId&&ownership[0].includes(command.boxId)):actor;if(!target||target.hp<=0)throw Error('회복할 플레이어 파티 포켓몬을 확인하세요.');if(command.item==='antidote'){if(!['psn','tox'].includes(target.status))throw Error('독 상태가 아닙니다.');target.cureStatus();}else if(['fullheal','lumiosegalette'].includes(command.item)){if(!target.status&&!target.volatiles.confusion)throw Error('회복할 상태이상이 없습니다.');if(target.status)target.cureStatus();if(target.volatiles.confusion)target.removeVolatile('confusion');}else{if(target.hp===target.maxhp&&!(command.item==='fullrestore'&&target.status))throw Error('이미 회복된 포켓몬입니다.');const amount=target.heal(['fullrestore','max'].includes(command.item)?target.maxhp:command.item==='hyper'?120:command.item==='super'?60:command.item==='freshwater'?30:20);if(amount)battle.add('-heal',target,target.getHealth,'[from] item: Potion');if(command.item==='fullrestore')target.cureStatus();}}else throw Error('알 수 없는 도구입니다.');
  const choosePass=battle.p1.choosePass.bind(battle.p1);battle.p1.choosePass=()=>{if(battle.p1.getChoiceIndex(true)!==0)return choosePass();battle.p1.choice.actions.push({choice:'pass',pokemon:actor});return true;};
 }
 function switchChoice(side,slot,owner,requested){
  const candidates=side.pokemon.map((p,i)=>({p,slot:i+1})).filter(({p})=>p.hp>0&&!p.fainted&&!p.isActive&&(!owner||owner.includes(p.set.trainerToken)));
  const choice=requested===undefined?candidates[0]:candidates.find(candidate=>candidate.slot===Number(requested));
  if(!choice)throw Error(owner?'해당 동료의 교체 포켓몬을 확인하세요.':'상대 교체 포켓몬을 확인하세요.');return `switch ${choice.slot}`;
 }
 function moveChoice(side,index,requested){
  const actor=side.active[index],req=side.activeRequest?.active?.[index];if(!actor||actor.fainted||!req)return 'pass';
  if(side===battle.p1&&index===0&&!requested)throw Error('플레이어의 기술 또는 교체를 선택하세요.');
  if(side===battle.p1&&index===0&&requested?.type==='item')return 'pass';
  if(requested?.type==='switch'){if(req.trapped)throw Error('교체할 수 없는 상태입니다.');return switchChoice(side,index,ownership[0],requested.slot);}
  const available=(req.moves||[]).filter(move=>!move.disabled&&(move.pp===undefined||move.pp>0));
  const safe=available.filter(move=>move.target!=='allAdjacent');const options=safe.length?safe:available;
  const move=requested?available.find(candidate=>candidate.id===requested.move):options.slice().sort((a,b)=>(Dex.moves.get(b.id).basePower||0)-(Dex.moves.get(a.id).basePower||0))[0];
  if((requested&&requested.type!=='move')||!move)throw Error('사용할 기술을 확인하세요.');
  // Showdown's forced recharge request omits target metadata in triples, but
  // its choice parser still requires a target location before it sees the lock.
  if(move.id==='recharge')return 'move recharge 1';
  const targeted=['normal','adjacentFoe','any','adjacentAlly','adjacentAllyOrSelf'].includes(move.target);
  const wantsMega=side===battle.p1&&(requested?requested.special==='mega':true)&&!megaUsed[index]&&!!req.canMegaEvo;if(requested?.special&&(!wantsMega||requested.special!=='mega'))throw Error('사용할 수 있는 메가진화를 확인하세요.');const special=wantsMega?' mega':'';
  if(!targeted)return `move ${move.id}${special}`;
  const legal=battle.sides.flatMap(s=>s.active).filter(target=>target&&target.hp>0&&battle.validTarget(target,actor,move.target));
  const allyTarget=['adjacentAlly','adjacentAllyOrSelf'].includes(move.target);
  const target=requested?legal.find(candidate=>actor.getLocOf(candidate)===Number(requested.target)):legal.find(candidate=>allyTarget?candidate.side===side:candidate.side!==side);
  if(!target)throw Error('기술 대상을 확인하세요.');return `move ${move.id} ${actor.getLocOf(target)}${special}`;
 }
 function sideChoice(side,isPlayer){
  const req=side.activeRequest;if(!req||req.wait)return null;
  if(req.forceSwitch){const claimed=new Set();let needed=0;const choices=req.forceSwitch.map((forced,index)=>{if(!forced)return 'pass';const owner=isPlayer?ownership[index]:null;const candidates=side.pokemon.map((p,i)=>({p,slot:i+1})).filter(({p,slot})=>p.hp>0&&!p.fainted&&!p.isActive&&!claimed.has(slot)&&(!owner||owner.includes(p.set.trainerToken)));if(isPlayer&&!candidates.length){side.active[index].switchFlag=false;return 'pass';}const candidate=isPlayer&&index===0?candidates.find(c=>c.slot===Number(command?.slot)):candidates[0];if(isPlayer&&index===0&&command?.type!=='switch'||!candidate)throw Error('해당 소유자의 교체 포켓몬을 확인하세요.');claimed.add(candidate.slot);needed++;return `switch ${candidate.slot}`;});if(isPlayer){side.choice.forcedSwitchesLeft=needed;side.choice.forcedPassesLeft=0;}return choices.join(', ');}
  return side.active.map((_,index)=>moveChoice(side,index,isPlayer&&index===0?command:undefined)).join(', ');
 }
 const left=sideChoice(battle.p1,true),right=sideChoice(battle.p2,false);if(!left&&!right)throw Error('진행할 배틀 행동이 없습니다.');
 if(left&&!battle.choose('p1',left))throw Error(battle.p1.choice.error||'아군 행동을 선택할 수 없습니다.');
 if(right&&!battle.choose('p2',right))throw Error(battle.p2.choice.error||'상대 행동을 선택할 수 없습니다.');
 if(gauge){const acted=privateBattleLog(battle,start).some(line=>line.startsWith(`|move|p1a: ${actor?.name}|`));if(mega&&actor?.species?.isMega)gauge.charge=0;else if(acted&&command?.plus===true)gauge.charge--;else if(acted&&!actor?.species?.isMega)gauge.charge=Math.min(3,gauge.charge+1);}
 const snapshot=battle.toJSON();snapshot.formatid=FORMAT;
 return {...combat,...(gauge?{adventurePlusGaugeV1:gauge}:{}),snapshot,megaUsed,teams:syncNativeTeams(battle,combat.teams),before,beforeActiveBySide,beforeActive:beforeActiveBySide.map(indices=>Math.max(0,indices[0])),ended:battle.ended,winner:battle.ended?(battle.winner==='플레이어'?0:1):null,log:battleLines(battle,start),events:battleVisuals(battle,start,before)};
}

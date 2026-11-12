import '../simulator-reference-codec.mjs';
import {Battle,Dex} from '@pkmn/sim';
import {moveNameByKey} from '../pokemon-config.mjs';
import {moveDetails} from '../move-description.mjs';
import {battleLines} from '../full-battle.mjs';
import {nativeTeamSet,syncNativeTeams,recordNativeBattleMetrics} from '../party-battle.mjs';

// Mission-specific multi battle snapshots keep the companion on its own
// simulator side; companion Pokémon never become player box entries.
const FORMAT='gen9multirandombattle@@@!Sleep Clause Mod,!Species Clause,!Obtainable,!HP Percentage Mod,!Illusion Level Mod';
function multiLines(b,start){return battleLines({log:b.log.map(line=>line.replace(/\|p3[a-z]?:/g,'|p1b:').replace(/\|p4[a-z]?:/g,'|p2b:'))},start);}
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
 return {format:'mission10-multi-v1',snapshot,teams,ended:false,winner:null,log:multiLines(b,0),events:[],owners:{player:player.map(m=>m.boxId),ally:ally.map(m=>m.boxId)}};
}

// Advance the mission multi battle. Player choices are validated against p1's
// own roster; p3 (the companion) and the two guards are controlled separately.
export function playMission10MultiTurn(combat,command){
 if(combat?.format!=='mission10-multi-v1')throw Error('미션 10 배틀을 확인하세요.');
 const b=Battle.fromJSON(structuredClone(combat.snapshot));const start=b.log.length;if(b.ended)throw Error('이미 끝난 배틀입니다.');
 const input=(side,cmd)=>{
  const req=side.activeRequest;if(!req||req.wait)return;
  let choice;
  if(cmd?.type==='item'){
   if(req.forceSwitch?.[0]||!req.active?.[0])throw Error('교체해야 할 때는 도구를 사용할 수 없습니다.');const p=side.active[0];
   if(['potion','super','hyper','max','fullrestore'].includes(cmd.item)){if(p.hp===p.maxhp&&!(cmd.item==='fullrestore'&&p.status))throw Error('이미 회복된 포켓몬입니다.');p.heal(['fullrestore','max'].includes(cmd.item)?p.maxhp:cmd.item==='hyper'?120:cmd.item==='super'?60:20);if(cmd.item==='fullrestore')p.cureStatus();}
   else if(cmd.item==='antidote'){if(!['psn','tox'].includes(p.status))throw Error('독 상태가 아닙니다.');p.cureStatus();}else throw Error('알 수 없는 도구입니다.');
   b.add('message',`${p.name}에게 도구를 사용했다.`);side.clearChoice();side.choice.actions.push({choice:'pass',pokemon:p});if(b.allChoicesDone())b.commitChoices();return;
  }else if(req.forceSwitch?.[0]){
   const slot=Number(cmd?.slot),p=side.pokemon[slot-1];if(cmd?.type!=='switch'||!Number.isInteger(slot)||!p||p.isActive||p.hp<=0)throw Error('교체할 포켓몬을 확인하세요.');choice=`switch ${slot}`;
  }else if(cmd?.type==='switch'){
   const slot=Number(cmd.slot),p=side.pokemon[slot-1];if(!Number.isInteger(slot)||!p||p.isActive||p.hp<=0||req.active?.[0]?.trapped)throw Error('교체할 포켓몬을 확인하세요.');choice=`switch ${slot}`;
  }else{
   const available=(req.active?.[0]?.moves||[]).filter(m=>!m.disabled&&(m.pp===undefined||m.pp>0));
   const m=available.find(m=>m.id===cmd?.move||m.move===cmd?.move||moveNameByKey[m.id]===cmd?.move);if(cmd?.type!=='move'||!m)throw Error('사용할 기술을 확인하세요.');
   const targeted=['normal','adjacentFoe','any','adjacentAlly','adjacentAllyOrSelf'].includes(m.target);let target='';
   if(targeted){const n=Number(cmd.target),source=side.active[0],selected=b.sides.map(s=>s.active[0]).find(p=>p&&p.hp>0&&source.getLocOf(p)===n&&b.validTarget(p,source,m.target));if(!selected)throw Error('대상을 다시 선택하세요.');target=` ${n}`;}
   const special=cmd.special||'',flags={mega:'canMegaEvo',megax:'canMegaEvoX',megay:'canMegaEvoY',ultra:'canUltraBurst',dynamax:'canDynamax',terastallize:'canTerastallize',zmove:'canZMove'};if(special&&(!flags[special]||!req.active?.[0]?.[flags[special]]))throw Error('사용 가능한 특수 변화를 확인하세요.');choice=`move ${m.id}${target}${special?' '+special:''}`;
  }
  if(!b.choose(side.id,choice))throw Error(side.choice.error||'행동을 선택하지 못했습니다.');
 };
 const player=b.p1.activeRequest;if(player&&!player.wait)input(b.p1,command);
 for(let round=0;round<128&&!b.ended;round++){
  let did=false;
  for(const index of [1,2,3]){const side=b.sides[index],req=side.activeRequest;if(!req||req.wait||side.choice?.actions?.length)continue;
   if(req.forceSwitch?.[0]){const n=side.pokemon.findIndex(p=>!p.isActive&&p.hp>0);if(n<0)continue;input(side,{type:'switch',slot:n+1});did=true;continue;}
   const move=(req.active?.[0]?.moves||[]).filter(m=>!m.disabled&&(m.pp===undefined||m.pp>0)&&!['adjacentAlly','adjacentAllyOrSelf'].includes(m.target)).sort((a,c)=>(Dex.moves.get(c.id).basePower||0)-(Dex.moves.get(a.id).basePower||0))[0];if(!move)continue;
   const first=b.sides[side.n%2===0?1:0]?.active[0];input(side,{type:'move',move:move.id,target:first?.hp>0?1:2});did=true;
  }
  if(!did||b.p1.activeRequest&&!b.p1.activeRequest.wait&&!b.p1.choice?.actions?.length)break;
 }
 if(!b.ended&&(!b.p1.activeRequest||b.p1.activeRequest.wait))throw Error('동료의 배틀을 완료하지 못했습니다. 다시 시도해 주세요.');
 const teams=syncNativeTeams(b,combat.teams);recordNativeBattleMetrics(b,teams,start,combat.teams);for(const team of teams)for(const m of team)if(m.hp===0){m.damageTaken=0;m.recoilDamage=0;}const snapshot=b.toJSON();snapshot.formatid=FORMAT;return {...combat,snapshot,teams,ended:b.ended,winner:b.ended?(b.winner==='플레이어'||b.winner==='동료'?0:1):null,log:multiLines(b,start),events:[]};
}

// Adapt the four independent simulator sides to the existing two-column
// battle presentation. Only the player's active slot is selectable.
export function mission10MultiView(combat){
 if(combat?.format!=='mission10-multi-v1')throw Error('미션 10 배틀을 확인하세요.');
 const b=Battle.fromJSON(structuredClone(combat.snapshot)),teams=[combat.teams[0].concat(combat.teams[2]),combat.teams[1].concat(combat.teams[3])];
 const index=(logical,side)=>{const token=b.sides[side].active[0]?.set.trainerToken;return teams[logical].findIndex(p=>p.boxId===token);};
 const activeBySide=[[index(0,0),index(0,2)],[index(1,1),index(1,3)]],req=b.p1.activeRequest,forced=!!req?.forceSwitch?.[0],active=activeBySide[0][0];
 const switches=b.p1.pokemon.map((p,i)=>({slot:i+1,index:teams[0].findIndex(m=>m.boxId===p.set.trainerToken),name:p.name,hp:p.hp,maxHp:p.maxhp})).filter(p=>p.hp>0&&p.index!==active&&(!req?.active?.[0]?.trapped||forced));
 const list=(req?.active?.[0]?.moves||[]).filter(m=>!m.disabled&&(m.pp===undefined||m.pp>0)).map(m=>{const move=Dex.moves.get(m.id),targeted=['normal','adjacentFoe','any','adjacentAlly','adjacentAllyOrSelf'].includes(m.target);return {id:m.id,name:moveNameByKey[m.id]||m.move,pp:m.pp??1,maxPp:m.maxpp??1,type:move.type,typeKey:move.type.toLowerCase(),power:move.basePower,...moveDetails(move),accuracy:move.accuracy===true?100:move.accuracy,category:move.category,target:m.target,targets:targeted?b.sides.flatMap((side,n)=>{const p=side.active[0],source=b.p1.active[0],logical=n%2,slot=n>=2?1:0,idx=activeBySide[logical][slot];return p&&p.hp>0&&source&&b.validTarget(p,source,m.target)&&idx>=0?[{side:logical,index:idx,slot,name:teams[logical][idx].name,target:source.getLocOf(p)}]:[]}):[]};});
 const specials=[];for(const [key,flag,label] of [['mega','canMegaEvo','메가진화'],['megax','canMegaEvoX','메가진화 X'],['megay','canMegaEvoY','메가진화 Y'],['ultra','canUltraBurst','울트라버스트'],['dynamax','canDynamax','다이맥스'],['terastallize','canTerastallize','테라스탈']])if(req?.active?.[0]?.[flag])specials.push({key,label});if(req?.active?.[0]?.canZMove)specials.push({key:'zmove',label:'Z기술'});
 const actor={slot:0,kind:b.ended||!req||req.wait?'wait':forced?'switch':'move',active:Math.max(0,active),moves:list,switches,specials};
 return {side:0,teams,requests:[{...actor,actors:[actor]}],activeBySide,active:[Math.max(0,activeBySide[0][0]),Math.max(0,activeBySide[1][0])],turn:b.turn,ended:b.ended,winner:b.ended?(b.winner==='플레이어'||b.winner==='동료'?0:1):null,log:combat.log||[],events:[],weather:b.field.weather||'',terrain:b.field.terrain||''};
}

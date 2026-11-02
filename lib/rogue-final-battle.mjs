import {rogueFormArt} from './rogue-form-art.mjs';
import {Dex} from '@pkmn/sim';
import {sourceSpeciesFor} from './rogue-reference.mjs';
import {configure} from './pokemon-config.mjs';
const installed=new WeakSet();
const phaseTwoMoves=['dynamaxcannon','crosspoison','flamethrower','recover'];
export function bindClassicFinalBattle(battle,combat,run,{preparePokemon,applyStats}){
 if(!combat.finalBoss||installed.has(battle))return;installed.add(battle);
 battle.rogueFinal||={phase:1,bossToken:String(combat.teams[1][0].boxId),transitionCount:0,pendingPartner:false};
 const nativeAction=battle.runAction;
 function summonPartner(){const side=battle.p1,lead=side.active[0],partner=side.pokemon.find(p=>p!==lead&&p.hp>0&&!p.fainted&&!p.isActive);
  if(partner){if(partner.position!==1){const position=partner.position,displaced=side.pokemon[1];side.pokemon[1]=partner;partner.position=1;side.pokemon[position]=displaced;displaced.position=position;}
   side.active.push(null);side.slotConditions.push({});if(!battle.actions.switchIn(partner,1))throw Error('최종전의 두 번째 포켓몬을 내보내지 못했습니다.');
   const index=battle.queue.list.findIndex(action=>action.choice==='runSwitch'&&action.pokemon===partner);if(index>=0)battle.queue.list.splice(index,1);battle.actions.runSwitch(partner);battle.rogueFinal.partnerToken=partner.set.trainerToken;
  }
  battle.rogueFinal.pendingPartner=false;battle.updateSpeed();const order=battle.getAllActive(true);battle.speedSort(order);battle.speedOrder=order.map(p=>p.getFieldPositionValue());
  if(!battle.ended&&battle.requestState==='move')battle.makeRequest('move');
 }
 function transform(boss){
  const state=battle.rogueFinal,old=combat.teams[1].find(p=>String(p.boxId)===state.bossToken),record=sourceSpeciesFor(old),form=record.formList.find(f=>f.formKey==='eternamax');if(!form)throw Error('무한다이맥스 폼 데이터를 확인하세요.');
  battle.queue.cancelMove(boss);const stages={...boss.boosts};boss.clearStatus();boss.clearVolatile();
  const native=battle.dex.species.get('eternatuseternamax'),names=phaseTwoMoves.map(id=>battle.dex.moves.get(id));
  const next=configure({...old,...rogueFormArt(form,old.shiny),rogueFormIndex:form.formIndex,rogueFormKey:'eternamax',rogueBattleSpecies:native.id,rogueBaseStats:{...form.baseStats},rogueTypes:[...form.types],types:[...form.types],ability:'pressure',roguePassiveAbility:null,rogueBossSegments:5,roguePPMax:{recover:1},moves:names.map(move=>move.name),pp:Object.fromEntries(names.map(m=>[m.id,m.id==='recover'?1:m.pp])),battleAppearance:native.id,battleSprite:native.spriteid,eternamax:true,status:null});
  combat.teams[1]=combat.teams[1].map(p=>p.boxId===old.boxId?next:p);if(run){run.encounter.phase=2;run.encounter.doubles=true;run.encounter.team=[next];}
  boss.set.species=native.name;boss.baseSpecies=native;boss.setSpecies(native);boss.baseAbility='pressure';boss.ability='pressure';boss.abilityState=battle.initEffectState({id:'pressure',target:boss});boss.boosts=stages;
  applyStats(boss,next,{forceSpecies:true});boss.hp=boss.maxhp;boss.fainted=false;boss.faintQueued=false;boss.status='';boss.statusState=battle.initEffectState({id:'',target:boss});boss.m.rogueBossIndex=4;boss.details=boss.getUpdatedDetails();boss.canTerastallize=null;delete boss.terastallized;
  boss.set.moves=[...phaseTwoMoves];boss.ppUps=phaseTwoMoves.map(()=>0);boss.baseMoveSlots=names.map(m=>({move:m.name,id:m.id,pp:m.id==='recover'?1:m.pp,maxpp:m.id==='recover'?1:m.pp,target:m.target,disabled:false,disabledSource:'',used:false}));boss.moveSlots=boss.baseMoveSlots.map(m=>({...m}));
  state.phase=2;state.transitionCount++;state.pendingPartner=true;combat.doubles=true;combat.finalPhase=2;
  const blackHole={id:'miniblackhole',boxId:next.boxId,count:1,transferable:false};combat.modifiers.push(blackHole);if(run)run.modifiers.push({...blackHole});
  battle.add('detailschange',boss,boss.details);battle.add('-heal',boss,boss.getHealth,'[from] final boss phase');battle.add('message','무한다이노가 무한다이맥스했다!');
  battle.gameType='doubles';battle.activePerHalf=2;battle.format=Dex.formats.get('gen9doublescustomgame');battle.ruleTable=battle.dex.formats.getRuleTable(battle.format);battle.formatData.id=battle.format.id;battle.add('gametype','doubles');
  // A one-boss side stays length one. A null second enemy makes the native
  // action loop crash and would invent an opponent that does not exist.
 }
 Object.defineProperty(battle,'runAction',{configurable:true,enumerable:false,value(action){const result=nativeAction.call(this,action),state=this.rogueFinal,boss=this.p2.pokemon.find(p=>String(p.set.trainerToken)===state.bossToken);
  if(!this.ended&&state.phase===1&&boss?.hp>0&&(boss.m.rogueBossIndex??3)<1)transform(boss);
  if(!this.ended&&state.pendingPartner&&action.choice==='residual')summonPartner();return result;
 }});
}

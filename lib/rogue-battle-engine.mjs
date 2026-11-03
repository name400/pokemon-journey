import {classicBall} from './rogue-ball-catalog.mjs';
import {classicCaptureBlockReason} from './rogue-capture-eligibility.mjs';
import {moveDetails} from './move-description.mjs';
import {Battle,PRNG,Dex} from '@pkmn/sim';
import {nativeTeamSet,syncNativeTeams} from './party-battle.mjs';
import {battleLines,battleVisuals} from './full-battle.mjs';
import {rules,moveNameByKey,calculateStats} from './pokemon-config.mjs';
import {moves} from './game.mjs';
import {bindAbilityComponents} from './rogue-ability-components.mjs';
import {markInitialEncounter,continueWild} from './rogue-battle-continuity.mjs';
import {installWildLifecycle} from './rogue-battle-lifecycle.mjs';
import {installEncounterGuards} from './rogue-encounter-guards.mjs';
import {classicMaxPP} from './rogue-classic-services.mjs';
import {awardClassicExperience} from './rogue-classic-growth.mjs';
import {attemptClassicCapture} from './rogue-classic-capture.mjs';
import {classicBossDamage,classicBossIndex,classicBossBoosts} from './rogue-boss.mjs';
import {classicDynamaxCannonMultiplier} from './rogue-classic-rules.mjs';
import {rogueSpecies} from './rogue-reference.mjs';
import {rogueFormArt} from './rogue-form-art.mjs';
import {bindClassicFinalBattle} from './rogue-final-battle.mjs';

const types={노말:'Normal',불꽃:'Fire',물:'Water',전기:'Electric',풀:'Grass',얼음:'Ice',격투:'Fighting',독:'Poison',땅:'Ground',비행:'Flying',에스퍼:'Psychic',벌레:'Bug',바위:'Rock',고스트:'Ghost',드래곤:'Dragon',악:'Dark',강철:'Steel',페어리:'Fairy',스텔라:'Stellar'};
const statuses={독:'psn',맹독:'tox',화상:'brn',마비:'par',잠듦:'slp',얼음:'frz'};
const localizedType=Object.fromEntries(Object.entries(types).map(([local,native])=>[native,local]));
function formMoveType(mon,move,p){
 if(move.id==='aurawheel'&&p?.species?.baseSpecies==='Morpeko')return p.species.id==='morpekohangry'?'Dark':'Electric';
 if(move.id==='ivycudgel'&&p?.species?.baseSpecies==='Ogerpon')return p.species.id.includes('wellspring')?'Water':p.species.id.includes('hearthflame')?'Fire':p.species.id.includes('cornerstone')?'Rock':'Grass';
 if(p?.transformed||![493,773].includes(mon?.rogueSourceId)||!['judgment','multiattack'].includes(move.id))return move.type;
 return types[mon.rogueTypes?.[0]]||mon.rogueTypes?.[0]||move.type;
}
function dynamicNativeFormId(sourceId,form){
 if(form.nativeSpecies)return form.nativeSpecies;
 if(sourceId===1017){const mask=form.formKey.replace('-mask','').replaceAll('-','');return 'ogerpon'+(mask==='teal'?'':mask);}
 const prefix={351:'castform',718:'zygarde',746:'wishiwashi',778:'mimikyu',875:'eiscue',877:'morpeko',964:'palafin',1024:'terapagos'}[sourceId];
 return prefix?prefix+(form.formKey==='zero'?'':form.formKey.replaceAll('-','')):null;
}
const bindings=new WeakMap();
const token=p=>String(p.set.trainerToken);
function set(mon,i){const teraType=mon.rogueSourceId===1024?'Stellar':mon.rogueSourceId===1017?(['Grass','Water','Fire','Rock'][(mon.rogueFormIndex||0)%4]):types[mon.teraType]||mon.teraType||types[mon.types?.[0]];return {...nativeTeamSet(mon,i),species:mon.rogueBattleSpecies||rules.species[mon.id].key,teraType};}
function sourceMon(combat,p){return combat.teams[p.side.n].find(m=>String(m.boxId)===token(p));}
function sourceStats(p,mon,{initial=false,forceSpecies=false}={}){
 if(!mon)return;
 const expected=mon.rogueBattleSpecies||rules.species[mon.id]?.key;
 if((initial||forceSpecies)&&expected&&p.species.id!==expected){const form=p.battle.dex.species.get(expected);if(form.exists){const ability=forceSpecies&&mon.ability?p.battle.dex.abilities.get(mon.ability):null,changed=ability?.exists&&ability.id!==p.ability;if(changed&&p.isActive&&p.hp>0)p.battle.singleEvent('End',p.getAbility(),p.abilityState,p);p.setSpecies(form);p.baseSpecies=form;p.details=p.getUpdatedDetails();if(ability?.exists){p.baseAbility=ability.id;p.set.ability=ability.id;if(changed){p.ability=ability.id;p.abilityState=p.battle.initEffectState({id:ability.id,target:p});if(p.isActive&&p.hp>0)p.m.roguePendingAbilityStart=true;}}}}
 if(!p.transformed&&p.species.id===expected){
  p.level=mon.level;p.set.level=mon.level;
  // PokéRogue G-Max forms weigh 999.9 kg; simulator G-Max species use 0.
  const weightkg=mon.rogueFormKey?.startsWith('gigantamax')?999.9:mon.rogueWeightKg||p.species.weightkg;
  const form=new p.battle.dex.Species({...p.species,baseStats:mon.rogueBaseStats||p.species.baseStats,types:mon.rogueTypes?.map(t=>types[t]||t)||p.species.types,weightkg});
  p.species=form;if(initial||forceSpecies)p.weighthg=form.weighthg;if(initial||p.baseSpecies.id===expected)p.baseSpecies=form;
  if(initial||forceSpecies)p.setType(form.types,true);
  const stats=calculateStats(mon);p.storedStats={...stats};delete p.storedStats.hp;p.baseStoredStats={...p.storedStats};
  p.maxhp=stats.hp;p.baseMaxhp=stats.hp;p.m.rogueMega=!!mon.rogueFormKey?.startsWith('mega');p.m.roguePermanentDynamax=(mon.rogueFormKey?.startsWith('gigantamax')||mon.rogueFormKey==='eternamax');p.m.rogueEternamax=mon.rogueFormKey==='eternamax';
  // Major forms end Tera in the pinned rules. Keep a previously spent orb
  // spent; this only removes the old native transformation and its type.
  if(p.terastallized&&(p.species.isMega||p.m.rogueMega||p.species.isPrimal||p.species.forme==='Ultra'||p.m.roguePermanentDynamax)){p.terastallized=null;p.setType(form.types,true);}
  p.updateSpeed();
 }
 // These permanent native battle forms have their own stats. Refresh them
 // when a Pokémon levels up during a continuous wild battle.
 if(!p.transformed&&(mon.rogueSourceId===875&&p.species.id==='eiscuenoice'||mon.rogueSourceId===718&&p.species.id==='zygardecomplete'&&p.baseSpecies.id==='zygardecomplete'||mon.rogueSourceId===964&&p.species.id==='palafinhero'&&p.baseSpecies.id==='palafinhero'||mon.rogueSourceId===1024&&['terapagosterastal','terapagosstellar'].includes(p.species.id)&&p.baseSpecies.id===p.species.id||mon.rogueSourceId===1017&&p.species.id.endsWith('tera')&&p.baseSpecies.id===p.species.id)){
  const stats=calculateStats({...mon,rogueBaseStats:p.species.baseStats});p.level=mon.level;p.set.level=mon.level;p.storedStats={...stats};delete p.storedStats.hp;p.baseStoredStats={...p.storedStats};p.maxhp=stats.hp;p.baseMaxhp=stats.hp;p.updateSpeed();
 }
 if(initial){
  p.hp=Math.max(0,Math.min(p.maxhp,mon.hp));
  if(!p.hp&&!p.fainted){p.fainted=true;p.status='fnt';p.side.pokemonLeft--;}
  if(mon.status&&p.hp){p.status=statuses[mon.status]||mon.status;p.statusState=p.battle.initEffectState({id:p.status,target:p});}
 }
 const learnedMoves=mon.moves.map(name=>p.battle.dex.moves.get(moves[name]?.key||name));
 if(learnedMoves.length!==p.baseMoveSlots.length||learnedMoves.some((move,i)=>p.baseMoveSlots[i]?.id!==move.id)){p.set.moves=learnedMoves.map(m=>m.id);p.baseMoveSlots=learnedMoves.map((move,i)=>({move:move.name,id:move.id,pp:mon.pp?.[move.id]??classicMaxPP(mon,i),maxpp:classicMaxPP(mon,i),target:move.target,disabled:false,disabledSource:'',used:false}));if(!p.transformed)p.moveSlots=p.baseMoveSlots.map(m=>({...m}));}
 for(const [index,slot]of p.baseMoveSlots.entries()){
  const max=classicMaxPP(mon,index);slot.maxpp=max;
  if(initial)slot.pp=Math.min(max,Number.isInteger(mon.pp?.[slot.id])?mon.pp[slot.id]:max);
  p.ppUps[index]=Math.max(0,Math.min(3,mon.roguePPUps?.[slot.id]||0));
 }
 if(!p.transformed)for(const slot of p.moveSlots){const base=p.baseMoveSlots.find(m=>m.id===slot.id);if(base){slot.maxpp=base.maxpp;if(initial)slot.pp=base.pp;}}
}
function prepareBossPokemon(p,combat,run=null){
 const nativeDamage=p.damage,nativeFaint=p.faint;
 Object.defineProperty(p,'faint',{configurable:true,enumerable:false,value(source=null,effect=null){
  const boss=this.side.n===1&&Number(sourceMon(combat,this)?.rogueBossSegments)>1;
  if(boss&&!source&&!effect&&this.battle.effect?.id==='destinybond'){this.battle.add('-immune',this);return 0;}
  return nativeFaint.call(this,source,effect);
 }});
 Object.defineProperty(p,'damage',{configurable:true,enumerable:false,value(amount,source,effect){
  const mon=sourceMon(combat,this),segments=mon?.rogueBossSegments||0;let dealt;
  if(this.side.n!==1||segments<2)dealt=nativeDamage.call(this,amount,source,effect);
  else{
   const firstFinal=combat.finalBoss&&this.battle.rogueFinal?.phase===1,previous=this.m.rogueBossIndex??classicBossIndex(this.hp,this.maxhp,segments),result=classicBossDamage(amount,this.hp,this.maxhp,segments,{index:previous,minimumIndex:firstFinal?1:0});
   if(firstFinal)result.damage=Math.min(result.damage,Math.max(0,this.hp-1));
   dealt=nativeDamage.call(this,result.damage,source,effect);
   if(result.cleared<=previous){const next=classicBossBoosts(segments,previous,result.cleared,this.storedStats,this.boosts,()=>this.battle.random(0,1000000)/1000000);this.m.rogueBossIndex=next.index;if(!combat.trainer&&this.hp>0)for(const [stat,amount]of Object.entries(next.boosts)){this.boosts[stat]+=amount;this.battle.add('-boost',this,stat,amount);this.statsRaisedThisTurn=true;}this.updateSpeed();}
  }
  if(run&&this.side.n===1&&source?.side?.n===0&&effect?.effectType==='Move'&&dealt>0&&!source.ignoringItem()){
   const stacks=Math.min(5,combat.modifiers.filter(m=>m.id==='goldenpunch'&&m.boxId===token(source)).reduce((n,m)=>n+m.count,0));
   if(stacks){const money=Math.floor(dealt*.5*stacks),amulets=Math.min(5,combat.modifiers.filter(m=>m.id==='amuletcoin'&&!m.boxId).reduce((n,m)=>n+m.count,0));run.money+=money+Math.floor(money*.2*amulets);}
  }
  return dealt;
 }});
}
function prepareNativePokemon(p,combat,run){
 prepareBossPokemon(p,combat,run);const native=p.setSpecies;Object.defineProperty(p,'setSpecies',{configurable:true,enumerable:false,value(...args){const value=native.apply(this,args);sourceStats(this,run?.party?.find(m=>String(m.boxId)===token(this))||sourceMon(combat,this));return value;}});
}
function capturedStub(b,p){p.m.captured=true;p.hp=0;p.fainted=true;p.faintQueued=false;p.isActive=false;p.isStarted=false;p.switchFlag=false;p.forceSwitchFlag=false;b.p2.pokemonLeft=Math.max(0,b.p2.pokemonLeft-1);b.queue.cancelAction(p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);p.clearVolatile();p.status='fnt';}
function install(b,combat,run=null,system=null){
 const descriptor={version:2,pokemon:combat.teams.flatMap((team,side)=>team.filter(p=>p.roguePassiveAbility).map(p=>({side,token:String(p.boxId),passive:p.roguePassiveAbility})))};
 const abilities=bindAbilityComponents(b,descriptor,{allowActiveRebind:p=>{const mon=sourceMon(combat,p),expected=mon?.rogueBattleSpecies||rules.species[mon?.id]?.key;return !!(b.ended&&p.side.n===0&&!p.transformed&&expected&&p.baseSpecies.id!==expected);}});bindings.set(b,abilities);
 for(const side of b.sides)for(const p of side.pokemon)prepareNativePokemon(p,combat,run);
 const count=(id,owner)=>combat.modifiers.filter(m=>m.id===id&&(!owner||m.boxId===owner)).reduce((n,m)=>n+m.count,0);
 // Form items are run modifiers, not simulator held items. Override the
 // simulator's item-based Arceus/Silvally typing with the actual source form.
 b.onEvent('Type',b.format,{priority:0},function(current,p){const mon=sourceMon(combat,p),required=mon?.rogueSourceId===493?'multitype':mon?.rogueSourceId===773?'rkssystem':null;if(required&&!p.transformed&&p.hasAbility(required)&&mon.rogueTypes?.[0])return [types[mon.rogueTypes[0]]||mon.rogueTypes[0]];});
 b.onEvent('ModifyType',b.format,{priority:0},function(move,p){if(p)move.type=formMoveType(sourceMon(combat,p),move,p);});
 // Bosses ignore these HP manipulation moves; other targets remain affected.
 b.onEvent('TryHit',b.format,{priority:100},function(target,source,move){if(['perishsong','painsplit','endeavor'].includes(move?.id)&&target?.side?.n===1&&Number(sourceMon(combat,target)?.rogueBossSegments)>1){this.add('-immune',target);return null;}});
 b.onEvent('BasePower',b.format,{priority:16},function(power,p,target,move){const wave=run?.wave??combat.wave;if(move?.id==='dynamaxcannon'&&target&&Number.isInteger(wave)){const factor=classicDynamaxCannonMultiplier(wave,target.level);if(factor>1)this.chainModify(factor);}});
 b.onEvent('BasePower',b.format,{priority:15},function(power,p,target,move){const n=combat.modifiers.filter(m=>m.boxId===token(p)&&m.typeBoost===move.type).reduce((sum,m)=>sum+m.count,0);if(n&&!p.ignoringItem())this.chainModify(100+20*n,100);});
 b.onEvent('ModifyAccuracy',b.format,{priority:15},function(accuracy,target,source){if(typeof accuracy!=='number'||!source||source.ignoringItem())return;const n=count('widelens',token(source));if(n)return accuracy+5*Math.min(3,n);});
 b.onEvent('ModifyCritRatio',b.format,{priority:15},function(ratio,source){if(source&&!source.ignoringItem()&&count('scopelens',token(source)))return ratio+1;});
 b.onEvent('AfterMoveSecondarySelf',b.format,{priority:-1},function(p,target,move){if(!p||p.ignoringItem()||p.forceSwitchFlag||!move?.totalDamage)return;const n=Math.min(4,count('shellbell',token(p)));if(n)this.heal(move.totalDamage*n/8,p,p,this.dex.items.get('shellbell'));});
 b.onEvent('Residual',b.format,{order:5,subOrder:4},function(p){const n=count('leftovers',token(p));if(n&&p.hp&&!p.ignoringItem())this.heal(p.baseMaxhp*n/16,p,p,this.dex.items.get('leftovers'));});
 b.onEvent('Residual',b.format,{order:28},function(p){
  if(!p?.hp||!count('miniblackhole',token(p)))return;
  const foes=p.adjacentFoes().filter(target=>target.hp>0);if(!foes.length)return;const target=this.sample(foes);if(target.hasAbility('stickyhold')){this.add('-activate',target,'ability: Sticky Hold');return;}
  const transferables=combat.modifiers.filter(m=>m.boxId===token(target)&&m.count>0&&m.transferable!==false&&m.id!=='miniblackhole'),options=transferables.map(m=>({kind:'modifier',entry:m}));
  if(target.item&&!p.item)options.push({kind:'item',entry:target.getItem()});if(!options.length)return;
  const selected=this.sample(options);
  if(selected.kind==='item'){const item=target.takeItem(p);if(!item||!p.setItem(item,target,this.dex.moves.get('thief')))return;this.add('-item',p,item.name,'[from] move: Thief',`[of] ${target}`);return;}
  const item=selected.entry,maximum=({leftovers:4,soothebell:3,goldenpunch:5,widelens:3,scopelens:1,shellbell:4})[item.id]||99,owned=combat.modifiers.find(m=>m.boxId===token(p)&&m.id===item.id&&m.typeBoost===item.typeBoost);if((owned?.count||0)>=maximum)return;
  item.count--;if(owned)owned.count++;else combat.modifiers.push({...item,boxId:token(p),count:1});
  if(run){const previous=run.modifiers.find(m=>m.boxId===token(target)&&m.id===item.id&&m.typeBoost===item.typeBoost);if(previous)previous.count=Math.max(0,previous.count-1);const received=run.modifiers.find(m=>m.boxId===token(p)&&m.id===item.id&&m.typeBoost===item.typeBoost);if(received)received.count++;else run.modifiers.push({...item,boxId:token(p),count:1});}
  this.add('message',`${p.name}의 미니블랙홀이 ${target.name}의 도구 한 개를 흡수했다!`);
 });
 if(run)b.onEvent('BeforeSwitchIn',b.format,{priority:101},function(p){if(p.side.n===0)run.participants=[...new Set([...(run.participants||[]),token(p)])];});
 if(run)b.onEvent('Faint',b.format,{priority:-50},function(p){
  if(p.side.n===0){run.participants=(run.participants||[]).filter(id=>String(id)!==token(p));const mon=run.party.find(m=>String(m.boxId)===token(p));if(mon)mon.friendship=Math.max(0,(mon.friendship??50)-5);return;}
  const foe=sourceMon(combat,p);if(!foe||run.awardedFoes?.includes(foe.boxId))return;
  run.awardedFoes||=[];run.awardedFoes.push(foe.boxId);run.party=syncNativeTeams(this,[run.party,combat.teams[1]])[0];
  run.expNotices=[...(run.expNotices||[]),...awardClassicExperience(run,[foe],{system})];
  for(const mon of run.party){const native=this.p1.pokemon.find(p=>token(p)===String(mon.boxId));if(native){sourceStats(native,mon);native.hp=Math.min(native.maxhp,mon.hp);native.level=mon.level;native.set.level=mon.level;}}
 });
 if(b.rogueWild){installWildLifecycle(b);installEncounterGuards(b);}
 bindClassicFinalBattle(b,combat,run,{preparePokemon:prepareBossPokemon,applyStats:sourceStats});
 return abilities;
}
function snapshot(b){const registry=Object.getOwnPropertyDescriptor(b,'events');try{delete b.events;return JSON.parse(JSON.stringify(b.toJSON()));}finally{if(registry)Object.defineProperty(b,'events',registry);}}
function restore(combat,run=null,system=null){
 const state=structuredClone(combat.snapshot),requests=state.sides.map(s=>s.activeRequest!==null);for(const side of state.sides)side.activeRequest=null;
 const b=Battle.fromJSON(state);install(b,combat,run,system);
 for(const side of b.sides)for(const p of side.pokemon){const mon=(p.side.n===0&&run?.party?.find(m=>String(m.boxId)===token(p)))||sourceMon(combat,p),expected=mon?.rogueBattleSpecies||rules.species[mon?.id]?.key,preserveBattleForm=mon?.rogueSourceId===778&&expected==='mimikyu'&&p.baseSpecies.id==='mimikyubusted'&&p.hp>0||mon?.rogueSourceId===875&&expected==='eiscue'&&p.baseSpecies.id==='eiscuenoice'||mon?.rogueSourceId===718&&['zygarde','zygarde10'].includes(expected)&&p.baseSpecies.id==='zygardecomplete'||mon?.rogueSourceId===964&&expected==='palafin'&&p.baseSpecies.id==='palafinhero'||mon?.rogueSourceId===1024&&expected==='terapagos'&&['terapagosterastal','terapagosstellar'].includes(p.baseSpecies.id)||mon?.rogueSourceId===1017&&p.terastallized&&p.baseSpecies.id===(expected==='ogerpon'?'ogerpontealtera':expected+'tera');sourceStats(p,mon,{forceSpecies:!!mon&&!p.transformed&&!preserveBattleForm&&p.baseSpecies.id!==expected});if(p.species.isMega||p.m.rogueMega||p.species.isPrimal||p.species.forme==='Ultra'||p.m.roguePermanentDynamax)p.canTerastallize=null;}
 // Older snapshots may overcount party members that entered the battle fainted.
 // Reconcile only current owned members; archived/released Pokémon are excluded.
 const owned=new Set(combat.teams[0].map(mon=>String(mon.boxId)));b.p1.pokemonLeft=b.p1.pokemon.filter(p=>owned.has(token(p))&&p.hp>0&&!p.fainted&&!p.m.released).length;
 if(requests.some(Boolean)){const next=b.getRequests(b.requestState);b.sides.forEach((side,i)=>side.activeRequest=requests[i]?next[i]:null);b.prng=new PRNG(state.prng);}
 return b;
}
function actorRequest(b,side,slot,team,allTeams){
 const s=b.sides[side],req=s.activeRequest,p=s.active[slot],active=team.findIndex(m=>String(m.boxId)===String(p?.set.trainerToken)),forced=!!req?.forceSwitch?.[slot];
 // A vacant active slot can still receive a native forced-switch request.
 // It must expose the bench rather than being treated as an automatic pass.
 if(b.ended||!req||req.wait||(!p||p.hp<=0)&&!forced||req.forceSwitch&&!forced)return {slot,kind:'wait',active,moves:[],switches:[],specials:[]};
 const a=req.active?.[slot],switches=s.pokemon.map((candidate,index)=>({slot:index+1,index:team.findIndex(m=>String(m.boxId)===token(candidate)),name:team.find(m=>String(m.boxId)===token(candidate))?.name||candidate.name,hp:candidate.hp,maxHp:candidate.maxhp})).filter(q=>q.index>=0&&q.hp>0&&!s.active.some(p=>p&&token(p)===String(team[q.index].boxId))&&(!a?.trapped||forced));
 const specials=[];if(a?.canTerastallize)specials.push({key:'terastallize',label:'테라스탈'});
 const legal=(a?.moves||[]).filter(m=>!m.disabled&&(m.pp===undefined||m.pp>0)).map(m=>{
  const move=b.dex.moves.get(m.id),moveType=formMoveType(team[active],move,p),targets=[];
  if(b.activePerHalf>1&&['normal','any','adjacentFoe','adjacentAlly','adjacentAllyOrSelf'].includes(m.target||move.target)){
   for(const candidateSide of b.sides)for(const [i,target]of candidateSide.active.entries())if(target?.hp&&
    ((m.target==='adjacentAlly'||m.target==='adjacentAllyOrSelf')?candidateSide.n===side&&(m.target==='adjacentAllyOrSelf'||target!==p):m.target==='any'?target!==p:candidateSide.n!==side))targets.push({side:candidateSide.n,index:allTeams[candidateSide.n].findIndex(q=>String(q.boxId)===token(target)),slot:i,name:target.name.replace(/#\d+$/,''),target:candidateSide.n===side?-(i+1):i+1,effectiveness:move.category==='Status'?null:b.dex.getImmunity(moveType,target)?2**b.dex.getEffectiveness(moveType,target):0});
  }
  const foe=b.sides[1-side].active.find(p=>p?.hp),name=moveNameByKey[m.id]||m.move;
  return {id:m.id,name,pp:m.pp??1,maxPp:m.maxpp??1,type:moveType===move.type?(moves[name]?.type||move.type):(localizedType[moveType]||moveType),typeKey:moveType.toLowerCase(),power:move.basePower,...moveDetails(move),accuracy:move.accuracy,category:move.category,target:m.target||move.target,targets,effectivenessTarget:b.activePerHalf>1&&foe?foe.name.replace(/#\d+$/,''):null,effectiveness:move.category==='Status'||!foe?null:b.dex.getImmunity(moveType,foe)?2**b.dex.getEffectiveness(moveType,foe):0};
 });
 return {slot,kind:forced?'switch':'move',active,moves:legal.length||forced?legal:[{id:'struggle',name:'몸부림',pp:1,maxPp:1,targets:[]}],switches,specials};
}
function request(b,side,teams){const actors=b.sides[side].active.map((p,slot)=>actorRequest(b,side,slot,teams[side],teams));return {...(actors.find(a=>a.kind!=='wait')||actors[0]),actors};}
function output(b,combat,start=0,run=null){
 const teams=syncNativeTeams(b,combat.teams).map((team,side)=>team.map(mon=>{const p=b.sides[side].pokemon.find(p=>token(p)===String(mon.boxId)),boss=p&&mon.rogueBossSegments?{rogueBossSegmentIndex:p.m.rogueBossIndex??classicBossIndex(p.hp,p.maxhp,mon.rogueBossSegments)}:{},dynamicForm=!p?.transformed&&[351,648,718,746,778,875,877,964,1017,1024].includes(mon.rogueSourceId)?rogueSpecies.get(mon.rogueSourceId).formList.find(f=>dynamicNativeFormId(mon.rogueSourceId,f)===p?.species.id):null;return {...mon,...boss,...(dynamicForm?rogueFormArt(dynamicForm,mon.shiny):{}),captured:!!p?.m.captured,...(p?.m.rogueMega?{mega:true}:{}),...(p?.m.roguePermanentDynamax?{dynamaxed:true,gigantamax:!p.m.rogueEternamax,eternamax:!!p.m.rogueEternamax,battleAppearance:p.species.id,battleSprite:p.species.spriteid}:{})};}));
 // XP may have changed party levels inside Faint before this final sync.
 if(run)for(const mon of teams[0]){const grown=run.party.find(p=>p.boxId===mon.boxId);if(grown){Object.assign(mon,{level:grown.level,experience:grown.experience,friendship:grown.friendship,stats:grown.stats,moves:[...grown.moves],roguePPUps:grown.roguePPUps});}}
 const requests=[request(b,0,teams),request(b,1,teams)];
 return {...combat,teams,snapshot:snapshot(b),requests,activeBySide:requests.map(r=>r.actors.map(a=>a.active)),turn:b.turn,ended:b.ended,winner:b.ended?(b.winner===b.p1.name?0:b.winner===b.p2.name?1:null):null,
  log:battleLines(b,start),events:battleVisuals(b,start,combat.teams),before:combat.teams,beforeActive:combat.requests?.map(r=>r.active)||[0,0],beforeActiveBySide:combat.activeBySide||requests.map(r=>r.actors.map(a=>a.active)),weather:b.field.weather||'',terrain:b.field.terrain||''};
}
export function createClassicCombat(run,foes,{trainer=false,doubles=false,weather='',system=null}={}){
 if(!run.party.some(p=>p.hp>0))throw Error('싸울 수 있는 포켓몬이 없습니다.');
 const teams=[run.party,foes].map(team=>structuredClone(team).sort((a,b)=>Number(b.hp>0)-Number(a.hp>0)));
 const combat={classic:true,wave:run.wave,teams,modifiers:structuredClone(run.modifiers||[]),trainer,doubles,finalBoss:run.encounter?.kind==='final',finalPhase:run.encounter?.phase||null};
 const seed=Array.from({length:4},()=>{run.rng=(Math.imul(run.rng||1,1664525)+1013904223)>>>0;return run.rng%65536;});
 const b=new Battle({formatid:doubles?'gen9doublescustomgame':'gen9customgame',seed,p1:{name:'플레이어',team:teams[0].map(set)},p2:{name:'상대',team:teams[1].map(set)}});
 if(!trainer)markInitialEncounter(b,run.id+':'+run.wave,String(run.biome));
 if(b.rogueWild)b.rogueWild.wave=run.wave;
 install(b,combat,run,system);
 for(const side of b.sides)for(const p of side.pokemon){const mon=sourceMon(combat,p);sourceStats(p,mon,{initial:true});const allowed=side.n===0?run.tools.teraOrb&&run.teraCharged:trainer&&mon?.rogueInstantTera;p.canTerastallize=allowed&&!p.species.isMega&&!p.m.rogueMega&&!p.species.isPrimal&&p.species.forme!=='Ultra'&&!p.m.roguePermanentDynamax?p.canTerastallize:null;}
 if(b.requestState==='teampreview')b.makeChoices(teams[0].map((_,i)=>i+1).join('').replace(/^/,'team '),teams[1].map((_,i)=>i+1).join('').replace(/^/,'team '));
 // Team preview can reset the simulator's count after initial fainted HP is applied.
 b.p1.pokemonLeft=b.p1.pokemon.filter(p=>p.hp>0&&!p.fainted).length;
 if(weather&&!b.field.weather){b.field.setWeather(weather,b.p1.active[0],b.dex.moves.get(weather));b.field.weatherState.duration=0;}
 const active=b.p1.active.filter(p=>p?.hp).map(token);run.participants=[...new Set([...(run.participants||[]),...active])];
 return output(b,combat,0,run);
}
function commandFor(command,req){
 const actions=req.actors.filter(a=>a.kind!=='wait'),chosen=command?.type==='turn'?command.actions:[{...command,actor:actions[0]?.slot}];
 if(!Array.isArray(chosen)||chosen.length!==actions.length)throw Error('전장에 나온 포켓몬의 행동을 모두 선택하세요.');
 const seen=new Set(),switches=new Set();return req.actors.map(actor=>{
  if(actor.kind==='wait')return 'pass';const cmd=chosen.find(c=>c.actor===actor.slot);if(!cmd||seen.has(cmd.actor))throw Error('행동을 선택할 포켓몬을 확인하세요.');seen.add(cmd.actor);
  if(cmd.type==='switch'){if(!actor.switches.some(s=>s.slot===cmd.slot)||switches.has(cmd.slot))throw Error('교체할 수 없는 포켓몬입니다.');switches.add(cmd.slot);return 'switch '+cmd.slot;}
  if(cmd.type!=='move'||actor.kind!=='move')throw Error('먼저 쓰러진 포켓몬을 교체하세요.');const move=actor.moves.find(m=>m.id===cmd.move||m.name===cmd.move);if(!move)throw Error('사용할 수 없는 기술입니다.');
  if(cmd.special&&!actor.specials.some(s=>s.key===cmd.special))throw Error('지금 사용할 수 없는 변화입니다.');
  if(move.targets.length&&!move.targets.some(t=>t.target===cmd.target))throw Error('기술의 대상을 선택하세요.');
  return `move ${move.id}${move.targets.length?' '+cmd.target:''}${cmd.special?' '+cmd.special:''}`;
 }).join(', ');
}
function aiInput(b,combat){
 const req=request(b,1,combat.teams),simulation=restore({...combat,snapshot:snapshot(b)}),used=new Set();
 return req.actors.map(actor=>{
  const att=simulation.p2.active[actor.slot],foes=simulation.p1.active.filter(p=>p?.hp);if(actor.kind==='wait')return 'pass';
  // During a simultaneous faint the opponent may need to replace a Pokémon
  // before the simulator has finalized the outcome, with no living foe to score.
  if(actor.kind==='switch'&&!foes.length){const choice=actor.switches.find(s=>!used.has(s.slot));if(!choice)return 'pass';used.add(choice.slot);return 'switch '+choice.slot;}
  const damage=(a,d,id)=>{try{return Number(simulation.actions.getDamage(a,d,simulation.dex.moves.get(id),true))||0;}catch{return 0;}};
  const scoreMove=(a,id,target)=>{
   const m=simulation.dex.moves.get(id);let score=0;
   if(m.category!=='Status')score=target.side===a.side?-1000:damage(a,target,id);
   else if(m.heal)score=a.hp<a.maxhp*.55?a.maxhp*.6:0;
   else if(m.status&&!target.status&&target.runStatusImmunity(m.status))score=target.maxhp*(m.status==='slp'?.35:.2);
   else if(m.boosts){
    const self=m.target==='self',holder=self?a:target;
    const useful=Object.entries(m.boosts).filter(([stat,n])=>self?n>0&&holder.boosts[stat]<2:n<0&&holder.boosts[stat]>=0);
    if(useful.length){const attacks=a.getMoves().map(move=>simulation.dex.moves.get(move.id)).filter(move=>move.category!=='Status'),best=Math.max(0,...attacks.map(move=>damage(a,target,move.id)));
     // One setup/debuff can be useful. Repeated Growl below 0 is not a plan.
     score=best*(self?.7:.55);if(self&&useful.every(([stat])=>stat==='atk')&&!attacks.some(move=>move.category==='Physical'))score=0;if(self&&useful.every(([stat])=>stat==='spa')&&!attacks.some(move=>move.category==='Special'))score=0;
    }
   }else if(m.sideCondition&&!target.side.sideConditions[m.sideCondition]&&target.side.pokemonLeft>1)score=target.maxhp*.15;
   return score*(m.accuracy===true?1:(m.accuracy||100)/100);
  };
  const bench=actor.switches.filter(s=>!used.has(s.slot)).map(s=>{const p=simulation.p2.pokemon[s.slot-1],offense=Math.max(0,...p.getMoves().map(m=>scoreMove(p,m.id,foes[0]))),incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(m=>damage(f,p,m.id))));return {...s,score:offense/Math.max(1,foes[0]?.hp)-incoming/Math.max(1,p.hp)};}).sort((a,b)=>b.score-a.score);
  if(actor.kind==='switch'){if(!bench[0])return 'pass';used.add(bench[0].slot);return 'switch '+bench[0].slot;}
  const ranked=actor.moves.flatMap(m=>(m.targets.length?m.targets:[{target:undefined,side:0,slot:0}]).map(t=>{const target=simulation.sides[t.side]?.active[t.slot]||foes[0];return {m,t,score:scoreMove(att,m.id,target)};})).sort((a,b)=>b.score-a.score);
  const incoming=Math.max(0,...foes.flatMap(f=>f.getMoves().map(m=>damage(f,att,m.id)))),active=ranked[0].score/Math.max(1,foes[0]?.hp)-incoming/Math.max(1,att.hp);
  if(combat.trainer&&bench[0]&&bench[0].score>active+.7&&incoming>att.hp*.65&&(b.turn-(combat.lastSwitchTurn||-10)>2)){used.add(bench[0].slot);combat.lastSwitchTurn=b.turn;return 'switch '+bench[0].slot;}
  const best=ranked[0],mon=sourceMon(combat,b.p2.active[actor.slot]),tera=mon?.rogueInstantTera&&actor.specials.some(s=>s.key==='terastallize')?' terastallize':'';return 'move '+best.m.id+(best.t.target!==undefined?' '+best.t.target:'')+tera;
 }).join(', ');
}
export function playClassicCombat(run,command,{system=null}={}){
 const combat=structuredClone(run.combat);combat.wave=run.wave;combat.teams[0]=structuredClone(run.party);const b=restore(combat,run,system),start=b.log.length;if(b.ended)throw Error('이미 끝난 전투입니다.');
 const input=commandFor(command,request(b,0,combat.teams)),cpuNeeded=!!b.p2.activeRequest&&!b.p2.activeRequest.wait,cpu=cpuNeeded?aiInput(b,combat):null;
 if(!b.choose('p1',input))throw Error(b.p1.choice.error||'행동을 처리하지 못했습니다.');
 if(cpuNeeded&&!b.ended&&!b.choose('p2',cpu))throw Error(b.p2.choice.error||'상대 행동을 처리하지 못했습니다.');
 for(let i=0;i<12&&!b.ended;i++){const own=request(b,0,combat.teams),foe=request(b,1,combat.teams);if(own.kind!=='wait'||foe.kind==='wait')break;if(!b.choose('p2',aiInput(b,combat)))throw Error('상대 교체에 실패했습니다.');}
 run.participants=[...new Set([...(run.participants||[]),...b.p1.active.filter(p=>p?.hp).map(token)])];
 if(b.p1.pokemon.some(p=>p.terastallized))run.teraCharged=false;
 return output(b,combat,start,run);
}
export function classicCombatView(combat){const {teams,before,beforeActive,beforeActiveBySide,turn,ended,winner,log,events,weather,terrain}=combat;const b=restore(combat),requests=[request(b,0,teams),request(b,1,teams)],activeBySide=requests.map(r=>r.actors.map(a=>a.active));return {teams,before,beforeActive,beforeActiveBySide,requests:[requests[0]],turn,ended,winner,log,events,weather,terrain,activeBySide,side:0,active:requests.map(r=>r.active)};}

export function classicWildReplacementState(run){
 const combat=run.combat;if(!combat?.snapshot)return {slots:[],reservedBoxIds:[]};
 const b=restore(combat,run),party=new Map(run.party.map(mon=>[String(mon.boxId),mon]));
 const slots=[],reservedBoxIds=[];for(const [slot,p] of b.p1.active.entries()){
  const id=p?token(p):null,owned=id?party.get(id):null;
  if(p&&owned?.hp>0&&!p.m.released)reservedBoxIds.push(id);
  else slots.push({slot,name:owned?.name||p?.name?.replace(/#\d+$/,'')||'빈 자리'});
 }
 // A doubles field can have more empty slots than living bench members.
 // Only ask for choices that exist; the remaining slots stay empty.
 const bench=run.party.filter(mon=>mon.hp>0&&!reservedBoxIds.includes(String(mon.boxId))).length;
 return {slots:slots.slice(0,bench),reservedBoxIds};
}
export function continueClassicWild(run,foes,{system=null,replacements={}}={}){
 const previous=run.combat;if(!previous||previous.trainer)throw Error('야생 연속 전투 경계를 확인하세요.');
 const combat={...previous,wave:run.wave,teams:[structuredClone(run.party),structuredClone(foes)],modifiers:structuredClone(run.modifiers||[])};
 // Bind against new descriptors before entry. Archived foes keep their own
 // native volatile references but are excluded from public teams and AI choices.
 const b=restore({...combat,snapshot:previous.snapshot},run,system),start=b.log.length;
 // Evolution can add Shedinja after the prior battle ended; import any new
 // owned member into the persistent simulator before building the next request.
 for(const mon of combat.teams[0])if(!b.p1.pokemon.some(p=>token(p)===String(mon.boxId)))appendOwnedPokemon(b,combat,run,mon);
 // Apply between-wave services before the next opponent enters. A revived
 // party member must be restored in the native snapshot, not just the UI data.
 for(const p of b.p1.pokemon){const mon=sourceMon(combat,p);if(mon){sourceStats(p,mon);const wasFainted=p.fainted||p.hp<=0,hp=Math.max(0,Math.min(p.maxhp,mon.hp)),status=hp?(statuses[mon.status]||mon.status||''):'fnt';
  // A revive between waves makes an active faint marker obsolete. Preserve
  // string-valued pivot moves and forced-switch flags for separate handling.
  if(wasFainted&&hp>0&&p.switchFlag===true)p.switchFlag=false;
  p.hp=hp;p.fainted=hp<=0;p.faintQueued=false;if(p.status!==status){p.status=status;p.statusState=b.initEffectState({id:status,target:p});}
  const nextMoves=mon.moves.map(name=>b.dex.moves.get(moves[name]?.key||name));
  if(nextMoves.some((move,i)=>p.baseMoveSlots[i]?.id!==move.id)||nextMoves.length!==p.baseMoveSlots.length){p.set.moves=nextMoves.map(m=>m.id);p.baseMoveSlots=nextMoves.map((move,i)=>({move:move.name,id:move.id,pp:mon.pp?.[move.id]??classicMaxPP(mon,i),maxpp:classicMaxPP(mon,i),target:move.target,disabled:false,disabledSource:'',used:false}));if(!p.transformed)p.moveSlots=p.baseMoveSlots.map(m=>({...m}));}
  for(const slot of p.baseMoveSlots)if(Number.isInteger(mon.pp?.[slot.id]))slot.pp=Math.min(slot.maxpp,mon.pp[slot.id]);
 }}
 b.p1.pokemonLeft=b.p1.pokemon.filter(p=>sourceMon(combat,p)&&p.hp>0&&!p.fainted&&!p.m.released).length;
 const alreadyTera=b.p1.pokemon.some(p=>p.terastallized);for(const p of b.p1.pokemon){if(!sourceMon(combat,p))continue;const allowed=run.tools?.teraOrb&&run.teraCharged&&!alreadyTera&&!p.species.isMega&&!p.m.rogueMega&&!p.species.isPrimal&&p.species.forme!=='Ultra'&&!p.m.roguePermanentDynamax;p.canTerastallize=allowed?b.actions.canTerastallize(p):null;}
 // Register the current active party before enemy entry: entry hazards can
 // defeat a foe before the next move request exists.
 run.participants=[...new Set([...(run.participants||[]),...b.p1.active.filter(p=>p?.hp).map(token)])];
 continueWild(b,foes.map((mon,i)=>set(mon,b.p2.pokemon.length+i)),{id:run.id+':'+run.wave,biome:String(run.biome),replacements,beforeEntry:p=>{sourceStats(p,sourceMon(combat,p),{initial:true});prepareNativePokemon(p,combat,run);}});
 // Existing active Pokemon do not switch in again at a wild-wave boundary.
 // Mark them before the first action so a first-hit knockout awards EXP.
 run.participants=[...new Set([...(run.participants||[]),...b.p1.active.filter(p=>p?.hp).map(token)])];
 for(const p of b.p1.pokemon)if(p.m.roguePendingAbilityStart&&!b.ended){delete p.m.roguePendingAbilityStart;if(p.isActive&&p.hp>0)b.singleEvent('Start',p.getAbility(),p.abilityState,p);}
 if(!b.ended)bindings.get(b)?.activatePending();
 return output(b,combat,start,run);
}
function appendOwnedPokemon(b,combat,run,mon){
 if(b.p1.pokemon.length>=24)throw Error('현재 전투 구간의 파티 교체가 너무 많습니다. 다음 구간에서 다시 시도하세요.');
 const input=set(mon,b.p1.pokemon.length);b.p1.team.push(input);const p=b.p1.addPokemon(input);if(!p)throw Error('파티에 포켓몬을 추가하지 못했습니다.');sourceStats(p,mon,{initial:true});prepareNativePokemon(p,combat,run);return p;
}
function resolveCaptureItemTurn(b,combat){
 if(b.ended)return;b.makeRequest('move');const cpu=aiInput(b,combat);b.p1.clearChoice();for(const p of b.p1.active)b.p1.choice.actions.push({choice:'pass',pokemon:p});if(!b.choose('p2',cpu))throw Error(b.p2.choice.error||'상대의 행동을 처리하지 못했습니다.');
}
export function captureClassicCombat(run,ballId,{system=null,targetBoxId=null,rng=Math.random}={}){
 if(!classicBall(ballId)||!(run.balls[ballId]>0))throw Error('사용할 볼이 없습니다.');if(run.encounter.trainer)throw Error('트레이너의 포켓몬은 포획할 수 없습니다.');
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(run.party);const before=structuredClone(combat.teams),b=restore(combat,run,system),start=b.log.length,targets=b.p2.active.filter(p=>p?.hp&&!p.m.captured);
 const blockReason=classicCaptureBlockReason(run,system,targets.map(p=>sourceMon(combat,p)));if(blockReason)throw Error(blockReason);
 if(!targets.length)throw Error('포획할 수 있는 야생 포켓몬이 없습니다.');if(targets.length>1&&!targetBoxId)throw Error('볼을 던질 포켓몬을 선택하세요.');const target=targets.find(p=>!targetBoxId||token(p)===targetBoxId);if(!target)throw Error('포획 대상을 확인하세요.');
 const original=sourceMon(combat,target),segments=original.rogueBossSegments||0,bossIndex=target.m.rogueBossIndex??classicBossIndex(target.hp,target.maxhp,segments),masterBypass=ballId==='masterball'&&(run.encounter.kind!=='final'||!run.challenges?.length);if(segments>1&&bossIndex>0&&!masterBypass&&!target.hasAbility('wonderguard'))throw Error('보스의 마지막 HP 구간에서 포획할 수 있습니다.');if(request(b,0,combat.teams).kind!=='move')throw Error('먼저 싸울 포켓몬을 내보내세요.');
 const thrower=b.p1.active.find(p=>p?.hp&&!p.fainted),throwerSlot=thrower?b.p1.active.indexOf(thrower):0;
 const caughtMon=syncNativeTeams(b,combat.teams)[1].find(p=>p.boxId===original.boxId),caughtSpecies=Object.values(system?.dex||{}).filter(d=>d.caught).length,{caught,shakes,critical}=attemptClassicCapture(caughtMon,ballId,{caughtSpecies},rng);run.balls[ballId]--;
 let owned=null,autoAdded=false;
 b.add('message',caught?caughtMon.name+'을(를) 잡았다!':'포켓몬이 볼에서 빠져나왔다!');
 if(caught){
  owned={...caughtMon,boxId:crypto.randomUUID(),originEnemyBoxId:original.boxId,origin:'capture',originBall:ballId,rogueMetBiome:run.biome,rogueBoss:false,rogueBossSegments:0,captured:false};
  run.party=syncNativeTeams(b,combat.teams)[0];capturedStub(b,target);
  if(run.party.length<6){run.party.push(owned);combat.teams[0]=structuredClone(run.party);appendOwnedPokemon(b,combat,run,owned);autoAdded=true;}
  run.expNotices=[...(run.expNotices||[]),...awardClassicExperience(run,[caughtMon],{system})];
  for(const mon of run.party){const p=b.p1.pokemon.find(p=>token(p)===String(mon.boxId));if(p){const hp=p.hp;sourceStats(p,mon);p.hp=Math.min(p.maxhp,mon.hp);if(p.hp>hp)b.add('-heal',p,p.getHealth,'[from] level up');}}
  if(b.p2.pokemonLeft===0){b.win(b.p1);if(b.rogueWild)b.rogueWild.settledEncounterId=b.rogueWild.encounterId;}else if(!autoAdded)combat.captureTurnPending=true;
 }
 if(!combat.captureTurnPending)resolveCaptureItemTurn(b,combat);
 const result=output(b,combat,start,run);result.before=before;result.events.unshift({kind:'capture',side:1,actorSide:0,actorBoxId:thrower?token(thrower):undefined,actorSlot:throwerSlot,boxId:original.boxId,targetBoxId:original.boxId,targetSide:1,activeSlot:b.p2.active.indexOf(target),ballId,shakes,caught,critical,type:'normal',category:'status',hit:false,text:caught?caughtMon.name+' 포획 성공!':'볼에서 빠져나왔다!'});
 return {combat:result,caught:owned,autoAdded,shakes,wasBoss:!!original.rogueBoss||Number(original.rogueBossSegments)>1};
}
export function reconcileClassicCaptureParty(run,nextParty,{system=null}={}){
 const combat=structuredClone(run.combat);combat.teams[0]=structuredClone(nextParty);run.party=nextParty;const b=restore(combat,run,system),start=b.log.length,ids=new Set(nextParty.map(p=>String(p.boxId))),activeReplaced=[];
 for(const p of b.p1.pokemon)if(!ids.has(token(p))&&!p.m.released){const slot=b.p1.active.indexOf(p);if(slot>=0)activeReplaced.push(slot);const alive=p.hp>0;p.m.released=true;p.hp=0;p.fainted=true;p.isActive=false;p.isStarted=false;p.faintQueued=false;p.switchFlag=false;p.forceSwitchFlag=false;if(alive)b.p1.pokemonLeft--;b.queue.cancelAction(p);b.singleEvent('End',p.getAbility(),p.abilityState,p);b.singleEvent('End',p.getItem(),p.itemState,p);p.clearVolatile();p.status='fnt';}
 const added=[];for(const mon of nextParty)if(!b.p1.pokemon.some(p=>token(p)===String(mon.boxId)))added.push(appendOwnedPokemon(b,combat,run,mon));
 for(const slot of activeReplaced){const p=added.shift()||b.p1.pokemon.find(p=>p.hp&&!p.isActive&&!p.m.released);if(!p)continue;if(!b.actions.switchIn(p,slot))throw Error('새 파티원을 내보내지 못했습니다.');if(!b.ended){const queued=b.queue.list.findIndex(a=>a.choice==='runSwitch'&&a.pokemon===p);if(queued>=0)b.queue.list.splice(queued,1);b.actions.runSwitch(p);}else{b.roguePlayerStarts||=[];b.roguePlayerStarts.push(token(p));}}
 if(combat.captureTurnPending){delete combat.captureTurnPending;resolveCaptureItemTurn(b,combat);}else if(!b.ended)b.makeRequest(b.p1.active.some(p=>p&&!p.hp)?'switch':'move');
 return output(b,combat,start,run);
}
export {restore as restoreClassicNativeBattle,snapshot as snapshotClassicNativeBattle};

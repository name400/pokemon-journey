// Classic held berries are separate from the simulator's single native item.
// The pinned source processes all eligible berries together after weather.
const SPECS={
 berrysitrus:{native:'sitrusberry',max:2},berrylum:{native:'lumberry',max:2},berryenigma:{native:'enigmaberry',max:2},
 berryliechi:{native:'liechiberry',max:3,stat:'atk'},berryganlon:{native:'ganlonberry',max:3,stat:'def'},berrypetaya:{native:'petayaberry',max:3,stat:'spa'},berryapicot:{native:'apicotberry',max:3,stat:'spd'},berrysalac:{native:'salacberry',max:3,stat:'spe'},
 berrylansat:{native:'lansatberry',max:3},berrystarf:{native:'starfberry',max:3},berryleppa:{native:'leppaberry',max:2},
};
export const classicBerryMax=id=>SPECS[id]?.max||0;
const token=p=>String(p.set.trainerToken);
export function installClassicBerries(b,combat,run){
 const held=(id,p)=>combat.modifiers.find(m=>m.id===id&&String(m.boxId)===token(p)&&m.count>0);
 const sync=(p,id,delta)=>{let m=held(id,p);if(delta>0&&!m)m=combat.modifiers.find(x=>x.id===id&&String(x.boxId)===token(p)&&x.count===0);if(delta<0){if(!m)return;m.count+=delta;}else if(m)m.count+=delta;else{m={id,boxId:token(p),typeBoost:null,count:delta};combat.modifiers.push(m);}if(run&&p.side.n===0){let saved=run.modifiers.find(x=>x.id===id&&String(x.boxId)===token(p)&&x.count>0);if(saved){saved.count+=delta;if(!saved.count)run.modifiers=run.modifiers.filter(x=>x!==saved);}else if(delta>0)run.modifiers.push({id,boxId:token(p),typeBoost:null,count:delta});}};
 b.onEvent('DamagingHit',b.format,{priority:-20},function(damage,target,source,move){if(target?.set&&move?.category!=='Status'&&damage>0&&(target.getMoveHitData(move)?.typeMod||0)>0)target.m.rogueBerrySuperEffectiveTurn=this.turn;});
 // Unburden in source activates on berry consumption even when other items remain.
 b.onEvent('ModifySpe',b.format,{priority:0},function(spe,p){if(p?.item&&p.volatiles?.unburden&&p.hasAbility('unburden'))this.chainModify(2);});
 b.onEvent('SwitchOut',b.format,{priority:-100},function(p){if(p?.m)delete p.m.rogueBerryCud;});
 b.onEvent('Faint',b.format,{priority:-100},function(p){if(p?.m)delete p.m.rogueBerryCud;});
 b.onEvent('Residual',b.format,{order:6},function(p){
  if(!p?.hp||p.fainted)return;
  const prior=Array.isArray(p.m.rogueBerryCud)?p.m.rogueBerryCud:[];delete p.m.rogueBerryCud;
  const blocked=p.side.foe.active.some(foe=>foe?.hp&&foe.hasAbility(['unnerve','asoneglastrier','asonespectrier'])),ratio=p.hp/p.maxhp,threshold=p.hasAbility('gluttony')&&ratio>.25?.5:.25;
  const initial=Object.entries(SPECS).filter(([id,spec])=>{if(blocked||!held(id,p))return false;if(id==='berrysitrus')return ratio<.5;if(id==='berrylum')return !!p.status||!!p.volatiles.confusion;if(id==='berryleppa')return p.moveSlots.some(m=>m.pp===0);if(id==='berryenigma')return p.m.rogueBerrySuperEffectiveTurn===this.turn;if(spec.stat)return ratio<threshold&&p.boosts[spec.stat]<6;if(id==='berrylansat')return ratio<.25&&!p.volatiles.focusenergy;return ratio<.25;}).map(([id])=>id);
  let ate=false;const changes={};
  const effect=id=>{const spec=SPECS[id];if(!spec)return;const item=this.dex.items.get(spec.native);this.add('-enditem',p,item.name,'[eat]');if(id==='berrysitrus'||id==='berryenigma')this.heal(Math.max(1,Math.floor(p.maxhp/4)),p,p,item);else if(id==='berrylum'){if(p.status)p.cureStatus();if(p.volatiles.confusion)p.removeVolatile('confusion');}else if(id==='berryleppa'){let index=p.moveSlots.findIndex(m=>m.pp===0);if(index<0)index=p.moveSlots.findIndex(m=>m.pp>0);if(index>=0){const slot=p.moveSlots[index];slot.pp=Math.min(slot.maxpp,slot.pp+10);if(!p.transformed&&p.baseMoveSlots[index]?.id===slot.id)p.baseMoveSlots[index].pp=slot.pp;this.add('-activate',p,'item: Leppa Berry',slot.move);}}else if(id==='berrylansat')p.addVolatile('focusenergy',p,item);else {const stat=spec.stat||this.sample(['atk','def','spa','spd','spe']),stages=(id==='berrystarf'?2:1)*(p.hasAbility('ripen')?2:1);changes[stat]=(changes[stat]||0)+stages;}};
  const recorded=[];for(const id of initial){const pouch=p.side.n===0?Math.min(3,(run?.modifiers||combat.modifiers).filter(m=>m.id==='berrypouch'&&!m.boxId).reduce((n,m)=>n+m.count,0)):0,preserved=pouch>0&&this.randomChance(pouch*3,10);if(!preserved){sync(p,id,-1);(p.m.rogueBerryHarvest||=[]).push(id);}effect(id);p.ateBerry=true;ate=true;recorded.push(id);if(p.hasAbility('unburden'))p.addVolatile('unburden',p,this.dex.items.get(SPECS[id].native));}
  if(p.hasAbility('cudchew')){for(const id of prior)effect(id);if(recorded.length)p.m.rogueBerryCud=recorded;}
  if(Object.keys(changes).length)this.boost(changes,p,p,this.dex.conditions.get('focusenergy'));
  if(ate&&p.hp&&p.hasAbility('cheekpouch'))this.heal(Math.max(1,Math.floor(p.maxhp/3)),p,p,this.dex.abilities.get('cheekpouch'));
 });
 b.onEvent('Residual',b.format,{order:28,subOrder:1},function(p){if(!p?.hp||!p.hasAbility('harvest')||!Array.isArray(p.m.rogueBerryHarvest))return;const available=p.m.rogueBerryHarvest.map((id,index)=>({id,index})).filter(x=>SPECS[x.id]&&(held(x.id,p)?.count||0)<SPECS[x.id].max);if(!available.length)return;const sun=['sunnyday','desolateland'].includes(p.effectiveWeather());if(!sun&&!this.randomChance(1,2))return;const choice=available.length===1?available[0]:this.sample(available);p.m.rogueBerryHarvest.splice(choice.index,1);sync(p,choice.id,1);this.add('-activate',p,'ability: Harvest');});
}

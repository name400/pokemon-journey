import {Battle} from '@pkmn/sim';
import {createCombat,playCpu} from './party-battle.mjs';

// Keep the saved party order intact while starting with its selected lead.
export function adventureBattleParty(world,mons){
 const ids=Array.isArray(world.teamIds)?world.teamIds:[],ordered=ids.includes(world.activeId)?[world.activeId,...ids.filter(id=>id!==world.activeId)]:ids;
 return ordered.map(id=>mons.get(id)).filter(Boolean);
}

// The shared simulator initializes its entry log before saved HP/status are
// applied. Keep the entry animation consistent with the actual starting team.
export function createAdventureCombat(...args){
 const combat=createCombat(...args);
 const events=(combat.events||[]).map(event=>{
  if(event.kind!=='switch'||![0,1].includes(event.side))return event;
  const team=combat.teams[event.side]||[],mon=(event.boxId?team.find(p=>p.boxId===event.boxId):undefined)??team[event.teamIndex];
  if(!mon)return event;
  const state={hp:mon.hp,maxHp:mon.maxHp,status:mon.status??null};
  return {...event,...state,...(event.pokemon?{pokemon:{...event.pokemon,...state}}:{})};
 });
 return {...combat,events};
}

// Ordinary free-roaming wild Pokémon do not initiate Terastallization.
// Existing in-progress battles are left untouched when loaded from a save.
export function createAdventureWildCombat(...args){
 const combat=createAdventureCombat(...args);
 for(const pokemon of combat.snapshot.sides[1].pokemon)pokemon.canTerastallize=null;
 return combat;
}

// Use the simulator's revival state transitions without changing the shared
// battle engine. The existing item-pass action lets the opponent take its turn.
export function reviveAdventureBench(combat,boxId){
 if(combat.ended||combat.requests?.[0]?.kind!=='move')throw Error('행동을 선택할 수 있을 때 기력의조각을 사용하세요.');
 const team=combat.teams?.[0]||[],index=team.findIndex(mon=>mon.boxId===boxId),target=team[index];
 if(!target||index===combat.requests[0].active||target.hp>0)throw Error('기절한 대기 포켓몬을 선택하세요.');
 const battle=Battle.fromJSON(combat.snapshot),pokemon=battle.p1.pokemon.find(mon=>String(mon.set.trainerToken)===String(boxId));
 if(!pokemon||pokemon.hp>0||!pokemon.fainted||pokemon.isActive)throw Error('기절한 대기 포켓몬을 선택하세요.');
 battle.p1.pokemonLeft++;pokemon.fainted=false;pokemon.faintQueued=false;pokemon.subFainted=false;pokemon.status='';pokemon.hp=1;pokemon.sethp(pokemon.maxhp/2);
 const next=playCpu({...combat,snapshot:battle.toJSON()},{type:'item',item:'ball'});
 const active=team[combat.requests[0].active],generic=`${(active?.baseName||active?.name||'').slice(0,11)}에게 도구를 사용했다.`;
 next.log=[`${target.name}에게 기력의조각을 사용했다!`,...next.log.filter(line=>line!==generic)];
 return next;
}

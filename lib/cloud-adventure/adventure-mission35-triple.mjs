import {makeMon} from '../game.mjs';
import {createMission37TripleSnapshot,restoreMission37TripleSnapshot,mission37TripleView,playMission37TriplePrototype} from './adventure-mission37-triple.mjs';

// The simulator requires a Pokémon object in every active slot. These fainted
// sentinels never act, own items, enter the player's box, or appear in the DTO.
export function createMission35TripleSnapshot(player,foes,{allowReserves=false}={}){
 const dummy=()=>({...makeMon(25,1),boxId:`mission35-empty-${crypto.randomUUID()}`,moves:['튀어오르기'],pp:{},item:'',ability:'static'});
 const initial=createMission37TripleSnapshot(player,[dummy()],[dummy()],foes,{maxFoes:allowReserves?5:3}),battle=restoreMission37TripleSnapshot(initial);
 for(let slot=1;slot<3;slot++){const p=battle.p1.active[slot];p.hp=0;p.fainted=true;p.faintQueued=false;p.status='fnt';p.switchFlag=false;battle.p1.pokemonLeft--;}
 battle.makeRequest('move');const snapshot=battle.toJSON();snapshot.formatid=initial.snapshot.formatid;
 const teams=initial.teams.map((team,side)=>side?team:team.map(mon=>initial.owners.first.includes(mon.boxId)||initial.owners.second.includes(mon.boxId)?{...mon,hp:0}:mon));
 return {...initial,snapshot,teams,adventureSoloTripleFoeV1:true};
}

// Translate native simulator indices after removing sentinels. Foe indices and
// actual simulator switch slots are intentionally kept intact.
export function mission35TripleView(combat){
 if(combat?.adventureSoloTripleFoeV1!==true)throw Error('미션 35 배틀을 확인하세요.');
 const view=mission37TripleView(combat),owned=new Set(combat.owners.player);
 function project(team){const index=new Map(),filtered=[];team.forEach((p,i)=>{if(owned.has(p.boxId)){index.set(i,filtered.length);filtered.push(p);}});return {team:filtered,index};}
 const current=project(view.teams[0]),previous=project(view.before?.[0]||view.teams[0]);
 const idx=(map,n)=>map.get(n)??-1;
 const actors=view.requests[0].actors.map(actor=>({...actor,active:idx(current.index,actor.active),switches:(actor.switches||[]).map(x=>({...x,index:idx(current.index,x.index)})).filter(x=>x.index>=0),moves:(actor.moves||[]).map(m=>({...m,targets:(m.targets||[]).filter(t=>t.side!==0||current.index.has(t.index)).map(t=>t.side===0?{...t,index:idx(current.index,t.index)}:t)}))}));
 const request={...view.requests[0],...actors[0],actors};
 return {...view,teams:[current.team,view.teams[1]],before:view.before?[previous.team,view.before[1]]:undefined,active:[idx(current.index,view.active[0]),view.active[1]],activeBySide:[view.activeBySide[0].map(n=>idx(current.index,n)),view.activeBySide[1]],beforeActive:view.beforeActive?[idx(previous.index,view.beforeActive[0]),view.beforeActive[1]]:undefined,beforeActiveBySide:view.beforeActiveBySide?[view.beforeActiveBySide[0].map(n=>idx(previous.index,n)),view.beforeActiveBySide[1]]:undefined,requests:[request],events:(view.events||[]).filter(e=>!e.boxId||owned.has(e.boxId)||e.side!==0).map(e=>e.side===0&&Number.isInteger(e.teamIndex)?{...e,teamIndex:idx(previous.index,e.teamIndex)}:e)};
}
export function playMission35TripleTurn(combat,command){if(combat?.adventureSoloTripleFoeV1!==true)throw Error('미션 35 배틀을 확인하세요.');return playMission37TriplePrototype(combat,command);}

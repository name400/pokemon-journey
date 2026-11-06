import {wildEventReviewFixture} from './wild-event-alias.mjs';
import {applyClassicAction} from '../../lib/rogue-classic-game.mjs';
export function eventDoubleUnequalAliasFixture(type,{boxId='one',separated=false}={}){
 const doc=wildEventReviewFixture(type,{reserveId:boxId,activeSlot:0,sturdyTarget:true,separatedAlias:separated,...(type==='fiery-fallout'?{fireAbilities:{0:'wellbakedbody',1:'wellbakedbody'}}:{})}),run=doc.classic.slots[0];
 const turn=main=>({type:'turn',actions:[main,(()=>{const actor=run.combat.requests[0].actors[1],move=actor.moves.find(m=>m.id==='tackle');return {actor:1,type:'move',move:'tackle',...(move.targets.length?{target:move.targets[0].target}:{})};})()]});
 const first=run.combat.requests[0].actors[0].moves.find(m=>m.id==='tackle');applyClassicAction(doc,{action:'turn',command:turn({actor:0,type:'move',move:'tackle',...(first.targets.length?{target:first.targets[0].target}:{})})});
 for(const id of ['lead',boxId]){const choice=run.combat.requests[0].actors[0].switches.find(s=>run.party[s.index].boxId===id);if(!choice)throw Error('event double switch unavailable');applyClassicAction(doc,{action:'turn',command:turn({actor:0,type:'switch',slot:choice.slot})});}return doc;
}

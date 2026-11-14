import {friendshipGain} from './capture.mjs';
import experience from '../data/experience.json' with {type:'json'};
import {configure,levelMoves} from './pokemon-config.mjs';
export function expToNext(mon){if(mon.level>=100)return 0;const table=experience[mon.growthRate||2]||experience[2];return Math.max(1,(table[mon.level+1]||0)-(table[mon.level]||0));}
export function gainExperience(mon,amount,friendshipFn=friendshipGain){let out={...mon,experience:(mon.experience||0)+Math.max(0,Math.floor(amount))};const learned=[];while(out.level<100&&out.experience>=expToNext(out)){out.experience-=expToNext(out);const oldMax=out.maxHp,oldHp=out.hp;out=configure(out,{level:out.level+1,hp:oldHp});out.hp=Math.min(out.maxHp,oldHp+out.maxHp-oldMax);out.friendship=friendshipFn(out,(out.friendship??70)<100?5:(out.friendship??70)<200?3:2);for(const m of levelMoves(out,out.level))if(!out.moves.includes(m)&&!learned.includes(m))learned.push(m);}if(out.level>=100){out.level=100;out.experience=0;}return {mon:out,learned};}
export function victoryExperience(foes,trainer=false){return foes.reduce((sum,p)=>sum+Math.max(10,Math.floor((p.baseExperience||100)*p.level/7*(trainer?1.5:1))),0);}

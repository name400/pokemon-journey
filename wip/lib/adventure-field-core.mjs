import {TRAINERS} from './adventure-ui-data.mjs';
import {visibleWildTile} from './adventure-visible-wild.mjs';
import {ADVENTURE_GOODS} from './adventure-economy.mjs';
export const DIRECTIONS = Object.freeze({up: [0,-1], down: [0,1], left: [-1,0], right: [1,0]});
export const FIELD_GOODS=ADVENTURE_GOODS;

export function walkable(tile){return !!tile&&!['#','~','^'].includes(tile);}
// People occupy a tile, while building entrances remain walkable. Existing saves
// already on a person tile can still leave and interact with that person.
export function personTile(tile,map){return !!tile&&('NQRYKOTF0459LCd'.includes(tile)||(tile==='B'&&map?.length===11&&map?.[0]?.length===15));}
export function validateAdventurePath(path){
  if(!Array.isArray(path)||!path.length||path.length>8||path.some(d=>typeof d!=='string'||!Object.hasOwn(DIRECTIONS,d)))throw Error('이동 경로는 올바른 방향 1–8개여야 합니다.');
  return path;
}
export function stepField(s,direction,map=s.map){
  if(!Object.hasOwn(DIRECTIONS,direction))return {blocked:true,reason:'방향을 확인하세요.'};
  const [dx,dy]=DIRECTIONS[direction],x=s.x+dx,y=s.y+dy,tile=map?.[y]?.[x];
  if(!walkable(tile))return {blocked:true,reason:tile==='~'?'물가 너머로는 걸어갈 수 없습니다.':'그곳으로 갈 수 없습니다.'};
  if(personTile(tile,map))return {blocked:true,reason:'사람 앞에서 대화하세요.'};
  if(visibleWildTile(tile))return {blocked:true,reason:'야생 포켓몬 앞에서 대화하세요.'};
  if(s.interior==='hotel'&&tile==='D'){const back=s.hotelReturn||{x:3,y:6};return {...back,interior:null,hotelReturn:null,transitioned:true,tile};}
  if(s.interior==='shop'&&tile==='D'){const back=s.shopReturn||{x:18,y:12};return {...back,interior:null,shopReturn:null,transitioned:true,tile};}
  if(['citywild','cityarena'].includes(s.interior)&&tile==='D'){const back=s.cityZoneReturn||(s.interior==='citywild'?{x:20,y:13}:{x:20,y:6});return {...back,interior:null,cityZoneReturn:null,transitioned:true,tile};}
  if(['center','gym'].includes(s.interior)&&tile==='D'){const back=s.fieldInteriorReturn||{x:3,y:8};return {...back,interior:null,fieldInteriorReturn:null,transitioned:true,tile};}
  if(s.cityVisit&&tile==='W'){const back=s.cityReturn||{area:0,x:5,y:9,regionId:1,locationId:0};return {...back,cityVisit:false,cityReturn:null,transitioned:true,tile};}
  if(['E','W'].includes(tile)&&s.expedition)return {x:3,y:8,area:9,expedition:null,regionId:1,locationId:0,nearSpecialRock:false,transitioned:true,tile};
  if(tile==='E'){
    if(s.area>0&&s.area<=8&&!s.badges.includes(TRAINERS[s.area-1].id))return {blocked:true,reason:`${TRAINERS[s.area-1].name}의 배지를 먼저 획득하세요.`};
    return {x:1,y:8,area:Math.min(9,s.area+1),transitioned:true,tile};
  }
  if(tile==='W'){
    if(s.area<=0)return {blocked:true,reason:'이곳이 모험의 시작점입니다.'};
    return {x:21,y:8,area:s.area-1,league:s.area===9&&s.league>0&&s.league<5?0:s.league,transitioned:true,tile};
  }
  return {x,y,area:s.area,tile,transitioned:false};
}
/** Tap-to-walk chooses safe paths, prefers roads, and never crosses an exit en route. */
export function fieldPath(map,start,target){
  if(!walkable(map[target.y]?.[target.x]))return [];
  const key=(p)=>`${p.x},${p.y}`,open=[start],cost=new Map([[key(start),0]]),prev=new Map();
  while(open.length){
    open.sort((a,b)=>cost.get(key(a))-cost.get(key(b)));const p=open.shift();if(key(p)===key(target))break;
    for(const [direction,[dx,dy]]of Object.entries(DIRECTIONS)){
      const n={x:p.x+dx,y:p.y+dy},tile=map[n.y]?.[n.x];
      if(!walkable(tile)||(('EW'.includes(tile)||personTile(tile,map)||visibleWildTile(tile))&&key(n)!==key(target)))continue;
      const c=cost.get(key(p))+(tile==='g'?4:1),k=key(n);
      if(c<(cost.get(k)??Infinity)){cost.set(k,c);prev.set(k,{p,direction});open.push(n);}
    }
  }
  const path=[];let p=target;while(key(p)!==key(start)){const step=prev.get(key(p));if(!step)return [];path.unshift(step.direction);p=step.p;}return path;
}

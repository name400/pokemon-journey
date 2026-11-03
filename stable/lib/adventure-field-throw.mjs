import {GARDEN_VISIBLE,visibleWildTile} from './adventure-visible-wild.mjs';

// The same conservative range and line-of-sight check runs in UI and API.
export function fieldThrowTarget(world,map,target){
 if(world.interior!=='citywild'||!target||!Number.isInteger(target.x)||!Number.isInteger(target.y))return {ok:false,reason:'야생 정원에서 포켓몬을 선택하세요.'};
 const tile=map[target.y]?.[target.x];if(!visibleWildTile(tile))return {ok:false,reason:'보이는 야생 포켓몬을 선택하세요.'};
 const dx=target.x-world.x,dy=target.y-world.y,steps=Math.max(Math.abs(dx),Math.abs(dy));
 if(steps<1||steps>3)return {ok:false,reason:'포켓몬에게 조금 더 가까이 가세요.'};
 for(let i=1;i<steps;i++){const x=Math.round(world.x+dx*i/steps),y=Math.round(world.y+dy*i/steps),cell=map[y]?.[x];if(!cell||['#','~','^'].includes(cell)||visibleWildTile(cell))return {ok:false,reason:'사이에 장애물이 있어 볼을 던질 수 없습니다.'};}
 return {ok:true,tile};
}

// A visible alpha notices an unsneaking player at close range. The caller
// decides whether to warn or start an encounter on a later movement.
export function alphaNoticesPlayer(world,map){
 const alpha=GARDEN_VISIBLE.e;if(world.interior!=='citywild'||world.pcSneaking||map[alpha.y]?.[alpha.x]!=='e')return false;
 const distance=Math.max(Math.abs(alpha.x-world.x),Math.abs(alpha.y-world.y));
 return distance>0&&distance<=2&&fieldThrowTarget(world,map,{x:alpha.x,y:alpha.y}).ok;
}

export function waryWildNoticesPlayer(world,map){
 if(world.interior!=='citywild'||world.pcSneaking)return null;
 for(const [tile,pokemon] of Object.entries(GARDEN_VISIBLE)){
  if(!pokemon.wary||map[pokemon.y]?.[pokemon.x]!==tile)continue;
  const distance=Math.max(Math.abs(pokemon.x-world.x),Math.abs(pokemon.y-world.y));
  if(distance>0&&distance<=2&&fieldThrowTarget(world,map,{x:pokemon.x,y:pokemon.y}).ok)return tile;
 }
 return null;
}

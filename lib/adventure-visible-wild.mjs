// Local, fixed sightings are distinct from random grass encounters.
export const GARDEN_VISIBLE={
 a:{id:10,name:'캐터피',level:18,x:5,y:5,wary:true},
 b:{id:43,name:'뚜벅쵸',level:20,x:17,y:11,wary:true},
 e:{id:123,name:'우두머리 스라크',level:35,x:16,y:3,alpha:true},
};
export function visibleWildTile(tile){return typeof tile==='string'&&Object.hasOwn(GARDEN_VISIBLE,tile);}
export function gardenWildResolved(world,tile,now=Date.now()){return (Array.isArray(world.pcGardenWild)&&world.pcGardenWild.includes(tile))||Number(world.pcGardenSpooked?.[tile]||0)>now;}
export function activeGardenSpooks(world,now=Date.now()){
 const raw=world.pcGardenSpooked;if(!raw||typeof raw!=='object'||Array.isArray(raw))return {};
 return Object.fromEntries(Object.entries(raw).filter(([,until])=>Number.isFinite(until)&&until>now));
}

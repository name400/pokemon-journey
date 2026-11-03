const vectors={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
export const directions=Object.freeze(Object.keys(vectors));
/** Pure shared collision/transition rule. The server separately checks badges and encounters. */
export function worldStep(world,direction,map,canEast=true){
 if(!Object.hasOwn(vectors,direction))return {blocked:true,reason:'방향을 확인하세요.'};
 const [dx,dy]=vectors[direction],x=world.x+dx,y=world.y+dy,tile=map[y]?.[x];
 if(!tile||['#','~','^'].includes(tile))return {blocked:true,reason:'그곳으로 갈 수 없습니다.'};
 if(['E','W'].includes(tile)&&world.expedition)return {x:3,y:5,area:9,tile,transitioned:true,expedition:null};
 if(tile==='E')return canEast?{x:1,y:5,area:Math.min(9,world.area+1),tile,transitioned:true}:{blocked:true,reason:'체육관 배지를 먼저 획득하세요.'};
 if(tile==='W')return world.area>0?{x:13,y:5,area:world.area-1,tile,transitioned:true}:{blocked:true,reason:'이곳이 모험의 시작점입니다.'};
 return {x,y,area:world.area,tile,transitioned:false};
}
export function validatePath(path){if(!Array.isArray(path)||!path.length||path.length>8||path.some(d=>!directions.includes(d)))throw Error('이동 경로는 올바른 방향 1–8개여야 합니다.');return path;}

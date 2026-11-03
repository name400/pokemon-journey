const themes=['바위 석판','물길 밸브','전기 스위치','꽃 장치','독 해제 장치','초능력 장치','화산 밸브','대지 석판'];
const sequences=[['U','V'],['V','U','V'],['U','U','V'],['V','U','U','V'],['U','V','V','U'],['V','V','U','V'],['U','V','U','U','V'],['V','U','V','V','U']];
export function gymPuzzle(world){
 const area=Math.max(1,Math.min(8,Number(world.area)||1)),order=sequences[area-1];
 const solved=Array.isArray(world.pcGymSwitches)?world.pcGymSwitches:[];
 const completed=['U','V'].filter(key=>solved.includes(`${area}:${key}`));
 const saved=world.pcGymProgress?.[area];
 // Old saves recorded only which switches were used; preserve completed and partial puzzles.
 const legacy=completed.length===2?order.length:completed.includes(order[0])?1:0;
 const stage=Number.isInteger(saved)?Math.max(0,Math.min(order.length,saved)):legacy;
 const next=order[stage]||null;
 return {theme:themes[area-1],order,completed,stage,next,ready:!next,first:order[0]==='U'?'왼쪽':'오른쪽'};
}

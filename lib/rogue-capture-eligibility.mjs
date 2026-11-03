import {rogueSpecies,sourceSpeciesFor} from './rogue-reference.mjs';

// End-biome gating follows the pinned Classic rules. Only currently active,
// living enemies count; a missing dex record is treated as uncaught.
export function classicCaptureBlockReason(run,system,activeEnemies=[]){
 if(run.encounter?.trainer)return '트레이너의 포켓몬은 포획할 수 없습니다.';
 if(run.encounter?.kind==='final'){
  const caught=[...rogueSpecies.values()].filter(s=>s.isStarter&&system?.dex?.[s.sourceId]?.caught).length;
  return caught<571?'최종 보스의 포획에는 스타터 571종 이상의 포획·부화 기록이 필요합니다.':null;
 }
 if(Number(run.biome)===50&&activeEnemies.some(mon=>{const species=mon&&sourceSpeciesFor(mon);return !species||!system?.dex?.[species.sourceId]?.caught;}))return '엔드 바이옴에서는 아직 도감에 등록하지 않은 야생 포켓몬을 포획할 수 없습니다.';
 return null;
}

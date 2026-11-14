import {sewerOverview} from '@/lib/cloud-adventure/adventure-sewer-map.mjs';

export default function AdventureSewerMap({world}:{world:any}){
 const map=sewerOverview(world);if(!map)return null;
 const colors:Record<string,string>={wall:'#253a3e',water:'#47788a',exit:'#d6b65e',floor:'#dce5d6',feature:'#85a394'};
 return <section className="adv-sewer-overview" aria-label="하수도 현재 구역 지도">
  <h3>{map.layer}</h3>
  <p>현재 있는 구역의 통로와 출구입니다. 다른 분기는 직접 이동해 확인하세요.</p>
  <svg role="img" aria-label={`${map.layer} 지도. 현재 위치 ${map.x+1}열 ${map.y+1}행`} viewBox={`0 0 ${map.width} ${map.height}`}>
   {map.cells.map((cell:any)=><rect key={`${cell.x},${cell.y}`} x={cell.x} y={cell.y} width="1" height="1" fill={colors[cell.kind]}/>)}
   <circle cx={map.x+.5} cy={map.y+.5} r=".44" fill="#d53832" stroke="#fff" strokeWidth=".12"/>
  </svg>
  <p className="adv-sewer-legend">빨강: 내 위치 · 밝은색: 통로 · 파랑: 물 · 노랑: 출구 · 녹색: 현장 요소</p>
 </section>;
}

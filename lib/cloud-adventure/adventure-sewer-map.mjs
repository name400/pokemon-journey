// This overview uses the already-authoritative map supplied with the current
// world response. It does not create routes, reveal other layers or save data.
export function sewerOverview(s){
 if(s?.district!=='lumiose-sewer'||s.interior||!Array.isArray(s.map)||!s.map.length||!s.map.every(row=>typeof row==='string'&&row.length===s.map[0].length))return null;
 const width=s.map[0].length,height=s.map.length;
 if(!width||!Number.isInteger(s.x)||!Number.isInteger(s.y)||s.x<0||s.x>=width||s.y<0||s.y>=height)return null;
 const layer=s.zaSewerIceBranch===true?'서쪽 얼음 분기':s.zaMission19Inner===true?'문 안쪽 통로':'하수도 본 통로';
 const cells=s.map.flatMap((row,y)=>Array.from(row,(tile,x)=>({x,y,kind:tile==='#'?'wall':tile==='~'?'water':tile==='X'?'exit':['.',',','g',':'].includes(tile)?'floor':'feature'})));
 return {width,height,layer,cells,x:s.x,y:s.y};
}

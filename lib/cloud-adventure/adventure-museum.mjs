// Lumiose Museum is on North Boulevard. Its 1F, 2F Hisui exhibition and
// closed third floor are documented; map footprints and exhibit tiles are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Lumiose_Museum
// Coordinates are adaptations to the draft 2D floor plan, not original coordinates.
export const MUSEUM_SPEWPA_SPOTS={museum1:[[4,12],[18,12]],museum2:[[3,4],[9,3],[13,3],[19,4],[3,8],[19,8],[3,11],[19,11],[7,15],[15,15]]};
export function museumSide21Available(s){return s?.zaLidaStage>=2||s?.zaMission08Complete===true||['V','F','E','D','C','B','A'].includes(s?.zaRoyaleRank);}
export function museumSide21Requester(s,p){return s?.district==='lumiose-museum-front'&&s.interior==='museum1'&&p?.tile==='t'&&p.x===3&&p.y===14;}
export function museumSide21Spot(s,p){if(s?.district!=='lumiose-museum-front'||p?.tile!=='t')return null;const floor=MUSEUM_SPEWPA_SPOTS[s.interior];if(!floor)return null;const index=floor.findIndex(([x,y])=>x===p.x&&y===p.y);return index<0?null:`${s.interior}-${index}`;}
export function museumFrontMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=6;y++)for(let x=3;x<=19;x++)g[y][x]='#';
 for(let y=7;y<=15;y++)for(let x=6;x<=16;x++)g[y][x]=',';
 g[6][11]='u';g[16][11]='X';return g.map(row=>row.join(''));
}
export function museumFloorMap(floor){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=7;y<=12;y++)for(let x=7;x<=15;x++)g[y][x]=';';
 for(const [x,y] of [[7,8],[15,8],[7,11],[15,11]])g[y][x]='^';
 g[4][5]='t';g[4][17]='t';g[5][18]='l';for(const [x,y] of MUSEUM_SPEWPA_SPOTS[`museum${floor}`]||[])g[y][x]='t';if(floor===1){g[16][11]='X';g[14][3]='t';}
 return g.map(row=>row.join(''));
}

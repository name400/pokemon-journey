// Source describes Budew-shaped western and Roselia-shaped eastern ground
// motifs. These stylised 2D shapes and their tile positions are provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_3
export function zone3GardenPattern(x,y){
 if(!Number.isFinite(x)||!Number.isFinite(y))return null;
 const west=x<11,cx=west?8.5:14.5,cy=y<8?6.5:10.5,dx=x-cx,dy=y-cy;
 if(Math.abs(dx)>1.25||Math.abs(dy)>1.25)return null;
 const ellipse=(xx,yy,rx,ry)=>((dx-xx)/rx)**2+((dy-yy)/ry)**2<=1;
 if(west){
  if(ellipse(0,-.34,.43,.46))return 'bud';
  if(ellipse(-.37,.32,.42,.18)||ellipse(.37,.32,.42,.18)||ellipse(0,.38,.13,.53))return 'leaf';
 }else{
  if(ellipse(-.45,-.30,.25,.25))return 'rose-red';
  if(ellipse(.45,-.30,.25,.25))return 'rose-blue';
  if(ellipse(0,.12,.22,.47)||ellipse(-.29,.40,.34,.15)||ellipse(.29,.40,.34,.15))return 'leaf';
 }
 return null;
}

// Plaza screen edges include city connections in addition to garden entrances.
export function zone3ExitLabel(x,y){return x===0?'서쪽':x===22?'동쪽':y===0?'북쪽':y===16?'남쪽':'출구';}

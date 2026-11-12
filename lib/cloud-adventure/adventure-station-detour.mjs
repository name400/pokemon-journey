// The Mission 3 shortcut uses an alley, ladder and one-way rooftop drop.
// Exact positions, shapes and widths are provisional 2D adaptations.
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_New_Life_in_Lumiose_City
export function stationDetourMap(roof=false){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(roof){for(let y=2;y<=14;y++)for(let x=2;x<=20;x++)g[y][x]=',';for(let y=2;y<=14;y++)g[y][11]='#';g[8][11]=',';g[9][11]=',';g[10][4]='l';g[7][19]='v';}
 else{for(let y=2;y<=11;y++)for(let x=3;x<=7;x++)g[y][x]='#';for(let y=2;y<=11;y++)for(let x=15;x<=19;x++)g[y][x]='#';g[11][5]='l';g[8][22]='X';}
 return g.map(row=>row.join(''));
}

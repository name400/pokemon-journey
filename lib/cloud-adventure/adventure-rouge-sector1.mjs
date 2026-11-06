// Rouge Sector 1 is west of Wild Zone 3. Exact buildings and tiles are draft.
// https://www.serebii.net/legendsz-a/sidemissions/abreaktimebattle.shtml
export function side04Available(s){return s?.zaEmmaMegaSeen===true||['X','W','V','F','E','D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission10Stage)>=1;}
export function rougeSector1Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=10;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 // Battle court and bank approach are schematic; trainers are in Rouge Sector 1.
 // https://www.serebii.net/pokearth/lumiosecity/rougedistrict.shtml
 for(let y=3;y<=6;y++)for(let x=13;x<=17;x++)g[y][x]=';';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[5][9]='j';if(s.zaMission20Stage===11)g[4][15]='o';if(s.zaMission20Stage===12)g[10][14]='d';g[16][11]='X';g[8][22]='E';return g.map(row=>row.join(''));
}
// Accessible roof beyond Sommi's repaired Holovator; dimensions are draft.
// TM005 is on the western side of the northern roof; exact tile is draft.
// https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/moves.html
export function rougeSector1RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
 for(let y=5;y<=8;y++)for(let x=10;x<=15;x++)g[y][x]='g';
 g[13][3]='j';if(!s.zaRouge1Tm005)g[4][5]='t';return g.map(row=>row.join(''));
}

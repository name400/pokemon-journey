// Rouge Sector 1 is west of Wild Zone 3. Exact buildings and tiles are draft.
// https://www.serebii.net/legendsz-a/sidemissions/abreaktimebattle.shtml
export function side04Available(s){return s?.zaEmmaMegaSeen===true||['X','W','V','F','E','D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission10Stage)>=1;}
export function rougeSector1Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[5][9]='j';g[8][22]='E';return g.map(row=>row.join(''));
}
// Accessible roof beyond Sommi's repaired Holovator; dimensions are draft.
export function rougeSector1RoofMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
 for(let y=5;y<=8;y++)for(let x=10;x<=15;x++)g[y][x]='g';
 g[13][3]='j';return g.map(row=>row.join(''));
}

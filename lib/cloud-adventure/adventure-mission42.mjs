// Zone 20 and its dimensions are provisional.
export function zone20Map(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=3;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]='g';g[6][11]='n';g[15][11]='X';return g.map(r=>r.join(''));}

// Shared-size, independent field interiors. D is an exit, T is nurse, F is leader.
function room(kind){
 const grid=Array.from({length:11},(_,y)=>Array.from({length:15},(_,x)=>x===0||x===14||y===0||y===10?'#':'c'));
 if(kind==='center'){for(let x=3;x<=11;x++)if(x!==7)grid[3][x]='#';grid[3][7]='T';}
 else {for(let x=2;x<=12;x++)if(x!==7)grid[2][x]='#';grid[3][7]='F';grid[6][4]='N';grid[6][10]='N';grid[7][2]='U';grid[7][12]='V';grid[8][7]='S';}
 grid[10][7]='D';return grid.map(row=>row.join(''));
}
export const centerMap=()=>room('center');
export const gymMap=()=>room('gym');

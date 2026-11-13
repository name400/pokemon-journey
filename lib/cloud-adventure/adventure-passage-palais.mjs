// Passage du Palais sits by Rouge Street and North Boulevard. The corridor,
// shopfront positions and dimensions are a playable approximation.
export const PALAIS_SHOPS={a:'Pinceau',b:'Naptime',c:'Énergie',d:'Porte-Chance',e:'Le Passe-temps',f:'The Usual',g:'Marquage',h:'Soil and Sneaks'};
export function passagePalaisMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=8;x<=14;x++)g[y][x]=',';
 for(let y=3;y<=13;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=3;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 for(const [y,a,b] of [[4,'a','b'],[7,'c','d'],[10,'e','f'],[13,'g','h']]){g[y][6]=a;g[y][16]=b;}
 g[8][6]='v'; // Tracie's exact arcade position is a 2D approximation.
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// Keep the original Zone 3 endpoint for existing saves and pending rewards.
export function tracieAt(s,spot){return !s?.interior&&spot?.tile==='v'&&(s.district==='lumiose-zone3'||(s.district==='lumiose-passage-palais'&&spot.x===6&&spot.y===8));}

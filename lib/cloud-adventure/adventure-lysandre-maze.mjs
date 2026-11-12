// Three powered B1F areas and A/B/C keycard gates are source-confirmed;
// room dimensions, coordinates, generators and transporter placement are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_24
export const LYSANDRE_WINGS=['a','b','e'];
export function lysandrePower(s,wing){return Array.isArray(s.zaLysandrePowers)&&s.zaLysandrePowers.includes(wing);}
export function lysandreMazeMap(s){
 const wing=s.zaLysandreWing||'hub',g=Array.from({length:17},()=>Array(23).fill('#'));
 if(wing==='hub'){
  for(let y=3;y<=15;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  g[4][4]='n';g[4][11]='p';g[4][18]='q';g[13][18]='l';g[15][11]='X';return g.map(row=>row.join(''));
 }
 if(!LYSANDRE_WINGS.includes(wing))return lysandreMazeMap({...s,zaLysandreWing:'hub'});
 for(let y=3;y<=13;y++){for(let x=2;x<=9;x++)g[y][x]='.';for(let x=13;x<=20;x++)g[y][x]='.';}
 g[5][5]='t';g[8][8]='u';g[8][14]='u';g[12][4]='h';g[5][17]=wing;
 if(wing==='e'){g[9][17]='g';g[11][18]='k';}
 return g.map(row=>row.join(''));
}

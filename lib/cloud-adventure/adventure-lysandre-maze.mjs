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
 if(wing==='e'){g[9][17]='g';g[11][18]='k';for(const p of LYSANDRE_WILD)if(!s.zaLysandreWildSpent?.[p.id])g[p.y][p.x]=p.tile;}
 return g.map(row=>row.join(''));
}

// Beldum and Metang appear in the purple laboratory; tile coordinates are draft.
// https://www.serebii.net/pokearth/lumiosecity/lysandrelabs.shtml
export const LYSANDRE_WILD=[{id:'beldum',tile:'v',x:3,y:5,species:374,level:49,name:'메탕'},{id:'metang',tile:'w',x:3,y:7,species:375,level:50,name:'메탕구'},{id:'arbok-alpha',tile:'x',x:16,y:6,species:24,level:60,name:'아보크',alpha:true}];
export function lysandreWild(s,spot){if(s?.district!=='lumiose-lysandre-lab'||s.interior||s.zaLysandreFloor===3||!(Number(s.zaMission35Stage)>=4)||(s.zaLysandreMazeV2===true&&s.zaLysandreWing!=='e'))return null;return LYSANDRE_WILD.find(p=>p.tile===spot?.tile&&p.x===spot.x&&p.y===spot.y&&!s.zaLysandreWildSpent?.[p.id])||null;}

// B2F is a dead-end corridor with an Exp. Candy L by its gate.
// The room shape, gate and exact coordinates are provisional.
// https://www.serebii.net/pokearth/lumiosecity/lysandrelabs.shtml
export function lysandreBasement2Map(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=6;y<=9;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=9;y<=13;y++)g[y][18]='.';
 for(let y=6;y<=8;y++)g[y][2]='|';
 g[13][18]='l';if(!s.zaLysandreB2Candy)g[7][5]='o';return g.map(row=>row.join(''));
}

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
 if(wing==='b-mid'&&s.zaLysandreGreenRouteV4){
  // The source describes two successive green-area warp pads. This room's
  // footprint and exact pad positions are 2D approximations.
  for(let y=4;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  g[8][3]='u';g[8][19]='u';return g.map(row=>row.join(''));
 }
 if(wing==='e-boss'&&s.zaLysandreBossRoomV5){
  // The card-C door leads to a separate boss room; dimensions are provisional.
  for(let y=3;y<=12;y++)for(let x=6;x<=16;x++)g[y][x]='.';
  g[13][11]='h';g[6][11]=s.zaLysandreAegislashWon?'j':'g';return g.map(row=>row.join(''));
 }
 if(wing==='e-vault'&&s.zaLysandreKeyRoomV3&&s.zaLysandreAegislashWon){
  // The key room is behind the boss; shape and object coordinates are drafts.
  for(let y=3;y<=12;y++)for(let x=6;x<=16;x++)g[y][x]='.';
  g[13][11]='j';if(!s.zaLysandreElevatorKey)g[5][11]='k';if(s.zaLysandreElevatorKey){g[8][8]='z';g[8][14]='n';}return g.map(row=>row.join(''));
 }
 if(!LYSANDRE_WINGS.includes(wing))return lysandreMazeMap({...s,zaLysandreWing:'hub'});
 for(let y=3;y<=13;y++){for(let x=2;x<=9;x++)g[y][x]='.';for(let x=13;x<=20;x++)g[y][x]='.';}
 g[5][5]='t';g[8][8]='u';g[8][14]='u';g[12][4]='h';g[5][17]=wing;
 if(wing==='e'){g[9][17]=s.zaLysandreBossRoomV5?'f':s.zaLysandreKeyRoomV3&&s.zaLysandreAegislashWon?'j':'g';if(!s.zaLysandreKeyRoomV3){g[11][18]='k';if(s.zaLysandreAegislashWon&&s.zaLysandreElevatorKey){g[12][20]='z';g[11][20]='n';}}for(const p of LYSANDRE_WILD)if(!s.zaLysandreWildSpent?.[p.id])g[p.y][p.x]=p.tile;}
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

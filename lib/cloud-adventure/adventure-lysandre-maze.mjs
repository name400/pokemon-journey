import {landWildNotOccupied} from './adventure-visible-wild.mjs';
// Three powered B1F areas and A/B/C keycard gates are source-confirmed;
// room dimensions, coordinates, generators and transporter placement are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Legends:_Z-A/Part_24
export const LYSANDRE_WINGS=['a','b','e'];
export function appendLysandreRecord(value,id){
 if(value!=null&&!Array.isArray(value))throw Error('연구소 진행 기록 형식을 확인하세요.');
 const entries=value??[];
 if(entries.includes(id))throw Error('이미 확인한 연구소 기록입니다.');
 return [...entries,id];
}
export function knownLysandreCount(entries,allowed){return new Set((Array.isArray(entries)?entries:[]).filter(id=>allowed.includes(id))).size;}
export function lysandrePower(s,wing){return Array.isArray(s.zaLysandrePowers)&&s.zaLysandrePowers.includes(wing);}
// Source confirms these items and their relative wings; tiles are 2D drafts.
// https://www.serebii.net/pokearth/lumiosecity/lysandrelabs.shtml
// https://www.thonky.com/pokemon-legends-z-a/main-mission-35-reaching-rank-a
export const LYSANDRE_SUPPLIES=Object.freeze([
 {id:'hub-ultra',wing:'hub',x:4,y:12,kind:'ultraball',name:'하이퍼볼'},
 {id:'green-ultra',wing:'b',x:18,y:10,kind:'ultraball',name:'하이퍼볼'},
 {id:'purple-fire',wing:'e',x:19,y:11,kind:'firestone',name:'불꽃의돌'},
 {id:'purple-full',wing:'e',x:18,y:12,kind:'full_restores',name:'회복약'},
 {id:'green-calcium',wing:'b',x:18,y:12,kind:'calcium',name:'리보플라빈'},
 {id:'purple-thunder',wing:'e',x:6,y:4,kind:'thunderstone',name:'천둥의돌'},
 {id:'purple-nugget',wing:'e',x:15,y:11,kind:'nugget',name:'금구슬'},
 {id:'purple-zinc',wing:'e',x:19,y:8,kind:'zinc',name:'키토산'},
 {id:'green-candy',wing:'b-mid',x:16,y:6,kind:'rarecandy',name:'이상한사탕'},
 {id:'purple-sun',wing:'e',x:6,y:12,kind:'sunstone',name:'태양의돌'},
 {id:'purple-revive',wing:'e',x:8,y:3,kind:'maxrevive',name:'기력의덩어리'},
 {id:'vault-potion',wing:'e-vault',x:15,y:3,kind:'max_potions',name:'풀회복약'},
]);
export function lysandreSupply(s,spot){
 if(s?.district!=='lumiose-lysandre-lab'||s.interior||s.zaLysandreMazeV2!==true||[2,3].includes(s.zaLysandreFloor)||!(Number(s.zaMission35Stage)>=4)||spot?.tile!=='o')return null;
 return LYSANDRE_SUPPLIES.find(p=>p.wing===s.zaLysandreWing&&p.x===spot.x&&p.y===spot.y&&!(Array.isArray(s.zaLysandreB1Supplies)&&s.zaLysandreB1Supplies.includes(p.id)))||null;
}
function showLysandreSupplies(s,g){
 for(const p of LYSANDRE_SUPPLIES)if(p.wing===s.zaLysandreWing&&!(Array.isArray(s.zaLysandreB1Supplies)&&s.zaLysandreB1Supplies.includes(p.id)))g[p.y][p.x]='o';
}
export function lysandreMazeMap(s){
 const wing=s.zaLysandreWing||'hub',g=Array.from({length:17},()=>Array(23).fill('#'));
 if(wing==='hub'){
  for(let y=3;y<=15;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  g[4][4]='n';g[4][11]='p';g[4][18]='q';g[13][18]='l';g[15][11]='X';showLysandreSupplies(s,g);return g.map(row=>row.join(''));
 }
 if(wing==='a-side'){
  // Yellow wing's second powered pad leads to a small purple side room.
  // Dimensions and coordinates are approximations of the described route.
  for(let y=4;y<=12;y++)for(let x=7;x<=15;x++)g[y][x]='.';
  g[12][11]='u';if(!s.zaLysandreDawnStone)g[5][11]='o';return g.map(row=>row.join(''));
 }
 if(wing==='b-mid'&&s.zaLysandreGreenRouteV4){
  // The source describes two successive green-area warp pads. This room's
  // footprint and exact pad positions are 2D approximations.
  for(let y=4;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  g[8][3]='u';g[8][19]='u';showLysandreSupplies(s,g);return g.map(row=>row.join(''));
 }
 if(wing==='e-mid'&&s.zaLysandrePurpleRouteV6){
  // The source describes a small room between two purple-area warp pads.
  // The corridor shape and pad positions are provisional 2D geometry.
  for(let y=6;y<=10;y++)for(let x=2;x<=20;x++)g[y][x]='.';
  for(let y=4;y<=12;y++)for(let x=8;x<=14;x++)g[y][x]='.';
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
  g[13][11]='j';if(!s.zaLysandreElevatorKey)g[5][11]='k';g[8][8]='z';if(s.zaLysandreElevatorKey)g[8][14]='n';showLysandreSupplies(s,g);return g.map(row=>row.join(''));
 }
 if(!LYSANDRE_WINGS.includes(wing))return lysandreMazeMap({...s,zaLysandreWing:'hub'});
 for(let y=3;y<=13;y++){for(let x=2;x<=9;x++)g[y][x]='.';for(let x=13;x<=20;x++)g[y][x]='.';}
 // After cards A and B the walkthrough describes a ramp back to the earlier
 // area. These three tiles approximate that return; unlocking after the card
 // prevents this compressed layout from bypassing the powered warp puzzle.
 // https://www.thonky.com/pokemon-legends-z-a/main-mission-35-reaching-rank-a
 if((wing==='a'||wing==='b')&&Array.isArray(s.zaLysandreCards)&&s.zaLysandreCards.includes(wing))for(let x=10;x<=12;x++)g[11][x]=':';
 g[5][5]='t';g[8][8]='u';g[8][14]='u';g[12][4]='h';g[5][17]=wing;if(wing==='a')g[12][8]='v';
 if(wing==='a'&&!s.zaLysandreTm090)g[5][19]='o';
 if(wing==='e'){g[9][17]=s.zaLysandreBossRoomV5?'f':s.zaLysandreKeyRoomV3&&s.zaLysandreAegislashWon?'j':'g';if(!s.zaLysandreKeyRoomV3){g[11][18]='k';if(s.zaLysandreAegislashWon&&s.zaLysandreElevatorKey){g[12][20]='z';g[11][20]='n';}}}
 for(const p of lysandreVisibleWild(s))g[p.y][p.x]=p.tile;
 showLysandreSupplies(s,g);return g.map(row=>row.join(''));
}

// Beldum and Metang appear in the purple laboratory; tile coordinates are draft.
// https://www.serebii.net/pokearth/lumiosecity/lysandrelabs.shtml
export const LYSANDRE_WILD=[
 {id:'beldum',tile:'v',x:3,y:5,species:374,level:49,name:'메탕',wing:'e',legacy:true},
 {id:'metang',tile:'w',x:3,y:7,species:375,level:50,name:'메탕구',wing:'e',legacy:true},
 {id:'arbok-alpha',tile:'x',x:16,y:6,species:24,level:60,name:'아보크',alpha:true,wing:'e',legacy:true},
 // Levels follow the B1F source; wing, fixed slots and exact positions are drafts.
 {id:'houndour',tile:'d',x:3,y:4,species:228,level:47,name:'델빌',wing:'a'},
 {id:'houndoom',tile:'i',x:3,y:6,species:229,level:49,name:'헬가',wing:'a'},
 {id:'electrike',tile:'m',x:3,y:9,species:309,level:47,name:'썬더라이',wing:'a'},
 {id:'manectric',tile:'d',x:3,y:4,species:310,level:49,name:'라이볼트',wing:'b'},
 {id:'noibat',tile:'i',x:3,y:6,species:714,level:47,name:'음뱃',wing:'b'},
 {id:'noivern',tile:'m',x:3,y:9,species:715,level:49,name:'음번',wing:'b'},
 {id:'ekans',tile:'d',x:3,y:9,species:23,level:47,name:'아보',wing:'e'},
 {id:'honedge',tile:'i',x:17,y:3,species:679,level:47,name:'단칼빙',wing:'e'},
 {id:'doublade',tile:'m',x:18,y:4,species:680,level:49,name:'쌍검킬',wing:'e'},
];
export function lysandreVisibleWild(s){
 if(s?.district!=='lumiose-lysandre-lab'||s.interior||[2,3].includes(s.zaLysandreFloor)||!(Number(s.zaMission35Stage)>=4))return [];
 return LYSANDRE_WILD.filter(p=>(s.zaLysandreMazeV2===true?p.wing===s.zaLysandreWing:p.legacy===true)&&!s.zaLysandreWildSpent?.[p.id]&&landWildNotOccupied(s,p)).map(p=>{const level=s.zaWildVisibleAlphaLevels?.[`lab:${p.id}:${p.species}`];return !p.alpha&&Number.isInteger(level)&&level>=1&&level<=100?{...p,alpha:true,level}:p;});
}
export function lysandreWild(s,spot){return lysandreVisibleWild(s).find(p=>p.tile===spot?.tile&&p.x===spot.x&&p.y===spot.y)||null;}

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

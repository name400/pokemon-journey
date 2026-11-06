// Magenta Sector 9: Northern Street and a ground-level grass patch are
// documented. Tile geometry and this draft's exact street connection are not.
export function zone18Unlocked(s){return ['B','A'].includes(s?.zaRoyaleRank)||s?.zaMission30Complete===true;}
export const ZONE18_VISIBLE=[
 {id:'bagon',tile:'a',species:371,level:45,name:'아공이',x:8,y:8},
 {id:'lopunny-alpha',tile:'c',species:428,level:56,name:'이어롭',x:12,y:5,alpha:true},
 {id:'fennekin',tile:'d',species:653,level:22,name:'푸호꼬',x:16,y:7,upper:true},
 {id:'salamence-alpha',tile:'b',species:373,level:62,name:'보만다',x:14,y:8,alpha:true},
];
export function zone18Visible(s,tile){return ZONE18_VISIBLE.find(p=>p.tile===tile&&!!p.upper===(s.zaZone18Upper===true)&&!s.zaZone18Spent?.[p.id])||null;}
export const ZONE18_ITEMS=[{id:'roof-quick',tile:'i',x:16,y:5,name:'퀵볼',kind:'quickball'}];
export function zone18Item(s,tile){return s.zaZone18Upper?ZONE18_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone18Items)&&s.zaZone18Items.includes(p.id)))||null:null;}
export function zone18Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(s.zaZone18Upper){for(let y=1;y<16;y++)for(let x=1;x<22;x++)if(y<4||y>11||x<5||x>18)g[y][x]='#';for(let x=6;x<=17;x++)g[9][x]=',';for(let y=5;y<=9;y++)g[y][12]=',';g[10][6]='l';for(const p of ZONE18_ITEMS)if(zone18Item(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE18_VISIBLE)if(zone18Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(row=>row.join(''));}
 for(let y=6;y<=10;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=6;y<=10;y++)for(let x=4;x<=9;x++)g[y][x]='g';
 for(let y=7;y<=9;y++)for(let x=13;x<=15;x++)g[y][x]='g';
 for(let y=11;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[8][0]='W';g[8][22]='E';g[0][11]='X';g[16][11]='X';g[16][20]='X';g[5][13]='l';for(const p of ZONE18_VISIBLE)if(zone18Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(row=>row.join(''));
}
export function zone18Encounter(s,rng=Math.random){const next=()=>Math.max(0,Math.min(.999999999999,rng()));return {speciesId:371,level:44+Math.floor(next()*2)};}

// Magenta Sector 9 borders Zone 18 and Quasartico. Precise geometry is provisional.
export function magentaSector9Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[0][11]='X';g[8][0]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// Autumnal Avenue connects Centrico, Magenta Sector 9 and Zone 18; layout is provisional.
export function autumnalApproachMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 g[0][11]='X';g[8][0]='X';g[8][22]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

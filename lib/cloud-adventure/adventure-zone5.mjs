// Topology from the Zone 5 guide: west/south access, west clearing, northwest
// ladder and eastern rooftop. Tile dimensions and approaches remain provisional.
export function zone5Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 if(s.zaZone5Upper===true){for(let y=1;y<16;y++)for(let x=1;x<22;x++)g[y][x]='#';for(let y=3;y<=6;y++)for(let x=3;x<=9;x++)g[y][x]='.';for(let x=9;x<=17;x++)g[4][x]='.';for(let y=3;y<=6;y++)for(let x=17;x<=20;x++)g[y][x]='.';g[4][4]='l';g[3][19]='c';if(!s.zaZone5Tm040)g[6][18]='t';for(const p of ZONE5_VISIBLE.filter(p=>p.upper&&!s.zaZone5Spent?.[p.id]))g[p.y][p.x]=p.tile;return g.map(r=>r.join(''));}
 for(let y=5;y<=12;y++)for(let x=2;x<=9;x++)g[y][x]='g';
 for(let y=2;y<=5;y++)for(let x=11;x<=15;x++)g[y][x]='g';
 for(let y=7;y<=11;y++)for(let x=18;x<=21;x++)g[y][x]='~';
 for(let y=3;y<=6;y++)for(let x=17;x<=20;x++)g[y][x]='#';
 g[4][4]='l';g[8][0]='W';g[16][11]='X';g[16][17]='X';for(const p of ZONE5_VISIBLE.filter(p=>!p.upper&&!s.zaZone5Spent?.[p.id]))g[p.y][p.x]=p.tile;
 if(s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('gallade')))g[6][5]='0';
 return g.map(r=>r.join(''));
}
// The listed ground species and level follow the original; probabilities are provisional.
export function zone5Encounter(rng=Math.random){const ids=[16,69,504,543,659,661],v=Math.max(0,Math.min(.999999999999,rng()));return {speciesId:ids[Math.floor(v*ids.length)],level:13};}

// Relative landmarks are documented; exact coordinates and encounters are provisional.
export const ZONE5_VISIBLE=[{id:'abra',tile:'a',x:6,y:3,upper:true,species:63,level:13,name:'캐이시'},{id:'electrike',tile:'e',x:7,y:3,upper:true,species:309,level:17,name:'썬더라이'},{id:'pidgeotto',tile:'d',x:19,y:5,upper:true,species:17,level:19,name:'피죤'},{id:'bellsprout-alpha',tile:'b',x:4,y:10,upper:false,species:69,level:25,name:'모다피',alpha:true},{id:'whirlipede-alpha',tile:'v',x:16,y:13,upper:false,species:544,level:28,name:'휠구',alpha:true}];
export function zone5Visible(s,tile){return ZONE5_VISIBLE.find(p=>p.tile===tile&&p.upper===(s.zaZone5Upper===true)&&!s.zaZone5Spent?.[p.id])||null;}

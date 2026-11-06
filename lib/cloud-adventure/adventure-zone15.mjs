// Narrow North Boulevard / Jaune Sector area with Café Ultimo. Exact geometry,
// outside holovator position and rooftop outlines remain provisional.
export const ZONE15_VISIBLE=[
 {id:'pumpkaboo',tile:'a',species:710,level:42,name:'호바귀',x:11,y:8,upper:false},
 {id:'scolipede',tile:'b',species:545,level:42,name:'펜드라',x:5,y:11,upper:false,period:'day'},
 {id:'shuppet',tile:'b',species:353,level:40,name:'어둠대신',x:5,y:11,upper:false,period:'night'},
 {id:'gourgeist-alpha',tile:'c',species:711,level:52,name:'펌킨인',x:13,y:8,upper:false,alpha:true},
 {id:'beedrill-alpha',tile:'d',species:15,level:52,name:'독침붕',x:6,y:12,upper:false,alpha:true,period:'day'},
 {id:'banette-alpha',tile:'d',species:354,level:52,name:'다크펫',x:6,y:12,upper:false,alpha:true,period:'night'},
 {id:'larvitar',tile:'a',species:246,level:41,name:'애버라스',x:16,y:7,upper:true},
];
export function zone15Visible(s,tile){return ZONE15_VISIBLE.find(p=>p.upper===(s.zaZone15Upper===true)&&p.tile===tile&&(!p.period||p.period===(s.zaZone15Period||'day'))&&!s.zaZone15Spent?.[p.id])||null;}
export const ZONE15_ITEMS=[{id:'cafe-ultra',tile:'i',x:18,y:7,name:'하이퍼볼',kind:'ultraball'},{id:'cafe-hyper',tile:'j',x:15,y:7,name:'고급상처약',kind:'hyper_potions'},{id:'south-timer',tile:'k',x:4,y:14,name:'타이머볼',kind:'timerball'}];
export function zone15Item(s,tile){return s.zaZone15Upper===true?null:ZONE15_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone15Items)&&s.zaZone15Items.includes(p.id)))||null;}
export function zone15Map(s={}){
 const upper=s.zaZone15Upper===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':upper?'#':'.'));
 if(upper){for(let y=4;y<=10;y++){for(let x=3;x<=10;x++)g[y][x]='.';for(let x=12;x<=19;x++)g[y][x]='.';}g[7][11]=s.zaZone15WebOpen?'.':'r';g[7][4]='l';}
 else{for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)if(((x-11)/3)**2+((y-8)/2)**2<=1)g[y][x]='g';for(let y=10;y<=13;y++)for(let x=3;x<=7;x++)g[y][x]='g';for(let y=3;y<=5;y++)for(let x=16;x<=19;x++)g[y][x]='#';g[6][17]='q';g[8][0]='W';g[0][11]='X';g[16][11]='X';g[13][2]='l';if(!s.zaZone15LiftUnlocked)g[13][3]='n';for(const p of ZONE15_ITEMS)if(zone15Item(s,p.tile))g[p.y][p.x]=p.tile;}
 for(const p of ZONE15_VISIBLE)if(zone15Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone15Encounter(period,rng=Math.random){const pool=period==='night'?[[710,42,43],[353,40,41],[93,40,41]]:[[710,42,43],[545,42,43],[544,40,41],[15,41,42]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Hibernal Avenue runs between Centrico and the north city edge. Geometry is provisional.
export function hibernalApproachMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=6;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=16;x<=19;x++)g[y][x]='#';
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

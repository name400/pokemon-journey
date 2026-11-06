// A wooded section along North Boulevard. Exact trees, gates and city
// connector positions are provisional, while west/east path relations are sourced.
export const ZONE13_VISIBLE=[
 {id:'heracross',tile:'a',species:214,level:37,name:'헤라크로스',x:5,y:6},
 {id:'pinsir',tile:'b',species:127,level:37,name:'쁘사이저',x:11,y:11},
 {id:'trevenant-alpha',tile:'d',species:709,level:47,name:'대로트',x:11,y:5,alpha:true,period:'night'},
 {id:'weepinbell-alpha',tile:'e',species:70,level:46,name:'우츠동',x:14,y:11,alpha:true,period:'day'},
];
export function zone13Visible(s,tile){return ZONE13_VISIBLE.find(p=>p.tile===tile&&(!p.period||p.period===(s.zaZone13Period||'day'))&&!s.zaZone13Spent?.[p.id])||null;}
export const ZONE13_ITEMS=[{id:'north-luxury',tile:'i',x:11,y:3,name:'럭셔리볼',kind:'luxuryball'},{id:'west-ultra',tile:'j',x:4,y:11,name:'하이퍼볼',kind:'ultraball'},{id:'center-hyper',tile:'k',x:12,y:12,name:'고급상처약',kind:'hyper_potions'}];
export function zone13Item(s,tile){return ZONE13_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone13Items)&&s.zaZone13Items.includes(p.id)))||null;}
export function zone13Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=6;y++)for(let x=3;x<=19;x++)g[y][x]='g';
 for(let y=10;y<=13;y++)for(let x=3;x<=19;x++)g[y][x]='g';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 g[8][0]='W';g[8][22]='E';for(const p of ZONE13_VISIBLE)if(zone13Visible(s,p.tile))g[p.y][p.x]=p.tile;for(const p of ZONE13_ITEMS)if(zone13Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone13Encounter(period,rng=Math.random){const pool=period==='night'?[[708,36,37],[123,37,39],[214,36,38],[127,36,38]]:[[666,36,37],[70,36,37],[214,36,38],[127,36,38]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

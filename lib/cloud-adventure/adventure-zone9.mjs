// Zone 9 has ground scaffolding and ladders to rooftops. Geometry and the
// temporary city connector are provisional; relative species areas are sourced.
export const ZONE9_VISIBLE=[
 {id:'sableye',tile:'a',species:302,level:28,name:'깜까미',x:11,y:9,upper:false},
 {id:'mawile',tile:'b',species:303,level:28,name:'입치트',x:5,y:11,upper:true},
 {id:'kadabra',tile:'c',species:64,level:29,name:'윤겔라',x:17,y:10,upper:true},
 {id:'carbink',tile:'d',species:703,level:29,name:'멜리시',x:18,y:4,upper:true},
 {id:'espurr',tile:'e',species:677,level:28,name:'냐스퍼',x:11,y:7,upper:true},
 {id:'meowstic-alpha',tile:'f',species:678,level:42,name:'냐오닉스',x:12,y:6,upper:true,alpha:true},
 {id:'manectric-alpha',tile:'v',species:310,level:41,name:'썬더볼트',x:4,y:4,upper:true,alpha:true},
];
export function zone9Visible(s,tile){return ZONE9_VISIBLE.find(p=>p.upper===(s.zaZone9Upper===true)&&p.tile===tile&&!s.zaZone9Spent?.[p.id])||null;}
export const ZONE9_ITEMS=[{id:'south-hyper',tile:'i',x:18,y:10,upper:false,name:'고급상처약',kind:'hyper_potions'},{id:'north-heal',tile:'j',x:12,y:5,upper:true,name:'힐볼',kind:'healball'},{id:'west-great',tile:'k',x:3,y:4,upper:true,name:'슈퍼볼',kind:'greatball'}];
export function zone9Item(s,tile){return ZONE9_ITEMS.find(p=>p.upper===(s.zaZone9Upper===true)&&p.tile===tile&&!(Array.isArray(s.zaZone9Items)&&s.zaZone9Items.includes(p.id)))||null;}
export function zone9Map(s={}){
 const upper=s.zaZone9Upper===true,g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':upper?'#':'.'));
 if(upper){for(let y=3;y<=12;y++)for(let x=3;x<=7;x++)g[y][x]='.';for(let y=3;y<=12;y++)for(let x=15;x<=19;x++)g[y][x]='.';for(let y=5;y<=9;y++)for(let x=8;x<=14;x++)g[y][x]='g';}
 else{for(let y=6;y<=10;y++)for(let x=8;x<=14;x++)g[y][x]=',';g[0][11]='X';g[16][11]='X';g[16][15]='X';}
 g[5][5]='l';g[11][17]='h';for(const p of ZONE9_VISIBLE)if(p.upper===upper&&!s.zaZone9Spent?.[p.id])g[p.y][p.x]=p.tile;for(const p of ZONE9_ITEMS)if(p.upper===upper&&zone9Item(s,p.tile))g[p.y][p.x]=p.tile;
 return g.map(r=>r.join(''));
}
export function zone9Encounter(s,rng=Math.random){const pool=s.zaZone9Upper===true?[[703,28,30],[64,28,30],[677,27,29],[303,27,29]]:[[302,28,30]],next=()=>Math.max(0,Math.min(.999999999999,rng())),[speciesId,min,max]=pool[Math.floor(next()*pool.length)];return {speciesId,level:min+Math.floor(next()*(max-min+1))};}

// Magenta Sector 6: a large building complex with a central courtyard.
// The geometry, gate positions and city streets are provisional.
export function magentaSector6Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=11;y++)for(let x=5;x<=17;x++)g[y][x]='#';
 for(let y=5;y<=9;y++)for(let x=7;x<=15;x++)g[y][x]=',';
 for(let y=1;y<=15;y++)g[y][11]=',';
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

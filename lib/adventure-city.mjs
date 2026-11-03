import {GARDEN_VISIBLE,gardenWildResolved} from './adventure-visible-wild.mjs';
// A compact, original 2D district inspired by Lumiose; independent of the Kanto route map.
export function cityMap(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'c'));
 const put=(x,y,c)=>{grid[y][x]=c;};
 for(let y=2;y<15;y++)for(let x=7;x<=14;x++)if(y>=11)put(x,y,'g');
 // Central landmark occupies real blocked tiles, with its signal at the foot.
 for(let y=1;y<=4;y++)for(let x=10;x<=12;x++)put(x,y,'#');
 const house=(x,y,c)=>{for(let j=y-3;j<=y;j++)for(let i=x-1;i<=x+1;i++)put(i,j,'#');put(x,y,c);};
 house(3,5,'J');house(18,4,'B');house(18,11,'M');
 for(let x=0;x<22;x++)put(x,8,'c');for(let y=5;y<=8;y++)put(3,y,'c');for(let y=5;y<=11;y++)put(18,y,'c');
 put(3,5,'J');put(18,4,'B');put(18,11,'M');put(10,10,'R');put(15,10,'Y');put(5,11,'4');put(16,13,'5');put(20,13,'6');put(20,6,'7');put(8,12,'1');put(13,12,'2');put(10,14,'3');put(11,13,'A');put(11,5,'Z');put(0,8,'W');put(6,8,'S');
 return grid.map(row=>row.join(''));
}

export const CITY_AREA={id:0,name:'미르시티 · 조사단 지구',biome:'electric',min:13,max:20};
// A curated local park pool, independent of the Kanto waterside encounter table.
export const CITY_WILD_IDS=[25,16,43,661,672,676,669,677,559,54];
export const GARDEN_WILD_IDS=[10,43,46,69,114,152,265,406,546,672];
export const CITY_WILD_AREA={id:0,name:'미르시티 · 야생 정원',biome:'forest',min:17,max:25};
export const CITY_ARENA_AREA={id:0,name:'미르시티 · 야간 배틀존',biome:'electric',min:0,max:0};
export const HOTEL_AREA={id:0,name:'미르시티 · 호텔 Z',biome:'electric',min:0,max:0};
export const SHOP_AREA={id:0,name:'미르시티 · 프렌들리숍',biome:'electric',min:0,max:0};
export function cityWildMap(world={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=2;y<=13;y++)for(let x=2;x<=20;x++)grid[y][x]='g';
 for(let x=2;x<=20;x++){grid[9][x]='.';grid[14][x]='.';}
 for(let y=3;y<=14;y++){grid[y][3]='.';grid[y][19]='.';}
 for(let y=4;y<=7;y++)for(let x=9;x<=13;x++)if(!((y===4||y===7)&&(x===9||x===13)))grid[y][x]='~';
 for(let y=9;y<=15;y++)grid[y][11]='.';
 for(const [tile,pokemon] of Object.entries(GARDEN_VISIBLE))if(!gardenWildResolved(world,tile))grid[pokemon.y][pokemon.x]=tile;
 grid[5][17]='8';grid[16][11]='D';grid[14][11]='S';return grid.map(row=>row.join(''));
}
export function cityArenaMap(){
 const grid=Array.from({length:11},(_,y)=>Array.from({length:15},(_,x)=>x===0||x===14||y===0||y===10?'#':'c'));
 grid[3][7]='B';grid[8][7]='S';grid[10][7]='D';return grid.map(row=>row.join(''));
}
export function hotelMap(){
 const grid=Array.from({length:11},(_,y)=>Array.from({length:15},(_,x)=>x===0||x===14||y===0||y===10?'#':'c'));
 for(let x=3;x<=11;x++)if(x!==7)grid[3][x]='#';
 grid[3][7]='K';grid[6][4]='9';grid[6][10]='0';grid[5][7]='d';grid[10][7]='D';return grid.map(row=>row.join(''));
}
export function cityShopMap(){
 const grid=Array.from({length:11},(_,y)=>Array.from({length:15},(_,x)=>x===0||x===14||y===0||y===10?'#':'c'));
 for(let x=4;x<=10;x++)if(x!==7)grid[3][x]='#';
 grid[3][7]='O';grid[10][7]='D';return grid.map(row=>row.join(''));
}

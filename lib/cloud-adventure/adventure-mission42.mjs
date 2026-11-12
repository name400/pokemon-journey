// Zone 20: ruined Prism Tower, surrounding grass and paths. Exact geometry and
// individual wild Pokémon positions are provisional.
// L's level 78–80 team and moves: https://www.serebii.net/legendsz-a/mainmissions/tokeeptheworldinbalance.shtml
// Mission 42 battle phases and capture data follow the documented level-84 encounter.
// https://bulbapedia.bulbagarden.net/wiki/Zygarde_(game)
export const MISSION42_ZYGARDE_FORMS=[10181,718,10120];
export const MISSION42_ZYGARDE_MOVES=[['사우전드애로','신속','깨물어부수기'],['그라운드포스','용의파동','깨물어부수기','스톤샤워'],['사우전드애로','사우전드웨이브','그라운드포스','코어퍼니셔']];
export const MISSION42_ZYGARDE_CAPTURE_MOVES=['코어퍼니셔','사우전드애로','사우전드웨이브','그라운드포스'];
export const MISSION42_L={id:'mission42-l',name:'L',team:[[668,78],[671,78],[302,78],[715,79],[569,79],[130,80]],strategy:'balanced',moves:[
 ['Hyper Voice','Flamethrower','Snarl','Solar Beam'],
 ['Energy Ball','Dazzling Gleam','Psychic','Calm Mind'],
 ['Will-O-Wisp','Night Slash','Shadow Claw','Confuse Ray'],
 ['Boomburst','Hurricane','Dragon Pulse','Super Fang'],
 ['Gunk Shot','Brutal Swing','Rock Blast','Metal Claw'],
 ['Crunch','Waterfall','Ice Fang','Earthquake'],
]};
export const ZONE20_VISIBLE=[
 {id:'bulbasaur',tile:'a',species:1,level:55,name:'이상해씨',x:7,y:10,alpha:false},
 {id:'charmander',tile:'b',species:4,level:55,name:'파이리',x:16,y:11,alpha:false},
 {id:'lucario',tile:'c',species:448,level:55,name:'루카리오',x:9,y:9,alpha:false},
];
// Documented central alpha pool. Equal weights and a fixed level are provisional.
// https://www.gamerguides.com/pokemon-legends-z-a/database/alpha-pokemon/groups/wild-zone-20
export const ZONE20_ALPHA=[
 {species:448,name:"루카리오"},{species:282,name:"가디안"},{species:306,name:"보스로라"},{species:26,name:"라이츄"},{species:36,name:"픽시"},
 {species:65,name:"후딘"},{species:68,name:"괴력몬"},{species:71,name:"우츠보트"},{species:94,name:"팬텀"},{species:115,name:"캥카"},
 {species:121,name:"아쿠스타"},{species:127,name:"쁘사이저"},{species:130,name:"갸라도스"},{species:134,name:"샤미드"},{species:135,name:"쥬피썬더"},
 {species:136,name:"부스터"},{species:149,name:"망나뇽"},{species:168,name:"아리아도스"},{species:214,name:"헤라크로스"},{species:225,name:"딜리버드"},
 {species:227,name:"무장조"},{species:248,name:"마기라스"},{species:302,name:"깜까미"},{species:308,name:"요가램"},{species:334,name:"파비코리"},
 {species:359,name:"앱솔"},{species:376,name:"메타그로스"},{species:407,name:"로즈레이드"},{species:445,name:"한카리아스"},{species:450,name:"하마돈"},
 {species:470,name:"리피아"},{species:471,name:"글레이시아"},{species:475,name:"엘레이드"},{species:478,name:"눈여아"},{species:512,name:"야나키"},
 {species:514,name:"바오키"},{species:516,name:"앗차키"},{species:545,name:"펜드라"},{species:553,name:"악비아르"},{species:560,name:"곤율거니"},
 {species:569,name:"더스트나"},{species:584,name:"배바닐라"},{species:604,name:"저리더프"},{species:609,name:"샹델라"},{species:618,name:"메더"},
 {species:660,name:"파르토"},{species:663,name:"파이어로"},{species:666,name:"비비용 (화원의 모양)"},{species:671,name:"플라제스 (빨간 꽃)"},{species:673,name:"고고트"},
 {species:675,name:"부란다"},{species:676,name:"트리미앙 (야생의 모습)"},{species:681,name:"킬가르도 (실드폼)"},{species:687,name:"칼라마네로"},{species:689,name:"거북손데스"},
 {species:691,name:"드래캄"},{species:695,name:"일레도리자드"},{species:700,name:"님피아"},{species:701,name:"루차불"},{species:702,name:"데덴네"},
 {species:703,name:"멜리시"},{species:706,name:"미끄래곤"},{species:707,name:"클레피"},{species:711,name:"펌킨인 (보통 사이즈)"},{species:715,name:"음번"},
 {species:780,name:"할비롱"},{species:870,name:"대여르"}
];
// Two independent alpha encounters appear in the centre; exact 2D coordinates are draft.
// https://www.gamerguides.com/pokemon-legends-z-a/database/alpha-pokemon/groups/wild-zone-20
export function zone20Visible(s,tile){if(tile==='d'||tile==='e'){const second=tile==='e',id=second?'alpha2':'alpha',species=second?s.zaZone20AlphaSpecies2:s.zaZone20AlphaSpecies;if(!Number.isInteger(species)||s.zaZone20Spent?.[id])return null;const p=ZONE20_ALPHA.find(p=>p.species===species);return p?{...p,id,tile,level:64,x:second?9:13,y:7,alpha:true}:null;}return ZONE20_VISIBLE.find(p=>p.tile===tile&&!s.zaZone20Spent?.[p.id])||null;}
export const ZONE20_ITEMS=[{id:'south-seed',tile:'i',x:6,y:14,name:'숙달의씨',kind:'seedofmasteryza'},{id:'southwest-full',tile:'j',x:5,y:12,name:'풀회복약',kind:'full_restores'}];
export function zone20Item(s,tile){return ZONE20_ITEMS.find(p=>p.tile===tile&&!(Array.isArray(s.zaZone20Items)&&s.zaZone20Items.includes(p.id)))||null;}

// The southeastern pond and crossing are documented; exact tile positions are draft.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_20
// Northwest containers and southwest rocks are documented; tile footprints are drafts.
// Damaged Prism Tower remains over the central playable area. Individual
// supports, debris footprint and openings are 2D drafts, not surveyed geometry.
// https://bulbapedia.bulbagarden.net/wiki/Prism_Tower
export const ZONE20_RUIN_SUPPORTS=[[8,4],[8,5],[8,7],[8,8],[14,4],[14,5],[14,7],[14,8]];
export const ZONE20_CONTAINERS=[[2,2],[3,2],[2,3],[3,3]];
export const ZONE20_ROCKS=[[2,11],[3,11],[2,12],[3,12]];
export const ZONE20_SOUTHEAST_WATER=[10,12,13].flatMap(y=>[18,19,20].map(x=>[x,y]));
// Draft north-east stream: tiles extend the existing water without changing the east gate.
export const ZONE20_NORTHEAST_STREAM=[3,4].flatMap(y=>[18,19,20].map(x=>[x,y]));
// Zygarde is encountered below the tower ruins; chamber geometry is a 2D draft.
export function zone20ChamberMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=3;y<=14;y++)for(let x=4;x<=18;x++){const ellipse=((x-11)/7)**2+((y-8.5)/6)**2;if(ellipse<=1)g[y][x]=',';}for(let y=6;y<=15;y++)g[y][11]=',';g[6][11]='n';g[15][11]='h';return g.map(r=>r.join(''));}
export function zone20Map(s={}){if(s.zaMission42ChamberV1===true&&s.zaMission42Underground===true)return zone20ChamberMap();const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=3;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]='g';for(let y=8;y<=14;y++)g[y][11]=',';for(let y=5;y<=7;y++)for(let x=18;x<=20;x++)g[y][x]='~';for(const [x,y] of ZONE20_RUIN_SUPPORTS)g[y][x]='|';for(const [x,y] of ZONE20_CONTAINERS)g[y][x]='%';for(const [x,y] of ZONE20_ROCKS)g[y][x]='^';for(const [x,y] of ZONE20_SOUTHEAST_WATER)g[y][x]='~';for(let x=18;x<=20;x++)g[11][x]=',';
 // Approximate the source's north-east stream and the north-west paved / south-west dry areas.
 // Floor changes only replace ordinary non-encounter land; all shapes are provisional.
 for(const [x,y] of ZONE20_NORTHEAST_STREAM)if(g[y][x]==='.')g[y][x]='~';
 for(let y=1;y<=6;y++)for(let x=1;x<=4;x++)if(g[y][x]==='.')g[y][x]=',';
 for(let y=9;y<=14;y++)for(let x=1;x<=4;x++)if(g[y][x]==='.')g[y][x]=';';
 // The northeast park has a waterside promenade. Its precise route is draft;
 // only ordinary floor changes, preserving encounters and water.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_20
 for(let x=11;x<=17;x++)if(g[1][x]==='.')g[1][x]=',';
 for(let x=17;x<=21;x++)if(g[2][x]==='.')g[2][x]=',';
 for(let y=2;y<=8;y++)if(g[y][21]==='.')g[y][21]=',';
 g[6][11]='n';g[0][11]='X';g[0][12]='X';g[8][0]='W';g[9][0]='W';g[8][22]='E';g[9][22]='E';g[15][11]='X';for(const p of ZONE20_ITEMS)if(zone20Item(s,p.tile))g[p.y][p.x]=p.tile;if(zone20Visible(s,'d'))g[7][13]='d';if(zone20Visible(s,'e'))g[7][9]='e';for(const p of ZONE20_VISIBLE)if(zone20Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(r=>r.join(''));}
// All 15 ordinary research species remain available. These pools approximate
// the documented habitats on the compressed 2D map; coordinates and equal
// weights are provisional. Water species are encountered from adjacent grass.
// https://www.videogameschronicle.com/guide/pokemon-legends-z-a-wild-zone-20/
export const ZONE20_ENCOUNTER_SPECIES=Object.freeze([1,4,152,448,7,498,158,282,407,687,691,306,569,560,450]);
export const ZONE20_HABITAT_POOLS=Object.freeze({
 grass:Object.freeze([1,4,152,448,282,407]),
 waterside:Object.freeze([7,158,687,691]),
 dry:Object.freeze([4,498,450]),
 ruins:Object.freeze([448,306,569,560]),
});
export function zone20Habitat(s){
 const {x,y}=s||{};if(!Number.isInteger(x)||!Number.isInteger(y))return null;
 if(x===17&&y>=3&&y<=12)return 'waterside';
 if(x<=7&&y>=9&&y<=12)return 'dry';
 if(x<=7&&y>=3&&y<=6)return 'ruins';
 return 'grass';
}
export function zone20Encounter(s,rng=Math.random){const next=()=>Math.max(0,Math.min(.999999999999,rng())),pool=ZONE20_HABITAT_POOLS[zone20Habitat(s)]||ZONE20_ENCOUNTER_SPECIES;return {speciesId:pool[Math.floor(next()*pool.length)],level:55};}

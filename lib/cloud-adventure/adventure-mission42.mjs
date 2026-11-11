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
export const ZONE20_ALPHA=[{species:448,name:'루카리오'},{species:282,name:'가디안'},{species:306,name:'보스로라'}];
export function zone20Visible(s,tile){if(tile==='d'&&Number.isInteger(s.zaZone20AlphaSpecies)&&!s.zaZone20Spent?.alpha){const p=ZONE20_ALPHA.find(p=>p.species===s.zaZone20AlphaSpecies);return p?{...p,id:'alpha',tile:'d',level:64,x:13,y:7,alpha:true}:null;}return ZONE20_VISIBLE.find(p=>p.tile===tile&&!s.zaZone20Spent?.[p.id])||null;}
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
export function zone20Map(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=3;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]='g';for(let y=8;y<=14;y++)g[y][11]=',';for(let y=5;y<=7;y++)for(let x=18;x<=20;x++)g[y][x]='~';for(const [x,y] of ZONE20_RUIN_SUPPORTS)g[y][x]='|';for(const [x,y] of ZONE20_CONTAINERS)g[y][x]='%';for(const [x,y] of ZONE20_ROCKS)g[y][x]='^';for(const [x,y] of ZONE20_SOUTHEAST_WATER)g[y][x]='~';for(let x=18;x<=20;x++)g[11][x]=',';
 // The northeast park has a waterside promenade. Its precise route is draft;
 // only ordinary floor changes, preserving encounters and water.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_20
 for(let x=11;x<=17;x++)if(g[1][x]==='.')g[1][x]=',';
 for(let x=17;x<=21;x++)if(g[2][x]==='.')g[2][x]=',';
 for(let y=2;y<=8;y++)if(g[y][21]==='.')g[y][21]=',';
 g[6][11]='n';g[0][11]='X';g[8][0]='W';g[8][22]='E';g[15][11]='X';for(const p of ZONE20_ITEMS)if(zone20Item(s,p.tile))g[p.y][p.x]=p.tile;if(zone20Visible(s,'d'))g[7][13]='d';for(const p of ZONE20_VISIBLE)if(zone20Visible(s,p.tile)===p)g[p.y][p.x]=p.tile;return g.map(r=>r.join(''));}
export function zone20Encounter(s,rng=Math.random){const pool=[1,4,152,448],next=()=>Math.max(0,Math.min(.999999999999,rng()));return {speciesId:pool[Math.floor(next()*pool.length)],level:55};}

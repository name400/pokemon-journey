// Bleu Sector 9 approach: rooftop, Philippe, then scaffolding bridge to Starmie.
// Positions, bridge shape and the scaffolding entry are provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-34-a-rogue-mega-starmie
// https://pokequery.com/games/legends-za/walkthrough
export function mission34RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=7;y++)for(let x=2;x<=10;x++)g[y][x]='.';
 for(let y=8;y<=9;y++)for(let x=7;x<=9;x++)g[y][x]='.';
 for(let x=10;x<=15;x++)g[9][x]=',';
 for(let y=7;y<=12;y++)for(let x=15;x<=20;x++)g[y][x]='.';
 if(!s.zaMission34PhilippeWon)g[9][12]='r';
 g[8][3]='j';g[4][7]='6';g[10][18]='7';return g.map(row=>row.join(''));
}

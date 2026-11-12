import {stationDetourMap} from './adventure-station-detour.mjs';
import {rankBPoints,rankBWins,RANK_B_TRAINERS} from './adventure-rank-a.mjs';
import {rankDPoints,rankDWins,RANK_D_TRAINERS} from './adventure-rank-c.mjs';
import {rankCPoints,rankCWins,RANK_C_TRAINERS} from './adventure-rank-b.mjs';
import {activeRoyaleZones,royaleFieldEntry,royaleFieldEntryAt,royaleReturnDestination} from './adventure-royale-zones.mjs';
import {zone9CrystalAt} from './adventure-mega-crystals.mjs';
import {adventureEvResetUnlocked} from './adventure-ev-reset.mjs';
import {lysandreMazeMap,lysandrePower,lysandreWild,LYSANDRE_WILD,lysandreBasement2Map} from './adventure-lysandre-maze.mjs';
import {side27Available,side27Reg,side27Shop,FOSSILS,stoneShopStock,megaStoneShopStock} from './adventure-side27.mjs';
import {mission10OriginalStarter} from './adventure-mission10.mjs';
import {leNahMap} from './adventure-le-nah.mjs';
import {leWowAvailable} from './adventure-le-wow.mjs';
import {side88Origin,side88Destination} from './adventure-side88.mjs';
import {isStationSpot,stationDialogue} from './adventure-station.mjs';
import {museumFrontMap,museumFloorMap,museumSide21Available,museumSide21Requester,museumSide21Spot} from './adventure-museum.mjs';
import {centerAt,registeredCenters,fastTravelEnabled,taxiAvailable,taxiDestinations,rougeTaxiUnlocked} from './adventure-fast-travel.mjs';
import {academyCourtyardMap} from './adventure-academy.mjs';
import {magentaSector1Map,cafeGallantMap} from './adventure-magenta-sector1.mjs';
import {vertSector45Map} from './adventure-vert-sector45.mjs';
import {vertSector8Map} from './adventure-vert-sector8.mjs';
import {rougeSector8Map,rougeSector6Map} from './adventure-rouge-sector8.mjs';
import {aymlisWestRoofMap} from './adventure-aymlis-west-roof.mjs';
import {rougeTowerInteriorMap} from './adventure-rouge-tower-interior.mjs';
import {cafeWoofRoofMap} from './adventure-cafe-woof-roof.mjs';
import {mission34RoofMap} from './adventure-mission34-roof.mjs';
import {addPromenadeVent,promenadeVentShop} from './adventure-promenade-vent.mjs';
import {galerieLuneMap,galerieLuneRoofMap,LUNE_SHOPS} from './adventure-galerie-lune.mjs';
import {rougeSector4Map,ombrageArcadeMap,OMBRAGE_SHOPS} from './adventure-rouge-sector4.mjs';
import {northRougeRoofMap} from './adventure-north-rouge-roof.mjs';
import {rougeSector1Map,rougeSector1RoofMap,rougeSector3RoofMap,side04Available} from './adventure-rouge-sector1.mjs';
import {mission17Available} from './adventure-zone1-mission17.mjs';
import {mission27RoofMap} from './adventure-mission27-roof.mjs';
import {mission23RoofMap} from './adventure-mission23-roof.mjs';
import {mission22TunnelMap} from './adventure-mission22-tunnel.mjs';
import {magenta6RoofMap,magenta6ScaffoldMap,magenta6CourtAlleyMap} from './adventure-magenta6-roof.mjs';
import {mission16RoofMap} from './adventure-mission16-roof.mjs';
import {magenta3RoofMap,magenta3LowerGapMap} from './adventure-magenta3-roof.mjs';
import {rougeSector5Map} from './adventure-rouge-sector5.mjs';
import {magentaStreetMap,magentaSector2Map,magentaSector4Map,magentaSector4RoofMap} from './adventure-magenta-sector4.mjs';
import {passagePalaisMap,PALAIS_SHOPS} from './adventure-passage-palais.mjs';
import {rougeSector3Map} from './adventure-rouge-sector3.mjs';
import {jauneCanalSectorMap,saisonCanalsideMap,jauneStreetMap,jauneStreetNorthMap} from './adventure-jaune-canal-sectors.mjs';
import {vertSector6Map,vert6RoofMap,racineGarageMap,racineCanariRoomMap,vertSector3Map,vertSector1Map,vertSector7Map} from './adventure-vert-sector6.mjs';
import {passageFeliciteMap,bleuSector8Map,bleuSector9Map,FELICITE_SHOPS} from './adventure-passage-felicite.mjs';
import {bleuStreetMap} from './adventure-bleu-street.mjs';
import {southBoulevardMap} from './adventure-south-boulevard.mjs';
import {bleuSector7Map} from './adventure-bleu-sector7.mjs';
import {bleuSector3Map,bleuSewerApproachMap} from './adventure-bleu-sector3.mjs';
import {bleuSector5Map} from './adventure-bleu-sector5.mjs';
import {coulantRouteMap} from './adventure-coulant-route.mjs';
import {espaceVideMap,espaceAdjacentRoadMap,bleuSector4Map,bleuSector4TunnelMap,rustRoofMap,RUST_NORTH_BUILDING} from './adventure-espace-vide.mjs';
import {canariQuizMap,magentaCanalRouteMap,magentaWestCourtyardMap} from './adventure-magenta-canal-route.mjs';
import {magentaSector8RouteMap,magentaSewerBankMap} from './adventure-magenta-sector8-route.mjs';
import {vertStreetRouteMap} from './adventure-vert-street-route.mjs';
import {bleuPlazaRouteMap} from './adventure-bleu-plaza-route.mjs';
import {jauneGardenRouteMap} from './adventure-jaune-garden-route.mjs';
import {zone19Map,zone19Visible,zone19Unlocked,zone19Item} from './adventure-zone19.mjs';
import {zone18Map,zone18Visible,zone18Unlocked,zone18Item,magentaSector9Map,autumnalApproachMap,ZONE18_SCAFFOLD} from './adventure-zone18.mjs';
import {zone17Map,zone17Visible,zone17Unlocked,zone17Item} from './adventure-zone17.mjs';
import {zone16Map,zone16GardenMap,zone16Visible,zone16Unlocked,zone16Item,ZONE16_STALLS} from './adventure-zone16.mjs';
import {zone15Map,zone15Visible,zone15Item,hibernalApproachMap,jaune7RoofMap} from './adventure-zone15.mjs';
import {zone14Map,zone14Visible,zone14Unlocked,zone14Item,ZONE14_EQUIPMENT} from './adventure-zone14.mjs';
import {zone13Map,zone13Visible,zone13Item,rougeSector7Map,rouge7RoofMap,ZONE13_TREES} from './adventure-zone13.mjs';
import {zone12Map,zone12Visible,zone12Item} from './adventure-zone12.mjs';
import {zone10Map,zone10Visible,zone10Item} from './adventure-zone10.mjs';
import {zone9Map,zone9SouthScaffoldMap,zone9Visible,zone9Item,magentaSector6Map,magentaSector3Map} from './adventure-zone9.mjs';
import {zone8Map,zone8Visible,zone8Item,ZONE8_STALLS} from './adventure-zone8.mjs';
import {zone7Map,zone7Unlocked,zone7WestRoofMap} from './adventure-zone7.mjs';
import {zone6Map,zone6Visible,zone6Layer,zone6Item,jauneSector11Map,ZONE6_CAFE_FOOTPRINT,ZONE6_MARKET_STALLS} from './adventure-zone6.mjs';
import {zone11Map,zone11Unlocked,zone11Visible,ZONE11_WEST_FORK,zone11NorthwestLedgeMap,zone11SouthwestStairMap} from './adventure-zone11.mjs';
import {zone5Map,zone5Visible,zone5DrainMap} from './adventure-zone5.mjs';
import {zone20Map,zone20Visible,zone20Item,ZONE20_SOUTHEAST_WATER,ZONE20_NORTHEAST_STREAM,ZONE20_CONTAINERS,ZONE20_ROCKS,ZONE20_RUIN_SUPPORTS} from './adventure-mission42.mjs';
import {anomalyIds,researchMap} from './adventure-mission40.mjs';
import {infinitePoints,infiniteRewardWins,infiniteNextReward} from './adventure-infinite-royale.mjs';
import {PROTECT_WAVES,protectWave,protectMap} from './adventure-mission37.mjs';
import {mission31Case,mission31CasesComplete} from './adventure-mission31-cases.mjs';
import {mission26Case,mission26CasesComplete} from './adventure-mission26-cases.mjs';
import {CRYSTAL_POSITIONS,clearedCrystals} from './adventure-mission20-jobs.mjs';
import {mission20Case,mission20Complete,mission20Ghost,mission20GhostsCaught} from './adventure-mission20.mjs';
import {sewerInspected,SEWER_BRANCH_ITEMS,sewerBranchItem,SEWER_SOUTH_ITEMS,sewerSouthItem} from './adventure-mission19.mjs';
import {rankEPoints,rankEWins,RANK_E_TRAINERS} from './adventure-rank-d.mjs';
import {mission15CaseDialogue,mission15Complete} from './adventure-mission15.mjs';
import {rankFPoints,rankFWins,RANK_F_TRAINERS} from './adventure-rank-e.mjs';
import {CAFE_WOOF_DRINKS} from './adventure-cafe.mjs';
import {AREAS, TRAINERS, areaMap} from '../campaign.mjs';
import {surveyDialogue,habitatGuideDialogue,habitatLabAction,habitatStage,cityProjectStage,cityProjectHotelAction,wildStudyStage} from './adventure-story.mjs';
import {royaleDialogue,royaleZoneDialogue,ROYALE_V_TRAINERS,royaleVWins,royaleVReady,royaleYReady,royaleXReady,royaleWReady,royaleZReady,lidaStage,naveenAction,lidaBagAction,lidaBattleAction,joseeAction,joseeRequired} from './adventure-royale.mjs';

export const MAP_VERSION = 2;
export const FIELD_SIZE = {width: 23, height: 17};
export const DIRECTIONS = Object.freeze({up: [0,-1], down: [0,1], left: [-1,0], right: [1,0]});
import {ADVENTURE_GOODS} from '../adventure-economy.mjs';
export const FIELD_GOODS=ADVENTURE_GOODS.filter(g=>typeof g.column==='string').map(g=>({...g,column:String(g.column)}));

/** Coordinates are authoritative on both the field and API. No new DB schema. */
export function adventureMap(area=0, expedition=false) {
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'t'));
  const put=(x,y,c)=>{grid[y][x]=c;};
  for(let y=2;y<15;y++)for(let x=1;x<22;x++){
    if((x>=7&&x<=12&&y<=6)||(x>=6&&x<=14&&y>=11)||(x>=19&&y>=12))put(x,y,'g');
  }
  if([2,5].includes(area)||expedition)for(let y=3;y<=6;y++)for(let x=8;x<=11;x++)put(x,y,'~');
  if([1,7,8].includes(area))for(let y=3;y<=6;y++)for(let x=9;x<=11;x++)put(x,y,'^');
  if([4,6].includes(area))for(let x=7;x<=12;x++)put(x,4,'#');
  // Three-by-four buildings. Only the door is walkable.
  const house=(x,y,door)=>{for(let j=y-3;j<=y;j++)for(let i=x-1;i<=x+1;i++)put(i,j,'#');put(x,y,door);};
  house(3,5,'H');house(18,11,'M');
  if(area!==9||expedition)house(18,4,area===0||expedition?'P':'G');
  if(area===9&&!expedition){
    for(let y=1;y<=5;y++)for(let x=7;x<=21;x++)put(x,y,y===5?'.':'#');
    [8,11,14,17,20].forEach((x,i)=>put(x,4,i===4?'C':'L'));
  }
  for(let x=0;x<=22;x++)put(x,8,'.');
  for(let y=5;y<=8;y++)put(3,y,'.');
  for(let y=5;y<=11;y++)put(18,y,'.');
  put(18,4,area===0||expedition?'P':area===9?'#':'G');
  put(3,5,'H');put(18,11,'M');
  for(let x=10;x<18;x++)put(x,10,'.');
  put(0,8,'W');if(area<9||expedition)put(22,8,'E');else put(22,8,'#');
  put(10,10,'N');put(6,8,'S');put(14,14,'I');put(5,9,'Q');
  return grid.map(row=>row.join(''));
}

export function labMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=4;x<=8;x++)grid[5][x]='#';
  for(let x=14;x<=18;x++)grid[5][x]='#';
  grid[5][11]='R';grid[15][11]='X';
  return grid.map(row=>row.join(''));
}
// The lift and office layout are a 2D draft; the third-floor destination is source-confirmed.
export function lumioseResearchLobbyMap(){
  const grid=labMap().map(row=>[...row]);
  grid[9][16]='i';
  return grid.map(row=>row.join(''));
}
// The second floor and its desk item are source-confirmed; floor plan is provisional.
// https://bulbapedia.bulbagarden.net/wiki/Sycamore_Pok%C3%A9mon_Lab
export function lumioseResearchSecondMap(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=4;x<=8;x++)g[4][x]='#';for(let x=12;x<=18;x++)g[4][x]='#';
 for(let x=6;x<=9;x++)g[7][x]='k';g[7][7]='n';if(!s.zaLabSecondGreatBall)g[7][9]='o';g[13][16]='i';return g.map(row=>row.join(''));
}
export function lumioseDirectorOfficeMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=4;x<=8;x++)grid[4][x]='#';
  for(let x=14;x<=18;x++)grid[4][x]='#';
  for(let x=9;x<=13;x++)grid[4][x]='k';
  grid[5][11]='R';grid[13][16]='i';
  return grid.map(row=>row.join(''));
}
// An original, small city district rather than a reconstruction of the full city.
export function lumioseMap(s={}){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  const house=(x,y,tile)=>{for(let yy=y-3;yy<=y;yy++)for(let xx=x-1;xx<=x+1;xx++)grid[yy][xx]='#';grid[y][x]=tile;};
  house(3,5,'H');house(19,5,'M');house(11,5,'J');
  // A bench at an existing blocked wall tile; exact position is provisional.
  grid[5][2]='^';
  grid[9][11]='T';grid[10][4]='Q';grid[6][14]='h';grid[10][18]='x';if(s.zaRoyaleRank==='V'&&!s.zaMysteryTrail)grid[7][16]='d';grid[15][11]='X';grid[15][8]='s';grid[8][0]='W';grid[8][22]='E';grid[0][19]='X';grid[0][15]='X';
  if(s.zaMission10Stage===1||s.zaMission03Stage===1)grid[7][12]='n';
  if(s.zaMission40Complete&&s.zaMission41Complete&&!s.zaMission42Stage)grid[7][13]='F';
  return grid.map(row=>row.join(''));
}
// Draft rooftop route with a crystal blocking the way to Zone 2.
export function lumioseRooftopMap(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=1;x<=21;x++)grid[9][x]='#';
 grid[9][11]=s.zaRooftopCrystalCleared?'.':'c';if(s.zaRoyaleRank==='V'&&s.zaMysteryTrail===1)grid[5][18]='d';else if(s.zaRoyaleRank==='V'&&s.zaMysteryTrail>=2)grid[5][18]='n';if(!s.zaRooftopIntroduced)grid[12][6]='u';if(s.zaMission15Stage>=1)grid[5][18]='d';grid[4][17]='m';grid[6][15]='7';grid[7][17]='6';grid[15][11]='X';grid[8][0]='W';grid[8][22]='X';return grid.map(row=>row.join(''));
}
// Provisional tile layout for Z-A Wild Zone 1, not the original 3D geography.
// Shops line the street in the original; exact footprints and placement are draft.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_1
export const ZONE1_STREET_SHOPS=[[2,5],[3,5],[4,5],[2,6],[3,6],[4,6],[18,5],[19,5],[20,5],[18,6],[19,6],[20,6]];
export function lumioseZone1Map(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 // The east–west street is paved, not encounter grass. Coordinates and
 // width are still an approximation of the original Zone 1 layout.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_1
 for(let x=6;x<=16;x++)grid[8][x]=',';
 // The original has a grass patch beside the western exit. Its tile
 // footprint is approximate; use decorative grass so movement encounters
 // and path costs remain identical to the original ordinary floor tiles.
 // https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas
 for(let y=9;y<=10;y++)for(let x=1;x<=4;x++)grid[y][x]='k';
 // A small pond is near the rooftop ladder; its exact shoreline is draft.
 // https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/moves.html
 for(const [x,y] of [[2,2],[3,2],[3,3]])grid[y][x]='~';
 for(const [x,y] of ZONE1_STREET_SHOPS)grid[y][x]='%';
 grid[8][0]='W';grid[8][22]='E';grid[4][0]='X';grid[3][0]=s.zaZone1RoofRockCleared?'l':'r';grid[0][11]='X';grid[0][17]='X';if(s.zaMission03Stage>=3&&s.zaMission03Stage<=7)grid[7][5]='n';if(s.zaMission03Stage===4)grid[6][8]='f';if(s.zaMission03Stage===5)grid[6][14]='b';return grid.map(row=>row.join(''));
}
// Zone 1 rooftop and ladder positions are provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-03-a-new-life-in-lumiose-city
export function zone1RoofAlphaReady(s){return s?.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3&&s.zaZone1RoofAlphaSpent!==true;}
export function lumioseZone1RoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]='.';
 for(let y=5;y<=7;y++)for(let x=8;x<=13;x++)g[y][x]='g';
 // Separate the right-hand rooftop from the lower roof; two tiles retain a crossing.
 // Edge coordinates are draft: https://www.nintendolife.com/guides/pokemon-legends-z-a-wild-zone-1-guide-all-pokemon-and-alphas
 for(const y of [4,5,6,9])g[y][14]='#';
 g[10][2]='l';g[4][4]='d';g[4][19]='d';g[4][15]='j';if(!s.zaZone1Tm103)g[8][7]='t';if(!s.zaZone1RoofPearl)g[5][20]='k';if(zone1RoofAlphaReady(s))g[5][18]='p';return g.map(row=>row.join(''));
}
// Upper rooftop is reached by a second ladder; exact positions are draft.
// https://allthings.how/pokemon-legends-z-a-how-to-catch-the-guaranteed-shiny-mareep/
export function lumioseZone1HighRoofMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=9;y++)for(let x=4;x<=18;x++)g[y][x]='.';
 g[10][15]='j';if(s.zaSide17Stage>=1&&!s.zaSide17MareepCaught)g[5][8]='m';return g.map(row=>row.join(''));
}
// Vert Sector 9 is at Zone 1's north exit; buildings and street width are draft.
// https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/side-missions/
export function lumioseVertSector9Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=9;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 // Vert Sector 9 has a small waterway crossed by a bridge and steps to a green courtyard.
 // Tile coordinates and scale are provisional: https://www.nintendolife.com/guides/pokemon-legends-z-a-where-to-catch-eevee
 for(let y=11;y<=12;y++)for(let x=1;x<=21;x++)if(x<10||x>12)g[y][x]='~';
 // Coulant water continues through Vert Sector 9 toward Aymlis Park. Extend
 // the impassable water to both screen edges; its alignment is provisional.
 // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
 for(const y of [11,12]){g[y][0]='~';g[y][22]='~';}
 for(let y=10;y<=12;y++)for(let x=10;x<=12;x++)g[y][x]=':';
 for(const [x0,x1] of [[3,7],[16,20]])for(let y=13;y<=15;y++)for(let x=x0;x<=x1;x++)g[y][x]='k';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=2;y<=5;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[8][0]='W';g[14][14]='q';g[16][11]='X';if(s.zaSide118Stage===3)g[10][12]='z';return g.map(row=>row.join(''));
}
// A courtyard reachable from the roof and the street; exact geometry is draft.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-03-a-new-life-in-lumiose-city
export function lumioseZone1CourtyardMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=2;x<=20;x++)g[y][x]='.';
 for(let y=6;y<=10;y++)for(let x=5;x<=10;x++)g[y][x]='g';
 g[8][21]='.';g[8][22]='E';return g.map(row=>row.join(''));
}
// Research Lab is west of Wild Zone 1 on Floral Avenue; street dimensions remain provisional.
export function lumioseFloralMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=2;y<=5;y++)for(let x=4;x<=6;x++)grid[y][x]='#';grid[5][5]='P';grid[0][11]='f';grid[8][0]='X';grid[8][22]='E';return grid.map(row=>row.join(''));}
// Road connections follow the documented Floral/Vernal/Vert Plaza sequence; tile geometry is provisional.
// Playable provisional lab, not a reproduction of the original floor plan.
// Café furniture, doorway and the secret bookcase position are provisional.
export function lysandreCafeMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=5;x<=17;x++)g[4][x]='k';
 g[5][11]='u';g[7][15]='b';g[15][11]='X';return g.map(row=>row.join(''));
}
export function lysandreLabMap(s={}){if(s.zaLysandreFloor===2)return lysandreBasement2Map(s);if(s.zaLysandreMazeV2===true&&s.zaLysandreFloor!==3)return lysandreMazeMap(s);const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[15][11]='X';if(s.zaLysandreFloor===3){g[4][6]='a';g[4][10]='b';g[4][14]='e';g[4][18]='k';g[8][11]='j';}else{g[4][4]='a';g[4][9]='b';g[4][14]='e';g[4][19]='g';g[8][15]='k';}g[13][18]='l';if(s.zaLysandreFloor!==3&&Number(s.zaMission35Stage)>=4)for(const p of LYSANDRE_WILD)if(!s.zaLysandreWildSpent?.[p.id])g[p.y][p.x]=p.tile;return g.map(row=>row.join(''));}
export function lumioseVernalMap(s={}){
 // The documented southern waterside is reached by stairs from the east.
 // Shore shape, elevation and stair coordinates remain a 2D draft.
 // https://www.thonky.com/pokemon-legends-z-a/main-mission-11-a-rogue-mega-slowbro
 if(s.zaVernalSlowbroBank===true){
  const bank=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=7;y<=12;y++)for(let x=3;x<=20;x++)bank[y][x]='.';
  for(let y=13;y<=15;y++)for(let x=3;x<=20;x++)bank[y][x]='~';
  bank[6][18]='j';bank[10][5]='d';return bank.map(row=>row.join(''));
 }
 // East Vernal has a C-shaped roof with a lower part reached by glide.
 // Outline, gap width and ladder tile are provisional.
 // https://allthings.how/find-larvitar-and-evolve-it-to-tyranitar-in-pokemon-legends-z-a/
 if(s.zaVernalEastRoof===true){
  const roof=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=3;y<=5;y++)for(let x=4;x<=16;x++)roof[y][x]='.';
  for(let x=4;x<=7;x++)roof[6][x]='.';
  for(let y=9;y<=11;y++)for(let x=4;x<=16;x++)roof[y][x]='.';
  roof[3][6]='l';return roof.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=5;y<=6;y++)for(let x=18;x<=21;x++)g[y][x]='~';for(let y=6;y<=8;y++)for(let x=10;x<=14;x++)g[y][x]=',';g[8][0]='W';g[8][22]='E';g[10][0]='X';g[10][22]='X';g[3][0]='X';g[5][0]='X';g[12][0]='X';g[13][0]='X';g[12][22]='X';g[15][11]='X';g[4][22]='X';g[5][12]='q';g[4][12]='l';g[4][18]='l';g[10][17]='d';g[10][20]='j';g[12][17]='h';g[10][5]='v';g[3][9]='t';g[12][6]='b';g[12][19]='z';g[16][20]='X';return addPromenadeVent(g).map(row=>row.join(''));}
// Outside Wild Zone 2, the surrounding streets run around Vert Plaza.
// Compressed road widths and building footprints are provisional, not surveyed coordinates.
// Reference: https://github.com/Insektaure/Shiny-Stash-Live-Map/blob/main/romfs/lumiose.png
export function lumioseVertPlazaMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(const [x0,y0,x1,y1] of [[2,2,6,4],[16,2,20,4],[2,12,6,14],[16,12,20,14]])for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]='%';
 for(let x=1;x<=21;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 // The plaza's outer road curves around the Wild Zone; its radius is a 2D approximation.
 for(let y=1;y<=15;y++)for(let x=1;x<=21;x++){const d=((x-21)/11)**2+((y-8)/7)**2;if(d>=.68&&d<=1.35&&g[y][x]!== '%')g[y][x]=',';}
 g[8][0]='W';g[8][22]='E';g[0][11]='X';g[16][15]='X';return g.map(row=>row.join(''));
}
// Source establishes a circular watery plaza, central island and bridge; precise contours remain provisional.
export function zone2IslandAlphaReady(s){return !!s?.zaZone2RockCleared&&s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3&&s.zaZone2AlphaSpent!==true;}
export function zone2IslandAlphaTarget(s){
 if(s?.district!=='lumiose-zone2'||s.interior||!zone2IslandAlphaReady(s)||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone2Map(s),target={x:20,y:11},queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);
 for(let i=0;i<queue.length;i++){const q=queue[i];if(q.distance>0&&q.x===target.x&&q.y===target.y)return {...target,distance:q.distance};if(q.distance>=3)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,key=`${x},${y}`,tile=map[y]?.[x];if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}
 return null;
}
const ZONE2_EAST_SHORE_WATER=[...[8,9,10,11,12,13].map(y=>[16,y]),[17,13],[17,14],[18,14],[18,15]];
// The northeast shore is reached across the bridge, not by circling the lake.
// The exact shoreline is provisional. https://gamewith.jp/pokemon-za/524388
const ZONE2_NORTHEAST_WATER=[4,5,7,8].map(y=>[15,y]);
// Close the northern shore bypass; exact waterline remains an approximation.
const ZONE2_NORTH_SHORE_WATER=[1,2,3].map(y=>[15,y]);
export function lumioseZone2Map(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++){const d=((x-11)/5)**2+((y-8)/4)**2;grid[y][x]=d>0.28&&d<0.95?'~':'g';}
 // Three crossings connect the island from the northwest, northeast and south-southwest.
 // Their tile coordinates and the shoreline remain provisional.
 for(let y=5;y<=7;y++)grid[y][8]='=';
 for(let y=5;y<=7;y++)grid[y][14]='=';
 // Small raised northwest landing, linked to the existing northern stairs.
 for(let x=7;x<=9;x++)grid[4][x]=';';
 // A wooden bridge is reached to the left when entering from the south.
 // The exact tiles and the other provisional crossings need visual verification.
 for(let y=9;y<=12;y++)grid[y][8]='=';
 grid[9][9]='=';
 // Approximate inlet separates the southern shore from the eastern bank.
 // The precise waterline remains provisional.
 for(const [x,y] of ZONE2_EAST_SHORE_WATER)grid[y][x]='~';
 for(const [x,y] of ZONE2_NORTHEAST_WATER)grid[y][x]='~';
 for(const [x,y] of ZONE2_NORTH_SHORE_WATER)grid[y][x]='~';
 grid[6][15]='='; // Northeast bridge joins the central island to the east bank.
 // Eastern side area: rock and shallow passage are provisional positions.
 for(const [x,y] of [[19,10],[20,10],[21,10],[19,11],[21,11],[21,12],[19,13],[20,13],[21,13]])grid[y][x]='~';
 grid[11][20]=zone2IslandAlphaReady(s)?'p':'g';grid[12][20]='w';grid[12][19]=s.zaZone2RockCleared?'w':'r';
 // Grass lies just inside the southern entrance; the exact outline is provisional.
 for(let y=13;y<=14;y++)for(let x=9;x<=10;x++)grid[y][x]='g';
 // A small patch near the northwestern entrance represents the rear-gate habitat.
 for(let y=2;y<=3;y++)grid[y][5]='g';
 // Stairs are visible just inside the northwest gate; tile coordinates remain provisional.
 for(let y=1;y<=3;y++)grid[y][4]=':';
 grid[3][3]='h'; // Draft connection to the raised viewpoint; exact placement unverified.
 grid[0][4]='W';grid[16][11]='E';grid[5][22]='X';return grid.map(row=>row.join(''));
}
// A separate height layer for the documented panoramic viewpoint. Its shape,
// connection to the northwest stairs, and background water are provisional.
export function zone2OverlookMap(){
 const grid=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=8;y<=13;y++)for(let x=3;x<=19;x++)grid[y][x]='.';
 for(let y=5;y<=7;y++)for(let x=3;x<=8;x++)grid[y][x]='.';
 for(let y=4;y<=7;y++)for(let x=9;x<=19;x++)grid[y][x]='~';
 grid[13][4]='h';return grid.map(row=>row.join(''));
}
// Connects the source-confirmed northwest gate to Vert Sector 2; street geometry is provisional.
export function lumioseVert2Map(s={}){
 // The courtyard ladder reaches a rooftop; a separate roof across a gap is
 // documented, but the geometry and this landing are 2D draft coordinates.
 // https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/Exploring_Lumiose_City
 if(s.zaVert2RoofUpper===true){
  const roof=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=4;y<=11;y++)for(let x=3;x<=9;x++)roof[y][x]='.';
  for(let y=4;y<=11;y++)for(let x=13;x<=19;x++)roof[y][x]='.';
  roof[8][9]='j';roof[8][13]='j';roof[10][5]='l';return roof.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // A garden and stairway beside Zone 2's northwest entrance. The footprint is provisional.
 for(let y=3;y<=12;y++)for(let x=7;x<=16;x++)g[y][x]='k';
 for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let x=18;x<=20;x++)g[8][x]=':';
 g[4][12]='l';g[8][0]='W';g[8][22]='E';g[0][17]='X';g[16][17]='X';g[16][7]='X';g[5][0]='X';return g.map(row=>row.join(''));
}
// Nouveau Cafe Truck No. 2 is southwest of the water and its stairs; exact
// dimensions, shoreline and coordinates are provisional 2D adaptations.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-22-a-rogue-mega-barbaracle
export function mission22CafeWatersideMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=5;y<=9;y++)for(let x=9;x<=14;x++)g[y][x]='~';
 for(let x=2;x<=19;x++)for(let y=11;y<=13;y++)g[y][x]=',';
 for(let y=4;y<=12;y++)for(let x=16;x<=18;x++)g[y][x]=',';
 for(let x=16;x<=21;x++)g[8][x]=',';
 g[12][4]='q';g[5][17]='s';g[8][22]='X';return g.map(row=>row.join(''));
}
// Aymlis Park's Vernal Center, westward arch and east-side water stairs are
// source-based; park footprint, stair positions and the bank are 2D drafts.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-11-a-rogue-mega-slowbro
export function mission11AymlisMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 if(s.zaMission11ParkLower===true){
  for(let y=7;y<=12;y++)for(let x=3;x<=20;x++)g[y][x]='.';
  for(let y=13;y<=15;y++)for(let x=3;x<=20;x++)g[y][x]='~';
  g[6][18]='j';g[10][5]='d';return g.map(row=>row.join(''));
 }
 for(let y=1;y<=7;y++)for(let x=17;x<=19;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=4;x<=19;x++)g[y][x]=',';
 for(let y=8;y<=13;y++)for(let x=4;x<=6;x++)g[y][x]=',';
 for(let y=12;y<=14;y++)for(let x=4;x<=18;x++)g[y][x]=',';
 g[0][18]='X';g[3][20]='H';g[8][8]=';';g[12][18]='j';return g.map(row=>row.join(''));
}
// Mission 21: an additional ladder, glide gap and upper approach. The
// scaffold layout, heights and landing coordinates are provisional.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-21-a-rogue-mega-mawile
export function mission21GlideMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=8;y++)for(let x=2;x<=9;x++)g[y][x]=',';
 for(let y=4;y<=8;y++)for(let x=13;x<=20;x++)g[y][x]=',';
 g[8][4]='l';g[5][17]='j';return g.map(row=>row.join(''));
}
// Jaune Sector 8 lies north of Jaune Street and contains Wild Zone 19.
// The center and Mission 29 incident are nearby; exact coordinates are draft.
// https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_8
// https://strategywiki.org/wiki/Pok%C3%A9mon_Legends%3A_Z-A/A_Rogue_Mega_Venusaur
export function mission29Jaune8Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=2;x<=20;x++)g[y][x]=',';
 for(let y=3;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=3;y<=5;y++)for(let x=16;x<=20;x++)g[y][x]='#';
 g[6][5]='H';g[0][11]='X';g[8][0]='X';g[10][0]='X';g[16][11]='X';
 if((s.zaMission26Stage===3&&!s.zaMission29Complete)||s.zaMission29RewardPending)g[8][16]='9';
 return g.map(row=>row.join(''));
}
// Mission 32's eastern courtyard, lift, scaffold ladder and glide are source-based;
// building shapes, distances and coordinates are draft 2D adaptations.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-32-a-rogue-mega-dragonite
export function mission32RoofMap(s={}){
 const layer=s.zaMission32Layer||'ground',g=Array.from({length:17},()=>Array(23).fill('#'));
 if(layer==='ground'){
  for(let y=4;y<=12;y++)for(let x=1;x<=18;x++)g[y][x]='.';
  for(let x=1;x<=13;x++)g[8][x]=',';g[8][0]='X';g[5][14]='j';
 }else if(layer==='roof'){
  for(let y=4;y<=12;y++)for(let x=3;x<=5;x++)g[y][x]='.';
  for(let y=4;y<=6;y++)for(let x=3;x<=19;x++)g[y][x]=',';
  g[13][4]='j';g[4][18]='l';
 }else{
  for(let y=4;y<=8;y++)for(let x=3;x<=11;x++)g[y][x]=',';
  for(let y=4;y<=10;y++)for(let x=15;x<=20;x++)g[y][x]='.';
  g[7][5]='l';if((s.zaMission31Stage===3&&!s.zaMission32Complete)||s.zaMission32RewardPending)g[6][18]='6';
 }
 return g.map(row=>row.join(''));
}
// Hibernal Center and its southwest alley are documented; coordinates are draft.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-33-a-rogue-mega-tyranitar
export function mission33AlleyMap(s={}){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=5;y++)for(let x=1;x<=20;x++)g[y][x]=',';
 for(let y=4;y<=11;y++)for(let x=18;x<=20;x++)g[y][x]=',';
 for(let y=10;y<=12;y++)for(let x=6;x<=20;x++)g[y][x]=',';
 for(let y=9;y<=14;y++)for(let x=3;x<=8;x++)g[y][x]='.';
 // Hibernal Pokémon Center sits beside the approach. The building's exact
 // footprint and the positions of its services are provisional.
 g[3][5]='H';g[3][7]='M';g[4][0]='X';if((s.zaMission31Stage===3&&!s.zaMission33Complete)||s.zaMission33RewardPending)g[11][5]='6';return g.map(row=>row.join(''));
}
// Jaune Sector 3 scaffolding northeast of Prism Tower; coordinates are draft.
// https://www.thonky.com/pokemon-legends-z-a/main-mission-12-a-rogue-mega-camerupt
export function mission12Jaune3Map(s={}){
 const layer=s.zaMission12Layer||'ground';
 if(layer==='ground'){
  const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=2;y<=5;y++)for(let x=3;x<=8;x++)g[y][x]='#';
  for(let y=2;y<=5;y++)for(let x=14;x<=20;x++)g[y][x]='#';
  for(let y=7;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
  g[8][11]='d';g[7][17]='l';g[16][11]='X';return g.map(row=>row.join(''));
 }
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=4;y<=12;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 if(layer==='scaffold'){
  for(let x=4;x<=19;x++)g[8][x]='#';
  g[12][17]='l';g[4][5]='l';
 }else{g[12][5]='l';g[5][11]='d';}
 return g.map(row=>row.join(''));
}
// Centrico Pokemon Center route; exact placement is provisional.
export function lumioseCentricoRouteMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let x=1;x<=21;x++){for(let y=7;y<=9;y++)g[y][x]=x===7||x===16?';':',';g[6][x]='k';g[10][x]='k';}// Centrico Plaza surrounds Prism Tower; the ellipse compresses the circular road into the district grid.
 // Mission 20's SBC court is near Centrico Pokémon Center. Shape and exact
 // position are a draft; leave all former walkable positions and exits intact.
 // https://www.thonky.com/pokemon-legends-z-a/main-mission-20-a-request-from-the-rust-syndicate
 for(let y=2;y<=4;y++)for(let x=14;x<=20;x++)g[y][x]=';';
 if(s.zaMission20Stage===11)g[3][16]='o';
 for(let y=5;y<=15;y++)for(let x=2;x<=20;x++){const d=((x-11)/8)**2+((y-12)/5)**2;if(d>=.6&&d<=1.35&&g[y][x]!==';')g[y][x]=',';}
 // The Saison Canal emerges on both sides of Prism Tower. The short
 // waterline is a compressed draft, with the tower hiding the middle.
 // https://bulbapedia.bulbagarden.net/wiki/Saison_Canal
 for(let y=11;y<=13;y++){
  for(const x of [2,3,5,6,7,8,9,13,14,15,16,18,20,21])g[y][x]='~';
  // Walkable deck strips keep the existing street and southern approaches reachable.
  for(const x of [1,4,17,19])g[y][x]=':';
  g[y][22]='~';
 }
 // Draft north approach connects the Rouge Sector 1 street edge to the Zone 20
 // north gate; keep the old gate interaction and all existing city connections.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_20
 for(let y=1;y<=4;y++)if(g[y][7]==='.')g[y][7]=',';
 for(let x=7;x<=10;x++)if(g[4][x]==='.')g[4][x]=',';
 // The west deck leads from the Magenta canal edge to the existing plaza road.
 if(g[10][1]==='k')g[10][1]=',';
 // Keep the plaza's two pre-existing events on their former tiles.
 for(let y=11;y<=13;y++)for(let x=10;x<=12;x++)g[y][x]='%';g[8][0]='W';g[12][0]='X';g[8][22]='E';g[0][2]='X';g[0][5]='X';g[0][7]='X';g[0][9]='X';g[0][10]='X';g[0][11]='X';g[0][13]='X';g[0][15]='X';g[0][17]='X';g[0][19]='X';g[5][11]='H';g[5][15]='q';g[5][18]='m';g[4][11]='G';g[8][3]='G';g[8][19]='G';g[16][7]='X';g[16][12]='X';g[16][14]='X';g[16][16]='W';g[16][18]='X';g[16][20]='X';g[11][17]='o';g[12][18]='d';g[5][22]='X';g[4][0]='X';if(fastTravelEnabled(s))for(const x of [0,22])for(const y of [7,9])g[y][x]='n';return g.map(row=>row.join(''));}
function legacyZone2Walkable(x,y){if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>22||y<0||y>16)return false;if((x===4&&y===0)||(x===11&&y===16)||(y===8&&(x===0||x===22)))return true;if(x===0||x===22||y===0||y===16)return false;return !(y>=4&&y<=6&&x>=8&&x<=12);}
function nearestWalkableLand(map,x,y){const places=[];for(let yy=1;yy<16;yy++)for(let xx=1;xx<22;xx++)if(walkable(map[yy]?.[xx]))places.push({x:xx,y:yy,d:Math.abs(xx-x)+Math.abs(yy-y)});places.sort((a,b)=>a.d-b.d||a.y-b.y||a.x-b.x);return places[0];}

// Rouge Street north of the plaza meets North Boulevard; geometry is provisional.
export function lumioseRougeNorthMap(s={}){
 if(s.zaRougeStreetSouth===true){
  // Southern Rouge Street joins Centrico, Rouge Plaza and Sector 1.
  // Street width, footprints and gate coordinates are provisional.
  const road=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=1;y<=15;y++)for(let x=9;x<=13;x++)road[y][x]=',';
  for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)road[y][x]=',';
  for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)road[y][x]='#';
  for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)road[y][x]='#';
  road[11][15]='H';road[9][22]='X';road[11][22]='X';road[0][11]='X';road[16][11]='X';road[8][0]='X';road[8][22]='X';return road.map(row=>row.join(''));
 }
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=3;y<=15;y++){for(let x=9;x<=13;x++)g[y][x]=',';g[y][8]='k';g[y][14]='k';}
 for(let y=3;y<=5;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 for(let y=1;y<=3;y++)for(let x=18;x<=20;x++)g[y][x]='#';
 g[13][20]='h';g[4][19]='l';g[8][18]='0';g[7][16]='H';g[7][20]='j';g[6][19]='m';g[6][17]='t';g[5][17]='v';g[16][11]='X';g[0][15]='X';g[4][22]='E';g[10][22]='X';g[12][22]='X';g[14][22]='X';g[15][22]='X';g[10][0]='X';g[12][0]='X';g[4][0]='W';return g.map(row=>row.join(''));
}
// The boulevard and company court connect known landmarks; dimensions are provisional.
export function lumioseNorthBoulevardMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=7;y<=9;y++)for(let x=1;x<=21;x++)g[y][x]=',';
 // The north cemetery entrance connects back to the boulevard; precise road width is provisional.
 for(let y=10;y<=15;y++)g[y][7]=',';
 // Draft approaches link the boulevard to the existing Zone 18, 13, 6 and
 // 15 gates. Only ordinary floor changes; landmark and gate tiles stay intact.
 // https://bulbapedia.bulbagarden.net/wiki/Lumiose_City
 for(const x of [2,5,6,18,19,20])for(let y=1;y<=6;y++)if(g[y][x]==='.')g[y][x]=',';
 for(let x=18;x<=20;x++)if(g[4][x]==='.')g[4][x]=',';
 g[8][0]='W';g[8][22]='E';g[16][9]='X';g[0][15]='X';g[0][5]='X';g[0][6]='X';g[0][12]='X';g[0][18]='X';g[0][19]='X';g[0][20]='X';g[0][2]='X';g[0][8]='X';g[0][9]='X';g[0][10]='X';g[0][13]='X';g[16][3]='X';g[16][7]='X';g[16][11]='X';g[16][15]='X';g[16][19]='X';g[5][15]='d';if((s.zaMission10Stage===10&&!s.zaMission13Complete)||s.zaMission13RewardPending)g[8][15]='d';g[5][12]='t';g[5][18]='8';g[6][18]='6';g[5][8]='j';g[3][14]='q';return g.map(row=>row.join(''));}
export function lumioseQuasarticoMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let y=1;y<=4;y++)for(let x=8;x<=14;x++)g[y][x]='#';for(let y=7;y<=11;y++)for(let x=7;x<=15;x++)g[y][x]=',';if(s.zaMission10Stage===2){g[6][11]='y';g[6][12]='y';}else if(s.zaMission10Stage>=3)g[6][11]='j';g[0][3]='X';g[0][20]='X';g[4][22]='X';g[8][22]='E';g[16][11]='X';return g.map(row=>row.join(''));}
// Provisional Wild Zone 3 layout, not the original city geography.
const ZONE3_OUTER_FENCE=[[8,4],[14,4],[7,5],[15,5],[6,6],[16,6],[6,7],[16,7],[5,8],[17,8],[6,9],[16,9],[6,10],[16,10],[7,11],[15,11],[8,12],[14,12]];
export function lumioseZone3Map(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // Rouge Plaza is a round ornamental garden; scale and exact paths are provisional.
 for(let y=3;y<=13;y++)for(let x=5;x<=17;x++){const d=((x-11)/5)**2+((y-8)/4)**2;if(d<=1)grid[y][x]='g';else if(d<=1.45)grid[y][x]='k';}
 // The outer garden has north and south entrances. The fence footprint and
 // precise gates remain provisional. https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_3
 for(const [x,y] of ZONE3_OUTER_FENCE)if(grid[y][x]==='k')grid[y][x]='|';
 // Central avenue and provisional gaps divide the four fenced gardens.
 for(let y=4;y<=12;y++)for(let x=10;x<=12;x++)grid[y][x]='.';
 grid[8][11]='g';
 for(const y of [4,5,7,9,11,12])for(const x of [9,13])grid[y][x]='|';
 // The reference plaza has a cross-shaped walk through the formal garden.
 // Open only former fence tiles, preserving existing grass encounter tiles.
 for(const x of [6,7,8,14,15])grid[8][x]='.';
 // The garden has north and south Rouge Avenue entrances. Continue the
 // existing approach over ordinary floor only; exact paving is provisional.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_3
 for(const y of [1,2,3,13,14,15])for(const x of [10,11,12])if(grid[y][x]==='.')grid[y][x]=',';
 grid[2][11]='H'; // Travelling Pokémon Center on the north side.
 grid[7][7]='i'; // Western tower; detailed footprint is provisional.
 // Southeastern approach to Hibernal Avenue; gate position is provisional.
 // https://www.pokepedia.fr/Place_Rouge
 grid[6][0]='X';grid[8][0]='X';grid[8][22]='E';grid[12][22]='X';grid[0][11]='X';grid[0][17]='X';grid[16][11]='X';grid[16][12]='X';grid[4][17]='j';grid[6][19]='b';grid[10][19]='t';grid[11][20]='q';grid[12][3]='v';grid[10][3]='0';if(rougeTaxiUnlocked(s))grid[5][0]='n';return grid.map(row=>row.join(''));
}
// Small tower upper floor; its exact shape and furniture are not yet verified.
// TM022 is on the monument roof; its tile location is provisional.
// https://altissimo1.github.io/Supplementary-Series/Legends/Legends-Z-A/moves.html
export function lumioseZone3TowerMap(s={}){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=5;y<=11;y++)for(let x=8;x<=14;x++)g[y][x]='.';g[9][11]='i';if(!s.zaZone3Tm022)g[6][10]='t';return g.map(row=>row.join(''));}
// Graves are documented in the cemetery; exact rows and coordinates are draft.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_4
export const ZONE4_GRAVES=[[7,4],[9,4],[13,4],[15,4],[7,7],[15,7],[7,11],[15,11]];
// Provisional cemetery layout; original paths and graves differ.
export function lumioseZone4Map(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=4;y<=12;y++)for(let x=6;x<=16;x++)grid[y][x]='g';
 for(const [x,y] of ZONE4_GRAVES)grid[y][x]='%';
 // Perimeter wall and openings approximate the source's enclosed cemetery.
 for(let x=6;x<=16;x++)if(x<10||x>12){grid[3][x]='|';grid[13][x]='|';}
 for(let y=4;y<=12;y++){if(y!==10)grid[y][5]='|';if(y!==8)grid[y][17]='|';}
 // A large crypt stands on the south side; footprint is provisional.
 for(let y=12;y<=13;y++)for(let x=14;x<=17;x++)grid[y][x]='^';
 // The cemetery has a north entrance; road and exact coordinates are provisional.
 // https://www.gamesradar.com/games/pokemon/pokemon-legends-za-sorta-scary-cemetery-story/
 for(let y=1;y<=4;y++)grid[y][11]=',';grid[0][11]='X';grid[0][15]='X';
 for(let y=12;y<=15;y++)grid[y][11]=',';
 // West access connects Rouge Avenue to the cemetery; the paving is a draft.
 // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_4
 for(let x=1;x<=5;x++)if(grid[10][x]==='.')grid[10][x]=',';
 // Outside walk links the west approach, southern gate and south crypt.
 // Only existing ordinary floor changes; the exact alignment is provisional.
 for(let y=11;y<=14;y++)if(grid[y][2]==='.')grid[y][2]=',';
 for(let x=2;x<=19;x++)if(grid[14][x]==='.')grid[14][x]=',';
 grid[16][11]='X';grid[16][5]='X';grid[10][0]='W';grid[8][22]='E';grid[6][18]='z';if(s.zaBunnelbyQuest===3&&!s.zaZone4AlphaSpent)grid[10][4]='p';return grid.map(row=>row.join(''));
}
// Provisional interior of the Looker Bureau.
export function lumioseBureauMap(){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=7;x<=15;x++)if(x!==11)grid[5][x]='#';
 grid[5][11]='e';grid[15][11]='X';return grid.map(row=>row.join(''));
}
export function lumioseGardenMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=4;y<=12;y++)for(let x=8;x<=16;x++)grid[y][x]='k';
  grid[8][0]='W';grid[8][22]='E';grid[6][10]='Q';grid[9][11]='K';grid[5][18]='Y';
  return grid.map(row=>row.join(''));
}
export function lumioseSiteMap(s={}){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=3;y<=6;y++)for(let x=12;x<=19;x++)grid[y][x]='#';
  for(let x=12;x<=19;x++)grid[11][x]='#';
  grid[8][0]='W';grid[8][22]='E';grid[9][15]='D';grid[12][7]='9';grid[12][8]='6';grid[12][9]='0';grid[10][7]='d';grid[6][7]='Z';grid[11][12]=s.zaSiteRockCleared===true?'.':'r';return grid.map(row=>row.join(''));
}
export function lumioseWildMap(s={}){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=4;y<=12;y++)for(let x=6;x<=18;x++)grid[y][x]='g';
  for(let x=8;x<=16;x++)grid[3][x]='#';
  grid[8][0]='W';grid[8][22]='E';grid[8][3]='A';const alpha=wildAlphaPosition(s);grid[alpha.y][alpha.x]='a';return grid.map(row=>row.join(''));
}
export function lumioseObservationMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let y=3;y<=6;y++)for(let x=13;x<=19;x++)grid[y][x]='g';
  for(let y=11;y<=14;y++)for(let x=5;x<=10;x++)grid[y][x]='g';
  grid[8][0]='W';grid[8][12]='B';return grid.map(row=>row.join(''));
}
// A playable, provisional battle-zone layout; not a reconstruction of Lumiose.
export function lumioseRoyaleMap(s={}){
 const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=5;x<=17;x++)if(x!==11)grid[8][x]='#';
 grid[11][5]='O';grid[5][7]='U';grid[5][17]='V';if(s.zaRoyaleRank==='B'&&s.zaMission35Started){grid[5][3]='a';grid[11][19]='b';}if((s.zaRoyaleRank==='D'&&s.zaMission20Complete)||(s.zaRoyaleRank==='C'&&s.zaMission30Started)){grid[5][3]='a';}if(s.zaRoyaleRank==='E'&&s.zaMission19Stage===1){grid[5][3]='a';}if(s.zaRoyaleRank==='F'&&s.zaMission14Stage===1){grid[5][3]='a';grid[11][19]='b';}if(s.zaRoyaleRank==='V'&&s.zaMission10Stage===4){grid[5][3]='a';grid[11][19]='b';grid[5][12]='e';grid[11][3]='t';grid[11][9]='j';grid[11][15]='k';grid[5][19]='n';}grid[15][11]='X';return grid.map(row=>row.join(''));
}
// Rouge Sector 2 lies between the academy and tower, bordered by Rouge Street
// and Hibernal Avenue. The grid, entrances and building footprints are drafts.
// https://bulbapedia.bulbagarden.net/wiki/Rouge_Sector_2
function leWowMap(){
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 for(let y=3;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';
 for(let y=7;y<=12;y++)for(let x=5;x<=17;x++)g[y][x]=';';
 for(const [x,y] of [[6,7],[16,7],[6,11],[16,11]])g[y][x]='^';
 for(let x=8;x<=14;x++)g[4][x]='%';g[5][11]='R';g[16][11]='X';
 return g.map(row=>row.join(''));
}
function rougeSector2Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<16;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=7;y<=9;y++)for(let x=1;x<22;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 g[5][5]='u'; // Le Wow entrance; exact position is provisional.
 g[0][11]='X';g[16][11]='X';g[8][0]='X';g[8][22]='X';
 return g.map(row=>row.join(''));
}
const CITY_DISTRICTS=['lumiose-station-alley','lumiose-station-roof','lumiose-museum-front','lumiose-rouge-sector2','lumiose-zone9-scaffold','lumiose-zone11-sw-top','lumiose-zone11-sw-middle','lumiose-zone16-garden','lumiose-zone2-overlook','lumiose-bleu-cafe2','lumiose-aymlis-park','lumiose-mission21-glide','lumiose-jaune-sector8','lumiose-mission32-courtyard','lumiose-mission33-alley','lumiose-mission12-jaune3','lumiose-magenta-sector1','lumiose-magenta-sewer-bank','lumiose-magenta-street','lumiose-magenta-sector2','lumiose-zone11-nw-ledge','lumiose-magenta6-scaffold','lumiose-magenta6-court-alley','lumiose-magenta3-gap','lumiose-zone7-west-roof','lumiose-lune-roof','lumiose-rust-roof','lumiose-vert6-roof','lumiose-jaune-street-north','lumiose-vert-sector4','lumiose-vert-sector5','lumiose-vert-sector8','lumiose-rouge-sector6','lumiose-rouge-sector8','lumiose-magenta-west-courtyard','lumiose-rouge7-roof','lumiose-jaune7-roof','lumiose-aymlis-west-roof','lumiose-rouge-tower-interior','lumiose-cafe-woof-roof','lumiose-bleu-sector4','lumiose-bleu4-tunnel','lumiose-mission34-roof','lumiose-bleu-sector9','lumiose-bleu-sector8','lumiose-galerie-lune','lumiose-ombrage-arcade','lumiose-rouge-sector4','lumiose-north-rouge-roof','lumiose-rouge-sector3-roof','lumiose-rouge-sector1','lumiose-rouge-sector1-roof','lumiose-zone1-high-roof','lumiose-vert-sector9','lumiose-zone1-courtyard','lumiose-zone1-roof','lumiose-magenta-sector4','lumiose-magenta-sector4-roof','lumiose-passage-palais','lumiose-rouge-sector3','lumiose-jaune-sector11','lumiose-autumnal-approach','lumiose-magenta-sector9','lumiose-magenta-sector3','lumiose-magenta-sector3-roof','lumiose-mission16-roof','lumiose-mission22-tunnel','lumiose-mission23-roof','lumiose-mission27-roof','lumiose-magenta-sector6','lumiose-magenta-sector6-roof','lumiose-hibernal-approach','lumiose-jaune-sector7','lumiose-rouge-sector7','lumiose-rouge-sector5','lumiose-vert-sector7','lumiose-vert-sector1','lumiose-vert-sector3','lumiose-jaune-street','lumiose-jaune-sector2','lumiose-saison-canalside','lumiose-jaune-sector9','lumiose-jaune-sector6','lumiose-jaune-sector10','lumiose-jaune-sector12','lumiose-vert-sector6','lumiose-passage-felicite','lumiose-bleu-street','lumiose-south-boulevard','lumiose-bleu-sector7','lumiose-zone5-drain','lumiose-bleu3-sewer-approach','lumiose-bleu-sector3','lumiose-bleu-sector5','lumiose-coulant-route','lumiose-estival-approach','lumiose-bleu6-approach','lumiose-espace-vide','lumiose-magenta-canal-route','lumiose-magenta-sector8-route','lumiose-vert-street-route','lumiose-bleu-plaza-route','lumiose-jaune-garden-route','lumiose-zone19','lumiose-zone18','lumiose-zone17','lumiose-zone16','lumiose-zone15','lumiose-zone14','lumiose-zone13','lumiose-zone12','lumiose-zone10','lumiose-zone9','lumiose-zone8','lumiose-zone7','lumiose-zone6','lumiose-zone11','lumiose-zone5','lumiose-zone20','lumiose-research-zone','lumiose-protect','lumiose-lysandre-lab','lumiose-crystal-sewer','lumiose-ghost-house','lumiose-rust','lumiose-sewer','lumiose','lumiose-floral','lumiose-vernal','lumiose-vert-plaza','lumiose-vert2','lumiose-centrico-route','lumiose-rouge-north','lumiose-north-boulevard','lumiose-quasartico','lumiose-rooftop','lumiose-zone1','lumiose-zone2','lumiose-zone3','lumiose-zone4','lumiose-bureau','lumiose-garden','lumiose-site','lumiose-wild','lumiose-observation','lumiose-royale'];
export function hotelMap(){
  const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
  for(let x=7;x<=15;x++)if(x!==11)grid[5][x]='#';
  grid[5][11]='F';grid[5][14]='i';grid[15][11]='X';return grid.map(row=>row.join(''));
}
// Layout coordinates are provisional; the elevator and left-hand 202 door follow the source route.
export function hotelSecondFloorMap(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(let x=5;x<=17;x++)grid[5][x]='#';grid[5][8]='o';grid[5][14]='b';grid[13][11]='i';return grid.map(row=>row.join(''));}
export function hotelRoom202Map(){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));grid[4][8]='z';grid[15][11]='X';return grid.map(row=>row.join(''));}
// Reception and battle court are known; room dimensions and furniture are provisional.
export function sushiRestaurantMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=3;y<=15;y++)for(let x=4;x<=18;x++)g[y][x]='.';for(let y=6;y<=11;y++)for(let x=7;x<=15;x++)g[y][x]=';';g[5][16]='R';g[16][11]='X';return g.map(row=>row.join(''));}
// Rust Syndicate office is distinct from its courtyard. Its desk, lounge,
// statue and exact geometry are a provisional 2D reading of public images.
// https://bulbapedia.bulbagarden.net/wiki/Rust_Syndicate_Office
export function rustOfficeMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=2;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let y=5;y<=12;y++)for(let x=7;x<=15;x++)g[y][x]=';';for(const [x,y] of [[4,4],[18,4],[5,9],[17,9]])g[y][x]='^';for(let x=8;x<=14;x++)g[5][x]='k';g[6][11]='d';g[6][14]='z';g[16][11]='X';return g.map(row=>row.join(''));}
// Justice Dojo is an open training courtyard in Jaune Sector 2. The exact
// tile geometry, entrance and trainer positions are provisional.
// https://bulbapedia.bulbagarden.net/wiki/Justice_Dojo
export function justiceDojoMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=2;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let y=5;y<=11;y++)for(let x=6;x<=16;x++)g[y][x]=';';for(const [x,y] of [[4,4],[18,4],[4,12],[18,12]])g[y][x]='^';g[4][7]='j';g[4][15]='h';g[7][11]='d';g[16][11]='X';return g.map(row=>row.join(''));}
// Richissime has a lobby and separate SBC event floor. Layout is a 2D draft.
// https://bulbapedia.bulbagarden.net/wiki/Hotel_Richissime
export function richissimeLobbyMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=3;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let y=8;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';for(const [x,y] of [[5,5],[17,5],[5,10],[17,10]])g[y][x]='^';g[5][11]='i';g[5][6]='R';g[16][11]='X';return g.map(row=>row.join(''));}
export function richissimeHallMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=2;y<=15;y++)for(let x=3;x<=19;x++)g[y][x]='.';for(let y=5;y<=11;y++)for(let x=6;x<=16;x++)if(((x-11)/5)**2+((y-8)/3)**2<=1)g[y][x]=';';for(const [x,y] of [[4,5],[18,5],[4,11],[18,11]])g[y][x]='^';g[4][11]='q';g[14][11]='i';return g.map(row=>row.join(''));}
// Office and furniture positions are provisional.
export function quasarticoOfficeMap(){const g=Array.from({length:17},()=>Array(23).fill('#'));for(let y=3;y<=15;y++)for(let x=4;x<=18;x++)g[y][x]='.';g[5][11]='j';g[12][15]='R';g[16][11]='X';return g.map(row=>row.join(''));}
// The rooftop's furnishings are source-confirmed; their exact tile positions are provisional.
export function hotelRoofMap(s={}){const grid=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));grid[13][11]='i';grid[5][7]='1';grid[5][11]='2';grid[5][15]='1';grid[9][7]='3';grid[9][15]='4';grid[3][4]='5';grid[3][18]='5';if((s.zaMission35Stage===6&&s.zaMission35RoofRequired)||(s.zaMission36Started&&!s.zaMission36Stage&&!s.zaMission36RoofSeen))grid[7][11]='F';return grid.map(row=>row.join(''));}
const HOTEL_INTERIORS=['hotel','hotel2f','hotel202','hotelRoof'];
// Sewer paths, room dimensions and object positions are provisional.
// The original sewer has a long main passage, interconnected side passages,
// rooms and pools. This compact 23x17 interpretation preserves existing story
// markers; room proportions and their exact correspondence remain provisional.
// Reference for topology only: https://github.com/Insektaure/Shiny-Stash-Live-Map/blob/main/romfs/Sewers.png
export function lumioseSewerMap(s={}){
 if(s.zaSewerIceBranch===true){
  // Branch to the ice bridge and Crunch TM. The geometry is a 2D draft.
  const g=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=5;y<=11;y++)for(let x=2;x<=7;x++)g[y][x]='.';
  for(let y=7;y<=9;y++)for(let x=13;x<=21;x++)g[y][x]='.';
  // Rooms off the fork: original relative sequence only; dimensions are draft.
  for(let y=2;y<=5;y++)for(let x=15;x<=19;x++)g[y][x]='.';g[6][17]='.';
  for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='.';g[10][17]='.';
  for(let y=5;y<=11;y++)for(let x=8;x<=12;x++)g[y][x]='~';
  if(s.zaSewerIceBridge)for(let x=8;x<=12;x++)g[8][x]=':';
  else g[8][13]='i';
  if(!s.zaSewerCrunchTM)g[8][4]='o';
  for(const item of SEWER_BRANCH_ITEMS)if(sewerBranchItem(s,item.x,item.y))g[item.y][item.x]='o';
  g[8][22]='X';return g.map(row=>row.join(''));
 }
 if(s.zaMission19Inner===true){
  // The passage and chamber beyond the illusory wall are an approximate
  // 2D route; the original corridor's exact dimensions are not known.
  const g=Array.from({length:17},()=>Array(23).fill('#'));
  for(let y=11;y<=15;y++)for(let x=9;x<=13;x++)g[y][x]='.';
  for(let y=7;y<=12;y++)for(let x=10;x<=12;x++)g[y][x]='.';
  for(let y=7;y<=9;y++)for(let x=10;x<=18;x++)g[y][x]='.';
  for(let y=2;y<=9;y++)for(let x=16;x<=20;x++)g[y][x]='.';
  g[3][18]='u';g[16][11]='X';return g.map(row=>row.join(''));
 }
 const g=Array.from({length:17},()=>Array(23).fill('#'));
 const room=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)g[y][x]='.';};
 room(3,2,7,5);room(9,1,13,4);room(15,2,19,5);
 room(3,8,7,10);room(15,8,19,11);room(9,12,13,15);
 room(5,4,17,5);room(5,5,6,9);room(16,5,17,9);
 room(10,4,12,15);room(5,9,17,10);
 for(let y=6;y<=7;y++)for(const x of [7,8,9,13,14,15])g[y][x]='~';
 g[11][11]='t';g[10][16]='q';g[5][6]='a';g[5][16]='b';g[9][6]='e';g[9][16]='d';g[3][11]='i';g[2][11]='u';g[4][17]='o';g[16][11]='X';
 for(const item of SEWER_SOUTH_ITEMS)if(sewerSouthItem(s,item.x,item.y))g[item.y][item.x]='o';
 if(s.zaMission19Stage>=11||s.zaMission19Complete)g[10][2]='t';
 if(s.zaMission19Stage===11&&s.zaMission19ChandelureStep===0)g[8][16]='v';
 if(s.zaMission19Stage===11&&s.zaMission19ChandelureStep===1)g[5][11]='v';
 return g.map(row=>row.join(''));
}
// Courtyard statues and bamboo are documented; exact tile placement is draft.
// https://www.pokepedia.fr/Agence_D%C3%A9rouillard
export const RUST_COURTYARD_STATUES=[[8,8],[14,8]];
export const RUST_COURTYARD_BAMBOO=[[7,6],[15,6],[7,9],[15,9]];
// Rust Syndicate meeting area: exterior and office are a provisional combined map.
export function lumioseRustMap(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 // Rust Syndicate Office has a dark building and walled courtyard with a
 // front gate. Its footprint and compressed tile coordinates are drafts.
 // https://www.pokepedia.fr/Agence_D%C3%A9rouillard
 for(let y=2;y<=4;y++)for(let x=7;x<=15;x++)g[y][x]='#';
 // North building and ladder are draft positions.
 for(const [x,y] of RUST_NORTH_BUILDING)g[y][x]='#';g[4][20]='l';
 for(let y=4;y<=10;y++){g[y][6]='|';g[y][16]='|';}
 for(let x=6;x<=16;x++)if(x<10||x>12)g[10][x]='|';
 for(let y=5;y<=15;y++)for(let x=10;x<=12;x++)if(g[y][x]==='.')g[y][x]=',';
 for(const [x,y] of [...RUST_COURTYARD_STATUES,...RUST_COURTYARD_BAMBOO])g[y][x]='^';
 g[6][11]='d';g[16][11]='X';g[8][0]='X';g[12][0]='X';g[8][22]='X';return g.map(row=>row.join(''));
}
// Empty house: actual room shape and positions are provisional.
export function lumioseGhostHouseMap(){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));g[5][6]='q';g[5][11]='a';g[5][16]='b';g[9][17]='n';g[16][11]='X';return g.map(row=>row.join(''));}
// The 27 crystal positions and sewer geometry are provisional.
export function lumioseCrystalSewerMap(s={}){const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));for(const [x,y] of [[4,6],[7,6],[15,6],[18,6],[4,10],[7,10],[15,10],[18,10]])g[y][x]='g';const cleared=new Set(clearedCrystals(s));for(const p of CRYSTAL_POSITIONS)if((s.zaMission20Stage==null||Number(s.zaMission20Stage)===9)&&!cleared.has(p.key))g[p.y][p.x]='c';g[16][11]='X';return g.map(row=>row.join(''));}
function fieldMapBase(s){return s.district==='lumiose-station-alley'&&!s.interior?stationDetourMap():s.district==='lumiose-station-roof'&&!s.interior?stationDetourMap(true):s.district==='lumiose-museum-front'?(s.interior==='museum1'?museumFloorMap(1):s.interior==='museum2'?museumFloorMap(2):museumFrontMap()):s.district==='lumiose-rouge-sector2'&&s.interior==='leWow'?leWowMap():s.district==='lumiose-rouge-sector2'&&!s.interior?rougeSector2Map():s.district==='lumiose-vert-sector6'&&s.interior==='leNah'?leNahMap():s.district==='lumiose-zone9-scaffold'&&!s.interior?zone9SouthScaffoldMap():['lumiose-zone11-sw-top','lumiose-zone11-sw-middle'].includes(s.district)&&!s.interior?zone11SouthwestStairMap(s):s.district==='lumiose-zone16-garden'&&!s.interior?zone16GardenMap(s):s.district==='lumiose-zone2-overlook'&&!s.interior?zone2OverlookMap():s.district==='lumiose-bleu-cafe2'&&!s.interior?mission22CafeWatersideMap():s.district==='lumiose-aymlis-park'&&!s.interior?mission11AymlisMap(s):s.district==='lumiose-mission21-glide'&&!s.interior?mission21GlideMap():s.district==='lumiose-jaune-sector8'&&!s.interior?mission29Jaune8Map(s):s.district==='lumiose-mission32-courtyard'&&!s.interior?mission32RoofMap(s):s.district==='lumiose-mission33-alley'&&!s.interior?mission33AlleyMap(s):s.district==='lumiose-mission12-jaune3'&&!s.interior?mission12Jaune3Map(s):s.district==='lumiose-magenta-sector1'&&!s.interior?magentaSector1Map():s.district==='lumiose-magenta-sewer-bank'&&!s.interior?magentaSewerBankMap():s.district==='lumiose-magenta-street'&&!s.interior?magentaStreetMap():s.district==='lumiose-magenta-sector2'&&!s.interior?magentaSector2Map():s.district==='lumiose-zone11-nw-ledge'&&!s.interior?zone11NorthwestLedgeMap():s.district==='lumiose-magenta6-scaffold'&&!s.interior?magenta6ScaffoldMap():s.district==='lumiose-magenta6-court-alley'&&!s.interior?magenta6CourtAlleyMap():s.district==='lumiose-magenta3-gap'&&!s.interior?magenta3LowerGapMap():s.district==='lumiose-zone7-west-roof'&&!s.interior?zone7WestRoofMap():s.district==='lumiose-lune-roof'&&!s.interior?galerieLuneRoofMap(s):s.district==='lumiose-rust-roof'&&!s.interior?rustRoofMap():s.district==='lumiose-vert6-roof'&&!s.interior?vert6RoofMap():s.district==='lumiose-jaune-street-north'&&!s.interior?jauneStreetNorthMap():s.district==='lumiose-vert-sector4'&&!s.interior?vertSector45Map(4,s):s.district==='lumiose-vert-sector5'&&!s.interior?vertSector45Map(5,s):s.district==='lumiose-vert-sector8'&&!s.interior?vertSector8Map():s.district==='lumiose-rouge-sector6'&&!s.interior?(s.zaAcademyCourtyard===true?academyCourtyardMap(s):rougeSector6Map(s)):s.district==='lumiose-rouge-sector8'&&!s.interior?rougeSector8Map():s.district==='lumiose-magenta-west-courtyard'&&!s.interior?magentaWestCourtyardMap():s.district==='lumiose-rouge7-roof'&&!s.interior?rouge7RoofMap():s.district==='lumiose-jaune7-roof'&&!s.interior?jaune7RoofMap(s):s.district==='lumiose-aymlis-west-roof'&&!s.interior?aymlisWestRoofMap():s.district==='lumiose-rouge-tower-interior'&&!s.interior?rougeTowerInteriorMap():s.district==='lumiose-cafe-woof-roof'&&!s.interior?cafeWoofRoofMap(s):s.district==='lumiose-bleu-sector4'&&!s.interior?bleuSector4Map():s.district==='lumiose-bleu4-tunnel'&&!s.interior?bleuSector4TunnelMap():s.district==='lumiose-mission34-roof'&&!s.interior?mission34RoofMap(s):s.district==='lumiose-bleu-sector9'&&!s.interior?bleuSector9Map():s.district==='lumiose-bleu-sector8'&&!s.interior?bleuSector8Map():s.district==='lumiose-galerie-lune'&&!s.interior?galerieLuneMap(s):s.district==='lumiose-ombrage-arcade'&&!s.interior?ombrageArcadeMap(s):s.district==='lumiose-rouge-sector4'&&!s.interior?rougeSector4Map():s.district==='lumiose-north-rouge-roof'&&!s.interior?northRougeRoofMap():s.district==='lumiose-rouge-sector3-roof'&&!s.interior?rougeSector3RoofMap(s):s.district==='lumiose-rouge-sector1'&&!s.interior?rougeSector1Map(s):s.district==='lumiose-rouge-sector1-roof'&&!s.interior?rougeSector1RoofMap(s): s.district==='lumiose-zone1-high-roof'&&!s.interior?lumioseZone1HighRoofMap(s):s.district==='lumiose-vert-sector9'&&!s.interior?lumioseVertSector9Map(s):s.district==='lumiose-zone1-courtyard'&&!s.interior?lumioseZone1CourtyardMap():s.district==='lumiose-zone1-roof'&&!s.interior?lumioseZone1RoofMap(s):s.district==='lumiose-mission27-roof'&&!s.interior?mission27RoofMap(s):s.district==='lumiose-mission23-roof'&&!s.interior?mission23RoofMap(s):s.district==='lumiose-mission22-tunnel'&&!s.interior?mission22TunnelMap(s):s.district==='lumiose-magenta-sector6-roof'&&!s.interior?magenta6RoofMap(s):s.district==='lumiose-mission16-roof'&&!s.interior?mission16RoofMap(s):s.district==='lumiose-magenta-sector3-roof'&&!s.interior?magenta3RoofMap(s):s.district==='lumiose-rouge-sector5'&&!s.interior?rougeSector5Map():s.district==='lumiose-magenta-sector4-roof'&&!s.interior?magentaSector4RoofMap(s):s.district==='lumiose-magenta-sector4'&&!s.interior?magentaSector4Map(s):s.district==='lumiose-passage-palais'&&!s.interior?passagePalaisMap():s.district==='lumiose-rouge-sector3'&&!s.interior?rougeSector3Map():s.district==='lumiose-jaune-sector11'&&!s.interior?jauneSector11Map():s.district==='lumiose-autumnal-approach'&&!s.interior?autumnalApproachMap():s.district==='lumiose-magenta-sector9'&&!s.interior?magentaSector9Map(s):s.district==='lumiose-magenta-sector3'&&!s.interior?magentaSector3Map():s.district==='lumiose-magenta-sector6'&&!s.interior?magentaSector6Map():s.district==='lumiose-hibernal-approach'&&!s.interior?hibernalApproachMap():s.district==='lumiose-rouge-sector7'&&!s.interior?rougeSector7Map():s.district==='lumiose-vert-sector7'&&!s.interior?vertSector7Map():s.district==='lumiose-vert-sector1'&&!s.interior?vertSector1Map(s):s.district==='lumiose-vert-sector3'&&!s.interior?vertSector3Map():s.district==='lumiose-jaune-street'&&!s.interior?jauneStreetMap():s.district==='lumiose-saison-canalside'&&!s.interior?saisonCanalsideMap():['lumiose-jaune-sector2','lumiose-jaune-sector6','lumiose-jaune-sector7','lumiose-jaune-sector9','lumiose-jaune-sector10','lumiose-jaune-sector12'].includes(s.district)&&!s.interior?jauneCanalSectorMap(s.district==='lumiose-jaune-sector2'?2:s.district==='lumiose-jaune-sector6'?6:s.district==='lumiose-jaune-sector7'?7:s.district==='lumiose-jaune-sector9'?9:s.district==='lumiose-jaune-sector10'?10:12,s):s.district==='lumiose-vert-sector6'&&!s.interior?vertSector6Map(s):s.district==='lumiose-passage-felicite'&&!s.interior?passageFeliciteMap():s.district==='lumiose-bleu-street'&&!s.interior?bleuStreetMap():s.district==='lumiose-south-boulevard'&&!s.interior?southBoulevardMap(s):s.district==='lumiose-bleu-sector7'&&!s.interior?bleuSector7Map(s):s.district==='lumiose-zone5-drain'&&!s.interior?zone5DrainMap(s):s.district==='lumiose-bleu3-sewer-approach'&&!s.interior?bleuSewerApproachMap(s):s.district==='lumiose-bleu-sector3'&&!s.interior?bleuSector3Map():s.district==='lumiose-bleu-sector5'&&!s.interior?bleuSector5Map():s.district==='lumiose-coulant-route'&&!s.interior?coulantRouteMap(s):['lumiose-estival-approach','lumiose-bleu6-approach'].includes(s.district)&&!s.interior?espaceAdjacentRoadMap(s.district==='lumiose-estival-approach'?'estival':'bleu6'):s.district==='lumiose-espace-vide'&&!s.interior?espaceVideMap(s):s.district==='lumiose-magenta-canal-route'&&!s.interior?magentaCanalRouteMap():s.district==='lumiose-magenta-sector8-route'&&!s.interior?magentaSector8RouteMap(s):s.district==='lumiose-vert-street-route'&&!s.interior?vertStreetRouteMap(s):s.district==='lumiose-bleu-plaza-route'&&!s.interior?bleuPlazaRouteMap(s):s.district==='lumiose-jaune-garden-route'&&!s.interior?jauneGardenRouteMap():s.district==='lumiose-zone19'&&!s.interior?zone19Map(s):s.district==='lumiose-zone18'&&!s.interior?zone18Map(s):s.district==='lumiose-zone17'&&!s.interior?zone17Map(s):s.district==='lumiose-zone16'&&!s.interior?zone16Map(s):s.district==='lumiose-zone15'&&!s.interior?zone15Map(s):s.district==='lumiose-zone14'&&!s.interior?zone14Map(s):s.district==='lumiose-zone13'&&!s.interior?zone13Map(s):s.district==='lumiose-zone12'&&!s.interior?zone12Map(s):s.district==='lumiose-zone10'&&!s.interior?zone10Map(s):s.district==='lumiose-zone9'&&!s.interior?zone9Map(s):s.district==='lumiose-zone8'&&!s.interior?zone8Map(s):s.district==='lumiose-zone7'&&!s.interior?zone7Map(s):s.district==='lumiose-zone6'&&!s.interior?zone6Map(s):s.district==='lumiose-zone11'&&!s.interior?zone11Map(s):s.district==='lumiose-zone5'&&!s.interior?zone5Map(s):s.district==='lumiose-zone20'&&!s.interior?zone20Map(s):s.district==='lumiose-research-zone'&&!s.interior?researchMap(s):s.district==='lumiose-protect'&&!s.interior?protectMap(s):s.district==='lumiose-lysandre-lab'&&!s.interior?lysandreLabMap(s):s.district==='lumiose-crystal-sewer'&&!s.interior?lumioseCrystalSewerMap(s):s.district==='lumiose-ghost-house'&&!s.interior?lumioseGhostHouseMap():s.district==='lumiose-rust'&&!s.interior?lumioseRustMap():s.district==='lumiose-sewer'&&!s.interior?lumioseSewerMap(s):s.interior==='rustOffice'?rustOfficeMap():s.interior==='justiceDojo'?justiceDojoMap():s.interior==='richissimeLobby'?richissimeLobbyMap():s.interior==='richissimeHall'?richissimeHallMap():s.interior==='quasarticoOffice'?quasarticoOfficeMap():s.interior==='sushi'?sushiRestaurantMap():s.interior==='canariQuiz'?canariQuizMap():s.interior==='cafeGallant'?cafeGallantMap():s.interior==='racineGarage'?racineGarageMap():s.interior==='racineRoom'?racineCanariRoomMap():s.interior==='lysandreCafe'?lysandreCafeMap():s.interior==='lumioseLab'?lumioseResearchLobbyMap():s.interior==='lumioseDirector'?lumioseDirectorOfficeMap():s.interior==='lumioseLab2'?lumioseResearchSecondMap(s):s.interior==='lab'?labMap():s.interior==='hotel'?hotelMap():s.interior==='hotel2f'?hotelSecondFloorMap():s.interior==='hotel202'?hotelRoom202Map():s.interior==='hotelRoof'?hotelRoofMap(s):s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-floral'?lumioseFloralMap():s.district==='lumiose-vernal'?lumioseVernalMap(s):s.district==='lumiose-vert-plaza'?lumioseVertPlazaMap():s.district==='lumiose-vert2'?lumioseVert2Map(s):s.district==='lumiose-centrico-route'?lumioseCentricoRouteMap(s):s.district==='lumiose-rouge-north'?lumioseRougeNorthMap(s):s.district==='lumiose-north-boulevard'?lumioseNorthBoulevardMap(s):s.district==='lumiose-quasartico'?lumioseQuasarticoMap(s):s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map(s):s.district==='lumiose-zone2'?lumioseZone2Map(s):s.district==='lumiose-zone3'?(s.zaZone3TowerUpper?lumioseZone3TowerMap(s):lumioseZone3Map(s)):s.district==='lumiose-zone4'?lumioseZone4Map(s):s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-observation'?lumioseObservationMap():s.district==='lumiose-royale'?lumioseRoyaleMap(s):adventureMap(s.area,!!s.expedition);}
// Overlay the entrance on a previously walkable tile; stored positions remain valid.
export function fieldMap(s){const map=fieldMapBase(s),e=royaleFieldEntry(s);if(!e||!['.',',',';'].includes(map[e.y]?.[e.x]))return map;const rows=map.slice(),row=rows[e.y];rows[e.y]=row.slice(0,e.x)+'T'+row.slice(e.x+1);return rows;}
// Keep the primary coordinates safe for clients predating interiors. The revision
// detects any older-client write, even one that returns to the same coordinates.
export function storeAdventurePosition(s,revision){
  if(CITY_DISTRICTS.includes(s.district))return {...s,x:5,y:9,facing:'down',interior:null,regionId:s.districtReturnRegion??1,districtPosition:{x:s.x,y:s.y,facing:s.facing,interior:s.interior||null,revision,...(['lumiose-magenta-canal-route','lumiose-saison-canalside'].includes(s.district)?{canalBuildingsLayout:1}:{}),...(['lumiose-zone5','lumiose-zone9'].includes(s.district)?{groundBuildingsLayout:1}:{}),...(s.district==='lumiose-vert-sector9'?{vert9Layout:1}:{}),...(['lumiose-zone17','lumiose-zone18'].includes(s.district)?{splitRoofLayout:1}:{}),...(s.district==='lumiose-zone17'?{zone17Layout:1}:{}),...(s.district==='lumiose-zone10'?{zone10CanalLayout:1}:{}),...(s.district==='lumiose-zone16'?{zone16Layout:3}:{}),...(s.district==='lumiose-zone13'?{zone13Layout:1}:{}),...(s.district==='lumiose-zone8'?{zone8Layout:1}:{}),...(s.district==='lumiose-zone7'?{zone7Layout:1}:{}),...(s.district==='lumiose-centrico-route'?{centricoCanalLayout:2}:{}),...(s.district==='lumiose-vert-plaza'?{vertPlazaLayout:1}:{}),...(s.district==='lumiose-sewer'?{sewerLayout:1}:{}),...(s.district==='lumiose-zone1-roof'?{zone1RoofLayout:1}:{}),...(s.district==='lumiose-zone1'?{zone1Layout:1,zone1ShopsLayout:1}:{}),...(s.district==='lumiose-zone11'?{zone11Layout:1}:{}),...(s.district==='lumiose-coulant-route'?{coulantWaterLayout:1}:{}),...(s.district==='lumiose-rust'?{rustLayout:3}:{}),...(s.district==='lumiose-zone20'?{zone20Layout:5}:{}),...(s.district==='lumiose-zone14'?{zone14Layout:2}:{}),...(s.district==='lumiose-zone6'?{zone6CafeLayout:1,zone6MarketLayout:1}:{}),...(s.district==='lumiose-zone18'?{zone18ScaffoldLayout:1}:{}),...(s.district==='lumiose-zone12'?{zone12Layout:2}:{}),...(s.district==='lumiose-zone2'?{zone2Layout:8}:{}),...(s.district==='lumiose-zone3'?{zone3Layout:4}:{}),...(s.district==='lumiose-zone4'?{zone4Layout:2}:{}),...(s.district==='lumiose-vernal'?{vernalLayout:1}:{}),...(s.district==='lumiose-rouge-north'?{rougeNorthLayout:1}:{}),...(s.district==='lumiose-centrico-route'?{centricoLayout:1}:{})}};
  if(s.districtPosition){s={...s};delete s.districtPosition;}
  if(s.interior!=='lab'){const copy={...s};delete copy.interiorPosition;return copy;}
  return {...s,x:18,y:5,facing:'down',interiorPosition:{x:s.x,y:s.y,facing:s.facing,revision}};
}
export function restoreAdventurePosition(s,revision){
  // An older client may discard the position payload for an unknown district.
  if(CITY_DISTRICTS.includes(s?.district)&&!s.districtPosition){if(s.district==='lumiose-sewer')delete s.zaSewerIceBranch;if(s.district==='lumiose-vert-sector1')delete s.zaVertSaisonBank;if(s.district==='lumiose-rouge-north')delete s.zaRougeStreetSouth;s.district=null;delete s.districtReturnRegion;return s;}
  if(CITY_DISTRICTS.includes(s?.district)&&s.districtPosition){
    let p=s.districtPosition;
    // Older saves can contain former side-gate tiles; keep them in Zone 2 safely.
    if(s.district==='lumiose-zone2'&&!p.interior&&p.y===8&&(p.x===0||p.x===22))p={...p,x:p.x===0?1:21};
    const indoor=p.interior||null,map=!indoor&&s.district==='lumiose-station-alley'?stationDetourMap():!indoor&&s.district==='lumiose-station-roof'?stationDetourMap(true):s.district==='lumiose-museum-front'?(indoor==='museum1'?museumFloorMap(1):indoor==='museum2'?museumFloorMap(2):museumFrontMap()):indoor==='leWow'&&s.district==='lumiose-rouge-sector2'?leWowMap():indoor==='leNah'&&s.district==='lumiose-vert-sector6'?leNahMap():!indoor&&s.district==='lumiose-rouge-sector2'?rougeSector2Map():!indoor&&s.district==='lumiose-zone9-scaffold'?zone9SouthScaffoldMap():!indoor&&['lumiose-zone11-sw-top','lumiose-zone11-sw-middle'].includes(s.district)?zone11SouthwestStairMap(s):!indoor&&s.district==='lumiose-zone16-garden'?zone16GardenMap(s):!indoor&&s.district==='lumiose-zone2-overlook'?zone2OverlookMap():!indoor&&s.district==='lumiose-bleu-cafe2'?mission22CafeWatersideMap():!indoor&&s.district==='lumiose-aymlis-park'?mission11AymlisMap(s):!indoor&&s.district==='lumiose-mission21-glide'?mission21GlideMap():!indoor&&s.district==='lumiose-jaune-sector8'?mission29Jaune8Map(s):!indoor&&s.district==='lumiose-mission32-courtyard'?mission32RoofMap(s):!indoor&&s.district==='lumiose-mission33-alley'?mission33AlleyMap(s):!indoor&&s.district==='lumiose-mission12-jaune3'?mission12Jaune3Map(s):!indoor&&s.district==='lumiose-magenta-sector1'?magentaSector1Map():!indoor&&s.district==='lumiose-magenta-sewer-bank'?magentaSewerBankMap():!indoor&&s.district==='lumiose-magenta-street'?magentaStreetMap():!indoor&&s.district==='lumiose-magenta-sector2'?magentaSector2Map():!indoor&&s.district==='lumiose-zone11-nw-ledge'?zone11NorthwestLedgeMap():!indoor&&s.district==='lumiose-magenta6-scaffold'?magenta6ScaffoldMap():!indoor&&s.district==='lumiose-magenta6-court-alley'?magenta6CourtAlleyMap():!indoor&&s.district==='lumiose-magenta3-gap'?magenta3LowerGapMap():!indoor&&s.district==='lumiose-zone7-west-roof'?zone7WestRoofMap():!indoor&&s.district==='lumiose-lune-roof'?galerieLuneRoofMap(s):!indoor&&s.district==='lumiose-rust-roof'?rustRoofMap():!indoor&&s.district==='lumiose-vert6-roof'?vert6RoofMap():!indoor&&s.district==='lumiose-jaune-street-north'?jauneStreetNorthMap():!indoor&&s.district==='lumiose-vert-sector4'?vertSector45Map(4,s):!indoor&&s.district==='lumiose-vert-sector5'?vertSector45Map(5,s):!indoor&&s.district==='lumiose-vert-sector8'?vertSector8Map():!indoor&&s.district==='lumiose-rouge-sector6'?(s.zaAcademyCourtyard===true?academyCourtyardMap(s):rougeSector6Map(s)):!indoor&&s.district==='lumiose-rouge-sector8'?rougeSector8Map():!indoor&&s.district==='lumiose-magenta-west-courtyard'?magentaWestCourtyardMap():!indoor&&s.district==='lumiose-rouge7-roof'?rouge7RoofMap():!indoor&&s.district==='lumiose-jaune7-roof'?jaune7RoofMap(s):!indoor&&s.district==='lumiose-aymlis-west-roof'?aymlisWestRoofMap():!indoor&&s.district==='lumiose-rouge-tower-interior'?rougeTowerInteriorMap():!indoor&&s.district==='lumiose-cafe-woof-roof'?cafeWoofRoofMap(s):!indoor&&s.district==='lumiose-bleu-sector4'?bleuSector4Map():!indoor&&s.district==='lumiose-bleu4-tunnel'?bleuSector4TunnelMap():!indoor&&s.district==='lumiose-mission34-roof'?mission34RoofMap(s):!indoor&&s.district==='lumiose-bleu-sector9'?bleuSector9Map():!indoor&&s.district==='lumiose-bleu-sector8'?bleuSector8Map():!indoor&&s.district==='lumiose-galerie-lune'?galerieLuneMap(s):!indoor&&s.district==='lumiose-ombrage-arcade'?ombrageArcadeMap(s):!indoor&&s.district==='lumiose-rouge-sector4'?rougeSector4Map():!indoor&&s.district==='lumiose-north-rouge-roof'?northRougeRoofMap():!indoor&&s.district==='lumiose-rouge-sector3-roof'?rougeSector3RoofMap(s):!indoor&&s.district==='lumiose-rouge-sector1'?rougeSector1Map(s):!indoor&&s.district==='lumiose-rouge-sector1-roof'?rougeSector1RoofMap(s):!indoor&&s.district==='lumiose-zone1-high-roof'?lumioseZone1HighRoofMap(s):!indoor&&s.district==='lumiose-vert-sector9'?lumioseVertSector9Map(s):!indoor&&s.district==='lumiose-zone1-courtyard'?lumioseZone1CourtyardMap():!indoor&&s.district==='lumiose-zone1-roof'?lumioseZone1RoofMap(s):!indoor&&s.district==='lumiose-mission27-roof'?mission27RoofMap(s):!indoor&&s.district==='lumiose-mission23-roof'?mission23RoofMap(s):!indoor&&s.district==='lumiose-mission22-tunnel'?mission22TunnelMap(s):!indoor&&s.district==='lumiose-magenta-sector6-roof'?magenta6RoofMap(s):!indoor&&s.district==='lumiose-mission16-roof'?mission16RoofMap(s):!indoor&&s.district==='lumiose-magenta-sector3-roof'?magenta3RoofMap(s):!indoor&&s.district==='lumiose-rouge-sector5'?rougeSector5Map():!indoor&&s.district==='lumiose-magenta-sector4-roof'?magentaSector4RoofMap(s):!indoor&&s.district==='lumiose-magenta-sector4'?magentaSector4Map(s):!indoor&&s.district==='lumiose-passage-palais'?passagePalaisMap():!indoor&&s.district==='lumiose-rouge-sector3'?rougeSector3Map():!indoor&&s.district==='lumiose-jaune-sector11'?jauneSector11Map():!indoor&&s.district==='lumiose-autumnal-approach'?autumnalApproachMap():!indoor&&s.district==='lumiose-magenta-sector9'?magentaSector9Map(s):!indoor&&s.district==='lumiose-magenta-sector3'?magentaSector3Map():!indoor&&s.district==='lumiose-magenta-sector6'?magentaSector6Map():!indoor&&s.district==='lumiose-hibernal-approach'?hibernalApproachMap():!indoor&&s.district==='lumiose-rouge-sector7'?rougeSector7Map():!indoor&&s.district==='lumiose-vert-sector7'?vertSector7Map():!indoor&&s.district==='lumiose-vert-sector1'?vertSector1Map(s):!indoor&&s.district==='lumiose-vert-sector3'?vertSector3Map():!indoor&&s.district==='lumiose-jaune-street'?jauneStreetMap():!indoor&&s.district==='lumiose-saison-canalside'?saisonCanalsideMap():!indoor&&['lumiose-jaune-sector2','lumiose-jaune-sector6','lumiose-jaune-sector7','lumiose-jaune-sector9','lumiose-jaune-sector10','lumiose-jaune-sector12'].includes(s.district)?jauneCanalSectorMap(s.district==='lumiose-jaune-sector2'?2:s.district==='lumiose-jaune-sector6'?6:s.district==='lumiose-jaune-sector7'?7:s.district==='lumiose-jaune-sector9'?9:s.district==='lumiose-jaune-sector10'?10:12,s):!indoor&&s.district==='lumiose-vert-sector6'?vertSector6Map(s):!indoor&&s.district==='lumiose-passage-felicite'?passageFeliciteMap():!indoor&&s.district==='lumiose-bleu-street'?bleuStreetMap():!indoor&&s.district==='lumiose-south-boulevard'?southBoulevardMap(s):!indoor&&s.district==='lumiose-bleu-sector7'?bleuSector7Map(s):!indoor&&s.district==='lumiose-zone5-drain'?zone5DrainMap(s):!indoor&&s.district==='lumiose-bleu3-sewer-approach'?bleuSewerApproachMap(s):!indoor&&s.district==='lumiose-bleu-sector3'?bleuSector3Map():!indoor&&s.district==='lumiose-bleu-sector5'?bleuSector5Map():!indoor&&s.district==='lumiose-coulant-route'?coulantRouteMap(s):!indoor&&['lumiose-estival-approach','lumiose-bleu6-approach'].includes(s.district)?espaceAdjacentRoadMap(s.district==='lumiose-estival-approach'?'estival':'bleu6'):!indoor&&s.district==='lumiose-espace-vide'?espaceVideMap(s):!indoor&&s.district==='lumiose-magenta-canal-route'?magentaCanalRouteMap():!indoor&&s.district==='lumiose-magenta-sector8-route'?magentaSector8RouteMap(s):!indoor&&s.district==='lumiose-vert-street-route'?vertStreetRouteMap(s):!indoor&&s.district==='lumiose-bleu-plaza-route'?bleuPlazaRouteMap(s):!indoor&&s.district==='lumiose-jaune-garden-route'?jauneGardenRouteMap():!indoor&&s.district==='lumiose-zone19'?zone19Map(s):!indoor&&s.district==='lumiose-zone18'?zone18Map(s):!indoor&&s.district==='lumiose-zone17'?zone17Map(s):!indoor&&s.district==='lumiose-zone16'?zone16Map(s):!indoor&&s.district==='lumiose-zone15'?zone15Map(s):!indoor&&s.district==='lumiose-zone14'?zone14Map(s):!indoor&&s.district==='lumiose-zone13'?zone13Map(s):!indoor&&s.district==='lumiose-zone12'?zone12Map(s):!indoor&&s.district==='lumiose-zone10'?zone10Map(s):!indoor&&s.district==='lumiose-zone9'?zone9Map(s):!indoor&&s.district==='lumiose-zone8'?zone8Map(s):!indoor&&s.district==='lumiose-zone7'?zone7Map(s):!indoor&&s.district==='lumiose-zone6'?zone6Map(s):!indoor&&s.district==='lumiose-zone11'?zone11Map(s):!indoor&&s.district==='lumiose-zone5'?zone5Map(s):!indoor&&s.district==='lumiose-zone20'?zone20Map(s):!indoor&&s.district==='lumiose-research-zone'?researchMap(s):!indoor&&s.district==='lumiose-protect'?protectMap(s):!indoor&&s.district==='lumiose-lysandre-lab'?lysandreLabMap(s):!indoor&&s.district==='lumiose-crystal-sewer'?lumioseCrystalSewerMap(s):!indoor&&s.district==='lumiose-ghost-house'?lumioseGhostHouseMap():!indoor&&s.district==='lumiose-rust'?lumioseRustMap():!indoor&&s.district==='lumiose-sewer'?lumioseSewerMap(s):indoor==='rustOffice'&&s.district==='lumiose-rust'?rustOfficeMap():indoor==='justiceDojo'&&s.district==='lumiose-jaune-sector2'?justiceDojoMap():indoor==='richissimeLobby'&&s.district==='lumiose-centrico-route'?richissimeLobbyMap():indoor==='richissimeHall'&&s.district==='lumiose-centrico-route'?richissimeHallMap():indoor==='quasarticoOffice'&&s.district==='lumiose-quasartico'?quasarticoOfficeMap():indoor==='sushi'&&s.district==='lumiose-rouge-north'?sushiRestaurantMap():indoor==='canariQuiz'&&s.district==='lumiose-magenta-canal-route'?canariQuizMap():indoor==='cafeGallant'&&s.district==='lumiose-magenta-sector1'?cafeGallantMap():indoor==='racineGarage'&&s.district==='lumiose-vert-sector6'?racineGarageMap():indoor==='racineRoom'&&s.district==='lumiose-vert-sector6'?racineCanariRoomMap():indoor==='lysandreCafe'&&['lumiose-magenta-sector2','lumiose-magenta-sector4'].includes(s.district)?lysandreCafeMap():indoor==='lumioseLab'&&s.district==='lumiose-floral'?lumioseResearchLobbyMap():indoor==='lumioseDirector'&&s.district==='lumiose-floral'?lumioseDirectorOfficeMap():indoor==='lumioseLab2'&&s.district==='lumiose-floral'?lumioseResearchSecondMap(s):indoor==='hotel'&&s.district==='lumiose'?hotelMap():indoor==='hotel2f'&&s.district==='lumiose'?hotelSecondFloorMap():indoor==='hotel202'&&s.district==='lumiose'?hotelRoom202Map():indoor==='hotelRoof'&&s.district==='lumiose'?hotelRoofMap(s):s.district==='lumiose'?lumioseMap(s):s.district==='lumiose-floral'?lumioseFloralMap():s.district==='lumiose-vernal'?lumioseVernalMap(s):s.district==='lumiose-vert-plaza'?lumioseVertPlazaMap():s.district==='lumiose-vert2'?lumioseVert2Map(s):s.district==='lumiose-centrico-route'?lumioseCentricoRouteMap(s):s.district==='lumiose-rouge-north'?lumioseRougeNorthMap(s):s.district==='lumiose-north-boulevard'?lumioseNorthBoulevardMap(s):s.district==='lumiose-quasartico'?lumioseQuasarticoMap(s):s.district==='lumiose-rooftop'?lumioseRooftopMap(s):s.district==='lumiose-zone1'?lumioseZone1Map(s):s.district==='lumiose-zone2'?lumioseZone2Map(s):s.district==='lumiose-zone3'?(s.zaZone3TowerUpper?lumioseZone3TowerMap(s):lumioseZone3Map(s)):s.district==='lumiose-zone4'?lumioseZone4Map(s):s.district==='lumiose-bureau'?lumioseBureauMap():s.district==='lumiose-garden'?lumioseGardenMap():s.district==='lumiose-site'?lumioseSiteMap(s):s.district==='lumiose-wild'?lumioseWildMap(s):s.district==='lumiose-royale'?lumioseRoyaleMap(s):lumioseObservationMap();
    // Recover an old roof position covered by the newly represented closed web.
    if(!indoor&&s.district==='lumiose-jaune7-roof'&&p.revision===revision&&p.x===10&&p.y===8&&map[8][10]==='r')p={...p,x:9};
    // Earlier drafts placed the Sector 3 connector on the north side of Zone 7.
    if(!indoor&&p.revision===revision&&s.district==='lumiose-zone7'&&p.x===17&&p.y===0)p={...p,y:1};
    if(!indoor&&p.revision===revision&&s.district==='lumiose-magenta-sector3'&&p.x===12&&p.y===16)p={...p,y:15};
    // Ground saves from the temporary roof-alpha layout may occupy the restored alley alpha.
    // Earlier plaza drafts had no buildings; preserve valid legacy positions when a footprint now occupies them.
    if(s.district==='lumiose-vert-plaza'&&!indoor&&p.vertPlazaLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&map[p.y]?.[p.x]==='%'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve old open-office saves only when their matching revision now lands on the draft building or wall.
    if(s.district==='lumiose-rust'&&!indoor&&p.rustLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Only prior-layout saves in the new northern building are moved.
    if(s.district==='lumiose-rust'&&!indoor&&p.revision===revision&&(p.rustLayout==null||p.rustLayout<2)&&RUST_NORTH_BUILDING.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve matching earlier courtyard saves under draft statues or bamboo.
    if(s.district==='lumiose-rust'&&!indoor&&p.revision===revision&&(p.rustLayout==null||p.rustLayout<3)&&[...RUST_COURTYARD_STATUES,...RUST_COURTYARD_BAMBOO].some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Relocate only positions valid in the former open sewer, and only at the matching save revision.
    if(s.district==='lumiose-sewer'&&!indoor&&p.sewerLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone18'&&s.zaZone18Upper!==true&&!indoor&&p.revision===revision&&p.x===12&&p.y===5&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Old cemetery saves can occupy the newly represented south crypt.
    if(s.district==='lumiose-zone4'&&!indoor&&p.revision===revision&&p.x>=14&&p.x<=17&&p.y>=12&&p.y<=13&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Recover legacy cemetery saves that now overlap a draft grave.
    if(s.district==='lumiose-zone4'&&!indoor&&p.revision===revision&&(p.zone4Layout==null||p.zone4Layout<2)&&ZONE4_GRAVES.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='%'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Matching old saves overlapping the western water branch return to the bank.
    if(s.district==='lumiose-zone11'&&!indoor&&p.revision===revision&&p.zone11Layout==null&&ZONE11_WEST_FORK.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Keep old Zone 20 positions when the draft water replaces walkable tiles.
    if(s.district==='lumiose-zone20'&&!indoor&&p.zone20Layout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Recover matching pre-pond saves from the new southeast water.
    if(s.district==='lumiose-zone20'&&!indoor&&p.revision===revision&&(p.zone20Layout==null||p.zone20Layout<2)&&ZONE20_SOUTHEAST_WATER.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve older ground saves occupied by the new draft café footprint.
    if(s.district==='lumiose-zone6'&&!indoor&&zone6Layer(s)==='ground'&&p.zone6CafeLayout==null&&p.revision===revision&&ZONE6_CAFE_FOOTPRINT.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone6'&&!indoor&&zone6Layer(s)==='ground'&&p.zone6MarketLayout==null&&p.revision===revision&&ZONE6_MARKET_STALLS.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Recover older ground saves that overlap new Zone 18 scaffold supports.
    if(s.district==='lumiose-zone18'&&!indoor&&s.zaZone18Upper!==true&&p.zone18ScaffoldLayout==null&&p.revision===revision&&ZONE18_SCAFFOLD.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Recover matching old Zone 20 positions occupied by new draft structures.
    if(s.district==='lumiose-zone20'&&!indoor&&p.revision===revision&&(p.zone20Layout==null||p.zone20Layout<3)&&[...ZONE20_CONTAINERS,...ZONE20_ROCKS].some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Relocate old positions inside the provisional central tower supports.
    if(s.district==='lumiose-zone20'&&!indoor&&p.revision===revision&&(p.zone20Layout==null||p.zone20Layout<4)&&ZONE20_RUIN_SUPPORTS.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone20'&&!indoor&&p.revision===revision&&(p.zone20Layout==null||p.zone20Layout<5)&&ZONE20_NORTHEAST_STREAM.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Earlier Zone 14 drafts had open land where the rock enclosure now stands.
    if(s.district==='lumiose-zone14'&&!indoor&&p.zone14Layout==null&&p.revision===revision&&p.x>=16&&p.x<=20&&p.y>=7&&p.y<=13)p={...p,x:15,y:12};
    // Move matching older saves only when a new substation equipment footprint occupies their tile.
    if(s.district==='lumiose-zone14'&&!indoor&&p.revision===revision&&(p.zone14Layout==null||p.zone14Layout<2)&&ZONE14_EQUIPMENT.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Relocate only matching old upper-bank saves on the extended canal water.
    if(s.district==='lumiose-coulant-route'&&!indoor&&s.zaCoulantLower!==true&&p.coulantWaterLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Earlier Zone 12 drafts had walkable land where the southwestern pond is now.
    if(s.district==='lumiose-zone12'&&!indoor&&p.zone12Layout==null&&p.revision===revision&&p.x>=4&&p.x<=7&&p.y>=12&&p.y<=13)p={...p,x:8,y:13};
    // Relocate older positions from the new gated island to the accessible bank.
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<4)&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=19&&p.x<=21&&p.y>=10&&p.y<=13)p={...p,x:18,y:12};
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<5)&&p.x===14&&p.y>=9&&p.y<=11&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<6)&&ZONE2_EAST_SHORE_WATER.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Relocate only pre-v7 saves and Budew positions that the new water covers.
    // Matching older positions on the new north shore and the field Budew
    // relocate without losing its other state.
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<8)){
      if(ZONE2_NORTH_SHORE_WATER.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
      const b=s.zaZone2Budew;if(b&&b.escaped!==true&&ZONE2_NORTH_SHORE_WATER.some(([x,y])=>b.x===x&&b.y===y)&&!walkable(map[b.y]?.[b.x])){const safe=nearestWalkableLand(map,b.x,b.y);if(safe)s.zaZone2Budew={...b,x:safe.x,y:safe.y};}
    }
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&(p.zone2Layout==null||p.zone2Layout<7)){
      if(ZONE2_NORTHEAST_WATER.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
      const b=s.zaZone2Budew;if(b&&b.escaped!==true&&ZONE2_NORTHEAST_WATER.some(([x,y])=>b.x===x&&b.y===y)&&!walkable(map[b.y]?.[b.x])){const safe=nearestWalkableLand(map,b.x,b.y);if(safe)s.zaZone2Budew={...b,x:safe.x,y:safe.y};}
    }
    // Layout 2's southern bridge could be occupied when this shoreline changed.
    const wasOldZone2Tile=p.zone2Layout===2?(p.x===11&&p.y>=9&&p.y<=12)||(p.x>=19&&p.x<=21&&p.y>=10&&p.y<=13):p.zone2Layout===3?(p.x>=19&&p.x<=21&&p.y>=10&&p.y<=13):p.zone2Layout==null&&legacyZone2Walkable(p.x,p.y);
    if(s.district==='lumiose-zone2'&&!indoor&&p.revision===revision&&wasOldZone2Tile&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve old Zone 1 saves that occupied the new pond.
    if(s.district==='lumiose-zone1'&&!indoor&&p.zone1Layout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone1'&&!indoor&&p.zone1ShopsLayout==null&&p.revision===revision&&ZONE1_STREET_SHOPS.some(([x,y])=>p.x===x&&p.y===y)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Restore former ground floor positions now covered by drafted roof-supporting buildings.
    const oldZone5Building=(p.y>=1&&p.y<=3)&&((p.x>=2&&p.x<=4)||(p.x>=8&&p.x<=9));
    const oldZone9Building=((p.x>=2&&p.x<=4&&p.y>=2&&p.y<=4)||(p.x>=17&&p.x<=20&&p.y>=2&&p.y<=4)||(p.x>=2&&p.x<=4&&p.y>=11&&p.y<=13));
    if(!indoor&&p.groundBuildingsLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&((s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&oldZone5Building)||(s.district==='lumiose-zone9'&&s.zaZone9Upper!==true&&oldZone9Building))&&map[p.y]?.[p.x]==='#'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Only former lower-roof floor newly in the draft roof gap is relocated.
    if(s.district==='lumiose-zone1-roof'&&!indoor&&p.zone1RoofLayout==null&&p.revision===revision&&p.x===14&&[4,5,6,9].includes(p.y)&&map[p.y]?.[p.x]==='#'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Only same-revision ground saves on the former canal edges are relocated.
    if(s.district==='lumiose-zone10'&&!indoor&&s.zaZone10Upper!==true&&p.zone10CanalLayout==null&&p.revision===revision&&p.y>=8&&p.y<=12&&[1,2,20,21].includes(p.x)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Keep older Zone 10 rooftop positions that now overlap provisional benches.
    if(s.district==='lumiose-zone10'&&!indoor&&s.zaZone10Upper===true&&p.revision===revision&&p.y===3&&(p.x===17||p.x===19)&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Only matching older ground saves overlapping the draft stalls move to nearby land.
    if(s.district==='lumiose-zone16'&&!indoor&&s.zaZone16Upper!==true&&(p.zone16Layout==null||p.zone16Layout<3)&&p.revision===revision&&ZONE16_STALLS.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='^'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Relocate only old floor or crossing positions now covered by the water ring.
    if(s.district==='lumiose-zone16'&&!indoor&&(p.zone16Layout==null||p.zone16Layout<2)&&p.revision===revision&&[[11,4],[11,12],[6,8],[14,5],[14,11]].some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Matching old positions inside the new woodland obstacles move to nearby land.
    if(s.district==='lumiose-zone13'&&!indoor&&p.zone13Layout==null&&p.revision===revision&&ZONE13_TREES.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='^'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Former floor beneath the two draft stalls is relocated only for matching saves.
    if(s.district==='lumiose-zone8'&&!indoor&&p.zone8Layout==null&&p.revision===revision&&ZONE8_STALLS.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='^'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Zone 16's central monument becomes solid when its Froakie has left.
    // Only former street floor now covered by the Sector 9 waterway is relocated.
    if(s.district==='lumiose-vert-sector9'&&!indoor&&p.vert9Layout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=11&&p.y<=12&&(p.x<10||p.x>12)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Former roof tiles now lie in the gap between buildings. Keep old saves on the same level.
    if(!indoor&&p.splitRoofLayout==null&&p.revision===revision&&p.x===11&&((s.district==='lumiose-zone17'&&s.zaZone17Upper===true&&[4,5,6,9,10,11].includes(p.y))||(s.district==='lumiose-zone18'&&s.zaZone18Upper===true&&[4,5,6,7,10,11].includes(p.y)))&&map[p.y]?.[p.x]==='#'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Old ground saves can overlap the new southern park furniture.
    if(s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&!indoor&&p.zone17Layout==null&&p.revision===revision&&[[4,14],[6,14],[16,14],[18,14],[19,13]].some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='^'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Previous Bleu Plaza floor is now a rounded water-ring corner.
    if(s.district==='lumiose-zone16'&&!indoor&&p.zone16Layout==null&&p.revision===revision&&[[15,5],[7,11],[15,11]].some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone16'&&!indoor&&p.revision===revision&&s.zaZone16Spent?.froakie&&p.x===11&&p.y===8&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // The roost becomes the solid monument again after its alpha is defeated.
    // Old plaza floor can now be occupied by the canal; do not relocate mismatched revisions.
    if(s.district==='lumiose-zone7'&&!indoor&&p.zone7Layout==null&&p.revision===revision&&[[1,5],[2,5],[1,6],[2,6],[20,10],[21,10],[20,11],[21,11]].some(([x,y])=>p.x===x&&p.y===y)){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone7'&&!indoor&&p.revision===revision&&s.zaZone7AlphaSpent&&p.x===11&&p.y===8&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // The provisional fountain replaces a formerly walkable Zone 7 tile.
    if(s.district==='lumiose-zone7'&&!indoor&&p.revision===revision&&p.x===19&&p.y===5&&!walkable(map[p.y]?.[p.x])){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve positions from the former isolated canal edge on the nearest bank.
    // Former canal-side pavement may now contain a building; reject stale revisions as before.
    if(['lumiose-magenta-canal-route','lumiose-saison-canalside'].includes(s.district)&&!indoor&&p.canalBuildingsLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&map[p.y]?.[p.x]==='%'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-magenta-canal-route'&&!indoor&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=14&&p.x<=21&&p.y>=1&&p.y<=5&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Older court saves may overlap the new rocks or the enclosed TM.
    if(s.district==='lumiose-zone12'&&!indoor&&p.revision===revision&&(p.zone12Layout==null||p.zone12Layout<2)&&((p.x===5&&p.y>=4&&p.y<=6)||(p.y===5&&(p.x===4||p.x===6))))p={...p,x:7,y:6};
    // Old Zone 3 saves can stand on a newly placed fence: move to adjacent walkable ground.
    // Only previously walkable garden-perimeter and cemetery-wall positions are migrated.
    if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&!indoor&&(p.zone3Layout==null||p.zone3Layout<4)&&p.revision===revision&&ZONE3_OUTER_FENCE.some(([x,y])=>p.x===x&&p.y===y)&&map[p.y]?.[p.x]==='|'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone4'&&!indoor&&p.zone4Layout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&map[p.y]?.[p.x]==='|'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&!indoor&&p.zone3Layout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&map[p.y]?.[p.x]==='|'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&!indoor&&p.revision===revision&&(p.zone3Layout==null||p.zone3Layout<2)&&p.x===0&&p.y===8)p={...p,x:1};
    if(s.district==='lumiose-rouge-north'&&!indoor&&p.revision===revision&&p.rougeNorthLayout==null&&p.x>=18&&p.x<=20&&p.y>=1&&p.y<=3){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve old Vernal saves that occupied tiles now used for the waterside.
    if(s.district==='lumiose-vernal'&&!indoor&&p.vernalLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=18&&p.x<=21&&p.y>=5&&p.y<=6){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Preserve positions on floor that became the new canal, only for the matching save revision.
    if(s.district==='lumiose-centrico-route'&&!indoor&&p.centricoCanalLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.y>=11&&p.y<=13&&([7,8,9,13,14,15].includes(p.x))&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Version 2 extends the channel to screen edges; migrate former floor only.
    if(s.district==='lumiose-centrico-route'&&!indoor&&(p.centricoCanalLayout==null||p.centricoCanalLayout<2)&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.y>=11&&p.y<=13&&[2,3,5,6,16,18,20,21].includes(p.x)&&map[p.y]?.[p.x]==='~'){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    // Old Centrico-route saves can stand on the newly represented tower footprint.
    if(s.district==='lumiose-centrico-route'&&!indoor&&p.centricoLayout==null&&p.revision===revision&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=10&&p.x<=12&&p.y>=11&&p.y<=13){const safe=nearestWalkableLand(map,p.x,p.y);if(safe)p={...p,x:safe.x,y:safe.y};}
    if(p.revision!==revision||s.area!==3||s.expedition||s.interior||s.x!==5||s.y!==9||(indoor&&!((HOTEL_INTERIORS.includes(indoor)&&s.district==='lumiose')||(['lumioseLab','lumioseDirector','lumioseLab2'].includes(indoor)&&s.district==='lumiose-floral')||(indoor==='canariQuiz'&&s.district==='lumiose-magenta-canal-route')||(indoor==='cafeGallant'&&s.district==='lumiose-magenta-sector1')||(['racineGarage','racineRoom','leNah'].includes(indoor)&&s.district==='lumiose-vert-sector6')||(indoor==='lysandreCafe'&&['lumiose-magenta-sector2','lumiose-magenta-sector4'].includes(s.district))||(['museum1','museum2'].includes(indoor)&&s.district==='lumiose-museum-front')||(indoor==='leWow'&&s.district==='lumiose-rouge-sector2')||(indoor==='sushi'&&s.district==='lumiose-rouge-north')||(indoor==='rustOffice'&&s.district==='lumiose-rust')||(indoor==='justiceDojo'&&s.district==='lumiose-jaune-sector2')||(['richissimeLobby','richissimeHall'].includes(indoor)&&s.district==='lumiose-centrico-route')||(indoor==='quasarticoOffice'&&s.district==='lumiose-quasartico')))||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(map[p.y]?.[p.x])){if(s.district==='lumiose-sewer')delete s.zaSewerIceBranch;if(s.district==='lumiose-vert-sector1')delete s.zaVertSaisonBank;if(s.district==='lumiose-rouge-north')delete s.zaRougeStreetSouth;s.district=null;delete s.districtPosition;delete s.districtReturnRegion;return s;}
    s.districtReturnRegion=s.regionId??1;s.regionId=6;s.interior=indoor;s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
  }
  if(s?.interior!=='lab'||!s.interiorPosition)return s; // original development saves
  const p=s.interiorPosition;
  if(p.revision!==revision||s.area!==0||s.expedition||s.x!==18||s.y!==5||!Number.isInteger(p.x)||!Number.isInteger(p.y)||!walkable(labMap()[p.y]?.[p.x])){
    s.interior=null;delete s.interiorPosition;return s;
  }
  s.x=p.x;s.y=p.y;s.facing=Object.hasOwn(DIRECTIONS,p.facing)?p.facing:'down';return s;
}
export function walkable(tile){return !!tile&&!['#','~','^','r','c','%','|','1','2','3','4','5'].includes(tile);}
// A representative Budew near Zone 2's south gate. Distances and timing are provisional.
export function zone2BudewPosition(s){
 if(!s||s.district!=='lumiose-zone2'||s.interior)return null;
 const p=s.zaZone2Budew;if(p?.escaped===true)return null;
 if(p!=null){if(!Number.isInteger(p.x)||!Number.isInteger(p.y)||p.x<1||p.x>21||p.y<1||p.y>15||!walkable(lumioseZone2Map(s)[p.y]?.[p.x]))return null;return {x:p.x,y:p.y,alert:Number.isInteger(p.alert)?Math.max(0,Math.min(3,p.alert)):0};}
 return {x:9,y:14,alert:0};
}
export function zone2BudewTarget(s){const p=zone2BudewPosition(s);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;const map=lumioseZone2Map(s),queue=[{x:s.x,y:s.y,distance:0}],visited=new Set([`${s.x},${s.y}`]);for(let i=0;i<queue.length;i++){const q=queue[i];if(q.distance>0&&q.x===p.x&&q.y===p.y)return {...p,distance:q.distance};if(q.distance>=3)continue;for(const [dx,dy]of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,tile=map[y]?.[x],key=`${x},${y}`;if(!walkable(tile)||'EWX'.includes(tile)||visited.has(key))continue;visited.add(key);queue.push({x,y,distance:q.distance+1});}}return null;}
export function stepZone2Budew(s){
 const p=zone2BudewPosition(s);if(!p||Math.abs(p.x-s.x)+Math.abs(p.y-s.y)>1)return false;
 const alert=p.alert+1,map=lumioseZone2Map(s),distance=(x,y)=>Math.abs(x-s.x)+Math.abs(y-s.y);
 const candidates=[[p.x-1,p.y],[p.x,p.y-1],[p.x+1,p.y],[p.x,p.y+1]].filter(([x,y])=>x>0&&x<22&&y>0&&y<16&&walkable(map[y]?.[x])&&distance(x,y)>distance(p.x,p.y));
 candidates.sort((a,b)=>distance(b[0],b[1])-distance(a[0],a[1]));
 if(alert>=3||!candidates.length)s.zaZone2Budew={...p,alert,escaped:true};else s.zaZone2Budew={x:candidates[0][0],y:candidates[0][1],alert};return true;
}
// Kakuna hangs from a perimeter tree; the precise tree and throwing range are provisional.
export function zone2KakunaPosition(s){return s?.district==='lumiose-zone2'&&!s.interior&&!s.zaZone2KakunaSpent?{x:0,y:4}:null;}
export function zone2KakunaTarget(s){
 const p=zone2KakunaPosition(s);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone2Map(s),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);
 for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===1&&q.y===p.y)return {...p,distance:q.distance+1};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,tile=map[y]?.[x],key=`${x},${y}`;if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}
 return null;
}
// Positions and levels are provisional, while habitats and night-only Staryu follow the area guides.
export const ZONE2_FIELD_SPECIES=Object.freeze([
 {id:'patrat',speciesId:504,name:'보르쥐',x:11,y:8,level:6,water:false,reaction:'roam',contactBattle:true},
 {id:'patrat2',speciesId:504,name:'보르쥐',x:10,y:7,level:6,water:false,reaction:'roam',contactBattle:true},
 {id:'binacle',speciesId:688,name:'거북손손',x:13,y:9,level:6,water:false},
 {id:'magikarp',speciesId:129,name:'잉어킹',x:7,y:10,level:6,water:true,reaction:'bridgeJump'},
 {id:'staryu',speciesId:120,name:'별가사리',x:8,y:8,level:6,water:true,nightOnly:true,reaction:'waterRoam'},
]);
export function zone2FieldMonsters(s,period,map){
 if(!s||s.district!=='lumiose-zone2'||s.interior)return [];
 let zoneMap=map;return ZONE2_FIELD_SPECIES.filter(p=>!(s.zaZone2FieldSpent&&s.zaZone2FieldSpent[p.id]===true)&&(!p.nightOnly||period==='night')).map(p=>{const v=s.zaZone2FieldPositions?.[p.id];if(!Number.isInteger(v?.x)||!Number.isInteger(v?.y))return p;const tile=(zoneMap??=lumioseZone2Map(s))[v.y]?.[v.x],near=Math.abs(v.x-p.x)+Math.abs(v.y-p.y)<=3;if(p.reaction==='bridgeJump'&&Number.isInteger(v.ttl)&&v.ttl>0&&tile==='=')return {...p,x:v.x,y:v.y,water:false};if(near&&((p.reaction==='roam'&&tile==='g')||(p.reaction==='waterRoam'&&tile==='~')))return {...p,x:v.x,y:v.y};return p;});
}
// A bridge-side reaction is advanced by authoritative player movement and stored for reload.
export function stepZone2Field(s,period){
 if(s?.district!=='lumiose-zone2'||s.interior)return false;
 const map=lumioseZone2Map(s),positions={...(s.zaZone2FieldPositions||{})};let jumped=false,changed=false;
 for(const p of zone2FieldMonsters(s,period,map)){
  if((p.reaction==='roam'||p.reaction==='waterRoam')&&((s.steps||0)+1)%4===0){
   const base=ZONE2_FIELD_SPECIES.find(q=>q.id===p.id),candidates=[[p.x+1,p.y],[p.x,p.y+1],[p.x-1,p.y],[p.x,p.y-1]].filter(([x,y])=>Math.abs(x-base.x)+Math.abs(y-base.y)<=3&&(x!==s.x||y!==s.y)&&((p.reaction==='roam'&&map[y]?.[x]==='g')||(p.reaction==='waterRoam'&&map[y]?.[x]==='~'))&&!zone2FieldMonsters({...s,zaZone2FieldPositions:positions},period,map).some(q=>q.id!==p.id&&q.x===x&&q.y===y));
   if(candidates.length){const i=Math.floor(((s.steps||0)+1)/4)%candidates.length;positions[p.id]={x:candidates[i][0],y:candidates[i][1]};changed=true;}continue;
  }
  if(p.reaction!=='bridgeJump')continue;
  const v=positions[p.id];if(v?.ttl>0){if(v.ttl<=1)delete positions[p.id];else positions[p.id]={...v,ttl:v.ttl-1};changed=true;continue;}
  if(map[s.y]?.[s.x]!=='='||Math.abs(s.x-p.x)+Math.abs(s.y-p.y)>2)continue;
  const cells=map.flatMap((row,y)=>[...row].flatMap((tile,x)=>tile==='='&&(x!==s.x||y!==s.y)?[[x,y]]:[]));
  cells.sort((a,b)=>(Math.abs(a[0]-p.x)+Math.abs(a[1]-p.y))-(Math.abs(b[0]-p.x)+Math.abs(b[1]-p.y)));
  if(cells.length){positions[p.id]={x:cells[0][0],y:cells[0][1],ttl:3};changed=true;jumped=true;}
 }
 if(changed)s.zaZone2FieldPositions=positions;return jumped;
}
export function zone2FieldContact(s,period){return zone2FieldMonsters(s,period).find(p=>p.contactBattle&&p.x===s.x&&p.y===s.y)||null;}
export function zone2FieldTarget(s,period,id){
 const p=zone2FieldMonsters(s,period).find(m=>m.id===id);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone2Map(s),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);
 for(let i=0;i<queue.length;i++){const q=queue[i],d=Math.abs(q.x-p.x)+Math.abs(q.y-p.y);if((p.water&&d===1)||(!p.water&&d===0))return {...p,distance:q.distance+(p.water?1:0)};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,tile=map[y]?.[x],key=`${x},${y}`;if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}
 return null;
}
// Provisional individual positions within the documented four Rouge gardens.
export const ZONE3_FIELD_SPECIES=Object.freeze([
 {id:'litleo',speciesId:667,name:'사자코',x:8,y:5,level:7,reaction:'contact'},
 {id:'pancham',speciesId:674,name:'판짱',x:7,y:6,level:7,reaction:'contact'},
 {id:'espurr',speciesId:677,name:'냐스퍼',x:15,y:6,level:7,reaction:'flee'},
 {id:'skiddo',speciesId:672,name:'메이클',x:8,y:10,level:7,reaction:'contact'},
 {id:'pikachu',speciesId:25,name:'피카츄',x:15,y:10,level:7,reaction:'contact'},
 {id:'flabebe',speciesId:669,name:'플라베베',x:11,y:8,level:7,reaction:'calm',dayOnly:true},
]);
export function zone3FieldMonsters(s,period){
 if(!s||s.district!=='lumiose-zone3'||s.interior||s.zaZone3TowerUpper||joseeRequired(s))return [];
 const map=lumioseZone3Map();return ZONE3_FIELD_SPECIES.filter(p=>s.zaZone3FieldSpent?.[p.id]!==true&&(!p.dayOnly||period==='day')).map(p=>{const v=s.zaZone3FieldPositions?.[p.id];return p.reaction==='flee'&&Number.isInteger(v?.x)&&Number.isInteger(v?.y)&&map[v.y]?.[v.x]==='g'&&v.x>=13&&v.y<=8?{...p,x:v.x,y:v.y,alert:Number.isInteger(v.alert)?v.alert:0}:{...p,alert:0};});
}
export function zone3FieldTarget(s,period,id){
 const p=zone3FieldMonsters(s,period).find(m=>m.id===id);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseZone3Map(),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===p.x&&q.y===p.y)return {...p,distance:q.distance};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,key=`${x},${y}`,tile=map[y]?.[x];if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}return null;
}
export function zone3FieldContact(s,period){return zone3FieldMonsters(s,period).find(p=>p.reaction==='contact'&&p.x===s.x&&p.y===s.y)||null;}
export function stepZone3Field(s,period){
 const p=zone3FieldMonsters(s,period).find(m=>m.reaction==='flee');if(!p||Math.abs(s.x-p.x)+Math.abs(s.y-p.y)>1)return false;
 const map=lumioseZone3Map(),distance=(x,y)=>Math.abs(x-s.x)+Math.abs(y-s.y),candidates=[[p.x-1,p.y],[p.x,p.y-1],[p.x+1,p.y],[p.x,p.y+1]].filter(([x,y])=>x>=13&&x<=16&&y>=4&&y<=8&&map[y]?.[x]==='g'&&distance(x,y)>distance(p.x,p.y));
 const alert=p.alert+1;if(alert>=2||!candidates.length)s.zaZone3FieldSpent={...(s.zaZone3FieldSpent||{}),[p.id]:true};else{s.zaZone3FieldPositions={...(s.zaZone3FieldPositions||{}),[p.id]:{x:candidates[0][0],y:candidates[0][1],alert}};}return true;
}
// Magenta sewer species are documented, but positions and roaming bounds are drafts.
export const MAGENTA_SEWER_FIELD=Object.freeze([
 {id:'ariados',speciesId:168,name:'아리아도스',x:4,y:5,level:38},
 {id:'inkay',speciesId:686,name:'오케이징',x:18,y:5,level:35},
 {id:'skrelp',speciesId:690,name:'수레기',x:4,y:11,level:34},
 {id:'noibat',speciesId:714,name:'음뱃',x:18,y:11,level:34,nightOnly:true},
]);
export function magentaSewerMonsters(s,period,map){
 if(!s||s.district!=='lumiose-crystal-sewer'||s.interior)return [];
 map??=lumioseCrystalSewerMap(s);return MAGENTA_SEWER_FIELD.filter(p=>s.zaMagentaSewerSpent?.[p.id]!==true&&(!p.nightOnly||period==='night')).map(p=>{const v=s.zaMagentaSewerPositions?.[p.id];return Number.isInteger(v?.x)&&Number.isInteger(v?.y)&&Math.abs(v.x-p.x)+Math.abs(v.y-p.y)<=3&&['.','g'].includes(map[v.y]?.[v.x])?{...p,x:v.x,y:v.y}:p;});
}
export function magentaSewerTarget(s,period,id){
 const p=magentaSewerMonsters(s,period).find(m=>m.id===id);if(!p||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=lumioseCrystalSewerMap(s),queue=[{x:s.x,y:s.y,distance:0}],seen=new Set([`${s.x},${s.y}`]);for(let i=0;i<queue.length;i++){const q=queue[i];if(q.x===p.x&&q.y===p.y)return {...p,distance:q.distance};if(q.distance>=2)continue;for(const [dx,dy] of Object.values(DIRECTIONS)){const x=q.x+dx,y=q.y+dy,key=`${x},${y}`,tile=map[y]?.[x];if(!walkable(tile)||'EWX'.includes(tile)||seen.has(key))continue;seen.add(key);queue.push({x,y,distance:q.distance+1});}}return null;
}
export function magentaSewerContact(s,period){return magentaSewerMonsters(s,period).find(p=>p.x===s.x&&p.y===s.y)||null;}
export function stepMagentaSewerMonsters(s,period){
 if(s?.district!=='lumiose-crystal-sewer'||s.interior||((s.steps||0)+1)%4!==0)return;
 const map=lumioseCrystalSewerMap(s),positions={...(s.zaMagentaSewerPositions||{})};let changed=false;
 for(const p of magentaSewerMonsters(s,period,map)){
  const home=MAGENTA_SEWER_FIELD.find(q=>q.id===p.id),occupied=magentaSewerMonsters({...s,zaMagentaSewerPositions:positions},period,map),candidates=[[p.x+1,p.y],[p.x,p.y+1],[p.x-1,p.y],[p.x,p.y-1]].filter(([x,y])=>Math.abs(x-home.x)+Math.abs(y-home.y)<=3&&(x!==s.x||y!==s.y)&&['.','g'].includes(map[y]?.[x])&&!occupied.some(q=>q.id!==p.id&&q.x===x&&q.y===y));
  if(candidates.length){const index=Math.floor(((s.steps||0)+1)/4)%candidates.length;positions[p.id]={x:candidates[index][0],y:candidates[index][1]};changed=true;}
 }
 if(changed)s.zaMagentaSewerPositions=positions;
}
export function findTile(map,tile){for(let y=0;y<map.length;y++){const x=map[y].indexOf(tile);if(x>=0)return {x,y};}return null;}
export function normalizeField(s){
  if(!s||s.mapVersion===MAP_VERSION)return s;
  const old=areaMap(s.expedition?0:s.area),tile=old[s.y]?.[s.x],map=fieldMap(s);
  let target=['H','M','G','N'].includes(tile)?findTile(map,tile):null;
  if(s.area===9&&['L','C'].includes(tile))target={x:[8,11,14,17,20][Math.max(0,[4,6,8,10,12].indexOf(s.x))],y:4};
  const x=Math.max(1,Math.min(21,Math.round((Number(s.x)||3)*22/14))),y=Math.max(1,Math.min(15,Math.round((Number(s.y)||5)*16/10)));
  if(!target)target=walkable(map[y]?.[x])?{x,y}:{x:3,y:8};
  Object.assign(s,target,{mapVersion:MAP_VERSION,facing:'down'});return s;
}
// One explicitly marked provisional roof-to-roof landing; never infer paths over walls.
export function rotoGlideLanding(s){if(!s||s.interior||!Number.isSafeInteger(s.zaMission15Stage)||s.zaMission15Stage<2)return null;const map=fieldMap(s);
 if(s.district==='lumiose-mission21-glide'&&s.y===6){if(s.x===9)return {x:13,y:6,facing:'right'};if(s.x===13)return {x:9,y:6,facing:'left'};return null;}
 if(s.district==='lumiose-mission32-courtyard'&&s.zaMission32Layer==='high'&&s.y===6){if(s.x===11)return {x:15,y:6,facing:'right'};if(s.x===15)return {x:11,y:6,facing:'left'};return null;}
 // Vert Sector 2 has a documented roof gap. Coordinates are draft.
 // https://allthings.how/find-larvitar-and-evolve-it-to-tyranitar-in-pokemon-legends-z-a/
 if(s.district==='lumiose-vert2'&&s.zaVert2RoofUpper===true&&s.y===8){if(s.x===9&&[10,11,12].every(x=>map[8]?.[x]==='#')&&walkable(map[8]?.[13]))return {x:13,y:8,facing:'right'};if(s.x===13&&[10,11,12].every(x=>map[8]?.[x]==='#')&&walkable(map[8]?.[9]))return {x:9,y:8,facing:'left'};return null;}
 // Rouge Sector 7 has a documented glide from its court-side roof to another roof.
 // The glass dome is separated from the gallery rooftop.
 if(s.district==='lumiose-lune-roof'&&s.x===17){if(s.y===4&&map[3]?.[17]==='#'&&walkable(map[2]?.[17]))return {x:17,y:2,facing:'up'};if(s.y===2&&map[3]?.[17]==='#'&&walkable(map[4]?.[17]))return {x:17,y:4,facing:'down'};return null;}
 // The northern building roof glides onto the Rust Syndicate office roof.
 if(s.district==='lumiose-rust-roof'&&s.x===15){if(s.y===6&&[7,8].every(y=>map[y]?.[15]==='#')&&walkable(map[9]?.[15]))return {x:15,y:9,facing:'down'};if(s.y===9&&[7,8].every(y=>map[y]?.[15]==='#')&&walkable(map[6]?.[15]))return {x:15,y:6,facing:'up'};return null;}
 // A second documented glide reaches the roof overlooking Coulant Waterway.
 if(s.district==='lumiose-vert6-roof'&&s.x===16){if(s.y===4&&map[3]?.[16]==='#'&&walkable(map[2]?.[16]))return {x:16,y:2,facing:'up'};if(s.y===2&&map[3]?.[16]==='#'&&walkable(map[4]?.[16]))return {x:16,y:4,facing:'down'};return null;}
 // The isolated northeast roof glides to the Racine Construction roof.
 if(s.district==='lumiose-vert6-roof'&&s.y===8){if(s.x===13&&[10,11,12].every(x=>map[8]?.[x]==='#')&&walkable(map[8]?.[9]))return {x:9,y:8,facing:'left'};if(s.x===9&&[10,11,12].every(x=>map[8]?.[x]==='#')&&walkable(map[8]?.[13]))return {x:13,y:8,facing:'right'};return null;}
 if(s.district==='lumiose-rouge7-roof'&&s.x===16){if(s.y===12&&map[13]?.[16]==='#'&&walkable(map[14]?.[16]))return {x:16,y:14,facing:'down'};if(s.y===14&&map[13]?.[16]==='#'&&walkable(map[12]?.[16]))return {x:16,y:12,facing:'up'};return null;}
 if(s.district==='lumiose-vernal'&&s.zaVernalEastRoof===true&&s.x===5){if(s.y===6&&[7,8].every(y=>map[y]?.[5]==='#')&&walkable(map[9]?.[5]))return {x:5,y:9,facing:'down'};if(s.y===9&&[7,8].every(y=>map[y]?.[5]==='#')&&walkable(map[6]?.[5]))return {x:5,y:6,facing:'up'};return null;}
 if(s.district!=='lumiose-rooftop'||s.zaRooftopCrystalCleared!==true)return null;if(s.x===6&&s.y===8&&map[9]?.[6]==='#'&&walkable(map[10]?.[6]))return {x:6,y:10,facing:'down'};if(s.x===8&&s.y===10&&map[9]?.[8]==='#'&&walkable(map[8]?.[8]))return {x:8,y:8,facing:'up'};return null;}
export const MAX_CLOUD_MOVEMENT_STEPS=12;
export function validateAdventurePath(path){
  if(!Array.isArray(path)||!path.length||path.length>MAX_CLOUD_MOVEMENT_STEPS||path.some(d=>typeof d!=='string'||!Object.hasOwn(DIRECTIONS,d)))throw Error('이동 경로는 올바른 방향 1–12개여야 합니다.');
  return path;
}
export function stepField(s,direction){
  if(!Object.hasOwn(DIRECTIONS,direction))return {blocked:true,reason:'방향을 확인하세요.'};
  const [dx,dy]=DIRECTIONS[direction],x=s.x+dx,y=s.y+dy,tile=fieldMap(s)[y]?.[x];
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&x===8&&y===5&&tile==='u')return {blocked:true,reason:'역 안으로 다시 들어갈 수는 없습니다. 입구에서 열차를 확인하세요.'};
  if(s.district==='lumiose-bleu3-sewer-approach'&&!s.interior&&tile==='r')return {blocked:true,reason:'오염물이 통로를 막고 있습니다.'};
  if(s.district==='lumiose-zone15'&&!s.interior&&s.zaZone15Upper===true&&tile==='r'&&!s.zaZone15WebOpen)return {blocked:true,reason:'펼치지 않은 거미줄을 건널 수 없습니다.'};
  if(s.district==='lumiose-zone14'&&!s.interior&&tile==='r')return {blocked:true,reason:'바위가 길을 막고 있습니다.'};
  if(s.district==='lumiose-zone11'&&!s.interior&&zone11Visible(s,tile)?.water)return {blocked:true,reason:'물속에는 걸어갈 수 없습니다. 가까이에서 포켓몬을 살펴보세요.'};
  if(s.district==='lumiose-zone12'&&!s.interior&&zone12Visible(s,tile)?.water)return {blocked:true,reason:'물속에는 걸어갈 수 없습니다. 가까이에서 포켓몬을 살펴보세요.'};
  if(s.district==='lumiose-zone10'&&!s.interior&&zone10Visible(s,tile)?.water)return {blocked:true,reason:'물속에는 걸어갈 수 없습니다. 가까이에서 포켓몬을 살펴보세요.'};
  if(s.district==='lumiose-zone6'&&zone6Layer(s)==='canal'&&tile==='a')return {blocked:true,reason:'물속에는 걸어갈 수 없습니다. 가까이에서 포켓몬을 살펴보세요.'};
  if(!walkable(tile))return {blocked:true,reason:tile==='~'?'물가 너머로는 걸어갈 수 없습니다.':'그곳으로 갈 수 없습니다.'};
  // The relative locations are sourced; these compressed screen gates are provisional.
  if(!s.interior&&tile==='X'){
    if(s.district==='lumiose-vert-street-route'&&x===0&&y===6)return {x:21,y:8,area:s.area,district:'lumiose-station-alley',transitioned:true,tile};
    if(s.district==='lumiose-station-alley'&&x===22&&y===8)return {x:1,y:6,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
    if(s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector2',zaAcademyCourtyard:false,transitioned:true,tile};
    if(s.district==='lumiose-rouge-north'&&s.zaRougeStreetSouth===true&&x===22&&y===9)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector2',transitioned:true,tile};
    if(s.district==='lumiose-hibernal-approach'&&x===0&&y===6)return {x:21,y:8,area:s.area,district:'lumiose-rouge-sector2',transitioned:true,tile};
    if(s.district==='lumiose-galerie-lune'&&x===10&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector2',transitioned:true,tile};
    if(s.district==='lumiose-rouge-sector2'){
      if(x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,transitioned:true,tile};
      if(x===0&&y===8)return {x:21,y:9,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:true,transitioned:true,tile};
      if(x===22&&y===8)return {x:1,y:6,area:s.area,district:'lumiose-hibernal-approach',transitioned:true,tile};
      if(x===11&&y===16)return {x:10,y:1,area:s.area,district:'lumiose-galerie-lune',transitioned:true,tile};
    }
  }
  if(s.interior==='leWow'&&s.district==='lumiose-rouge-sector2'&&tile==='X')return {x:5,y:6,area:s.area,interior:null,transitioned:true,tile};
  // Museum frontage and building footprint are compressed draft connections.
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===15&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-museum-front',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-museum-front'&&tile==='X'&&x===11&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(s.interior==='museum1'&&s.district==='lumiose-museum-front'&&tile==='X'&&x===11&&y===16)return {x:11,y:7,area:s.area,interior:null,transitioned:true,tile};
  // Compressed academy road connects Rouge Plaza, Hibernal and Sector 6.
  if(!s.interior&&s.district==='lumiose-rouge-north'&&s.zaRougeStreetSouth===true&&tile==='X'&&x===22&&y===11)return {x:1,y:12,area:s.area,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='X'&&x===0&&y===5)return {x:21,y:12,area:s.area,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard!==true&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector6',zaAcademyCourtyard:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&tile==='W'&&x===0&&y===12)return {x:21,y:11,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:true,zaAcademyCourtyard:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&tile==='E'&&x===22&&y===12)return {x:1,y:5,area:s.area,district:'lumiose-hibernal-approach',zaAcademyCourtyard:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector6',zaAcademyCourtyard:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&(tile==='g'||tile==='i')&&!s.zaZone3TowerUpper&&fieldMap(s)[s.y]?.[s.x]!=='g'&&joseeRequired(s))return {blocked:true,reason:'야생 구역에 들어가기 전 Rouge Plaza에서 Josée와 배틀하세요.'};
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&tile==='X'&&x===0&&y===8)return {x:3,y:15,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===3&&y===16)return {x:1,y:8,area:s.area,district:'lumiose-magenta-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector8-route'&&tile==='X'&&x===11&&y===0)return {x:3,y:15,area:s.area,district:'lumiose-magenta-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&tile==='X'&&x===3&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector8-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector8-route'&&tile==='X'&&x===0&&y===8)return {x:21,y:12,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===22&&y===12)return {x:1,y:8,area:s.area,district:'lumiose-magenta-sector8-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===8&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-magenta-sector8-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector8-route'&&tile==='X'&&x===11&&y===16)return {x:8,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===0&&y===10)return {x:11,y:15,area:s.area,district:'lumiose-passage-palais',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-palais'&&tile==='X'&&x===11&&y===16)return {x:1,y:10,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===13&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-passage-palais',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-palais'&&tile==='X'&&x===11&&y===0)return {x:13,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===0&&y===6)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector3'&&tile==='X'&&x===22&&y===8)return {x:1,y:6,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===0&&y===4)return {x:21,y:4,area:s.area,district:'lumiose-quasartico',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-quasartico'&&tile==='X'&&x===22&&y===4)return {x:1,y:4,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  // Rouge Sector 1 is near the Centrico Pokémon Center; street geometry is draft.
  if(!s.interior&&s.district==='lumiose-rouge-sector1-roof'&&tile==='E'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector3-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector3-roof'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-rouge-sector1-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===17&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-mission12-jaune3',zaMission12Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-mission12-jaune3'&&(!s.zaMission12Layer||s.zaMission12Layer==='ground')&&tile==='X'&&x===11&&y===16)return {x:17,y:1,area:s.area,district:'lumiose-centrico-route',zaMission12Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===7&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector1'&&tile==='X'&&x===11&&y===16)return {x:7,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  // Sommi's Holovator lies west of Wild Zone 3; the exact gate is draft.
  if(!s.interior&&s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper&&tile==='X'&&x===0&&y===6)return {x:21,y:8,area:s.area,district:'lumiose-rouge-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector1'&&tile==='E'&&x===22&&y===8)return {x:1,y:6,area:s.area,district:'lumiose-zone3',zaZone3TowerUpper:false,transitioned:true,tile};
  // Galerie connections follow the three documented streets; gate coordinates are provisional.
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===22&&y===12)return {x:1,y:7,area:s.area,district:'lumiose-galerie-lune',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-galerie-lune'&&tile==='W'&&x===0&&y===7)return {x:21,y:12,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-galerie-lune'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&s.zaRougeStreetSouth===true&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-galerie-lune',zaRougeStreetSouth:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='X'&&x===22&&y===8)return {x:1,y:4,area:s.area,district:'lumiose-mission33-alley',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-mission33-alley'&&tile==='X'&&x===0&&y===4)return {x:21,y:8,area:s.area,district:'lumiose-hibernal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='W'&&x===0&&y===8)return {x:21,y:7,area:s.area,district:'lumiose-galerie-lune',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-galerie-lune'&&tile==='E'&&x===22&&y===7)return {x:1,y:8,area:s.area,district:'lumiose-hibernal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-galerie-lune',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-galerie-lune'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  // The arcade's north and south ends open into Sectors 3 and 1 respectively.
  if(!s.interior&&s.district==='lumiose-rouge-sector3'&&tile==='X'&&x===6&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-ombrage-arcade',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-ombrage-arcade'&&tile==='X'&&x===11&&y===0)return {x:6,y:15,area:s.area,district:'lumiose-rouge-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector1'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-ombrage-arcade',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-ombrage-arcade'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector1',transitioned:true,tile};
  // The arcade lies between the boutique and bureau; gate coordinates are draft.
  if(!s.interior&&s.district==='lumiose-rouge-sector3'&&tile==='X'&&x===16&&y===16)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector4'&&tile==='W'&&x===0&&y===8)return {x:16,y:15,area:s.area,district:'lumiose-rouge-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector4'&&tile==='E'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector5'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-rouge-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector3'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-zone3',zaZone3TowerUpper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&s.zaZone3TowerUpper!==true&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-rouge-sector3',transitioned:true,tile};
  // Separate plaza/avenue connection; retain the older Centrico exit.
  if(!s.interior&&s.district==='lumiose-zone3'&&s.zaZone3TowerUpper!==true&&tile==='X'&&x===22&&y===12)return {x:1,y:12,area:s.area,district:'lumiose-hibernal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='X'&&x===0&&y===12)return {x:21,y:12,area:s.area,district:'lumiose-zone3',zaZone3TowerUpper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector3'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector3'&&tile==='X'&&x===11&&y===0)return {x:10,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===10&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===9&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===0&&y===8)return {x:9,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  // Southern Rouge Street: preserve the older direct Plaza and Centrico links.
  if(!s.interior&&s.district==='lumiose-zone3'&&s.zaZone3TowerUpper!==true&&tile==='X'&&x===12&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&s.zaRougeStreetSouth===true&&tile==='X'&&x===11&&y===0)return {x:12,y:15,area:s.area,district:'lumiose-zone3',zaZone3TowerUpper:false,zaRougeStreetSouth:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&s.zaRougeStreetSouth===true&&tile==='X'&&x===11&&y===16){const unlocked=(s.zaMission38Complete&&!(s.zaMission42Stage>=1&&!s.zaMission42Complete))||[1,3,4].includes(s.zaMission42Stage);if(!unlocked)return {blocked:true,reason:'본편 종료 후 야생 구역 20에 들어갈 수 있습니다.'};return {x:12,y:1,area:s.area,district:'lumiose-zone20',zaRougeStreetSouth:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='X'&&x===12&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&s.zaRougeStreetSouth===true&&tile==='X'&&x===0&&y===8)return {x:21,y:9,area:s.area,district:'lumiose-rouge-sector1',zaRougeStreetSouth:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector1'&&tile==='E'&&x===22&&y===9)return {x:1,y:8,area:s.area,district:'lumiose-rouge-north',zaRougeStreetSouth:true,transitioned:true,tile};
  // Neighboring roof and the Zone 18 roof are separate layers at the gate.
  // Courtyard west exit and south-side scaffold street; geometry is provisional.
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Construction===true&&s.zaZone18Upper!==true&&tile==='X'&&x===0&&y===12)return {x:21,y:12,area:s.area,district:'lumiose-magenta-sector9',zaMagenta9Upper:false,zaZone18Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&s.zaMagenta9Upper!==true&&tile==='X'&&x===22&&y===12){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:1,y:12,area:s.area,district:'lumiose-zone18',zaZone18Upper:false,zaZone18Construction:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&s.zaMagenta9Upper===true&&tile==='X'&&x===11&&y===0){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone18',zaMagenta9Upper:false,zaZone18Upper:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Upper===true&&tile==='W'&&x===0&&y===8)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector9',zaMagenta9Upper:true,zaZone18Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Upper===true&&tile==='E'&&x===22&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector9',zaMagenta9Upper:true,zaZone18Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&s.zaMagenta9Upper===true&&tile==='E'&&x===22&&y===8){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone18',zaMagenta9Upper:false,zaZone18Upper:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Upper!==true&&tile==='X'&&x===11&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-autumnal-approach',zaZone18Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===11&&y===0){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone18',zaZone18Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===0&&y===12)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&tile==='X'&&x===22&&y===8)return {x:1,y:12,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===11&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===15&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Upper!==true&&tile==='X'&&x===20&&y===16)return {x:20,y:1,area:s.area,district:'lumiose-quasartico',zaZone18Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-quasartico'&&tile==='X'&&x===20&&y===0){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:20,y:15,area:s.area,district:'lumiose-zone18',zaZone18Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Upper!==true&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector9',zaZone18Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&tile==='X'&&x===11&&y===0){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone18',zaZone18Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-magenta-sector9'&&tile==='X'&&x===11&&y===16)return {x:3,y:1,area:s.area,district:'lumiose-quasartico',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-quasartico'&&tile==='X'&&x===3&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-magenta-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector8-route'&&tile==='X'&&x===22&&y===8){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone18',zaZone18Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone18'&&s.zaZone18Upper!==true&&tile==='E'&&x===22)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector8-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===2&&y===0){if(!zone18Unlocked(s))return {blocked:true,reason:'야생 구역 18은 랭크 B 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone18',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone18'&&tile==='W'&&x===0)return {x:2,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  // Separate rooftop entrance; its grid location is a draft, and the existing rank gate remains.
  if(!s.interior&&s.district==='lumiose-zone15'&&s.zaZone15Upper===true&&tile==='X'&&x===15&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune7-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune7-roof'&&tile==='X'&&x===11&&y===16){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 15는 랭크 D 이후에 열립니다.'};return {x:15,y:1,area:s.area,district:'lumiose-zone15',zaZone15Upper:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone15'&&s.zaZone15Upper!==true&&tile==='X'&&x===11&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-hibernal-approach',zaZone15Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='X'&&x===11&&y===0){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 15는 랭크 D 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone15',zaZone15Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='X'&&x===11&&y===16)return {x:10,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===10&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-hibernal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone15'&&s.zaZone15Upper!==true&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector7',zaZone15Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector7'&&tile==='X'&&x===11&&y===0){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 15는 랭크 D 이후에 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone15',zaZone15Upper:false,transitioned:true,tile};}
  // Source identifies a southwest ground entrance to Jaune Sector 7; exact
  // gate tiles and this compressed local street remain provisional.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15
  if(!s.interior&&s.district==='lumiose-zone15'&&s.zaZone15Upper!==true&&tile==='X'&&x===0&&y===13)return {x:21,y:12,area:s.area,district:'lumiose-jaune-sector7',zaZone15Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector7'&&tile==='X'&&x===22&&y===12){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 15는 랭크 D 이후에 열립니다.'};return {x:1,y:13,area:s.area,district:'lumiose-zone15',zaZone15Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-jaune-sector7'&&tile==='X'&&x===0&&y===8)return {x:5,y:1,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===5&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-jaune-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===19&&y===0){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 15는 랭크 D 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone15',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone15'&&tile==='W'&&x===0)return {x:19,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  // The original also has a southern North Boulevard access. Keep the
  // earlier west connection for existing routes; gate positions are draft.
  // https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_15
  if(!s.interior&&s.district==='lumiose-zone15'&&s.zaZone15Upper!==true&&tile==='X'&&x===17&&y===16)return {x:20,y:1,area:s.area,district:'lumiose-north-boulevard',zaZone15Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===20&&y===0){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 15는 랭크 D 이후에 열립니다.'};return {x:17,y:15,area:s.area,district:'lumiose-zone15',zaZone15Upper:false,transitioned:true,tile};}
  // South Boulevard is west of Magenta Sector 6; gate coordinates are draft.
  // https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/magenta-sector-6.html
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&tile==='X'&&x===0&&y===8)return {x:21,y:12,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===22&&y===12)return {x:1,y:8,area:s.area,district:'lumiose-magenta-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===0&&y===8)return {x:1,y:12,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===0&&y===12)return {x:1,y:8,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  // Quasartico is north of Sector 4; exact gate placement remains a draft.
  // https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/quasartico-inc.html
  if(!s.interior&&s.district==='lumiose-quasartico'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector4'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-quasartico',transitioned:true,tile};
  // Sector 1 neighbours are documented; gate positions and map scale are provisional.
  if(!s.interior&&s.district==='lumiose-magenta-sector1'&&tile==='X'&&x===11&&y===0)return {x:12,y:1,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===12&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector1'&&tile==='X'&&x===11&&y===16)return {x:1,y:10,area:s.area,district:'lumiose-estival-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-estival-approach'&&tile==='X'&&x===0&&y===10)return {x:11,y:15,area:s.area,district:'lumiose-magenta-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector1'&&tile==='X'&&x===0&&y===8)return {x:21,y:10,area:s.area,district:'lumiose-magenta-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector3'&&tile==='X'&&x===22&&y===10)return {x:1,y:8,area:s.area,district:'lumiose-magenta-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector1'&&tile==='X'&&x===22&&y===8)return {x:1,y:4,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===0&&y===4)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector1',transitioned:true,tile};
  // Compressed street junctions: source-confirmed neighbouring areas, provisional screen edges.
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===11&&y===0)return {x:21,y:12,area:s.area,district:'lumiose-magenta-sector8-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===11&&y===16)return {x:21,y:12,area:s.area,district:'lumiose-magenta-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===22&&y===4)return {x:1,y:12,area:s.area,district:'lumiose-magenta-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===22&&y===8)return {x:11,y:15,area:s.area,district:'lumiose-magenta-sector2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===22&&y===12)return {x:21,y:5,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-street'&&tile==='X'&&x===0&&y===8)return {x:21,y:6,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector8-route'&&tile==='X'&&x===22&&y===12)return {x:11,y:1,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&tile==='X'&&x===22&&y===12)return {x:11,y:15,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector4'&&tile==='X'&&x===0&&y===12)return {x:21,y:4,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector2'&&tile==='X'&&x===11&&y===16)return {x:21,y:8,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===22&&y===5)return {x:21,y:12,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===22&&y===6)return {x:1,y:8,area:s.area,district:'lumiose-magenta-street',transitioned:true,tile};
  // Screen endpoints are provisional; real Sector 2 lies south of Sector 4 and adjoins Autumnal Avenue.
  if(!s.interior&&s.district==='lumiose-magenta-sector4'&&tile==='X'&&x===22&&y===11)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector2'&&tile==='X'&&x===11&&y===0)return {x:21,y:11,area:s.area,district:'lumiose-magenta-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector2'&&tile==='X'&&x===22&&y===8)return {x:1,y:10,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===0&&y===10)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector2',transitioned:true,tile};
  // A provisional elevated connector joins the western Zone 7 Holovator to the Mission 28 roof circuit.
  if(!s.interior&&s.district==='lumiose-zone7-west-roof'&&tile==='X'&&x===22&&y===5)return {x:1,y:6,area:s.area,district:'lumiose-magenta-sector4-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector4-roof'&&tile==='X'&&x===0&&y===6){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 7은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:21,y:5,area:s.area,district:'lumiose-zone7-west-roof',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone7'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-magenta-sector2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector2'&&tile==='X'&&x===0&&y===8){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 7은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone7',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-magenta-sector4'&&tile==='X'&&x===11&&y===16){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 7은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:5,y:1,area:s.area,district:'lumiose-zone7',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone7'&&tile==='X'&&x===5&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-magenta-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector4'&&tile==='X'&&x===22&&y===8)return {x:1,y:14,area:s.area,district:'lumiose-autumnal-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-autumnal-approach'&&tile==='X'&&x===0&&y===14)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector3'&&tile==='X'&&x===4&&y===0){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 7은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:17,y:15,area:s.area,district:'lumiose-zone7',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone7'&&tile==='X'&&x===17&&y===16)return {x:4,y:1,area:s.area,district:'lumiose-magenta-sector3',transitioned:true,tile};
  // A courtyard west of Zone 7: placement and screen dimensions are draft.
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===19&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-magenta-west-courtyard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-west-courtyard'&&tile==='X'&&x===11&&y===0)return {x:19,y:15,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone7'&&tile==='W'&&x===0)return {x:21,y:8,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===22&&y===8){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 7은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone7',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===10&&y===0){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 14는 랭크 D 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone14',transitioned:true,tile};}
  // The substation borders South Boulevard to the west; exact gate positions are draft.
  // https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/electrical-substation.html
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===22&&y===14){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 14는 랭크 D 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone14',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone14'&&tile==='X'&&x===0&&y===8)return {x:21,y:14,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  // The substation borders Sector 6 to the south; these gate positions are draft.
  // https://altissimo1.github.io/Supplementary-Series/Legends/Lumiose-Locations/electrical-substation.html
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&tile==='X'&&x===4&&y===0){if(!zone14Unlocked(s))return {blocked:true,reason:'야생 구역 14는 랭크 D 이후에 열립니다.'};return {x:17,y:15,area:s.area,district:'lumiose-zone14',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone14'&&tile==='X'&&x===17&&y===16)return {x:4,y:1,area:s.area,district:'lumiose-magenta-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone14'&&tile==='X'&&x===11&&y===16)return {x:10,y:1,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===12&&y===0)return {x:10,y:15,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===10&&y===16)return {x:12,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone14'&&tile==='X'&&y===0)return {x:10,y:1,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector5'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector7'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector5'&&tile==='X'&&x===11&&y===16)return {x:17,y:1,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&s.zaZone3TowerUpper!==true&&tile==='X'&&x===17&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector5'&&tile==='X'&&x===22&&y===8)return {x:1,y:12,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===0&&y===12)return {x:21,y:8,area:s.area,district:'lumiose-rouge-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector7'&&tile==='X'&&x===0&&y===8)return {x:21,y:10,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===22&&y===10)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone13'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector7'&&tile==='X'&&x===11&&y===0){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 13은 랭크 E 이후에 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone13',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===6&&y===0){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 13은 랭크 E 이후에 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone13',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone13'&&tile==='E'&&x===22&&y===8)return {x:6,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===5&&y===0){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 13은 랭크 E 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone13',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone13'&&tile==='W'&&x===0)return {x:5,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===0&&y===3){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 12는 랭크 E 이후에 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone12',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone12'&&tile==='E'&&x===22&&y===8)return {x:1,y:3,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  // A second northern Zone 1 gate reaches Vert Sector 8; positions are draft.
  // Cafe Classe fronts Vernal Avenue in Vert Sector 4; gate coordinates are draft.
  // https://bulbapedia.bulbagarden.net/wiki/Caf%C3%A9_Classe
  if(!s.interior&&s.district==='lumiose-vernal'&&s.zaVernalEastRoof!==true&&tile==='X'&&x===22&&y===4)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector4'&&(!s.zaVert4Layer||s.zaVert4Layer==='ground')&&tile==='X'&&x===0&&y===8)return {x:21,y:4,area:s.area,district:'lumiose-vernal',zaVernalEastRoof:false,transitioned:true,tile};
  // Relative placement follows the Vert Sector 4/5 references; exact gate tiles are draft.
  if(!s.interior&&s.district==='lumiose-vert2'&&s.zaVert2RoofUpper!==true&&tile==='X'&&x===7&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-vert-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector4'&&tile==='X'&&x===11&&y===0)return {x:7,y:15,area:s.area,district:'lumiose-vert2',zaVert2RoofUpper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector4'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector5'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-vert-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-plaza'&&tile==='X'&&x===15&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-vert-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector5'&&tile==='X'&&x===11&&y===0)return {x:15,y:15,area:s.area,district:'lumiose-vert-plaza',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='X'&&x===15&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-vert-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector8'&&tile==='X'&&x===11&&y===0)return {x:15,y:1,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector8'&&tile==='X'&&x===11&&y===16)return {x:17,y:1,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='X'&&x===17&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-vert-sector8',transitioned:true,tile};
  // Zone 1's north exit reaches Vert Sector 9; precise street junctions are draft.
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-vert-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector9'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector9'&&tile==='W'&&x===0&&y===8)return {x:21,y:10,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===22&&y===10)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector9',transitioned:true,tile};
  // The street approach to the small courtyard is an approximate 2D connection.
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===0&&y===10)return {x:21,y:8,area:s.area,district:'lumiose-zone1-courtyard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1-courtyard'&&tile==='E'&&x===22&&y===8)return {x:1,y:10,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===22&&y===12)return {x:1,y:4,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='X'&&x===0&&y===4)return {x:21,y:12,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  // West-of-park roof from the repaired Holovator; exact gates are draft.
  if(!s.interior&&s.district==='lumiose-mission27-roof'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-aymlis-west-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-aymlis-west-roof'&&tile==='E'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-mission27-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5-drain'&&tile==='W'&&x===0&&y===12)return {x:6,y:3,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5-drain'&&tile==='X'&&x===22&&y===4)return {x:17,y:15,area:s.area,district:'lumiose-bleu3-sewer-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu3-sewer-approach'&&tile==='X'&&x===17&&y===16)return {x:21,y:4,area:s.area,district:'lumiose-zone5-drain',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector3'&&tile==='X'&&x===22&&y===8)return {x:1,y:5,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===0&&y===5)return {x:21,y:8,area:s.area,district:'lumiose-bleu-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector3'&&tile==='X'&&x===22&&y===3)return {x:1,y:8,area:s.area,district:'lumiose-bleu3-sewer-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu3-sewer-approach'&&tile==='W'&&x===0&&y===8)return {x:21,y:3,area:s.area,district:'lumiose-bleu-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu3-sewer-approach'&&tile==='X'&&x===17&&y===0){if(s.zaBleuSewerOpened!==true)return {blocked:true,reason:'하수도 문이 잠겨 있습니다. 근처 의뢰인에게 말을 걸어 보세요.'};return {x:11,y:15,area:s.area,district:'lumiose-sewer',zaSewerReturn:'bleu3',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='X'&&x===10&&y===16)return {x:16,y:1,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===16&&y===0)return {x:10,y:15,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===20&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&tile==='W'&&x===0&&y===8)return {x:20,y:1,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector7'&&tile==='X'&&x===11&&y===0){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone17',zaZone17Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&tile==='X'&&x===22&&y===8)return {x:11,y:1,area:s.area,district:'lumiose-vert-sector7',zaZone17Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector7'&&tile==='X'&&x===11&&y===16)return {x:18,y:1,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===18&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-vert-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&tile==='X'&&x===22&&y===3)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector7'&&tile==='X'&&x===0&&y===8)return {x:21,y:3,area:s.area,district:'lumiose-vert-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector3'&&tile==='X'&&x===0&&y===7)return {x:21,y:7,area:s.area,district:'lumiose-vert-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector1'&&tile==='X'&&x===22&&y===7)return {x:1,y:7,area:s.area,district:'lumiose-vert-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector1'&&tile==='X'&&x===11&&y===16)return {x:3,y:1,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='X'&&x===3&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-vert-sector1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector3'&&tile==='X'&&x===22&&y===7)return {x:1,y:4,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='X'&&x===0&&y===4)return {x:21,y:7,area:s.area,district:'lumiose-vert-sector3',transitioned:true,tile};
  // Additional western stair connections; positions are 2D approximations.
  // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
  if(!s.interior&&s.district==='lumiose-vert-sector3'&&tile==='X'&&x===22&&(y===4||y===10))return {x:1,y:y===4?2:6,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&s.zaCoulantLower!==true&&tile==='X'&&x===0&&(y===2||y===6))return {x:21,y:y===2?4:10,area:s.area,district:'lumiose-vert-sector3',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector3'&&tile==='X'&&x===17&&y===16)return {x:12,y:1,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='X'&&x===12&&y===0)return {x:17,y:15,area:s.area,district:'lumiose-vert-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-saison-canalside'&&tile==='X'&&x===19&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-vert-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector3'&&tile==='X'&&x===11&&y===0)return {x:19,y:15,area:s.area,district:'lumiose-saison-canalside',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector3'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-vert-plaza',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-plaza'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-vert-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector6'&&tile==='X'&&x===11&&y===0)return {x:15,y:15,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===15&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===22&&y===8)return {x:11,y:15,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===11&&y===16)return {x:21,y:8,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===15&&y===0)return {x:19,y:15,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===19&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===11&&y===0){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 8은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:9,y:15,area:s.area,district:'lumiose-zone8',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone8'&&tile==='X'&&x===9&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector2'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===0&&y===8)return {x:13,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===13&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===22&&y===8)return {x:11,y:15,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===11&&y===16)return {x:21,y:8,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector2'&&tile==='X'&&x===11&&y===16)return {x:5,y:1,area:s.area,district:'lumiose-saison-canalside',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-saison-canalside'&&tile==='X'&&x===5&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-sector2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector6'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-saison-canalside',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-saison-canalside'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-sector6',transitioned:true,tile};
  // The northwest canal-side street continues to Centrico; exact screen-edge coordinates are draft.
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===22&&y===14)return {x:1,y:12,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===0&&y===12)return {x:21,y:14,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-saison-canalside'&&tile==='X'&&x===0&&y===8)return {x:9,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===9&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-saison-canalside',transitioned:true,tile};
  // Jaune Sector 9 is east of Jaune Plaza; exact gate tiles are provisional.
  // https://bulbapedia.bulbagarden.net/wiki/Jaune_Sector_9
  if(!s.interior&&s.district==='lumiose-zone8'&&tile==='X'&&x===22&&y===10)return {x:1,y:10,area:s.area,district:'lumiose-jaune-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&tile==='X'&&x===0&&y===10){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 8은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:21,y:10,area:s.area,district:'lumiose-zone8',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-jaune-sector10'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector10',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&tile==='X'&&x===11&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===0&&y===8)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector10'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-jaune-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector6'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-jaune-sector10',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector10'&&tile==='X'&&x===22&&y===4)return {x:1,y:4,area:s.area,district:'lumiose-jaune-sector12',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector12'&&tile==='X'&&x===0&&y===4)return {x:21,y:4,area:s.area,district:'lumiose-jaune-sector10',transitioned:true,tile};
  // The raised northwest approach has a one-way drop; gate tiles are draft.
  if(!s.interior&&s.district==='lumiose-jaune-sector10'&&tile==='X'&&x===22&&y===9){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:1,y:5,area:s.area,district:'lumiose-zone11-nw-ledge',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11-nw-ledge'&&tile==='W'&&x===0&&y===5)return {x:21,y:9,area:s.area,district:'lumiose-jaune-sector10',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X'&&x===0&&y===4)return {x:21,y:8,area:s.area,district:'lumiose-jaune-sector10',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector10'&&tile==='X'&&x===22&&y===8){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:1,y:4,area:s.area,district:'lumiose-zone11',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X'&&x===22&&y===4)return {x:1,y:8,area:s.area,district:'lumiose-jaune-sector12',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector12'&&tile==='X'&&x===0&&y===8){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:21,y:4,area:s.area,district:'lumiose-zone11',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-jaune-sector11'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-jaune-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-jaune-sector11',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector11'&&tile==='X'&&x===11&&y===0)return {x:15,y:15,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===15&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector11',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector11'&&tile==='X'&&x===22&&y===8)return {x:15,y:15,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===15&&y===16)return {x:21,y:8,area:s.area,district:'lumiose-jaune-sector11',transitioned:true,tile};
  // The North Boulevard approach is documented; tile coordinates are draft.
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===18&&y===0)return {x:14,y:1,area:s.area,district:'lumiose-zone6',zaZone6Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone6'&&zone6Layer(s)==='ground'&&tile==='X'&&x===14&&y===0)return {x:18,y:1,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  // Draft waterside approach to the documented below-bridge entrance.
  if(!s.interior&&s.district==='lumiose-zone6'&&zone6Layer(s)==='canal'&&tile==='X'&&x===3&&y===16)return {x:17,y:1,area:s.area,district:'lumiose-saison-canalside',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-saison-canalside'&&tile==='X'&&x===17&&y===0)return {x:3,y:15,area:s.area,district:'lumiose-zone6',zaZone6Layer:'canal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone6'&&zone6Layer(s)==='ground'&&tile==='X'&&x===15&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-sector11',zaZone6Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector11'&&tile==='X'&&x===11&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-zone6',zaZone6Layer:'ground',transitioned:true,tile};
  // A second southern Zone 6 access faces Jaune Sector 12; positions are draft.
  if(!s.interior&&s.district==='lumiose-jaune-sector12'&&tile==='X'&&x===15&&y===0)return {x:16,y:15,area:s.area,district:'lumiose-zone6',zaZone6Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone6'&&zone6Layer(s)==='ground'&&tile==='X'&&x===16&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-jaune-sector12',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector12'&&tile==='X'&&x===11&&y===0)return {x:18,y:15,area:s.area,district:'lumiose-zone6',zaZone6Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone6'&&zone6Layer(s)==='ground'&&tile==='X'&&x===18&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector12',transitioned:true,tile};
  // Keep the legacy eastern entrance while connecting the Zone 11 east gate
  // to the western edge of its adjacent district. Exact gate tiles are draft.
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&tile==='X'&&(x===0||x===22)&&y===12){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:21,y:12,area:s.area,district:'lumiose-zone11',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X'&&x===22&&y===12)return {x:1,y:12,area:s.area,district:'lumiose-vert-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&tile==='X'&&y===0&&x===16)return {x:16,y:5,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&tile==='X'&&y===0&&x===6)return {x,y:15,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&s.zaCoulantLower===true&&tile==='X'&&x===16&&y===4){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x:16,y:1,area:s.area,district:'lumiose-zone17',zaZone17Upper:false,zaZone17Promenade:true,zaCoulantLower:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='X'&&y===16&&(x===6||x===16)){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x,y:1,area:s.area,district:'lumiose-zone17',zaZone17Upper:false,zaZone17Promenade:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&tile==='X'&&x===11&&y===16){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone17',zaZone17Upper:false,zaZone17Promenade:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-vert-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-plaza-route'&&tile==='X'&&x===5&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-bleu-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===11&&y===0)return {x:5,y:15,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===11&&y===16)return {x:4,y:1,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===4&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-bleu-street',transitioned:true,tile};
  // Sector 8 adjoins the southern boulevard; the Sector 9 alley is schematic.
  if(!s.interior&&s.district==='lumiose-bleu-sector8'&&tile==='X'&&x===11&&y===16)return {x:12,y:1,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===12&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-bleu-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector8'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-bleu-sector9',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector9'&&tile==='E'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-bleu-sector8',transitioned:true,tile};
  // Confirmed entrance directions; coordinates are provisional. The older
  // east/west exits are retained below for existing navigation and saves.
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===0&&y===3)return {x:11,y:15,area:s.area,district:'lumiose-passage-felicite',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-felicite'&&tile==='X'&&x===11&&y===16)return {x:1,y:3,area:s.area,district:'lumiose-bleu-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu6-approach'&&tile==='X'&&x===22&&y===14)return {x:11,y:1,area:s.area,district:'lumiose-passage-felicite',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-felicite'&&tile==='X'&&x===11&&y===0)return {x:21,y:14,area:s.area,district:'lumiose-bleu6-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-felicite'&&tile==='X'&&x===0&&y===6)return {x:21,y:8,area:s.area,district:'lumiose-bleu-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector8'&&tile==='X'&&x===22&&y===8)return {x:1,y:6,area:s.area,district:'lumiose-passage-felicite',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===0&&y===5)return {x:21,y:8,area:s.area,district:'lumiose-passage-felicite',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-felicite'&&tile==='E'&&x===22&&y===8)return {x:1,y:5,area:s.area,district:'lumiose-bleu-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu6-approach'&&tile==='X'&&x===22&&y===12)return {x:1,y:8,area:s.area,district:'lumiose-passage-felicite',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-passage-felicite'&&tile==='W'&&x===0&&y===8)return {x:21,y:12,area:s.area,district:'lumiose-bleu6-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-bleu6-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu6-approach'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-bleu-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===22&&y===8)return {x:1,y:11,area:s.area,district:'lumiose-bleu-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector7'&&tile==='X'&&x===0&&y===11)return {x:21,y:8,area:s.area,district:'lumiose-bleu-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector7'&&tile==='X'&&x===11&&y===16)return {x:8,y:1,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===8&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-bleu-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-floral',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-floral'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-south-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone12'&&tile==='X'&&x===12&&y===16)return {x:16,y:1,area:s.area,district:'lumiose-bleu-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector7'&&tile==='X'&&x===16&&y===0){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 12는 랭크 E 이후에 열립니다.'};return {x:12,y:15,area:s.area,district:'lumiose-zone12',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-bleu-sector5'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-bleu-cafe2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-cafe2'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-bleu-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-mission22-tunnel'&&tile==='X'&&x===11&&y===15)return s.zaMission22Entry==='cafe2'?{x:17,y:6,area:s.area,district:'lumiose-bleu-cafe2',transitioned:true,tile}:{x:10,y:5,area:s.area,district:'lumiose-bleu-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector5'&&tile==='X'&&x===10&&y===16)return {x:1,y:5,area:s.area,district:'lumiose-bleu-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector7'&&tile==='X'&&x===0&&y===5)return {x:10,y:15,area:s.area,district:'lumiose-bleu-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector7'&&tile==='X'&&x===22&&y===8)return {x:1,y:12,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===0&&y===12)return {x:21,y:8,area:s.area,district:'lumiose-bleu-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone12'&&tile==='X'&&y===0&&(x===6||x===16))return {x,y:15,area:s.area,district:'lumiose-bleu-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector3'&&tile==='X'&&y===16&&(x===6||x===16)){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 12는 랭크 E 이후에 열립니다.'};return {x,y:1,area:s.area,district:'lumiose-zone12',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone12'&&s.zaZone12PondLower===true&&tile==='X'&&x===0&&y===13)return {x:21,y:14,area:s.area,district:'lumiose-bleu-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector5'&&tile==='X'&&x===22&&y===14){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 12는 랭크 E 이후에 열립니다.'};return {x:1,y:13,area:s.area,district:'lumiose-zone12',zaZone12PondLower:true,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone12'&&tile==='X'&&x===0&&(y===5||y===12))return {x:21,y,area:s.area,district:'lumiose-bleu-sector5',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector5'&&tile==='X'&&x===22&&(y===5||y===12)){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 12는 랭크 E 이후에 열립니다.'};return {x:1,y,area:s.area,district:'lumiose-zone12',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===14&&y===16){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 12는 랭크 E 이후에 열립니다.'};return {x:1,y:10,area:s.area,district:'lumiose-zone12',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone12'&&tile==='W'&&x===0)return {x:14,y:15,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-estival-approach'&&tile==='X'&&x===11&&y===0)return {x:7,y:15,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===7&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-estival-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu6-approach'&&tile==='X'&&x===11&&y===16)return {x:1,y:8,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-plaza-route'&&tile==='W'&&x===0&&y===8)return {x:11,y:15,area:s.area,district:'lumiose-bleu6-approach',transitioned:true,tile};
  // Zone 5 has a western gate into Bleu Sector 4; gate tiles are provisional.
  if(!s.interior&&s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&tile==='X'&&x===0&&y===10)return {x:11,y:1,area:s.area,district:'lumiose-bleu-sector4',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector4'&&tile==='X'&&x===11&&y===0)return {x:1,y:10,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  // Both levels of Espace Vide reach Bleu Sector 4; exact gates are draft.
  if(!s.interior&&s.district==='lumiose-espace-vide'&&tile==='E'&&x===22&&y===8)return s.zaEspaceLower===true?{x:1,y:8,area:s.area,district:'lumiose-bleu4-tunnel',transitioned:true,tile}:{x:1,y:8,area:s.area,district:'lumiose-bleu-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector4'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-espace-vide',zaEspaceLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu4-tunnel'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-espace-vide',zaEspaceLower:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector4'&&tile==='E'&&x===22&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-rust',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rust'&&tile==='X'&&x===22&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-bleu-sector4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-espace-vide'&&s.zaEspaceLower!==true&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-estival-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-estival-approach'&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-espace-vide',zaEspaceLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-espace-vide'&&s.zaEspaceLower!==true&&tile==='X'&&x===11&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-bleu6-approach',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu6-approach'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-espace-vide',zaEspaceLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone10'&&s.zaZone10Upper!==true&&tile==='E'&&x===22&&y===6)return {x:1,y:8,area:s.area,district:'lumiose-espace-vide',zaEspaceLower:true,zaZone10Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-espace-vide'&&s.zaEspaceLower===true&&tile==='W'&&x===0&&y===8){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 10은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:21,y:6,area:s.area,district:'lumiose-zone10',zaZone10Upper:false,transitioned:true,tile};}
  // Zones 9 and 10 sit opposite each other on Estival Avenue; gates are draft.
  if(!s.interior&&s.district==='lumiose-estival-approach'&&tile==='X'&&x===0&&y===8){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 10은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone10',zaZone10Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone10'&&s.zaZone10Upper!==true&&tile==='X'&&x===11&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-estival-approach',zaZone10Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===20&&y===16)return {x:14,y:1,area:s.area,district:'lumiose-south-boulevard',zaZone10Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===14&&y===0)return {x:20,y:15,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='X'&&x===11&&y===0){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 10은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:1,y:6,area:s.area,district:'lumiose-zone10',zaZone10Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone10'&&s.zaZone10Upper!==true&&tile==='W'&&x===0)return {x:11,y:1,area:s.area,district:'lumiose-south-boulevard',zaZone10Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone9'&&s.zaZone9Upper!==true&&tile==='X'&&x===22&&y===8)return {x:1,y:12,area:s.area,district:'lumiose-magenta-sector3',zaZone9Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector3'&&tile==='X'&&x===0&&y===12){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 9는 앱솔 사건을 해결한 뒤 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone9',zaZone9Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-magenta-sector3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector3'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-magenta-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone9'&&s.zaZone9Upper!==true&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-magenta-sector6',zaZone9Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&tile==='X'&&x===11&&y===16){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 9는 앱솔 사건을 해결한 뒤 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone9',zaZone9Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&tile==='X'&&x===11&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===0&&y===8)return {x:11,y:1,area:s.area,district:'lumiose-magenta-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-estival-approach'&&tile==='X'&&x===22&&y===8){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 9는 앱솔 사건을 해결한 뒤 열립니다.'};return {x:15,y:15,area:s.area,district:'lumiose-zone9',zaZone9Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone9'&&s.zaZone9Upper!==true&&tile==='X'&&x===15&&y===16)return {x:21,y:8,area:s.area,district:'lumiose-estival-approach',zaZone9Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===2&&y===0)return {x:21,y:12,area:s.area,district:'lumiose-estival-approach',zaZone9Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-estival-approach'&&tile==='X'&&x===22&&y===12){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 9는 앱솔 사건을 해결한 뒤 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone9',zaZone9Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone9'&&s.zaZone9Upper!==true&&tile==='X'&&y===16)return {x:21,y:12,area:s.area,district:'lumiose-estival-approach',zaZone9Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===19&&y===0){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 8은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone8',transitioned:true,tile};}
  // North Jaune Street and its Sector 8 continuation are a topological draft.
  if(!s.interior&&s.district==='lumiose-zone8'&&tile==='X'&&x===11&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-street-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street-north'&&tile==='X'&&x===11&&y===16){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 8은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone8',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-jaune-street-north'&&tile==='X'&&x===11&&y===0)return {x:8,y:15,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===8&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-jaune-street-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone8'&&tile==='X'&&x===19&&y===0)return {x:4,y:15,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===4&&y===16)return {x:19,y:1,area:s.area,district:'lumiose-zone8',transitioned:true,tile};
  // Zone 19 has a western Jaune Street entrance and an eastern Sector 8 entrance.
  // Tile positions and the intervening Sector 8 street remain provisional.
  // Draft Sector 8 screen between Jaune Street and the Zone 19 garden.
  // Draft connector between the center-side street and the Jaune Plaza approach.
  if(!s.interior&&s.district==='lumiose-jaune-sector8'&&tile==='X'&&x===0&&y===10)return {x:21,y:12,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===22&&y===12)return {x:1,y:10,area:s.area,district:'lumiose-jaune-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===17&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-jaune-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector8'&&tile==='X'&&x===11&&y===16)return {x:17,y:1,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-sector8'&&tile==='X'&&x===11&&y===0){if(!zone19Unlocked(s))return {blocked:true,reason:'야생 구역 19는 랭크 B 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone19',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone19'&&tile==='X'&&x===11&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-jaune-sector8',transitioned:true,tile};
  // Zone 19's eastern entrance faces Jaune Sector 8. Exact gate tiles are draft.
  if(!s.interior&&s.district==='lumiose-jaune-sector8'&&tile==='X'&&x===0&&y===8){if(!zone19Unlocked(s))return {blocked:true,reason:'야생 구역 19는 랭크 B 이후에 열립니다.'};return {x:21,y:9,area:s.area,district:'lumiose-zone19',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone19'&&tile==='E'&&x===22&&y===9)return {x:1,y:8,area:s.area,district:'lumiose-jaune-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-street'&&tile==='X'&&x===19&&y===0){if(!zone19Unlocked(s))return {blocked:true,reason:'야생 구역 19는 랭크 B 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone19',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone19'&&tile==='W'&&x===0&&y===8)return {x:19,y:1,area:s.area,district:'lumiose-jaune-street',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===19&&y===0){if(!zone19Unlocked(s))return {blocked:true,reason:'야생 구역 19는 랭크 B 이후에 열립니다.'};return {x:21,y:8,area:s.area,district:'lumiose-zone19',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone19'&&tile==='E'&&x===22&&y===8)return {x:19,y:1,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-jaune-garden-route'&&tile==='X'&&x===18&&y===0){if(!zone19Unlocked(s))return {blocked:true,reason:'야생 구역 19는 랭크 B 이후에 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone19',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone19'&&tile==='X'&&y===16)return {x:18,y:1,area:s.area,district:'lumiose-jaune-garden-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone8'&&tile==='X'&&y===16)return {x:19,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===5&&y===0){if(!zone7Unlocked(s))return {blocked:true,reason:'야생 구역 7은 앱솔 사건을 해결한 뒤 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone7',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone7'&&tile==='X'&&y===16)return {x:5,y:1,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='X'&&x===17&&y===0)return {x:11,y:1,area:s.area,district:'lumiose-zone6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='E'&&x===22&&y===8)return {x:1,y:12,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  // Both canal banks connect to Vert Street. Gate positions are provisional.
  // https://www.pokepedia.fr/Canal_Lacoul%C3%A9e
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='X'&&x===22&&(y===6||y===10))return {x:1,y,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&s.zaCoulantLower===true&&tile==='X'&&x===0&&(y===6||y===10))return {x:21,y,area:s.area,district:'lumiose-vert-street-route',zaCoulantLower:false,transitioned:true,tile};
  // Coulant's eastern streets connect Sectors 6 and 7; the grid alignment is provisional.
  if(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='X'&&x===22&&y===4)return {x:19,y:1,area:s.area,district:'lumiose-vert-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&tile==='X'&&x===19&&y===0)return {x:21,y:4,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='X'&&x===22&&y===12)return {x:18,y:1,area:s.area,district:'lumiose-vert-sector7',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector7'&&tile==='X'&&x===18&&y===0)return {x:21,y:12,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='W'&&x===0&&y===12)return {x:21,y:8,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  // The lower bank also reaches the Zone 11 stair approach. Tile positions are draft.
  // Two-flight southwest approach; exact entrances are provisional.
  if(!s.interior&&s.district==='lumiose-coulant-route'&&s.zaCoulantLower!==true&&tile==='X'&&x===9&&y===0){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone11-sw-top',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11-sw-top'&&tile==='X'&&x===11&&y===0)return {x:9,y:1,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X'&&x===4&&y===16)return {x:11,y:11,area:s.area,district:'lumiose-zone11-sw-middle',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&s.zaCoulantLower===true&&tile==='X'&&x===10&&y===4){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:6,y:15,area:s.area,district:'lumiose-zone11',zaCoulantLower:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X'&&x===6&&y===16)return {x:10,y:5,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='X'&&x===10&&y===0){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:5,y:15,area:s.area,district:'lumiose-zone11',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X'&&x===5&&y===16)return {x:10,y:1,area:s.area,district:'lumiose-coulant-route',zaCoulantLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='X'&&x===17&&y===16){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone11',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone6'&&tile==='X'&&y===0)return {x:17,y:1,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone6'&&tile==='X'&&y===16){if(!zone11Unlocked(s))return {blocked:true,reason:'야생 구역 11은 랭크 E 이후에 열립니다.'};return {x:5,y:1,area:s.area,district:'lumiose-zone11',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone11'&&tile==='X')return y===0?{x:11,y:15,area:s.area,district:'lumiose-zone6',transitioned:true,tile}:{x:17,y:15,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='X'&&x===19&&y===0)return {x:1,y:8,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='W'&&x===0)return {x:19,y:1,area:s.area,district:'lumiose',transitioned:true,tile};
  // Zone 17's southwest lawn entrance meets Vert Street. Exact tile positions are draft.
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='X'&&x===20&&y===0){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x:5,y:15,area:s.area,district:'lumiose-zone17',zaZone17Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&tile==='X'&&x===5&&y===16)return {x:20,y:1,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-street-route'&&tile==='X'&&x===18&&y===0){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x:1,y:8,area:s.area,district:'lumiose-zone17',zaZone17Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone17'&&s.zaZone17Upper!==true&&tile==='W'&&x===0)return {x:18,y:1,area:s.area,district:'lumiose-vert-street-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='X'&&x===0&&y===5){if(!zone17Unlocked(s))return {blocked:true,reason:'야생 구역 17은 랭크 C 이후에 열립니다.'};return {x:11,y:15,area:s.area,district:'lumiose-zone17',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone17'&&tile==='X'&&y===16)return {x:1,y:5,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&tile==='X'&&x===0&&y===12)return {x:21,y:4,area:s.area,district:'lumiose-bleu-street',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-street'&&tile==='X'&&x===22&&y===4)return {x:1,y:12,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&tile==='X'&&x===22&&y===13)return {x:1,y:13,area:s.area,district:'lumiose-vernal',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X'&&x===0&&y===13)return {x:21,y:13,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&tile==='X'&&x===11&&y===0)return {x:12,y:15,area:s.area,district:'lumiose-centrico-route',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='X'&&x===12&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  // Zone 5's southern access meets Bleu Sector 3; tile positions are draft.
  if(!s.interior&&s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&tile==='X'&&x===5&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-bleu-sector3',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-sector3'&&tile==='X'&&x===11&&y===0)return {x:5,y:15,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&s.zaZone5Upper!==true&&tile==='X'&&x===17&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-plaza-route'&&tile==='X'&&x===11&&y===0)return {x:17,y:15,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  // Zone 16's northwest gate faces the Rust office. Screen coordinates are draft.
  if(!s.interior&&s.district==='lumiose-zone16'&&s.zaZone16Upper!==true&&tile==='X'&&x===8&&y===0)return {x:1,y:12,area:s.area,district:'lumiose-rust',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rust'&&tile==='X'&&x===0&&y===12){if(!zone16Unlocked(s))return {blocked:true,reason:'야생 구역 16은 랭크 C 이후에 열립니다.'};return {x:8,y:1,area:s.area,district:'lumiose-zone16',zaZone16Upper:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-bleu-plaza-route'&&tile==='X'&&y===16&&(x===16||x===20)){if(!zone16Unlocked(s))return {blocked:true,reason:'야생 구역 16은 랭크 C 이후에 열립니다.'};return x===16?{x:21,y:8,area:s.area,district:'lumiose-zone16',transitioned:true,tile}:{x:1,y:12,area:s.area,district:'lumiose-zone16',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone16'&&tile==='X'&&x===22&&y===8)return {x:16,y:15,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone16'&&tile==='X'&&x===0&&y===12)return {x:20,y:15,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-plaza-route'&&tile==='X'&&x===11&&y===16){if(!zone16Unlocked(s))return {blocked:true,reason:'야생 구역 16은 랭크 C 이후에 열립니다.'};return {x:11,y:1,area:s.area,district:'lumiose-zone16',transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-zone16'&&tile==='X'&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-bleu-plaza-route'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-rust',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rust'&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-bleu-plaza-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&y===16&&(x===16||x===18))return {x:x===16?1:11,y:x===16?8:15,area:s.area,district:'lumiose-zone5',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&tile==='X')return {x:18,y:15,area:s.area,district:'lumiose-centrico-route',zaZone5Upper:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone5'&&tile==='W')return {x:16,y:15,area:s.area,district:'lumiose-centrico-route',zaZone5Upper:false,transitioned:true,tile};
  // Three directional exits return to provisional gates on the surrounding plaza.
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='X'&&x===11&&y===0)return {x:11,y:4,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  // New canal-side approach; the older Centrico exit remains for saved routes.
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='W'&&x===0&&y===9)return {x:21,y:10,area:s.area,district:'lumiose-magenta-canal-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&tile==='X'&&x===22&&y===10){const unlocked=(s.zaMission38Complete&&!(s.zaMission42Stage>=1&&!s.zaMission42Complete))||[1,3,4].includes(s.zaMission42Stage);if(!unlocked)return {blocked:true,reason:'본편 종료 후 야생 구역 20에 들어갈 수 있습니다.'};return {x:1,y:9,area:s.area,district:'lumiose-zone20',transitioned:true,tile};}
  // East gate reaches the separate Vert-side bank; the old plaza gate remains.
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='E'&&x===22&&y===9)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector1',zaVertSaisonBank:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector1'&&s.zaVertSaisonBank===true&&tile==='X'&&x===0&&y===8){const unlocked=(s.zaMission38Complete&&!(s.zaMission42Stage>=1&&!s.zaMission42Complete))||[1,3,4].includes(s.zaMission42Stage);if(!unlocked)return {blocked:true,reason:'본편 종료 후 야생 구역 20에 들어갈 수 있습니다.'};return {x:21,y:9,area:s.area,district:'lumiose-zone20',zaVertSaisonBank:false,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-vert-sector1'&&s.zaVertSaisonBank===true&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-vert-sector1',zaVertSaisonBank:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-sector1'&&s.zaVertSaisonBank!==true&&tile==='X'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-vert-sector1',zaVertSaisonBank:true,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='W'&&x===0&&y===8)return {x:3,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='E'&&x===22&&y===8)return {x:19,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone20'&&tile==='X')return {x:15,y:6,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-research-zone'&&tile==='X')return {x:15,y:6,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-protect'&&tile==='X')return {x:15,y:6,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-lysandre-lab'&&tile==='X')return s.zaLysandreCafeRoute?{x:11,y:6,area:s.area,district:s.zaLysandreCafeDistrict==='lumiose-magenta-sector2'?'lumiose-magenta-sector2':'lumiose-magenta-sector4',interior:'lysandreCafe',transitioned:true,tile}:{x:9,y:13,area:s.area,district:'lumiose-site',transitioned:true,tile};
  if(s.interior==='canariQuiz'&&tile==='X')return {x:8,y:8,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='cafeGallant'&&tile==='X')return {x:17,y:7,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='racineRoom'&&tile==='X')return {x:17,y:7,area:s.area,interior:'racineGarage',transitioned:true,tile};
  if(s.interior==='leNah'&&s.district==='lumiose-vert-sector6'&&tile==='X')return {x:14,y:12,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='racineGarage'&&tile==='X')return {x:17,y:14,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='lysandreCafe'&&tile==='X')return {x:17,y:s.district==='lumiose-magenta-sector2'?7:15,area:s.area,district:s.district,interior:null,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-crystal-sewer'&&tile==='X')return s.zaMission20CrystalReturn==='magenta-bank'?{x:4,y:8,area:s.area,district:'lumiose-magenta-sewer-bank',zaMission20CrystalReturn:null,transitioned:true,tile}:s.zaMission20CrystalReturn==='magenta'?{x:10,y:13,area:s.area,district:'lumiose-magenta-canal-route',zaMission20CrystalReturn:null,transitioned:true,tile}:{x:19,y:11,area:s.area,district:'lumiose-vernal',zaMission20CrystalReturn:null,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-ghost-house'&&tile==='X')return s.zaMission20HouseReturn==='bleu9'?{x:11,y:6,area:s.area,district:'lumiose-bleu-sector9',zaMission20HouseReturn:null,transitioned:true,tile}:{x:6,y:13,area:s.area,district:'lumiose-vernal',zaMission20HouseReturn:null,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rust'&&tile==='X')return {x:5,y:11,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-sewer'&&tile==='X'&&s.zaSewerIceBranch===true)return {x:3,y:10,area:s.area,district:'lumiose-sewer',zaSewerIceBranch:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-sewer'&&tile==='X'&&s.zaMission19Inner===true)return {x:11,y:4,area:s.area,district:'lumiose-sewer',zaMission19Inner:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-sewer'&&tile==='X')return s.zaSewerReturn==='bleu3'?{x:17,y:1,area:s.area,district:'lumiose-bleu3-sewer-approach',zaSewerReturn:null,transitioned:true,tile}:s.zaSewerReturn==='bleu7'?{x:13,y:13,area:s.area,district:'lumiose-bleu-sector7',zaSewerReturn:null,transitioned:true,tile}:{x:17,y:11,area:s.area,district:'lumiose-vernal',zaSewerReturn:null,transitioned:true,tile};
  if(s.interior==='lumioseLab'&&tile==='X')return {x:5,y:6,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='rustOffice'&&s.district==='lumiose-rust'&&tile==='X')return {x:11,y:7,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='justiceDojo'&&s.district==='lumiose-jaune-sector2'&&tile==='X')return {x:5,y:10,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='richissimeLobby'&&s.district==='lumiose-centrico-route'&&tile==='X')return s.zaRichissimeEntrance==='north-boulevard'?{x:14,y:4,area:s.area,district:'lumiose-north-boulevard',interior:null,transitioned:true,tile}:{x:14,y:5,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='quasarticoOffice'&&tile==='X'&&s.zaMission10Stage===7)return {blocked:true,reason:'나가기 전에 안내 직원의 교환 설명을 들어 주세요.'};
  if(s.interior==='quasarticoOffice'&&tile==='X')return {x:11,y:7,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='sushi'&&tile==='X')return {x:19,y:5,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='lab'&&tile==='X')return {x:18,y:5,area:s.area,interior:null,transitioned:true,tile};
  if(s.interior==='hotel202'&&tile==='X'){if(s.zaIntroStage==='room')return {blocked:true,reason:'먼저 침대에서 쉬어 주세요.'};return {x:8,y:6,area:s.area,interior:'hotel2f',...(s.zaIntroStage==='door'?{zaIntroStage:'complete',zaMission03Stage:1}:{}),transitioned:true,tile};}
  if(s.interior==='hotel'&&tile==='X'){if(['reception','room','door'].includes(s.zaIntroStage))return {blocked:true,reason:'접수와 202호에서의 휴식을 먼저 마쳐 주세요.'};return {x:11,y:6,area:s.area,interior:null,transitioned:true,tile};}
  if(!s.interior&&s.district==='lumiose-rooftop'&&tile==='X'&&x===22&&y===8)return {x:1,y:8,area:s.area,district:'lumiose-mission16-roof',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-mission16-roof'&&tile==='W'&&x===0&&y===8)return {x:21,y:8,area:s.area,district:'lumiose-rooftop',transitioned:true,tile};
  if(s.district==='lumiose-rooftop'&&tile==='X')return {x:14,y:7,area:s.area,district:'lumiose',transitioned:true,tile};
  if(s.district==='lumiose-rooftop'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(s.district==='lumiose-bureau'&&tile==='X')return s.zaBureauReturn==='rouge5'?{x:5,y:7,area:s.area,district:'lumiose-rouge-sector5',zaBureauReturn:null,transitioned:true,tile}:{x:19,y:7,area:s.area,district:'lumiose-zone3',zaBureauReturn:null,transitioned:true,tile};
  if(s.district==='lumiose-royale'&&tile==='X'){const destination=royaleReturnDestination(s);return destination?{...destination,area:s.area,zaRoyaleReturn:null,transitioned:true,tile}:{x:11,y:10,area:s.area,district:'lumiose',zaRoyaleReturn:null,transitioned:true,tile};}
  if(s.district==='lumiose'&&tile==='X')return {blocked:true,reason:'미르시티 안의 다른 길을 이용하세요.'};
  if(!s.interior&&s.district==='lumiose'&&tile==='s')return {x:21,y:8,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='W')return {x:1,y:8,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='W')return {x:1,y:8,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-vert-plaza',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-plaza'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert-plaza'&&tile==='E')return {x:11,y:15,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-floral'&&tile==='f')return {x:11,y:14,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&!s.zaVernalEastRoof&&!s.zaVernalSlowbroBank&&tile==='X'&&x===20&&y===16)return {x:18,y:1,area:s.area,district:'lumiose-aymlis-park',zaMission11ParkLower:false,transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vernal'&&tile==='X')return {x:11,y:1,area:s.area,district:'lumiose-floral',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-floral',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-floral'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-zone1',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-aymlis-park'&&!s.zaMission11ParkLower&&tile==='X'&&x===18&&y===0)return {x:20,y:15,area:s.area,district:'lumiose-vernal',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='X'&&x===22&&y===5)return {x:1,y:8,area:s.area,district:'lumiose-mission32-courtyard',zaMission32Layer:'ground',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-mission32-courtyard'&&(!s.zaMission32Layer||s.zaMission32Layer==='ground')&&tile==='X'&&x===0&&y===8)return {x:21,y:5,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='E')return {x:4,y:1,area:s.area,district:'lumiose-zone2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-vert2'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  // North entrance is documented; its precise connection to North Boulevard is a draft.
  // Rouge Sector 6 borders the southern cemetery gate; positions are draft.
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===22&&y===15)return {x:1,y:8,area:s.area,district:'lumiose-rouge-sector6',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector6'&&tile==='X'&&x===0&&y===8)return {x:21,y:15,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector6'&&tile==='X'&&x===11&&y===0)return {x:5,y:15,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='X'&&x===5&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector6',transitioned:true,tile};
  // Rouge Sector 8 links the cemetery's northern access to North Boulevard.
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===9&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-rouge-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector8'&&tile==='X'&&x===11&&y===0)return {x:9,y:15,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-sector8'&&tile==='X'&&x===11&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='X'&&x===15&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-rouge-sector8',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='X'&&x===11&&y===0)return {x:7,y:15,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='X'&&x===7&&y===16)return {x:11,y:1,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  // The cemetery's western entrance meets Rouge Street; coordinates are draft.
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='W'&&x===0&&y===10)return {x:21,y:14,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===22&&y===14)return {x:1,y:10,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X'&&x===15&&y===0)return {x:11,y:15,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='X'&&x===11&&y===16)return {x:15,y:1,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='E')return {x:21,y:8,area:s.area,district:'lumiose-zone4',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone4'&&tile==='E')return {x:21,y:4,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='E')return {x:1,y:4,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-north-boulevard'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-quasartico',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-quasartico'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-north-boulevard',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-vert2',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='W')return {x:11,y:15,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&tile==='X')return y===0?{x:11,y:15,area:s.area,district:'lumiose-rouge-north',transitioned:true,tile}:{x:1,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='X')return {x:11,y:1,area:s.area,district:'lumiose-zone3',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone3'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-centrico-route',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone2'&&tile==='E')return {x:21,y:8,area:s.area,district:'lumiose-vert-plaza',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-zone1'&&tile==='E')return {x:8,y:14,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-garden',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-garden'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-garden'&&tile==='E')return {x:1,y:8,area:s.area,district:'lumiose-site',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-site'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-garden',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-site'&&tile==='E')return cityProjectStage(s)===5?{x:1,y:8,area:s.area,district:'lumiose-wild',transitioned:true,tile}:{blocked:true,reason:'호텔에 정원 조사 결과를 보고한 뒤 야생 구역에 갈 수 있습니다.'};
  if(!s.interior&&s.district==='lumiose-wild'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-site',transitioned:true,tile};
  if(!s.interior&&s.district==='lumiose-wild'&&tile==='E')return wildStudyStage(s)>=3?{x:1,y:8,area:s.area,district:'lumiose-observation',transitioned:true,tile}:{blocked:true,reason:'야생 구역 안내원에게 조사 결과를 먼저 보고하세요.'};
  if(!s.interior&&s.district==='lumiose-observation'&&tile==='W')return {x:21,y:8,area:s.area,district:'lumiose-wild',transitioned:true,tile};
  if(['E','W'].includes(tile)&&s.expedition)return {x:3,y:8,area:9,expedition:null,regionId:1,locationId:0,nearSpecialRock:false,transitioned:true,tile};
  if(tile==='E'){
    if(s.area>0&&s.area<=8&&!s.badges.includes(TRAINERS[s.area-1].id))return {blocked:true,reason:`${TRAINERS[s.area-1].name}의 배지를 먼저 획득하세요.`};
    return {x:1,y:8,area:Math.min(9,s.area+1),transitioned:true,tile};
  }
  if(tile==='W'){
    if(s.area<=0)return {blocked:true,reason:'이곳이 모험의 시작점입니다.'};
    return {x:21,y:8,area:s.area-1,league:s.area===9&&s.league>0&&s.league<5?0:s.league,transitioned:true,tile};
  }
  return {x,y,area:s.area,tile,transitioned:false};
}
// Saved alpha positions are restricted to ordinary, traversable wild-zone tiles.
export function wildAlphaPosition(s){
 const p=s?.zaWildAlphaPosition;
 const valid=p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=1&&p.x<=21&&p.y>=1&&p.y<=15&&!(p.y===8&&p.x===3)&&!(p.y===3&&p.x>=8&&p.x<=16)&&Object.hasOwn(DIRECTIONS,p.facing);
 return valid?{x:p.x,y:p.y,facing:p.facing}:{x:3,y:5,facing:'down'};
}
function isBehindAlpha(s,target){
 const [fx,fy]=DIRECTIONS[wildAlphaPosition(s).facing],[dx,dy]=[s.x-target.x,s.y-target.y],dot=dx*fx+dy*fy,cross=dx*fy-dy*fx;
 return dot<0&&Math.abs(cross)<=-dot;
}
// Step-based pursuit is a provisional adaptation of Z-A's real-time chase.
export function stepWildAlphaPursuit(s){
 if(s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaAlert!==true||s.zaWildAlphaSpent===true)return false;
 const p=wildAlphaPosition(s),dx=s.x-p.x,dy=s.y-p.y;if(Math.abs(dx)+Math.abs(dy)<=1)return false;
 const candidates=[...(dx?[[Math.sign(dx),0,dx>0?'right':'left']]:[]),...(dy?[[0,Math.sign(dy),dy>0?'down':'up']]:[])];
 if(Math.abs(dy)>Math.abs(dx))candidates.reverse();const map=fieldMap(s);
 for(const [mx,my,facing] of candidates){const x=p.x+mx,y=p.y+my,tile=map[y]?.[x];if((x===s.x&&y===s.y)||!['.','g'].includes(tile))continue;s.zaWildAlphaPosition={x,y,facing};return true;}
 return false;
}
// A provisional three-tile, unobstructed straight aim on the tile map.
export function wildAlphaAim(s,grid){
 if(!s||s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaSpent===true||!Object.hasOwn(DIRECTIONS,s.facing))return null;
 const [dx,dy]=DIRECTIONS[s.facing],map=grid||fieldMap(s);
 for(let distance=1;distance<=3;distance++){
  const x=s.x+dx*distance,y=s.y+dy*distance,tile=map[y]?.[x];
  if(tile==='a')return {x,y,distance,back:isBehindAlpha(s,{x,y})};
  if(!walkable(tile)||'HMJDNQABOUV'.includes(tile))return null;
 }
 return null;
}
// Selecting the visible target permits a provisional grid ray in any direction.
export function wildAlphaTarget(s,grid){
 if(!s||s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaSpent===true||!Number.isInteger(s.x)||!Number.isInteger(s.y))return null;
 const map=grid||fieldMap(s),target=findTile(map,'a');if(!target||!walkable(map[s.y]?.[s.x]))return null;
 const dx=target.x-s.x,dy=target.y-s.y,distance=Math.max(Math.abs(dx),Math.abs(dy));if(distance<1||distance>3)return null;
 let x=s.x,y=s.y,err=Math.abs(dx)-Math.abs(dy);const sx=Math.sign(dx),sy=Math.sign(dy);
 while(x!==target.x||y!==target.y){const e=2*err,oldX=x,oldY=y;if(e> -Math.abs(dy)){err-=Math.abs(dy);x+=sx;}if(e<Math.abs(dx)){err+=Math.abs(dx);y+=sy;}
  if(x!==oldX&&y!==oldY&&!walkable(map[oldY]?.[x])&&!walkable(map[y]?.[oldX]))return null;
  const tile=map[y]?.[x];if(x===target.x&&y===target.y)break;if(!walkable(tile)||'HMJDNQABOUV'.includes(tile))return null;
 }
 return {...target,distance,back:isBehindAlpha(s,target)};
}
// Provisional fixed, one-tile view for the south-facing wild alpha.
export function wildAlphaSees(s){
 if(s.district!=='lumiose-wild'||s.interior||s.zaWildAlphaSpent===true)return false;
 const p=wildAlphaPosition(s),dx=s.x-p.x,dy=s.y-p.y;if(Math.abs(dx)+Math.abs(dy)>1)return false;const [fx,fy]=DIRECTIONS[p.facing];return dx*fx+dy*fy>=0;
}
// Lowercase terrain codes must never be treated as district NPCs on route maps.
export function cloudNpcTile(tile,s){if(tile==='n'&&s.district==='lumiose-magenta-sector8-route'&&!s.interior&&[1,2].includes(s.zaSide88Stage))return true;if(tile==='n'&&s.district==='lumiose-zone3'&&!s.interior&&!s.zaZone3TowerUpper&&rougeTaxiUnlocked(s))return true;if(tile==='n'&&s.district==='lumiose-centrico-route'&&!s.interior&&fastTravelEnabled(s))return true;if(tile==='n'&&s.district==='lumiose-vert-sector5'&&!s.interior&&s.zaRoyaleRank==='W'&&s.zaLidaStage===1)return true;if(tile==='n'&&s.district==='lumiose-south-boulevard'&&!s.interior&&!s.zaVert7RoofUpper&&(fastTravelEnabled(s)||(s.zaMission04Started===true&&s.zaRoyaleRank==='Z')))return true;if(tile==='d'&&s.district==='lumiose-vert-sector6'&&!s.interior&&s.zaRoyaleRank==='V'&&!s.zaMysteryTrail&&[1,2,3].includes(s.zaMission09Chase))return true;if(tile==='n'&&s.district==='lumiose-rouge-sector6'&&!s.interior&&s.zaMission07Started===true&&s.zaRoyaleRank==='X'&&s.zaNaveenComplete===true)return true;if(tile==='n'&&s.district==='lumiose-bleu-plaza-route'&&!s.interior&&s.zaMission06Started===true&&s.zaRoyaleRank==='Y')return true;if(tile==='n'&&s.district==='lumiose-zone1'&&!s.interior&&s.zaMission03Stage>=3&&s.zaMission03Stage<=7)return true;if(tile==='n'&&s.district==='lumiose-jaune-sector9'&&!s.interior)return true;if(tile==='n'&&s.district==='lumiose-magenta-sector3-roof'&&!s.interior)return true;if(tile==='d'&&s.district==='lumiose-mission12-jaune3'&&(!s.zaMission12Layer||s.zaMission12Layer==='ground'))return true;if(tile==='u'&&s.district==='lumiose-sewer'&&s.zaMission19Inner===true)return true;if(tile==='q'&&s.district==='lumiose-vert-sector4'&&!s.interior&&!['roof','courtyard'].includes(s.zaVert4Layer)&&s.zaMission25Started&&!s.zaMission25Complete)return true;if(s.interior==='canariQuiz'&&tile==='t')return true;if(s.interior==='cafeGallant'&&tile==='n')return true;if((s.interior==='racineGarage'&&tile==='d')||(s.interior==='racineRoom'&&tile==='c'))return true;if('NQRF DABOUV'.replaceAll(' ','').includes(tile||'!'))return true;if(tile==='n'&&s.district==='lumiose'&&!s.interior&&(s.zaMission10Stage===1||s.zaMission03Stage===1))return true;if(tile==='j'&&s.district==='lumiose-quasartico')return true;const districtNpc={j:'lumiose-zone3',e:'lumiose-bureau',t:'lumiose-zone3',m:'lumiose-rouge-north',v:'lumiose-zone3',u:'lumiose-rooftop',n:'lumiose-rooftop'};return !!tile&&districtNpc[tile]===s.district&&!!s.district;}
export function cloudInteractionTile(tile,s){if(s.district==='lumiose-protect'&&!s.interior&&s.zaProtectScaffoldV1&&s.zaProtectScaffoldUpper&&s.zaMission37Stage===4&&tile==='l')return true;if(s.district==='lumiose-lysandre-lab'&&!s.interior&&s.zaLysandreWing==='e'&&s.zaLysandreBossRoomV5&&tile==='f')return true;if(!s.interior&&((s.district==='lumiose-station-alley'&&tile==='l')||(s.district==='lumiose-station-roof'&&['l','v'].includes(tile))))return true;if(tile==='k'&&s.district==='lumiose-royale'&&s.zaRoyaleRank==='V'&&s.zaMission10Stage===4)return true;if(tile==='*'&&s.district==='lumiose-zone9'&&!s.interior&&s.zaZone9Upper===true)return true;if(s.district==='lumiose-lysandre-lab'&&s.zaLysandreFloor===2&&['l','o'].includes(tile))return true;if(s.district==='lumiose-lysandre-lab'&&s.zaLysandreFloor!==3&&['v','w','x'].includes(tile))return true;if(s.district==='lumiose-lysandre-lab'&&s.zaLysandreMazeV2===true&&s.zaLysandreFloor!==3&&['n','p','q','t','u','h'].includes(tile))return true;if(s.district==='lumiose-floral'&&s.interior==='lumioseLab2'&&['i','n','o'].includes(tile))return true;if(s.district==='lumiose-museum-front'&&['museum1','museum2'].includes(s.interior)&&['l','t'].includes(tile))return true;return !!tile&&((tile==='^'&&!s.interior&&['lumiose','lumiose-zone17'].includes(s.district))||(s.district==='lumiose-zone1'&&!s.interior&&s.zaMission03Stage===4&&tile==='f')||(!s.interior&&s.district==='lumiose-bleu-cafe2'&&tile==='s')||(!s.interior&&s.district==='lumiose-mission21-glide'&&['j','l'].includes(tile))||(!s.interior&&s.district==='lumiose-magenta-sector6-roof'&&tile==='j')||(!s.interior&&s.district==='lumiose-mission32-courtyard'&&['j','l'].includes(tile))||(!s.interior&&s.district==='lumiose-mission12-jaune3'&&tile==='l')||(s.interior==='canariQuiz'&&tile==='w')||(!s.interior&&s.district==='lumiose-magenta6-scaffold'&&['l','j'].includes(tile))||(!s.interior&&s.district==='lumiose-magenta3-gap'&&tile==='l')||(!s.interior&&s.district==='lumiose-centrico-route'&&tile==='G')||(!s.interior&&s.district==='lumiose-rouge-north'&&tile==='h')||(!s.interior&&s.district==='lumiose-lune-roof'&&['h','l'].includes(tile))||(!s.interior&&['lumiose-rust','lumiose-rust-roof'].includes(s.district)&&tile==='l')||(!s.interior&&['lumiose-vert-sector6','lumiose-vert6-roof'].includes(s.district)&&tile==='l')||(!s.interior&&s.district==='lumiose-vert-sector4'&&['j','v','l'].includes(tile))||(!s.interior&&s.district==='lumiose-vert2'&&s.zaVert2RoofUpper===true&&tile==='j')||(!s.interior&&s.district==='lumiose-vert2'&&tile==='l')||(!s.interior&&s.district==='lumiose-bleu-sector7'&&tile==='l')||(!s.interior&&s.district==='lumiose-magenta-sector9'&&tile==='l')||(!s.interior&&s.district==='lumiose-zone12'&&tile==='l')||(!s.interior&&s.district==='lumiose-coulant-route'&&tile==='l')||(!s.interior&&s.district==='lumiose-hibernal-approach'&&tile==='j')||(!s.interior&&s.district==='lumiose-zone16'&&tile==='l')||(!s.interior&&['lumiose-rouge-sector7','lumiose-rouge7-roof'].includes(s.district)&&tile==='l')||(!s.interior&&s.district==='lumiose-south-boulevard'&&tile==='j')||(!s.interior&&s.district==='lumiose-rouge-sector3-roof'&&tile==='l')||(!s.interior&&['lumiose-vernal','lumiose-cafe-woof-roof'].includes(s.district)&&tile==='l')||(['lumiose-bleu-sector4','lumiose-bleu4-tunnel'].includes(s.district)&&!s.interior&&tile==='l')||(s.district==='lumiose-bleu-sector8'&&!s.interior&&tile==='s')||(s.district==='lumiose-passage-felicite'&&!s.interior&&!!FELICITE_SHOPS[tile])||(s.district==='lumiose-galerie-lune'&&!s.interior&&!!LUNE_SHOPS[tile])||(s.district==='lumiose-ombrage-arcade'&&!s.interior&&!!OMBRAGE_SHOPS[tile])||(!s.interior&&['lumiose-zone1','lumiose-zone1-roof'].includes(s.district)&&(tile==='l'||(s.district==='lumiose-zone1-roof'&&tile==='k')))||( !s.interior&&s.district==='lumiose-mission23-roof'&&tile==='l')||(!s.interior&&s.district==='lumiose-bleu-sector5'&&tile==='s')||(!s.interior&&['lumiose-magenta-sector6','lumiose-magenta-sector6-roof'].includes(s.district)&&tile==='l')||(s.district==='lumiose-passage-palais'&&!s.interior&&!!PALAIS_SHOPS[tile])||(s.district==='lumiose-zone5'&&!s.interior&&!s.zaZone5Upper&&tile==='s')||(s.district==='lumiose-espace-vide'&&!s.interior&&tile==='l')||(s.district==='lumiose-zone20'&&!s.interior&&(!!zone20Visible(s,tile)||!!zone20Item(s,tile)))||(s.district==='lumiose-zone19'&&!s.interior&&(tile==='r'||!!zone19Visible(s,tile)||!!zone19Item(s,tile)))||(s.district==='lumiose-zone18'&&!s.interior&&(tile==='l'||!!zone18Visible(s,tile)||!!zone18Item(s,tile)))||(s.district==='lumiose-zone17'&&!s.interior&&(tile==='l'||!!zone17Visible(s,tile)||!!zone17Item(s,tile)))||(s.district==='lumiose-zone16'&&!s.interior&&(!!zone16Visible(s,tile)||!!zone16Item(s,tile)))||(s.district==='lumiose-zone15'&&!s.interior&&('qlnr'.includes(tile)||!!zone15Visible(s,tile)||!!zone15Item(s,tile)))||(s.district==='lumiose-zone14'&&!s.interior&&(tile==='r'||!!zone14Visible(s,tile)||!!zone14Item(s,tile)))||(s.district==='lumiose-zone13'&&!s.interior&&(!!zone13Visible(s,tile)||!!zone13Item(s,tile)))||(s.district==='lumiose-zone12'&&!s.interior&&(tile==='r'||!!zone12Visible(s,tile)||!!zone12Item(s,tile)))||(tile==='0'&&['lumiose-research-zone','lumiose-zone5','lumiose-zone9','lumiose-zone11'].includes(s.district)&&!s.interior)||(s.district==='lumiose-zone10'&&!s.interior&&(tile==='l'||!!zone10Visible(s,tile)||!!zone10Item(s,tile)))||(s.district==='lumiose-zone9'&&!s.interior&&('lh'.includes(tile)||!!zone9Visible(s,tile)||!!zone9Item(s,tile)))||(s.district==='lumiose-zone8'&&!s.interior&&(!!zone8Visible(s,tile)||!!zone8Item(s,tile)))||(s.district==='lumiose-zone11'&&!s.interior&&!!zone11Visible(s,tile))||(s.district==='lumiose-zone6'&&!s.interior&&('lhtjvi'.includes(tile)||!!zone6Visible(s,tile)))||(s.district==='lumiose-zone5'&&!s.interior&&(tile==='l'||(s.zaZone5Upper&&tile==='k')))|| (tile==='0'&&s.district==='lumiose-zone3'&&!s.interior&&s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('steelix')))|| (tile==='0'&&['lumiose-rouge-north','lumiose-lune-roof'].includes(s.district)&&!s.interior&&s.zaMission41Stage===3)|| (s.district==='lumiose-protect'&&!s.interior&&!!protectWave(s,tile))|| (!!s.district&&s.district==='lumiose-lysandre-lab'&&'abegkjl'.includes(tile))||(tile==='0'&&s.district==='lumiose-site'&&!s.interior&&[3,4,5].includes(s.zaMission35Stage))|| (!!mission31Case(s,tile)&&(s.zaMission31Stage===3||s[`zaMission${mission31Case(s,tile).n}RewardPending`]===true))|| (!!mission26Case(s,tile)&&(s.zaMission26Stage===3||s[`zaMission${mission26Case(s,tile).n}RewardPending`]===true))||'HMGNLCPQSIRJTFKYDZABOUV'.includes(tile)||(tile==='l'&&s.district==='lumiose-rouge-north')||(tile==='y'&&s.district==='lumiose-quasartico')||(!!s.district&&'rajbetqmzvhucxdnpio'.includes(tile)));}
export function interactionAt(s,map=fieldMap(s)){
  const [dx,dy]=DIRECTIONS[s.facing]||DIRECTIONS.down;
  for(const [x,y]of [[s.x,s.y],[s.x+dx,s.y+dy]]){
    const p=s.zaMission03CompanionPosition;if((x!==s.x||y!==s.y)&&s.zaMission03Stage===2&&s.zaMission03DetourRequired===true&&!s.interior&&p?.district===s.district&&p.x===x&&p.y===y&&!cloudInteractionTile(map[y]?.[x],s))return {x,y,tile:'@'};
    const tile=map[y]?.[x];if(cloudInteractionTile(tile,s))return {x,y,tile};
  }
  return null;
}
// Original benches unlock after the Mission 5 Mega Evolution scene.
export function benchRestUnlocked(s){return s.zaEmmaMegaSeen===true||s.zaMission06Started===true||/^[A-X]$/.test(s.zaRoyaleRank||'');}
export function isAdventureBench(s,spot=interactionAt(s)){return !s.interior&&spot?.tile==='^'&&((s.district==='lumiose'&&spot.x===2&&spot.y===5)||(s.district==='lumiose-zone17'&&!s.zaZone17Upper&&!s.zaZone17Promenade&&spot.y===14&&[4,6,16,18].includes(spot.x)));}
export function leagueIndex(s){const spot=interactionAt(s);return spot?.y===4?[8,11,14,17,20].indexOf(spot.x):-1;}
function fieldDialogueCore(s,spot){
  if(!spot)return null;
  if(spot.tile==='@'&&s.zaMission03Stage===2&&s.zaMission03DetourRequired===true)return {name:'팀 MZ 동료',text:s.district==='lumiose-station-roof'?'옥상 끝에서 내려가 포켓몬센터로 가자.':s.district==='lumiose-station-alley'?'사다리를 타고 옥상으로 올라가자.':'길이 막혔어. 골목으로 돌아가자.'};
  if(s.district==='lumiose-rust'&&s.interior==='rustOffice'&&spot.tile==='z'&&spot.x===14&&spot.y===6)return adventureEvResetUnlocked(s)?{name:'Lady Clear (위치 초안)',text:'메가조각 5개로 선택한 파티 포켓몬의 노력치를 모두 초기화합니다.',action:'chooseEvReset',label:'포켓몬 선택'}:{name:'Lady Clear (위치 초안)',text:'미션 20을 마치면 노력치 초기화 서비스를 이용할 수 있습니다.'};
  if(!s.interior&&s.district==='lumiose-museum-front'&&spot.tile==='u'&&spot.x===11&&spot.y===6)return {name:'미르미술관 (입구 초안)',text:'미술관에 들어가자.',action:'enterMuseum',label:'미술관 들어가기'};
  if(museumSide21Requester(s,spot)&&museumSide21Available(s))return s.zaSide21Complete?{name:'Bundo와 Wanda',text:'열두 분떠도리를 찾아 주어 고마워요.'}:s.zaSide21Started?{name:'Bundo와 Wanda',text:`분떠도리 ${Array.isArray(s.zaSide21Found)?s.zaSide21Found.length:0}/12마리를 찾았다.`,action:'side21Report',label:'의뢰 보고'}:{name:'Bundo와 Wanda',text:'미술관에 숨어 있는 분떠도리 열두 마리를 찾아 주세요.',action:'side21Start',label:'의뢰 받기'};
  {const id=museumSide21Spot(s,spot);if(id&&s.zaSide21Started&&!s.zaSide21Complete&&!(s.zaSide21Found||[]).includes(id))return {name:'분떠도리 (위치 초안)',text:'전시 곁에 숨어 있는 분떠도리를 찾았다.',action:'side21Find',label:'분떠도리 찾기'};}
  if(s.district==='lumiose-museum-front'&&['museum1','museum2'].includes(s.interior)&&spot.tile==='l'&&spot.x===18&&spot.y===5)return {name:'미술관 계단 (배치 초안)',text:s.interior==='museum1'?'2층의 히스이 전시로 올라간다.':'1층 전시실로 내려간다.',action:'museumStairs',label:s.interior==='museum1'?'2층으로':'1층으로'};
  if(s.district==='lumiose-museum-front'&&['museum1','museum2'].includes(s.interior)&&spot.tile==='t'&&spot.y===4){const second=s.interior==='museum2',left=spot.x===5;if(spot.x===5||spot.x===17)return {name:second?'히스이 특별전 (배치 초안)':'칼로스 전시 (배치 초안)',text:second?(left?'옛 히스이에서 사용한 수제 몬스터볼 복제품이다.':'옛 신오의 신전을 그린 작품이다.'):(left?'칼로스의 풍경을 담은 작품이다.':'마스터타워와 메가진화의 역사를 소개한다.')};}
  if(isStationSpot(s,spot))return stationDialogue(s);
  if(!s.interior&&s.district==='lumiose-station-alley'&&spot.tile==='l')return {name:'골목 사다리 (위치 초안)',text:'사다리를 타고 옥상으로 올라간다.',action:'stationDetourLadder',label:'옥상으로 올라가기'};
  if(!s.interior&&s.district==='lumiose-station-roof'&&spot.tile==='l')return {name:'옥상 사다리 (위치 초안)',text:'사다리를 타고 골목으로 내려간다.',action:'stationDetourLadder',label:'골목으로 내려가기'};
  if(!s.interior&&s.district==='lumiose-station-roof'&&spot.tile==='v')return {name:'옥상 끝 (위치 초안)',text:'아래 거리로 내려간다.',action:'stationDetourDrop',label:'거리로 내려가기'};
  if(!s.interior&&s.district==='lumiose-rouge-sector2'&&spot.tile==='u'&&spot.x===5&&spot.y===5)return {name:'레스토랑 르 와우 (위치 초안)',text:'레스토랑에 들어가자.',action:'enterLeWow',label:'식당 들어가기'};
  if(s.interior==='leWow'&&s.district==='lumiose-rouge-sector2'&&spot.tile==='R'){
    if(s.zaLeWowRewardPending)return {name:'레스토랑 안내원',text:'코스를 완주했습니다. 보상을 받아 주세요.',action:'claimLeWowReward',label:'보상 받기'};
    if(s.zaLeWowRun)return {name:'레스토랑 안내원',text:`다음은 ${s.zaLeWowRun.course+1}코스입니다. 코스 사이에는 회복할 수 없습니다.`,actions:[{action:'leWowNext',label:'다음 코스 시작'},{action:'leWowCancel',label:'도전 중단'}]};
    if(!leWowAvailable(s))return {name:'레스토랑 안내원',text:'메인 미션 31을 시작하면 배틀 코스에 도전할 수 있습니다.'};
    return s.zaLeWowCompleted?{name:'레스토랑 안내원',text:'100,000코인으로 10코스에 다시 도전할 수 있습니다.',action:'leWowRepeat',label:'재도전 · 100,000코인'}:{name:'레스토랑 안내원',text:'첫 도전은 무료입니다. 10코스를 연속으로 배틀하며 사이에 회복할 수 없습니다.',action:'leWowStart',label:'10코스 도전'};
  }
  if(side88Destination(s,spot))return s.zaSide88Stage===1?{name:'Tesse · 마젠타 센터 (위치 초안)',text:'첫 손님을 무사히 모셨다. Tesse와 배틀하자.',action:'side88Battle',label:'Tesse와 배틀'}:{name:'Tesse · 마젠타 센터 (위치 초안)',text:'첫 승차와 배틀을 마쳤다. 의뢰 보상을 받자.',action:'side88Reward',label:'의뢰 보상 받기'};
  if(taxiAvailable(s,spot))return {name:side88Origin(s,spot)&&!s.zaSide88Stage?'Tesse · 루주 광장 (위치 초안)':'택시 승강장 (위치 초안)',text:side88Origin(s,spot)&&!s.zaSide88Stage?'첫 손님이 되어 마젠타 포켓몬센터로 무료 탑승할 수 있다.':'710코인으로 목적지까지 이동합니다.',actions:[...(side88Origin(s,spot)&&!s.zaSide88Stage?[{action:'side88Ride',label:'Tesse의 첫 택시 무료 탑승'}]:[]),...taxiDestinations(s).map(c=>({action:`taxi-${c.id}`,label:`${c.name} · 710코인`}))]};
  if(s.district==='lumiose-vert-sector5'&&!s.interior&&spot.tile==='n'&&spot.x===5&&spot.y===4&&lidaBattleAction(s))return {name:'Lida · 베르 5번지 안뜰 (위치 초안)',text:'연습 중인 Lida에게 맡아 온 물건을 전하고 배틀하자.',action:'battleLida',label:'물건을 전하고 Lida와 배틀'};
  if(s.district==='lumiose-south-boulevard'&&!s.interior&&!s.zaVert7RoofUpper&&spot.tile==='n'&&spot.x===14&&spot.y===6&&s.zaMission04Started===true&&s.zaRoyaleRank==='Z')return royaleZReady(s)?{name:'Zach · 택시 승강장 (위치 초안)',text:'도전권을 확인하고 승급전을 치르자.',action:'royaleZach',label:'Zach와 승급전'}:{name:'Zach · 택시 승강장 (위치 초안)',text:'밤의 배틀 존에서 세 트레이너를 이겨 도전권을 얻자.'};
  if(s.district==='lumiose-vert-sector6'&&!s.interior&&spot.tile==='d'&&s.zaRoyaleRank==='V'&&!s.zaMysteryTrail&&[1,2,3].includes(s.zaMission09Chase))return {name:'정체불명의 포켓몬 (추적 위치 초안)',text:'Emma가 따라가 달라고 했다. 포켓몬의 뒤를 쫓자.',action:'mission09Chase',label:'포켓몬 따라가기'};
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&spot.tile==='u'&&spot.x===15&&spot.y===12)return {name:'레스토랑 르 나 (입구 초안)',text:'식당 안으로 들어가자.',action:'enterLeNah',label:'식당 들어가기'};
  if(s.interior==='leNah'&&s.district==='lumiose-vert-sector6'&&spot.tile==='R')return s.zaMission08Started===true&&s.zaRoyaleRank==='W'&&lidaStage(s)>=2?(royaleWReady(s)?{name:'Rintaro · 레스토랑 르 나',text:'도전권을 확인하고 승급전을 치르자.',action:'royaleRintaro',label:'Rintaro와 승급전'}:{name:'Rintaro · 레스토랑 르 나',text:'밤의 배틀 존에서 티켓포인트 5000점을 모으자.'}):{name:'레스토랑 르 나',text:'Rintaro가 운영하는 식당이다. 식당 서비스와 내부 배치는 초안이다.'};
  if(s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard===true&&!s.interior&&spot.tile==='n'&&spot.x===11&&spot.y===6&&s.zaMission07Started===true&&s.zaRoyaleRank==='X'&&s.zaNaveenComplete===true)return royaleXReady(s)?{name:'Xavi · 학교 안뜰 (배치 초안)',text:'도전권을 얻었다. 승급전에 도전하자.',action:'royaleXavi',label:'Xavi와 승급전'}:{name:'Xavi · 학교 안뜰 (배치 초안)',text:'밤의 배틀 존에서 티켓포인트 4000점을 모으자.'};
  if(s.district==='lumiose-rouge-sector6'&&s.zaAcademyCourtyard!==true&&!s.interior&&spot.tile==='n'&&spot.x===9&&spot.y===6&&s.zaMission07Started===true&&s.zaRoyaleRank==='X'&&s.zaNaveenComplete===true)return royaleXReady(s)?{name:'Xavi · 학교 접근 (위치 초안)',text:'도전권을 얻었다. Académie Étoile 인근에서 승급전에 도전하자.',action:'royaleXavi',label:'Xavi와 승급전'}:{name:'Xavi · 학교 접근 (위치 초안)',text:'밤의 배틀 존에서 티켓포인트 4000점을 모으자.'};
  if(s.district==='lumiose-bleu-plaza-route'&&!s.interior&&spot.tile==='n'&&spot.x===9&&spot.y===6&&s.zaMission06Started===true&&s.zaRoyaleRank==='Y')return royaleYReady(s)?{name:'Yvon · 블루 광장 (위치 초안)',text:'도전권을 얻었다. 승급전에 도전하자.',action:'royaleYvon',label:'Yvon과 승급전'}:{name:'Yvon · 블루 광장 (위치 초안)',text:'밤의 배틀 존에서 티켓포인트 3000점을 모으자.'};
  if(isAdventureBench(s,spot))return benchRestUnlocked(s)?{name:'벤치 (위치 초안)',text:'벤치에서 쉬며 시간을 바꾸자.',actions:[{action:'benchMorning',label:'아침까지 쉬기'},{action:'benchNight',label:'밤까지 쉬기'}]}:{name:'벤치 (위치 초안)',text:'Emma의 메가진화 이야기를 들은 뒤 시간을 바꿀 수 있다.'};
  if(s.district==='lumiose-zone1'&&!s.interior&&spot.tile==='n'&&spot.x===5&&spot.y===7&&s.zaMission03Stage>=3&&s.zaMission03Stage<=7){const stage=s.zaMission03Stage;return stage===3?{name:'팀 MZ 동료 (위치 초안)',text:'몬스터볼 10개를 받고 포획을 연습하자.',action:'mission03Supplies',label:'몬스터볼 받기'}:stage===6?{name:'팀 MZ 동료 (위치 초안)',text:'파르빗을 잡았다. 몬스터볼 10개를 더 받자.',action:'mission03Bonus',label:'몬스터볼 받기'}:stage===7?{name:'팀 MZ 동료 (위치 초안)',text:'도감에 다섯 종을 등록하면 연구소로 가자.',action:'mission03ResearchReady',label:'도감 확인'}:{name:'팀 MZ 동료 (위치 초안)',text:'포획을 연습하자. 볼이 바닥났다면 다시 받을 수 있다.',action:'mission03Refill',label:'볼이 없을 때 받기'};}
  if(s.district==='lumiose-zone1'&&!s.interior&&s.zaMission03Stage===4&&spot.tile==='f'&&spot.x===8&&spot.y===6)return {name:'화살꼬빈 (튜토리얼 위치 초안)',text:'몬스터볼을 던져 포획을 연습하자.',action:'mission03Fletchling',label:'몬스터볼 던지기'};
  if(s.district==='lumiose-zone1'&&!s.interior&&s.zaMission03Stage===5&&spot.tile==='b'&&spot.x===14&&spot.y===6)return {name:'파르빗 (튜토리얼 위치 초안)',text:'파트너와 배틀한 뒤 포획하자.',action:'mission03Bunnelby',label:'파르빗과 배틀'};
  if(s.district==='lumiose-floral'&&s.interior==='lumioseDirector'&&spot.tile==='R'&&s.zaMission03Stage===8)return {name:'Mable · 연구소 소장실',text:'도감 등록과 연구 요청을 확인하자.',action:'mission03Mable',label:'Mable과 이야기'};
  if(s.district==='lumiose'&&s.interior==='hotel'&&spot.tile==='F'&&s.zaMission05Stage===1)return {name:'호텔 Z · 팀 MZ',text:'승급을 축하해! 프리즘타워로 가는 옥상 길을 함께 살펴보자.',action:'mission05Hotel',label:'동료와 이야기'};
  if(s.district==='lumiose'&&s.interior==='hotel'&&spot.tile==='F'&&s.zaMission03Stage===9)return {name:'호텔 Z · 팀 MZ',text:'연구소에서 돌아왔다. 동료와 이야기하자.',action:'mission03Hotel',label:'동료와 이야기'};

  if(s.district==='lumiose'&&s.interior==='hotel'&&spot.tile==='F'&&s.zaIntroStage==='reception')return {name:'AZ · 호텔 접수처',text:'202호 열쇠를 받고 2층 객실로 가자.',action:'introReception',label:'202호 열쇠 받기'};
  if(s.district==='lumiose'&&s.interior==='hotel202'&&spot.tile==='z'&&s.zaIntroStage==='room')return {name:'202호 침대',text:'침대에서 쉬고 내일 동료를 만나자.',action:'introSleep',label:'침대에서 쉬기'};
  if(s.district==='lumiose'&&!s.interior&&spot.tile==='n'&&s.zaMission03Stage===1)return {name:'팀 MZ 동료 (위치 초안)',text:'남은 두 스타터와 함께 배틀하자.',action:'introRivalBattle',label:'동료와 배틀'};

  if(!s.interior&&s.district==='lumiose-sewer'&&s.zaSewerIceBranch===true){
    if(spot.tile==='i'&&!s.zaSewerIceBridge)return {name:'하수도의 얼음 (위치 초안)',text:'공격 기술로 얼음을 쓰러뜨려 물 위의 다리를 만들자.',action:'sewerIceBridge',label:'얼음 쓰러뜨리기'};
    const item=sewerBranchItem(s,spot.x,spot.y);if(spot.tile==='o'&&item)return {name:`${item.name} (위치 초안)`,text:'하수도 갈림길에서 도구를 발견했다.',action:`sewerBranchItem-${item.id}`,label:'도구 줍기'};
    if(spot.tile==='o'&&spot.x===4&&spot.y===8&&!s.zaSewerCrunchTM)return {name:'기술머신 025 (위치 초안)',text:'물 건너편에서 깨물어부수기 기술머신을 발견했다.',action:'sewerCrunchTM',label:'기술머신 줍기'};
  }
  if(!s.interior&&s.district==='lumiose-sewer'&&!s.zaMission19Inner&&!s.zaSewerIceBranch&&spot.tile==='o'){const item=sewerSouthItem(s,spot.x,spot.y);if(item)return {name:`${item.name} (위치 초안)`,text:'하수도 남쪽에서 도구를 발견했다.',action:`sewerSouthItem-${item.id}`,label:'도구 줍기'};}
  if(!s.interior&&s.district==='lumiose-sewer'&&!s.zaMission19Inner&&!s.zaSewerIceBranch&&spot.tile==='t'&&spot.x===2&&spot.y===10)return {name:'하수도 서쪽 분기 (배치 초안)',text:'갈림길을 지나 얼음이 있는 방으로 간다.',action:'enterSewerIceBranch',label:'서쪽 분기 살펴보기'};
  // Mission 5 continues outside the bureau; the entrance position is a draft.
  if(!s.interior&&s.district==='lumiose-rouge-sector5'&&spot.tile==='b'&&s.zaEmmaMet&&s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3&&(!s.zaEmmaBattleComplete||!s.zaEmmaMegaSeen))return {name:'탐정사무소 앞 (위치 초안)',text:s.zaEmmaBattleComplete?'Emma가 전룡의 메가진화에 대해 이야기한다.':'세 의뢰를 마친 뒤 사무소 밖에서 Emma와 배틀하자.',actions:[{action:s.zaEmmaBattleComplete?'seeEmmaMega':'battleEmma',label:s.zaEmmaBattleComplete?'메가진화 이야기 듣기':'Emma와 배틀'},{action:'enterBureau',label:'사무소에 들어가기'}]};
  if(!s.interior&&spot.tile==='o'&&((s.district==='lumiose-zone9'&&s.zaZone9Upper===true&&spot.y===11&&[7,15].includes(spot.x))||(s.district==='lumiose-zone9-scaffold'&&spot.y===7&&[3,19].includes(spot.x))))return {name:'옥상과 비계 연결 (배치 초안)',text:'남쪽 비계를 통해 두 지붕 사이를 이동한다. 높이와 연결은 초안이다.',action:'zone9SouthScaffold',label:s.district==='lumiose-zone9'?'비계로':'옥상으로'};
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&spot.tile==='q'&&spot.x===13&&spot.y===13){const available=s.zaMission25Started||s.zaMission24Complete||['C','B','A'].includes(s.zaRoyaleRank);return s.zaSide72Complete?{name:'Terri (위치 초안)',text:'갈라르 메더를 찾아줘서 고마워.'}:s.zaSide72Stage===1?{name:'Terri · 메더 수색 (위치 초안)',text:'구역 11 남서쪽 강변의 몬스터볼처럼 생긴 메더를 찾아보자.'}:available?{name:'Terri · 갈라르 메더 수색 (위치 초안)',text:'야생 구역 11에서 사라진 갈라르 메더를 찾아 달라고 한다.',action:'side72Start',label:'수색 의뢰 받기'}:{name:'Terri (위치 초안)',text:'이곳에서 포켓몬을 기다리고 있다.'};}
  if(!s.interior&&s.district==='lumiose-zone11'&&spot.tile==='u'&&spot.x===3&&spot.y===10&&s.zaSide72Stage===1&&!s.zaSide72Complete)return {name:'수상한 몬스터볼 (위치 초안)',text:'강변의 몬스터볼을 확인하자.',action:'side72Find',label:'확인하기'};
  if(!s.interior&&['lumiose-zone11-sw-top','lumiose-zone11-sw-middle'].includes(s.district)&&spot.x===11&&((s.district==='lumiose-zone11-sw-top'&&spot.tile==='h'&&spot.y===12)||(s.district==='lumiose-zone11-sw-middle'&&((spot.tile==='j'&&spot.y===4)||(spot.tile==='h'&&spot.y===12)))))return {name:'남서쪽 계단 (배치 초안)',text:'강변과 도시 사이의 두 구간 계단이다. 좌표와 형태는 초안이다.',action:'zone11SouthwestStairs',label:spot.tile==='j'?'올라가기':'내려가기'};
  if(!s.interior&&spot.tile==='j'&&((s.district==='lumiose-zone16'&&!s.zaZone16Upper&&spot.x===17&&spot.y===6)||(s.district==='lumiose-zone16-garden'&&spot.x===17&&spot.y===12)))return {name:'높은 정원 계단 (연결 초안)',text:'높은 정원은 확인되었지만 계단과 세부 배치는 초안이다.',action:'zone16GardenStairs',label:s.district==='lumiose-zone16'?'정원으로':'광장으로'};
  if(!s.interior&&spot.tile==='h'&&((s.district==='lumiose-zone2'&&spot.x===3&&spot.y===3)||(s.district==='lumiose-zone2-overlook'&&spot.x===4&&spot.y===13)))return {name:'전망대 계단 (연결 초안)',text:'높은 전망 지형은 원작에 있지만 계단 연결과 배치는 확인 중이다.',action:'zone2Overlook',label:s.district==='lumiose-zone2'?'전망대로':'아래로'};
  if(spot.tile==='j'&&s.district==='lumiose-jaune-sector2'&&!s.interior)return {name:'정의단 도장 입구 (위치 초안)',text:'존느 구역 2의 도장으로 들어가자.',action:'enterJusticeDojo',label:'도장 들어가기'};
  if(s.interior==='justiceDojo'&&s.district==='lumiose-jaune-sector2'){
    if(spot.tile==='h')return s.zaMission37Complete?{name:'대단한 특훈 담당자 (위치 초안)',text:'가방에서 병뚜껑을 사용해 레벨 50 이상 선두 포켓몬을 특훈하자.',hyperTraining:true}:{name:'도장 단원',text:'대단한 특훈은 미션 37 이후 이용할 수 있다.'};
    if(spot.tile==='j'){if(s.zaSide118Stage===1)return {name:'Gwynn · Gengar 수색',text:'Gwynn과 배틀하고 수색을 부탁하자.',action:'side118Gwynn',label:'Gwynn과 배틀'};if(s.zaMission19Stage===1&&rankEPoints(s)>=35000&&!s.zaMission19JoseeWon)return {name:'Josée',text:'승급전 전에 배틀하자.',action:'mission19Josee',label:'Josée와 배틀'};if(s.zaMission19Stage===2&&s.zaMission19SeedPending)return {name:'Josée',text:'승리 보상을 받자.',action:'mission19Seed',label:'숙달의씨 받기'};if(s.zaMission39Started&&!s.zaSide117Complete){if(s.zaSide117Stage===2)return {name:'Josée · 수련 완료',text:'도장의 위기를 해결했다. 보상을 받자.',action:'side117Reward',label:'보상 받기'};if(s.zaSide117Stage===1)return {name:'Josée · 수련',text:'우두머리 부란다 두 마리가 나타났다. 기존 턴제에서는 한 마리씩 상대한다.',action:'side117Pangoro',label:'부란다와 배틀'};return {name:'Josée · 수련',text:'Josée와 대련하자.',action:'side117Josee',label:'대련 시작'};}return {name:'Josée (위치 초안)',text:'정의단에서 함께 수련하자.'};}
    if(spot.tile==='d'){if(s.zaMission19Stage===14)return {name:'Ivor',text:'Gwynn을 찾았다. 승급전에 도전하자.',action:'mission19Ivor',label:'Ivor와 배틀'};if(s.zaMission19Stage===15)return {name:'Ivor',text:'승급 보상을 받자.',action:'mission19Reward',label:'보상 받기'};return {name:'정의단 도장 (배치 초안)',text:'정의단의 훈련장이다.'};}
  }
  if(!s.interior&&s.district==='lumiose-vert-sector9'&&spot.tile==='z'&&s.zaSide118Stage===3)return {name:'Gwynn · 수로 (위치 초안)',text:'물가에서 Gengar의 흔적을 살피자.',action:'side118Waterway',label:'수로 조사'};
  if(!s.interior&&s.district==='lumiose-galerie-lune'&&spot.tile==='z'&&[4,5].includes(s.zaSide118Stage))return s.zaSide118Stage===4?{name:'Gwynn · 갤러리 (위치 초안)',text:'쇼핑 아케이드에서 Gengar를 찾자.',action:'side118Gallery',label:'Gengar 찾기'}:{name:'Gänger와 Gwynn',text:'Gengar와 다시 만났다. 보상을 받자.',action:'side118Reward',label:'보상 받기'};
  if(!s.interior&&['lumiose-bleu-sector4','lumiose-bleu4-tunnel'].includes(s.district)&&spot.tile==='l')return {name:'블루 구역 4 계단 (위치 초안)',text:s.district==='lumiose-bleu-sector4'?'계단으로 지하 통로에 내려간다.':'계단으로 지상에 올라간다.',action:'bleu4Stairs',label:s.district==='lumiose-bleu-sector4'?'지하로':'지상으로'};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&spot.tile==='h'){if(s.zaSide92Won)return {name:'남쪽 큰길 홀로베이터 (위치 초안)',text:'메탕을 쫓아내 승강기를 사용할 수 있다.',actions:[{action:'side92Holovator',label:'옥상으로'},...(s.zaSide92RewardPending?[{action:'side92Reward',label:'의뢰 보상 받기'}]:[])]};const available=s.zaMission30Complete||s.zaMission31Started||['B','A'].includes(s.zaRoyaleRank);return {name:'메탕 무리 (위치 초안)',text:'네 마리의 메탕이 승강기를 막고 있다.',...(available?{action:'side92Battle',label:'메탕 무리와 배틀'}:{})};}
  if(!s.interior&&s.district==='lumiose-mission34-roof'&&spot.tile==='h')return {name:'남쪽 큰길 홀로베이터 (위치 초안)',text:'승강기로 남쪽 큰길에 내려간다.',action:'side92Holovator',label:'거리로'};
  if(!s.interior&&s.district==='lumiose-bleu6-approach'&&spot.tile==='h')return s.zaMission31Stage>=3?{name:'블루 구역 9 비계 (위치 초안)',text:'비계를 따라 옥상으로 오른다.',action:'mission34RoofLadder',label:'옥상으로'}:{name:'비계 (위치 초안)',text:'블루 구역 9 옥상으로 가는 길이다.'};
  if(!s.interior&&s.district==='lumiose-mission34-roof'&&spot.tile==='j')return {name:'비계 (위치 초안)',text:'거리로 내려간다.',action:'mission34RoofLadder',label:'거리로'};
  if(!s.interior&&s.district==='lumiose-bleu-sector8'&&spot.tile==='s')return {name:'살롱 드 로주 (위치 초안)',text:'남쪽 큰길 근처 미용실이다. 헤어 변경 기능은 준비 중이다.'};
  if(!s.interior&&s.district==='lumiose-bleu-sector9'&&spot.tile==='b')return (s.zaMission20Stage>=7||s.zaSide117Complete)?{name:'상가 건물 (입구 초안)',text:'러스트단의 의뢰 현장이다.',action:'mission20EnterHouse',label:'건물 들어가기'}:{name:'상가 건물 (입구 초안)',text:'블루 구역 9의 건물 입구다.'};
  if(!s.interior&&s.district==='lumiose-passage-felicite'&&FELICITE_SHOPS[spot.tile])return {name:FELICITE_SHOPS[spot.tile],text:'파사주 뒤 보뇌르의 의류 상점이다. 구매 기능은 준비 중이다.'};
  if(!s.interior&&s.district==='lumiose-vernal'){const shop=promenadeVentShop(spot.x,spot.y);if(shop&&spot.tile===shop.tile){if(shop.tile==='p'&&s.zaMission25Complete&&!s.zaMission26Stage)return {name:'Asami · Boutique Couture (위치 초안)',text:'배틀에서 메가진화를 보여주고 승리하자.',action:'mission26Asami',label:'Asami와 배틀'};return {name:shop.name,text:shop.tile==='n'?'프로므나드 뒤 방의 미용실이다. 이용 기능은 준비 중이다.':'프로므나드 뒤 방의 의류 상점이다. 구매 기능은 준비 중이다.'};}}
  if(!s.interior&&s.district==='lumiose-galerie-lune'&&LUNE_SHOPS[spot.tile])return {name:LUNE_SHOPS[spot.tile],text:spot.tile==='s'?'갤러리 클레르 드 륀의 미용실이다. 이용 기능은 준비 중이다.':'갤러리 클레르 드 륀의 의류 상점이다. 구매 기능은 준비 중이다.'};
  if(!s.interior&&s.district==='lumiose-ombrage-arcade'&&spot.tile==='u'&&!s.zaOmbrageDuskBall)return {name:'다크볼 (위치 초안)',text:'북쪽 출입구 주변에서 다크볼을 발견했다.',action:'ombrageDuskBall',label:'다크볼 줍기'};
  if(!s.interior&&s.district==='lumiose-ombrage-arcade'&&OMBRAGE_SHOPS[spot.tile])return {name:OMBRAGE_SHOPS[spot.tile],text:spot.tile==='s'?'파사주 드 롬브레의 미용실이다. 이용 기능은 준비 중이다.':'파사주 드 롬브레의 의류 상점이다. 구매 기능은 준비 중이다.'};
  if(!s.interior&&s.district==='lumiose-rouge-sector4'&&spot.tile==='q')return {name:'파사주 드 롬브레 (외관 초안)',text:'루주 구역 4의 쇼핑 아케이드다. 북쪽은 구역 3, 남쪽은 구역 1에서 들어갈 수 있다.'};
  if(!s.interior&&['lumiose-north-boulevard','lumiose-north-rouge-roof'].includes(s.district)&&spot.tile==='j')return {name:'북쪽 큰길 홀로베이터 (위치 초안)',text:'루주 구역 3 옥상으로 이어지는 승강기다.',action:'northRougeHolovator',label:s.district==='lumiose-north-boulevard'?'옥상으로':'거리로'};
  if(!s.interior&&s.district==='lumiose-north-rouge-roof'&&spot.tile==='q')return {name:'루주 구역 3 높은 옥상 (지형 초안)',text:'북쪽 큰길 승강기에서 다리와 들보를 건너 이어지는 옥상이다.'};
  if(!s.interior&&s.district==='lumiose-rouge-sector1'&&spot.tile==='j')return !s.zaSide04Won?{name:'작업자 Sommi (위치 초안)',text:'배틀에서 이기면 홀로베이터를 수리하겠다고 한다.',...(side04Available(s)?{action:'side04Battle',label:'Sommi와 배틀'}:{})}:{name:'Sommi의 홀로베이터 (위치 초안)',text:'수리한 홀로베이터로 옥상에 올라간다.',actions:[{action:'side04Holovator',label:'옥상으로'},...(s.zaSide04RewardPending?[{action:'side04Reward',label:'의뢰 보상 받기'}]:[])]};
  if(!s.interior&&s.district==='lumiose-rouge-sector1-roof'&&spot.tile==='t'&&!s.zaRouge1Tm005)return {name:'기술머신 005 (위치 초안)',text:'옥상에서 울부짖기 기술머신을 발견했다.',action:'rouge1RoofTM005',label:'기술머신 줍기'};
  if(!s.interior&&s.district==='lumiose-south-boulevard'&&spot.tile==='j'){if(s.zaVert7RoofUpper)return {name:'베르 7번지 홀로베이터 (위치 초안)',text:'남쪽 큰길로 내려간다.',action:'vert7Holovator',label:'내려가기'};if(s.zaSide40Lift)return s.zaSide40RewardClaimed?{name:'베르 7번지 홀로베이터 (위치 초안)',text:'수리한 승강기로 옥상에 오른다.',action:'vert7Holovator',label:'옥상으로'}:{name:'베르 7번지 홀로베이터 (위치 초안)',text:'수리한 승강기를 이용하거나 의뢰 보상을 받을 수 있다.',actions:[{action:'vert7Holovator',label:'옥상으로'},{action:'side40Reward',label:'의뢰 보상 받기'}]};return {name:'전력이 부족한 홀로베이터 (위치 초안)',text:'Canari 퀴즈 완료 후 전기 기술로 전력을 공급한다.',...((Number(s.zaMission14Stage)>=9||['E','D','C','B','A'].includes(s.zaRoyaleRank))?{action:'vert7RepairLift',label:'전기 기술 사용'}:{})};}
  if(!s.interior&&s.district==='lumiose-rouge-sector3-roof'&&spot.tile==='l')return {name:'옥상 사다리 (위치 초안)',text:s.zaRouge3RoofUpper?'사다리로 아래 옥상에 내려간다.':'사다리를 올라 좁은 발판으로 간다.',action:'rouge3RoofLadder',label:s.zaRouge3RoofUpper?'내려가기':'올라가기'};
  if(!s.interior&&s.district==='lumiose-rouge-sector3-roof'&&spot.tile==='q')return {name:'레스토랑 르 예 옥상 (지형 초안)',text:'루주 광장 서쪽의 홀로베이터에서 다리를 건너 이어지는 옥상이다.'};
  if(!s.interior&&s.district==='lumiose-rouge-sector1-roof'&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:'거리로 내려간다.',action:'side04Holovator',label:'거리로'};
  if(!s.interior&&s.district==='lumiose-vert-sector9'&&spot.tile==='q')return s.zaSide17RewardPending?{name:'Duve (위치 초안)',text:'메리프 조사 보상을 받자.',action:'zone1Mission17Reward',label:'보상 받기'}:s.zaSide17Stage>=1?{name:'Duve (위치 초안)',text:s.zaSide17Stage===1?'옥상에서 색이 다른 메리프를 찾아보자.':'색이 다른 메리프를 찾아 주어 고맙다.'}:{name:'Duve (위치 초안)',text:'구역 1에서 색이 다른 메리프를 보았다고 한다.',...(mission17Available(s)?{action:'zone1Mission17Start',label:'메리프 조사 수락'}:{})};
  if(!s.interior&&s.district==='lumiose-rouge-tower-interior'&&spot.tile==='i')return {name:'건물 안 계단 (위치 초안)',text:'건물 안의 계단을 따라 옥상에 오른다.',action:'zone3TowerUp',label:'옥상으로'};
  if(!s.interior&&s.district==='lumiose-rouge-tower-interior'&&spot.tile==='j')return {name:'돌 건물 출구 (위치 초안)',text:'출구를 지나 광장으로 돌아간다.',action:'zone3TowerDown',label:'광장으로'};
  if(!s.interior&&s.district==='lumiose-vernal'&&!s.zaVernalEastRoof&&spot.tile==='j'&&((s.zaVernalSlowbroBank===true&&spot.x===18&&spot.y===6)||(s.zaVernalSlowbroBank!==true&&spot.x===20&&spot.y===10)))return {name:'남쪽 물가 계단 (위치 초안)',text:s.zaVernalSlowbroBank?'계단을 올라 거리로 돌아간다.':'계단을 내려가 남쪽 물가를 살펴본다.',action:'mission11BankStairs',label:s.zaVernalSlowbroBank?'거리로 올라가기':'물가로 내려가기'};
  if(!s.interior&&s.district==='lumiose-vernal'&&spot.tile==='l'&&((s.zaVernalEastRoof===true&&spot.x===6&&spot.y===3)||(s.zaVernalEastRoof!==true&&spot.x===18&&spot.y===4)))return {name:'동쪽 지붕 사다리 (위치 초안)',text:s.zaVernalEastRoof?'거리로 내려간다.':'동쪽 지붕에 오른다.',action:'vernalEastRoofLadder',label:s.zaVernalEastRoof?'내려가기':'옥상으로'};
  if(!s.interior&&((s.district==='lumiose-vernal'&&spot.tile==='l'&&spot.x===12&&spot.y===4)||(s.district==='lumiose-cafe-woof-roof'&&spot.tile==='l')))return {name:'카페 뒤 사다리 (위치 초안)',text:'카페 뒤 사다리로 옥상에 오르내린다.',action:'cafeWoofRoofLadder',label:s.district==='lumiose-vernal'?'옥상으로':'거리로'};
  if(!s.interior&&s.district==='lumiose-cafe-woof-roof'&&spot.tile==='r')return {name:'옥상 가시덤불 (위치 초안)',text:'불꽃 또는 비행 공격 기술로 가시덤불을 없앤다.',action:'cafeWoofRoofBramble',label:'가시덤불 치우기'};
  if(!s.interior&&s.district==='lumiose-cafe-woof-roof'&&spot.tile==='t'&&!s.zaCafeWoofTm056)return {name:'기술머신 056 (위치 초안)',text:'이판사판태클 기술머신을 발견했다.',action:'cafeWoofRoofTm056',label:'기술머신 줍기'};
  if(!s.interior&&['lumiose-zone1-roof','lumiose-zone1-high-roof'].includes(s.district)&&spot.tile==='j')return {name:'두 번째 옥상 사다리 (위치 초안)',text:'사다리로 옥상 층을 이동한다.',action:'zone1RoofHighLadder',label:s.district==='lumiose-zone1-roof'?'높은 옥상으로':'낮은 옥상으로'};
  if(!s.interior&&s.district==='lumiose-zone1-high-roof'&&spot.tile==='m'&&s.zaSide17Stage>=1&&!s.zaSide17MareepCaught)return s.zaSide17Stage===1?{name:'색이 다른 메리프 (위치 초안)',text:'Duve와 함께 메리프를 살펴보자.',action:'zone1Mission17Observe',label:'메리프 살펴보기'}:{name:'색이 다른 메리프 (위치 초안)',text:'옥상에 남아 있는 메리프와 배틀하자.',action:'zone1Mission17Battle',label:'메리프와 배틀'};
  if(!s.interior&&s.district==='lumiose-zone1'&&spot.tile==='r'&&spot.x===0&&spot.y===3)return {name:'옥상 접근로의 바위 (위치 초안)',text:'바위깨기로 바위를 치우자.',action:'zone1RoofRock',label:'바위깨기 사용'};
  if(!s.interior&&['lumiose-zone1','lumiose-zone1-roof'].includes(s.district)&&spot.tile==='l')return {name:'옥상 사다리 (위치 초안)',text:s.district==='lumiose-zone1'?'사다리를 타고 옥상으로 올라간다.':'사다리를 타고 구역 1로 내려간다.',action:'zone1RoofLadder',label:s.district==='lumiose-zone1'?'옥상으로':'지상으로'};
  if(!s.interior&&s.district==='lumiose-zone1-roof'&&spot.tile==='d'&&[4,19].includes(spot.x)&&spot.y===4)return {name:'중정 낙하 지점 (위치 초안)',text:'아래 중정으로 내려간다. 옥상으로 돌아가려면 사다리를 이용해야 한다.',action:'zone1CourtyardDrop',label:'중정으로 내려가기'};
  if(!s.interior&&s.district==='lumiose-zone1-roof'&&spot.tile==='t'&&!s.zaZone1Tm103)return {name:'기술머신 103 (위치 초안)',text:'옥상에서 분발 기술머신을 발견했다.',action:'zone1RoofTM103',label:'기술머신 줍기'};
  if(!s.interior&&s.district==='lumiose-zone1-roof'&&spot.tile==='p'&&zone1RoofAlphaReady(s))return {name:'우두머리 구구 (위치 초안)',text:'옥상 끝에서 우두머리 구구를 발견했다.',action:'zone1RoofAlpha',label:'우두머리와 배틀'};
  if(!s.interior&&s.district==='lumiose-zone1-roof'&&spot.tile==='k'&&!s.zaZone1RoofPearl)return {name:'진주 (위치 초안)',text:'옥상 끝에서 진주를 발견했다.',action:'zone1RoofPearl',label:'진주 줍기'};
  if(!s.interior&&s.district==='lumiose-bleu-sector3'&&spot.tile==='j')return s.zaMission61Won?{name:'홀로베이터 (위치 초안)',text:'수리한 홀로베이터로 올라간다.',action:'mission27Holovator',label:'옥상으로'}:{name:'Rust Syndicate 단원 (위치 초안)',text:'승강기를 쓰려면 단원을 이겨야 한다.',...(s.zaMission20Stage>=5?{action:'mission61Battle',label:'단원과 배틀'}:{})};
  if(!s.interior&&s.district==='lumiose-mission27-roof'&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:'거리로 내려간다.',action:'mission27Holovator',label:'거리로'};
  if(!s.interior&&s.district==='lumiose-mission27-roof'&&spot.tile==='r')return {name:'얼음 덩어리 (위치 초안)',text:'공격 기술로 얼음 덩어리를 쓰러뜨려 다리를 만든다.',action:'mission27IceBridge',label:'얼음 다리 만들기'};
  if(!s.interior&&s.district==='lumiose-aymlis-park'&&spot.tile==='H')return {name:'프랭탕 포켓몬센터 (위치 초안)',text:'파티의 HP·상태·PP를 회복한다.',action:'heal',label:'파티 회복하기'};
  if(!s.interior&&s.district==='lumiose-aymlis-park'&&spot.tile==='j')return {name:'공원 물가 계단 (위치 초안)',text:s.zaMission11ParkLower?'공원으로 올라간다.':'남쪽 물가로 내려간다.',action:'mission11ParkStairs',label:s.zaMission11ParkLower?'공원으로':'물가로'};
  if(!s.interior&&s.district==='lumiose-aymlis-park'&&s.zaMission11ParkLower&&spot.tile==='d'){if(s.zaMission11RewardPending)return {name:'메가야도란 사건 (위치 초안)',text:'야도란나이트를 받자.',action:'claimMission11Stone',label:'야도란나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission11Complete)return {name:'폭주 메가야도란 (위치 초안)',text:'동료와 남쪽 물가를 조사하자.',action:'battleMission11Slowbro',label:'메가야도란과 배틀'};return {name:'몽테리공원 물가 (초안)',text:'남쪽 물가다.'};}
  if(!s.interior&&['lumiose-rouge-north','lumiose-rouge-sector6','lumiose-mission23-roof'].includes(s.district)&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:s.district!=='lumiose-mission23-roof'?'Gwynn과 배틀한 뒤 옥상으로 올라간다.':'거리로 내려간다.',action:'mission23Holovator',label:s.district!=='lumiose-mission23-roof'?'옥상으로':'거리로'};
  if(!s.interior&&s.district==='lumiose-mission23-roof'&&spot.tile==='h')return {name:'비계와 낮은 옥상 (위치 초안)',text:s.zaMission23LowerRoof?'비계가 있는 옥상으로 돌아간다.':'비계 너머의 낮은 옥상으로 내려간다.',action:'mission23LowerRoof',label:s.zaMission23LowerRoof?'비계로 돌아가기':'낮은 옥상으로'};
  if(!s.interior&&s.district==='lumiose-mission23-roof'&&s.zaMission23LowerRoof!==true&&spot.tile==='t'&&!s.zaMission23Tm089)return {name:'옥상의 기술머신 (위치 초안)',text:'기술머신 089 독압정이 놓여 있다.',action:'mission23TM089',label:'기술머신 줍기'};
  if(!s.interior&&s.district==='lumiose-mission23-roof'&&s.zaMission23LowerRoof===true&&spot.tile==='l')return {name:'낮은 옥상 사다리 (위치 초안)',text:'전룡이 있는 높은 옥상으로 올라간다.',action:'mission23LowerLadder',label:'높은 옥상으로'};
  if(!s.interior&&s.district==='lumiose-mission23-roof'&&spot.tile==='l')return {name:'옥상 사다리 (위치 초안)',text:spot.y===8?'높은 옥상으로 올라간다.':'낮은 옥상으로 내려간다.',action:'mission23RoofLadder',label:spot.y===8?'올라가기':'내려가기'};
  if(!s.interior&&s.district==='lumiose-bleu-cafe2'&&spot.tile==='q')return {name:'누보 카페 2호 (위치 초안)',text:'음료를 주문하면 파티를 회복한다. 카페 북동쪽 물가를 돌아 계단과 터널로 갈 수 있다.',actions:[{action:'cafe2Water',label:'맛있는물 · 100코인'},{action:'cafe2Milk',label:'튼튼밀크 · 200코인'},{action:'cafe2Coffee',label:'불꽃세례 블렌드 · 250코인'}]};
  if(!s.interior&&s.district==='lumiose-bleu-cafe2'&&spot.tile==='s')return {name:'북동쪽 물가 계단 (위치 초안)',text:'계단을 내려가 북서쪽 터널로 향한다.',action:'mission22TunnelEnter',label:'계단으로 내려가기'};
  if(!s.interior&&s.district==='lumiose-bleu-sector5'&&spot.tile==='s')return {name:'물가 계단 (위치 초안)',text:'계단을 내려가 북서쪽 통로로 향한다.',action:'mission22TunnelEnter',label:'계단 내려가기'};
  if(!s.interior&&s.district==='lumiose-mission22-tunnel'&&spot.tile==='r')return {name:'얼음 덩어리 (위치 초안)',text:'공격 기술을 맞혀 얼음 다리를 만든다.',action:'mission22IceBridge',label:'얼음 다리 만들기'};
  if(!s.interior&&((s.district==='lumiose-magenta6-scaffold'&&spot.tile==='l'&&spot.x===11&&spot.y===4)||(s.district==='lumiose-magenta-sector6-roof'&&spot.tile==='j'&&spot.x===16&&spot.y===10)||(s.district==='lumiose-mission21-glide'&&['l','j'].includes(spot.tile))))return {name:'입치트 사건 비계 (위치 초안)',text:'사다리와 비계를 오간다.',action:'mission21Scaffold',label:'사다리 이용'};
  if(!s.interior&&['lumiose-magenta-sector6','lumiose-magenta-sector6-roof'].includes(s.district)&&spot.tile==='l')return {name:'비계 사다리 (위치 초안)',text:s.district==='lumiose-magenta-sector6'?'비계를 타고 옥상으로 오른다.':'비계를 타고 지상으로 내려간다.',action:'magenta6Ladder',label:s.district==='lumiose-magenta-sector6'?'기존 옥상 경로':'기존 지상 경로',actions:[{action:'magenta6Scaffold',label:'비계로 이동'},{action:'magenta6Ladder',label:s.district==='lumiose-magenta-sector6'?'기존 옥상 경로':'기존 지상 경로'}]};
  if(!s.interior&&s.district==='lumiose-magenta6-scaffold'&&['l','j'].includes(spot.tile))return {name:'비계 사다리 (위치 초안)',text:spot.tile==='l'?'사다리로 거리로 내려간다.':'사다리로 옥상에 오른다.',action:'magenta6Scaffold',label:spot.tile==='l'?'거리로':'옥상으로'};
  if(!s.interior&&s.district==='lumiose-magenta-sector3-roof'&&spot.tile==='v'&&spot.x===20&&spot.y===11)return {name:'마젠타 6번지 쪽 옥상 가장자리 (위치 초안)',text:'배틀코트 옆 골목으로 내려간다.',action:'magenta3DropCourtAlley',label:'골목으로 내려가기',actions:[{action:'magenta3DropCourtAlley',label:'골목으로 내려가기'},{action:'magenta3DropSector6',label:'기존 거리 경로'}]};
  if(!s.interior&&s.district==='lumiose-magenta-sector6'&&spot.tile==='a'&&spot.x===5&&spot.y===7)return {name:'배틀코트 골목 (위치 초안)',text:'배틀코트 옆 골목으로 들어간다.',action:'magenta6CourtEnter',label:'골목으로 들어가기'};
  if(!s.interior&&s.district==='lumiose-royale'&&s.zaRoyaleRank==='B'&&s.zaMission35Started){const extra=({'a':[3,3,5],'b':[4,19,11]})[spot.tile];if(extra&&spot.x===extra[1]&&spot.y===extra[2]){const t=RANK_B_TRAINERS[extra[0]],won=rankBWins(s).includes(t.id),claimed=Array.isArray(s.zaRoyaleBHealed)&&s.zaRoyaleBHealed.includes(t.id);if(won&&!claimed)return {name:t.name,text:'배틀을 마쳤으니 포켓몬을 회복해 드릴게요.',action:'royaleBHeal'+extra[0],label:'파티 회복'};return won||rankBPoints(s)>=45000?{name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'}:{name:t.name,text:'로열 랭크 B 배틀에 도전하세요. 이 위치는 초안입니다.',action:'royaleBExtra'+extra[0],label:'로열 배틀 시작'};}}
  if(!s.interior&&s.district==='lumiose-royale'&&spot.tile==='a'&&spot.x===3&&spot.y===5&&((s.zaRoyaleRank==='D'&&s.zaMission20Complete)||(s.zaRoyaleRank==='C'&&s.zaMission30Started))){const isD=s.zaRoyaleRank==='D',t=(isD?RANK_D_TRAINERS:RANK_C_TRAINERS)[3],won=(isD?rankDWins(s):rankCWins(s)).includes(t.id),claimed=isD?s.zaRoyaleDHectorHealed===true:s.zaRoyaleCLenaHealed===true;if(won&&!claimed)return {name:t.name,text:'배틀을 마쳤으니 포켓몬을 회복해 드릴게요.',action:'royaleLateWaiterHeal',label:'파티 회복'};return won||(isD?rankDPoints(s)>=38000:rankCPoints(s)>=41000)?{name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'}:{name:t.name,text:'로열 배틀에 도전하세요. 이 위치는 초안입니다.',action:'royaleLateWaiterBattle',label:'로열 배틀 시작'};}
  if(!s.interior&&s.district==='lumiose-royale'&&s.zaRoyaleRank==='E'&&s.zaMission19Stage===1&&spot.tile==='a'&&spot.x===3&&spot.y===5){const t=RANK_E_TRAINERS[3],won=rankEWins(s).includes(t.id);if(won&&s.zaRoyaleEGianniHealed!==true)return {name:t.name,text:'배틀을 마쳤으니 포켓몬을 회복해 드릴게요.',action:'royaleEGianniHeal',label:'파티 회복'};return won||rankEPoints(s)>=35000?{name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'}:{name:t.name,text:'로열 랭크 E 배틀에 도전하세요. 이 위치는 초안입니다.',action:'royaleEGianniBattle',label:'로열 배틀 시작'};}
  if(!s.interior&&s.district==='lumiose-royale'&&s.zaRoyaleRank==='F'&&s.zaMission14Stage===1){const extra=({'a':[3,3,5],'b':[4,19,11]})[spot.tile];if(extra&&spot.x===extra[1]&&spot.y===extra[2]){const t=RANK_F_TRAINERS[extra[0]],won=rankFWins(s).includes(t.id),claimed=Array.isArray(s.zaRoyaleFHealed)&&s.zaRoyaleFHealed.includes(t.id);if(won&&!claimed)return {name:t.name,text:'배틀을 마쳤으니 포켓몬을 회복해 드릴게요.',action:'royaleFHeal'+extra[0],label:'파티 회복'};return won||rankFPoints(s)>=32000?{name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'}:{name:t.name,text:'로열의 랭크 F 배틀에 도전하세요. 이 위치는 초안입니다.',action:'royaleFExtra'+extra[0],label:'로열 배틀 시작'};}}
  if(!s.interior&&s.district==='lumiose-royale'&&s.zaRoyaleRank==='V'&&s.zaMission10Stage===4){const extra=({'a':[3,3,5],'b':[4,19,11],'e':[5,12,5],'t':[6,3,11],'j':[7,9,11],'k':[8,15,11],'n':[9,19,5]})[spot.tile];if(extra&&spot.x===extra[1]&&spot.y===extra[2]){const t=ROYALE_V_TRAINERS[extra[0]];return royaleVReady(s)||royaleVWins(s).includes(t.id)?{name:t.name,text:'이번 방문의 배틀을 마쳤습니다.'}:{name:t.name,text:'로열의 랭크 V 배틀에 도전하세요. 이 위치는 초안입니다.',action:'royaleVExtra'+extra[0],label:'로열 배틀 시작'};}}
  {const e=royaleFieldEntryAt(s,spot);if(e){const zones=activeRoyaleZones(s),d=royaleDialogue(s),name=zones.find(z=>z.id===e.zone)?.name;if(!name)return {name:'배틀존 입구 (위치 초안)',text:`이번 밤의 배틀존: ${zones.map(z=>z.name).join(' / ')}. 광장 임시 접수처에서도 참가할 수 있습니다.`};return {...d,name:`${name} 배틀존 (위치 초안)`,text:`${d.text} 공용 임시 배틀존으로 이동합니다.`};}}
  if(!s.interior&&s.district==='lumiose-magenta6-court-alley'&&spot.tile==='T'&&spot.x===13&&spot.y===10){const zones=activeRoyaleZones(s),d=royaleDialogue(s);if(!zones.some(z=>z.id==='magenta6'))return {name:'마젠타 6번지 배틀존 (초안)',text:`이번 밤의 배틀존: ${zones.map(z=>z.name).join(' / ')}. 광장 임시 접수처에서 참가할 수 있습니다.`};return {...d,name:'마젠타 6번지 배틀존 (초안)',text:`${d.text} 이 경기는 임시 배틀존에서 진행됩니다.`};}
  if(!s.interior&&s.district==='lumiose-magenta6-court-alley'&&spot.tile==='a'&&spot.x===20&&spot.y===7)return {name:'마젠타 6번지 거리 (위치 초안)',text:'골목을 나가 비계 쪽 거리로 간다.',action:'magenta6CourtExit',label:'거리로 나가기'};
  if(!s.interior&&((s.district==='lumiose-magenta-sector3-roof'&&spot.tile==='v'&&spot.x===20&&spot.y===10)||(s.district==='lumiose-magenta3-gap'&&spot.tile==='l'&&spot.x===6&&spot.y===3)))return {name:'건물 사이 틈 (위치 초안)',text:s.district==='lumiose-magenta-sector3-roof'?'옥상에서 좁은 공간으로 내려간다.':'사다리로 옥상에 오른다.',action:'magenta3RoofGap',label:s.district==='lumiose-magenta-sector3-roof'?'아래로':'옥상으로'};
  if(!s.interior&&['lumiose-magenta-sector3','lumiose-magenta-sector3-roof'].includes(s.district)&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:s.district==='lumiose-magenta-sector3'?'옥상으로 올라간다.':'지상으로 내려간다.',action:'magenta3Holovator',label:s.district==='lumiose-magenta-sector3'?'옥상으로':'지상으로'};
  if(!s.interior&&['lumiose-magenta-sector4','lumiose-magenta-sector4-roof'].includes(s.district)&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:s.district==='lumiose-magenta-sector4'?'옥상으로 올라간다.':'지상으로 내려간다.',action:'magenta4Holovator',label:s.district==='lumiose-magenta-sector4'?'옥상으로':'지상으로'};
  if(!s.interior&&s.district==='lumiose-mission16-roof'&&spot.tile==='r')return {name:'거미줄 다리 (위치 초안)',text:'포켓몬의 기술로 거미줄을 펼치자.',action:'mission16OpenWeb',label:'거미줄 펼치기'};
  if(spot.tile==='e'&&s.district==='lumiose-bureau'&&!s.interior&&s.zaMission35Started&&!s.zaMission35Stage)return {name:'Emma',text:'Grisham의 단서를 얻기 위해 배틀하자.',action:'mission35Emma',label:'Emma와 배틀'};
  if(spot.tile==='n'&&s.district==='lumiose-zone20'&&!s.interior&&s.zaMission42Stage>=1&&!s.zaMission42Complete)return s.zaMission42Stage===3?{name:'지가르데',text:'볼을 선택해 지가르데를 포획하자.',action:'mission42OfferCapture',label:'볼 선택하기'}:s.zaMission42Stage===4?{name:'L',text:'지가르데큐브를 받자.',action:'mission42Cube',label:'지가르데큐브 받기'}:{name:'지가르데 (위치 초안)',text:`지가르데와 배틀하자 (${Math.min(3,(s.zaMission42Phase||0)+1)}/3).`,actions:[{action:'mission42Battle',label:'지가르데와 배틀'},...(s.zaMission42Stage===2?[{action:'mission42Cancel',label:'연속 배틀 중단'}]:[])]};
  if(!s.interior&&spot.tile==='h'&&(s.district==='lumiose-zone5-drain'||(s.district==='lumiose-zone5'&&s.zaZone5Upper===true)))return {name:'지하·옥상 사다리 (위치 초안)',text:s.zaZone5DrainSecondCleared?'지하 통로와 옥상을 잇는 사다리다.':'지하의 오염물을 먼저 제거해야 한다.',...(s.zaZone5DrainSecondCleared?{action:'zone5DrainRoofLadder',label:s.district==='lumiose-zone5-drain'?'옥상으로':'지하로'}:{})};
  if(s.district==='lumiose-zone5'&&!s.interior&&s.zaZone5Upper&&spot.tile==='r')return {name:'거미줄 다리 (위치 초안)',text:'공격 기술로 거미줄을 펼치자.',action:'zone5OpenWeb',label:'거미줄 펼치기'};
  if(s.district==='lumiose-zone5'&&!s.interior&&s.zaZone5Upper&&spot.tile==='k'&&!s.zaZone5WebFullHeal)return {name:'만병통치제 (위치 초안)',text:'거미줄 건너편에서 도구를 발견했다.',action:'zone5WebFullHeal',label:'도구 줍기'};
  if(['lumiose-zone5','lumiose-zone5-drain'].includes(s.district)&&!s.interior&&spot.tile==='r')return {name:'오염물 (위치 초안)',text:'물 공격 기술이나 염동력으로 길을 열자.',action:'clearZone5DrainSludge',label:'기술 사용'};
  if(s.district==='lumiose-zone5'&&!s.interior&&!s.zaZone5Upper&&spot.tile==='s')return {name:'구역 5 지하 계단 (위치 초안)',text:'통로 아래로 내려간다.',action:'enterZone5Drain',label:'계단 내려가기'};
  if(s.district==='lumiose-bleu3-sewer-approach'&&!s.interior&&spot.tile==='r')return {name:'오염물 (위치 초안)',text:'물 공격 기술이나 염동력으로 통로를 열자.',action:'clearBleuSludge',label:'기술 사용'};
  if(s.district==='lumiose-bleu3-sewer-approach'&&!s.interior&&spot.tile==='h')return s.zaBleuSewerOpened?{name:'Hérup · 하수도 입구',text:s.zaMission57Won?'하수도에 온천을 열 계획이다.':'하수도 안에서 다시 만나자.'}:{name:'Hérup · 하수도 입구 (위치 초안)',text:s.zaMission19Complete?'하수도에서 바쿠다와 할 일에 관해 이야기하자.':'미션 19를 마친 뒤 다시 찾아오자.',...(s.zaMission19Complete?{action:'openBleuSewer',label:'의뢰를 듣고 문 열기'}:{})};
  if(s.district==='lumiose-sewer'&&!s.interior&&spot.tile==='o'&&s.zaBleuSewerOpened){const side=s.zaMission57Won?{name:'Hérup',text:'사람과 포켓몬이 함께 쉴 수 있는 온천을 만들자.'}:{name:'Hérup · 하수도 (위치 초안)',text:'바쿠다와 함께 구상한 온천 사업을 이야기한다.',action:'mission57Battle',label:'Hérup과 배틀'};const battle=s.zaMission20Stage===5&&!s.zaMission22Complete?{action:'mission20CaseBattle',label:'메가거북손데스와 배틀'}:s.zaMission22RewardPending?{action:'mission20ClaimStone',label:'메가스톤 받기'}:null;return battle?{name:side.name,text:side.text,actions:[...(side.action?[{action:side.action,label:side.label}]:[]),battle]}:side;}
  if(s.district==='lumiose-espace-vide'&&!s.interior&&spot.tile==='l')return {name:'운하 통로 계단 (위치 초안)',text:s.zaEspaceLower?'지상 골목으로 올라간다.':'아래 운하 통로로 내려간다.',action:'espaceStairs',label:s.zaEspaceLower?'지상으로':'아래로'};
  if(!s.interior&&s.district==='lumiose-centrico-route'&&spot.tile==='G'){const name=spot.y===4?'루주 거리 방면':spot.x===3?'마젠타 운하 방면':'베르 운하 방면';const unlocked=(s.zaMission38Complete&&!(s.zaMission42Stage>=1&&!s.zaMission42Complete))||[1,3,4].includes(s.zaMission42Stage);return {name:`구역 20 ${name} 출입구 (위치 초안)`,text:unlocked?'프리즘타워 유적에 들어간다.':'본편 종료 후 입장할 수 있다.',...(unlocked?{action:'zone20DirectionalGate',label:'구역 20으로'}:{})};}
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission42Stage>=1&&!s.zaMission42Complete)return {name:'야생 구역 20 (임시 경로)',text:'지가르데가 기다리는 곳으로 향하자. 실제 지형은 초안이다.',action:'mission42Enter',label:'구역 20으로 가기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission38Complete&&!(s.zaMission42Stage>=1&&!s.zaMission42Complete))return {name:'야생 구역 20 (지형 초안)',text:'프리즘타워 유적을 탐색하자.',action:'zone20Enter',label:'구역 20으로 가기'};
  if(s.district==='lumiose-zone20'&&!s.interior){const item=zone20Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone20Item-${item.id}`,label:'도구 줍기'};const p=zone20Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone20Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-coulant-route'&&!s.interior&&spot.tile==='l')return {name:'수로 산책로 계단 (위치 초안)',text:s.zaCoulantLower?'다리 위쪽 길로 오른다.':'다리 아래 산책로로 내려간다.',action:'coulantBankSteps',label:s.zaCoulantLower?'올라가기':'내려가기'};
  if(s.district==='lumiose-zone16'&&!s.interior&&spot.tile==='l')return {name:'블루 광장 남서쪽 사다리 (위치 초안)',text:s.zaZone16Upper?'사다리로 아래에 내려간다.':'사다리로 옥상에 오른다.',action:'zone16RoofLadder',label:s.zaZone16Upper?'내려가기':'올라가기'};
  if(s.district==='lumiose-zone19'&&!s.interior){if(spot.tile==='r')return {name:'가시덤불 (위치 초안)',text:'불꽃 공격 기술로 길을 연다.',action:'zone19Brambles',label:'가시덤불 태우기'};const item=zone19Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone19Item-${item.id}`,label:'도구 줍기'};const p=zone19Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone19Wild-${p.id}`,label:'배틀하기'};}
  if(!s.interior&&((s.district==='lumiose-rouge-north'&&spot.tile==='h')||(s.district==='lumiose-lune-roof'&&spot.tile==='h')))return {name:'갤러리 외부 비계 (위치 초안)',text:s.district==='lumiose-lune-roof'?'비계를 내려간다.':'비계 위로 올라간다.',action:'luneScaffold',label:s.district==='lumiose-lune-roof'?'내려가기':'비계로'};
  if(!s.interior&&s.district==='lumiose-lune-roof'&&spot.tile==='l')return {name:'갤러리 지붕 사다리 (위치 초안)',text:spot.x===8?'갤러리 지붕으로 오른다.':'비계로 돌아간다.',action:'luneRoofLadder',label:spot.x===8?'지붕으로':'비계로'};
  if(!s.interior&&['lumiose-rust','lumiose-rust-roof'].includes(s.district)&&spot.tile==='l')return {name:'사무소 북쪽 사다리 (위치 초안)',text:s.district==='lumiose-rust-roof'?'거리로 내려간다.':'사다리로 옥상에 오른다.',action:'rustRoofLadder',label:s.district==='lumiose-rust-roof'?'내려가기':'옥상으로'};
  if(!s.interior&&['lumiose-vert-sector6','lumiose-vert6-roof'].includes(s.district)&&spot.tile==='l')return {name:'베르 6번지 사다리 (위치 초안)',text:s.district==='lumiose-vert6-roof'?'거리로 내려간다.':'사다리로 옥상에 오른다.',action:'vert6RoofLadder',label:s.district==='lumiose-vert6-roof'?'내려가기':'옥상으로'};
  if(!s.interior&&['lumiose-rouge-sector7','lumiose-rouge7-roof'].includes(s.district)&&spot.tile==='l')return {name:'코트 옆 사다리 (위치 초안)',text:s.district==='lumiose-rouge-sector7'?'사다리로 옥상에 오른다.':'사다리로 지상에 내려간다.',action:'rouge7RoofLadder',label:s.district==='lumiose-rouge-sector7'?'옥상으로':'지상으로'};
  if(s.district==='lumiose-magenta-sector9'&&!s.interior&&spot.tile==='l')return {name:'남쪽 비계 사다리 (위치 초안)',text:s.zaMagenta9Upper?'비계를 타고 거리로 내려간다.':'비계를 타고 구역 바깥 옥상에 오른다.',action:'zone18OutsideLadder',label:s.zaMagenta9Upper?'내려가기':'옥상으로'};
  if(s.district==='lumiose-vert-sector4'&&!s.interior&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:s.zaVert4Layer==='roof'?'거리로 내려간다.':'옥상으로 올라간다.',action:'vert4Lift',label:s.zaVert4Layer==='roof'?'내려가기':'옥상으로'};
  if(s.district==='lumiose-vert-sector4'&&!s.interior&&s.zaVert4Layer==='roof'&&spot.tile==='v')return {name:'안뜰 쪽 옥상 가장자리 (위치 초안)',text:'아래 안뜰로 내려간다.',action:'vert4CourtyardDrop',label:'안뜰로'};
  if(s.district==='lumiose-vert-sector4'&&!s.interior&&s.zaVert4Layer==='courtyard'&&spot.tile==='l')return {name:'안뜰 비계 사다리 (위치 초안)',text:'사다리를 타고 옥상으로 올라간다.',action:'vert4CourtyardLadder',label:'옥상으로'};
  if(s.district==='lumiose-vert2'&&!s.interior&&s.zaVert2RoofUpper===true&&spot.tile==='j'&&spot.y===8&&[9,13].includes(spot.x))return {name:'옥상 상자 발판 (위치 초안)',text:'상자 발판에서 건너편 옥상으로 구른다.',action:'vert2RoofGap',label:'건너기'};
  if(s.district==='lumiose-vert2'&&!s.interior&&spot.tile==='l')return {name:'안뜰 사다리 (위치 초안)',text:s.zaVert2RoofUpper?'안뜰로 내려간다.':'사다리로 옥상에 오른다.',action:'vert2CourtyardLadder',label:s.zaVert2RoofUpper?'내려가기':'옥상으로'};
  if(s.district==='lumiose-zone18'&&!s.interior&&spot.tile==='h'&&s.zaZone18Upper!==true)return {name:'공사 골목 (배치 초안)',text:s.zaZone18Construction?'남동쪽 골목으로 돌아가자.':'비계 사이 공사 골목을 살펴보자.',action:'zone18Construction',label:s.zaZone18Construction?'골목에서 나가기':'공사 골목으로'};
  if(s.district==='lumiose-zone18'&&!s.interior){if(spot.tile==='l')return {name:'비계 사다리 (위치 초안)',text:s.zaZone18Upper?'골목으로 내려간다.':'옥상으로 올라간다.',action:'zone18Ladder',label:s.zaZone18Upper?'지상으로':'옥상으로'};const item=zone18Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone18Item-${item.id}`,label:'도구 줍기'};const p=zone18Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone18Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone17'&&!s.interior&&!s.zaZone17Upper&&spot.tile==='h')return {name:'공원 계단 (배치 초안)',text:s.zaZone17Promenade?'남쪽 공원으로 내려간다.':'계단으로 북쪽 산책로에 오른다.',action:'zone17PromenadeStairs',label:s.zaZone17Promenade?'공원으로':'산책로로'};
  if(s.district==='lumiose-zone17'&&!s.interior){if(spot.tile==='l')return {name:'사다리 (위치 초안)',text:s.zaZone17Upper?'지상으로 내려간다.':'옥상으로 올라간다.',action:'zone17Ladder',label:s.zaZone17Upper?'지상으로':'옥상으로'};const item=zone17Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone17Item-${item.id}`,label:'도구 줍기'};const p=zone17Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone17Wild-${p.id}`,label:'배틀하기'};}
  if(['lumiose-zone16','lumiose-zone16-garden'].includes(s.district)&&!s.interior){const item=s.district==='lumiose-zone16'?zone16Item(s,spot.tile):null;if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone16Item-${item.id}`,label:'도구 줍기'};const p=zone16Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone16Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone15'&&!s.interior){const item=zone15Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone15Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone15'&&!s.interior&&spot.tile==='n')return s.zaMission26Stage>=1||s.zaMission26Complete?{name:'홀로베이터 수리 의뢰 (초안)',text:'전룡과 썬더볼트의 다툼을 해결하자.',action:'zone15Side80',label:'의뢰 진행'}:{name:'홀로베이터 수리 의뢰 (초안)',text:'미션 26에서 아사미와 배틀한 뒤 다시 확인하자.'};
  if(s.district==='lumiose-hibernal-approach'&&!s.interior&&spot.tile==='j')return s.zaZone15LiftUnlocked?{name:'옥상 홀로베이터 (위치 초안)',text:'수리된 홀로베이터로 옥상에 오른다.',action:'zone15Lift',label:'기존 옥상으로',actions:[{action:'zone15OuterLift',label:'인접 건물 옥상으로'},{action:'zone15Lift',label:'기존 옥상으로'}]}:{name:'옥상 홀로베이터 (위치 초안)',text:'사이드 미션 80을 해결하면 사용할 수 있다.'};
  if(s.district==='lumiose-jaune7-roof'&&!s.interior&&spot.tile==='r'&&!s.zaZone15WebOpen)return {name:'거미줄 다리 (위치 초안)',text:'불꽃 공격으로 거미줄 다리를 펼친다.',action:'zone15Web',label:'거미줄 펼치기'};
  if(s.district==='lumiose-jaune7-roof'&&!s.interior&&spot.tile==='j')return {name:'옥상 홀로베이터 (위치 초안)',text:'홀로베이터로 거리로 내려간다.',action:'zone15OuterLift',label:'거리로'};
  if(s.district==='lumiose-zone15'&&!s.interior&&spot.tile==='l')return s.zaZone15Upper||s.zaZone15LiftUnlocked?{name:'홀로베이터 (위치 초안)',text:s.zaZone15Upper?'지상으로 내려간다.':'홀로베이터로 옥상에 오른다.',action:'zone15Lift',label:s.zaZone15Upper?'지상으로':'옥상으로'}:{name:'홀로베이터 (위치 초안)',text:'사이드 미션 80을 해결하면 사용할 수 있다.'};
  if(s.district==='lumiose-zone15'&&!s.interior&&s.zaZone15Upper&&spot.tile==='r')return {name:'거미줄 길 (초안)',text:'불꽃 공격으로 거미줄 길을 펼친다.',action:'zone15Web',label:'거미줄 펼치기'};
  if(s.district==='lumiose-zone15'&&!s.interior&&spot.tile==='q')return {name:'카페 Ultimo (위치 초안)',text:'카페의 실내와 서비스는 준비 중이다.'};
  if(s.district==='lumiose-zone15'&&!s.interior){const p=zone15Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone15Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone14'&&!s.interior&&spot.tile==='r')return {name:'변전소의 바위 (위치 초안)',text:'격투·땅·바위 타입의 공격 기술로 바위를 부순다.',action:'smashZone14Rock',label:'바위 부수기'};
  if(s.district==='lumiose-zone14'&&!s.interior){const item=zone14Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone14Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone14'&&!s.interior){const p=zone14Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone14Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone13'&&!s.interior){const item=zone13Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone13Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone13'&&!s.interior){const p=zone13Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone13Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone12'&&!s.interior&&spot.tile==='l')return {name:'연못 계단 (위치 초안)',text:s.zaZone12PondLower?'공원으로 올라간다.':'연못가로 내려간다.',action:'zone12PondSteps',label:s.zaZone12PondLower?'올라가기':'내려가기'};
  if(s.district==='lumiose-zone12'&&!s.interior&&s.zaZone12PondLower===true&&spot.tile==='r'&&spot.x===7&&spot.y===14)return {name:'연못의 얼음 (위치 초안)',text:'선두 포켓몬의 물리 기술로 얼음을 쓰러뜨려 다리를 만든다.',action:'zone12IceBridge',label:'얼음 쓰러뜨리기'};
  if(s.district==='lumiose-zone12'&&!s.interior&&spot.tile==='r')return {name:'코트의 바위 (위치 초안)',text:'격투·땅·바위 공격 기술로 바위를 치운다.',action:'zone12CourtRock',label:'바위 치우기'};
  if(s.district==='lumiose-zone12'&&!s.interior){const item=zone12Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone12Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone12'&&!s.interior){const p=zone12Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone12Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone10'&&!s.interior&&s.zaZone10Upper&&spot.tile==='r')return {name:'옥상의 오염물 (위치 초안)',text:'물 공격 기술이나 염동력으로 길을 연다.',action:'zone10ClearSludge',label:'오염물 치우기'};
  if(s.district==='lumiose-zone10'&&!s.interior){const item=zone10Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone10Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone10'&&!s.interior&&spot.tile==='l')return {name:'구역 10 사다리 (위치 초안)',text:s.zaZone10Upper?'사다리를 내려간다.':'사다리를 타고 옥상에 오른다.',action:'zone10Ladder',label:s.zaZone10Upper?'지상으로':'옥상으로'};
  if(s.district==='lumiose-zone10'&&!s.interior){const p=zone10Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone10Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone9'&&!s.interior){const item=zone9Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone9Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone9'&&!s.interior&&['l','h'].includes(spot.tile))return {name:'구역 9 사다리 (위치 초안)',text:s.zaZone9Upper?'사다리를 내려간다.':'사다리를 타고 옥상에 오른다.',action:`zone9Ladder-${spot.tile}`,label:s.zaZone9Upper?'지상으로':'옥상으로'};
  if(s.district==='lumiose-zone9'&&!s.interior){const p=zone9Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone9Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone8'&&!s.interior){const item=zone8Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone8Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone8'&&!s.interior){const p=zone8Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone8Wild-${p.id}`,label:'배틀하기'};}
  if(!s.interior&&s.district==='lumiose-zone7-west-roof'&&spot.tile==='v'&&spot.x===11&&[10,12].includes(spot.y))return {name:'옥상 사이 틈 (위치 초안)',text:'건너편 옥상으로 구른다.',action:'zone7RoofRoll',label:'건너편 옥상으로'};
  if(!s.interior&&spot.tile==='j'&&((s.district==='lumiose-zone7'&&spot.x===3&&spot.y===8)||(s.district==='lumiose-zone7-west-roof'&&spot.x===4&&spot.y===10)))return {name:'서쪽 홀로베이터 (위치 초안)',text:s.district==='lumiose-zone7'?'광장 서쪽 건물 옥상으로 오른다.':'광장으로 내려간다.',action:'zone7WestRoofLift',label:s.district==='lumiose-zone7'?'옥상으로':'광장으로'};
  if(s.district==='lumiose-zone7'&&!s.interior&&spot.tile==='a'&&!s.zaZone7AlphaSpent)return {name:'우두머리 불화살빈 (초안)',text:'광장 중앙의 기념비에 앉아 있다.',action:'zone7Alpha',label:'우두머리와 배틀'};
  if(s.district==='lumiose-zone6'&&!s.interior&&spot.tile==='j')return {name:'홀로베이터 (위치 초안)',text:zone6Layer(s)==='high'?'홀로베이터로 지상에 돌아가자.':'홀로베이터로 높은 옥상에 올라가자.',action:'zone6Holovator',label:zone6Layer(s)==='high'?'지상으로':'옥상으로'};
  if(s.district==='lumiose-zone6'&&!s.interior&&spot.tile==='v'&&zone6Layer(s)==='high')return {name:'옥상 낙하 지점 (초안)',text:'남쪽 낮은 옥상으로 내려간다.',action:'zone6Drop',label:'낮은 옥상으로 내려가기'};
  if(s.district==='lumiose-zone6'&&!s.interior){const item=zone6Item(s,spot.tile);if(item)return {name:`${item.name} (위치 초안)`,text:'떨어진 도구를 발견했다.',action:`zone6Item-${item.id}`,label:'도구 줍기'};}
  if(s.district==='lumiose-zone6'&&!s.interior&&['l','h'].includes(spot.tile))return {name:spot.tile==='l'?'수로 사다리 (위치 초안)':'옥상 연결 (위치 초안)',text:zone6Layer(s)==='ground'?(spot.tile==='l'?'다리 아래 수로로 내려가자.':'옥상으로 올라가자.'):'지상으로 돌아가자.',action:spot.tile==='l'?'zone6CanalLink':'zone6RoofLink',label:zone6Layer(s)==='ground'?(spot.tile==='l'?'수로로 내려가기':'옥상으로 올라가기'):'지상으로 돌아가기'};
  if(s.district==='lumiose-zone6'&&!s.interior&&spot.tile==='t'&&zone6Layer(s)==='roof'&&!s.zaZone6Tm041)return {name:'옥상의 기술머신 (위치 초안)',text:'기술머신 041 물의파동이 놓여 있다.',action:'zone6TM041',label:'기술머신 줍기'};
  if(s.district==='lumiose-zone6'&&!s.interior&&spot.tile==='q')return {name:'Café Bataille (배치 초안)',text:'카페의 실제 구조와 서비스는 아직 준비 중이다.'};
  if(s.district==='lumiose-zone6'&&!s.interior){const p=zone6Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone6Wild-${p.id}`,label:'배틀하기'};}
  if(!s.interior&&s.district==='lumiose-zone11-nw-ledge'&&spot.tile==='v'&&spot.x===9&&spot.y===6)return {name:'북서쪽 높은 턱 (위치 초안)',text:'아래 강변으로 내려간다.',action:'zone11NorthwestDrop',label:'강변으로 내려가기'};
  if(s.district==='lumiose-zone11'&&!s.interior&&spot.tile==='z'&&s.zaMission40Stage===2&&!s.zaMission40Complete&&s.zaMission40XerneasRevealed===false)return {name:'북쪽 강변의 흔적 (위치 초안)',text:'모래 위의 흔적을 조사하자.',action:'mission40SearchShore',label:'강변 조사하기'};
  if(s.district==='lumiose-zone11'&&!s.interior&&spot.tile==='0'&&s.zaMission40Stage===2&&!s.zaMission40Complete)return {name:'제르네아스 (위치 초안)',text:'운하 북쪽의 제르네아스를 조사하자.',action:'mission40Xerneas',label:'제르네아스와 배틀'};
  if(s.district==='lumiose-zone11'&&!s.interior){const p=zone11Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'야생 포켓몬이 있다.',action:`zone11Wild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-zone5'&&!s.interior&&spot.tile==='t'&&s.zaZone5Upper&&!s.zaZone5Tm040)return {name:'필드의 기술머신 (위치 초안)',text:'기술머신 040 씨기관총이 놓여 있다.',action:'zone5TM040',label:'기술머신 줍기'};
  if(['lumiose-zone5','lumiose-zone5-drain'].includes(s.district)&&!s.interior){const p=zone5Visible(s,spot.tile);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:p.id==='abra'?'옥상의 캐이시다. 원작에서는 가까이 가면 도망칠 수 있다.':'야생 포켓몬이 있다.',action:`zone5Wild-${p.id}`,label:'배틀하기'};}
  if(spot.tile==='l'&&s.district==='lumiose-zone5'&&!s.interior)return {name:'야생 구역 5 사다리 (위치 초안)',text:s.zaZone5Upper?'지상으로 내려가자.':'북서쪽 사다리로 옥상에 올라가자.',action:'zone5Ladder',label:s.zaZone5Upper?'내려가기':'올라가기'};
  if(spot.tile==='0'&&s.district==='lumiose-zone9'&&!s.interior&&s.zaZone9Upper===true&&s.zaMission40Stage===1&&!anomalyIds(s).includes('pangoro'))return {name:'이상한 우두머리 부란다 (옥상 위치 초안)',text:'남서쪽 옥상에서 조사 대상을 살펴보자.',action:'mission40OtherAlpha',label:'부란다 조사'};
  if(spot.tile==='0'&&s.district==='lumiose-zone5'&&!s.interior)return {name:'이상한 우두머리 엘레이드 (위치 초안)',text:'Mable의 조사 대상을 살펴보자.',action:'mission40OtherAlpha',label:'조사 배틀'};
  if(spot.tile==='0'&&s.district==='lumiose-research-zone'&&!s.interior){const id=s.zaMission40Zone==='5'?'gallade':s.zaMission40Zone==='9'?'pangoro':'';return s.zaMission40Zone==='11'&&s.zaMission40Stage===2&&s.zaMission40XerneasRevealed===false?{name:'조사 현장 (초안)',text:'구역 11 북쪽 강변의 흔적을 먼저 조사하자. 남쪽 출구로 돌아갈 수 있다.'}:s.zaMission40Zone==='11'&&s.zaMission40Stage===2?{name:'제르네아스 (강가 초안)',text:'제르네아스를 찾아 포획하자.',action:'mission40Xerneas',label:'제르네아스와 배틀'}:id&&s.zaMission40Stage===1&&!anomalyIds(s).includes(id)?{name:'이상한 우두머리 (위치 초안)',text:'포획하거나 쓰러뜨려 조사하자.',action:'mission40OtherAlpha',label:'우두머리 조사'}:{name:'조사 현장 (초안)',text:'이 구간은 조사 전용 임시 지도다.'};}
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&[1,2].includes(s.zaMission40Stage)){const actions=[...(s.zaMission41Started&&!s.zaMission41Stage?[{action:'mission41Grisham',label:'Grisham과 이야기하기'}]:[]),...(s.zaMission40Stage===1?[{action:'mission40Zone5',label:'구역 5 조사 현장 (임시 이동)'},{action:'mission40Zone9',label:'구역 9 조사 현장 (임시 이동)'}]:[{action:'mission40Zone11',label:'구역 11 조사 현장 (임시 이동)'}])];return {name:'조사 현장 임시 이동',text:'도시 연결과 지형은 아직 원작 대조 중이다.',actions};}
  if(spot.tile==='0'&&s.district==='lumiose-zone3'&&!s.interior&&s.zaMission40Stage===1&&!(Array.isArray(s.zaMission40Anomalies)&&s.zaMission40Anomalies.includes('steelix')))return {name:'이상한 우두머리 강철톤 (위치 초안)',text:'포획하거나 쓰러뜨려 조사하자.',action:'mission40Steelix',label:'강철톤 조사'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission05Stage===5&&s.zaMission05CafePending===true)return {name:'누보 카페 · 팀 MZ (위치 초안)',text:'동료와 쉬며 Vinnie를 만나자.',action:'mission05Cafe',label:'동료와 이야기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission41Started&&!s.zaMission41Stage)return {name:'Grisham (누보 카페 위치 초안)',text:'빼앗는 존재의 단서를 묻자.',action:'mission41Grisham',label:'Grisham과 이야기하기'};
  if(spot.tile==='z'&&s.district==='lumiose-lune-roof'&&!s.interior&&s.zaMission41Stage===3&&s.zaMission41DomeReturnRequired===true)return {name:'갤러리 돔의 흔적',text:'로토글라이드로 옥상 발판에 돌아간 뒤 다시 돔에 접근하자.'};
  if(spot.tile==='z'&&s.district==='lumiose-lune-roof'&&!s.interior&&s.zaMission41Stage===3&&!s.zaMission41Complete&&s.zaMission41DomeInvestigated===false)return {name:'갤러리 돔의 흔적 (위치 초안)',text:'돔 위의 흔적을 조사하자.',action:'mission41InspectDome',label:'흔적 조사하기'};
  if(spot.tile==='0'&&['lumiose-rouge-north','lumiose-lune-roof'].includes(s.district)&&!s.interior&&s.zaMission41Stage===3&&s.zaMission41DomeInvestigated!==false&&s.zaMission41DomeReturnRequired!==true)return {name:'이벨타르 (옥상 위치 초안)',text:'이벨타르를 찾아 포획하자.',action:'mission41Yveltal',label:'이벨타르와 배틀'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission38Stage===1)return {name:'Centrico 광장 (위치 초안)',text:'동료들과 미르시티의 미래를 이야기하자.',action:'mission38Wish',label:'모두 함께 배틀하고 싶어'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission37Started&&!s.zaMission37Complete)return {name:'미르시티 방어 작전 (경로 초안)',text:s.zaMission37Stage>=7?'지가르데와 최종 대결은 준비 중이다.':'동료들과 방어 작전 구간을 진행하자.',action:'mission37Enter',label:'방어 작전으로 가기'};
  if(spot.tile==='F'&&s.district==='lumiose'&&!s.interior&&spot.x===13&&spot.y===7&&s.zaMission40Complete&&s.zaMission41Complete&&!s.zaMission42Stage)return {name:'L · 호텔 앞 (위치 초안)',text:'L이 미르시티의 균형에 관해 이야기하며 배틀을 신청한다.',action:'mission42L',label:'L과 배틀'};
  if(spot.tile==='F'&&s.district==='lumiose'&&s.interior==='hotelRoof'&&s.zaMission35Stage===6&&s.zaMission35RoofRequired)return {name:'AZ · 호텔 옥상 (위치 초안)',text:'동료들과 프리즘타워와 플라엣테에 관한 이야기를 듣자.',action:'mission35AZ',label:'AZ의 이야기 듣기'};
  if(spot.tile==='F'&&s.district==='lumiose'&&s.interior==='hotelRoof'&&s.zaMission36Started&&!s.zaMission36Stage&&!s.zaMission36RoofSeen)return {name:'AZ · 호텔 옥상 (위치 초안)',text:'빛나는 프리즘타워를 함께 살펴보자.',action:'mission36Roof',label:'타워 살펴보기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission36Started&&!s.zaMission36Complete)return !s.zaMission36Stage?(s.zaMission36RoofRequired&&!s.zaMission36RoofSeen?{name:'프리즘타워',text:'먼저 Hotel Z 옥상에서 AZ와 타워의 상황을 확인하자.'}:{name:'프리즘타워 · 팀 MZ (위치 초안)',text:'Vinnie와 동료를 만나자.',action:'mission36Tower',label:'팀 MZ 만나기'}):s.zaMission36Stage===1?(!['grass','fire','water'].includes(s.zaMission10Starter)?{name:'팀 MZ 동료 (위치 초안)',text:'이전 스타터 기록이 없어 사용한 타입을 선택하세요.',actions:[{action:'mission36Grass',label:'풀 타입'},{action:'mission36Fire',label:'불꽃 타입'},{action:'mission36Water',label:'물 타입'}]}:{name:'팀 MZ 동료 (위치 초안)',text:'동료와 배틀하자.',action:'mission36Rival',label:'동료와 배틀'}):s.zaMission36Stage===2?{name:'Vinnie (위치 초안)',text:'미르시티 방어 작전을 듣자.',action:'mission36Vinnie',label:'작전 듣기'}:{name:'옥상 탈출 경로 (초안)',text:'동료들과 함께 옥상에서 내려가자.',action:'mission37Enter',label:'옥상 경로로 돌아가기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission35Stage===7)return s.zaMission35Won?{name:'Grisham (카페 위치 초안)',text:'랭크 A 승급 보상을 받자.',action:'mission35Reward',label:'승급 보상 받기'}:{name:'Grisham (카페 위치 초안)',text:'도전권을 얻은 뒤 승급전을 치르자.',action:'mission35GrishamBattle',label:'Grisham과 승급전'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission35Stage===2)return {name:'누보 카페 (위치 초안)',text:'Grisham의 단서를 묻자.',action:'mission35Cafe',label:'단서 묻기'};
  if(!s.interior&&['lumiose-magenta-sector2','lumiose-magenta-sector4'].includes(s.district)&&spot.tile==='u'&&spot.x===17&&spot.y===(s.district==='lumiose-magenta-sector2'?6:14)){if(s.zaMission35Stage===3)return {name:'폐점한 Lysandre 카페 앞 (접근 위치 초안)',text:'Griselle과 배틀하자.',action:'mission35Griselle',label:'Griselle과 배틀'};if(Number(s.zaMission35Stage)>=4)return {name:'Lysandre 카페 (접근 위치 초안)',text:'마젠타 광장 북동쪽의 폐점한 카페다.',action:'enterLysandreCafe',label:'카페에 들어가기'};return {name:'폐점한 카페 (접근 위치 초안)',text:'오랫동안 문을 닫은 붉은 카페다.'};}
  if(s.interior==='lysandreCafe'&&spot.tile==='u')return Number(s.zaMission35Stage)>=4?{name:'숨겨진 통로 (배치 초안)',text:'책장 뒤 연구소로 들어가자.',action:'mission35LabEnter',label:'연구소 들어가기'}:{name:'책장 뒤 통로 (배치 초안)',text:'Lysandre Labs로 이어지는 숨겨진 통로다.'};
  if(s.interior==='lysandreCafe'&&spot.tile==='b'&&s.zaMission35Stage===5)return {name:'Grisham',text:'연구 결과를 이야기하자.',action:'mission35GrishamTalk',label:'이야기하기'};
  if(spot.tile==='0'&&s.district==='lumiose-site'&&!s.interior&&[3,4,5].includes(s.zaMission35Stage))return s.zaMission35Stage===3?{name:'폐점한 카페 · Griselle (위치 초안)',text:'Griselle과 배틀하자.',action:'mission35Griselle',label:'Griselle과 배틀'}:s.zaMission35Stage===4?{name:'Lysandre 카페 (위치 초안)',text:'숨겨진 연구소에 들어가자.',action:'mission35LabEnter',label:'연구소 들어가기'}:{name:'Grisham (위치 초안)',text:'연구 내용을 이야기하자.',action:'mission35GrishamTalk',label:'Grisham과 이야기하기'};
  if(s.district==='lumiose-protect'&&!s.interior&&s.zaProtectLayout===5&&s.zaProtectRoof&&s.zaProtectTowerApproachV1&&s.zaMission37Stage===7&&((!s.zaProtectTowerApproach&&spot.tile==='n'&&spot.x===18&&spot.y===2)||(s.zaProtectTowerApproach&&spot.tile==='h'&&spot.x===3&&spot.y===13)))return {name:'지가르데가 향한 길 (배치 초안)',text:s.zaProtectTowerApproach?'지나온 옥상으로 돌아간다.':'지가르데를 따라 타워 쪽으로 향한다.',action:'mission37TowerApproach',label:s.zaProtectTowerApproach?'옥상으로':'따라가기'};
  if(spot.tile==='n'&&s.district==='lumiose-protect'&&!s.interior&&s.zaMission37Stage===7&&!s.zaMission37Complete){const phase=s.zaMission37FinalPhase||0;return phase<6?{name:'지가르데와 앙주 (대결 초안)',text:phase%2?'지가르데가 공격할 차례다.':`붉은 꽃과 푸른 꽃을 진정시키자 (${Math.floor(phase/2)+1}/3).`,action:'mission37FinalBattle',label:phase%2?'지가르데 공격':'꽃과 배틀'}:phase===6?{name:'반응하는 돌',text:'돌을 꼭 쥐자.',action:'mission37Grip',label:'돌을 꼭 쥐기'}:{name:'메가 지가르데',text:'니힐라이트로 마지막 빛을 막자.',action:'mission37Nihil',label:'니힐라이트 사용'};}
  if(s.district==='lumiose-protect'&&!s.interior&&s.zaProtectLayout===5&&s.zaProtectScaffoldV1&&s.zaMission37Stage===4&&((!s.zaProtectScaffoldUpper&&spot.tile==='h'&&spot.x===19&&spot.y===9)||(s.zaProtectScaffoldUpper&&((spot.tile==='h'&&spot.x===3&&spot.y===13)||(spot.tile==='l'&&spot.x===19&&spot.y===3)))))return {name:'비계 경로 (배치 초안)',text:s.zaProtectScaffoldUpper?(spot.tile==='h'?'비계 입구로 돌아간다.':'개구부를 지나 아래로 내려간다.'):'비계에 올라 반대편으로 건너간다.',action:'mission37Scaffold',label:s.zaProtectScaffoldUpper?(spot.tile==='h'?'돌아가기':'내려가기'):'비계 오르기'};
  if(s.district==='lumiose-protect'&&!s.interior&&s.zaMission36DescentPending&&s.zaMission36RooftopRoute&&spot.tile==='h'&&spot.x===(s.zaMission36AtPlaza?18:4)&&spot.y===(s.zaMission36AtPlaza?14:3))return {name:'옥상 연결 (배치 초안)',text:s.zaMission36AtPlaza?'지나온 옥상으로 돌아간다.':'옥상에서 내려가 광장으로 향한다.',action:'mission36DescentStairs',label:s.zaMission36AtPlaza?'옥상으로':'광장으로 내려가기'};
  if(s.district==='lumiose-protect'&&!s.interior&&s.zaProtectLayout===5&&spot.tile==='i'&&!s.zaProtectRoof&&!s.zaProtectCanal)return {name:'건물 출입구 (배치 초안)',text:s.zaProtectBuilding?'건물 밖으로 돌아간다.':'건물 안으로 들어간다.',action:'mission37Building',label:s.zaProtectBuilding?'밖으로':'건물로'};
  if(s.district==='lumiose-protect'&&!s.interior&&s.zaProtectLayout===5&&spot.tile==='h'&&(s.zaProtectBuilding||s.zaProtectRoof))return {name:'사람 사다리 (배치 초안)',text:s.zaProtectRoof?'건물로 내려간다.':'동료들의 도움으로 옥상에 오른다.',action:'mission37RoofLadder',label:s.zaProtectRoof?'건물로':'옥상으로'};
  if(s.district==='lumiose-protect'&&!s.interior&&[4,5].includes(s.zaProtectLayout)&&spot.tile==='h')return {name:'운하 계단 (배치 초안)',text:s.zaProtectCanal?'계단을 올라 다리 쪽으로 나간다.':'계단을 내려가 운하변을 따라간다.',action:'mission37CanalStairs',label:s.zaProtectCanal?'계단 올라가기':'운하로 내려가기'};
  if(s.district==='lumiose-protect'&&!s.interior){const w=protectWave(s,spot.tile);if(w)return {name:`${w.name} (경로 초안)`,text:'이 구간의 폭주 포켓몬을 진정시키자. 동시 전투는 순차 턴제로 진행한다.',action:'mission37Wave',label:'방어 작전 배틀'};}
  {const p=lysandreWild(s,spot);if(p)return {name:`${p.alpha?'우두머리 ':''}${p.name} (위치 초안)`,text:'연구소에 살고 있는 야생 포켓몬이다.',action:`lysandreWild-${p.id}`,label:'배틀하기'};}
  if(s.district==='lumiose-lysandre-lab'&&!s.interior&&s.zaLysandreFloor===2&&spot.tile==='o'&&spot.x===5&&spot.y===7&&!s.zaLysandreB2Candy)return {name:'지하 2층 도구 (위치 초안)',text:'경험사탕 L을 발견했다.',action:'lysandreB2Candy',label:'도구 줍기'};
  if(s.district==='lumiose-lysandre-lab'&&!s.interior&&s.zaLysandreMazeV2===true&&s.zaLysandreFloor!==3&&s.zaLysandreFloor!==2){const wing=s.zaLysandreWing||'hub',tile=spot.tile;
   if(wing==='hub'&&['n','p','q'].includes(tile)){const target=({n:'a',p:'b',q:'e'})[tile];return {name:`연구소 ${target==='e'?'C':target.toUpperCase()}구역 입구 (초안)`,text:'이전 구역의 키카드가 필요하다.',action:`lysandreWing-${target}`,label:'구역으로 들어가기'};}
   if(wing!=='hub'&&tile==='t')return {name:'연구소 전원 장치 (위치 초안)',text:lysandrePower(s,wing)?'전원이 켜져 있다.':'전원을 켜 전송 장치를 작동시키자.',...(!lysandrePower(s,wing)?{action:'lysandrePower',label:'전원 켜기'}:{})};
   if(wing!=='hub'&&tile==='u'){const powerWing=wing==='b-mid'?'b':wing;return {name:'연구소 전송 장치 (위치 초안)',text:lysandrePower(s,powerWing)?'맞은편의 방으로 이동한다.':'먼저 이 구역의 전원을 켜야 한다.',...(lysandrePower(s,powerWing)?{action:'lysandreWarp',label:'전송하기'}:{})};}
   if(s.zaLysandreBossRoomV5&&((wing==='e'&&tile==='f'&&spot.x===17&&spot.y===9)||(wing==='e-boss'&&tile==='h'&&spot.x===11&&spot.y===13))){const ready=wing==='e-boss'||s.zaLysandreCards?.includes('e');return {name:'C 키카드 문 (배치 초안)',text:ready?(wing==='e'?'킬가르도가 있는 방으로 들어간다.':'보라색 구역으로 돌아간다.'):'C 키카드가 필요하다.',...(ready?{action:'lysandreBossDoor',label:wing==='e'?'들어가기':'돌아가기'}:{})};}
   if(['e','e-boss','e-vault'].includes(wing)&&s.zaLysandreKeyRoomV3&&tile==='j'&&spot.x===(wing==='e'?17:11)&&spot.y===(wing==='e'?9:wing==='e-boss'?6:13))return {name:'열쇠 방 문 (배치 초안)',text:wing==='e-vault'?'킬가르도의 방으로 돌아간다.':'킬가르도 뒤쪽 방으로 들어간다.',action:'lysandreVaultDoor',label:wing==='e-vault'?'돌아가기':'열쇠 방으로'};
   if((wing==='e'||wing==='e-vault')&&tile==='z'&&spot.x===(wing==='e'?20:8)&&spot.y===(wing==='e'?12:8))return {name:'귀환 전송기 전원 (위치 초안)',text:s.zaLysandreExitPower?'전원이 켜져 있다.':'전원을 켜 입구로 돌아가는 전송기를 작동시키자.',...(!s.zaLysandreExitPower?{action:'lysandreExitPower',label:'전원 켜기'}:{})};
   if((wing==='e'||wing==='e-vault')&&tile==='n'&&spot.x===(wing==='e'?20:14)&&spot.y===(wing==='e'?11:8))return {name:'입구 귀환 전송기 (위치 초안)',text:s.zaLysandreExitPower?'연구소 입구로 돌아간다.':'먼저 옆의 전원을 켜야 한다.',...(s.zaLysandreExitPower?{action:'lysandreExitWarp',label:'입구로 전송'}:{})};
   if(wing!=='hub'&&tile==='h')return {name:'연구소 구역 출구 (위치 초안)',text:'입구 홀로 돌아간다.',action:'lysandreWingExit',label:'입구 홀로'};
  }
  if(s.district==='lumiose-lysandre-lab'&&!s.interior){const tile=spot.tile,floor=s.zaLysandreFloor||1;if('abek'.includes(tile))return {name:floor===3?'연구 자료 (배치 초안)':'연구소 단서 (배치 초안)',text:floor===3?'자료를 읽자.':tile==='k'?'승강기 열쇠를 찾자.':'키카드를 찾자.',action:'mission35LabInspect',label:'조사하기'};if(tile==='g'&&floor===1)return {name:'킬가르도',text:'세 키카드를 찾고 길을 열자.',action:'mission35Aegislash',label:'킬가르도와 배틀'};if(tile==='l')return {name:'승강기 (초안)',text:'열쇠를 사용해 지하 1층·2층·3층을 오간다.',action:'mission35Elevator',label:'승강기 사용',...(s.zaLysandreElevatorKey?{actions:[...([1,2,3].filter(n=>n!==floor).map(n=>({action:`lysandreFloor-${n}`,label:`지하 ${n}층으로`})))]}:{})};if(tile==='j'&&floor===3)return {name:'L',text:'자료를 모두 읽고 L의 이야기를 듣자.',action:'mission35LabL',label:'L의 이야기 듣기'};}
  {const c=mission31Case(s,spot.tile);if(c){if(s[`zaMission${c.n}RewardPending`])return {name:`${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'mission31ClaimStone',label:'메가스톤 받기'};if(s.zaMission31Stage===3&&!s[`zaMission${c.n}Complete`])return c.n===34&&!s.zaMission34PhilippeWon?{name:'Philippe (위치 초안)',text:'아쿠스타에게 가기 전 Philippe와 배틀하자.',action:'mission34Philippe',label:'Philippe와 배틀'}:{name:`폭주 ${c.name} (위치 초안)`,text:'현장 경로와 레벨은 초안이다.',action:'mission31CaseBattle',label:`${c.name}와 배틀`};}}
  {const c=mission26Case(s,spot.tile);if(c){if(s[`zaMission${c.n}RewardPending`])return {name:`${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'mission26ClaimStone',label:'메가스톤 받기'};if(s.zaMission26Stage===3&&!s[`zaMission${c.n}Complete`])return {name:`폭주 ${c.name} (위치 초안)`,text:'폭주 메가진화를 진정시키자. 실제 경로와 레벨은 초안이다.',action:'mission26CaseBattle',label:`${c.name}와 배틀`};}}
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&s.interior==='quasarticoOffice'&&[1,2].includes(s.zaMission41Stage))return s.zaMission41Stage===1?{name:'Vinnie',text:'시뮬레이터 이야기를 듣자.',action:'mission41Vinnie',label:'Vinnie와 이야기하기'}:{name:'Vinnie의 시뮬레이터',text:`폭주 메가진화 훈련 ${(s.zaMission41Sim||0)}/3`,action:'mission41Sim',label:'다음 시뮬레이션'};
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&s.interior==='quasarticoOffice'&&s.zaMission31Stage===1)return {name:'Jett (사무실 초안)',text:'도시 재개발과 폭주 사건에 관해 들어 보자.',action:'mission31Jett',label:'Jett와 이야기하기'};
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&s.interior==='quasarticoOffice')return s.zaMission10Stage===6?{name:'Vinnie',text:'폭주한 메가진화와 도시의 상황에 관해 들어 보자.',action:'mission10OfficeTalk',label:'Vinnie의 설명 듣기'}:{name:'Vinnie',text:'도시의 포켓몬을 위해 함께 힘을 모으자.'};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaInfiniteFloettePending&&!s.zaMission39Complete)return {name:'팀 MZ 동료',text:'영원의꽃 플라엣테와 플라엣테나이트를 받자.',action:'mission39Floette',label:'선물 받기'};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&infiniteRewardWins(s)===14&&!['grass','fire','water'].includes(s.zaMission10Starter))return {name:'무한 로열 접수처',text:'기존 스타터 타입 기록이 없습니다. 사용했던 타입을 선택하세요.',actions:[{action:'mission39StarterGrass',label:'풀 타입'},{action:'mission39StarterFire',label:'불꽃 타입'},{action:'mission39StarterWater',label:'물 타입'}]};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&Object.values(s.zaInfiniteCandyPending||{}).some(n=>Number.isSafeInteger(n)&&n>0))return {name:'무한 로열 접수처',text:'가방이 가득 차 맡겨 둔 경험사탕을 받자.',action:'mission39ClaimCandy',label:'보관된 사탕 받기'};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaInfiniteSecondWon&&infiniteNextReward(s))return infinitePoints(s)>=50000?{name:'무한 로열 접수처',text:`도전권으로 ${infiniteNextReward(s).name}와 보상 배틀을 치르자.`,action:'mission39NextReward',label:'보상 배틀 시작'}:{name:'무한 로열 접수처',text:`다음 도전권을 모으자 (${infinitePoints(s)}/50000).`};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaInfiniteFirstWon&&!s.zaInfiniteSecondWon)return infinitePoints(s)>=50000?{name:'무한 로열 접수처',text:'도전권으로 Griselle과 두 번째 보상 배틀을 치르자.',action:'mission39Griselle',label:'두 번째 보상 배틀'}:{name:'무한 로열 접수처',text:`두 번째 도전권을 모으자 (${infinitePoints(s)}/50000).`};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice'&&s.zaMission39Started&&!s.zaInfiniteFirstWon)return infinitePoints(s)>=50000?{name:'무한 로열 접수처',text:'도전권으로 Zach와 첫 보상 배틀을 치르자.',action:'mission39Zach',label:'첫 보상 배틀'}:{name:'무한 로열 접수처',text:`도전권을 모으자 (${infinitePoints(s)}/50000).`};
  if(spot.tile==='R'&&s.interior==='quasarticoOffice')return s.zaMission10Stage===7?{name:'콰자르티코 안내 직원',text:'메가조각 교환에 관해 안내해 드릴게요.',action:'mission10Reception',label:'교환 안내 듣기'}:{name:'콰자르티코 안내 직원',text:'메가조각을 메가스톤과 교환할 수 있습니다. 광장의 임시 교환처를 이용하세요.'};
  if(!s.interior&&s.district==='lumiose-magenta-canal-route'&&spot.tile==='u'&&spot.x===8&&spot.y===7)return s.zaRoyaleRank==='F'&&s.zaMission14Stage>=2&&s.zaMission14Stage<=8?{name:'변전소 퀴즈 입구 (위치 초안)',text:s.zaMission14Stage===2?'암호는 레츠 고 DYN4MO!다.':'Canari 퀴즈 장소로 돌아가자.',action:'enterCanariQuiz',label:'퀴즈 행사장으로'}:{name:'변전소 퀴즈 입구 (위치 초안)',text:'Canari 퀴즈가 열리는 변전소다.'};
  if(s.interior==='canariQuiz'&&s.district==='lumiose-magenta-canal-route'){
   const stage=s.zaMission14Stage;
   if((spot.tile==='v'||spot.tile==='w')&&stage>=3&&stage<=5)return {name:spot.tile==='v'?'초록 참 구역 (위치 초안)':'빨강 거짓 구역 (위치 초안)',text:'이 구역에서 현재 문제의 답을 선택한다.',action:spot.tile==='v'?'rankETrue':'rankEFalse',label:spot.tile==='v'?'참 선택':'거짓 선택'};
   if(spot.tile==='t'&&stage>=3&&stage<=5)return {name:'Canari 퀴즈 무대',text:stage===3?'블록 퍼즐 게임을 잘한다: 참 또는 거짓 구역을 선택하자.':stage===4?'마카롱이 가장 좋아하는 음식이다: 참 또는 거짓 구역을 선택하자.':'전기 타입이 가장 좋다: 참 또는 거짓 구역을 선택하자.'};
   if(spot.tile==='t'&&stage===6)return {name:'Canari 퀴즈 무대',text:'사나이 카페에서 특별한 미르갈레트를 찾아오자.'};
   if(spot.tile==='t'&&stage===7)return {name:'Mani · 퀴즈 행사장',text:'Mani와 배틀하자.',action:'rankEMani',label:'Mani와 배틀'};
   if(spot.tile==='t'&&stage===8)return {name:'Canari · 마지막 질문',text:'어릴 때 게임을 하던 노트북은 누구 것일까?',actions:[{action:'rankEGrandpa',label:'할아버지'},{action:'rankEWrong',label:'다른 사람'}]};
  }
  if(spot.tile==='t'&&s.district==='lumiose-north-boulevard'&&!s.interior){const stage=s.zaMission14Stage;if(stage===2)return {name:'변전소 입구 (위치 초안)',text:'암호를 확인하고 Canari 퀴즈에 들어가자.',action:'rankEPassword',label:'암호: 레츠 고 DYN4MO!'};if(stage>=3&&stage<=5)return {name:'Canari 퀴즈 (초안)',text:stage===3?'Canari는 낙하 블록 게임을 잘한다.':stage===4?'Canari가 가장 좋아하는 음식은 마카롱이다.':'Canari가 가장 좋아하는 타입은 전기다.',actions:[{action:'rankETrue',label:'맞다'},{action:'rankEFalse',label:'아니다'}]};if(stage===6)return {name:'Canari 퀴즈',text:'카페에서 특별한 미르갈레트를 찾아오자.'};if(stage===7)return {name:'Mani',text:'다음 문제에 앞서 Mani와 배틀하자.',action:'rankEMani',label:'Mani와 배틀'};if(stage===8)return {name:'Canari 퀴즈',text:'Canari가 처음 게임한 노트북은 누구의 것이었을까?',actions:[{action:'rankEGrandpa',label:'할아버지'},{action:'rankEWrong',label:'다른 가족'}]};}
  if(!s.interior&&s.district==='lumiose-magenta-sector1'&&spot.tile==='u')return {name:'사나이 카페 (위치 초안)',text:'카페에 들어가자.',action:'enterCafeGallant',label:'카페 들어가기'};
  if(!s.interior&&s.district==='lumiose-jaune-sector8'&&spot.tile==='H')return {name:'존느 포켓몬센터 (위치 초안)',text:'파티의 HP·상태·PP를 회복한다.',action:'heal',label:'파티 회복하기'};
  if(!s.interior&&s.district==='lumiose-magenta-sector1'&&spot.tile==='H')return {name:'로즈 광장 포켓몬센터 (위치 초안)',text:'파티의 HP·상태·PP를 회복한다.',action:'heal',label:'파티 회복하기'};
  if(s.interior==='cafeGallant'&&spot.tile==='n')return s.zaMission14Stage===6?{name:'Naveen · 사나이 카페',text:'특별한 미르갈레트를 받자.',action:'rankEGalette',label:'미르갈레트 받기'}:{name:'사나이 카페 (배치 초안)',text:'트레이너들이 모이는 카페다.'};
  if(spot.tile==='m'&&['lumiose-centrico-route','lumiose-bleu-street'].includes(s.district)&&!s.interior)return s.zaMission14Stage===6?{name:'카페 갈랑 (임시 위치)',text:'저리더프가 좋아하는 특별한 미르갈레트를 받자.',action:'rankEGalette',label:'미르갈레트 받기'}:{name:'카페 갈랑 (임시 위치)',text:'정확한 위치와 시설은 초안이다.'};
  if(spot.tile==='d'&&s.district==='lumiose-rooftop'&&!s.interior&&[2,3].includes(s.zaMission15Stage)&&mission15Complete(s)&&!s.zaMission15SceneSeen)return {name:'지가르데와 L (위치 초안)',text:'세 사건 뒤 옥상에서 지가르데와 L을 만났다.',action:'mission15MeetL',label:'L의 이야기 듣기'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission25Complete&&!s.zaMission26Stage)return {name:'Asami · 부티크 (위치 초안)',text:'배틀에서 메가진화를 보여주고 승리하자.',action:'mission26Asami',label:'Asami와 배틀'};
  if(spot.tile==='q'&&s.district==='lumiose-north-boulevard'&&!s.interior)return {name:'호텔 리시심 (위치 초안)',text:'북쪽 큰길에서 호텔 로비와 SBC 대회장으로 이어진다.',action:'enterRichissime',label:'호텔 들어가기'};
  if(spot.tile==='i'&&s.district==='lumiose-centrico-route'&&['richissimeLobby','richissimeHall'].includes(s.interior))return {name:'호텔 승강기 (위치 초안)',text:s.interior==='richissimeLobby'?'SBC 대회장으로 올라가자.':'호텔 로비로 내려가자.',action:'richissimeLift',label:s.interior==='richissimeLobby'?'대회장으로':'로비로'};
  if(spot.tile==='R'&&s.interior==='richissimeLobby')return {name:'호텔 리시심 안내',text:'로비와 위층 SBC 대회장이 연결된다. 실내 배치는 초안이다.'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&(!s.interior||s.interior==='richissimeHall')){
    let d=null;
    if(s.zaMission30Started&&!s.zaMission30Complete)d=s.zaMission30Won?{name:'Jacinthe (호텔 위치 초안)',text:'랭크 B 승급 보상을 받자.',action:'mission30Reward',label:'승급 보상 받기'}:{name:'Lebanne (호텔 위치 초안)',text:'도전권을 모은 뒤 토너먼트를 진행하자.',action:'mission30Round',label:'다음 배틀 시작'};
    else if(s.zaMission39Complete&&infiniteRewardWins(s)>=20)d=!s.zaSide119Started?{name:'Lebanne · 호텔 초대 (위치 초안)',text:'Jacinthe의 새 토너먼트에 초대받았다.',action:'side119Accept',label:'초대 수락'}:{name:'Jacinthe 토너먼트 (호텔 위치 초안)',text:s.zaSide119Complete?`무한 연승 ${s.zaSide119RepeatStreak||0}회 · 최고 ${s.zaSide119BestStreak||0}회`:`Jacinthe와 네 번 배틀 (${s.zaSide119Wins||0}/4).`,actions:[...(s.zaSide119LuxuryPending>0?[{action:'side119ClaimBalls',label:`럭셔리볼 받기 (${s.zaSide119LuxuryPending})`}]:[]),{action:'side119Battle',label:'Jacinthe와 배틀'}]};
    else if(s.zaMission26Stage===1)d={name:'초대받은 호텔 (위치 초안)',text:'Lebanne의 이야기를 듣자.',action:'mission26Invitation',label:'SBC 초대 확인'};
    if(s.interior==='richissimeHall')return d||{name:'SBC 대회장 (배치 초안)',text:'Jacinthe가 이곳에서 토너먼트를 연다.'};
    if(d)return {...d,actions:[...(d.actions||(d.action?[{action:d.action,label:d.label}]:[])),{action:'enterRichissime',label:'호텔에 들어가기'}]};
  }
  if(spot.tile==='q'&&spot.x===6&&spot.y===11&&s.district==='lumiose-vert-sector4'&&!s.interior&&!['roof','courtyard'].includes(s.zaVert4Layer)&&s.zaMission25Started&&!s.zaMission25Complete)return s.zaMission25Stage===2?{name:'Naveen · 베르 구역 4 배틀코트 (위치 초안)',text:'Lida와의 배틀을 마쳤다. Naveen에게 도전하자.',action:'mission25Naveen',label:'Naveen과 배틀'}:{name:'Lida · 베르 구역 4 배틀코트 (위치 초안)',text:'팀 MZ 동료와 배틀하자.',action:'mission25Lida',label:'Lida와 배틀'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission25Started&&!s.zaMission25Complete)return s.zaMission25Stage===2?{name:'Naveen (배틀코트 위치 초안)',text:'Lida와의 배틀을 마쳤다. Naveen에게 도전하자.',action:'mission25Naveen',label:'Naveen과 배틀'}:{name:'Lida (배틀코트 위치 초안)',text:'팀 MZ 동료와 배틀하자.',action:'mission25Lida',label:'Lida와 배틀'};
  if(spot.tile==='b'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission20Stage>=7)return {name:'빈집 (위치 초안)',text:'Syndicate의 첫 의뢰 현장이다.',action:'mission20EnterHouse',label:'빈집 들어가기'};
  if(s.district==='lumiose-ghost-house'&&!s.interior){const g=mission20Ghost(s,spot.tile),caught=mission20GhostsCaught(s);if(g)return caught.includes(g.id)?{name:g.name,text:'이미 해결했다.'}:s.zaMission20Stage===7?{name:g.name,text:'빈집의 포켓몬을 살펴보자. 레벨과 위치는 초안이다.',action:'mission20GhostBattle',label:`${g.name}와 배틀`}:{name:g.name,text:'빈집을 살펴보았다.'};if(spot.tile==='n'&&s.zaSide117Complete&&!s.zaSide118Stage&&s.zaMission20Stage!==7)return {name:'Gänger (위치 초안)',text:'사라진 Gengar를 찾아 달라고 한다.',action:'side118Start',label:'의뢰 받기'};if(spot.tile==='n')return s.zaMission20Stage===7&&caught.length===3?{name:'집의 입주자',text:'세 포켓몬을 살펴보았다. 입주자와 이야기하자.',action:'mission20HouseReport',label:'입주자와 이야기하기'}:{name:'집의 입주자',text:s.zaMission20Stage===7?`고스트 포켓몬 ${caught.length}/3 확인`:'집의 입주자와 이야기했다.'};}
  if(zone9CrystalAt(s,spot))return {name:'옥상의 메가결정 (위치 초안)',text:'공격 기술로 부술 수 있다. 다시 생기는 데 시간이 걸린다.',action:'smashZone9Crystal',label:'결정 부수기'};
  if(spot.tile==='c'&&s.district==='lumiose-crystal-sewer'&&!s.interior&&s.zaMission20Stage===9)return {name:'메가결정',text:`공격 기술로 결정을 부수자 (${clearedCrystals(s).length}/27).`,action:'mission20BreakCrystal',label:'결정 부수기'};
  if(spot.tile==='o'&&['lumiose-centrico-route','lumiose-rouge-sector1'].includes(s.district)&&!s.interior&&s.zaMission20Stage===11)return s.zaMission20SBCSeries==='vivica'?{name:'SBC 연전 (위치 초안)',text:'회복 없이 Vivica와 이어서 배틀하자.',actions:[{action:'mission20SBCNext',label:'Vivica와 배틀'},{action:'mission20SBCCancel',label:'연전 중단'}]}:{name:'SBC 배틀 (위치 초안)',text:'François와 Vivica를 연속으로 상대한다.',action:'mission20SBCStart',label:'SBC 연전 시작'};
  if(spot.tile==='d'&&['lumiose-centrico-route','lumiose-rouge-sector1'].includes(s.district)&&!s.interior&&s.zaMission20Stage===12)return {name:'은행 주변 (위치 초안)',text:'안전 단체 대표와 배틀하자.',action:'mission20SafetyBattle',label:'안전 단체와 배틀'};
  if(spot.tile==='v'&&s.district==='lumiose-vernal'&&!s.interior&&s.zaMission20Stage>=1)return {name:'Rust Syndicate 사무소 (위치 초안)',text:'사무소로 향하자.',action:'mission20EnterRust',label:'사무소로 가기'};
  if(!s.interior&&spot.tile==='u'&&((s.district==='lumiose-magenta-sector8-route'&&spot.x===16&&spot.y===14)||(s.district==='lumiose-magenta-sewer-bank'&&spot.x===18&&spot.y===13)))return {name:'운하 접근 경사로 (위치 초안)',text:s.district==='lumiose-magenta-sector8-route'?'포켓몬센터 가까이의 경사로로 운하까지 내려간다.':'경사로를 따라 포켓몬센터 근처 거리로 올라간다.',action:'magentaSewerRamp',label:s.district==='lumiose-magenta-sector8-route'?'운하로 내려가기':'거리로 올라가기'};
  if(spot.tile==='z'&&['lumiose-magenta-canal-route','lumiose-magenta-sewer-bank'].includes(s.district)&&!s.interior&&!(s.zaMission20Stage>=5))return {name:'미르 지하 수도 입구 (위치 초안)',text:'마젠타 거리의 하수도 입구다. 미션 전 개방 시점은 임시값이다.',action:'magentaSewerEnter',label:'하수도 들어가기'};
  if(spot.tile==='z'&&['lumiose-vernal','lumiose-magenta-canal-route','lumiose-magenta-sewer-bank'].includes(s.district)&&!s.interior&&s.zaMission20Stage>=5){const stage=s.zaMission20Stage;return {name:'하수도 접근 (위치 초안)',text:stage===8?'Syndicate의 결정 정리 의뢰를 받자.':stage===9?`메가결정 ${clearedCrystals(s).length}/27 정리 중.`:stage===10?'결정 정리 결과를 보고하자.':'하수도 입구다.',actions:[...(stage===8?[{action:'mission20CrystalStart',label:'결정 정리 의뢰 받기'}]:[]),...(stage===9?[{action:'mission20CrystalEnter',label:'결정 정리 하수도 들어가기'}]:[]),...(stage===10?[{action:'mission20CrystalReport',label:'정리 결과 보고하기'}]:[]),...((stage<8||stage>=10)&&s.district!=='lumiose-vernal'?[{action:'magentaSewerEnter',label:'하수도 들어가기'}]:[]),...(s.district==='lumiose-vernal'?[{action:'mission20EnterSewer',label:'기존 하수도 들어가기'}]:[])]};}
  if(spot.tile==='d'&&s.district==='lumiose-rust'&&(!s.interior||s.interior==='rustOffice')){if(s.zaMission20Stage===1)return {name:'Rust Syndicate 단원',text:'사무소 앞에서 단원과 배틀하자.',action:'mission20Guard',label:'단원과 배틀'};if(s.zaMission20Stage===2)return {name:'Philippe',text:'Philippe와 배틀하자.',action:'mission20Philippe',label:'Philippe와 배틀'};if(s.zaMission20Stage===14)return {name:'Philippe',text:'의뢰를 마쳤다고 보고하자.',action:'mission20Finish',label:'의뢰 완료 보고'};if(s.zaMission20Complete&&!s.zaMission24Complete)return s.zaMission24Won?{name:'Corbeau',text:'승급 보상을 받자.',action:'mission24Reward',label:'승급 보상 받기'}:{name:'Philippe',text:'도전권을 얻은 뒤 Corbeau와 승급전을 치르자.',action:'mission24Corbeau',label:'Corbeau에게 도전'};if(s.zaMission20Stage===6)return {name:'Philippe',text:'첫 의뢰인 빈집의 상황을 확인해 달라고 한다.',action:'mission20JobStart',label:'첫 의뢰 받기'};if(s.zaMission20Stage===3)return {name:'Philippe와 Corbeau',text:'팀 MZ의 빚과 의뢰에 대한 이야기를 듣자.',action:'mission20Deal',label:'이야기 듣기'};return {name:'Rust Syndicate 사무소',text:'의뢰 내용과 실내 배치는 아직 초안이다.'};}
  if(s.zaMission20Stage>=5&&!s.interior){const c=mission20Case(s,spot.tile);if(c){if(s[`zaMission${c.n}RewardPending`])return {name:`폭주 ${c.name} (위치 초안)`,text:'사건 보상을 받자.',action:'mission20ClaimStone',label:'메가스톤 받기'};if(s.zaMission20Stage===5&&!s[`zaMission${c.n}Complete`])return c.n===23&&!s.zaMission23GwynnWon?{name:'Gwynn (위치 초안)',text:'메가전룡에게 가기 전에 Gwynn과 배틀하자.',action:'mission23Gwynn',label:'Gwynn과 배틀'}:{name:`폭주 ${c.name} (위치 초안)`,text:'동료 동시 전투와 원작 경로는 준비 중이다.',action:'mission20CaseBattle',label:`${c.name}와 배틀`};}}
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&spot.tile==='u'&&spot.x===5&&spot.y===6)return {name:'미르시티 시청 (위치 초안)',text:'시청 앞길과 분수 주변을 둘러보자. 실내는 아직 갈 수 없다.'};
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&spot.tile==='F'&&spot.x===7&&spot.y===11&&s.zaMission19Stage===4)return {name:'시청 근처 주민 (위치 초안)',text:'분수 곁에서 Gwynn을 본 사람에게 물어보자.',action:'mission19CityClue',label:'주변 사람에게 묻기'};
  if(spot.tile==='t'&&s.district==='lumiose-rouge-north'&&!s.interior&&s.zaMission19Stage===4)return {name:'시청 단서 (위치 초안)',text:'Gwynn을 본 사람에게 물어보자.',action:'mission19CityClue',label:'주변 사람에게 묻기'};
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior&&s.zaMission19Stage===5)return {name:'누보 카페 (위치 초안)',text:'Emma와 함께 Gwynn의 흔적을 살펴보자.',action:'mission19CafeClue',label:'카페에서 묻기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&[6,14,15].includes(s.zaMission19Stage))return s.zaMission19Stage===6?{name:'Canari (장소 초안)',text:'단서를 얻기 위해 다시 배틀하자.',action:'mission19Canari',label:'Canari와 배틀'}:s.zaMission19Stage===14?{name:'Ivor (도장 초안)',text:'Gwynn을 찾았다. 승급전에 도전하자.',action:'mission19Ivor',label:'Ivor와 배틀'}:{name:'Ivor',text:'승급 보상을 받자.',action:'mission19Reward',label:'보상 받기'};
  if(spot.tile==='h'&&!s.interior&&(s.district==='lumiose-vernal'||(s.district==='lumiose-bleu-sector7'&&!s.zaBleu7Upper))&&s.zaMission19Stage>=7&&s.zaMission19Stage<=13)return s.zaMission19Stage===7?{name:'블로스터 분수 (위치 초안)',text:'냉동빔을 아는 선두 포켓몬으로 분수를 얼리자.',action:'mission19Freeze',label:'냉동빔 사용'}:{name:'하수도 입구 (위치 초안)',text:'얼어붙은 분수 아래의 문으로 들어가자.',action:'mission19EnterSewer',label:'하수도 들어가기'};
  if(s.district==='lumiose-sewer'&&!s.interior){const stage=s.zaMission19Stage;if(spot.tile==='v'&&stage===11&&[0,1].includes(s.zaMission19ChandelureStep))return {name:'샹델라 (위치 초안)',text:'샹델라를 따라 하수도 안쪽을 살펴보자.',action:'mission19FollowChandelure',label:'샹델라 따라가기'};if(spot.tile==='t'&&stage===9)return {name:'잠긴 문',text:'문을 살펴보고 Emma의 볼을 받자.',action:'mission19Lock',label:'잠긴 문 조사'};if(spot.tile==='q'&&stage===10)return {name:'클레피',text:'클레피와 배틀해 포획하자.',action:'mission19Klefki',label:'클레피와 배틀'};if('abed'.includes(spot.tile)&&stage===11){if([0,1].includes(s.zaMission19ChandelureStep))return {name:'하수도 조사 지점',text:'먼저 샹델라를 따라가자.'};const seen=sewerInspected(s);return {name:'하수도 조사 지점',text:`전기판·기계·파이프·상자 ${seen.length}/4 조사`,...(!seen.includes(spot.tile)?{action:`mission19Inspect${spot.tile.toUpperCase()}`,label:'살펴보기'}:{})};}if(spot.tile==='i'&&(stage===12||(stage===13&&s.zaMission19InnerEnabled))&&!s.zaMission19Inner)return {name:'수상한 벽',text:'환상으로 만들어진 벽을 지나가자.',action:'mission19Wall',label:'벽 통과'};if(spot.tile==='u'&&stage===13&&(!s.zaMission19InnerEnabled||s.zaMission19Inner))return {name:'Gwynn',text:'Gwynn과 배틀해 이야기를 들어 보자.',action:'mission19Gwynn',label:'Gwynn과 배틀'};}
  if(spot.tile==='e'&&s.district==='lumiose-bureau'&&!s.interior&&s.zaMission19Stage===3)return {name:'탐정사무소 · Emma',text:'Ivor의 여동생 Gwynn을 찾는 일을 이야기하자.',action:'mission19Bureau',label:'Emma와 이야기하기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&s.zaMission19Stage===1&&rankEPoints(s)>=35000&&!s.zaMission19JoseeWon)return {name:'정의단 도장 (임시 위치)',text:'Ivor를 만나기 전에 Josée와 배틀하자.',action:'mission19Josee',label:'Josée와 배틀'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&s.zaMission19SeedPending)return {name:'Josée (임시 위치)',text:'승리 보상을 받자.',action:'mission19Seed',label:'숙달의씨 받기'};
  if(spot.tile==='d'&&s.district==='lumiose-rooftop'&&!s.interior&&s.zaMission15Stage===1)return {name:'팀 MZ 동료',text:'옥상 길과 로토글라이드에 관한 설명을 들어 보자.',action:'mission15Rooftop',label:'옥상에서 동료 만나기'};
  if(!s.interior&&s.district==='lumiose-magenta-sector3-roof'&&spot.tile==='n'&&s.zaMission15Stage===2&&s.zaMission17ApproachRequired&&!s.zaMission17LidaMet)return {name:'Lida · 옥상 (위치 초안)',text:'루차불이 건너편 옥상으로 이동했다. 비계를 따라가자.',action:'mission17MeetLida',label:'Lida와 이야기'};
  if(!s.interior&&s.district==='lumiose-jaune-sector9'&&spot.tile==='n'&&s.zaMission15Stage===2&&s.zaMission18ApproachRequired&&!s.zaMission18NaveenMet)return {name:'Naveen · 존느 9번지 (위치 초안)',text:'Naveen과 함께 다크펫을 찾아보자.',action:'mission18MeetNaveen',label:'Naveen과 이야기'};
  if(spot.tile==='d'&&!s.interior&&s.zaMission15Stage>=2&&!((s.district==='lumiose-site'&&s.zaMission12RewardPending)||(s.district==='lumiose-north-boulevard'&&s.zaMission13RewardPending))){const scene=mission15CaseDialogue(s);if(scene)return scene;}
  if(!s.interior&&s.district==='lumiose-vert-sector6'&&spot.tile==='u'&&spot.x===17&&spot.y===13)return {name:'라시느건설 (입구 초안)',text:'차고로 들어가자.',action:'enterRacineGarage',label:'차고 들어가기'};
  if(s.interior==='racineGarage'&&s.district==='lumiose-vert-sector6'&&spot.tile==='u')return Number(s.zaMission14Stage)>=10?{name:'작은 방 (입구 초안)',text:'Canari의 방으로 들어간다.',action:'enterCanariRoom',label:'작은 방 들어가기'}:{name:'작은 방',text:'Tarragon의 안내를 기다리자.'};
  if(s.interior==='racineRoom'&&spot.tile==='c'&&s.zaMission14Stage===10&&!s.zaCanariRoomVisited)return {name:'Canari · 작은 방 (배치 초안)',text:'Canari와 이야기하고 차고로 이동하자.',action:'meetCanariRoom',label:'Canari와 이야기'};
  if(s.interior==='racineGarage'&&s.district==='lumiose-vert-sector6'&&spot.tile==='d'&&s.zaMission19Stage===6&&s.zaRoyaleRank==='E')return {name:'Canari · 라시느건설 (위치 초안)',text:'Gwynn의 단서를 얻기 위해 Canari와 다시 배틀하자.',action:'mission19Canari',label:'Canari와 재대결'};
  if(s.interior==='racineGarage'&&spot.tile==='d'&&[9,10,11].includes(s.zaMission14Stage))return s.zaMission14Stage===9?{name:'Tarragon · 차고',text:'승급전 전에 Tarragon과 배틀하자.',action:'rankETarragon',label:'Tarragon과 배틀'}:s.zaMission14Stage===10?(s.zaCanariRoomVisited?{name:'Canari · 차고',text:'랭크 E 승급전에 도전하자.',action:'rankECanari',label:'Canari와 배틀'}:{name:'Tarragon · 차고',text:'작은 방에서 Canari를 만나자.'}):{name:'Canari · 차고',text:'승급 보상을 받자.',action:'rankEReward',label:'승급 보상 받기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&[9,10,11].includes(s.zaMission14Stage))return s.zaMission14Stage===9?{name:'Tarragon (장소 초안)',text:'승급전 전 Tarragon과 배틀하자.',action:'rankETarragon',label:'Tarragon과 배틀'}:s.zaMission14Stage===10?{name:'Canari (장소 초안)',text:'랭크 E 승급전에 도전하자.',action:'rankECanari',label:'Canari와 배틀'}:{name:'Canari',text:'승급 보상을 받자.',action:'rankEReward',label:'승급 보상 받기'};
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior&&s.zaMission37Complete)return {name:'정의단 도장 특훈 담당자 (위치 초안)',text:'가방에서 병뚜껑과 파티 선두를 선택해 대단한 특훈을 받자.',hyperTraining:true};
  if(s.district==='lumiose-mission32-courtyard'&&!s.interior&&['j','l'].includes(spot.tile))return {name:spot.tile==='j'?'안뜰 홀로베이터 (위치 초안)':'비계 사다리 (위치 초안)',text:'옥상 높이층을 오간다.',action:spot.tile==='j'?'mission32Lift':'mission32Ladder',label:'이동하기'};
  if(s.district==='lumiose-mission12-jaune3'&&!s.interior&&spot.tile==='l')return {name:'비계 사다리 (위치 초안)',text:s.zaMission12WorkerWon?'비계를 따라 옥상과 거리를 오간다.':'Tony에게 허락을 받아야 한다.',...(s.zaMission12WorkerWon?{action:'mission12Scaffold',label:'사다리 사용'}:{})};
  if(s.district==='lumiose-mission12-jaune3'&&!s.interior&&spot.tile==='d'){
   if(s.zaMission12Layer==='roof')return s.zaMission12RewardPending?{name:'메가폭타 사건',text:'폭타나이트를 받자.',action:'claimMission12Stone',label:'폭타나이트 받기'}:s.zaMission10Stage===10&&s.zaMission12WorkerWon&&!s.zaMission12Complete?{name:'폭주 메가폭타 (위치 초안)',text:'옥상에서 폭주 메가폭타를 진정시키자.',action:'battleMission12Camerupt',label:'메가폭타와 배틀'}:{name:'옥상 (지형 초안)',text:'공사 현장의 옥상이다.'};
   return s.zaMission10Stage===10&&!s.zaMission12WorkerWon?{name:'Tony · 공사 현장 (위치 초안)',text:'비계로 올라가기 전에 Tony와 배틀하자.',action:'battleMission12Worker',label:'Tony와 배틀'}:{name:'공사 현장 (지형 초안)',text:s.zaMission12WorkerWon?'사다리를 따라 옥상에 올라갈 수 있다.':'공사 현장이다.'};
  }
  if(spot.tile==='d'&&s.district==='lumiose-site'&&!s.interior){if(s.zaMission12RewardPending)return {name:'폭주 메가폭타 사건 (장소 초안)',text:'폭타나이트를 받자.',action:'claimMission12Stone',label:'폭타나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission12Complete)return s.zaMission12WorkerWon?{name:'폭주 메가폭타 사건 (장소 초안)',text:'비계 경로는 초안이다. 폭주 메가폭타를 진정시키자.',action:'battleMission12Camerupt',label:'메가폭타와 배틀'}:{name:'공사 현장 (장소 초안)',text:'현장에 들어가기 전 Tony와 배틀하자.',action:'battleMission12Worker',label:'Tony와 배틀'};return {name:'공사 현장 (초안)',text:'폭타 사건의 실제 위치와 경로는 확인 중이다.'};}
  if(spot.tile==='d'&&(s.district==='lumiose-north-boulevard'||s.district==='lumiose-magenta-sector9'&&s.zaMagenta9Upper!==true)&&!s.interior){if(s.zaMission13RewardPending)return {name:'폭주 메가우츠보트 사건 (위치 초안)',text:'우츠보트나이트를 받자.',action:'claimMission13Stone',label:'우츠보트나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission13Complete)return {name:'폭주 메가우츠보트 사건 (위치 초안)',text:'Naveen이 응원하고 있다. 동료 동시 전투는 준비 중이다.',action:'battleMission13Victreebel',label:'메가우츠보트와 배틀'};return {name:'북쪽 큰길 (초안)',text:'우츠보트 사건의 실제 위치는 확인 중이다.'};}
  if(spot.tile==='d'&&s.district==='lumiose-vernal'&&!s.interior){if(s.zaMission11RewardPending)return {name:'폭주 메가야도란 사건 (위치 초안)',text:'진정된 야도란의 야도란나이트를 받자.',action:'claimMission11Stone',label:'야도란나이트 받기'};if(s.zaMission10Stage===10&&!s.zaMission11Complete)return {name:'폭주 메가야도란 사건 (위치 초안)',text:'남쪽 수변에서 폭주 메가야도란을 진정시키자. 동료 동시 전투는 준비 중이다.',action:'battleMission11Slowbro',label:'메가야도란과 배틀'};return {name:'남쪽 수변 (초안)',text:'수변으로 가는 길이다. 실제 위치와 동선은 확인 중이다.'};}
  if(spot.tile==='q'&&s.district==='lumiose-centrico-route'&&!s.interior)return s.zaMission10Stage===8?{name:'누보 카페 (위치 초안)',text:'팀 MZ와 누보 카페에서 만나자.',action:'mission10Cafe',label:'동료와 이야기하기'}:{name:'누보 카페 (위치 초안)',text:'센트리코 광장 근처의 카페 트럭이다. 정확한 좌표는 초안이다.'};
  if(spot.tile==='y'&&s.district==='lumiose-quasartico'&&!s.interior&&s.zaMission10Stage===2)return {name:'콰자르티코 경비 데덴네',text:'데덴네 두 마리가 앞을 막았다. 동료와 함께 물러나게 하자.',action:'battleQuasarticoGuard',label:'데덴네와 배틀'};
  if(spot.tile==='j'&&s.district==='lumiose-quasartico'&&!s.interior){if(s.zaMission31Started&&!s.zaMission31Stage)return {name:'Vinnie',text:'Jett의 요청을 들어 보자.',action:'mission31Vinnie',label:'Vinnie와 이야기하기'};if(s.zaMission10Stage===3)return {name:'Vinnie',text:'폭주한 메가진화에 관한 이야기를 들어 보자.',action:'meetMission10Vinnie',label:'Vinnie와 이야기하기'};if(s.zaMission10Stage===4)return royaleVReady(s)?{name:'Vinnie',text:'도전권을 얻었다. 승급전을 시작하자.',action:'battleMission10Vinnie',label:'Vinnie와 승급전'}:{name:'Vinnie',text:'밤의 배틀존에서 도전권을 얻어 오자.'};if(s.zaMission10Stage===5&&s.zaVinnieTM051Pending)return {name:'Vinnie',text:'승급전 보상으로 기술머신을 받자.',action:'claimVinnieTM',label:'기술머신 받기'};if(s.zaMission10Stage>=6)return {name:'콰자르티코 사무실 (초안)',text:'회사 안으로 들어갈 수 있다.',action:'enterQuasarticoOffice',label:'사무실에 들어가기'};}
  if(spot.tile==='n'&&s.district==='lumiose'&&!s.interior&&s.zaMission10Stage===1){const original=mission10OriginalStarter(s),choice=original||s.zaMission10Starter;return {name:'팀 MZ 동료',text:choice?`앱솔에게 앱솔나이트를 지니게 한 뒤 함께 배틀하자. 선택한 스타터 타입: ${{grass:'풀',fire:'불꽃',water:'물'}[choice]||'미선택'}.`:'이전 저장에 스타터 기록이 없어 Z-A 스타터 타입을 선택해 줘.',actions:[...(!original?[{action:'mission10Grass',label:'풀 타입 선택'},{action:'mission10Fire',label:'불꽃 타입 선택'},{action:'mission10Water',label:'물 타입 선택'}]:[]),...(choice?[{action:'battleMission10Rival',label:'동료와 배틀'}]:[])]};}
  if(spot.tile==='l'&&s.district==='lumiose-rouge-north'&&!s.interior)return {name:'스시 하이 롤러 (배치 초안)',text:'루주 거리에 있는 음식점이다.',action:'enterSushi',label:'음식점에 들어가기'};
  if(spot.tile==='R'&&s.district==='lumiose-rouge-north'&&s.interior==='sushi'){
    if(s.zaSushiRewardPending)return {name:'음식점 안내원',text:'코스를 마친 보상이 준비됐습니다.',action:'claimSushiReward',label:'보상 받기'};
    if(s.zaSushiRun)return {name:'음식점 안내원',text:`다음은 ${s.zaSushiRun.course+1}코스입니다. 코스 사이에는 회복할 수 없습니다.`,actions:[{action:'sushiNext',label:'다음 코스 시작'},{action:'sushiCancel',label:'도전 중단'}]};
    if(s.zaMission24Started!==true)return {name:'음식점 안내원',text:'식사 배틀은 메인 미션 24부터 도전할 수 있습니다.'};
    return s.zaSushiCompleted?{name:'음식점 안내원',text:'30,000코인으로 5코스에 다시 도전할 수 있습니다.',action:'sushiRepeat',label:'재도전 · 30,000코인'}:{name:'음식점 안내원',text:'5코스를 연속으로 배틀합니다. 코스 사이에 회복할 수 없습니다.',action:'sushiStart',label:'식사 배틀 도전'};
  }
  if(spot.tile==='t'&&s.district==='lumiose-zone3'&&!s.interior&&s.zaZone3TowerUpper&&!s.zaZone3Tm022)return {name:'기술머신 022 (위치 초안)',text:'지붕에서 제비반환 기술머신을 발견했다.',action:'zone3TM022',label:'기술머신 줍기'};
  if(spot.tile==='i'&&s.district==='lumiose-zone3'&&!s.interior)return s.zaZone3TowerUpper?{name:'옥상 계단 (초안)',text:'계단을 따라 건물 안으로 내려간다.',action:'zone3TowerDown',label:'건물 안으로'}:{name:'돌 건물 입구 (초안)',text:'건물 안의 계단으로 옥상에 오를 수 있다.',action:'zone3TowerUp',label:'건물 들어가기'};
  if(s.district==='lumiose-passage-palais'&&!s.interior&&PALAIS_SHOPS[spot.tile])return {name:PALAIS_SHOPS[spot.tile],text:'팔레 통로의 상점이다.'};
  if(s.district==='lumiose-magenta-sector4'&&!s.interior&&spot.tile==='q')return {name:'카페 포켓몬아미 (위치 초안)',text:'로즈 4번지에 있는 카페다.'};
  if(s.district==='lumiose-rouge-sector3'&&!s.interior&&spot.tile==='q')return {name:'레스토랑 르 예 (위치 초안)',text:'오토널 애비뉴에 있는 레스토랑이다.'};
  if(s.district==='lumiose-rouge-sector3'&&!s.interior&&spot.tile==='m')return {name:'볼 부티크 (위치 초안)',text:'여러 종류의 몬스터볼을 취급하는 가게다.'};
  if(spot.tile==='H'&&s.district==='lumiose-magenta-sector8-route'&&!s.interior)return {name:'로즈 포켓몬센터 (위치 초안)',text:'파티의 HP와 상태이상, 기술 PP를 회복할 수 있다.',action:'heal',label:'파티 회복하기'};
  if(s.district==='lumiose-bleu-sector7'&&!s.interior&&spot.tile==='l')return {name:'비계 사다리 (위치 초안)',text:s.zaBleu7Upper?'거리로 내려간다.':'비계를 거쳐 옥상으로 올라간다.',action:'bleu7ScaffoldLadder',label:s.zaBleu7Upper?'내려가기':'옥상으로'};
  if(spot.tile==='H'&&s.district==='lumiose-bleu-sector7'&&!s.interior)return {name:'블르 포켓몬센터 (위치 초안)',text:'파티의 HP와 상태이상, 기술 PP를 회복할 수 있다.',action:'heal',label:'파티 회복하기'};
  if(spot.tile==='H'&&s.district==='lumiose-vert-street-route'&&!s.interior)return {name:'베르 포켓몬센터 (위치 초안)',text:'파티의 HP와 상태이상, 기술 PP를 회복할 수 있다.',action:'heal',label:'파티 회복하기'};
  if(spot.tile==='H'&&s.district==='lumiose-zone3'&&!s.interior)return {name:'루주 광장 이동식 포켓몬센터',text:'북쪽 노점에서 파티의 HP와 상태이상, PP를 회복할 수 있다.',action:'heal',label:'파티 회복하기'};
  if(spot.tile==='p'&&s.district==='lumiose-zone2'&&!s.interior)return {name:'동남쪽 섬의 우두머리 (초안)',text:'낮과 밤에 서로 다른 우두머리 포켓몬이 나타난다.',action:'encounterZone2Alpha',label:'우두머리와 배틀'};
  if(spot.tile==='r'&&s.district==='lumiose-zone2'&&!s.interior)return {name:'동쪽 물가의 바위 (초안)',text:'바위깨기로 통로를 열고 얕은 물을 지나갈 수 있다. 지형 배치는 초안이다.',action:'smashZone2Rock',label:'바위깨기 사용'};
  if(spot.tile==='q'&&s.district==='lumiose-vernal'&&!s.interior)return {name:'뚜뚜 카페 · Café Woof (위치 초안)',text:'음료를 주문하면 파티를 회복하고 선두 포켓몬과 친해질 수 있다.',actions:CAFE_WOOF_DRINKS.map(drink=>({action:drink.action,label:`${drink.name} · ${drink.price}코인`}))};
  if(spot.tile==='P'&&s.district==='lumiose-floral'&&!s.interior)return {name:'미르시티 포켓몬 연구소 (초안)',text:'Floral Avenue의 연구소다. 건물 위치와 내부 크기는 초안이다.',action:'enterLumioseLab',label:'연구소에 들어가기'};
  if(spot.tile==='i'&&s.district==='lumiose-floral'&&['lumioseLab','lumioseDirector','lumioseLab2'].includes(s.interior))return {name:'연구소 승강기 (위치 초안)',text:'연구소의 로비·2층 연구실·3층 소장실을 오간다.',action:'researchLabLift',label:s.interior==='lumioseLab'?'3층 소장실로':'로비로',actions:[...(s.interior!=='lumioseLab'?[{action:'researchLabGround',label:'1층 로비로'}]:[]),...(s.interior!=='lumioseLab2'?[{action:'researchLabSecond',label:'2층 연구실로'}]:[]),...(s.interior!=='lumioseDirector'?[{action:'researchLabThird',label:'3층 소장실로'}]:[])]};
  if(side27Reg(s,spot)){if(!side27Available(s))return {name:'화석 연구원 Reg (위치 초안)',text:'화석 복원 장치를 연구하고 있다.'};if(!s.zaSide27Started&&!s.zaSide27Complete)return {name:'화석 연구원 Reg (위치 초안)',text:'화석 복원에 필요한 화석을 사 와 주세요. 구입비 20000원을 드립니다.',action:'side27Start',label:'화석 의뢰 받기'};return {name:'화석 연구원 Reg (위치 초안)',text:s.zaSide27Complete?'가방의 화석을 복원할 수 있다.':'턱화석이나 지느러미화석을 가져오자.',actions:Object.entries(FOSSILS).filter(([k])=>s.zaSide27Complete||k!=='amber').map(([k,v])=>({action:`side27Revive-${k}`,label:`${v.name} 복원하기`}))};}
  if(side27Shop(s,spot))return side27Available(s)?{name:'돌 가게 (위치 초안)',text:'화석과 진화의 돌, 메가스톤을 구입할 수 있다.',actions:[...megaStoneShopStock(s).map(([item,price,name])=>({action:`buyEmporiumMega-${item}`,label:`${name} · ${price}원`})),...stoneShopStock(s).map(([item,name])=>({action:`buyEvolutionStone-${item}`,label:`${name} · 3000원`})),...Object.entries(FOSSILS).map(([k,v])=>({action:`side27Buy-${k}`,label:`${v.name} · ${v.price}원`}))]}:{name:'돌 가게 (위치 초안)',text:'이곳은 돌과 화석을 취급하는 가게다.'};
  if(s.district==='lumiose-floral'&&s.interior==='lumioseLab2'&&spot.tile==='o'&&spot.x===9&&spot.y===7&&!s.zaLabSecondGreatBall)return {name:'연구실의 슈퍼볼 (위치 초안)',text:'책상 옆에서 슈퍼볼을 발견했다.',action:'researchLabSecondBall',label:'슈퍼볼 줍기'};
  if(spot.tile==='R'&&['lumioseLab','lumioseDirector'].includes(s.interior))return {name:s.interior==='lumioseDirector'?'Mable · 3층 소장실 (배치 초안)':'포켓몬 연구원',text:'선두 포켓몬을 연구 수첩에 기록할 수 있다. 원작의 시설과 대화는 아직 구현 중이다.',actions:[...(s.zaMission40Stage===1&&['steelix','gallade','pangoro'].every(x=>anomalyIds(s).includes(x))?[{action:'mission40Report',label:'세 조사 보고하기'}]:[]),...(s.zaMission40Started&&!s.zaMission40Stage?[{action:'mission40Mable',label:'Mable에게 묻기'}]:[]),...(s.zaMission35Stage===1?[{action:'mission35Mable',label:'Mable에게 묻기'}]:[]),...(s.interior==='lumioseDirector'&&s.zaSide22Called&&!s.zaSide22Complete?[{action:'side22Bulbasaur',label:'이상해씨 선택'},{action:'side22Charmander',label:'파이리 선택'},{action:'side22Squirtle',label:'꼬부기 선택'}]:[]),{action:'recordResearch',label:'선두 포켓몬 기록하기'}]};
  if(spot.tile==='i'&&['hotel','hotel2f','hotelRoof'].includes(s.interior))return {name:'호텔 엘리베이터',text:'로비, 2층과 호텔 옥상을 오갈 수 있다. 배치와 크기는 초안이다.',actions:[...(s.interior!=='hotel'?[{action:'hotelLiftDown',label:'로비로 가기'}]:[]),...(s.interior!=='hotel2f'?[{action:'hotelLiftUp',label:'2층으로 가기'}]:[]),...(s.interior!=='hotelRoof'?[{action:'hotelLiftRoof',label:'옥상으로 가기'}]:[])]};
  if(spot.tile==='b'&&s.interior==='hotel2f')return {name:'다른 객실',text:'이쪽 문은 다른 객실이다. 202호는 왼쪽 문이다.'};
  if(spot.tile==='o'&&s.interior==='hotel2f')return {name:'202호',text:'왼쪽 문은 내가 머무르는 202호다.',action:'enterHotel202',label:'202호에 들어가기'};
  if(spot.tile==='z'&&s.interior==='hotel202')return s.zaIntroStage==='door'?{name:'202호 침대',text:'푹 쉬었다. 문을 열고 동료를 만나자.'}:{name:'202호 침대',text:'쉬면 파티가 회복되고 선택한 시간까지 시간이 흐른다.',actions:[{action:'restUntilMorning',label:'아침까지 쉬기'},{action:'restUntilNight',label:'밤까지 쉬기'}]};
  const area=AREAS[s.area],gym=TRAINERS[Math.max(0,s.area-1)];
  const entries={
    H:{name:'포켓몬 센터',text:'어서 오세요! 파티의 HP와 상태이상, 기술 PP를 모두 회복해 드릴게요.',action:'heal',label:'포켓몬을 쉬게 하기'},
    M:{name:'프렌들리숍',text:'모험에 필요한 몬스터볼과 회복 도구를 준비하세요.',action:'shop',label:'상품 보기'},
    G:{name:gym.name,text:`${gym.title}에 온 것을 환영한다! ${gym.type} 타입 포켓몬들과 겨뤄 보겠나?`,action:'challenge',label:'체육관에 도전하기'},
    N:!s.expedition&&s.area===4&&habitatStage(s)===2?{name:'현장 트레이너',text:'공사 준비를 맡고 있지만 포켓몬들의 보금자리도 걱정이야. 배틀을 통해 서로의 마음을 확인하고 함께 해결책을 찾자.',action:'challenge',label:'현장 트레이너와 배틀'}:{name:'길목의 트레이너',text:'포켓몬과 눈이 마주쳤으니 실력을 겨뤄 볼까? 수련이나 돌보기도 함께 할 수 있어.',action:'challenge',label:'트레이너와 배틀'},
    L:{name:TRAINERS[8+Math.max(0,leagueIndex(s))]?.name||'사천왕',text:'리그는 순서대로 도전해야 합니다. 도전 중에는 센터에서 회복할 수 없어요.',action:'challenge',label:'리그에 도전하기'},
    C:{name:'챔피언 그린',text:'사천왕을 모두 이겼구나. 이제 마지막 승부다!',action:'challenge',label:'챔피언에게 도전'},
    P:s.area===0&&!s.expedition?{name:'포켓몬 연구소',text:'연구소에 들어가 포켓몬 연구원과 이야기할 수 있어요.',action:'enterLab',label:'연구소에 들어가기'}:{name:'포켓몬 연구소',text:'포켓몬을 잡고 도감을 채워 보렴. 레벨이 올라도 자동으로 진화하지 않아. 파티 관리에서 조건을 살피고 직접 선택하렴.'},
    R:{name:'포켓몬 연구원',text:habitatStage(s)===3?'숲의 상황을 듣고 싶구나. 기록도 언제든 남길 수 있어.':'함께 여행한 선두 포켓몬을 연구 수첩에 기록해 줄게. 진화는 기술·성장 메뉴에서 직접 선택할 수 있단다.',actions:[{action:'recordResearch',label:'선두 포켓몬 기록하기'},habitatLabAction(s)].filter(Boolean)},
    Q:s.district==='lumiose'?{name:'도시 안내원',text:'호텔 남쪽은 야생 구역 1, 동쪽은 정원 지구예요. 남쪽 정류장에서는 항구로 돌아갈 수 있어요. 현재 도시 배치는 초안이에요.'}:s.district==='lumiose-garden'&&lidaBattleAction(s)?{name:'팀 MZ Lida',text:'Lida가 정원에서 연습 중이다. 맡아 온 물건을 전할 수 있다.',actions:[lidaBattleAction(s)]}:s.district==='lumiose-garden'?{name:'정원 안내원',text:'사람과 포켓몬이 쉬어 가는 정원이에요. 서쪽은 광장, 동쪽은 공사 현장으로 이어져요.'}:!s.expedition&&s.area===3&&habitatStage(s)===4?{name:'항구 조사단 안내원',text:'조사단이 미르시티의 첫 구역으로 가는 배편을 준비했어요. 항구로 돌아올 수도 있답니다.',action:'visitLumiose',label:'미르시티로 가기'}:habitatGuideDialogue(s)||surveyDialogue(s)||{name:'마을 안내원',text:s.completed?'챔피언이 되었군요! 여행 수첩에서 세계의 진화 장소와 명예의 전당을 살펴보세요.':`이곳은 ${area.name}. 풀숲에서 포켓몬을 만나고, 동쪽 길을 따라 체육관에 도전하세요. 몬스터볼은 숍에서 구할 수 있어요.`},
    p:{name:'우두머리 페이검',text:'이 페이검의 타일 위치와 재등장은 시범 구성이다.',action:'encounterZone4Alpha',label:'우두머리와 배틀'},
    a:s.zaWildAlphaSpent?{name:'우두머리 포켓몬의 자리',text:'현재 이 자리의 구구는 보이지 않는다. 야생 구역에 다시 들어오면 만날 수 있다.'}:{name:'우두머리 구구',text:s.zaWildAlphaAlert?'구구가 이미 나를 알아챘다. 필드 배치와 시야는 시범 구성이다.':'표식의 화살표는 구구가 보는 방향이다. 뒤에서 다가가면 들키지 않고 기본 볼을 던질 수 있다. 가까운 직선 방향에서 조준할 수 있으며 배치와 시야는 시범 구성이다.',actions:[{action:'encounterWildAlpha',label:'우두머리와 배틀'},...(spot.x!==s.x||spot.y!==s.y?[{action:'throwWildAlpha',label:'기본 볼 던지기'}]:[])]},
    r:{name:'길을 막은 바위',text:'파트너가 바위깨기를 알고 있으면 이 길을 열 수 있다. 이 공사 현장 지형은 초안이다.',action:'smashSiteRock',label:'바위깨기 사용'},
    n:{name:'AZ',text:s.zaMysteryTrail===2?'앱솔이 폭주하려 한다. 루카리오와 메가링을 빌려주겠네.':s.zaMysteryTrail===3?'준비가 되었다면 루카리오와 함께 앱솔을 진정시켜 주게.':s.zaMysteryTrail===4?'앱솔이 자네와 함께하고 싶어 하는구나. 앱솔나이트와 메가링도 받아 주게.':'도와줘서 고맙네.',...(s.zaMysteryTrail===2?{action:'meetAZForAbsol',label:'AZ의 이야기 듣기'}:s.zaMysteryTrail===3?{action:'battleAZLoan',label:'대여 배틀 시작'}:s.zaMysteryTrail===4?{action:'claimAZAbsol',label:'앱솔과 보상 받기'}:{})},
    d:{name:'정체불명의 포켓몬 (초안)',text:s.zaMysteryTrail===1?'정체불명의 포켓몬이 옥상으로 이끌고 있다.':'정체불명의 포켓몬이 나타나 따라오라는 듯 바라본다.',action:s.zaMysteryTrail===1?'investigateMystery':'followMystery',label:s.zaMysteryTrail===1?'옥상에서 주변 살피기':'포켓몬 따라가기'},
    x:{name:'메가조각 교환 안내 (초안)',text:s.zaShardExchangeUnlocked?'메가조각으로 메가스톤을 교환할 수 있다. 여행 수첩에서 목록을 확인하자.':'메가조각 교환소는 원작의 메인 임무 10에서 열린다. 해당 진행은 아직 준비 중이다.'},
    h:{name:'옥상으로 가는 길 (초안)',text:'랭크 Y부터 호텔 부근의 옥상 길을 살펴볼 수 있다. 실제 도시 지형과 동행은 아직 재현 중이다.',action:'enterRooftop',label:'옥상으로 올라가기'},
    u:{name:'여행 동료 (초안)',text:s.zaRooftopIntroduced?'공격 기술로 결정을 부수고 옥상 길을 따라가자.':'함께 옥상 길을 따라 프리즘타워를 살펴보자.',...(s.zaRooftopIntroduced?{}:{action:'meetRooftopCompanion',label:'동료와 이야기하기'})},
    c:{name:'메가스톤 결정',text:s.zaRooftopIntroduced?'선두 포켓몬이 공격 기술을 알고 있으면 결정을 부술 수 있다.':'동료의 안내를 먼저 들어 보자.',...(s.zaRooftopIntroduced?{action:'smashRooftopCrystal',label:'공격 기술로 결정 부수기'}:{})},
    b:{name:'핸섬 탐정사무소 (초안)',text:'Emma를 만날 수 있다. 이 건물의 위치와 내부는 임시 배치다.',action:'enterBureau',label:'사무소에 들어가기'},
    t:{name:'의뢰인 Trevelle',text:!s.zaEmmaMet?'여기서 누군가를 기다리는 듯하다.':s.zaBunnelbyQuest===2?'큰 파르빗을 살펴봐 줘서 고마워요.':s.zaBunnelbyQuest===3?'파르빗 사건을 해결해 줘서 고마워요.':s.zaBunnelbyQuest===1?'근처 골목에 있는 큰 파르빗을 살펴봐 주세요.':'야생 구역 밖에서 큰 파르빗을 봤어요. 살펴봐 주시겠어요?',...(s.zaEmmaMet&&s.zaBunnelbyQuest!==1&&s.zaBunnelbyQuest!==3?{action:s.zaBunnelbyQuest===2?'reportBunnelby':'startBunnelby',label:s.zaBunnelbyQuest===2?'의뢰 보고하기':'파르빗 의뢰 받기'}:{})},
    q:{name:'골목 (초안)',text:s.zaBunnelbyQuest===1?'골목에 큰 파르빗이 있다.':'조용한 골목이다.',...(s.zaBunnelbyQuest===1?{action:'battleBunnelby',label:'우두머리 파르빗 살피기'}:{})},
    m:{name:'의뢰인 Moire',text:s.zaSableyeQuest===3&&s.zaSableyeRevivePending===true?'반지를 찾아줘서 고마워요. 기력의조각 2개를 받아 주세요.':!s.zaEmmaMet?'묘지 앞에서 누군가를 기다리고 있다.':s.zaSableyeQuest===2?'소중한 반지를 찾았나요?':s.zaSableyeQuest===3?'반지를 찾아줘서 고마워요.':s.zaSableyeQuest===1?'묘지 깊은 곳에서 반지를 찾아 주세요.':'묘지에서 깜까미에게 놀라 반지를 떨어뜨렸어요.',...(s.zaSableyeQuest===3&&s.zaSableyeRevivePending===true?{action:'claimSableyeRevives',label:'기력의조각 2개 받기'}:s.zaEmmaMet&&s.zaSableyeQuest!==1&&s.zaSableyeQuest!==3?{action:s.zaSableyeQuest===2?'reportSableye':'startSableye',label:s.zaSableyeQuest===2?'반지 돌려주기':'반지 찾기 의뢰 받기'}:{})},
    z:{name:'묘지 안쪽 (초안)',text:s.zaSableyeQuest===1?'이곳에서 반지를 찾아보자.':'묘지의 조용한 자리다.',...(s.zaSableyeQuest===1?{action:'battleSableye',label:'반지 찾기'}:{})},
    v:{name:'의뢰인 Tracie',text:s.zaTradeQuest===2&&s.zaTradePotionPending===true?'교환해 줘서 고마워요. 상처약 3개를 받아 주세요.':!s.zaEmmaMet?'진화에 관심이 많은 트레이너다.':s.zaTradeQuest===2?'교환한 피카츄와 함께할게요.':s.zaTradeQuest===1?'피카츄를 헤라크로스와 교환해요. 여행 수첩에서 개체를 직접 선택해 주세요.':'피카츄를 진화시키고 싶어요. 헤라크로스와 교환해 주시겠어요?',...(s.zaTradeQuest===2&&s.zaTradePotionPending===true?{action:'claimTradePotions',label:'상처약 3개 받기'}:s.zaEmmaMet&&!s.zaTradeQuest?{action:'startPikachuTrade',label:'교환 의뢰 받기'}:{})},
    e:{name:'탐정 Emma',text:!s.zaEmmaMet?'사건 의뢰를 함께 도와줄 수 있을까?':s.zaEmmaBattleComplete?(s.zaEmmaMegaSeen?'전룡의 메가진화 이야기를 들었다. 동행 장면은 준비 중이다.':'배틀을 마쳤구나. 전룡의 메가진화를 보여 줄게.'):s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3?'세 의뢰를 마쳤구나. 준비가 되면 나와 배틀하자.':'파르빗·교환·묘지 의뢰를 살펴보세요. 임무 05의 나머지는 준비 중이다.',...(!s.zaEmmaMet?{action:'meetEmma',label:'의뢰 이야기 듣기'}:s.zaEmmaBattleComplete&&!s.zaEmmaMegaSeen?{action:'seeEmmaMega',label:'전룡의 메가진화 살펴보기'}:s.zaBunnelbyQuest===3&&s.zaTradeQuest===2&&s.zaSableyeQuest===3&&!s.zaEmmaBattleComplete?{action:'battleEmma',label:'Emma와 배틀'}:{})},
    j:{name:'정의단 Josée',text:joseeAction(s)?'Rouge Plaza에서 야생 구역에 대한 생각을 배틀로 확인해 보자. 정확한 위치는 임시 배치다.':s.zaMission05CafePending===true?'먼저 누보 카페에서 동료를 만나자.':s.zaMission05Stage>=1&&s.zaMission05Stage<5?'먼저 호텔에서 동료를 만나 옥상 길을 따라가자.':'탐정사무소에서 Emma를 만나자.',...(joseeAction(s)||{})},
    T:(()=>{const d=royaleDialogue(s),zones=activeRoyaleZones(s);return {...d,text:`${d.text} 이번 밤의 배틀존: ${zones.map(z=>z.name).join(' / ')} (순서 초안).`};})(),
    O:royaleZoneDialogue(s,'O'),U:royaleZoneDialogue(s,'U'),V:royaleZoneDialogue(s,'V'),
    J:{name:'호텔',text:naveenAction(s)?'호텔 앞에서 팀 MZ의 Naveen이 기다리고 있다. 로비에도 들어갈 수 있다.':s.zaNaveenComplete?'Naveen에게 패션 디자이너가 되고 싶은 꿈을 들었다. 호텔 로비에 들어갈 수 있다.':'여행자와 포켓몬을 위한 호텔이다. 로비에 들어갈 수 있다.',action:'enterHotel',label:'호텔에 들어가기',...((s.zaMission10Stage===10&&s.zaMission11Complete&&s.zaMission12Complete&&s.zaMission13Complete)||s.zaMission10Stage===11||(s.zaMission10Stage===12&&!s.zaMission14Stage)||naveenAction(s)?{actions:[{action:'enterHotel',label:'호텔에 들어가기'},...(s.zaMission10Stage===10&&s.zaMission11Complete&&s.zaMission12Complete&&s.zaMission13Complete?[{action:'battleMission10Zygarde',label:'지가르데와 배틀'}]:[]),...(s.zaMission10Stage===11?[{action:'claimMission10Pebble',label:'수수께끼 돌 받기'}]:[]),...(s.zaMission10Stage===12&&!s.zaMission14Stage?[{action:'battleMission14Naveen',label:'Naveen과 배틀'}]:[]),naveenAction(s)].filter(Boolean)}:{})},
    F:{name:'호텔 안내 직원',text:s.zaMysteryTrail>=5&&!s.zaMission10Stage?'팀 MZ 동료가 로비에서 기다리고 있어요. 함께 이야기를 들어 보세요.':cityProjectStage(s)===4?'정원 조사 결과를 들려주세요. 파트너도 쉬어 갈 수 있어요.':'어서 오세요. 파트너들과 쉬거나 도시 조사단의 의뢰를 살펴보세요.',actions:[...((s.zaMission42Ready||(s.zaMission40Complete&&s.zaMission41Complete))&&!s.zaMission42Stage?[{action:'mission42L',label:'L과 배틀'}]:[]),...(s.zaMission42Stage===4&&!s.zaMission42Complete?[{action:'mission42Cube',label:'지가르데큐브 받기'}]:[]),...(s.zaInfiniteFirstWon&&!s.zaMission40Started?[{action:'mission39Lida',label:'Lida와 L의 이야기 듣기'}]:[]),...(s.zaMission38Started&&!s.zaMission38Stage?[{action:'mission38Lobby',label:'동료와 이야기하기'}]:[]),...(s.zaMission35Stage===6&&!s.zaMission35RoofRequired?[{action:'mission35AZ',label:'AZ의 이야기 듣기'}]:[]),...(s.zaMission31Stage===2?[{action:'mission31Meeting',label:'팀 MZ 작전 회의'}]:[]),...(s.zaMission31Stage===3&&mission31CasesComplete(s)?[{action:'mission31Report',label:'세 사건 보고'}]:[]),...(s.zaMission26Stage===3&&mission26CasesComplete(s)&&!s.zaMission26Complete?[{action:'mission26SBC',label:`SBC와 배틀 (${Math.min(3,(s.zaMission26SBCStage||0)+1)}/3)`}]:[]),...(s.zaMission26Stage===2?[{action:'mission26Meeting',label:'SBC와 폭주 사건 회의'}]:[]),...(s.zaMission20Stage===13?[{action:'mission20HotelAfterBank',label:'팀 MZ와 상황 정리'}]:[]),...(s.zaMission19Stage===17&&!s.zaMission20Stage?[{action:'mission20Start',label:'Rust Syndicate 연락 받기'}]:[]),...(s.zaMission20Stage===4?[{action:'mission20Meeting',label:'팀 MZ와 작전 회의'}]:[]),...(s.zaMission20Stage===5&&mission20Complete(s)?[{action:'mission20Report',label:'세 사건 보고하기'}]:[]),...(s.zaMission19Stage===16?[{action:'mission19Sneakers',label:'Naveen에게 신발 받기'}]:[]),...(s.zaMission14Stage===12&&!s.zaMission15Stage?[{action:'mission15Meeting',label:'팀 MZ와 작전 회의'}]:[]),...(s.zaMission15Stage===2&&mission15Complete(s)&&s.zaMission15SceneSeen?[{action:'mission15Report',label:'세 사건 보고하기'}]:[]),...(s.zaMission15Stage===3&&s.zaMission15SceneSeen?[{action:'mission15Continue19',label:'팀 MZ와 이야기하기'}]:[]),...(s.zaMission14Stage===1&&rankFPoints(s)>=32000?[{action:'rankEShowTicket',label:'Naveen에게 도전권 보여주기'}]:[]),...(s.zaMission10Stage===9?[{action:'mission10HotelMeeting',label:'팀 MZ와 작전 회의'}]:[]),...(s.zaMysteryTrail>=5&&!s.zaMission10Stage?[{action:'startMegaMission',label:'팀 MZ 동료와 이야기하기'}]:[]),{action:'hotelRest',label:'파티 쉬게 하기'},cityProjectHotelAction(s),lidaBagAction(s)].filter(Boolean)},
    K:cityProjectStage(s)===3?{name:'정원 화단',text:'꽃 사이에 포켓몬이 쉬어 갈 자리가 보인다. 현장에 제안한 방안과 함께 기록하자.',action:'cityProjectGarden',label:'쉼터 기록하기'}:{name:'정원 화단',text:'사람과 포켓몬이 함께 가꾸는 작은 화단이다.'},
    Y:cityProjectStage(s)===1?{name:'도시 조사 게시판',text:'정원 동쪽 공사와 포켓몬의 쉼터를 함께 고려할 방안을 찾고 있다. 현장 담당자의 이야기를 들어 보자.',action:'cityProjectBoard',label:'의뢰 내용 확인하기'}:{name:'도시 조사 게시판',text:'도시 조사단이 정원의 이용과 서식지를 함께 살필 계획이다.'},
    D:cityProjectStage(s)===2?{name:'공사 현장 담당자',text:'정원의 쉼터를 지키면서 일을 진행해야 해요. 어떤 방안을 제안하시겠어요?',actions:[{action:'cityProjectDetour',label:'이동 경로를 우회하기'},{action:'cityProjectHours',label:'작업 시간을 조정하기'}]}:{name:'공사 현장 담당자',text:cityProjectStage(s)>=3?(s.cityProject?.plan==='detour'?'이동 경로를 우회하는 제안을 검토하고 있어요. 정원 방향은 서쪽 길입니다.':'작업 시간을 조정하는 제안을 검토하고 있어요. 정원 방향은 서쪽 길입니다.'):'작업 구역은 안전하게 둘러 두었어요. 정원 방향은 서쪽 길입니다.'},
    Z:{name:'현장 안내판',text:cityProjectStage(s)===5?'동쪽은 야생 구역, 서쪽은 정원이다.':'동쪽 야생 구역은 정원 조사 보고 후 출입할 수 있다. 서쪽은 정원이다.'},
    A:wildStudyStage(s)===0?{name:'야생 구역 안내원',text:'풀숲의 포켓몬을 살피는 조사를 도와주시겠어요?',action:'wildStudyStart',label:'야생 조사 받기'}:wildStudyStage(s)===2?{name:'야생 구역 안내원',text:'야생 포켓몬을 살폈군요. 조사 결과를 들려주세요.',action:'wildStudyReport',label:'야생 조사 보고하기'}:{name:'야생 구역 안내원',text:wildStudyStage(s)===1?'야생 포켓몬 한 마리를 이기거나 포획한 뒤 돌아오세요.':'동쪽 관측 정원에는 조사 트레이너가 있어요. 서쪽은 공사 현장입니다.'},
    B:wildStudyStage(s)===3?{name:'관측 정원 트레이너',text:'야생 구역의 포켓몬을 살펴봤군요. 함께 배틀하며 파트너와의 호흡을 확인해요.',action:'challenge',label:'관측 트레이너와 배틀'}:{name:'관측 정원 트레이너',text:'파트너와 쌓은 경험을 소중히 해요. 야생 구역은 서쪽입니다.'},
    S:{name:'여행 안내판',text:`${area.name} · 야생 Lv.${area.min}–${area.max}. 붉은 지붕은 센터, 파란 지붕은 프렌들리숍입니다. 방향키 / WASD: 걷기, E / Space: 대화, J: 여행 수첩.`},
    I:{name:'필드의 반짝이는 물건',text:s.fieldPickups?.includes(`${s.area}:${spot.x}:${spot.y}`)?'이곳에서 찾은 물건은 이미 챙겼습니다.':'길에서 200코인이 든 작은 주머니를 발견했다!',action:'pickup',label:'주머니 줍기'},
  };
  return {...entries[spot.tile],...spot};
}

export function fieldDialogue(s,map){
 const spot=interactionAt(s,map),d=fieldDialogueCore(s,spot);
 if(d&&centerAt(s,spot)&&fastTravelEnabled(s)&&!s.unionHost){
  const existing=d.actions||(d.action?[{action:d.action,label:d.label}]:[]),destinations=registeredCenters(s).filter(c=>c.id!==centerAt(s,spot).id);
  if(destinations.length)return {...d,actions:[...existing,...destinations.map(c=>({action:`fastTravel-${c.id}`,label:`빠른 이동 · ${c.name}`}))]};
 }
 if(s.district==='lumiose-rust'&&!s.interior&&spot?.tile==='d'&&(s.zaMission20Stage>=3||s.zaMission20Complete)){
  const existing=d?.actions||(d?.action?[{action:d.action,label:d.label}]:[]);
  return {...(d||{name:'Rust Syndicate 사무소',text:'사무소 안으로 들어가자.'}),actions:[...existing,{action:'enterRustOffice',label:'사무소에 들어가기'}]};
 }
 if(s.district==='lumiose-centrico-route'&&!s.interior&&spot?.tile==='q'){
  const existing=d?.actions||(d?.action?[{action:d.action,label:d.label}]:[]);
  return {...(d?.name==='누보 카페 (위치 초안)'?{...d,name:'호텔 리시심 (위치 초안)',text:'로비와 SBC 대회장으로 들어갈 수 있다.'}:(d||{name:'호텔 리시심 (위치 초안)',text:'로비와 SBC 대회장으로 들어갈 수 있다.'})),actions:[...existing.filter(a=>a.action!=='enterRichissime'),...(s.zaSide118Stage===2?[{action:'side118Hotel',label:'Gwynn과 호텔 주변 조사'}]:[]),{action:'enterRichissime',label:'호텔에 들어가기'}]};
 }
 return d;
}

/** Tap-to-walk chooses safe paths, prefers roads, and never crosses an exit en route. */
export function fieldPath(map,start,target){
  if(!walkable(map[target.y]?.[target.x]))return [];
  const key=(p)=>`${p.x},${p.y}`,open=[start],cost=new Map([[key(start),0]]),prev=new Map();
  while(open.length){
    open.sort((a,b)=>cost.get(key(a))-cost.get(key(b)));const p=open.shift();if(key(p)===key(target))break;
    for(const [direction,[dx,dy]]of Object.entries(DIRECTIONS)){
      const n={x:p.x+dx,y:p.y+dy},tile=map[n.y]?.[n.x];
      if(!walkable(tile)||('EWsf'.includes(tile)&&key(n)!==key(target)))continue;
      const c=cost.get(key(p))+(tile==='g'?4:1),k=key(n);
      if(c<(cost.get(k)??Infinity)){cost.set(k,c);prev.set(k,{p,direction});open.push(n);}
    }
  }
  const path=[];let p=target;while(key(p)!==key(start)){const step=prev.get(key(p));if(!step)return [];path.unshift(step.direction);p=step.p;}return path;
}

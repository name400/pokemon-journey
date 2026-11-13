// Rouge Sector 8 lies by North Boulevard and the cemetery's northern access.
// Building footprints, path widths and gate positions are provisional.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_4
// https://www.pokemon-france.com/en/guides/pokemon-legends-z-a/side-missions/
export function rougeSector8Map(){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let y=1;y<=15;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=3;y<=6;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=10;y<=13;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // A side alley east of the cemetery is documented; exact footprint is draft.
 for(let y=7;y<=9;y++)for(let x=12;x<=20;x++)g[y][x]=',';
 g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// The cemetery's southern access meets Rouge Sector 6. Streets and building
// footprints are drafts; the legacy direct street connection remains available.
// https://www.pokepedia.fr/Zone_sauvage_n%C2%B0_4
export function rougeSector6Map(s={}){
 const g=Array.from({length:17},(_,y)=>Array.from({length:23},(_,x)=>x===0||x===22||y===0||y===16?'#':'.'));
 for(let x=1;x<=21;x++)for(let y=7;y<=9;y++)g[y][x]=',';
 for(let y=1;y<=8;y++)for(let x=10;x<=12;x++)g[y][x]=',';
 for(let y=2;y<=5;y++)for(let x=3;x<=7;x++)g[y][x]='#';
 for(let y=11;y<=14;y++)for(let x=15;x<=19;x++)g[y][x]='#';
 // Mint stalls occupy already-blocked frontage; exact tiles are draft.
 if(s.zaAcademyCourtyard!==true){g[5][3]='^';g[5][7]='^';g[4][7]='t';g[5][5]='q';}
 // The Mission 23 Holovator and meeting are in Rouge Sector 6; tile positions are drafts.
 // https://www.thonky.com/pokemon-legends-z-a/main-mission-23-a-rogue-mega-ampharos
 // Mission 7 school courtyard approach; exact school footprint and tile are draft.
 if(s.zaMission07Started===true&&s.zaRoyaleRank==='X'&&s.zaNaveenComplete===true)g[6][9]='n';
 if((s.zaMission20Stage===5&&!s.zaMission23Complete)||s.zaMission23RewardPending)g[8][14]='v';
 if(s.zaMission20Stage===5||s.zaMission23GwynnWon||s.zaMission23Complete||s.zaMission23RewardPending)g[8][17]='j';
 g[8][0]='X';g[0][11]='X';g[16][11]='X';return g.map(row=>row.join(''));
}

// The original quest visits a Rouge Sector 6 alley; exact 2D positions are draft.
// Keep the former Zone 3 interaction for already-started games.
export function bunnelbyQuestSpot(s,spot,tile){return !s?.interior&&spot?.tile===tile&&((s.district==='lumiose-zone3'&&!s.zaZone3TowerUpper)||(s.district==='lumiose-rouge-sector6'&&!s.zaAcademyCourtyard&&((tile==='t'&&spot.x===7&&spot.y===4)||(tile==='q'&&spot.x===5&&spot.y===5))));}

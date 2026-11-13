// Original pixel masks for four field directions; no game artwork is embedded.
const FRONT=['...RRRRR....','..RRRRRRR...','..RRWWWWRR..','...SSSSS....','...SKSKS....','....SSS.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const BACK=['...RRRRR....','..RRRRRRR...','..RRRRRRRR..','...RRRRR....','...KKKKK....','....KKK.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const LEFT=['...RRRRR....','..RRRRRRR...','.RRWWWWRR...','..SSSSSR....','..SKSSSR....','...SSSS.....','..BBBBBB....','.SBBBBBBS...','.SBBYYYBS...','..BBYYYB....','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const RIGHT=LEFT.map(row=>Array.from(row).reverse().join(''));
// Small original pixel silhouettes; old saves retain the original hat.
const HAIR_FRONT=['....HHHH....','...HHHHHH...','..HHHHHHHH..','..HSSSSSHH..','..HSKSKSHH..','...HSSSH....'];
const HAIR_BACK=['....HHHH....','...HHHHHH...','..HHHHHHHH..','..HHHHHHHH..','...HHHHHH...','....HHHH....'];
const HAIR_LEFT=['....HHHH....','...HHHHHH...','..HHHHHHHH..','..HSSSSHH...','..HSKSSHH...','...SSSS.....'];
export function adventureAvatarRows(facing,style='classic'){
 const base=facing==='up'?BACK:facing==='left'?LEFT:facing==='right'?RIGHT:FRONT;
 if(!['short','bob','long'].includes(style))return base;
 const head=facing==='up'?HAIR_BACK:facing==='left'||facing==='right'?HAIR_LEFT:HAIR_FRONT;
 const tail=[...(facing==='right'?LEFT:base).slice(6)];
 if(style==='bob'){tail[0]='.HHBBBBBHH..';tail[1]='.SHBBBBBHS..';}
 if(style==='long'){tail[0]='.HHBBBBBHH..';tail[1]='.SHBBBBBHS..';tail[2]='.SHBYYYBHS..';tail[3]='..HBBYYYBH..';}
 const rows=[...head,...tail];return facing==='right'?rows.map(row=>[...row].reverse().join('')):rows;
}

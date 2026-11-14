// Original pixel masks for four field directions; no game artwork is embedded.
const FRONT=['...RRRRR....','..RRRRRRR...','..RRWWWWRR..','...SSSSS....','...SKSKS....','....SSS.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const BACK=['...RRRRR....','..RRRRRRR...','..RRRRRRRR..','...RRRRR....','...KKKKK....','....KKK.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const LEFT=['...RRRRR....','..RRRRRRR...','.RRWWWWRR...','..SSSSSR....','..SKSSSR....','...SSSS.....','..BBBBBB....','.SBBBBBBS...','.SBBYYYBS...','..BBYYYB....','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const RIGHT=LEFT.map(row=>Array.from(row).reverse().join(''));
// Small original pixel silhouettes; old saves retain the original hat.
const HAIR_FRONT=['....HHHH....','...HHHHHH...','..HHHHHHHH..','..HSSSSSHH..','..HSKSKSHH..','...HSSSH....'];
const HAIR_BACK=['....HHHH....','...HHHHHH...','..HHHHHHHH..','..HHHHHHHH..','...HHHHHH...','....HHHH....'];
const HAIR_LEFT=['....HHHH....','...HHHHHH...','..HHHHHHHH..','..HSSSSHH...','..HSKSSHH...','...SSSS.....'];
// The vest overlays only shirt pixels, preserving hands, hair, hat and legs.
// Body proportions and ribbon placement are a small original approximation.
export function adventureAvatarRows(facing,style='classic',outfit=''){
 const base=facing==='up'?BACK:facing==='left'?LEFT:facing==='right'?RIGHT:FRONT;
 let rows=base;
 if(['short','bob','long'].includes(style)){
  const head=facing==='up'?HAIR_BACK:facing==='left'||facing==='right'?HAIR_LEFT:HAIR_FRONT;
  const tail=[...(facing==='right'?LEFT:base).slice(6)];
  if(style==='bob'){tail[0]='.HHBBBBBHH..';tail[1]='.SHBBBBBHS..';}
  if(style==='long'){tail[0]='.HHBBBBBHH..';tail[1]='.SHBBBBBHS..';tail[2]='.SHBYYYBHS..';tail[3]='..HBBYYYBH..';}
  rows=[...head,...tail];if(facing==='right')rows=rows.map(row=>[...row].reverse().join(''));
 }
 if(outfit!=='vest'&&outfit!=='formal')return rows;
 const side=facing==='left'||facing==='right',back=facing==='up';
 return rows.map((row,y)=>Array.from(row,(pixel,x)=>{
  if(y<6||y>9||!['B','Y'].includes(pixel))return pixel;
  const column=facing==='right'?11-x:x;
  if(outfit==='formal'){
   if(!back&&((side&&column===4)||(!side&&column===5)))return y===6?'L':'C';
   if(!back&&y===6&&(side?column===3||column===5:column===4||column===6))return 'L';
   return 'V';
  }
  if(side){if(column===2||column===7)return 'L';if(!back&&column===4&&y===7)return 'C';return 'V';}
  if(column===2||column===8)return 'L';
  if(!back&&column===5&&(y===6||y===7||y===8))return 'C';
  if(!back&&y===6&&(column===4||column===6))return 'L';
  return 'V';
 }).join(''));
}

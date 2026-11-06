// Original pixel masks for four field directions; no game artwork is embedded.
const FRONT=['...RRRRR....','..RRRRRRR...','..RRWWWWRR..','...SSSSS....','...SKSKS....','....SSS.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const BACK=['...RRRRR....','..RRRRRRR...','..RRRRRRRR..','...RRRRR....','...KKKKK....','....KKK.....','..BBBBBBB...','.SBBBBBBBS..','.SBBYYYBBS..','..BBYYYBB...','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const LEFT=['...RRRRR....','..RRRRRRR...','.RRWWWWRR...','..SSSSSR....','..SKSSSR....','...SSSS.....','..BBBBBB....','.SBBBBBBS...','.SBBYYYBS...','..BBYYYB....','...KKKKK....','...KK.KK....','...KK.KK....','..DDD.DDD...'];
const RIGHT=LEFT.map(row=>Array.from(row).reverse().join(''));
export function adventureAvatarRows(facing){return facing==='up'?BACK:facing==='left'?LEFT:facing==='right'?RIGHT:FRONT;}

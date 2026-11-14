// A later explicit story milestone proves that earlier wild-zone gates have
// opened. This only reads progress; it does not rewrite old saves or infer
// unclaimed rewards. Keep current rank and local stage checks at each gate.
export function afterMission30(s={}){return s?.zaMission30Complete===true||s?.zaMission31Started===true||s?.zaMission37Complete===true||s?.zaMission38Complete===true;}
export function afterMission24(s={}){return s?.zaMission24Complete===true||s?.zaMission25Started===true||s?.zaMission25Complete===true||afterMission30(s);}
export function afterMission19(s={}){return s?.zaMission19Complete===true||Number(s?.zaMission19Stage)>=16||s?.zaMission20Started===true||s?.zaMission20Complete===true||afterMission24(s);}
export function afterMission14(s={}){return Number(s?.zaMission14Stage)>=12||Number(s?.zaMission15Stage)>=1||s?.zaMission15Started===true||s?.zaMission15Complete===true||afterMission19(s);}
export function afterMission09(s={}){return s?.zaMission09Complete===true||Number(s?.zaMission10Stage)>=1||s?.zaMission10Complete===true||afterMission14(s);}

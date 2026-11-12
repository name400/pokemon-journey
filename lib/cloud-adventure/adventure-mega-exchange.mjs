// Quasartico's initial Mega Stone selection, available after Main Mission 10.
// Later-mission inventory is deliberately omitted until its gates exist.
export const SHARD_MEGA_STONES=[
 {id:'pidgeotite',cost:180},{id:'manectite',cost:180},{id:'houndoominite',cost:180},
 {id:'audinite',cost:180},{id:'lopunnite',cost:180},{id:'sablenite',cost:180},
 {id:'sharpedonite',cost:180},{id:'gyaradosite',cost:240},{id:'lucarionite',cost:240},
 {id:'heracronite',cost:240},{id:'aerodactylite',cost:240},{id:'alakazite',cost:360},
 {id:'drampanite',cost:360},
 // Added later stock. Existing offers retain their earlier save-compatible rules.
 {id:'excadrite',cost:360,rank:'E'},{id:'eelektrossite',cost:240,rank:'E'},
 {id:'glalitite',cost:240,rank:'E'},{id:'pinsirite',cost:240,rank:'E'},
 {id:'aggronite',cost:360,rank:'D'},{id:'falinksite',cost:360,rank:'D'},{id:'chandelurite',cost:360,rank:'D'},
 {id:'gardevoirite',cost:240,rank:'C'},{id:'galladite',cost:240,rank:'C'},{id:'skarmorite',cost:240,rank:'C'},{id:'scolipite',cost:240,rank:'C'},
 {id:'dragalgite',cost:240,rank:'B'},{id:'clefablite',cost:240,rank:'B'},{id:'scraftinite',cost:240,rank:'B'},
 {id:'pyroarite',cost:240,rank:'A'},{id:'malamarite',cost:240,rank:'A'},{id:'salamencite',cost:360,rank:'A'},{id:'metagrossite',cost:360,rank:'A'},
];
export function shardExchangeItem(id){return SHARD_MEGA_STONES.find(item=>item.id===id)||null;}
export function shardExchangeOpen(s){return s.zaShardExchangeUnlocked===true;}

export function shardItemUnlocked(s,item){if(!item||!shardExchangeOpen(s))return false;if(!item.rank)return true;if(s?.zaMission37Complete===true||s?.zaMission38Complete===true)return true;const order=['F','E','D','C','B','A','S'],current=order.indexOf(s?.zaRoyaleRank),required=order.indexOf(item.rank);return current>=0&&required>=0&&current>=required;}

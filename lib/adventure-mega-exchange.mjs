// Quasartico's initial Mega Stone selection, available after Main Mission 10.
// Later-mission inventory is deliberately omitted until its gates exist.
export const SHARD_MEGA_STONES=[
 {id:'pidgeotite',cost:180},{id:'manectite',cost:180},{id:'houndoominite',cost:180},
 {id:'audinite',cost:180},{id:'lopunnite',cost:180},{id:'sablenite',cost:180},
 {id:'sharpedonite',cost:180},{id:'gyaradosite',cost:240},{id:'lucarionite',cost:240},
 {id:'heracronite',cost:240},{id:'aerodactylite',cost:240},{id:'alakazite',cost:360},
 {id:'drampanite',cost:360},
];
export function shardExchangeItem(id){return SHARD_MEGA_STONES.find(item=>item.id===id)||null;}
export function shardExchangeOpen(s){return s.zaShardExchangeUnlocked===true;}

// Inherit weather only for confirmed outdoor city layouts. Indoor/story arenas
// and explicit battle weather remain under their existing rules.
const OUTDOOR_DISTRICTS=new Set(['lumiose-bleu-sector4','lumiose-bleu-sector5','lumiose-bleu-sector8','lumiose-magenta-sector1','lumiose-magenta-sector3-roof','lumiose-quasartico','lumiose-centrico-route']);
export function adventureBattleOptions(world,options={}){
 if(Object.hasOwn(options,'weather')||world?.area!==3||world.interior||world.weather!=='rain')return options;
 const district=world.district,zone=typeof district==='string'&&/^lumiose-zone(?:[1-9]|1[0-9]|20)$/.test(district);
 if(!(OUTDOOR_DISTRICTS.has(district)||zone)||district==='lumiose-zone20'&&world.zaMission42Underground===true)return options;
 return {...options,weather:'raindance'};
}

// Match the single-battle environmental weather initialization.
export function applyAdventureBattleWeather(battle,weather){
 if(weather&&!battle.field.weather){battle.field.setWeather(weather,battle.p1.active[0],battle.dex.moves.get(weather));battle.field.weatherState.duration=0;}
}

// Presentation only: remove known form suffixes without rewriting saved data.
const known=new Set(['normal','standard','ordinary','default','base','family of four','family of three','male','female','midnight','dusk','midday','therian','origin','sky','land','attack','defense','speed','crowned','unbound','incarnate','rapid strike','single strike','low key','amped','white striped','red striped','blue striped','네 식구','네식구','세 식구','세식구','수컷','암컷','한밤중','황혼','한낮','영물','오리진','스카이','랜드','어택','디펜스','스피드','왕','화신','연격','일격','로우','하이']);
export function classicDisplayPokemonName(mon){
 const name=String(mon?.name||''),match=name.match(/^(.*?)\s+·\s+(.+)$/);if(!match)return name;
 const base=match[1],suffix=match[2].trim(),key=suffix.toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ');
 if(known.has(key)||suffix===mon?.formName||/^[A-Za-z][A-Za-z\s'-]*$/.test(suffix)||mon?.baseName===base)return base;
 return name;
}

/** Compact only verified parenthesized form labels in the battle HUD. */
export function classicHudPokemonName(mon){
 const name=String(mon?.name||'');
 return mon?.baseName&&mon?.formName&&name===`${mon.baseName} (${mon.formName})`?String(mon.baseName):classicDisplayPokemonName(mon);
}

/** Battle-only label: shorten a form only when its metadata proves the whole name. */
export function battlePokemonName(mon){
 const name=String(mon?.name||'');
 if(typeof mon?.nickname==='string'&&mon.nickname.trim())return mon.nickname;
 const base=typeof mon?.baseName==='string'?mon.baseName:'',form=typeof mon?.formName==='string'?mon.formName:'';
 if(base&&form&&(name===`${base} (${form})`||name===`${base} · ${form}`))return base;
 return name;
}

/** Render known form names in battle text without modifying source log/events. */
export function battleDisplayText(text,participants){
 let result=String(text??'');const mons=(participants||[]).filter(Boolean),names=new Map();
 for(const mon of mons){const original=String(mon.name||''),label=battlePokemonName(mon);if(!original)continue;const existing=names.get(original);names.set(original,existing===undefined?label:existing===label?label:original);}
 const pairs=[...names].filter(([original,label])=>original!==label&&!mons.some(mon=>{const name=String(mon.name||''),visible=battlePokemonName(mon);return (name!==original&&name.includes(original))||(visible!==original&&visible.includes(original))})).sort((a,b)=>b[0].length-a[0].length);
 for(const [original,label] of pairs)result=result.split(original).join(label);
 return result;
}

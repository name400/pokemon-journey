// Presentation only: remove known form suffixes without rewriting saved data.
const known=new Set(['normal','standard','ordinary','default','base','family of four','family of three','male','female','midnight','dusk','midday','therian','origin','sky','land','attack','defense','speed','crowned','unbound','incarnate','rapid strike','single strike','low key','amped','white striped','red striped','blue striped','네 식구','네식구','세 식구','세식구','수컷','암컷','한밤중','황혼','한낮','영물','오리진','스카이','랜드','어택','디펜스','스피드','왕','화신','연격','일격','로우','하이']);
export function classicDisplayPokemonName(mon){
 const name=String(mon?.name||''),match=name.match(/^(.*?)\s+·\s+(.+)$/);if(!match)return name;
 const base=match[1],suffix=match[2].trim(),key=suffix.toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ');
 if(known.has(key)||suffix===mon?.formName||/^[A-Za-z][A-Za-z\s'-]*$/.test(suffix)||mon?.baseName===base)return base;
 return name;
}

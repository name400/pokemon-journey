// Presentation only: never rewrite saved names or species identities.
const forms={'family of four':'네 식구','family of three':'세 식구','male':'수컷','female':'암컷','midnight':'한밤중','dusk':'황혼','midday':'한낮','therian':'영물','origin':'오리진','sky':'스카이','land':'랜드','attack':'어택','defense':'디펜스','speed':'스피드','crowned':'왕','unbound':'굴레를 벗어난 모습','incarnate':'화신','rapid strike':'연격','single strike':'일격','low key':'로우','amped':'하이','white striped':'흰 줄무늬','red striped':'빨간 줄무늬','blue striped':'파란 줄무늬'};
const defaults=new Set(['normal','standard','ordinary','default','base']);
export function classicDisplayPokemonName(mon){
 const name=String(mon?.name||''),match=name.match(/^(.*?)\s+·\s+([A-Za-z][A-Za-z\s'-]*)$/);if(!match)return name;
 const base=match[1],key=match[2].trim().toLowerCase().replace(/[-_]+/g,' ').replace(/\s+/g,' ');if(defaults.has(key))return base;
 const label=forms[key]||(Number.isInteger(mon?.rogueFormIndex)&&mon.rogueFormIndex>0?`모습 ${mon.rogueFormIndex+1}`:'');return label?`${base} · ${label}`:base;
}

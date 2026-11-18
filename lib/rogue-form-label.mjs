// Display-only labels. Unknown keys stay out of the UI rather than exposing
// an internal identifier or inventing a translation.
const labels={sky:'스카이폼',origin:'오리진폼',therian:'영물폼',black:'블랙',white:'화이트',unbound:'굴레를 벗어난 모습',crowned:'왕의 모습',primal:'원시회귀',ultra:'울트라',attack:'어택폼',defense:'디펜스폼',speed:'스피드폼',shock:'번개',burn:'불꽃',chill:'얼음',douse:'물','dusk-mane':'황혼의갈기','dawn-wings':'새벽의날개',ice:'얼음',shadow:'그림자','wellspring-mask':'우물의가면','hearthflame-mask':'화덕의가면','cornerstone-mask':'주춧돌의가면',gigantamax:'거다이맥스','gigantamax-single':'일격의 태세 · 거다이맥스','gigantamax-rapid':'연격의 태세 · 거다이맥스'};
export function classicFormLabel(key){return Object.hasOwn(labels,key)?labels[key]:'';}

// Evolution option names are also used in persisted evolution data, so only
// translate their proven display suffixes at the presentation boundary.
const evolutionForms={'Vanilla Cream':'바닐라크림','Ruby Cream':'루비크림','Matcha Cream':'말차크림','Mint Cream':'민트크림','Lemon Cream':'레몬크림','Salted Cream':'솔트크림','Ruby Swirl':'루비믹스','Caramel Swirl':'캐러멜믹스','Rainbow Swirl':'레인보우믹스','Female':'암컷','Male':'수컷','Midnight Form':'한밤중','Midday Form':'한낮','Dusk Form':'황혼','Low-Key Form':'로우','Amped Form':'하이','Antique Form':'진품','Phony Form':'가품','Single Strike Style':'일격의 태세','Rapid Strike Style':'연격의 태세','Family of Three':'세 식구','Family of Four':'네 식구'};
export function classicEvolutionOptionName(name){
 const value=String(name??''),match=value.match(/^(.*?) · (.+?)( \(두 번째\))?$/);
 if(!match||!Object.hasOwn(evolutionForms,match[2]))return value;
 return `${match[1]} · ${evolutionForms[match[2]]}${match[3]||''}`;
}

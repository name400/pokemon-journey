// Display-only labels. Unknown keys stay out of the UI rather than exposing
// an internal identifier or inventing a translation.
const labels={sky:'스카이폼',origin:'오리진폼',therian:'영물폼',black:'블랙',white:'화이트',unbound:'굴레를 벗어난 모습',crowned:'왕의 모습',primal:'원시회귀',ultra:'울트라',attack:'어택폼',defense:'디펜스폼',speed:'스피드폼',shock:'번개',burn:'불꽃',chill:'얼음',douse:'물','dusk-mane':'황혼의갈기','dawn-wings':'새벽의날개',ice:'얼음',shadow:'그림자','wellspring-mask':'우물의가면','hearthflame-mask':'화덕의가면','cornerstone-mask':'주춧돌의가면',gigantamax:'거다이맥스','gigantamax-single':'일격의 태세 · 거다이맥스','gigantamax-rapid':'연격의 태세 · 거다이맥스'};
export function classicFormLabel(key){return Object.hasOwn(labels,key)?labels[key]:'';}

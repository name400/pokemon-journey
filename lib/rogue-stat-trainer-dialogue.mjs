import reference from '../data/rogue-stat-trainer-dialogue-ko-pinned.json' with {type:'json'};
// Exact Korean source: locales commit 616cf3eb6b1b15e48784ff138ca7748ea63ed258.
// Source license: GNU AGPL version 3; see licenses/pokerogue-locales-NOTICE.md.
const keys={120:'buck',121:'cheryl',122:'marley',123:'mira',124:'riley'};
export const classicStatTrainerDialogue=id=>reference[keys[id]]||null;
export function classicStatTrainerOutro(name,tier){const last=name.charCodeAt(name.length-1),hasFinal=last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28!==0;return reference.outro.replace('{{statTrainerName}}[[가]]',name+(hasFinal?'이':'가')).replace('{{eggType}}[[를]]',tier==='epic'?'에픽 알을':'레어 알을');}

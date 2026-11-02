export const gameModeLabels={adventure:'포켓몬 탐험',rogue:'로그라이크 도전'};
export function requireGameMode(mode){if(mode!=='adventure'&&mode!=='rogue')throw Error('지급·수정할 게임을 먼저 선택하세요.');return mode;}
export function auditGameMode(detail){try{return JSON.parse(detail).mode||null}catch{return null}}

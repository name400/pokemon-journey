// Inspect the original shared record as well as the normalized training input.
export function assertAdventureTrainingData(mon){
 if(!mon||typeof mon!=='object'||Array.isArray(mon))throw Error('포켓몬 정보를 확인하세요.');
 if(mon.evs!=null&&(typeof mon.evs!=='object'||Array.isArray(mon.evs)))throw Error('포켓몬의 노력치 정보를 확인하세요.');
 if(mon.friendship!=null&&(!Number.isInteger(mon.friendship)||mon.friendship<0||mon.friendship>255))throw Error('포켓몬의 친밀도를 확인하세요.');
}

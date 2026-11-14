import {assertAdventureTrainingData} from './adventure-training-data.mjs';

// Reject incompatible shared records before normalization or a candy is consumed.
export function assertAdventureGrowthData(mon){
 assertAdventureTrainingData(mon);
 if(!Number.isSafeInteger(mon.level)||mon.level<1||mon.level>100)throw Error('포켓몬의 레벨 정보를 확인하세요.');
 if(mon.experience!=null&&(!Number.isSafeInteger(mon.experience)||mon.experience<0))throw Error('포켓몬의 경험치 정보를 확인하세요.');
}

// A null first slot in the source follows the current species or form.
const regularTypes=new Set(['노말','격투','비행','독','땅','바위','벌레','고스트','강철','불꽃','물','풀','전기','에스퍼','얼음','드래곤','악','페어리']);
export function classicTypesWithCustomSecond(mon,baseTypes){
 if(!mon.rogueCustomSecondType)return [...baseTypes];
 if(!regularTypes.has(mon.rogueCustomSecondType)||!baseTypes?.length)throw Error('포켓몬의 변경된 타입을 확인하세요.');
 return [...new Set([baseTypes[0],mon.rogueCustomSecondType])];
}

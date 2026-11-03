function finalConsonant(text){const letters=String(text).match(/[가-힣]/g);return letters?.length?(letters.at(-1).charCodeAt(0)-0xac00)%28:0;}
export const subject=text=>String(text)+(finalConsonant(text)?'이':'가');
export const object=text=>String(text)+(finalConsonant(text)?'을':'를');
export const topic=text=>String(text)+(finalConsonant(text)?'은':'는');
export const direction=text=>String(text)+([0,8].includes(finalConsonant(text))?'로':'으로');

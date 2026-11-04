// Keep original characters intact; bounded pages fit the smallest supported dialogue frame.
export function dialogueSegments(text, rule='legacy') {
  if(rule==='words-v1'){const chars=Array.from(String(text??'')),out=[];while(chars.length){let limit=Math.min(24,chars.length),line=0;for(let i=0;i<limit;i++){if(chars[i]==='\n'&&++line===2){limit=i;break;}}if(limit<chars.length){let cut=limit;for(let i=limit-1;i>=Math.max(1,Math.floor(limit*.5));i--)if(/\s/u.test(chars[i])){cut=i+1;break;}limit=Math.max(1,cut);}out.push(chars.splice(0,limit).join(''));}return out.length?out:[''];}
  const result=[]; let page='', lines=1;
  for (const char of Array.from(String(text ?? ''))) {
    if (page && (Array.from(page).length>=24 || (char==='\n' && lines>=2))) {
      result.push(page); page=''; lines=1;
    }
    page+=char;
    if (char==='\n') lines++;
  }
  if (page || !result.length) result.push(page);
  return result;
}

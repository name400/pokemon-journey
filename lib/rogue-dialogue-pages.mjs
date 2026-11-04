// Keep original characters intact; bounded pages fit the smallest supported dialogue frame.
export const SOURCE_PAGE_MODE='source-pages-v1';
export function dialogueSegments(text, rule='legacy') {
  if(rule==='source-pages-v1')return [String(text??'')];
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

export function dialoguePosition(dialogue){
  const pages=Array.isArray(dialogue?.pages)?dialogue.pages:[];
  if(!pages.length)return {current:0,total:0,text:'',hasNext:false};
  const index=Math.max(0,Math.min(pages.length-1,Number.isInteger(dialogue.index)?dialogue.index:0));
  const segments=pages.map(page=>dialogueSegments(page,dialogue.segmentRule));
  const part=Math.max(0,Math.min(segments[index].length-1,Number.isInteger(dialogue.segmentIndex)?dialogue.segmentIndex:0));
  if(dialogue.pageMode===SOURCE_PAGE_MODE)return {current:index+1,total:pages.length,text:segments[index].slice(part).join(''),hasNext:index+1<pages.length};
  return {current:segments.slice(0,index).reduce((n,list)=>n+list.length,0)+part+1,total:segments.reduce((n,list)=>n+list.length,0),text:segments[index][part],hasNext:part+1<segments[index].length||index+1<pages.length};
}

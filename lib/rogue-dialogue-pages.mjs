// Keep original characters intact; bounded pages fit the smallest supported dialogue frame.
export function dialogueSegments(text) {
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

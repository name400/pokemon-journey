// Decode the actual atlas rectangle before reading pixels at canvas origin.
// Reject malformed/out-of-image coordinates; a valid packed atlas need not start at0.
export function checkedAtlasFrame(frame,imageWidth,imageHeight){
 const p=frame?.frame,s=frame?.sourceSize,o=frame?.spriteSourceSize;
 if(frame?.rotated||!p||!s||!o)return null;
 if(![imageWidth,imageHeight,p.x,p.y,p.w,p.h,s.w,s.h,o.x,o.y,o.w,o.h].every(Number.isSafeInteger))return null;
 if(imageWidth<=0||imageHeight<=0||p.x<0||p.y<0||p.w<=0||p.h<=0||p.x+p.w>imageWidth||p.y+p.h>imageHeight||s.w<=0||s.h<=0||o.x<0||o.y<0||o.w<=0||o.h<=0||o.x+o.w>s.w||o.y+o.h>s.h)return null;
 return {x:p.x,y:p.y,width:p.w,height:p.h,canvasWidth:s.w,canvasHeight:s.h,offsetX:o.x,offsetY:o.y};
}

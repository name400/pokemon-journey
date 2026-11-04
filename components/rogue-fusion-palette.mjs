// Run only in an isolated worker: the quantizer uses Math.random internally.
import {QuantizerCelebi} from '@material/material-color-utilities';
import {rogueSeededRandom} from '../lib/rogue-seeded-rng.mjs';
const rgb=v=>[(v>>>16)&255,(v>>>8)&255,v&255];
const argb=(r,g,b,a=255)=>((a<<24)|(r<<16)|(g<<8)|b)>>>0;
const hue=([r,g,b])=>{const hi=Math.max(r,g,b),d=hi-Math.min(r,g,b);if(!d)return 0;let h=hi===r?(g-b)/d:hi===g?2+(b-r)/d:4+(r-g)/d;return 60*(h<0?h+6:h);};
const distance=(a,b)=>{const dr=(a[0]-b[0])**2,dg=(a[1]-b[1])**2,db=(a[2]-b[2])**2;return Math.ceil(Math.sqrt(2*dr+4*dg+3*db+((a[0]+b[0])/2)*(dr-db)/256));};
function reducePalette(initial){
 const counts=new Map(initial);let keys=[...counts.keys()].sort((a,b)=>counts.get(a)<counts.get(b)?1:-1),groups;
 do{groups=new Map();for(let i=keys.length-1;i>=0;i--){const h=hue(rgb(keys[i]));for(let j=0;j<i;j++){const diff=Math.abs(h-hue(rgb(keys[j])));if(diff<30||diff>=330){groups.set(keys[i],[keys[j]]);break;}}}
  for(const [key,others] of groups){const group=[key,...others].filter(k=>counts.has(k)),weight=group.reduce((n,k)=>n+counts.get(k),0);if(!weight)continue;const channels=[0,1,2].map(c=>Math.round(group.reduce((sum,k)=>sum+rgb(k)[c]*counts.get(k),0)/weight));for(const k of group){counts.delete(k);if(k!==key)groups.delete(k);}counts.set(argb(...channels,(key>>>24)&255),weight);}
  keys=[...counts.keys()].sort((a,b)=>counts.get(a)<counts.get(b)?1:-1);
 }while(groups.size);
 return keys.map(rgb);
}
function sample(frames){const values=[];for(const frame of frames)for(let i=0;i<frame.length;i+=4){const [r,g,b,a]=frame.slice(i,i+4);if(r+g+b)values.push(argb(r,g,b,a));}return values;}
export function buildClassicFusionPalette(primaryFaces,donorFaces){
 if(!Array.isArray(primaryFaces)||primaryFaces.length!==2||!Array.isArray(donorFaces)||donorFaces.length!==2)return null;
 const primaryPixels=sample(primaryFaces),donorPixels=sample(donorFaces);if(!primaryPixels.length||!donorPixels.length)return null;
 let left,right;const previous=Math.random,rng=rogueSeededRandom('This result should not vary');try{Math.random=rng;left=reducePalette(QuantizerCelebi.quantize(primaryPixels,4));right=reducePalette(QuantizerCelebi.quantize(donorPixels,4));}finally{Math.random=previous;}if(!left.length||!right.length)return null;
 const colors=[],seen=new Set();for(const face of primaryFaces)for(let i=0;i<face.length;i+=4){if(!face[i+3])continue;const key=`${face[i]},${face[i+1]},${face[i+2]}`;if(!seen.has(key)){seen.add(key);colors.push([face[i],face[i+1],face[i+2]]);}}
 return colors.slice(0,32).map(color=>{let best=Infinity,at=0;for(let i=0;i<left.length;i++){const d=distance(color,left[i]);if(d<best){best=d;at=i;}}const target=right[Math.min(at,right.length-1)],mix=best<255?(best/255)**3:1;return {from:color,to:color.map((v,i)=>Math.round(v*mix+target[i]*(1-mix)))};});
}
export function applyClassicFusionPalette(pixels,mapping){
 const out=new Uint8ClampedArray(pixels),colors=new Map(mapping.map(({from,to})=>[from.join(','),to]));for(let i=0;i<out.length;i+=4){if(!out[i+3])continue;const original=[out[i],out[i+1],out[i+2]],target=colors.get(original.join(','));if(!target)continue;const gray=(original[0]+original[1]+original[2])/(3*255);for(let c=0;c<3;c++){const v=target[c]/255;out[i+c]=Math.round(255*(gray<=.5?2*gray*v:1-2*(1-gray)*(1-v)));}}return out;
}

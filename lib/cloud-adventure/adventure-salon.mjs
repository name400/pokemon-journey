import {side12SalonColorAvailable} from './adventure-side12.mjs';
// A small pixel-art subset of the original salon choices.
// https://game8.jp/pokemon-legends-z-a/730162
export const SIDE51_COLORS=Object.freeze(['lime','turquoise','gray','palepink','paleblue','cream','lavender','peachpink','mint']);
export const SALON_PRICE=3000;
export const SALON_STYLES=Object.freeze({classic:'기존 모자',short:'심플 쇼트',bob:'단발',long:'긴 머리'});
export const SALON_COLORS=Object.freeze({brown:{name:'브라운',value:'#79503b'},black:{name:'블랙',value:'#26272e'},gold:{name:'골드',value:'#d5ac58'},darkred:{name:'다크 레드',value:'#8e4749'},red:{name:'레드',value:'#d23f48'},yellow:{name:'레몬 옐로',value:'#e5d24a'},orange:{name:'오렌지',value:'#df8a3c'},blue:{name:'블루',value:'#568dc6'},white:{name:'화이트',value:'#e9e8e1'},aqua:{name:'아쿠아',value:'#65c8c5'},purple:{name:'퍼플',value:'#926ab6'},passionpink:{name:'패션 핑크',value:'#db5996'},lime:{name:'라임',value:'#b9d877'},turquoise:{name:'터키석',value:'#76c9c0'},gray:{name:'그레이',value:'#b4b5bd'},palepink:{name:'연분홍',value:'#eeb8c9'},paleblue:{name:'하늘색',value:'#abd3e7'},cream:{name:'크림',value:'#f1dfae'},lavender:{name:'라벤더',value:'#d0b9e1'},peachpink:{name:'복숭아 핑크',value:'#efc0ae'},mint:{name:'민트',value:'#b4e0c5'}});
export function validSalonStyle(style,color){return typeof style==='string'&&typeof color==='string'&&Object.hasOwn(SALON_STYLES,style)&&Object.hasOwn(SALON_COLORS,color);}
export function salonAppearance(s){const value=s?.zaSalonAppearance;return validSalonStyle(value?.style,value?.color)?{style:value.style,color:value.color}:{style:'classic',color:'brown'};}
export function salonAt(s,spot){if(!s||s.area!==3||s.interior)return false;const p={'lumiose-ombrage-arcade':[16,8,'s'],'lumiose-galerie-lune':[11,3,'s'],'lumiose-bleu-sector8':[16,14,'s'],'lumiose-vernal':[16,7,'n']}[s.district];return !!p&&p[0]===spot?.x&&p[1]===spot?.y&&p[2]===spot?.tile;}

export function salonColorAvailable(s,color){return Object.hasOwn(SALON_COLORS,color)&&(SIDE51_COLORS.includes(color)?[2,3].includes(s?.zaSide51Stage):side12SalonColorAvailable(s,color));}

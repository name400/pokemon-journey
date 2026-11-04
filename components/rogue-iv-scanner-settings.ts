'use client';
import {useCallback,useEffect,useState} from 'react';
export const battleSettingsKey='poke-journey-battle-settings';
const changeEvent='poke-journey-iv-scanner-setting';
let fallback:boolean|null=null;
function readSetting(){if(fallback!==null)return fallback;try{const value=JSON.parse(localStorage.getItem(battleSettingsKey)||'null');return !!value&&typeof value==='object'&&value.hideIvScanner===true;}catch{return false;}}
export function useIvScannerSetting(){
 const [hidden,setHidden]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{const sync=()=>{setHidden(readSetting());setReady(true);};sync();window.addEventListener('storage',sync);window.addEventListener(changeEvent,sync);return()=>{window.removeEventListener('storage',sync);window.removeEventListener(changeEvent,sync);};},[]);
 const setHide=useCallback((value:boolean)=>{let previous:Record<string,unknown>={};try{const stored=JSON.parse(localStorage.getItem(battleSettingsKey)||'null');if(stored&&typeof stored==='object'&&!Array.isArray(stored))previous=stored;}catch{}try{localStorage.setItem(battleSettingsKey,JSON.stringify({...previous,hideIvScanner:value}));fallback=null;}catch{fallback=value;}setHidden(value);window.dispatchEvent(new Event(changeEvent));},[]);
 return {hidden,ready,setHide};
}

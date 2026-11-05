import React,{useState} from 'react';
import {createRoot} from 'react-dom/client';
import BattlePanel from '../../../components/battle-panel';
import '../../../app/globals.css';
import '../../../app/game-shell.css';
import '../../../app/rogue-classic.css';
import '../../../app/rogue-battle-redesign.css';

// Actual controller DTOs, rendered on the same BattlePanel instance across modes.
type FixtureBattle={teams:Array<Array<{types:string[];terastallized?:string|null;currentTypes?:string[]}>>;events:unknown[];activeBySide:number[][]};
async function load(scenario:string){await fetch('/api/test-reset?scenario='+scenario,{method:'POST'});return (await(await fetch('/api/rogue-classic')).json() as {battle:FixtureBattle}).battle;}
const double=await load('double-layout'),single=await load('single-layout'),doubleTypes=await load('double-types'),singleTypes=await load('single-types');
function Layout(){
 const [mode,setMode]=useState('double'),[version,setVersion]=useState(0);
 const battle=structuredClone(mode==='single'?single:mode==='single-types'?singleTypes:['double-types','tera','stellar','current'].includes(mode)?doubleTypes:double);battle.events=[];
 if(['tera','stellar','current'].includes(mode))for(const team of battle.teams)for(const mon of team){mon.terastallized=mode==='tera'?'Fire':mode==='stellar'?'Stellar':null;mon.currentTypes=mode==='tera'?['불꽃']:mode==='current'?['풀','독']:mon.types;}
 if(mode==='reversed')battle.activeBySide=battle.activeBySide.map((indices:number[])=>[...indices].reverse());
 return <><nav aria-label="격리 검사">{['single','double','reversed','single-types','double-types','tera','stellar','current'].map(value=><button key={value} onClick={()=>{setMode(value);setVersion(v=>v+1);}}>{value}</button>)}</nav><main data-mode="rogue"><div className="rc-shell is-battle"><BattlePanel classicLayout battle={battle} battleKey={'layout-'+version} title="38 웨이브 · 더블 배치 검사" busy={false} onCommand={()=>{}}/></div></main></>;
}
createRoot(document.getElementById('root')!).render(<Layout/>);

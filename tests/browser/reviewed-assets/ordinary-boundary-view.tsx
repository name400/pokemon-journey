import React,{useState} from 'react';
import PokemonImage from '../../../components/pokemon-image';
import records from '../../../data/rogue-reviewed-form-atlases.json';
const make=(id:number,key:string)=>{const r=records.find(r=>r.sourceId===id&&r.formKey===key)!;return {id,name:r.atlas,rogueSourceId:id,rogueFormIndex:r.formIndex,rogueFormKey:key,rogueBattleSpecies:r.native[0],battleAppearance:r.native[0],gender:'M'};};
export default function OrdinaryBoundaries(){
 const [back,setBack]=useState(false),[female,setFemale]=useState(false),[mounted,setMounted]=useState(true),[color,setColor]=useState(0);
 return <main style={{display:'block',padding:16}}><button onClick={()=>setBack(value=>!value)}>방향 전환</button><button onClick={()=>setFemale(value=>!value)}>성별 전환</button><button onClick={()=>setMounted(value=>!value)}>다시 표시</button><button onClick={()=>setColor(value=>(value+1)%4)}>색상 전환</button><div data-school><PokemonImage mon={make(746,'school')} facing={back?'back':'front'} variant="battle" eager/></div><div data-partner>{mounted&&<PokemonImage mon={{...make(25,'partner'),gender:female?'F':'M',shiny:color>0,variant:Math.max(0,color-1)}} facing="front" variant="battle" eager frozen/>}</div><div style={{marginTop:2400}} data-lazy><PokemonImage mon={make(746,'school')} facing="back" variant="sprite"/></div></main>;
}

'use client';
import EvolutionPresentation from '@/components/evolution-presentation';

/** The server already committed the change; confirming here only dismisses it. */
export default function AdventureEvolutionResult({result,onClose}:{result:{before:any;after:any};onClose:()=>void}){
 const {before,after}=result;
 return <EvolutionPresentation before={before} after={after} beforeName={before.name} afterName={after.name} onClose={onClose}/>;
}

'use client';
import type {ComponentProps} from 'react';
import PokemonImage from './pokemon-image';
import EvolutionPresentation from './evolution-presentation';
import {classicDisplayPokemonName} from '@/lib/rogue-display-name.mjs';

type Mon=NonNullable<ComponentProps<typeof PokemonImage>['mon']>;
type Result={before:Mon;after:Mon;displayBefore?:Mon;displayAfter?:Mon};
export default function RogueEvolutionResult({result,onClose}:{result:Result;onClose:()=>void}){
 const before=result.displayBefore||result.before,after=result.displayAfter||result.after;
 return <EvolutionPresentation before={before} after={after} beforeName={classicDisplayPokemonName(before)} afterName={classicDisplayPokemonName(after)} onClose={onClose}/>;
}

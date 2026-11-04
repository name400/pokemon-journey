import test from 'node:test';
import assert from 'node:assert/strict';
import {starterChallengeError,CHALLENGE_TYPES} from '../components/rogue-starter-logic.ts';
import {ensureClassicState} from '../lib/rogue-classic-state.mjs';
import {starterCatalog} from '../lib/rogue-starter-system.mjs';
import {rogueSpecies} from '../lib/rogue-reference.mjs';
import {classicChallengeStarterEligibility} from '../lib/rogue-challenge-eligibility.mjs';
test('starter challenge display agrees with server for all catalog forms, genders and single restrictions',()=>{const entries=starterCatalog(ensureClassicState({}).system);for(const entry of entries)for(const gender of entry.genders){const choice={id:entry.id,gender},source=rogueSpecies.get(entry.sourceId),form=source.formList.find(f=>f.formIndex===entry.formIndex),mon={id:entry.pokemonId,rogueSourceId:entry.sourceId,rogueFormIndex:entry.formIndex,rogueFormKey:form?.formKey,gender};for(const generation of [1,4,9]){const client=!starterChallengeError(entries,[choice],generation,0),server=classicChallengeStarterEligibility(mon,[{id:0,value:generation}]);assert.equal(client,server===true,`${entry.name} ${gender} gen ${generation}`);}for(let type=1;type<=CHALLENGE_TYPES.length;type++){const client=!starterChallengeError(entries,[choice],0,type),server=classicChallengeStarterEligibility(mon,[{id:1,value:type}]);assert.equal(client,server===true,`${entry.name} ${gender} type ${type}`);}}});

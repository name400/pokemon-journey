import {fixture} from '../../fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {grantClassicFormItem} from '../../../lib/rogue-transformations.mjs';
export function createFixture(index=0){const {doc,state,run}=fixture([makeReferenceMon([151,6,800][index],50,{boxId:'primary',moves:['Splash']})]);run.formItemStateRule='source-v1';run.screen='reward';state.system.dex[791]={...state.system.dex[791],caught:true};run.party[0]=grantClassicFormItem(run.party[0],run,index===2?'nsolarizer':'charizarditex',state.system);if(index===2)run.party[0]=grantClassicFormItem(run.party[0],run,'ultranecroziumz',state.system);return doc;}

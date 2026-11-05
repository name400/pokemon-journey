import {forms,member,fixture} from '../../fixtures/dna-persistent.mjs';
import {makeReferenceMon} from '../../../lib/rogue-reference.mjs';
import {classicPersistentFormKind} from '../../../lib/rogue-native-form.mjs';
import {stageClassicDnaFusion} from '../../../lib/rogue-dna-fusion-stage.mjs';
import {classicFormOptions} from '../../../lib/rogue-transformations.mjs';
export const cases=[[65,'mega'],[382,'primal'],[800,'ultra'],[892,'gigantamax-rapid']];
export function createFixture(index=0){
 const [id,key]=cases[index],row=forms.find(r=>r.s.sourceId===id&&r.f.formKey===key),change=row.s.formChanges.find(c=>c.evoFormKey===key&&c.trigger?.__class==='SpeciesFormChangeItemTrigger'),pre=row.s.formList.find(f=>f.formKey===(change.preFormKey||'')),kind=classicPersistentFormKind(row.s,pre);
 const primary=pre.formIndex?member({s:row.s,f:pre,kind},'primary'):makeReferenceMon(id,50,{boxId:'primary',moves:['Splash']}),donor=member(forms.find(r=>r.s.sourceId===65&&r.f.formKey==='mega'),'donor'),{doc,state,run}=fixture([primary,donor]);
 const staged=stageClassicDnaFusion(run,{primaryBoxId:'primary',donorBoxId:'donor'}).run;state.slots[0]=staged;const option=classicFormOptions(staged.party[0],staged,{includeUnavailable:true,system:state.system}).find(o=>o.formKey===key);staged.formItems.primary=[option.itemKey];return doc;
}

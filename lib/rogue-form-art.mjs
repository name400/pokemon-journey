/** Keep normal and shiny front/back identities tied to the current species form. */
export function rogueFormArt(form,shiny=false){
 // These forms are omitted from the imported appearance index, but all four
 // model variants exist in the pinned Smogon sprite repository.
 if(([493,773].includes(form?.sourceId)&&form.formKey&&form.formKey!=='normal')||(form?.sourceId===351&&['','sunny','rainy','snowy'].includes(form.formKey))||(form?.sourceId===746&&['','school'].includes(form.formKey))||(form?.sourceId===877&&['full-belly','hangry'].includes(form.formKey))){
  const name={351:'castform',493:'arceus',746:'wishiwashi',773:'silvally',877:'morpeko'}[form.sourceId],key=form.formKey==='full-belly'?'':form.formKey;
  const base=`https://raw.githubusercontent.com/smogon/sprites/d98f9e5b35e23500bdffdd1237d5482bdee9be49/src/models/s${name}${key?'-o'+key:''}`;
  const staticBase=base.replace('/models/',form.sourceId===877?'/sprites/gen5/':'/dex/');
  return {sourceImage:base+(shiny?'-s':'')+'.gif',sourceBackImage:base+(shiny?'-b-s':'-b')+'.gif',sourceShinyImage:base+'-s.gif',sourceShinyBackImage:base+'-b-s.gif',sourceStaticImage:staticBase+(shiny?'-s':'')+'.png',sourceAppearanceMissing:false};
 }
 return {
  sourceImage:(shiny?form?.sourceShinyImage:form?.sourceImage)||null,
  sourceBackImage:(shiny?form?.sourceShinyBackImage:form?.sourceBackImage)||null,
  sourceShinyImage:form?.sourceShinyImage||null,
  sourceShinyBackImage:form?.sourceShinyBackImage||null,
  sourceStaticImage:null,
  sourceAppearanceMissing:!!form?.sourceAppearanceMissing,
 };
}

/** Keep normal and shiny front/back identities tied to the current species form. */
export function rogueFormArt(form,shiny=false){
 // These forms are omitted from the imported appearance index, but all four
 // model variants exist in the pinned Smogon sprite repository.
 if([493,773].includes(form?.sourceId)&&form.formKey&&form.formKey!=='normal'){
  const base=`https://raw.githubusercontent.com/smogon/sprites/d98f9e5b35e23500bdffdd1237d5482bdee9be49/src/models/s${form.sourceId===493?'arceus':'silvally'}-o${form.formKey}`;
  const staticBase=base.replace('/models/','/dex/');
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

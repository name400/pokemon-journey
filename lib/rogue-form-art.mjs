/** Keep normal and shiny front/back identities tied to the current species form. */
export function rogueFormArt(form,shiny=false){
 if(form?.sourceId===1017&&/^(teal|wellspring|hearthflame|cornerstone)-mask(-tera)?$/.test(form.formKey)){
  const [mask,,tera]=form.formKey.split('-'),key=mask==='teal'&&!tera?'':mask+(tera?'_tera':'');
  const base=`https://raw.githubusercontent.com/smogon/sprites/d98f9e5b35e23500bdffdd1237d5482bdee9be49/src/sprites/gen5/sogerpon${key?'-o'+key:''}`;
  return {sourceImage:base+(shiny?'-s':'')+'.png',sourceBackImage:base+(shiny?'-b-s':'-b')+'.png',sourceShinyImage:base+'-s.png',sourceShinyBackImage:base+'-b-s.png',sourceStaticImage:base+(shiny?'-s':'')+'.png',sourceAppearanceMissing:false};
 }
 if(form?.sourceId===1024&&['','terastal','stellar'].includes(form.formKey)){
  const base=`https://raw.githubusercontent.com/smogon/sprites/d98f9e5b35e23500bdffdd1237d5482bdee9be49/src/sprites/gen5/sterapagos${form.formKey?'-o'+form.formKey:''}`;
  return {sourceImage:base+(shiny?'-s':'')+'.png',sourceBackImage:base+(shiny?'-b-s':'-b')+'.png',sourceShinyImage:base+'-s.png',sourceShinyBackImage:base+'-b-s.png',sourceStaticImage:base+(shiny?'-s':'')+'.png',sourceAppearanceMissing:false};
 }
 // These forms are omitted from the imported appearance index, but all four
 // model variants exist in the pinned Smogon sprite repository.
 if(([493,773].includes(form?.sourceId)&&form.formKey&&form.formKey!=='normal')||(form?.sourceId===351&&['','sunny','rainy','snowy'].includes(form.formKey))||(form?.sourceId===718&&['complete','10-complete'].includes(form.formKey))||(form?.sourceId===746&&['','school'].includes(form.formKey))||(form?.sourceId===778&&['disguised','busted'].includes(form.formKey))||(form?.sourceId===875&&['','no-ice'].includes(form.formKey))||(form?.sourceId===877&&['full-belly','hangry'].includes(form.formKey))||(form?.sourceId===964&&['zero','hero'].includes(form.formKey))){
  const name={351:'castform',493:'arceus',718:'zygarde',746:'wishiwashi',773:'silvally',778:'mimikyu',875:'eiscue',877:'morpeko',964:'palafin'}[form.sourceId],key=['full-belly','disguised','zero'].includes(form.formKey)?'':form.formKey==='no-ice'?'noice':form.formKey==='10-complete'?'complete':form.formKey;
  const base=`https://raw.githubusercontent.com/smogon/sprites/d98f9e5b35e23500bdffdd1237d5482bdee9be49/src/models/s${name}${key?'-o'+key:''}`;
  const staticBase=base.replace('/models/',[718,778,875,877,964].includes(form.sourceId)?'/sprites/gen5/':'/dex/');
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

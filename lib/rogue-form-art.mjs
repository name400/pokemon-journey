/** Keep normal and shiny front/back identities tied to the current species form. */
export function rogueFormArt(form,shiny=false){
 return {
  sourceImage:(shiny?form?.sourceShinyImage:form?.sourceImage)||null,
  sourceBackImage:(shiny?form?.sourceShinyBackImage:form?.sourceBackImage)||null,
  sourceShinyImage:form?.sourceShinyImage||null,
  sourceShinyBackImage:form?.sourceShinyBackImage||null,
  sourceAppearanceMissing:!!form?.sourceAppearanceMissing,
 };
}

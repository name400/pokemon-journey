// Forms that are temporary battle states, not separately owned Pokémon.
// Permanent alternate forms (including Origin/Therian forms and Minior's
// naturally obtainable meteor forms) must remain selectable.
const battleOnlySuffix=/(?:-mega(?:-[a-z0-9]+)?|-gmax|-primal|-ultra|-eternamax|-ash|-complete|-crowned(?:-[a-z]+)?|-hero|-school|-zen)$/i;
const conditionalForms=/^(?:castform-(?:sunny|rainy|snowy)|meloetta-pirouette|aegislash-blade|mimikyu-(?:totem-)?busted|cramorant-(?:gulping|gorging)|eiscue-noice|morpeko-hangry|terapagos-(?:terastal|stellar))$/i;
export function isAdventureBattleOnlyForm(mon){const id=String(mon?.identifier||'');return battleOnlySuffix.test(id)||conditionalForms.test(id);}

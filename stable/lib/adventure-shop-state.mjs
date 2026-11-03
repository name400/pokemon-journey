// Some successful shop actions return only wallet fields; retain the catalog
// and inventory until the server explicitly sends replacements.
export function mergeAdventureShopState(previous,result){
 return {...previous,...result,inventory:result.inventory??previous?.inventory,catalog:result.catalog??previous?.catalog};
}
export function filterAdventureCatalog(catalog,category,query){
 const q=query.trim().toLowerCase();
 return (catalog||[]).filter(item=>(category==='all'||item.category===category)&&(!q||item.name.toLowerCase().includes(q)));
}

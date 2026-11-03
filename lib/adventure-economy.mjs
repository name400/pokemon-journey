// Adventure economy only. The separate roguelike keeps its own catalog.
export const ADVENTURE_STORE_VERSION='adventure-2026-11-04-v1';
export const ADVENTURE_GOODS=[
 {id:'ball',name:'몬스터볼',column:'balls',price:150,description:'야생 포켓몬을 잡는 볼',sprite:'poke-ball'},
 {id:'potion',name:'상처약',column:'potions',price:120,description:'HP 20 회복',sprite:'potion'},
 {id:'super',name:'좋은상처약',column:'super_potions',price:300,description:'HP 60 회복',sprite:'super-potion'},
 {id:'hyper',name:'고급상처약',column:'hyper_potions',price:650,description:'HP 120 회복',sprite:'hyper-potion'},
 {id:'max',name:'풀회복약',column:'max_potions',price:1300,description:'HP 전부 회복',sprite:'max-potion'},
 {id:'fullrestore',name:'회복약',column:'full_restores',price:1800,description:'HP와 상태이상 회복',sprite:'full-restore'},
 {id:'revive',name:'기력의조각',price:1800,description:'기절한 포켓몬의 HP 절반 회복',sprite:'revive'},
 {id:'antidote',name:'해독제',column:'antidotes',price:100,description:'독·맹독 치료',sprite:'antidote'},
];

export function adventureItemPrice(item){
 if(item.id==='gimmighoulcoin')return 100;
 if(item.id==='meltancandy')return 200;
 if(item.category==='berry')return ['sitrusberry','lumberry','leppaberry'].includes(item.id)?600:250;
 if(item.category==='evolution')return ['linkingcord','reapercloth','protector'].includes(item.id)?5000:3000;
 if(/나이트(?:[XYZ])?$/.test(item.name)||/iumz$/.test(item.id))return 12000;
 if(['leftovers','choicescarf','choiceband','choicespecs','focussash','lifeorb'].includes(item.id))return 8000;
 if(/(?:plate|memory)$/.test(item.id))return 5000;
 if(item.id==='masterball')return 30000;
 return 2000;
}

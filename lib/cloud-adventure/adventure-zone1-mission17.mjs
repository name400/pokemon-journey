// Side Mission 17 becomes available around Main Mission 8 after Lida's battle.
// https://allthings.how/pokemon-legends-z-a-how-to-catch-the-guaranteed-shiny-mareep/
export function mission17Available(s){return ['V','F','E','D','C','B','A'].includes(s?.zaRoyaleRank)||Number(s?.zaMission10Stage)>=1;}

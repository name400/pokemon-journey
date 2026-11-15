// The published probabilities do not add up to 100%; equal odds are provisional.
const rewards=[['greatball',5,'슈퍼볼'],['lemonade',5,'후르츠밀크'],['lumiosegalette',5,'미르갈레트'],['za-exp-candy-s',3,'경험사탕S']];
export function rollRoyaleCourier(r){const [item,quantity]=rewards[Math.min(3,Math.max(0,Math.floor(r*4)))];return {v:1,item,quantity};}
export function validRoyaleCourierPending(p){return !!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(p).length===3&&p.v===1&&rewards.some(([item,quantity])=>p.item===item&&p.quantity===quantity);}
export function royaleCourierName(p){return rewards.find(([item,quantity])=>p?.item===item&&p?.quantity===quantity)?.[2]||'';}

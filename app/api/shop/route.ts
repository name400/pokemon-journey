import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
const db=()=>env.DB!;
const goods:any={potion:{column:'potions',price:100},super:{column:'super_potions',price:180},antidote:{column:'antidotes',price:80}};
async function account(id:string){await db().prepare('INSERT OR IGNORE INTO wallets (user_id) VALUES (?)').bind(id).run();return db().prepare('SELECT coins,potions,super_potions,antidotes,last_claim FROM wallets WHERE user_id=?').bind(id).first();}
export async function GET(){const u=await getChatGPTUser();if(!u)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{return Response.json(await account(u.userId));}catch{return Response.json({error:'상점 정보를 불러오지 못했습니다.'},{status:500})}}
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return Response.json({error:'로그인이 필요합니다.'},{status:401});try{const {action,revision,item}=await req.json();await account(u.userId);let result;
 if(action==='claim'){const day=new Date().toISOString().slice(0,10);result=await db().prepare('UPDATE wallets SET coins=coins+100,last_claim=? WHERE user_id=? AND last_claim<>?').bind(day,u.userId,day).run()}
 else if(action==='buy'||action==='buyPotion'){const g=goods[action==='buyPotion'?'potion':item];if(!g)return Response.json({error:'상품을 확인하세요.'},{status:400});result=await db().prepare(`UPDATE wallets SET coins=coins-?,${g.column}=${g.column}+1 WHERE user_id=? AND coins>=? AND ${g.column}<99`).bind(g.price,u.userId,g.price).run()}
 else if(action==='usePotion'||action==='use'){const key=action==='usePotion'?'potion':item;const g=goods[key];if(!g)return Response.json({error:'아이템을 확인하세요.'},{status:400});
 const row=await db().prepare('SELECT data,revision FROM saves WHERE user_id=?').bind(u.userId).first<any>();
 if(!row||!Number.isInteger(revision)||row.revision!==revision)return Response.json({error:'저장이 변경되었습니다. 새로고침하세요.'},{status:409});
 const data=JSON.parse(row.data);if(data.screen!=='battle'||!data.run?.mon)return Response.json({error:'전투 중에만 사용할 수 있습니다.'},{status:409});
 if(key==='potion'){if(data.run.potions>=99)return Response.json({error:'회복약 한도에 도달했습니다.'},{status:409});data.run.potions++}
 if(key==='super'){if(data.run.mon.hp>=data.run.mon.maxHp)return Response.json({error:'이미 HP가 가득 찼습니다.'},{status:409});data.run.mon.hp=Math.min(data.run.mon.maxHp,data.run.mon.hp+60)}
 if(key==='antidote'){if(data.run.mon.status!=='독')return Response.json({error:'독 상태일 때만 사용할 수 있습니다.'},{status:409});data.run.mon.status=null}
 const results=await db().batch([db().prepare(`UPDATE wallets SET ${g.column}=${g.column}-1 WHERE user_id=? AND ${g.column}>0 AND EXISTS(SELECT 1 FROM saves WHERE user_id=? AND revision=?)`).bind(u.userId,u.userId,revision),db().prepare('UPDATE saves SET data=?,revision=revision+1,updated_at=? WHERE user_id=? AND revision=? AND changes()=1').bind(JSON.stringify(data),Date.now(),u.userId,revision)]);
 if(!results[0].meta.changes||!results[1].meta.changes)return Response.json({error:'아이템이 없거나 저장이 변경되었습니다.'},{status:409});return Response.json({ok:true,data,revision:revision+1,...await account(u.userId)});
 }
 else return Response.json({error:'알 수 없는 요청입니다.'},{status:400});
 if(!result.meta.changes)return Response.json({error:action==='claim'?'오늘의 보상을 이미 받았습니다.':'코인이 부족하거나 보관 한도에 도달했습니다.'},{status:409});return Response.json({ok:true,...await account(u.userId)});
 }catch{return Response.json({error:'상점 요청을 처리하지 못했습니다.'},{status:500})}}

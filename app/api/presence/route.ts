import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {sameOriginRequest} from '@/lib/request-origin.mjs';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOriginRequest(req))return Response.json({error:'올바른 사이트에서 다시 요청하세요.'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try{const result=await env.DB!.prepare('UPDATE players SET last_seen=? WHERE user_id=?').bind(Date.now(),user.userId).run();if(!result.meta.changes)return Response.json({error:'계정 정보를 불러오지 못했습니다.'},{status:409});return Response.json({ok:true},{headers:{'Cache-Control':'private, no-store'}});}
 catch{return Response.json({error:'접속 상태를 갱신하지 못했습니다.'},{status:503});}
}

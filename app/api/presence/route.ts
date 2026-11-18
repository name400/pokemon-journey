import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {sameOriginRequest} from '@/lib/request-origin.mjs';

export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOriginRequest(req))return Response.json({error:'올바른 사이트에서 다시 요청하세요.'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try{await env.DB!.prepare('UPDATE players SET last_seen=MAX(last_seen,?) WHERE user_id=?').bind(Date.now(),user.userId).run();return new Response(null,{status:204,headers:{'Cache-Control':'private, no-store'}});}catch{return Response.json({error:'접속 상태를 갱신하지 못했습니다.'},{status:500});}
}

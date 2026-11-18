import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {sameOriginRequest} from '@/lib/request-origin.mjs';
import {acknowledgeStoredPresentation} from '@/lib/rogue-presentation-store.mjs';

export const dynamic='force-dynamic';
export async function POST(req:Request){
 if(!sameOriginRequest(req))return Response.json({error:'올바른 사이트에서 다시 요청하세요.'},{status:403});
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try{const payload=await req.json();return Response.json(await acknowledgeStoredPresentation(env.DB!,user.userId,payload),{headers:{'Cache-Control':'private, no-store'}});}
 catch{return Response.json({error:'연출 확인을 처리하지 못했습니다. 저장된 전투를 다시 확인하세요.'},{status:409,headers:{'Cache-Control':'private, no-store'}});}
}

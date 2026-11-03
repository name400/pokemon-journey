import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try{const rows=await env.DB!.prepare(`SELECT RANK() OVER (ORDER BY r.best_wave DESC) AS rank,p.nickname,r.best_wave,r.achieved_at,(r.user_id=?) AS is_self FROM classic_leaderboard r JOIN profiles p ON p.user_id=r.user_id ORDER BY r.best_wave DESC,r.achieved_at ASC,r.user_id ASC LIMIT 100`).bind(user.userId).all<any>();return Response.json({items:rows.results.map((r:any)=>({rank:r.rank,nickname:r.nickname,wave:r.best_wave,achievedAt:r.achieved_at,isSelf:!!r.is_self}))},{headers:{'Cache-Control':'private, no-store'}});}
 catch{return Response.json({error:'랭킹을 불러오지 못했습니다.'},{status:503});}
}

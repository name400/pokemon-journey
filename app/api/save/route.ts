import { getChatGPTUser } from '@/app/chatgpt-auth';
import { getDb } from '@/db';
import { saves } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const dynamic = 'force-dynamic';
export async function GET() {
 const user = await getChatGPTUser(); if (!user) return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try { const row = await getDb().select().from(saves).where(eq(saves.userId,user.userId)).get(); return Response.json({data:row ? JSON.parse(row.data) : null}); } catch { return Response.json({error:'저장 데이터를 불러오지 못했습니다.'},{status:500}); }
}
export async function PUT(request: Request) {
 const user = await getChatGPTUser(); if (!user) return Response.json({error:'로그인이 필요합니다.'},{status:401});
 try { const data = await request.json(); const raw = JSON.stringify(data); if (!data || data.version !== 1 || raw.length > 150000) return Response.json({error:'저장 형식이 올바르지 않습니다.'},{status:400});
 await getDb().insert(saves).values({userId:user.userId,data:raw,updatedAt:Date.now()}).onConflictDoUpdate({target:saves.userId,set:{data:raw,updatedAt:Date.now()}}); return Response.json({ok:true}); } catch {return Response.json({error:'저장하지 못했습니다.'},{status:500});}
}

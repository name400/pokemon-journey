import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '포켓몬 랜덤 배틀 | 도전의 기록', description: '무작위 파트너와 함께하는 로그라이크 배틀' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ko"><body>{children}</body></html>; }

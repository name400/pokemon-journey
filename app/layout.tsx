import type { Metadata } from 'next';
import './globals.css';
import './game-shell.css';
import './rogue-shell-redesign.css';
export const metadata: Metadata = { title: '포켓몬 저니 | 탐험과 로그라이크', description: '독립 저장으로 즐기는 2D 탐험 모험과 로그라이크 도전' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="ko"><body>{children}</body></html>; }


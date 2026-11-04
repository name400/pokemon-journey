import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function writeTrainerCredits(manifest){
 const rows=Object.entries(manifest.assets).filter(([,asset])=>asset.artist).sort(([a],[b])=>a.localeCompare(b)).map(([key,asset])=>`<li><strong>${escape(key)}</strong> · ${escape(asset.artist)}</li>`).join('');
 const html='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>트레이너 이미지 출처</title><style>body{font-family:system-ui,sans-serif;max-width:60rem;margin:auto;padding:1.5rem;line-height:1.6;background:#f8f7ef;color:#243c42}li{padding:.2rem 0}a{color:#265c76}</style><h1>트레이너 이미지 출처</h1><p>아래 작가명은 사용된 이미지의 출처 자료에 기재된 내용을 정리한 것입니다. 원작 캐릭터와 이미지의 권리는 각 권리자에게 있으며, 이 표가 별도의 상업적 이용 허가를 뜻하지 않습니다. 작가명이 없는 파일도 퍼블릭 도메인으로 간주하지 않습니다.</p><p>출처: <a href="https://play.pokemonshowdown.com/sprites/trainers/">Pokémon Showdown 트레이너 스프라이트</a> · <a href="pokerogue-credits.html">PokéRogue 이미지의 별도 출처·이용 조건</a></p><ul>'+rows+'</ul></html>\n';
 fs.writeFileSync(new URL('../public/game/trainers/credits.html',import.meta.url),html);
}
if(process.argv[1]===fileURLToPath(import.meta.url))writeTrainerCredits(JSON.parse(fs.readFileSync(new URL('../data/rogue-trainer-appearance.json',import.meta.url))));

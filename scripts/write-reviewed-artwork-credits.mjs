import fs from 'node:fs';
import provenance from '../data/rogue-reviewed-asset-provenance.json' with {type:'json'};
import additional from '../data/rogue-additional-mega-asset-provenance.json' with {type:'json'};
import transformations from '../data/rogue-transformation-asset-provenance.json' with {type:'json'};
import existing from '../data/rogue-existing-trainer-asset-provenance.json' with {type:'json'};
import ordinary from '../data/rogue-form-asset-provenance.json' with {type:'json'};
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const source=`https://github.com/pagefaultgames/pokerogue-assets/blob/${provenance.sourceCommit}/`;
const rows=[...provenance.assets,...additional.assets,...transformations.assets,...existing.assets,...ordinary.assets].filter(a=>a.path.endsWith('.png')).map(a=>{
 const notice=a.attribution?.map(r=>`${escape(r['SPDX-FileCopyrightText'])} · ${escape(r['SPDX-License-Identifier'])}`).join('; ')||'고정 원본 images/REUSE.toml에 이 PNG와 일치하는 개별 표기 없음. 제작자·라이선스를 추정하지 않습니다.';
 return `<tr><td><img loading="lazy" src="/${escape(a.localPath.slice(7))}" alt="${escape(a.path)}"></td><td><a href="${source+escape(a.path)}">${escape(a.path)}</a><br><small>SHA-256 ${a.sha256}</small><p>${notice}</p></td></tr>`;
}).join('\n');
fs.writeFileSync(new URL('../public/game/pokerogue/credits.html',import.meta.url),`<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>추가 PokéRogue 원본 자산</title><style>body{font:16px/1.6 system-ui;max-width:1100px;margin:auto;padding:20px;color:#173a4e;background:#fff8e5}td{padding:12px;border-bottom:1px solid #aab}img{width:100px;height:100px;object-fit:contain;image-rendering:pixelated}small{word-break:break-all}a{color:#216762}</style><h1>추가 PokéRogue 원본 자산</h1><p>원본 <code>${provenance.sourceCommit}</code>에서 다운로드한 PNG·JSON을 변경 없이 사용합니다. 메가 색상 변형과 융합은 원본 팔레트 자료를 사용해 화면에서 계산합니다. 캐릭터와 이미지의 권리는 각 권리자에게 있습니다.</p><p><a href="${source}images/REUSE.toml">고정 원본 이용 조건</a> · <a href="/licenses/pokerogue-bug-superfan-CC-BY-NC-SA-4.0.txt">표기된 CC BY-NC-SA 4.0 전문</a> · <a href="/game/trainers/pokerogue-credits.html">기존 이미지 출처</a></p><p>개별 표기가 없는 파일을 퍼블릭 도메인으로 간주하지 않으며, 이 목록은 별도의 이용 허락을 부여하지 않습니다. 인접 JSON의 라이선스를 PNG에 적용하지 않습니다.</p><table>${rows}</table></html>\n`);

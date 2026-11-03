# 원본 볼 아틀라스

PokéRogue 1.12.2.3 코드 29441f7aa7482d9e816b253d324293788936dc3e가 가리키는 assets 서브모듈 fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba의 images/pb.png 및 pb.json을 수정 없이 보관합니다. 모든 볼은 같은 로컬 아틀라스의 별도 프레임입니다. 로그볼은 rb이며 Dream Ball 대체 이미지가 아닙니다.

PNG: 12×246px. JSON: 원본 프레임 18개. 게임용 canonical5종의 closed/opening/open 좌표는 data/rogue-ball-appearance.json에 있습니다. 이미지 자르기·프레임 PNG 추출·리사이즈는 수행하지 않았습니다. CSS의 background-position과 원본 크기를 사용하세요.

## 출처·권리 고지

- 원본 자산: https://github.com/pagefaultgames/pokerogue-assets/tree/fb8ccb6d0703ffe48cdf80a8102d5ed943c82dba
- pb.png: Nintendo, Game Freak, and Creatures Inc.; LicenseRef-FAIR-USE. 원본 REUSE 고지는 images-REUSE.toml:7입니다.
- pb.json: 2024-2026 Pagefault Games; AGPL-3.0-only. 원본 REUSE 고지는 images-REUSE.toml:111입니다.
- 원본 LicenseRef-FAIR-USE.txt,AGPL-3.0-only.txt,CC-BY-NC-SA-4.0.txt,upstream-README.md,REUSE 파일을 함께 보관합니다. pb.png를 CC0나자유상업사용으로 표시하지 마세요. 상위 README의 일반 CC 표기보다 해당 PNG의 명시적 예외를 우선 기록합니다. 이 파일은 별도 권리 허가를 주장하지 않습니다.

재생성: node scripts/import-rogue-ball-appearance.mjs
다운로드 없는 재검증: node scripts/import-rogue-ball-appearance.mjs --cached

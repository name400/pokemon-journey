# 통합 작업 상태 (2026-11-04)

- 포켓로그 원본을 복사한 독립 폴더에서 시작했다. 5173 소스와 저장을 변경하지 않았다.
- 이름이 겹치지 않는 탐험 관련 파일 76개를 로컬 탐험 사본 및 보존된 클라우드 소스에서 추가했다. 의존성과 동작은 아직 검증하지 않았다.
- 요청한 5개 스킬의 설치본을 `.agents/skills`에 복사했다. 개별 파일 출처와 라이선스 확인 후 공개 업로드 여부를 검토해야 한다.
- 기존과 내용이 다른 탐험 파일은 자동으로 덮어쓰지 않았다. 아래 파일의 기준과 양쪽 기능, 공통 월드 API 및 공통 전투 코드를 대조해야 한다.

- `app/adventure.tsx` (adventure-preview)
- `app/adventure.css` (adventure-cloud-source)
- `app/adventure.tsx` (adventure-cloud-source)
- `components/adventure-bag.tsx` (adventure-cloud-source)
- `components/adventure-field.tsx` (adventure-cloud-source)
- `components/adventure-journal.tsx` (adventure-cloud-source)
- `components/adventure-management.tsx` (adventure-cloud-source)
- `lib/adventure-story.mjs` (adventure-cloud-source)
- `lib/adventure-world.mjs` (adventure-cloud-source)
- `public/game/town/README.md` (adventure-cloud-source)
- `public/game/town/tiles.json` (adventure-cloud-source)
- `tests/adventure-api.test.mjs` (adventure-cloud-source)
- `tests/adventure-capture.test.mjs` (adventure-cloud-source)
- `tests/adventure-world.test.mjs` (adventure-cloud-source)

- 탐험 경제 WIP 11개는 원격에 포함되지 않았고 별도 로컬 보관 상태다. 독립 폴더에 활성화하지 않았다.
- 통합 커밋, Sites 버전 저장 및 배포는 아직 없다.

## 2026-11-04 실행 준비
- 독립 통합본에 로컬 탐험 사본의 `app/adventure.tsx`, `app/adventure.css`, `app/api/world/route.ts`를 연결하고 포켓로그 측 공통 배틀 컴포넌트와 엔진은 유지했다. 원본 5173 및 사용자 저장은 건드리지 않았다.
- 별도 5299 서버를 실행하고 빈 독립 D1에 마이그레이션을 적용했다. `/api/world`와 `/api/rogue-classic`은 각 HTTP 200이다.
- 타입 검사와 탐험 월드/API 및 포켓로그 엔진/더블배틀 관련 선택 테스트 18개가 통과했다. 실제 브라우저 상호작용, 전체 게임과 저장 이전은 미검증이다.
- 클라우드 `05d551f`의 6커밋은 아직 통합되지 않았다. 그쪽 `district` 기반 탐험 구조와 로컬 `cityVisit`/`interior` 구조가 다르므로 파일을 덮어쓰지 않고 기능 단위로 통합해야 한다. 경제·가챠 WIP 11파일도 미통합이다. Git 커밋·Sites 저장·배포 없음.
- 5299 탐험 화면의 외부 프레임이 원본과 다르게 표시되던 원인은 모험 전용 adventure-theme.css 불러오기가 빠져 있었기 때문이다. 포켓로그 선택자를 건드리지 않는 해당 스타일을 통합 레이아웃에 연결했다. 실제 사용자 화면 재확인은 남았다.
- 클라우드 6커밋 중 구역 4 조사 계산을 기존 여행 수첩에 추가하고, 탐험 포획 성공 시 도감 기록을 저장하도록 연결했다. 이 기록은 이전 포획 이력 자동 복구를 하지 않으며, 구역 4 입장과 조우는 아직 연결되지 않았다.
- 클라우드 우두머리 데이터와 배틀 능력치 적용을 로컬 야생 전투 생성에 연결했다. 기존 isAlpha 야생 개체에만 적용되며 저장된 진행 중 배틀은 변경하지 않는다. 구역 4의 실제 페이검 출현은 아직 연결되지 않았다.

## 6커밋 추가 대조
- 이전 클라우드 탐험 커밋 bb3f7ba를 기준으로 05d551f의 각 코드 파일을 로컬 탐험 사본에 3방향 비교했다. adventure-alpha, adventure-research, adventure-zone4는 데이터상 일치했다. 월드 API, 필드 렌더러, 여행 수첩, 월드 로직 4개는 같은 영역의 충돌로 자동 적용하지 않았다. 비교 결과는 상위 폴더 cloud-six-merge-review.json에 있다.
- 실제 기존 로컬 우두머리 야생 전투에 클라우드 우두머리 생성 및 전투 능력치 로직을 연결했다. 관련 8개 테스트와 우두머리 스라크의 독립 전투 생성 확인을 통과했다. 야생 구역 4와 옥상은 아직 접근·진행을 연결하지 못했다.
- 탐험 전용 새 상점이 5299 게임 메뉴에 연결되지 않은 문제를 수정했다. 탐험 모드에서만 AdventureShop을 사용하고 포켓로그/공통 상점 분기는 유지한다. 두 사본의 기존 상점 API 파일은 바이트 단위로 같아 교체하지 않았다. 신규 경제·가챠 미완성 WIP는 포함하지 않았다.

## 탐험 채팅 직접 확인 및 최신 상점 연결
- 2026-11-04 지정 채팅 01a19cdc-65e0-7ab1-b73b-3eda873a3a07의 최근 기록을 직접 읽었다. 기존 실행 상점과 별도의 경제 WIP 11파일을 구분했으며, 앞서 실행 상점만 연결한 것은 최신 WIP 반영이 아니었다.
- WIP의 캡슐 후보별 가중치/가격, 아이템 이미지, 탐험 전용 가격표와 상점 API를 5299 통합본에 연결했다. 빠진 결과 연출 렌더와 지닌 물건 구매 expectedUnitPrice 전달을 수정하고 연출 CSS를 추가했다. 포켓로그 가격/알 코드는 변경하지 않았다.
- 가격 버전·잘못된 가격 거절, 아이템 구매 차감, 캡슐 개체 지급을 실제 메모리 SQLite 테스트로 확인했다. 상점 테스트 3개와 타입 검사가 통과했고 5299 API가 adventure-2026-11-04-v1 및 591개 상품을 내려주는 것을 확인했다. 사용자 지갑/보유함에 테스트 구매를 수행하지 않았다.
- 기존 탐험 자연 진행 테스트의 고정 구가격 기대값은 새 가격에 맞춘 검토가 필요하다. 새 가격의 전체 진행 밸런스와 실제 뽑기 화면은 미검증이다. 클라우드 지도·스토리 통합과 Sites 저장은 여전히 미완료이며 최신 상점 연결을 전체 통합 완료라고 판단하지 않는다.

- 클라우드 지도·스토리 원본을 lib/cloud-adventure 및 components/cloud-adventure에 연결하고 기존 로컬 처리는 lib/local-adventure-route.ts와 app/adventure-local.tsx로 보존했다. 저장 식별자를 기준으로 서버와 화면을 함께 분기한다. 포켓로그 코드는 바꾸지 않았다. 구역 4·옥상·AZ 동료와 관련 조우는 클라우드 경로에서 원본 커밋의 진행에 따라 사용한다.

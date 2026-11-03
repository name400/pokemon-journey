# Sites 통합 후보 — 2026-11-03

- GitHub 통합 브랜치: `codex/sites-integration-20261103`, 머지 커밋 `b8b7e778c8ec6ec3d7317e6b25f224db9d09683b`.
- 로그라이크 기준 `6009ae4d5109bc4286cee94004881f8a3cac3135`, 탐험 기준 `bb3f7ba0156d3ccbca7090234d4ab449bcedacc8`. 탐험의 이전 기준 `3ca10fc088c3f9512a371f0bca19903153932deb`은 탐험 HEAD의 조상이다. 두 개발 브랜치나 운영 사이트 소스를 덮어쓰지 않았다. 두 브랜치가 공통 기준 `f689e859e9ebab6fbc2fc08f9123e54b9e6c50ee` 이후 변경한 파일은 겹치지 않아 자동 병합됐다.
- 통합본에서 `npm test` 153개, `npm run typecheck`, `npm run build`가 통과했다. SQLite 로컬 테스트는 실제 D1 검증이 아니고, 브라우저·다중 기기와 로그라이크 자연 200층은 미검증이다. 탐험 원작 재현·임무 및 로그라이크 기술·AI·다중 아이템 등 구현이 남았다.
- 확인된 운영 사이트는 `appgprj_6ae805126fcc81919e2957e973c8955a`, v4 소스 `7b9de08d0903f054be19d8ae7592a529571e85bb`, 배포 성공 URL `https://pokemon-roguelike-adventure.jminwoo0823.chatgpt.site`이다. v4 보관본은 코드 롤백 후보이지만 DB 변경은 자동 역행하지 않는다. 탐험의 피카츄 교환은 `pokemon_box` 공용 행을 보존하고 `worlds.state.zaTradedPikachuId`로 탐험 목록에서 제외한다. 이전 v4는 이 제외 표식을 해석하지 못하므로 롤백 시 탐험에서 교환된 피카츄가 다시 보일 수 있다. 롤백 시 이 영향과 이전 코드의 저장 호환성을 먼저 평가한다.
- 운영 DB 읽기 전용 확인 시 `admin_player_backups`, `classic_leaderboard`, `admin_grant_requests`는 없었다. 통합본의 0010~0012는 신규 테이블·인덱스 추가다. 격리 SQLite에 0000~0009와 기존 데이터 fixture를 만든 뒤 0010~0012 적용 시 기존 데이터가 보존되는 검사는 통과했지만, 실제 D1 마이그레이션 이력과 실패 후 복구는 미검증이다. Sites는 Worker 배포 전 미적용 마이그레이션을 수행하며 실패 시에도 DB 변경이 남을 수 있다. 사용자 데이터 초기화·삭제 금지.
- 사용자는 현재 통합본을 한 차례 배포한 후 계속 개발하도록 승인했다. 이 실행 환경에는 Sites SKILL.md가 요구하는 `<plugin-root>/scripts/site-workflow.mjs`와 `build-site.mjs`가 존재하지 않는다. `find /`와 skill 리소스 접근을 통해 확인했고, 공개 Sites 소스 저장소용 자격 발급은 성공했지만 토큰은 저장·출력하지 않았다. source helper 없이 운영 소스 Git HEAD 확인/업로드와 배포 아카이브 생성은 진행하지 않았다. 현재 운영 배포나 버전 저장 시도는 없다. Sites helper가 있는 환경에서 최신 운영 및 소스 HEAD와 기존 배포 여부를 다시 확인하고 동일 Site의 소스 helper로 통합 커밋을 반영·패키징한 후 기존 공개 범위와 D1을 보존하여 한 번 배포해야 한다.

## 최신 지시: 저장만
- 사용자는 직접 배포할 예정이므로 지금 운영 배포하지 않는다. GitHub 통합 브랜치에 소스를 보존하며 이후 로그라이크·탐험 변경은 별도 개발 브랜치에서 계속한다. 위의 이전 배포 승인 문장은 이 지시로 대체된다.
- Sites의 저장 버전 목록을 다시 확인한 결과 최신은 운영 v4다. 이 후보는 Sites 저장 버전으로 생성되지 않았다. Sites source helper가 없는 상태에서 운영 소스 저장소를 변경하거나 저장·배포 API를 호출하지 않았다. 사용자가 Sites에서 직접 저장하려면 동일 Site의 소스 helper가 있는 환경에서 통합 소스와 최신 Sites 소스 HEAD를 비교·통합하고, 검증된 패키지와 일치하는 커밋을 저장해야 한다.
- GitHub 커밋을 그대로 `git archive`한 소스 tarball은 오프라인 전달용이며 Sites 배포 아카이브 또는 기존 DB 백업이 아니다. 설치 의존성·빌드 산출물·운영 데이터는 포함하지 않는다. 위 0010~0012 마이그레이션 및 피카츄 교환 롤백 주의는 그대로 적용된다.

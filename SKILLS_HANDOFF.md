# 작업 스킬 인계

최신 코드 기준·브랜치·태그·레벨 규칙은 docs/CLOUD_HANDOFF_20261105.md를 우선한다. 아래 이전 PC 인계 브랜치와 배포 금지 메모는 당시 이력이며, 현재는 사용자가 검증 후 Git·Sites 저장과 운영 배포를 허용했다.

이 프로젝트에서 UI·게임 작업 시 다음 스킬을 활용한다. 사용 가능 여부는 각 Codex 환경에서 확인한다. 기존 환경의 설치 여부가 다른 환경에도 자동으로 이전되는 것은 아니다.

- `game-ui-frontend`: 게임 화면·HUD·메뉴와 반응형 배치
- `ui-ux-pro-max`: 가독성·접근성·PC/모바일 인터페이스
- `game-ui-ux`: 게임 UI 탐색, 화면 크기 대응, 입력 및 메뉴 흐름
- `motion`: 웹 인터랙션 및 애니메이션
- `web-design-guidelines`: 웹 UI 접근성 및 설계 검토
- `frontend-design`: 화면의 시각적 구성과 일관성
- `game-engine`: 웹 게임 루프·전투 렌더링 등 게임 구현
- `vercel-react-best-practices`: React 렌더링과 성능

사용자가 제공한 설치 명령:

```sh
npx skills add openai/plugins --skill game-ui-frontend -a codex
npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max -a codex
npx skills add gamedev-skills/awesome-gamedev-agent-skills --skill game-ui-ux -a codex
npx skills add oakoss/agent-skills --skill motion -a codex
npx skills add vercel-labs/agent-skills --skill web-design-guidelines -a codex
```

설치 후 새 세션에서 스킬 목록과 각 SKILL.md를 확인한다. 스킬 라이선스와 원본 저장소의 이용 조건을 따른다.

요청한 추가 스킬 5종의 파일은 portable-skills/에 보관한다. 별도 개발 환경에서는 각 SKILL.md와 원본 고지문을 확인하고 해당 환경의 스킬 경로에 설치한다. 앱·계정 도구 연결은 이 파일만으로 이전되지 않는다.

## 2026-11-04 PC 개발 인계

- 고정 인계 브랜치 예정: `codex/classic-test-challenge-start-20261104`. 실제 원격 HEAD와 커밋은 가져온 후 확인한다. 기존 테스트 브랜치 `codex/classic-test-de6468c`, `codex/classic-test-revival-20261104`는 각각 별도 고정 테스트이므로 덮어쓰지 않는다.
- `CLASSIC_V3_PROGRESS.md`의 최근 챌린지·부활·승인된 UI·라이선스 기록을 먼저 읽고 실제 코드와 대조한다. 사용자 승인 전 UI 재설계나 운영 배포를 하지 않는다. Sites 저장은 별도 조율 중이며 운영 DB와 기존 계정을 초기화하지 않는다.
- 챌린지 시작은 내부 검증 기반만 있고 공개 API/UI에서는 비활성이다. 세대·타입 외 챌린지, 원본 고정 배틀·보상, 융합·특수 폼, 자연 200층 및 실제 기기 검증이 남았다. 이 항목을 완성으로 보고하지 않는다.
- 포켓로그 원본 한국어 자료의 AGPL 고지와 프로젝트 전체 라이선스 호환성·포켓몬 자산 권리의 미확정 상태를 보존한다. 사용자에게 공개 전 불확실성을 이미 보고했고 이 인계용 Git 푸시는 별도 승인돼 있다.

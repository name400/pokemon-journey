# 작업 스킬 인계

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

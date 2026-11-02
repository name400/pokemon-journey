# 클라우드 작업용 스킬

Codex 환경에서 저장소 루트의 `.agents/skills/`를 확인하고 작업에 맞는 스킬을 사용한다. 새로운 실행 환경에서 스킬을 실제로 인식하는지는 작업 시작 시 확인한다. ChatGPT Work 자체의 스킬 선택에는 플러그인 설치 등 별도의 환경 설정이 필요할 수 있다.

- `ui-ux-pro-max`: UI/UX 디자인·접근성·반응형 검토. [원본](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), MIT. 스크립트 사용에는 Python 3이 필요할 수 있다. 라이선스는 해당 스킬 폴더에 포함했다.
- `game-ui-ux`: 게임 HUD, 메뉴, 포커스와 반응형 게임 인터페이스. [원본](https://github.com/gamedev-skills/awesome-gamedev-agent-skills), Apache-2.0. 라이선스와 NOTICE를 해당 폴더에 포함했다. 설치된 로컬 사본을 전달한 것이며 최신 원본과 동일하다고 보장하지 않는다.

이 스킬은 해당 컴퓨터에 설치된 사본으로부터 복사했다. 원본과 다른 로컬 수정이 있을 수 있으며 버전이 고정되어 있다고 가정하지 않는다. 게임 실행에 반드시 필요한 종속성은 아니다.

추가로 요청했던 아래 스킬은 설치된 사본의 재배포에 필요한 라이선스 고지를 확인하지 못해 이 저장소에 복사하지 않았다. 해당 환경에서 원본의 조건과 설치 방법을 확인한 뒤 사용할 수 있다.

- [game-ui-frontend](https://github.com/openai/plugins)
- [motion](https://github.com/oakoss/agent-skills)
- [web-design-guidelines](https://github.com/vercel-labs/agent-skills)

스킬 사용 가능 여부와 도구·네트워크·실행 환경 제한은 작업 시 확인한다. 스킬은 참고 지침이며 실제 구현과 검증을 대신하지 않는다.

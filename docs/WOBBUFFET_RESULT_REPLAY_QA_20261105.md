# 마자용 3턴 뒤 진행 불가

운영 오류 번호 `67c805c2-38db-4954-a7ed-51c85c970497`는 00:02:46 KST POST `/api/rogue-classic` 409, `ACTION_FAILED`, `stage=action`, `action=turn`, `commandType=move`, `saveOutcome=not_attempted`와 일치한다. 보고된 revision/storedRevision은 모두 758이므로 해당 요청은 버전 충돌이 아니다. 서버의 `run.screen !== 'battle'` 검사 메시지다. 이 실패 요청은 저장을 시도하지 않았다. 운영 계정·저장을 읽거나 변경하지 않았다.

격리 저장으로 재현한 원인 경로는 3턴 후 적/아군이 살아 있으면 서버가 보상 상태로 진행해도 반환된 마지막 전투 화면이 `ended=false`이고 별도 결과 표시가 없어 공격 버튼이 계속 나타나는 것이다. 이 상태에서 네 번째 턴을 요청하면 같은 문구로 거부된다. 화면 상황과 일치하는 확인된 결함이지만 운영 당시 요청 본문·전체 상태를 직접 확인하지 않았으므로 개별 사건의 모든 선행 원인을 확정하지 않는다.

전투 엔진의 승패를 꾸미지 않고 3턴 만료 결과에만 `actionResult=minigame`을 표시해 마지막 연출 후 결과·보상 선택을 제공한다. 실제 기절/승패로 끝난 전투는 기존 처리를 유지한다. 이미 화면에 남은 과거 스냅샷은 일시적 프런트 상태이므로 새 코드 배포 후 새로고침하면 저장된 보상 단계에서 다시 진입할 수 있다. 저장 데이터나 보상을 변경하지 않는다.

일반·Worker 각 8/8: 3턴 완료, 격리 네 번째 행동 거부·저장 미반영 모델, 재접속, 기존 보상·경계. 실제 페이지/API 격리 Chromium 375×667·1280×850은 3회 기술 입력 후 보상 선택 표시, 네 번째 입력 버튼 부재, 보상 화면·재접속을 확인했다. 기존 요청 순서 브라우저 5경로와 타입·production 빌드도 통과. lint 오류 0, 기존 game 경고 3 유지. 실계정·물리 기기·운영 배포 후 확인은 남는다. 로그 `/tmp/wobbuffet-fix.log`, `/tmp/wobbuffet-worker.log`, `/tmp/wobbuffet-browser-mobile.log`, `/tmp/wobbuffet-browser.log`, `/tmp/wobbuffet-type.log`, `/tmp/wobbuffet-build.log`.

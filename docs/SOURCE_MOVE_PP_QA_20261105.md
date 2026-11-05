# 원본 기술 17개의 PP

고정 원본 `7c0881255af5cd51992e513ff93c2f71adbe40e0`의 `src/data/moves/move.ts`와 simulator의 기본 PP를 비교해 차이가 확인된 일반 기술 17개를 연결했다. G-Max와 보스 전용 기술은 이번 범위에서 제외했다.

신규 `sourceMovePpRule: source-v1`의 기본 PP는 `nightslash` 20, `beakblast` 5, `shelltrap`·`spinout` 10, `protect`·`sandstorm`·`hail`·`wish`·`healorder`·`kingsshield`·`spikyshield`·`banefulbunker`·`strengthsap`·`purify`·`obstruct` 각 5, `takeheart` 10, `snowscape` 5다. 구현의 정확한 기술 ID는 `SOURCE_CLASSIC_MOVE_PP`를 따른다.

앞서 연결한 PP 경로를 재사용해 전투·화면·회복·포인트업·자동 학습·교체·기억버섯 및 이상한 꿈의 새 기술 생성에 적용한다. 진행 중인 기존 도전은 이전 PP 규칙을 유지하고, 저장된 현재 PP와 명시적인 최대 PP override는 삭제하지 않는다. 전역 Dex는 변경하지 않는다.

17개 데이터 값과 일반 기술 경계를 검사하고, 방어·깜짝베기의 실제 전투·저장 복구, PP업·회복·학습과 다른 슬롯 보존을 확인했다. 이상한 꿈을 비롯한 모든 기술 획득 경로의 각 기술별 개별 실플레이와 G-Max·보스 전용 PP는 남아 있다.

관련 기술·학습·이벤트·융합·챌린지 회귀는 일반 환경과 Worker 로더 각각 314/314 통과했다. 타입 검사와 프로덕션 빌드도 통과했다. 전체 테스트 스위트와 실계정 플레이는 이번에 실행하지 않았다.
